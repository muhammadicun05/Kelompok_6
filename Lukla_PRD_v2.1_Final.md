# Product Requirement Document (PRD) — Versi 2.1 Final
## Lukla Operations Engine

| Atribut Dokumen | Rincian |
|---|---|
| **Nama Produk** | Lukla Operations Engine |
| **Domain Prototipe** | **Manufaktur Tas & Ransel Taktikal Outdoor** (*Tactical Backpacks & Roll-Top Bags*) |
| **Kapasitas Operasional** | ±70 Mesin Jahit Aktif (Lini A: #1–#25, Lini B: #26–#50, Lini C: #51–#70) |
| **Versi Dokumen** | **2.1 Final (Pembaruan QA Tahap 1: Pak Harry & Mbak Rini)** |
| **Penyusun** | Tim Kelompok 6 — Alkademi Offline Phase 3 |
| **Tanggal Efektif** | 15 Oktober 2026 |
| **Status Dokumen** | **Disetujui & Terkunci untuk Implementasi Platform (v2.1)** |

---

## 1. Visi Produk & Sasaran Arsitektur (PRD-01)

**Lukla Operations Engine** adalah platform operasi manufaktur terpadu yang dirancang khusus untuk fasilitas produksi tas dan perlengkapan teknikal luar ruang (*backpack & outdoor gear*), mengintegrasikan:
1. **Fase 1 — Sampel & Studi Waktu**: Stopwatch digital per komponen ransel (Panel Depan, Panel Belakang, Tali Bahu, Webbing Molle, Assembly Utuh), versioning spesifikasi sampel (`v1` s/d `vN`), dan pemilih sampel aktif `[⏱️ Pilih & Uji]`.
2. **Fase 2 — Persetujuan Owner & Pesanan Massal**: Penerbitan draft pesanan massal oleh Sampler, verifikasi & persetujuan tunggal Owner di Dashboard sebelum pesanan resmi aktif, serta penguncian Rate Card komersial dan tarif borongan pekerja.
3. **Fase 3 — Gudang & Anti-Kontaminasi**: Validasi fisik penerimaan bahan baku (Cordura 1000D, Ripstop Nylon), pelabelan QR *Mandatory Client Tagging* (FR-6.1), serta pemblokiran otomatis (HTTP 403) di pintu meja potong (*Cutting*) bila terjadi ketidakcocokan tag klien dan ID pesanan (FR-6.2).
4. **Fase 4 — Lini Produksi & Input 30 Menit**: Matriks alokasi penjahit lintas ±70 mesin, terminal input output per interval 30 menit (Dual-Mode: Penjahit = *Pending*, Mandor = *Verified*), antrean FIFO perakitan ransel utuh (*Assembly*), serta pemicu data real-time saat produk utuh selesai dirakit.
5. **Fase 5 — Quality Control (QC) Produk Utuh**: Terminal inspeksi tas ransel utuh dengan antrean FIFO (*Waiting Inspection Queue*), 3 tombol sentuh raksasa (`LOLOS`, `PERBAIKAN`, `CACAT`), akumulasi saldo Pool Bonus QC (+Rp 300/unit), serta aturan pencegahan bonus ganda pada tas hasil perbaikan ulang (*re-inspection*).
6. **Fase 6 — Penggajian & Finance**: Perhitungan otomatis slip gaji borongan mingguan hari Sabtu (`THP = Borongan + Uang Makan Tunai 10–15%`), pembagian rata Pool Bonus QC 3-Arah (2 Mandor + 1 Kepala Operasional), alokasi biaya overhead bulanan per unit, dan penerbitan invoice penagihan klien B2B.
7. **Portal Klien B2B & RAG AI Knowledge Assistant**: Portal monitoring terisolasi ketat per klien (*Zero Data Leakage*) dan chatbot tanya-jawab operasional berbasis Cross-Region AWS Bedrock + Supabase pgvector.

---

## 2. Matriks 8 Peran RBAC & Otoritas Akses (PRD-04)

Platform mengimplementasikan 8 peran pengguna dengan batasan akses ketat:

| Kode Peran | Nama Peran | Target Perangkat | Hak Akses Utama | Batasan & Keamanan |
| :-: | :--- | :--- | :--- | :--- |
| **R1** | `OWNER` | PC & Mobile | Dashboard eksekutif, persetujuan pesanan massal (Owner Approval), pengaturan Rate Card, variabel sistem (% uang makan, rate bonus QC). | Tidak dapat mengubah transaksi yang sudah terverifikasi di masa lampau. |
| **R2** | `SAMPLE_TEAM` | Mobile & PC | Pendaftaran intake sampel klien, stopwatch SMV & BOM komponen ransel, versioning `v1` s/d `vN`, draft pesanan massal. | Tidak dapat mengesahkan pesanan massal tanpa approval Owner. |
| **R3** | `WAREHOUSE` | Mobile QR & PC | Penerimaan bahan, cetak QR Client Tag (FR-6.1), validasi anti-kontaminasi (FR-6.2), operasional pemotongan bahan di meja cutting. | Diblokir mutlak oleh sistem jika `client_id` bahan tidak cocok dengan pesanan target. |
| **R4** | `PRODUCTION_HEAD_MANDOR` | Tablet & PC | Matriks alokasi penjahit (±70 mesin), input output 30m (langsung `Verified`), verifikasi 1-tap output penjahit, monitor antrean FIFO assembly. | Berada di atas penjahit; tidak dapat mengubah tarif gaji borongan. |
| **R5** | `TAILOR_OPERATOR` | Touch Numpad / Mobile | Melihat tugas mesin, input output 30m via numpad sentuh (berstatus `Pending Verification`), mengambil bundle perakitan FIFO. | Wajib menunggu verifikasi Mandor sebelum output masuk ke rekap gaji. |
| **R6** | `QC_INSPECTOR` | Tablet / Mobile | Memeriksa tas ransel utuh dari antrean FIFO, tombol sentuh PASS / REPAIR / REJECT, penandaan kategori cacat teknikal ransel. | Hanya menginspeksi tas ransel utuh; tidak memeriksa komponen lepasan. |
| **R7** | `FINANCE_PAYROLL` | PC Desktop | Rekapitulasi payroll mingguan hari Sabtu, cetak slip gaji tunai, perhitungan overhead bulanan, penerbitan invoice termin. | Menghitung gaji murni dari output terverifikasi (*no clawback* hasil QC). |
| **R8** | `B2B_CLIENT` | PC & Mobile Portal | Melihat timeline 6 fase produksi pesanan miliknya, saldo kain Cordura/Ripstop titipan di gudang Lukla, dan PO komitmen CMT. | **Terisolasi ketat via RLS (Row Level Security)** hanya pada `client_id` miliknya sendiri. |

---

## 3. Fitur Utama Hasil Penyempurnaan QA Tahap 1

### 3.1. Pemilih Sampel Aktif & Digital Stopwatch (Pak Harry Point 1)
- Halaman `/samples` dilengkapi daftar sampel aktif (*Sample List Drawer*) dengan tombol **`[⏱️ Pilih & Uji Stopwatch]`**.
- Memuat spesifikasi sampel terpilih ke dalam studio stopwatch secara instan.
- Mendukung versioning riwayat revisi (`v1`, `v2`, `vN`) tanpa menimpa histori sebelumnya.
- Komponen tas standar: *Panel Depan & Saku Organizer*, *Panel Belakang & Busa Tali Bahu*, *Webbing Molle & Buckle Acetal*, *Assembly Ransel Utuh & Resleting YKK*.

### 3.2. Antrean Persetujuan Pesanan Massal oleh Owner (Pak Harry Point 2)
- Saat Sampler mengeklik tombol **`[🚀 Terbitkan Pesanan Massal]`**, pesanan dibuat dalam status `PENDING_OWNER_APPROVAL`.
- Pesanan muncul pada kartu khusus di halaman `/dashboard`: **"🚨 Antrean Persetujuan Pesanan Massal (Wewenang Tunggal Owner)"**.
- Owner memiliki 2 tombol wewenang mutlak:
  - **`[✅ Setujui & Kunci Pesanan]`**: Mengubah status menjadi `ACTIVE`, mengunci Rate Card, dan meneruskan instruksi kerja ke Gudang & Lini Jahit.
  - **`[❌ Tolak Order]`**: Membatalkan penerbitan pesanan massal.

### 3.3. Matriks Alokasi Penjahit ±70 Mesin (Pak Harry Point 3)
- Halaman `/production/terminal` dilengkapi tombol dan modal interaktif: **`[👥 Alokasi Penjahit (±70 Mesin)]`**.
- Wewenang Mandor & Kepala Operasional untuk menetapkan:
  - Nomor Mesin Jahit (#1 s/d #70 lintas Lini A, B, C).
  - Nama Penjahit (Siti Aminah, Rina Wulandari, Budi Santoso, dst.).
  - Target Pesanan (`ORD-2026-004`).
  - Komponen Ransel yang ditugaskan.
- Saat nomor mesin diklik pada denah 70 mesin, sistem otomatis memuat penjahit, pesanan, dan komponen yang telah dialokasikan.

### 3.4. Antrean FIFO Inspeksi QC & Penanganan Re-Inspeksi (Pak Harry Point 4)
- Halaman `/qc/terminal` dilengkapi panel: **"📋 Daftar Antrean Tas Utuh Menunggu Inspeksi (FIFO Inspection Queue)"**.
- Menampilkan seluruh tas ransel hasil perakitan assembly (`BAG-SNO-1001` s/d `BAG-SNO-1005`) dengan jam masuk dan stasiun asal.
- Klik pada item antrean langsung memuat nomor seri tas ke stasiun inspeksi.
- **Logika Re-Inspeksi Unit Perbaikan**:
  - Unit ransel yang dikembalikan dari status `REPAIR` ditandai dengan flag `isReinspection: true`.
  - Jika unit hasil perbaikan tersebut dinyatakan `PASS (LOLOS)`, sistem mengizinkan pengalihan ke gudang barang jadi **TANPA menambah saldo Pool Bonus QC untuk kedua kalinya (+Rp 0)**, guna menjamin integritas finansial dan mencegah manipulasi penggandaan bonus.

---

## 4. Keamanan & Jaminan Rekayasa (PRD-02 & PRD-03)

1. **Target Pengujian E2E Playwright**: Ditargetkan 42 skenario E2E mencakup seluruh siklus 6 fase produksi, responsivitas terminal pada 3 viewport (PC `1440x900`, Tablet `768x1024`, Mobile `390x844`), serta validasi batas sentuh $\ge 48\text{px}$.
2. **Hardening Keamanan Multi-Tenant**:
   - Isolasi data B2B Client menggunakan PostgreSQL Row Level Security (RLS) berbasis `auth.uid()` dan `client_id`.
   - Validasi anti-kontaminasi stok dieksekusi melalui SQL Stored Procedure (`issue_inventory_with_contamination_check`) dengan penolakan keras (HTTP 403 Forbidden).
   - Layanan AI Knowledge Assistant (`/api/ai/ask`) memvalidasi sesi otorisasi sebelum melakukan pencarian vektor pgvector terisolasi.
