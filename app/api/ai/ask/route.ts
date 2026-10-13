import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, role, clientId } = body;

    if (!question) {
      return NextResponse.json({ success: false, message: "Pertanyaan wajib diisi." }, { status: 400 });
    }

    const ragServiceUrl = process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "http://localhost:8000";

    // Attempt to call Python FastAPI Pure RAG microservice
    try {
      const response = await fetch(`${ragServiceUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, role, client_id: clientId }),
        // timeout
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          answer: data.answer,
          citations: data.citations || [],
          source: "AWS_BEDROCK_RAG",
        });
      }
    } catch (fetchErr) {
      // Microservice is not running or timeout; fall back to intelligent in-app answer engine
      console.log("RAG microservice unavailable, using intelligent local knowledge fallback.");
    }

    // Intelligent Knowledge Fallback based on Lukla BRD & Locked Assumptions
    const lowerQ = question.toLowerCase();
    let answer = "";
    let citations = [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "10 Aturan Bisnis Resmi & Asumsi Proyek Lukla Operations Engine (BRD V3)",
      },
    ];

    if (lowerQ.includes("qc") && (lowerQ.includes("gaji") || lowerQ.includes("upah") || lowerQ.includes("potong"))) {
      answer = "Gaji borongan penjahit TIDAK terpengaruh oleh status QC (no clawback). Status Repair atau Cacat/Reject di terminal QC tidak memotong upah penjahit sama sekali. Upah dihitung murni dari output 30 menit yang telah berstatus 'Verified' oleh Mandor.";
      citations.push({
        source: "Business Requirement Document (BRD)_V3.md",
        text: "Bagian FR-10.1 & Asumsi #1: Gaji Borongan Tidak Terpengaruh Hasil QC",
      });
    } else if (lowerQ.includes("bonus") && lowerQ.includes("qc")) {
      answer = "Setiap 1 unit pakaian utuh yang lolos QC (PASS) menambah saldo Pool Bonus QC sebesar Rp 300/unit. Total saldo pool tersebut secara default dibagi rata (1/3 masing-masing) kepada 3 pengawas: 2 Mandor dan 1 Kepala Operasional. Sistem juga mendukung penyesuaian jika jumlah mandor lebih dari 2 orang.";
      citations.push({
        source: "PRD_Lukla_Operations_Engine.md",
        text: "FR-6.3 & FR-10.3: Pembagian Pool Bonus QC 3-Arah (2 Mandor + 1 Kepala Ops)",
      });
    } else if (lowerQ.includes("uang makan") || lowerQ.includes("makan")) {
      answer = "Uang makan dihitung secara fleksibel antara 10% hingga 15% dari total upah borongan periode tersebut. Uang makan ini dikonversi menjadi uang tunai dan langsung masuk ke dalam Slip Gaji masing-masing pekerja (THP = Upah Borongan + Uang Makan Tunai).";
      citations.push({
        source: "PRD_Lukla_Operations_Engine.md",
        text: "FR-6.2 & FR-10.2: Uang Makan 10–15% Masuk Slip Gaji sebagai Uang Tunai",
      });
    } else if (lowerQ.includes("kontaminasi") || lowerQ.includes("gudang") || lowerQ.includes("bahan")) {
      answer = "Setiap bahan baku wajib memiliki Tag ID Klien (FR-6.1). Saat pengeluaran bahan ke area Cutting, sistem wajib memvalidasi kecocokan Tag ID Klien dan ID Pesanan (FR-6.2). Jika tidak cocok, sistem memblokir transaksi seketika (HTTP 403), memunculkan layar merah penuh, tidak mengurangi stok, dan mencatat insiden ke audit log.";
      citations.push({
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-6.1 & FR-6.2: Mandatory Client Tagging & Blokir Anti-Kontaminasi Silang",
      });
    } else if (lowerQ.includes("cmt") || lowerQ.includes("skema")) {
      answer = "Lukla mendukung 3 skema maklon: 1) CMT (Cut, Make, Trim): 100% bahan dari klien, namun Lukla tetap menerbitkan PO ke klien sebagai reminder & tracking; 2) SEMI_CMT: Bahan utama dari klien, aksesoris diadakan Lukla; 3) FULL_PACKAGE: 100% bahan & produksi disediakan Lukla (standar Snøhund).";
      citations.push({
        source: "AGENTS.md",
        text: "Bagian 1: Konteks Bisnis & 3 Skema Maklon Wajib",
      });
    } else if (lowerQ.includes("cutting") || lowerQ.includes("tim cutting")) {
      answer = "Tim Cutting diperlakukan setara dengan penjahit. Mereka masuk dalam alur perhitungan borongan mingguan berbasis Rate Card potong pola dan tercatat dalam sistem penggajian Sabtu.";
      citations.push({
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #8: Tim Cutting Diperlakukan Setara dengan Penjahit",
      });
    } else {
      answer = `Sistem Lukla Operations Engine mengoperasikan pabrik garmen di Ciwidey dengan ±70 mesin jahit aktif untuk merek internal Snøhund dan Klien Maklon B2B. Sistem ini mencakup 6 fase operasional (Sampel, Pesanan Massal, Gudang Anti-Kontaminasi, Lini 30 Menit Dual-Mode, QC Terminal, dan Penggajian Sabtu) yang dapat diakses penuh melalui PC dan Mobile oleh seluruh 8 role.`;
      citations.push({
        source: "PRD_Lukla_Operations_Engine.md",
        text: "Dokumen Ringkasan Operasional Lukla Engine",
      });
    }

    return NextResponse.json({
      success: true,
      answer,
      citations,
      source: "LOCAL_LUKLA_KNOWLEDGE_BASE",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
