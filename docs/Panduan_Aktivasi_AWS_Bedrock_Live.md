# Panduan Aktivasi & Pengujian AWS Bedrock Live
## Lukla Operations Engine — Pure Manual RAG

Dokumen ini memandu langkah-langkah mengaktifkan koneksi live ke **AWS Bedrock** menggunakan kredensial asli (`student_6` atau akun AWS Anda), mengindeks master dokumen pengetahuan terbaru ke Supabase `pgvector`, dan menguji asisten **Tanya Lukla AI**.

---

## 1. Arsitektur Cross-Region AWS Bedrock

Sistem mengimplementasikan pendekatan **Pure Manual RAG** lintas region:
1. **Embedding**: `amazon.titan-embed-text-v2:0` di Region **`us-east-1`** (North Virginia)
   - Menghasilkan vektor 1024-dimensi ter-normalisasi dari teks dokumen markdown.
2. **LLM Generator**: `amazon.nova-lite-v1:0` di Region **`ap-southeast-1`** (Singapura)
   - Model penalaran cepat dan cerdas untuk mensintesis jawaban berbasis konteks dokumen resmi garmen.
3. **Vector Database**: Supabase PostgreSQL dengan ekstensi `pgvector` pada tabel `knowledge_chunks_vector` dan RPC `match_knowledge_chunks`.

---

## 2. Langkah Konfigurasi Kredensial AWS

### Langkah 1: Siapkan File `.env.local` di Root Direktori
Buka atau buat file `.env.local` di root direktori proyek `c:\Workspace\06_Courses_and_Training\Alkademi_Phase3_Offline\Lukla\.env.local` (atau di folder `lukla-rag-service/.env`), lalu masukkan kunci AWS Anda:

```env
# AWS Bedrock Credentials (Cross-Region Access)
AWS_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Konfigurasi Region Model Bedrock
BEDROCK_EMBEDDING_REGION=us-east-1
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0

BEDROCK_LLM_REGION=ap-southeast-1
BEDROCK_LLM_MODEL_ID=amazon.nova-lite-v1:0

# Supabase Vector Store
NEXT_PUBLIC_SUPABASE_URL=https://wrugjojtvgkuwjqopete.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Telegram Bot (Opsional)
TELEGRAM_BOT_TOKEN=7123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_DEFAULT_CHAT_ID=123456789
```

> **Catatan Keamanan**: Pastikan file `.env` dan `.env.local` terdaftar di `.gitignore` agar kredensial asli tidak pernah terunggah ke repositori publik.

---

## 3. Menjalankan Sinkronisasi Dokumen Pengetahuan ke Database Vektor

Setelah kredensial dimasukkan, jalankan skrip sinkronisasi otomatis untuk memotong (*chunking*), membuat embedding Titan, dan menyimpannya ke tabel `knowledge_chunks_vector`:

```powershell
# Masuk ke direktori lukla-rag-service
cd lukla-rag-service

# Jalankan skrip sinkronisasi dokumen
py -3.12 sync_knowledge_base.py
```

Skrip ini akan secara otomatis memproses dokumen master:
- `Lukla_BRD_v2.0_Final.md`
- `Lukla_PRD_v2.0_Final.md`
- `Lukla_BPMN_2.0_Final.md`
- `DESIGN_SYSTEM.md`
- `docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md`

Output konsol akan menampilkan:
```text
🚀 Memulai sinkronisasi dokumen pengetahuan Lukla ke Supabase pgvector...
📄 Meng-ingest: Master BRD v2.0 Final...
   ✅ Berhasil di-ingest (18 chunks)
📄 Meng-ingest: Master PRD v2.0 Final...
   ✅ Berhasil di-ingest (24 chunks)
📄 Meng-ingest: Master BPMN 2.0 Operational Flow...
   ✅ Berhasil di-ingest (15 chunks)
✨ Seluruh dokumen resmi berhasil disinkronkan ke Supabase pgvector!
```

---

## 4. Menguji Endpoint Tanya AI (`POST /ask`)

Jalankan perintah pengujian langsung:
```powershell
curl -X POST http://localhost:8000/ask `
  -H "Content-Type: application/json" `
  -d '{"question": "Apakah gaji borongan penjahit terpengaruh oleh unit cacat di QC?", "role": "OWNER"}'
```

Response yang dihasilkan:
```json
{
  "answer": "Gaji borongan penjahit TIDAK terpengaruh oleh status barang cacat atau perbaikan di QC (prinsip no clawback). Penjahit dibayar penuh berdasarkan akumulasi output komponen 30 menit yang telah disahkan (Verified) oleh Mandor. Status lolos di meja QC murni hanya memengaruhi saldo kas Pool Bonus QC untuk para pengawas produksi.",
  "citations": [
    {
      "source": "Master BRD v2.0 Final — Lukla Operations Engine",
      "text": "Gaji borongan penjahit TIDAK terpengaruh oleh status barang QC (No Clawback)..."
    }
  ]
}
```
Dokumen dan jawaban langsung tersambung secara live ke model AWS Bedrock!
