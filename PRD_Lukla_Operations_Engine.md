# Product Requirements Document (PRD): Lukla Operations Engine

**Nama Produk:** Lukla Operations Engine  
**Versi PRD:** 1.0 (Berdasarkan BRD V3 & Diagram BPMN 2.0 Kelompok 6)  
**Pemilik Produk:** Tim Operasional Lukla Manufacturing & Manajemen Merk Snøhund  
**Target Platform:** Web Responsif (PC/Desktop) & Mobile/Tablet (PWA + Touch Terminal Lantai Pabrik)  
**Integrasi AI:** Amazon Web Services (AWS) Bedrock  

---

## 1. Ringkasan Eksekutif & Konteks Produk

**Lukla Manufacturing** mengoperasikan pabrik garmen dinamis di Ciwidey dengan kapasitas hingga **±70 mesin jahit aktif**. Pabrik beroperasi menggunakan model **Multi-Tenant**, yaitu melayani produksi merek internal (**Snøhund** — *made to order*) sekaligus berbagai **Klien Maklon B2B eksternal** secara paralel.

**Lukla Operations Engine** dibangun untuk mengeliminasi tiga masalah krusial:
1. **Risiko Kontaminasi Silang Stok**: Mencegah tercampurnya kain/bahan titipan, WIP (potongan), dan barang jadi milik Klien A ke pesanan Klien B.
2. **Kompleksitas Payroll Borongan & Kapasitas Cair**: Menghitung upah borongan mingguan (setiap Sabtu) secara akurat dari pencatatan output per 30 menit untuk jumlah penjahit yang berfluktuasi, ditambah persentase uang makan fleksibel (10–15%), pembagian pool bonus QC 3-arah, dan alokasi biaya *overhead* bulanan per unit.
3. **Hilangnya Riwayat Revisi Sampel & Keterlacakan Produksi**: Menyediakan *version control* (`v1`, `v2`, dst.) dari fase sampel (pemakaian bahan & *time study* per komponen) hingga konversi otomatis ke pesanan produksi massal.

---

## 2. Daftar Asumsi & Aturan Bisnis Resmi (Catatan Khusus Presentasi)

Seluruh hal yang sebelumnya belum terdefinisi secara eksplisit pada BRD V3 dan BPMN 2.0 kini telah **dikunci menjadi 10 Asumsi & Aturan Bisnis Resmi** (detail argumen presentasi juga tersedia di [Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md](file:///c:/Workspace/06_Courses_and_Training/Alkademi_Phase3_Offline/Lukla/docs/Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md)):

| No | Area / Fase | Aturan & Asumsi Bisnis Resmi yang Dikunci | Implementasi pada Sistem Lukla |
| :-: | :--- | :--- | :--- |
| **1** | **Gaji Borongan vs Status QC** | **Diasumsikan gaji TIDAK terpengaruh oleh status barang QC.** | Upah borongan penjahit dihitung murni dari akumulasi output 30 menit yang telah berstatus **`Verified`** oleh Mandor. Barang yang masuk status *Repair* atau *Cacat/Reject* di meja QC tidak memotong (*no clawback*) upah penjahit. |
| **2** | **Dampak Hasil Inspeksi QC** | **Hasil QC HANYA berpengaruh terhadap Pool Bonus QC.** | Setiap 1 unit produk utuh yang dinyatakan **`LOLOS (PASS)`** di Terminal QC secara otomatis menambah saldo **Pool Bonus QC** untuk jajaran pengawas produksi. |
| **3** | **Uang Makan Fleksibel (10–15%)** | **Persentase 10–15% diasumsikan menjadi uang tunai dan masuk langsung ke Slip Gaji.** | Uang makan dihitung sebesar $10\%\text{–}15\%$ (fleksibel) dari total ongkos jahit/borongan yang dihasilkan dan ditambahkan langsung sebagai komponen tunai pada **Slip Gaji Mingguan** (`Take Home Pay = Upah Borongan + Uang Makan`). |
| **4** | **Objek Inspeksi QC** | **QC diasumsikan memeriksa barang yang sudah dalam 1 produk utuh (Barang Jadi).** | Terminal QC tidak menginspeksi komponen lepasan (seperti kerah/lengan saja), melainkan unit pakaian utuh yang telah digabung (*assembled*) dan berstatus **`Menunggu QC`**. |
| **5** | **PO pada Skema CMT Murni** | **Untuk skema CMT Murni tetap menerbitkan PO, tetapi ditujukan langsung ke Client.** | Pada skema CMT (100% bahan dari klien), sistem tetap membuat dokumen **PO ke Klien Maklon** yang berfungsi sebagai **pengingat (*reminder*) dan *tracking* resmi** pengiriman bahan titipan dari klien ke gudang Lukla. |
| **6** | **RBAC & Struktur Mandor vs Kepala Produksi/Ops** | **Di RBAC kebutuhan akses platform berada pada posisi yang sama, namun secara struktural Kepala Produksi/Operasional berada di atas Mandor. Default saat ini: 2 Mandor + 1 Kepala Operasional (dengan opsi pengaturan >2 Mandor).** | Hak akses menu produksi setara. Untuk pembagian **Pool Bonus QC (FR-10.3)**, default sistem membagi rata ke **3 penerima (2 Mandor + 1 Kepala Operasional)**, disertai **pengaturan dinamis** untuk mengubah jumlah mandor menjadi lebih dari 2 orang jika kapasitas bertambah. |
| **7** | **Aturan Verifikasi Input 30 Menit** | **Jika yang menginput Mandor -> langsung `Verified`. Jika yang menginput Penjahit -> harus diverifikasi dulu oleh Mandor (`Pending Verification`).** | Mendukung *Dual-Mode Input*: Input langsung oleh Mandor otomatis sah masuk rekap gaji; sedangkan input mandiri oleh Penjahit berstatus `Pending` sampai diklik *Approve/Verify* oleh Mandor. |
| **8** | **Perlakuan Tim Cutting** | **Diasumsikan Tim Cutting sama seperti Penjahit (atau merupakan tim dan orang yang sama).** | Pekerja *Cutting* diperlakukan setara dengan operator/penjahit dalam struktur tenaga kerja produksi dan perhitungan borongan berdasarkan *Rate Card* potong/jahit. |
| **9** | **Sisa Bahan Baku / Titipan** | **Diasumsikan TIDAK ADA sisa bahan (tidak ada kelebihan maupun kekurangan).** | Seluruh bahan baku/titipan yang dikeluarkan ke area Cutting diasumsikan habis terpakai tepat sesuai kuantitas pesanan massal (*zero remnant/shortage*). |
| **10** | **Kompatibilitas Perangkat Semua Role** | **SEMUA 8 Role wajib bisa diakses dan kompatibel penuh di Mobile maupun Desktop (PC).** | Seluruh tampilan untuk ke-8 Role dirancang dengan *Responsive Adaptive UI* sehingga nyaman dioperasikan baik melalui browser **Mobile/Tablet** maupun **Desktop/PC**. |

---

## 3. Matriks Peran Pengguna (RBAC) & Kompatibilitas Perangkat (Semua Role: Mobile & Desktop)

Sistem mengimplementasikan **8 peran pengguna (Role-Based Access Control)** yang seluruhnya wajib kompatibel di **Mobile & Desktop (PC)**:

| ID | Peran (Role) | Dukungan Perangkat | Izin Utama (Permissions) | Batasan Ketat & Catatan Struktural |
| :-: | :--- | :---: | :--- | :--- |
| **R1** | **Owner / Eksekutif** | 💻 Desktop & 📲 Mobile | Melihat dashboard analitik real-time, mengatur Rate Card, mengubah parameter (% Uang Makan, Rate Bonus QC, jumlah Mandor penerima bonus), akses penuh Tanya Lukla AI. | Tidak dapat mengubah histori transaksi yang sudah dikunci (*locked*). |
| **R2** | **Tim Sample** | 💻 Desktop & 📲 Mobile | Mencatat pemakaian bahan sampel (BOM), menjalankan *digital stopwatch* studi waktu per komponen, membuat revisi (`v1 -> v2`), menyetujui versi sampel. | Tidak dapat menyetujui pesanan massal tanpa konfirmasi. |
| **R3** | **Gudang (Warehouse)** | 💻 Desktop & 📲 Mobile | Menerima bahan PO maupun titipan klien, mengikat `Tag ID Klien` + `ID Pesanan` (`FR-6.1`), mengeluarkan bahan ke area Cutting, stok opname. | **Diblokir otomatis (`FR-6.2`)** jika mencoba mengeluarkan bahan dengan `Tag ID Klien` / `ID Pesanan` yang tidak cocok. |
| **R4** | **Kepala Produksi / Kepala Operasional & Mandor** | 💻 Desktop & 📲 Mobile | Mengajukan PO bahan baku (termasuk PO reminder ke Klien untuk CMT), mengatur alokasi ±70 mesin, menginput output 30 menit (**langsung `Verified`**), memverifikasi input penjahit, menggabungkan komponen ke `Menunggu QC`. | Secara akses platform berada pada posisi yang sama, namun secara struktural **Kepala Produksi/Operasional berada di atas Mandor**. Tidak dapat mengubah rumus payroll atau hasil final QC. |
| **R5** | **Penjahit / Operator & Tim Cutting** | 💻 Desktop & 📲 Mobile | Melihat tugas komponen/potong, menginput hasil kerja per 30 menit (berstatus **`Pending`** hingga diverifikasi Mandor). Tim Cutting diasumsikan setara/orang yang sama dengan Penjahit. | Tidak dapat mengedit catatan output yang sudah berstatus `Verified` oleh Mandor. |
| **R6** | **QC Inspector** | 💻 Desktop & 📲 Mobile | Memeriksa **1 produk utuh (barang jadi)** di Terminal QC, memilih status (`Lolos`, `Repair`, `Cacat/Reject`), mencatat jenis cacat & pengalihan rute barang. | Keputusan QC hanya memengaruhi **Pool Bonus QC**, tidak memotong gaji borongan penjahit, dan tidak dapat mengubah harga borongan. |
| **R7** | **Finance & Payroll** | 💻 Desktop & 📲 Mobile | Membuat & menyetujui PO (ke Supplier maupun PO Tracking ke Klien CMT), menghitung gaji borongan hari Sabtu + Uang Makan 10–15% ke slip gaji, membagi Bonus QC (default 2 Mandor + 1 Kepala Ops), menghitung alokasi overhead bulanan, menerbitkan Invoice & Slip Gaji. | Tidak dapat mengubah fisik stok di gudang. |
| **R8** | **Klien Maklon (B2B Portal)** | 💻 Desktop & 📲 Mobile | Mengirim spesifikasi sampel & bahan titipan, menerima pengingat PO CMT, mengonfirmasi pesanan massal, memantau progres real-time & stok titipan. | **Terisolasi ketat** hanya pada data yang cocok dengan `Tag ID Klien` miliknya sendiri. |

---

## 4. Persyaratan Fungsional End-to-End (6 Fase Operasional)

### Fase 1: Fase Sampel (Sample & Time Study Management)
- **FR-1.1 Inisiasi Proyek & Spesifikasi Sampel**: Klien Maklon (via Portal B2B) atau Admin Internal Snøhund mengirimkan spesifikasi sampel dan titipan bahan sampel.
- **FR-1.2 Pencatatan Pemakaian Bahan Sampel (Sample BOM)**: Tim Sample mencatat jenis dan kuantitas bahan yang terpakai untuk sampel.
- **FR-1.3 Digital Stopwatch & Studi Waktu per Komponen**: Stopwatch digital interaktif (nyaman di Mobile & Desktop) untuk mencatat waktu pengerjaan per komponen pakaian.
- **FR-1.4 Versioning Revisi Sampel (`v1 -> v2 -> vN`)**: Jika sampel belum disetujui, sistem membuat revisi baru (`v1 -> v2`) dengan tetap menyimpan seluruh histori spesifikasi dan waktu sebelumnya.

### Fase 2: Persetujuan & Pesanan Massal (Mass Order & Maklon Scheme)
- **FR-2.1 Konversi Sampel ke Pesanan Massal**: Versi sampel yang disetujui dikonversi menjadi pesanan massal dengan mewarisi seluruh spesifikasi versi tersebut.
- **FR-2.2 Pemilihan 3 Skema Maklon**:
  1. **CMT (Cut, Make, Trim)**: 100% bahan dari klien (tetap menerbitkan **PO langsung ke Client** sebagai pengingat & *tracking*).
  2. **Semi-CMT**: Bahan utama dari klien (PO Tracking ke Client) + bahan pendukung/aksesori dari Lukla (PO ke Supplier).
  3. **CMT + Bahan (Full Package)**: 100% bahan dari Lukla (standar untuk pesanan internal **Snøhund**).
- **FR-2.3 Penetapan Rate Card & Parameter**: Owner menetapkan tarif potong & jahit per komponen/artikel, % uang makan (10–15%), rate bonus QC, serta konfigurasi jumlah penerima bonus QC.

### Fase 3: Gudang, Pengadaan (PO) & Pemotongan (Anti-Contamination Engine)
- **FR-3.1 Pengajuan & Persetujuan PO (Termasuk PO ke Client untuk CMT)**:
  - Kepala Produksi mengajukan PO bahan baku -> disetujui oleh Finance & Payroll. Untuk skema **CMT Murni**, PO diterbitkan langsung kepada **Client** sebagai instrumen pengingat (*reminder*) dan pelacakan penerimaan bahan titipan.
- **FR-3.2 Mandatory Client & Order Tagging (FR-6.1)**:
  - Setiap item inventaris yang diterima gudang wajib diikat pada **`Tag ID Klien`** dan **`ID Pesanan`**.
- **FR-3.3 Blokir Otomatis & Peringatan Anti-Kontaminasi (FR-6.2)**:
  - Saat pengeluaran bahan ke area Cutting, sistem memvalidasi kecocokan `Tag ID Klien` dan `ID Pesanan`. Jika tidak cocok, sistem **memblokir transaksi seketika** dan menampilkan peringatan merah Anti-Kontaminasi.
- **FR-3.4 Cutting Massal & Asumsi Tanpa Sisa Bahan**:
  - Bahan yang cocok dikeluarkan ke area Cutting dan dipotong oleh Tim Cutting (yang diperlakukan setara/sama dengan penjahit). Diasumsikan seluruh bahan terpakai pas sesuai pesanan (**tidak ada sisa kelebihan maupun kekurangan bahan**).

### Fase 4: Lini Produksi (±70 Mesin & Pelacakan 30 Menit Dual-Mode)
- **FR-4.1 Alokasi Dinamis ±70 Mesin (FR-7.1)**: Kepala Produksi / Mandor mengalokasikan penjahit/tim cutting lintas lini paralel hingga ±70 mesin aktif tanpa batas slot kaku.
- **FR-4.2 Input Output per 30 Menit — Dual-Mode Verification (FR-7.3)**:
  - **Jika diinput oleh Mandor**: Status catatan output 30 menit **langsung `Verified` (Terverifikasi)**.
  - **Jika diinput oleh Penjahit/Operator**: Status catatan output 30 menit adalah **`Pending Verification`** dan harus diverifikasi terlebih dahulu oleh Mandor sebelum masuk ke perhitungan gaji.
- **FR-4.3 Gabung Komponen Menjadi 1 Produk Utuh -> `Menunggu QC` (FR-7.4)**:
  - Komponen yang telah selesai digabungkan menjadi **1 produk pakaian utuh**, mengubah statusnya menjadi **`Menunggu QC`**, dan memperbarui Dashboard Owner serta Portal B2B secara *real-time*.

### Fase 5: QC & Barang Jadi (Inspeksi Produk Utuh & Pool Bonus QC)
- **FR-5.1 Inspeksi 1 Produk Utuh di Terminal QC**:
  - QC Inspector memeriksa produk yang sudah dalam bentuk **1 produk utuh** dan menetapkan hasil:
    1. **Lolos (Pass)**: Menambah saldo **Pool Bonus QC** secara otomatis dan masuk ke Barang Jadi.
    2. **Perbaikan (Repair)**: Dikembalikan ke lini produksi untuk diperbaiki.
    3. **Cacat (Reject)**: Mencatat jenis cacat dan mengalihkan rute barang cacat.
- **FR-5.2 Pemisahan Hasil QC dari Gaji Penjahit**:
  - Status `Repair` maupun `Cacat (Reject)` di QC **tidak memengaruhi/memotong gaji borongan penjahit**. Hasil QC murni hanya berpengaruh terhadap akumulasi **Pool Bonus QC**.

### Fase 6: Penggajian & Rekap (Flexible Payroll & Financial Workspace)
- **FR-6.1 Gaji Borongan Mingguan Hari Sabtu (FR-10.1)**:
  - Dihitung setiap hari Sabtu berdasarkan akumulasi output 30 menit berstatus **`Verified`** dikalikan tarif Rate Card (mencakup penjahit & tim cutting, tanpa dipengaruhi status QC):
    $$\text{Upah Borongan} = \sum_{i} \left(\text{Output Verified Komponen } i \times \text{Tarif Komponen } i\right)$$
- **FR-6.2 Uang Makan 10–15% Masuk ke Slip Gaji (FR-10.2)**:
  - Persentase uang makan fleksibel (**10% – 15%**) dikonversi menjadi **uang tunai yang ditambahkan langsung ke dalam Slip Gaji** masing-masing pekerja:
    $$\text{Uang Makan Tunai} = \%\text{Uang Makan} \times \text{Upah Borongan}$$
    $$\text{Total Slip Gaji (THP)} = \text{Upah Borongan} + \text{Uang Makan Tunai}$$
- **FR-6.3 Pembagian Pool Bonus QC (Default 3-Arah + Opsi >2 Mandor) (FR-10.3)**:
  - Akumulasi Pool Bonus QC dari seluruh unit yang lolos QC dibagi rata kepada pengawas produksi.
  - **Asumsi Default Saat Ini**: Dibagi 3 arah ($\frac{1}{3}$ masing-masing) kepada **2 Mandor dan 1 Kepala Operasional**.
  - **Fleksibilitas Sistem**: Disediakan pengaturan jumlah Mandor ($N > 2$) sehingga sistem otomatis membagi pool ke $(N \text{ Mandor} + 1 \text{ Kepala Operasional})$.
- **FR-6.4 Alokasi Overhead Bulanan per Unit (FR-10.4)**:
  - Membagi total biaya operasional bulanan (listrik, air, internet) dengan total unit yang diproduksi pada bulan tersebut.
- **FR-6.5 Penerbitan Invoice & Slip Gaji**:
  - Menerbitkan Slip Gaji (Borongan + Uang Makan 10–15% / Bonus QC) serta Invoice penagihan Klien B2B.


---

## 5. Spesifikasi Fitur AI RAG (`lukla-rag-service/` — Pure Manual RAG Cross-Region)

Untuk kontrol penuh (*higher control*), kemudahan *debugging*, dan keandalan tinggi, fitur kecerdasan buatan mengimplementasikan **Pure Manual RAG** (tanpa OpenSearch Serverless Bedrock yang mahal dan lambat *sync*):

### 5.1 Spesifikasi Teknis `lukla-rag-service` (Pure Manual RAG)
- **Arsitektur Cross-Region AWS Bedrock & Vector Store**:
  - **Embedding Model**: **`amazon.titan-embed-text-v2:0`** di Region **`us-east-1`** (North Virginia) — menghasilkan 1024-dimensi *normalized vector*.
  - **LLM Generator**: **`amazon.nova-lite-v1:0`** di Region **`ap-southeast-1`** (Singapore) — model reasoning & text generation yang cepat, murah, dan cerdas.
  - **Vector Store**: **Supabase PostgreSQL (`pgvector`)** di project `Kelompok_6` dengan fungsi RPC `match_knowledge_chunks` (pencarian semantik *cosine distance*).
- **IAM Policy Cross-Region (`student_6`)**:
  - Dikonfigurasi menggunakan file [`lukla-rag-service/policies/bedrock_student6_cross_region_policy.json`](file:///c:/Workspace/06_Courses_and_Training/Alkademi_Phase3_Offline/Lukla/lukla-rag-service/policies/bedrock_student6_cross_region_policy.json) untuk memberikan hak `bedrock:InvokeModel` di `us-east-1` dan `ap-southeast-1`.
- **Sumber Dokumen**: Dokumen Markdown (`.md`) resmi Lukla (`BRD_V3.md`, `PRD`, `DESIGN_SYSTEM.md`, `Catatan_Asumsi_dan_Aturan_Bisnis_Presentasi.md`).
- **Kontrak API (`main.py`)**:
  - **`POST /ask`**:
    - Request: `{"question": "string", "role": "optional", "client_id": "optional"}`
    - Response: `{"answer": "string", "citations": [{"source": "...", "text": "...", "similarity": 0.85}]}`
  - **`GET /health`**: Mengembalikan status koneksi Bedrock Titan (us-east-1), Nova Lite (ap-southeast-1), dan Supabase vector store.
  - **`POST /ingest`**: Endpoint untuk meng-ingest dokumen baru ke `knowledge_chunks_vector`.

### 5.2 Daftar Kapabilitas AI pada Platform Lukla

| Prioritas | ID Fitur | Nama Fitur AI | Model AWS Bedrock | Pengguna | Deskripsi Fungsional |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **⭐ UTAMA (Core AI)** | **AI-01** | **Tanya Lukla AI Knowledge Assistant (`POST /ask`)** | `amazon.titan-embed-text-v2:0` (`us-east-1`) + `amazon.nova-lite-v1:0` (`ap-southeast-1`) + Supabase `pgvector` | Seluruh 8 Role (Terfilter RBAC & Multi-Tenant) | Pusat tanya-jawab seluruh *knowledge* bisnis dan operasional Lukla:<br/>- Menjawab pertanyaan aturan bisnis, 6 fase BPMN, SOP gudang, dan rumus penggajian lengkap dengan **Citations (Kutipan Dokumen Rujukan)**.<br/>- Menjawab kondisi operasional pabrik sesuai hak akses peran pengguna. |
| **UTAMA** | **AI-02** | **AI Line Balancing & Bottleneck Insight** | `amazon.nova-lite-v1:0` (`ap-southeast-1`) | Kepala Produksi, Mandor, Owner | Menganalisis data output per 30 menit di ±70 mesin jahit untuk mendeteksi komponen penghambat (*bottleneck*) dan memberi saran relokasi penjahit. |
| **UTAMA** | **AI-03** | **AI Payroll & Inventory Anomaly Check** | `amazon.nova-lite-v1:0` (`ap-southeast-1`) | Finance & Payroll, Owner | Memeriksa anomali antara jumlah potongan kain dari *Cutting* dengan klaim output 30 menit penjahit sebelum penggajian hari Sabtu. |


---

## 6. Spesifikasi Tampilan Antarmuka (UI Views) — PC & Mobile

Sesuai daftar tampilan pada BRD V3 ditambah integrasi **Tanya Lukla AI (`POST /ask`)**, berikut adalah rancangan tata letak responsif untuk **PC** dan **Mobile/Tablet**:

1. **Dashboard Utama Operasional (`/` atau `/dashboard`)**
   - **PC**: Grid 4 kartu KPI utama (Mesin Aktif dari ±70, Output Hari Ini, Persentase Lolos QC, Peringatan Anti-Kontaminasi), grafik garis *real-time* kecepatan produksi per 30 menit, status lini paralel, dan tombol akses cepat **Tanya Lukla AI**.
   - **Mobile**: Tampilan kartu vertikal (*stack*), ringkasan status order, dan notifikasi peringatan instan.
2. **Sample & Time Study Tracker (`/samples`)**
   - **PC**: Tabel riwayat versi sampel (`v1`, `v2`), perbandingan perubahan BOM, dan persetujuan konversi ke pesanan massal.
   - **Mobile/Tablet**: Komponen **Digital Stopwatch Besar** (Start, Lap/Split, Reset, Simpan ke Komponen) untuk mengukur waktu jahit langsung di ruang sampel.
3. **Gudang Multi-Klien & Stok (`/warehouse`)**
   - **PC**: Tabel *Multi-Tenant Inventory Grid* dengan *filter badge* per Klien (`Snøhund`, `Klien A`, `Klien B`), form pengajuan/penerimaan PO, dan cetak label QR.
   - **Mobile**: Tombol **Scan QR Bahan & Order** berbasis kamera untuk pengeluaran bahan ke Cutting, dilengkapi layar blokir merah penuh (*Full-Screen Red Block Alert*) jika terdeteksi beda pemilik klien.
4. **Terminal Input 30 Menit & Alokasi Lini (`/production/terminal`)**
   - **Tablet / Touch Kiosk / Mobile**: Peta visual ±70 mesin jahit, pemilih slot waktu 30 menit (`08:00`, `08:30`, `09:00`, dst.), tombol angka ukuran besar (*Touch Numpad*), indikator progres penggabungan komponen, dan tombol **1-Tap Mandor Verify**.
5. **Terminal Inspeksi QC (`/qc/terminal`)**
   - **Tablet / Mobile**: Layar kerja inspeksi cepat dengan 3 tombol raksasa berwarna kontras: **🟢 LOLOS (PASS)**, **🟡 PERBAIKAN (REPAIR)**, **🔴 CACAT (REJECT)**, *chip selector* kategori cacat, dan *live counter* akumulasi Pool Bonus QC.
6. **Workspace Payroll & Biaya (`/payroll`)**
   - **PC (Utama)**: Kalkulator gaji borongan mingguan (hari Sabtu), *slider/input* persentase uang makan fleksibel (10–15%), kartu pembagian otomatis Bonus QC 3-Arah (2 Mandor + 1 Kepala Ops), kalkulator alokasi *overhead* bulanan per unit, serta tombol cetak Slip Gaji & Invoice.
7. **Portal Klien Maklon B2B (`/b2b-portal`)**
   - **PC & Mobile**: Halaman khusus eksternal yang bersih dan terisolasi per klien untuk mengirim spesifikasi sampel, menyetujui skema maklon, memantau *timeline* progres pesanan secara langsung, dan mengecek sisa saldo kain titipan di gudang Lukla.
8. **Panel / Halaman "Tanya Lukla AI" Knowledge Assistant (`/ai-assistant` & Floating Drawer)**
   - **PC & Mobile**: Antarmuka tanya-jawab interaktif yang terhubung langsung ke `lukla-rag-service` (`POST /ask`), menampilkan jawaban AI, kartu **Citations (kutipan dokumen `.md` dari S3)**, serta tombol pertanyaan cepat (*Quick Prompts*) sesuai Role pengguna yang sedang login.

---

## 7. Kriteria Penerimaan (Acceptance Criteria / Skenario UAT)

Sistem dinyatakan siap rilis apabila lulus **4 skenario pengujian wajib BRD** ditambah **1 skenario RAG AWS Bedrock & Multi-Device** berikut:

1. **UAT-01: Proteksi Kontaminasi Silang Stok (FR-6.1 & FR-6.2)**
   - *Skenario*: Staf gudang memilih Pesanan milik **Klien B**, lalu memindai/memilih bahan baku yang memiliki `Tag ID Klien` milik **Klien A** untuk dikeluarkan ke area Cutting.
   - *Hasil yang Diharapkan*: Sistem menolak transaksi seketika (HTTP 403 / Blokir UI), memunculkan peringatan eksplisit ketidakcocokan pemilik, tidak mengurangi stok, dan mencatat insiden di log audit.
2. **UAT-02: Payroll Jumlah Karyawan Dinamis (FR-7.1, FR-7.3, FR-10.1)**
   - *Skenario*: Kepala Produksi menambahkan **5 penjahit baru** pada hari Rabu di mesin #61–#65, menginput dan memverifikasi output 30 menit mereka hingga hari Sabtu, lalu Finance menjalankan kalkulasi gaji hari Sabtu.
   - *Hasil yang Diharapkan*: Sistem menghitung upah borongan mingguan ke-5 penjahit baru tersebut secara akurat sesuai tarif komponen tanpa kendala batas slot karyawan, ditambah kalkulasi % uang makan yang dipilih.
3. **UAT-03: Pembagian Bonus QC 3-Arah (FR-10.3)**
   - *Skenario*: QC Inspector memproses total **3.000 unit** produk berstatus **Lolos QC** dari gabungan berbagai pesanan klien (misal: Rate Bonus QC = Rp 300/pcs -> Total Pool = Rp 900.000).
   - *Hasil yang Diharapkan*: Sistem mengakumulasi total pool Rp 900.000 dengan tepat dan membaginya rata menjadi Rp 300.000 untuk masing-masing penerima (Mandor 1, Mandor 2, dan Kepala Operasional).
4. **UAT-04: Alur Revisi Sampel ke Pesanan Massal Semi-CMT**
   - *Skenario*: Tim Sample membuat Sampel `v1`, ditolak/direvisi menjadi `v2` (dengan perubahan konsumsi bahan dan waktu jahit komponen), `v2` disetujui, lalu dikonversi menjadi Pesanan Produksi Massal dengan skema **Semi-CMT**.
   - *Hasil yang Diharapkan*: Pesanan massal secara otomatis mewarisi seluruh spesifikasi BOM dan studi waktu dari **`v2`**, sementara riwayat `v1` tetap tersimpan utuh dan dapat dilihat di histori sampel.
5. **UAT-05: Integrasi RAG `POST /ask` (`lukla-rag-service`) & Responsivitas PC/Mobile**
   - *Skenario*: Pengguna mengajukan pertanyaan tentang bisnis/SOP Lukla pada fitur *Tanya Lukla AI* (`POST /ask`), serta membuka Terminal 30 Menit dan QC pada *viewport* Mobile (`390x844`) dan Desktop (`1440x900`).
   - *Hasil yang Diharapkan*: Endpoint `/ask` mengembalikan `answer` yang akurat beserta `citations` dari dokumen Markdown di S3 menggunakan `amazon.nova-micro-v1:0`, dan seluruh tampilan nyaman dioperasikan di PC maupun Mobile.


---

## 8. Standar Eksekusi & Jaminan Kualitas "Vibe Code" (Engineering Requirements)

Berdasarkan [Tips untuk Vibe Code.md](file:///c:/Workspace/06_Courses_and_Training/Alkademi_Phase3_Offline/Lukla/Tips%20untuk%20Vibe%20Code.md), proses pembangunan hingga perilisan aplikasi **Lukla Operations Engine** wajib memenuhi 5 standar otomatisasi berikut:

1. **Skill UI for Front-End (Design System Markdown)**:
   - Sebelum menulis komponen UI, sistem desain visual (`DESIGN_SYSTEM.md`) diekstrak dari referensi visual pilihan pengguna agar seluruh halaman (baik **PC Dashboard/B2B Portal** maupun **Mobile/Tablet Touch Terminal**) tampil seragam, presisi, dan berkelas produksi.
2. **Context7 (Dokumentasi & Library Versi Terbaru)**:
   - Seluruh dependensi utama (**Next.js App Router**, **Supabase SSR & JS Client**, **Tailwind CSS**, **AWS SDK v3 Bedrock Runtime**, dan **Playwright**) wajib mengacu pada dokumentasi terbaru agar bebas dari kode usang (*deprecated API*) yang memicu *runtime error*.
3. **Supabase Plugin / MCP (Otomatisasi Database & Multi-Tenant Backend)**:
   - Pembuatan tabel, relasi *foreign key*, fungsi RPC untuk validasi Anti-Kontaminasi (`FR-6.1/6.2`), kebijakan **Row-Level Security (RLS)** untuk 8 role RBAC, dan *TypeScript types* dilakukan langsung melalui **Supabase Plugin / MCP** serta diverifikasi menggunakan *Supabase Security & Performance Advisors*.
4. **Playwright CLI (Automated E2E Browser Testing)**:
   - Setiap tombol, form input, dan kelima skenario **UAT-01 s/d UAT-05** diuji secara otomatis menggunakan **Playwright CLI** pada *viewport* PC (`1440x900`) dan Mobile/Tablet (`390x844` & `768x1024`) sehingga aplikasi dapat di-*ship* dengan cepat tanpa pengujian manual berjam-jam.
5. **Strix (Automated Security & Penetration Testing)**:
   - Aplikasi wajib lulus pengujian keamanan agresif menggunakan **Strix** untuk memastikan tidak ada celah:
     - **Kebocoran Data Multi-Tenant (IDOR / Cross-Client Leak)** antara Klien A, Klien B, dan Snøhund.
     - **Bypass Aturan Anti-Kontaminasi Gudang (FR-6.2)** melalui manipulasi API langsung.
     - **Eskalasi Hak Akses (Privilege Escalation)** antar-8 peran RBAC (misal: Penjahit memodifikasi status verifikasi Mandor atau Rate Card).
     - **Prompt Injection** pada asisten AI AWS Bedrock.
