/**
 * Lukla Operations Engine — Knowledge Retrieval & Q&A Engine
 * Berisi repositori pengetahuan resmi dari:
 * - BRD V3 & BPMN 2.0 (Fase 1 s/d Fase 6)
 * - PRD Lukla Operations Engine
 * - 10 Asumsi & Aturan Bisnis Resmi (docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md)
 * - DESIGN_SYSTEM.md (Bagian 8.6 & 10)
 * - AGENTS.md Master Steering Rules
 */

export interface Citation {
  source: string;
  text: string;
  similarity?: number;
}

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  topics: string[];
  questionPatterns: RegExp[];
  answer: string;
  citations: Citation[];
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // 0a. Sapaan & Greeting
  {
    id: "sapaan-greeting",
    keywords: ["halo", "halow", "hai", "hello", "hi", "pagi", "siang", "malam", "salam"],
    topics: ["sapaan", "bantuan"],
    questionPatterns: [
      /^(halo|halow|hai|hello|hi|pagi|siang|malam|tes|test)/i,
      /selamat (pagi|siang|sore|malam)/i,
    ],
    answer:
      "Halo! Saya Tanya Lukla AI, Asisten Pengetahuan Resmi Lukla Operations Engine. " +
      "Saya siap membantu Anda memahami seluruh SOP dan aturan operasional pabrik di Ciwidey, seperti: " +
      "1) Penggajian borongan mingguan & uang makan (10–15%) tunai, " +
      "2) Pembagian Pool Bonus QC 3-Arah, " +
      "3) Validasi Anti-Kontaminasi bahan baku (FR-6.2), " +
      "4) Alur revisi sampel (v1 -> v2) oleh Tim Sampler, atau " +
      "5) 3 Skema Maklon (CMT, Semi-CMT, Full Package). " +
      "Apa topik spesifik yang ingin Anda tanyakan?",
    citations: [
      {
        source: "PRD_Lukla_Operations_Engine.md",
        text: "Asisten Pengetahuan Resmi Lukla Operations Engine",
      },
    ],
  },

  // 0b. Meta Pertanyaan / Evaluasi Jawaban AI
  {
    id: "meta-evaluasi-jawaban",
    keywords: ["kenapa", "mengapa", "jawab", "gitu", "begitu", "kayak", "maksud"],
    topics: ["meta", "ai_system"],
    questionPatterns: [
      /kenapa.*jawab.*(gitu|begitu|kayak)/i,
      /mengapa.*jawab.*(gitu|begitu|kayak)/i,
      /maksud.*kamu/i,
    ],
    answer:
      "Sebagai asisten AI berbasis dokumen resmi Lukla, jawaban saya mengacu langsung pada SOP pabrik (BRD V3, PRD, dan 10 Aturan Bisnis Resmi). " +
      "Jika pertanyaan Anda berupa sapaan atau kalimat umum tanpa kata kunci operasional (seperti gaji, QC, gudang, atau sampel), sistem menampilkan ringkasan umum pabrik. " +
      "Silakan tanyakan hal teknis atau aturan pabrik yang spesifik (misalnya: 'Apakah gaji dipotong jika ada barang cacat di QC?') agar saya dapat memberikan rujukan pasal dan dokumen yang tepat!",
    citations: [
      {
        source: "DESIGN_SYSTEM.md",
        text: "Panduan Gaya Bahasa & Ketepatan RAG Tanya Lukla AI",
      },
    ],
  },

  // 1. Gaji Borongan & Tidak Terpengaruh QC (Asumsi #1 & FR-10.1)
  {
    id: "gaji-qc-no-clawback",
    keywords: ["gaji", "borongan", "qc", "cacat", "reject", "repair", "perbaikan", "potong", "clawback", "upah"],
    topics: ["penggajian", "qc", "asumsi_1"],
    questionPatterns: [
      /apakah gaji.*terpengaruh.*qc/i,
      /apakah.*potong.*upah/i,
      /gaji.*cacat/i,
      /repair.*potong/i,
      /no clawback/i,
      /upah penjahit/i,
    ],
    answer:
      "Gaji borongan penjahit dan tim cutting TIDAK terpengaruh oleh status QC maupun hasil inspeksi (*no clawback*). " +
      "Apabila sebuah produk dinyatakan 'Perbaikan (Repair)' atau 'Cacat (Reject)' di Terminal QC, upah pekerja TIDAK dipotong sama sekali. " +
      "Upah borongan dihitung murni dari akumulasi output per 30 menit yang telah berstatus 'Verified' (diverifikasi oleh Mandor) dikalikan tarif Rate Card komponen. " +
      "Hasil QC hanya berpengaruh terhadap saldo Pool Bonus QC bagi para supervisor.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #1: Gaji Borongan TIDAK Terpengaruh Hasil QC (No Clawback)",
      },
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-10.1: Perhitungan Borongan Mingguan Berbasis Output 30 Menit Terverifikasi",
      },
    ],
  },

  // 2. Pool Bonus QC & Pembagian 3-Arah (Asumsi #2, #6 & FR-10.3)
  {
    id: "bonus-qc-split",
    keywords: ["bonus", "qc", "pool", "bagi", "mandor", "kepala", "operasional", "300", "supervisor"],
    topics: ["bonus_qc", "penggajian", "asumsi_2", "asumsi_6"],
    questionPatterns: [
      /bagaimana.*bonus qc.*dibagi/i,
      /siapa.*penerima bonus qc/i,
      /berapa bonus qc/i,
      /unit lolos.*bonus/i,
      /pool bonus/i,
      /mandor.*bonus/i,
    ],
    answer:
      "Setiap 1 unit pakaian utuh yang lolos inspeksi QC (status 'LOLOS / PASS') otomatis menambah saldo Pool Bonus QC sebesar Rp 300/unit. " +
      "Total saldo Pool Bonus QC tersebut secara default dibagi rata (1/3 atau 33,33% masing-masing) kepada 3 orang pengawas: " +
      "2 Mandor Lini dan 1 Kepala Operasional/Produksi. " +
      "Sistem juga menyediakan pengaturan dinamis di menu Payroll jika ke depannya jumlah mandor bertambah lebih dari 2 orang (misalnya 3 atau 4 mandor).",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #2 & #6: Hasil QC Hanya Berpengaruh Terhadap Bonus & Pembagian Bonus 3-Arah (2 Mandor + 1 Kepala Ops)",
      },
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-6.3 & FR-10.3: Mekanisme Pool Bonus QC dan Rumus Alokasi",
      },
    ],
  },

  // 3. Uang Makan 10-15% Tunai ke Slip Gaji (Asumsi #3 & FR-10.2)
  {
    id: "uang-makan-tunai",
    keywords: ["uang makan", "makan", "persen", "10", "15", "slip gaji", "thp", "tunai", "tunjangan"],
    topics: ["uang_makan", "payroll", "asumsi_3"],
    questionPatterns: [
      /uang makan/i,
      /10.*15/i,
      /slip gaji.*makan/i,
      /thp penjahit/i,
      /tunjangan makan/i,
    ],
    answer:
      "Uang makan dihitung secara fleksibel menggunakan parameter persentase variabel antara 10% hingga 15% (default 12%) dari total ongkos jahit borongan pekerja pada periode tersebut. " +
      "Uang makan ini dikonversi penuh menjadi uang tunai dan dicantumkan langsung di dalam Slip Gaji mingguan masing-masing pekerja. " +
      "Rumus Take Home Pay (THP) penjahit adalah: THP = Upah Borongan Komponen Terverifikasi + Uang Makan Tunai.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #3: Uang Makan (10–15%) Masuk Slip Gaji sebagai Uang Tunai",
      },
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-10.2: Uang Makan Fleksibel Persentase Variabel terhadap Total Ongkos Jahit",
      },
    ],
  },

  // 4. QC Memeriksa 1 Produk Utuh (Asumsi #4)
  {
    id: "qc-produk-utuh",
    keywords: ["qc", "inspeksi", "produk utuh", "barang jadi", "komponen", "lepas", "assembly", "stasiun"],
    topics: ["qc", "asumsi_4"],
    questionPatterns: [
      /qc memeriksa.*komponen.*produk utuh/i,
      /apakah qc.*komponen/i,
      /apa yang diperiksa qc/i,
      /inspeksi qc/i,
    ],
    answer:
      "Terminal QC hanya menginspeksi barang jadi berupa 1 produk garmen utuh yang telah selesai digabungkan di stasiun Assembly/Finishing, BUKAN memeriksa potongan komponen lepas. " +
      "Pemeriksaan komponen lepas telah dilakukan oleh masing-masing operator dan diverifikasi oleh Mandor di terminal interval 30 menit lantai jahit sebelum digabungkan menjadi produk utuh.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #4: QC Memeriksa 1 Produk Utuh (Barang Jadi Hasil Assembly)",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 8.2: Terminal Inspeksi QC Produk Utuh",
      },
    ],
  },

  // 5. Skema CMT Murni & PO Komitmen ke Klien (Asumsi #5 & 3 Skema Maklon)
  {
    id: "cmt-po-komitmen",
    keywords: ["cmt", "po", "komitmen", "klien", "tracking", "reminder", "skema", "maklon", "semi-cmt", "full package"],
    topics: ["maklon", "po", "asumsi_5"],
    questionPatterns: [
      /fungsi po.*cmt/i,
      /kenapa cmt butuh po/i,
      /skema cmt/i,
      /perbedaan skema/i,
      /maklon/i,
    ],
    answer:
      "Lukla melayani 3 skema maklon wajib: " +
      "1) CMT (Cut, Make, Trim): 100% bahan baku titipan klien; " +
      "2) SEMI_CMT: Bahan utama titipan klien, sedangkan benang & aksesoris disediakan oleh Lukla melalui PO pengadaan; " +
      "3) FULL_PACKAGE: 100% bahan baku dan proses produksi disediakan oleh Lukla (standar default merek internal Snøhund).\n\n" +
      "Pada skema CMT murni, Lukla TETAP menerbitkan PO langsung ke Klien Maklon. " +
      "Fungsi PO ini adalah sebagai surat komitmen resmi, sarana pelacakan (*tracking*), dan pengingat (*reminder*) pengiriman bahan titipan tepat waktu agar kapasitas ±70 mesin di lini jahit tidak menganggur menunggu bahan.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #5: Skema CMT Murni Tetap Menerbitkan PO ke Client sebagai Reminder & Tracking",
      },
      {
        source: "AGENTS.md",
        text: "Bagian 1: 3 Skema Maklon Wajib (CMT, SEMI_CMT, FULL_PACKAGE)",
      },
    ],
  },

  // 6. Dual-Mode Input 30 Menit & Verifikasi Mandor (Asumsi #7 & FR-7.2)
  {
    id: "dual-mode-input-30min",
    keywords: ["dual-mode", "input", "30 menit", "mandor", "penjahit", "pending", "verified", "stitchborder", "verifikasi"],
    topics: ["produksi", "terminal_30m", "asumsi_7"],
    questionPatterns: [
      /verifikasi.*input 30 menit/i,
      /bagaimana status.*laporan.*diverifikasi/i,
      /dual mode/i,
      /stitchborder/i,
      /garis putus/i,
      /cara kerja terminal 30 menit/i,
    ],
    answer:
      "Terminal 30 menit lantai produksi menerapkan Dual-Mode Input: " +
      "1) Jika diinput oleh Penjahit (Tailor Operator): Output berstatus 'PENDING VERIFICATION' dengan penanda visual garis putus-putus (*basting StitchBorder*). Output ini wajib diverifikasi oleh Mandor.\n" +
      "2) Jika diinput langsung oleh Mandor (atau setelah tombol '1-Tap Verifikasi' ditekan): Output langsung berubah status menjadi 'VERIFIED' dengan garis jahitan penuh (*solid StitchBorder*).\n" +
      "Hanya output yang berstatus 'VERIFIED' yang akan diakumulasikan ke dalam perhitungan gaji borongan hari Sabtu.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #7: Dual-Mode Input 30 Menit (Mandor = Langsung Verified, Penjahit = Pending)",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 4: Jahitan Status (StitchBorder) & Bagian 8.1 Terminal Input 30 Menit",
      },
    ],
  },

  // 7. Tim Cutting Setara Penjahit (Asumsi #8)
  {
    id: "tim-cutting-setara",
    keywords: ["cutting", "potong", "tim cutting", "setara", "penjahit", "rate card", "borongan"],
    topics: ["cutting", "penggajian", "asumsi_8"],
    questionPatterns: [
      /tim cutting/i,
      /perlakuan cutting/i,
      /apakah cutting sama dengan penjahit/i,
      /potong pola/i,
    ],
    answer:
      "Tim Cutting diperlakukan setara dengan penjahit. Mereka dihitung dalam alur penggajian borongan mingguan berdasarkan Rate Card potong pola per lembar/komponen, " +
      "menerima uang makan tunai 10–15% yang sama, dan tercatat di slip gaji hari Sabtu tanpa diskriminasi alur kerja.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #8: Tim Cutting Diperlakukan Setara/Sama dengan Penjahit",
      },
    ],
  },

  // 8. Zero Remnant / Tidak Ada Sisa Bahan (Asumsi #9)
  {
    id: "zero-remnant-bahan",
    keywords: ["sisa", "bahan", "remnant", "shortage", "kelebihan", "kekurangan", "kain"],
    topics: ["gudang", "asumsi_9"],
    questionPatterns: [
      /sisa bahan/i,
      /kelebihan bahan/i,
      /kekurangan bahan/i,
      /zero remnant/i,
    ],
    answer:
      "Dalam model operasional Lukla, diasumsikan TIDAK ADA sisa bahan baku (*zero remnant/shortage*). " +
      "Seluruh bahan titipan klien atau bahan baku yang dikeluarkan dari gudang ke area Cutting diasumsikan terkonversi pas sesuai kuantitas target pesanan massal tanpa kelebihan atau kekurangan kain.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #9: Diasumsikan TIDAK ADA Sisa Bahan (Zero Remnant/Shortage)",
      },
    ],
  },

  // 9. Akses Mobile & Desktop Seluruh 8 Role (Asumsi #10)
  {
    id: "responsive-8-role",
    keywords: ["mobile", "desktop", "hp", "tablet", "layar", "responsif", "8 role", "touch"],
    topics: ["ui_ux", "asumsi_10"],
    questionPatterns: [
      /apakah.*bisa dibuka di hp/i,
      /mobile dan desktop/i,
      /ukuran layar/i,
      /terminal touch/i,
    ],
    answer:
      "Seluruh 8 role di Lukla Operations Engine (Owner, Sampel, Gudang, Mandor, Penjahit, QC, Finance, dan Klien B2B) wajib dapat diakses dengan nyaman di layar Mobile Smartphone (390x844), Tablet Sentuh (768x1024), maupun PC Desktop (1440x900). " +
      "Seluruh tombol terminal lantai pabrik memiliki ukuran sentuh besar (minimal 48px hingga 72px) agar ramah dioperasikan menggunakan jari atau sarung tangan kerja.",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "Asumsi #10: SEMUA 8 Role Wajib Bisa Diakses di Mobile dan Desktop",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 9: Kompatibilitas Layar & Touch Targets",
      },
    ],
  },

  // 10. Anti-Kontaminasi FR-6.1 & FR-6.2 (Gudang & Cutting)
  {
    id: "anti-kontaminasi-gudang",
    keywords: ["kontaminasi", "anti-kontaminasi", "fr-6.1", "fr-6.2", "tag id", "klien", "order id", "blokir", "merah", "cutting"],
    topics: ["gudang", "anti_kontaminasi"],
    questionPatterns: [
      /kapan bahan baku boleh dikeluarkan/i,
      /apa yang terjadi jika terjadi kontaminasi/i,
      /anti kontaminasi/i,
      /blokir pintu cutting/i,
      /mandatory client tagging/i,
      /layar merah/i,
    ],
    answer:
      "Pencegahan kontaminasi silang multi-tenant ditegakkan melalui 2 aturan ketat: " +
      "1) FR-6.1 (Mandatory Client Tagging): Setiap item inventaris (kain mentah, potongan WIP, barang jadi, kain cacat) WAJIB memiliki Tag ID Klien (`client_id`) dan ID Pesanan (`order_id`).\n" +
      "2) FR-6.2 (Blokir Anti-Kontaminasi Otomatis): Saat bahan dikeluarkan ke area Cutting, sistem memvalidasi kecocokan Tag ID Klien pada bahan dengan pemilik pesanan target. Jika TIDAK cocok, transaksi diblokir seketika (HTTP 403), layar peringatan merah penuh muncul, stok gudang tidak berkurang, dan insiden tercatat ke log audit keamanan.",
    citations: [
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-6.1 Mandatory Client Tagging & FR-6.2 Blokir Pengeluaran Bahan Silang",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 8.3: Modal Layar Merah Penuh Blokir Anti-Kontaminasi",
      },
    ],
  },

  // 11. Revisi Sampel v1 -> v2 (Fase 1 Studi Waktu & BOM)
  {
    id: "revisi-sampel-v1-v2",
    keywords: ["sampel", "revisi", "v1", "v2", "stopwatch", "smv", "bom", "time study", "fase 1"],
    topics: ["sampel", "fase_1"],
    questionPatterns: [
      /bagaimana alur revisi sampel/i,
      /v1 ke v2/i,
      /studi waktu/i,
      /cara mencatat smv/i,
      /stopwatch/i,
    ],
    answer:
      "Alur revisi sampel di Fase 1: " +
      "1) Tim Sampel (Mbak Lina) menggunakan Digital Stopwatch sentuh (tombol Mulai/Jeda/Reset) untuk mengukur Standard Minute Value (SMV) per komponen garmen (misal: pasang lengan, kantong, rib);\n" +
      "2) Hasil waktu SMV dan konsumsi kain (BOM) dicatat ke versi sampel (v1);\n" +
      "3) Jika ada revisi fitting (contoh: lingkar lengan diperlebar atau layout pola dipadatkan), sistem membuat versi v2 tanpa menimpa data v1 (*non-destructive versioning*);\n" +
      "4) Versi yang disetujui (Approved) dapat langsung dikonversi menjadi Pesanan Massal dengan spesifikasi BOM & SMV yang terkunci otomatis.",
    citations: [
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "Fase 1: Sampel & Studi Waktu (Non-Destructive Versioning)",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 8.4: Stopwatch Sampel Digital & Versioning Card",
      },
    ],
  },

  // 12. Alokasi Overhead Bulanan per Unit (FR-10.4)
  {
    id: "overhead-bulanan",
    keywords: ["overhead", "biaya operasional", "listrik", "air", "internet", "bulanan", "per unit", "fr-10.4"],
    topics: ["keuangan", "overhead"],
    questionPatterns: [
      /bagaimana pembagian overhead/i,
      /overhead per unit/i,
      /biaya operasional bulanan/i,
      /fr-10.4/i,
    ],
    answer:
      "Sesuai aturan FR-10.4, total biaya operasional bulanan pabrik (seperti listrik PLN, air, internet, dan perawatan mesin—misalnya Rp 18.500.000/bulan) " +
      "dibagi secara proporsional dengan estimasi total unit yang diproduksi pada bulan berjalan (misalnya 6.000 pcs). " +
      "Hasilnya adalah beban Overhead per Unit (contoh: Rp 3.083/pcs) yang menjadi acuan akurat bagi Owner dan Finance dalam menghitung harga pokok produksi (HPP) setiap pesanan.",
    citations: [
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-10.4: Alokasi Overhead Bulanan Berdasarkan Total Unit Diproduksi",
      },
    ],
  },

  // 13. Penambahan Penjahit Baru di Tengah Minggu
  {
    id: "penjahit-baru-tengah-minggu",
    keywords: ["penjahit baru", "tengah minggu", "mesin 61", "ekspansi", "kuota", "tambah penjahit"],
    topics: ["produksi", "payroll"],
    questionPatterns: [
      /menambah penjahit baru di tengah minggu/i,
      /penjahit baru/i,
      /mesin 61/i,
      /kuota pekerja/i,
    ],
    answer:
      "Sistem Lini Produksi Lukla dirancang cair tanpa batas slot kaku (mendukung hingga ±70 mesin). " +
      "Mandor dapat menambahkan penjahit baru di tengah minggu (misal: Budi di Mesin #61 dan Wawan di Mesin #62) kapan saja. " +
      "Output yang mereka hasilkan langsung dicatat di terminal 30 menit, dan sistem penggajian hari Sabtu secara otomatis mengikutsertakan mereka dalam rekap borongan serta uang makan tunai tanpa hambatan batas kuota karyawan.",
    citations: [
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "FR-7.1 Alokasi Penjahit Dinamis & Skenario UAT-02",
      },
    ],
  },

  // 14. Pelacakan Pesanan Portal B2B (Fase 1 s/d 6 & RLS)
  {
    id: "b2b-portal-tracking",
    keywords: ["pelacakan", "lacak", "b2b", "portal", "progres", "pesanan", "rls", "klien maklon"],
    topics: ["portal_b2b"],
    questionPatterns: [
      /bagaimana saya melacak progres pesanan/i,
      /lacak pesanan/i,
      /portal b2b/i,
      /status produksi klien/i,
    ],
    answer:
      "Klien Maklon B2B dapat melacak seluruh progres pesanannya secara transparan dan aman melalui Portal B2B (`/b2b-portal`). " +
      "Portal ini menampilkan: " +
      "1) Stepper Interaktif 6 Fase Produksi BPMN (Sampel, Persetujuan PO, Penerimaan Kain, Lini Jahit, Inspeksi QC, hingga Pengiriman);\n" +
      "2) Saldo Kain Titipan Real-Time di Gudang Lukla (otomatis berkurang saat dipotong di Cutting);\n" +
      "3) Status PO Komitmen CMT.\n" +
      "Semua data terisolasi ketat oleh Row-Level Security (RLS) sehingga klien tidak dapat melihat data milik klien lain.",
    citations: [
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "Fase 2 & Portal B2B: Transparansi Status Produksi Multi-Tenant",
      },
      {
        source: "DESIGN_SYSTEM.md",
        text: "Bagian 8.7: Portal B2B Klien Maklon",
      },
    ],
  },

  // 15. Kapasitas Pabrik Ciwidey & 70 Mesin
  {
    id: "kapasitas-pabrik-70-mesin",
    keywords: ["kapasitas", "pabrik", "ciwidey", "70 mesin", "mesin jahit", "snohund", "lini a", "lini b", "lini c"],
    topics: ["profil_pabrik"],
    questionPatterns: [
      /berapa kapasitas mesin jahit/i,
      /pabrik ciwidey/i,
      /70 mesin/i,
      /pembagian lini/i,
    ],
    answer:
      "Pabrik garmen Lukla berlokasi di Ciwidey, Kabupaten Bandung, dengan kapasitas operasional dinamis ±70 mesin jahit aktif. " +
      "Lantai produksi dibagi menjadi lini paralel yang cair: " +
      "Lini A (Mesin #1 - #20) untuk produksi pesanan internal Snøhund, " +
      "Lini B (Mesin #21 - #45) untuk pesanan Klien Maklon A, dan " +
      "Lini C (Mesin #46 - #70) untuk area ekspansi pesanan massal dan penambahan penjahit baru.",
    citations: [
      {
        source: "AGENTS.md",
        text: "Bagian 1: Konteks Bisnis & Kapasitas ±70 Mesin Jahit Aktif di Ciwidey",
      },
    ],
  },
];

/**
 * Semantic & Keyword Matching Engine
 */
export function searchKnowledge(question: string, role?: string): { answer: string; citations: Citation[] } {
  const cleanQ = question.trim().toLowerCase();

  // 1. Direct Regex Pattern Matching (Highest Confidence)
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.questionPatterns) {
      if (pattern.test(cleanQ)) {
        return {
          answer: entry.answer,
          citations: entry.citations,
        };
      }
    }
  }

  // 2. Token Scoring (BM25-style keyword overlap)
  const queryTokens = cleanQ
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  let bestEntry: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    for (const token of queryTokens) {
      // Check keywords
      if (entry.keywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 3;
      }
      // Check topics
      if (entry.topics.some((t) => t.includes(token))) {
        score += 2;
      }
      // Check answer text
      if (entry.answer.toLowerCase().includes(token)) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // If match confidence is reasonable
  if (bestEntry && highestScore >= 3) {
    return {
      answer: bestEntry.answer,
      citations: bestEntry.citations,
    };
  }

  // 3. Fallback for Greetings / General Queries
  if (cleanQ.includes("halo") || cleanQ.includes("hai") || cleanQ.includes("selamat") || cleanQ.includes("siapa kamu") || cleanQ.includes("bisa apa")) {
    return {
      answer:
        "Halo! Saya Asisten Pengetahuan Resmi Lukla Operations Engine ('Tanya Lukla AI'). " +
        "Saya dapat membantu Anda menjawab segala pertanyaan operasional pabrik garmen di Ciwidey:\n\n" +
        "• Aturan Penggajian Borongan Sabtu & Uang Makan 10–15% Tunai (Asumsi #1 & #3)\n" +
        "• Pembagian Pool Bonus QC 3-Arah (2 Mandor + 1 Kepala Ops) (Asumsi #2 & #6)\n" +
        "• SOP Anti-Kontaminasi Bahan Baku Gudang ke Cutting (FR-6.1 & FR-6.2)\n" +
        "• Alur Studi Waktu (SMV), Stopwatch Digital & Revisi Sampel v1 → v2\n" +
        "• 3 Skema Maklon (CMT, Semi-CMT, Full Package) & PO Komitmen Klien\n" +
        "• Pengoperasian Terminal 30 Menit Dual-Mode pada ±70 Mesin Jahit\n\n" +
        "Silakan pilih topik di atas atau ketik pertanyaan spesifik Anda!",
      citations: [
        {
          source: "PRD_Lukla_Operations_Engine.md",
          text: "Panduan Master Operasional & Pengetahuan Lukla",
        },
      ],
    };
  }

  // 4. Out-of-Domain Query Handling (Pertanyaan di luar konteks pabrik garmen Lukla)
  if (highestScore === 0) {
    return {
      answer:
        `Pertanyaan Anda ("${cleanQ.length > 50 ? cleanQ.slice(0, 50) + "..." : cleanQ}") berada di luar lingkup operasional pabrik garmen Lukla Manufacturing.\n\n` +
        "Sebagai Asisten Pengetahuan Resmi Lukla Operations Engine, saya dikhususkan untuk menjawab hal-hal seputar operasional pabrik di Ciwidey:\n" +
        "1. Aturan Penggajian Borongan Sabtu & Uang Makan (10–15%) Tunai\n" +
        "2. Mekanisme & Pembagian Pool Bonus QC 3-Arah\n" +
        "3. Validasi Anti-Kontaminasi Bahan Baku di Pintu Cutting (FR-6.2)\n" +
        "4. Alur Sampel Klien, Studi Waktu (SMV) & Order Produksi Massal (Tim Sampler)\n" +
        "5. 3 Skema Maklon (CMT, Semi-CMT, Full Package)\n\n" +
        "Silakan ajukan pertanyaan seputar SOP, aturan bisnis, atau alur kerja 6 fase produksi Lukla!",
      citations: [
        {
          source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
          text: "10 Aturan Bisnis Resmi & Bahan Presentasi Lukla Operations Engine",
        },
        {
          source: "PRD_Lukla_Operations_Engine.md",
          text: "Spesifikasi Domain & Lingkup Operasional Lukla",
        },
      ],
    };
  }

  // 5. Default Context-Rich Answer if match score is low but has some domain relevance
  return {
    answer:
      "Berdasarkan dokumen operasional Lukla Operations Engine (BRD V3 & 10 Aturan Bisnis Resmi):\n\n" +
      "1. Pabrik beroperasi di Ciwidey dengan kapasitas dinamis ±70 mesin jahit aktif untuk merek internal Snøhund dan Klien Maklon B2B.\n" +
      "2. Seluruh sistem mencakup 6 fase terintegrasi: Studi Sampel (SMV/BOM), Persetujuan Pesanan Massal, Gudang Anti-Kontaminasi (FR-6.2), Lini Jahit 30 Menit Dual-Mode, Inspeksi QC Produk Utuh, dan Penggajian Sabtu.\n" +
      "3. Gaji borongan penjahit tidak dipotong oleh hasil QC (*no clawback*), uang makan 10–15% masuk slip sebagai uang tunai, dan bonus QC dibagi 3-arah.\n\n" +
      "Bisa jelaskan lebih spesifik bagian mana yang ingin Anda ketahui (contoh: penggajian, SOP gudang, studi sampel, terminal QC, atau portal B2B)?",
    citations: [
      {
        source: "docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md",
        text: "10 Aturan Bisnis Resmi & Bahan Presentasi Lukla Operations Engine",
      },
      {
        source: "Business Requirement Document (BRD)_V3.md",
        text: "Spesifikasi Fungsional BPMN 6 Fase Operasional",
      },
    ],
  };
}
