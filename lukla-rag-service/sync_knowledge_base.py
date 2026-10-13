"""
Script Sinkronisasi Dokumen Pengetahuan Lukla ke Supabase pgvector
Membaca seluruh file .md utama di repository dan menyimpannya ke database vector.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pure_rag import PureRAGEngine

load_dotenv()

REPO_ROOT = Path(__file__).resolve().parent.parent

DOCS_TO_INGEST = [
    {
        "path": REPO_ROOT / "Business Requirement Document (BRD)_V3.md",
        "title": "BRD V3 — Business Requirement Document Kelompok 6",
        "category": "BRD"
    },
    {
        "path": REPO_ROOT / "PRD_Lukla_Operations_Engine.md",
        "title": "PRD v1.0 — Product Requirements Document",
        "category": "PRD"
    },
    {
        "path": REPO_ROOT / "DESIGN_SYSTEM.md",
        "title": "Design System — Lembar Kerja Pabrik Lukla & Snøhund",
        "category": "DESIGN"
    },
    {
        "path": REPO_ROOT / "docs" / "Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        "title": "Catatan Asumsi & Aturan Bisnis Presentasi",
        "category": "BUSINESS_RULES"
    }
]


def sync_all():
    print("🚀 Memulai sinkronisasi dokumen pengetahuan Lukla ke Supabase pgvector...")
    rag = PureRAGEngine()

    for item in DOCS_TO_INGEST:
        file_path = item["path"]
        if not file_path.exists():
            print(f"⚠️ File tidak ditemukan: {file_path}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        print(f"📄 Meng-ingest: {item['title']} ({len(content)} karakter)...")
        try:
            chunks_count = rag.ingest_document(
                title=item["title"],
                category=item["category"],
                markdown_content=content
            )
            print(f"   ✅ Berhasil di-ingest ({chunks_count} chunks)")
        except Exception as e:
            print(f"   ❌ Gagal: {e}")

    print("🎉 Sinkronisasi selesai!")


if __name__ == "__main__":
    sync_all()
