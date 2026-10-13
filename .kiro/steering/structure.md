---
inclusion: always
---

# Repository Structure — Lukla Operations Engine

```text
Lukla/
├── AGENTS.md                            # Master Steering Rules untuk Antigravity & AI Agents
├── .kiro/
│   └── steering/                        # Steering files untuk Kiro IDE
│       ├── project.md                   # Konteks bisnis, 6 fase BPMN, 3 skema maklon & 8 role RBAC
│       ├── tech.md                      # Stack teknis, aturan Python 3.12, AWS Bedrock & Vibe Code
│       └── structure.md                 # Struktur direktori proyek
├── docs/                                # Dokumentasi utama & sumber dokumen Markdown (.md) untuk S3 RAG
│   └── knowledge-base/                  # Dokumen .md terstruktur untuk di-ingest ke Bedrock KB (S3)
├── lukla-rag-service/                   # Microservice Python 3.12 + FastAPI + AWS Bedrock RAG
│   ├── .env.example                     # Template variabel environment AWS & Bedrock KB
│   ├── requirements.txt                 # Daftar paket Python 3.12
│   ├── setup_kb.py                      # Script provision Bedrock Knowledge Base (pakai BEDROCK_ROLE_ARN)
│   ├── sync_s3_docs.py                  # Script upload/sync dokumen .md pengetahuan Lukla ke S3 Bucket
│   ├── main.py                          # FastAPI server: POST /ask & GET /health
│   └── README.md                        # Dokumentasi setup & penggunaan RAG service
├── src/                                 # Aplikasi utama Next.js (PC Desktop & Mobile Touch Terminal)
└── tests/                               # Pengujian otomatis Playwright CLI & validasi keamanan
```
