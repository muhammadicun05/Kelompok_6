# AGENTS.md — Workspace Steering & Engineering Rules for Lukla Operations Engine

Dokumen ini adalah **Master Steering Rule** untuk pengembangan **Lukla Operations Engine** (kompatibel dengan **Google Antigravity** dan disinkronkan dengan `.kiro/steering/` untuk **Kiro IDE**). Setiap perubahan kode, database, maupun layanan AI wajib mematuhi aturan di bawah ini.

---

## 1. Konteks Bisnis & Domain Inti (`BRD V3` & `BPMN 2.0`)

- **Organisasi**: Lukla Manufacturing (pabrik garmen dinamis di Ciwidey dengan **±70 mesin jahit aktif**) & merk internal **Snøhund** (*made-to-order*).
- **Model Operasi**: **Multi-Tenant** (melayani merk internal `Snøhund` dan berbagai `Klien Maklon B2B` eksternal secara bersamaan tanpa kontaminasi stok atau kebocoran data).
- **3 Skema Maklon Wajib**:
  1. **`CMT` (Cut, Make, Trim)**: 100% bahan baku titipan klien; Lukla menyediakan jasa potong, jahit, finishing. *(Bypass PO bahan utama, langsung Inbound Surat Jalan Titipan Klien)*.
  2. **`SEMI_CMT`**: Bahan utama titipan klien; bahan pendukung & aksesori diadakan oleh Lukla melalui PO.
  3. **`FULL_PACKAGE` (CMT + Bahan)**: 100% bahan baku & produksi dari Lukla (standar default untuk pesanan internal **Snøhund**).

---

## 2. Aturan Fungsional Mutlak (6 Fase Operasional BPMN)

1. **Fase 1 — Sampel & Studi Waktu**:
   - Wajib mendukung *versioning* revisi sampel (`v1 -> v2 -> vN`) tanpa menimpa histori versi sebelumnya.
   - Menyediakan **Digital Stopwatch** per komponen garmen untuk mencatat waktu standar (**SMV**) dan konsumsi bahan sampel (**BOM**).
2. **Fase 2 — Persetujuan & Pesanan Massal**:
   - Konversi dari versi sampel yang disetujui otomatis mengunci spesifikasi ke pesanan massal beserta skema maklon (`CMT` / `SEMI_CMT` / `FULL_PACKAGE`).
   - Owner menetapkan **Rate Card** (tarif potong & jahit per komponen/artikel) dan parameter variabel (% uang makan, rate bonus QC).
3. **Fase 3 — Gudang, PO & Anti-Kontaminasi (`FR-6.1` & `FR-6.2`)**:
   - **Mandatory Client Tagging (`FR-6.1`)**: Setiap item stok (Bahan Baku, WIP Potongan, Barang Jadi, Cacat) **WAJIB** memiliki `client_id` (`Tag ID Klien`) dan `order_id` (`ID Pesanan`).
   - **Blokir Anti-Kontaminasi (`FR-6.2`)**: Saat pengeluaran bahan ke area Cutting, sistem **WAJIB** memvalidasi kecocokan `client_id` dan `order_id`. Jika tidak cocok, **tolak transaksi seketika (HTTP 403 / Blokir UI Merah)** dan catat ke log audit kontaminasi.
4. **Fase 4 — Lini Produksi (±70 Mesin & Output 30 Menit) (`FR-7.1` s/d `FR-7.4`)**:
   - Alokasi penjahit lintas lini bersifat cair/dinamis hingga ±70 mesin tanpa batas slot kaku.
   - Input output komponen dilakukan setiap interval **30 menit** melalui antarmuka **Touch Terminal** (mendukung *Dual-Mode*: input oleh Penjahit lalu diverifikasi Mandor, atau input langsung oleh Mandor).
   - Penggabungan komponen menjadi produk utuh mengubah status menjadi **`Menunggu QC`** dan memancarkan data *real-time* ke Dashboard Owner & Portal B2B.
5. **Fase 5 — QC & Barang Jadi**:
   - Terminal QC memiliki 3 keputusan: **`LOLOS (PASS)`**, **`PERBAIKAN (REPAIR)`** (kembali ke lini produksi), dan **`CACAT (REJECT)`** (catat jenis cacat & alihkan rute barang).
   - Setiap 1 unit **`LOLOS`** otomatis menambah saldo **Pool Bonus QC**.
6. **Fase 6 — Penggajian & Rekap (`FR-10.1` s/d `FR-10.4`)**:
   - **Borongan Mingguan (`FR-10.1`)**: Dihitung setiap hari **Sabtu** dari akumulasi output 30 menit berstatus `Verified` dikalikan tarif jahit komponen, mendukung penambahan penjahit baru di tengah minggu.
   - **Uang Makan Fleksibel (`FR-10.2`)**: Input persentase variabel (umumnya **10–15%**) terhadap total ongkos jahit periode tersebut.
   - **Bonus QC 3-Arah (`FR-10.3`)**: Total Pool Bonus QC dibagi rata ($\frac{1}{3}$) kepada **3 penerima**: **2 Mandor** dan **1 Kepala Operasional**.
   - **Alokasi Overhead Bulanan (`FR-10.4`)**: Total biaya operasional bulanan (listrik, air, internet) dibagi dengan total unit yang diproduksi pada bulan tersebut.

---

## 3. 10 Asumsi & Aturan Bisnis Resmi (Locked Rules & Bahan Presentasi)

Berdasarkan keputusan resmi proyek (lihat detail argumen di `docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md`), sistem mengunci 10 aturan berikut:
1. **Gaji Borongan TIDAK Terpengaruh Hasil QC**: Gaji penjahit dihitung murni dari output 30 menit yang telah `Verified` oleh Mandor. Status `Repair` atau `Cacat/Reject` di QC tidak memotong upah penjahit (*no clawback*).
2. **Hasil QC HANYA Berpengaruh terhadap Pool Bonus QC**: Setiap 1 unit pakaian utuh berstatus `LOLOS` menambah saldo pool bonus QC.
3. **Uang Makan (10–15%) Masuk Slip Gaji sebagai Uang Tunai**: Persentase uang makan (10–15%) dari total borongan dihitung sebagai tunjangan tunai yang langsung masuk ke slip gaji masing-masing pekerja (`THP = Upah Borongan + Uang Makan`).
4. **QC Memeriksa 1 Produk Utuh (Barang Jadi)**: Terminal QC hanya menginspeksi barang jadi yang sudah berupa 1 produk utuh hasil stasiun *Assembly/Finishing*, bukan komponen lepas.
5. **Skema CMT Murni Tetap Menerbitkan PO ke Client**: PO pada CMT diterbitkan langsung ke Klien Maklon sebagai surat komitmen, *tracking*, dan *reminder* pengiriman bahan titipan klien.
6. **RBAC & Struktur Mandor vs Kepala Produksi/Ops**: Hak akses menu platform setara, namun secara struktural Kepala Produksi/Operasional berada di atas Mandor. Default penerima Bonus QC adalah **2 Mandor + 1 Kepala Operasional** (masing-masing 33,33%), dilengkapi **pengaturan dinamis** jika ke depan jumlah mandor $> 2$.
7. **Dual-Mode Input 30 Menit**:
   - Jika diinput oleh **Mandor** -> Status output **langsung `Verified`**.
   - Jika diinput oleh **Penjahit** -> Status output **`Pending Verification`** (wajib diverifikasi Mandor).
8. **Tim Cutting Diperlakukan Setara/Sama dengan Penjahit**: Masuk dalam perhitungan borongan berbasis *Rate Card* potong dan alur tenaga kerja yang setara.
9. **Diasumsikan TIDAK ADA Sisa Bahan**: Bahan titipan/baku yang dikeluarkan ke cutting diasumsikan terkonversi pas sesuai kuantitas pesanan massal (*zero remnant/shortage*).
10. **SEMUA 8 Role Wajib Bisa Diakses di Mobile dan Desktop**: Seluruh antarmuka dari Owner hingga Penjahit harus adaptif dan nyaman dioperasikan di layar HP/Tablet maupun PC.

---

## 4. Matriks 8 Role RBAC & Kompatibilitas Perangkat (PC + Mobile)

Aplikasi wajib mendukung **8 Role**:
1. `OWNER` (PC & Mobile)
2. `SAMPLE_TEAM` (Mobile Stopwatch & PC)
3. `WAREHOUSE` (Mobile QR Scanner & PC Grid)
4. `PRODUCTION_HEAD_MANDOR` (Tablet/Mobile Lini & PC)
5. `TAILOR_OPERATOR` (Touch Terminal Numpad / Mobile)
6. `QC_INSPECTOR` (Tablet/Mobile Touch QC Terminal)
7. `FINANCE_PAYROLL` (PC Workspace)
8. `B2B_CLIENT` (PC & Mobile Portal — **Terisolasi ketat hanya pada `client_id` miliknya sendiri**).

**Aturan UI Responsif**:
- Semua layar terminal lantai pabrik (`Terminal 30 Menit`, `Terminal QC`, `Stopwatch Sampel`, `Scanner Gudang`) wajib memiliki tombol sentuh besar (*touch target* $\ge 48\text{px}$), kontras tinggi, dan nyaman dibuka di layar Mobile (`390x844`), Tablet (`768x1024`), maupun PC (`1440x900`).

---

## 5. Aturan Teknis `lukla-rag-service/` (Pure Manual RAG: Cross-Region Bedrock + Supabase pgvector)

Untuk kontrol penuh (*higher control*), kemudahan *debugging*, dan keandalan tinggi:
- **Pendekatan RAG**: **Pure Manual RAG** (tanpa OpenSearch Serverless Bedrock-managed yang mahal dan lambat sync).
  - **Embedding**: `amazon.titan-embed-text-v2:0` di Region **`us-east-1`**.
  - **LLM Generator**: `amazon.nova-lite-v1:0` di Region **`ap-southeast-1`**.
  - **Vector Store**: **Supabase PostgreSQL (`pgvector`)** di project `Kelompok_6`.
- **IAM Policy Cross-Region**: Gunakan file `lukla-rag-service/policies/bedrock_student6_cross_region_policy.json` untuk konfigurasi akses `student_6` ke `us-east-1` dan `ap-southeast-1`.
- **Versi Python Wajib**: Gunakan **Python 3.12** (`py -3.12 -m venv venv`), **JANGAN** gunakan Python 3.14.
- **Kredensial & Keamanan `.env`**:
  - **DILARANG KERAS** membaca atau menampilkan isi file `.env` yang berisi secret asli ke dalam chat/log. Gunakan `.env.example` untuk referensi struktur.
- **Kontrak Endpoint di `main.py`**:
  - `POST /ask` -> Request: `{"question": "string", "role": "optional", "client_id": "optional"}` -> Response: `{"answer": "string", "citations": [{"text": "...", "source": "..."}]}`
  - `GET /health` -> Health check status model Titan (us-east-1), Nova Lite (ap-southeast-1), dan Supabase vector store.
  - Sesuai `DESIGN_SYSTEM.md` Bagian 8.6 & 10: Gaya bahasa lugas, Bahasa Indonesia sentence case, istilah resmi (Lolos, Perbaikan, Cacat, Menunggu QC), dan kutipan rujukan dokumen `.md`.

---

## 6. Standar Desain Visual & Kualitas Vibe Code

1. **Kepatuhan Mutlak pada `DESIGN_SYSTEM.md`**:
   - Prinsip: *"Lembar kerja pabrik, bukan dashboard SaaS"*.
   - Palet 6 Warna Bernama: **Kabut** (`#E6ECEE`), **Lembar** (`#F8FAFA`), **Celup Indigo** (`#26325B`), **Tinta** (`#151A24`), **Kapur** (`#E8E36B` - satu-satunya aksen "sekarang"), dan **Benang Abu** (`#9AA5AE`).
   - Warna Status: Lolos (`#1F7A4D`), Perbaikan (`#A86A00`), Cacat/Blokir (`#B3261E`), Info (`#2F5FA8`).
   - **Warna Benang Klien (`ThreadEdge`)**: Wajib ada di sisi kiri tabel/kartu (Snøhund `#5FA0C8`, Klien 1 `#7A5BB0`, dst.) + monogram 2 huruf.
   - **Jahitan Status (`StitchBorder`)**: Garis putus-putus (*basting*) = `Pending Verification` (input penjahit), garis penuh = `Verified` (mandor).
   - Tipografi: Keluarga font **Archivo** (variable width, tabular numbers `tnum` untuk angka uang & 30 menit).
   - Ukuran Tombol Terminal: $\ge 72\text{px}$, jarak $12\text{px}$.
2. **5 Pilar Vibe Code**:
   - **Context7**: Sintaks mutakhir Next.js App Router, Supabase, Tailwind CSS, FastAPI, dan `boto3`.
   - **Skill UI for Front-End**: Implementasi presisi token di `DESIGN_SYSTEM.md`.
   - **Supabase Engine**: PostgreSQL 17 + `pgvector` di `Kelompok_6`.
   - **Playwright CLI**: Browser testing otomatis seluruh tombol/form di viewport PC (`1440x900`), Tablet (`768x1024`), dan Mobile (`390x844`).
   - **Strix**: Security testing untuk IDOR multi-tenant, bypass Anti-Kontaminasi, dan RBAC.

