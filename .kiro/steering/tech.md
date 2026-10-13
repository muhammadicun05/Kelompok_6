---
inclusion: always
---

# Technical Stack & AWS Bedrock RAG Guidelines

## 1. Main Web & Mobile Platform Stack
- **Frontend & Full-Stack Web**: Next.js (App Router, TypeScript) + Tailwind CSS + Lucide Icons.
- **Multi-Device UX**: Responsif penuh untuk **PC/Desktop** (`1440x900`) dan **Mobile/Tablet Touch Terminal** (`390x844` & `768x1024`).
- **Database & Realtime**: Supabase PostgreSQL (dengan Row-Level Security / RLS untuk isolasi multi-tenant dan validasi `client_id` + `order_id`).

## 2. Python AI RAG Microservice (`lukla-rag-service/`)
- **Runtime**: Wajib menggunakan **Python 3.12** (`py -3.12 -m venv venv`). Jangan gunakan Python 3.14 karena `pydantic-core` belum memiliki pre-built binary wheel di 3.14.
- **Dependencies**: `fastapi`, `uvicorn`, `boto3`, `python-dotenv`, `pydantic`.
- **AWS & Bedrock Configuration (`.env`)**:
  - **Aturan Keamanan**: Jangan pernah membaca atau menampilkan isi file `.env` secara langsung. Gunakan `.env.example` untuk template.
  - Variabel `.env` yang digunakan:
    - `AWS_ACCESS_KEY`
    - `AWS_SECRET_ACCESS`
    - `AWS_BUCKET` (S3 Bucket berisi dokumen `.md` Knowledge Base Lukla)
    - `AWS_REGION=ap-southeast-1`
    - `BEDROCK_ROLE_ARN=arn:aws:iam::820242904049:role/BedrockClassKBRole`
    - `KNOWLEDGE_BASE_ID`
- **IAM Restriction Guard**: Akun AWS Lab (`student_6`) tidak memiliki izin `iam:CreateRole`. Oleh karena itu, `setup_kb.py` **tidak boleh** memanggil `iam.create_role()`, melainkan langsung menggunakan `BEDROCK_ROLE_ARN` dari `.env`.
- **Models**:
  - Generator: `Amazon Nova Micro` (`amazon.nova-micro-v1:0`) — model paling hemat biaya di AWS Bedrock.
  - Embeddings: `Amazon Titan Text Embeddings V2` (`amazon.titan-embed-text-v2:0`).
- **API Endpoints (`main.py`)**:
  - `POST /ask`: Menerima `{"question": "string"}` dan mengembalikan `{"answer": "string", "citations": [{"text": "...", "source": "..."}]}` menggunakan `bedrock-agent-runtime` (`retrieve_and_generate`) dengan *fallback* otomatis ke pembacaan dokumen `.md` jika KB sedang proses *sync*.
  - `GET /health`: Health check endpoint.

## 3. Vibe Code Quality Standards
- **Playwright CLI**: Gunakan untuk pengujian browser otomatis pada seluruh tombol, form, dan 4 skenario UAT BRD.
- **Supabase Plugin / MCP**: Gunakan untuk pengelolaan skema database dan isolasi multi-tenant.
- **Strix / Security Testing**: Pastikan perlindungan terhadap IDOR lintas-klien, bypass Anti-Kontaminasi (`FR-6.2`), dan eskalasi RBAC.
- **Skill UI for Front-End**: Ikuti panduan desain visual pada `DESIGN_SYSTEM.md`.
- **Context7**: Gunakan sintaks dan dokumentasi library versi terbaru.
