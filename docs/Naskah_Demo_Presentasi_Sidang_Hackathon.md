# Naskah Demo & Panduan Presentasi Sidang Hackathon
## Lukla Operations Engine — Kelompok 6

Dokumen ini adalah **panduan panggung resmi** untuk demonstrasi langsung (*live demo* 5–7 menit), urutan pembagian peran, dan contekan jawaban pertahanan (*Q&A defense*) untuk menjawab pertanyaan kritis dewan juri/mentor.

---

## 🎬 1. Skenario Live Demo Berurutan (7 Menit Menang Mutlak)

| Waktu | Tahapan Demo | Tindakan di Layar (Live Screen Action) | Kalimat Narasi Presenter |
| :---: | :--- | :--- | :--- |
| **00:00 - 01:00** | **Hook Masalah & Dashboard KPI** | Buka halaman `/dashboard` di laptop atau mode layar besar. Tunjukkan 4 kartu KPI (Mesin Jahit Aktif 68/70, Output Hari Ini, Lolos QC 98%, Peringatan Anti-Kontaminasi) dan coba filter rentang tanggal. | *"Selamat pagi Dewan Juri. Lukla Manufacturing mengoperasikan pabrik garmen di Ciwidey dengan ±70 mesin jahit. Kami memproduksi merek internal Snøhund made-to-order dan melayani berbagai klien maklon secara paralel. Tanpa sistem terintegrasi, risiko kain tertukar antar-klien dan sengketa gaji borongan mingguan adalah mimpi buruk operasional. Ini adalah Lukla Operations Engine."* |
| **01:00 - 02:00** | **Fase 1: Sampel & Digital Stopwatch** | Buka `/samples`. Tunjukkan fitur **Digital Stopwatch** per komponen. Klik start, catat SMV dan Sample BOM. Tunjukkan versioning revisi `v1 -> v2`. | *"Fase 1 dimulai dari Tim Sampler, Mbak Lina. Di ruang sampel, Mbak Lina mencatat pemakaian bahan kain dan menggunakan stopwatch digital terintegrasi untuk mengukur waktu standar pengerjaan (SMV) per komponen pakaian. Jika klien meminta revisi kerah atau ukuran, sistem membuat versi v2 tanpa menghapus riwayat v1."* |
| **02:00 - 03:15** | **Fase 2 & 3: Order Massal & DEMO ANTI-KONTAMINASI (Paling Dramatis)** | Klik tombol **"Jadikan Pesanan Massal"** di v2. Pilih skema maklon **SEMI_CMT**.<br/><br/>Pindah ke menu `/warehouse`. Pilih Pesanan milik **Klien B**, lalu sengaja pilih bahan Taslan Milky milik **Klien A** dan klik *"Keluarkan ke Cutting"*. | *"Ketika sampel disetujui, Sampler menerbitkan pesanan massal. Sekarang perhatikan momen krusial ini di gudang: Staf gudang hendak mengeluarkan kain untuk pesanan Klien B, namun keliru mengambil roll kain milik Klien A. Saat tombol diklik... BOOM! Layar merah blokir anti-kontaminasi FR-6.2 muncul seketika! Transaksi ditolak, audit log tercatat, dan stok kain aman 100% tidak berkurang!"* |
| **03:15 - 04:30** | **Fase 4: Lini Produksi, Dual-Mode & Assembly** | Buka `/production/terminal`. Tunjukkan alokasi ±70 mesin. Di mode operator, input output 30 menit (status `Pending`). Ganti role ke Mandor dan klik **1-Tap Approve** (status `Verified`).<br/><br/>Pindah ke Stasiun Assembly (perakitan), gabungkan komponen menjadi 1 produk utuh berstatus **`Menunggu QC`**. | *"Di lantai jahit, alokasi mesin bersifat cair hingga ±70 mesin. Operator menginput output per 30 menit di terminal layar sentuh (status pending). Mandor cukup tap 1 tombol untuk mengesahkannya. Komponen-komponen ini kemudian dirakit oleh Penjahit Assembly menjadi satu pakaian utuh berstatus 'Menunggu QC', yang memancarkan progres real-time ke Dashboard Owner dan Portal Klien B2B."* |
| **04:30 - 05:30** | **Fase 5: Terminal QC 1 Produk Utuh** | Buka `/qc/terminal`. Klik tombol simulasi 3.000 unit lolos QC. Tunjukkan saldo Pool Bonus bertambah menjadi **Rp 900.000**. Tekan tombol **LOLOS**, **PERBAIKAN**, dan **CACAT**. | *"Terminal QC hanya menginspeksi barang yang sudah berupa 1 pakaian utuh. Setiap unit lolos otomatis menambah kas Pool Bonus QC sebesar Rp 300. Dan aturan bisnis mutlak kami: Baju yang reject atau perlu repair TIDAK PERNAH memotong gaji penjahit (no clawback) karena penjahit sudah disahkan oleh mandor di stasiun 30 menit."* |
| **05:30 - 06:30** | **Fase 6: Workspace Payroll & Uang Makan** | Buka `/payroll`. Tunjukkan rekap gaji borongan Sabtu. Ubah slider uang makan ke **12%**. Tunjukkan pembagian Bonus QC 3-arah (**Rp 300.000** masing-masing untuk 2 Mandor + 1 Ka. Ops). Klik tombol **Ekspor CSV** dan cetak **Slip Gaji Resmi**. | *"Setiap Sabtu, Finance menutup buku. Upah borongan dihitung otomatis dari output verified dikalikan tarif Rate Card. Uang makan fleksibel 10-15% langsung cair sebagai uang tunai ke slip gaji pekerja (Take Home Pay = Borongan + Uang Makan). Dan kas Pool Bonus QC dibagi rata kepada 2 Mandor dan 1 Kepala Operasional!"* |
| **06:30 - 07:00** | **AI Assistant & Notifikasi Bot Telegram** | Buka tombol **Tanya AI** (klik pertanyaan *"Apakah gaji borongan terpengaruh oleh unit cacat di QC?"*). Buka tombol **Bot Telegram** dan kirim notifikasi *Factory Pulse*. | *"Terakhir, sistem dilengkapi Tanya Lukla AI berbasis AWS Bedrock Titan dan Nova Lite dengan sitasi dokumen resmi, serta Bot Telegram pabrik untuk memantau ringkasan denyut pabrik setiap hari di genggaman ponsel Owner. Terima kasih!"* |

---

## 🎯 2. Panduan Menjawab Pertanyaan Kritis Juri (Q&A Defense Sheet)

### Pertanyaan 1: *"Mengapa baju yang reject atau cacat di meja QC tidak memotong upah borongan penjahit?"*
> **Jawaban:**
> *"Di pabrik garmen semi-padat karya seperti Ciwidey dengan ±70 mesin jahit, pemotongan gaji buruh akibat cacat di ujung akhir QC seringkali memicu mogok kerja atau konflik antar-pekerja, karena sulit membuktikan apakah cacat diakibatkan oleh penjahit stasiun 1, perakitan stasiun 2, atau cacat bawaan benang/kain supplier.
> 
> Dengan menetapkan bahwa **verifikasi Mandor di stasiun 30 menit adalah dasar sah upah borongan**, hak buruh terlindungi dan mereka terpacu bekerja cepat. Sementara kualitas produk tetap terjaga di tingkat tertinggi karena **bonus Mandor dan Kepala Operasional justru terikat langsung pada seberapa banyak unit yang lolos QC**."*

---

### Pertanyaan 2: *"Mengapa skema CMT murni yang bahannya 100% dari klien tetap menerbitkan Purchase Order (PO)?"*
> **Jawaban:**
> *"PO pada skema CMT bukan Purchase Order komersial untuk belanja kain ke toko tekstil, melainkan **Surat Perjanjian Komitmen Produksi & Instrumen Tracking Pengingat (Reminder)** ke Klien Maklon.
> 
> Dokumen PO ini menjadi dasar legal bagi tim gudang saat menerima Surat Jalan Titipan Kain Klien, sekaligus menjadi kunci pengikat **Tag ID Klien dan ID Pesanan** untuk mengaktifkan sistem pencegahan bahan tertukar (Anti-Kontaminasi FR-6.1 & FR-6.2)."*

---

### Pertanyaan 3: *"Mengapa memilih Pure Manual RAG (Titan us-east-1 + Nova Lite ap-southeast-1 + Supabase pgvector) dibanding OpenSearch Serverless Bedrock?"*
> **Jawaban:**
> *"Kami memilih Pure Manual RAG berdasarkan pertimbangan teknik dan biaya riil industri:
> 1. **Biaya & Efisiensi**: OpenSearch Serverless Bedrock memakan biaya minimal ~\$700/bulan (karena batas minimum 2 OCU) dan lambat dalam proses indexing dokumen lokal.
> 2. **Kontrol Data Penuh (Higher Control)**: Dengan Supabase `pgvector` di region yang sama dengan basis data operasional, pencarian semantik berjalan sub-100ms dan data rujukan dokumen `.md` terisolasi ketat per-tenant.
> 3. **Model Terbaik**: Kami memanfaatkan model embedding terkini `amazon.titan-embed-text-v2:0` di `us-east-1` (1024 dimensi normalized) dan model reasoning cepat berbiaya hemat `amazon.nova-lite-v1:0` di `ap-southeast-1`."*

---

### Pertanyaan 4: *"Bagaimana jika kapasitas pabrik berkembang dan jumlah mandor bertambah menjadi 4 atau 5 orang?"*
> **Jawaban:**
> *"Sistem kami tidak meng-hardcode pembagian 3 orang. Di halaman Pengaturan Owner, kami menyediakan konfigurasi dinamis penerima pool bonus QC. Default sistem terisi 2 Mandor + 1 Kepala Operasional (masing-masing 33,33%), namun Owner dapat menambah daftar penerima menjadi $N$ orang secara instan, dan sistem akan membagi pool secara proporsional otomatis $\frac{1}{N}$ tanpa perlu mengubah kode program."*

---

### Pertanyaan 5: *"Apakah buruh jahit di pabrik Ciwidey harus memiliki smartphone canggih untuk melapor output 30 menit?"*
> **Jawaban:**
> *"Sama sekali tidak wajib. Sistem mendukung **Dual-Mode**:
> - Jika buruh tidak memiliki HP, Mandor cukup berkeliling membawa 1 tablet lini dan menginputkan langsung untuk penjahit (otomatis berstatus `Verified`).
> - Jika buruh menggunakan terminal layar sentuh (kiosk) bersama di ujung lini, tombol sentuh berukuran ekstra besar (target $\ge 72\text{px}$) dengan font tebal dan angka tabular `tnum` yang mudah ditekan dengan jari berminyak/sarung tangan pabrik."*
