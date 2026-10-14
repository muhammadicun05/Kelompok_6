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
from rag_agent import AgenticWorkflowEngine

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(
    title="Lukla Operations Engine — Pure Manual RAG & Agentic Service",
    description="Microservice AI RAG menggunakan Amazon Titan (us-east-1), Amazon Nova Lite (ap-southeast-1), dan Supabase pgvector.",
    version="2.1.0"
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
agent_engine = AgenticWorkflowEngine()


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


class AgentAskResponse(BaseModel):
    answer: str
    citations: List[CitationItem]
    agent_trace: Optional[Dict[str, Any]] = None


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
        # baca repositori aturan resmi Lukla (10 Asumsi, SOP Gudang, Penggajian) agar frontend tidak crash saat demo lokal
        knowledge_res = agent_engine.tools.answer_knowledge_question(req.question, req.role)
        citations_list = [
            CitationItem(source=c.get("source", "Lukla Knowledge Base"), text=c.get("text", ""), similarity=c.get("similarity"))
            for c in knowledge_res.get("citations", [])
        ]
        return AskResponse(
            answer=knowledge_res.get("answer", ""),
            citations=citations_list
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses pertanyaan RAG: {str(e)}")


@app.post("/ask-agent", response_model=AgentAskResponse)
def ask_agent(req: AskRequest):
    """
    Endpoint Agentic RAG Workflow:
    - Melakukan dekomposisi query menjadi langkah-langkah kerja (QueryDecomposer)
    - Menjalankan loop perulangan iterasi untuk memproses output LLM
    - Menjalankan 3 tools:
        1. lookup_database: SELECT whitelisted tables (orders, products, production_lines)
        2. process_llm_query_result: LLM data analyzer & summarizer
        3. answer_knowledge_question: SOP, BRD, dan 10 Aturan Bisnis Resmi Lukla
    - Format response identik dengan /ask (answer + citations + agent_trace).
    """
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    try:
        result = agent_engine.run(
            question=req.question,
            role=req.role,
            client_id=req.client_id
        )
        return AgentAskResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses pertanyaan Agent: {str(e)}")


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
