# Lukla RAG Service (Pure Manual RAG)

Microservice AI RAG untuk **Lukla Operations Engine** menggunakan **Amazon Bedrock (Cross-Region)** dan **Supabase pgvector**.

## 🌟 Mengapa Pure Manual RAG?
- **Higher Control**: Chunking semantik presisi per heading markdown, kontrol penuh atas prompt dan konteks.
- **Easier to Debug**: Tidak bergantung pada black-box OpenSearch Serverless Bedrock yang mahal (~$700/bulan) atau lambat saat sync.
- **Cross-Region Strategy**:
  - **Embedding Model**: `amazon.titan-embed-text-v2:0` di Region **`us-east-1`** (North Virginia)
  - **LLM Generator**: `amazon.nova-lite-v1:0` di Region **`ap-southeast-1`** (Singapore)
  - **Vector Store**: **Supabase PostgreSQL (`pgvector`)** di project `Kelompok_6`

---

## 🔐 IAM Policy JSON untuk `student_6`
File konfigurasi policy IAM untuk mengaktifkan akses cross-region `student_6` ke `us-east-1` dan `ap-southeast-1` tersedia di:
📁 [`policies/bedrock_student6_cross_region_policy.json`](./policies/bedrock_student6_cross_region_policy.json)

---

## 🚀 Cara Menjalankan Service

### 1. Buat Virtual Environment (Wajib Python 3.12)
```powershell
cd lukla-rag-service
py -3.12 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Konfigurasi `.env`
Salin `.env.example` menjadi `.env` lalu isi kredensial Anda:
```env
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_ACCESS=your_aws_secret_key
BEDROCK_EMBEDDING_REGION=us-east-1
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0
BEDROCK_LLM_REGION=ap-southeast-1
BEDROCK_LLM_MODEL_ID=amazon.nova-lite-v1:0
SUPABASE_URL=https://wrugjojtvgkuwjqopete.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Ingest Dokumen Pengetahuan ke Supabase
Jalankan script untuk meng-ingest seluruh file Markdown Lukla (`BRD_V3.md`, `PRD`, `DESIGN_SYSTEM.md`, dll):
```powershell
python sync_knowledge_base.py
```

### 4. Jalankan FastAPI Server
```powershell
uvicorn main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
- Endpoint Tanya AI: `POST http://localhost:8000/ask`
