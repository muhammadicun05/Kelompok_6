"""
Pure Manual RAG Engine for Lukla Operations Engine
- Embedding Model: amazon.titan-embed-text-v2:0 (us-east-1)
- LLM Generator: amazon.nova-lite-v1:0 (ap-southeast-1)
- Vector Store: Supabase PostgreSQL (pgvector)
- Tone & Voice: Sesuai DESIGN_SYSTEM.md Bagian 8.6 & 10 (Bahasa Indonesia, sentence case, kutipan dokumen rujukan)
"""

import os
import json
import re
from typing import List, Dict, Any, Optional
import boto3
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS = os.getenv("AWS_SECRET_ACCESS")

EMBED_REGION = os.getenv("BEDROCK_EMBEDDING_REGION", "us-east-1")
EMBED_MODEL_ID = os.getenv("BEDROCK_EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")

LLM_REGION = os.getenv("BEDROCK_LLM_REGION", "ap-southeast-1")
LLM_MODEL_ID = os.getenv("BEDROCK_LLM_MODEL_ID", "amazon.nova-lite-v1:0")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL") or "https://wrugjojtvgkuwjqopete.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""


class PureRAGEngine:
    def __init__(self):
        # 1. Bedrock Runtime Client in us-east-1 for Titan Embeddings
        embed_kwargs = {"region_name": EMBED_REGION}
        if AWS_ACCESS_KEY and AWS_SECRET_ACCESS:
            embed_kwargs["aws_access_key_id"] = AWS_ACCESS_KEY
            embed_kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS
        self.bedrock_embed = boto3.client("bedrock-runtime", **embed_kwargs)

        # 2. Bedrock Runtime Client in ap-southeast-1 for Nova Lite LLM
        llm_kwargs = {"region_name": LLM_REGION}
        if AWS_ACCESS_KEY and AWS_SECRET_ACCESS:
            llm_kwargs["aws_access_key_id"] = AWS_ACCESS_KEY
            llm_kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS
        self.bedrock_llm = boto3.client("bedrock-runtime", **llm_kwargs)

        # 3. Supabase Client for Vector Search
        self.supabase: Optional[Client] = None
        if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
            self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def get_embedding(self, text: str) -> List[float]:
        """
        Menghasilkan 1024-dimensi vector embedding menggunakan Amazon Titan Text Embeddings V2 di us-east-1.
        """
        payload = {
            "inputText": text.strip()[:8000],
            "dimensions": 1024,
            "normalize": True
        }
        response = self.bedrock_embed.invoke_model(
            modelId=EMBED_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(payload)
        )
        response_body = json.loads(response["body"].read().decode("utf-8"))
        return response_body["embedding"]

    def chunk_markdown(self, markdown_text: str, max_chars: int = 1500) -> List[Dict[str, Any]]:
        """
        Memotong teks Markdown menjadi chunks semantik berdasarkan heading (#, ##, ###).
        """
        sections = re.split(r'\n(?=#{1,3}\s)', markdown_text)
        chunks = []
        index = 0

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Ambil judul seksi jika ada
            first_line = section.split("\n")[0]
            section_title = first_line.replace("#", "").strip() if first_line.startswith("#") else f"Bagian {index + 1}"

            # Jika seksi terlalu panjang, bagi per paragraf
            if len(section) > max_chars:
                paragraphs = section.split("\n\n")
                current_chunk = ""
                for p in paragraphs:
                    if len(current_chunk) + len(p) < max_chars:
                        current_chunk += p + "\n\n"
                    else:
                        if current_chunk.strip():
                            chunks.append({
                                "index": index,
                                "title": section_title,
                                "content": current_chunk.strip()
                            })
                            index += 1
                        current_chunk = p + "\n\n"
                if current_chunk.strip():
                    chunks.append({
                        "index": index,
                        "title": section_title,
                        "content": current_chunk.strip()
                    })
                    index += 1
            else:
                chunks.append({
                    "index": index,
                    "title": section_title,
                    "content": section
                })
                index += 1

        return chunks

    def ingest_document(self, title: str, category: str, markdown_content: str, client_id: Optional[str] = None) -> int:
        """
        Melakukan embedding dan menyimpan chunks dokumen ke Supabase pgvector.
        """
        if not self.supabase:
            raise ValueError("Koneksi Supabase belum terkonfigurasi.")

        # 1. Simpan dokumen master
        doc_res = self.supabase.table("knowledge_documents").insert({
            "title": title,
            "category": category,
            "client_id": client_id
        }).execute()
        document_id = doc_res.data[0]["id"]

        # 2. Chunk markdown
        chunks = self.chunk_markdown(markdown_content)
        records_to_insert = []

        for chunk in chunks:
            embedding = self.get_embedding(chunk["content"])
            records_to_insert.append({
                "document_id": document_id,
                "client_id": client_id,
                "title": f"{title} — {chunk['title']}",
                "chunk_index": chunk["index"],
                "content": chunk["content"],
                "embedding": embedding,
                "metadata": {
                    "source_doc": title,
                    "section": chunk["title"],
                    "category": category
                }
            })

        # Batch insert
        self.supabase.table("knowledge_chunks_vector").insert(records_to_insert).execute()
        return len(records_to_insert)

    def search_similar_chunks(self, query: str, top_k: int = 4, client_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Pencarian similarity menggunakan cosine distance di Supabase pgvector.
        """
        if not self.supabase:
            return []

        query_vector = self.get_embedding(query)

        # Panggil RPC match_knowledge_chunks di Supabase
        rpc_params = {
            "query_embedding": query_vector,
            "match_threshold": 0.25,
            "match_count": top_k,
            "p_client_id": client_id
        }
        res = self.supabase.rpc("match_knowledge_chunks", rpc_params).execute()
        return res.data or []

    def generate_answer(self, question: str, matched_chunks: List[Dict[str, Any]], role: Optional[str] = None) -> Dict[str, Any]:
        """
        Membuat sintesis jawaban menggunakan Amazon Nova Lite di ap-southeast-1.
        Sesuai DESIGN_SYSTEM.md Bagian 8.6 & 10: Bahasa Indonesia jelas, format kutipan rapi, tanpa jargon.
        """
        context_text = "\n\n---\n\n".join([
            f"[Sumber: {chunk.get('metadata', {}).get('source_doc', chunk.get('title'))}]\n{chunk.get('content')}"
            for chunk in matched_chunks
        ])

        system_prompt = (
            "Anda adalah Asisten Pengetahuan Resmi Lukla Operations Engine ('Tanya Lukla AI').\n"
            "Tugas Anda adalah menjawab pertanyaan pengguna secara akurat, profesional, dan ringkas "
            "berdasarkan konteks dokumen resmi pabrik garmen Lukla yang diberikan.\n\n"
            "PANDUAN GAYA BAHASA & STRUKTUR (Sesuai DESIGN_SYSTEM.md):\n"
            "1. Gunakan Bahasa Indonesia lugas, sopan, dan sentence case.\n"
            "2. Gunakan istilah resmi pabrik garmen Lukla: 'Lolos', 'Perbaikan', 'Cacat', 'Menunggu QC', 'Uang Makan (10–15%)', 'Bonus QC 3-Arah', 'CMT', 'Semi-CMT', 'Full Package'.\n"
            "3. Jika ada angka rupiah atau kuantitas, sajikan dengan format rapi (contoh: Rp 900.000, 3.000 pcs, ±70 mesin).\n"
            "4. Jangan berhalusinasi atau mengarang aturan di luar konteks yang diberikan.\n"
            "5. Jawab langsung ke inti pertanyaan tanpa basa-basi berlebih."
        )

        user_message = (
            f"KONTEKS DOKUMEN:\n{context_text}\n\n"
            f"ROLE PENGGUNA: {role or 'Umum'}\n"
            f"PERTANYAAN: {question}\n\n"
            "Berikan jawaban terstruktur berdasarkan konteks di atas."
        )

        # Call Bedrock Converse API with Amazon Nova Lite in ap-southeast-1
        response = self.bedrock_llm.converse(
            modelId=LLM_MODEL_ID,
            messages=[{
                "role": "user",
                "content": [{"text": user_message}]
            }],
            system=[{"text": system_prompt}],
            inferenceConfig={
                "maxTokens": 1024,
                "temperature": 0.2,
                "topP": 0.9
            }
        )

        answer_text = response["output"]["message"]["content"][0]["text"]

        # Format citations
        citations = []
        for chunk in matched_chunks:
            source_doc = chunk.get("metadata", {}).get("source_doc") or chunk.get("title")
            citations.append({
                "source": source_doc,
                "text": chunk.get("content", "")[:250] + "...",
                "similarity": round(chunk.get("similarity", 0.0), 3)
            })

        return {
            "answer": answer_text,
            "citations": citations
        }
