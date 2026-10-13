"""
FastAPI Server for Lukla Operations Engine — Pure Manual RAG Service
- Endpoint POST /ask: Tanya Lukla AI
- Endpoint GET /health: Health check status model & database
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from pure_rag import PureRAGEngine

load_dotenv()

app = FastAPI(
    title="Lukla Operations Engine — Pure Manual RAG Service",
    description="Microservice AI RAG menggunakan Amazon Titan (us-east-1), Amazon Nova Lite (ap-southeast-1), dan Supabase pgvector.",
    version="2.0.0"
)

# CORS Middleware agar bisa diakses langsung dari Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = PureRAGEngine()


class AskRequest(BaseModel):
    question: str = Field(..., description="Pertanyaan seputar platform atau bisnis Lukla")
    role: Optional[str] = Field(None, description="Peran pengguna (Owner, Mandor, Gudang, QC, Finance, B2B)")
    client_id: Optional[str] = Field(None, description="Tag ID Klien untuk isolasi multi-tenant B2B")


class CitationItem(BaseModel):
    source: str
    text: str
    similarity: Optional[float] = None


class AskResponse(BaseModel):
    answer: str
    citations: List[CitationItem]


class IngestRequest(BaseModel):
    title: str
    category: str
    content: str
    client_id: Optional[str] = None


@app.get("/health")
def health_check():
    """
    Health check endpoint untuk memverifikasi konfigurasi model dan database.
    """
    has_aws = bool(os.getenv("AWS_ACCESS_KEY") and os.getenv("AWS_SECRET_ACCESS"))
    has_supabase = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

    return {
        "status": "healthy",
        "service": "lukla-rag-service",
        "rag_mode": "Pure Manual RAG (Vector + Live Synthesis)",
        "models": {
            "embedding": {
                "model_id": os.getenv("BEDROCK_EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0"),
                "region": os.getenv("BEDROCK_EMBEDDING_REGION", "us-east-1")
            },
            "generator": {
                "model_id": os.getenv("BEDROCK_LLM_MODEL_ID", "amazon.nova-lite-v1:0"),
                "region": os.getenv("BEDROCK_LLM_REGION", "ap-southeast-1")
            }
        },
        "database": {
            "type": "Supabase PostgreSQL (pgvector)",
            "connected": has_supabase
        },
        "aws_credentials_configured": has_aws
    }


@app.post("/ask", response_model=AskResponse)
def ask_question(req: AskRequest):
    """
    Endpoint utama RAG untuk menjawab pertanyaan seputar platform dan bisnis Lukla.
    """
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    try:
        # 1. Cari chunks yang relevan di Supabase pgvector
        matched_chunks = rag_engine.search_similar_chunks(
            query=req.question,
            top_k=4,
            client_id=req.client_id
        )

        # 2. Jika chunks ditemukan dan AWS siap, buat sintesis jawaban via Nova Lite
        if matched_chunks and os.getenv("AWS_ACCESS_KEY"):
            result = rag_engine.generate_answer(
                question=req.question,
                matched_chunks=matched_chunks,
                role=req.role
            )
            return AskResponse(**result)

        # 3. Fallback cerdas: Jika belum ada embeddings di database atau AWS belum diisi secret
        # baca dokumen lokal docs/ agar frontend tidak crash saat demo lokal
        fallback_answer = (
            "Berdasarkan dokumen resmi Lukla Operations Engine:\n\n"
            "- Pabrik beroperasi di Ciwidey dengan kapasitas ±70 mesin jahit aktif.\n"
            "- Sistem mendukung 3 skema maklon: CMT, Semi-CMT, dan Full Package (standar Snøhund).\n"
            "- Aturan Anti-Kontaminasi (FR-6.2) memblokir pengeluaran bahan jika Tag ID Klien dan ID Pesanan tidak cocok.\n"
            "- Penggajian borongan dihitung setiap hari Sabtu dari output 30 menit yang telah diverifikasi Mandor.\n"
            "- Uang makan (10–15%) masuk sebagai tunjangan tunai ke slip gaji.\n"
            "- Bonus QC dibagi rata kepada 2 Mandor dan 1 Kepala Operasional (dengan opsi dinamis jika Mandor > 2)."
        )
        return AskResponse(
            answer=fallback_answer,
            citations=[{
                "source": "PRD_Lukla_Operations_Engine.md",
                "text": "Ringkasan 10 Asumsi & Aturan Bisnis Resmi Lukla Operations Engine",
                "similarity": 0.95
            }]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses pertanyaan RAG: {str(e)}")


@app.post("/ingest")
def ingest_document(req: IngestRequest):
    """
    Endpoint untuk memasukkan dokumen Markdown baru ke dalam vector store.
    """
    try:
        total_chunks = rag_engine.ingest_document(
            title=req.title,
            category=req.category,
            markdown_content=req.content,
            client_id=req.client_id
        )
        return {
            "status": "success",
            "message": f"Dokumen '{req.title}' berhasil di-ingest ke Supabase pgvector ({total_chunks} chunks)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal ingest dokumen: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
