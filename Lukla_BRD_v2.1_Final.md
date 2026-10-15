# Business Requirement Document (BRD) — Versi 2.1 Final
## Lukla Operations Engine

| Atribut Dokumen | Rincian |
|---|---|
| **Nama Proyek** | Lukla Operations Engine |
| **Organisasi & Fasilitas** | Lukla Manufacturing (Ciwidey, Kab. Bandung) & Merek Internal **Snøhund** |
| **Kapasitas Operasional** | ±70 Mesin Jahit Aktif (Alokasi Dinamis Lintas Lini A, B, C) |
| **Model Bisnis** | Multi-Tenant (Merek Internal Snøhund Made-to-Order & Klien Maklon B2B Eksternal) |
| **Produk Prototipe** | **Tas & Ransel Taktikal Outdoor** (*Snøhund Alpine Tactical Backpack 35L* & *Urban Commuter Roll-Top 25L*) |
| **Versi Dokumen** | **2.1 Final (Diselaraskan dengan QA Tahap 1: Pak Harry & Mbak Rini)** |
| **Penyusun** | Tim Kelompok 6 — Alkademi Offline Phase 3 |
| **Tanggal Efektif** | 15 Oktober 2026 |
| **Status Dokumen** | **Disetujui & Terkunci untuk Evaluasi Tahap 1 (v2.1)** |

---

## 1. Ringkasan Eksekutif & Latar Belakang Bisnis (BRD-01)

**Lukla Manufacturing** mengoperasikan fasilitas manufaktur perlengkapan luar ruang (*outdoor gear & bag manufacturing*) semi-padat karya di Ciwidey, Kabupaten Bandung, dengan kapasitas lantai produksi mencapai **±70 mesin jahit aktif**. Pabrik ini menjalankan dua pilar model operasi simultan (*multi-tenant*):
1. **Merek Internal Snøhund**: Lini tas & ransel outdoor teknikal premium (*made-to-order*) dengan bahan Cordura 1000D, Ripstop Nylon, ritsleting *waterproof* YKK, dan *buckle* asetal, diproduksi menggunakan skema **Full Package**.
2. **Klien Maklon B2B Eksternal**: Penyedia jasa potong, jahit, perakitan (*assembly*), dan penjaminan mutu (*quality control*) tas untuk berbagai jenama dan korporasi pihak ketiga menggunakan skema **CMT**, **Semi-CMT**, maupun **Full Package**.

Sebelum digitalisasi melalui **Lukla Operations Engine**, lantai pabrik menghadapi 4 titik rawan operasional (*operational pain points*):
- **Risiko Kontaminasi Silang Stok (Cross-Contamination Risk)**: Tercampurnya kain roll teknikal (Cordura, Ripstop) titipan klien eksternal dengan material milik klien lain atau merek Snøhund saat proses pengeluaran ke meja potong (*Cutting*).
- **Friksi Penggajian Borongan Mingguan**: Fluktuasi jumlah penjahit harian, lambatnya rekap kertas pencatatan output per 30 menit, perdebatan pemotongan upah akibat barang cacat QC, dan perhitungan uang makan tunai.
- **Ketiadaan Versioning Sampel & Riwayat Studi Waktu**: Hilangnya riwayat revisi spesifikasi sampel (`v1` ke `vN`) dan tidak akuratnya estimasi waktu baku (*Standard Minute Value* / SMV) serta konsumsi bahan (*Bill of Materials* / BOM).
- **Keterbatasan Visibilitas Real-Time Klien Maklon**: Klien B2B tidak memiliki akses mandiri untuk memantau status pengerjaan pesanan dan saldo bahan titipannya.

---

## 2. 10 Asumsi & Aturan Bisnis Resmi (Diselaraskan QA Tahap 1)

| No | Topik / Area | Aturan Bisnis Terkunci (v2.1) | Justifikasi Bisnis & Operasional Lantai Pabrik |
| :-: | :--- | :--- | :--- |
| **1** | **Gaji Borongan vs Status QC (BRD-02)** | **Gaji borongan penjahit TIDAK terpengaruh oleh status barang QC (*No Clawback*).** | Penjahit dibayar penuh berdasarkan akumulasi output komponen 30 menit yang telah disahkan (`Verified`) oleh Mandor / Kepala Produksi, termasuk stasiun *Assembly* (perakitan ransel utuh) yang diperlakukan sebagai komponen borongan berbayar. Status *Repair* atau *Cacat/Reject* di QC tidak memotong upah penjahit. |
| **2** | **Fungsi Terminal QC (BRD-03)** | **Hasil QC HANYA berpengaruh terhadap Pool Bonus QC.** | Terminal QC murni berfungsi sebagai pintu penjaminan mutu barang jadi (*Quality Gate*). Setiap 1 unit tas ransel utuh yang dinyatakan **`LOLOS (PASS)`** menambah saldo kas **Pool Bonus QC** (+Rp 300/unit sebagai parameter ilustrasi) yang dialokasikan bagi pengawas produksi. |
| **3** | **Uang Makan Fleksibel (BRD-12)** | **Uang makan (10–15%) dicairkan sebagai uang tunai dan masuk langsung ke Slip Gaji penjahit.** | Persentase uang makan (10% hingga 15% variabel dari total upah borongan periode terkait) dihitung sebagai tunjangan tunai transparan di slip gaji mingguan hari Sabtu: $\text{Take Home Pay (THP)} = \text{Upah Borongan} + \text{Uang Makan Tunai}$. |
| **4** | **Bentuk Fisik Objek di Meja QC (BRD-04)** | **Inspeksi QC dilakukan HANYA pada 1 produk tas ransel utuh (Barang Jadi).** | QC Inspector tidak memeriksa per komponen lepasan (seperti saku/tali bahu saja), melainkan produk tas ransel utuh hasil penggabungan stasiun perakitan akhir (*Assembly*). Pengecekan per 30 menit di lini adalah verifikasi Mandor, bukan QC. |
| **5** | **Alur Dokumen Komitmen & PO (BRD-05)** | **Membedakan tegas 3 jenis dokumen: PO Komitmen Klien CMT, PO Pengadaan Supplier, dan Production Order.** | - **PO Komitmen Klien (CMT)**: Surat komitmen & pengingat jadwal pengiriman bahan titipan.<br>- **PO Supplier (Semi-CMT/Full Package)**: Dokumen pengadaan material/aksesori oleh Lukla.<br>- **Production Order (SPK)**: Perintah kerja resmi lantai pabrik dengan ID unik (`ORD-YYYY-XXX`). |
| **6** | **Hirarki Pengawas & Penerima Bonus (BRD-06)** | **MVP mengunci pembagian rata 3-Arah: 2 Mandor + 1 Kepala Operasional (Masing-masing 33,33%).** | Secara struktural Kepala Produksi/Operasional berada di atas Mandor. Untuk MVP, total saldo Pool Bonus QC dibagi rata kepada 3 personel pengawas tetap. |
| **7** | **Dual-Mode Input Output 30 Menit (BRD-07)** | **Input oleh Mandor/Kepala Ops -> Langsung `Verified`. Input oleh Penjahit -> Berstatus `Pending Verification` (Wajib disahkan Mandor).** | Mendukung fleksibilitas pabrik Ciwidey: Mandor/Kepala Produksi dapat berkeliling membawa tablet (langsung sah), atau penjahit menginput mandiri via kiosk terminal lantai (memerlukan tombol *1-Tap Approve* Mandor sebelum masuk rekap gaji). |
| **8** | **Operasional Pemotongan Bahan (BRD-08)** | **Pemotongan kain/bahan teknikal dilakukan langsung oleh Personil Tim Gudang.** | Setelah bahan baku (Cordura, Ripstop) lolos validasi anti-kontaminasi FR-6.2 di pintu gudang, proses pemotongan pola komponen tas dilakukan langsung oleh personil Tim Gudang sebelum bundle potongan diserahkan ke penjahit lini. |
| **9** | **Toleransi Sisa Bahan Titipan (BRD-09)** | **Diasumsikan TIDAK ADA sisa bahan titipan (*Zero Remnant / Zero Shortage*) untuk perhitungan order aktif.** | Seluruh bahan baku yang dikeluarkan ke cutting diasumsikan terkonversi pas sesuai kuantitas pesanan massal. Pelacakan saldo sisa roll di gudang dilakukan pada level batch inventory. |
| **10** | **Wewenang Sampler & Persetujuan Owner (BRD-10)** | **Sampler menyusun draft order dari versi sampel yang disetujui (`Approved vN`), Owner menyetujui, lalu Production Order resmi diterbitkan.** | Sampler memegang wewenang intake spesifikasi sampel, uji stopwatch SMV & BOM. Saat versi sampel disetujui (`Approved vN`), Sampler menerbitkan draft pesanan massal. Draft tersebut masuk ke antrean approval Owner di Dashboard. Setelah disetujui Owner, pesanan massal resmi aktif dan Rate Card terkunci. |

---

## 3. Cakupan Model Bisnis & 3 Skema Maklon (BRD-07)

Sistem mengakomodasi 3 skema manufaktur pada setiap pesanan:

1. **CMT (Cut, Make, Trim)**:
   - Klien maklon menyediakan 100% bahan baku utama (kain Cordura/Ripstop) dan bahan pendukung.
   - Lukla menyediakan jasa tenaga kerja potong, jahit komponen, perakitan tas utuh, dan finishing.
   - Sistem menerbitkan **Surat Komitmen / Reminder CMT** langsung ke Klien Maklon, kemudian menerima Surat Jalan Titipan Klien di gudang tanpa mencatatnya sebagai pembelian bahan oleh Lukla.
2. **Semi-CMT**:
   - Bahan baku utama kain teknikal dititipkan oleh klien maklon.
   - Bahan pendukung, benang nilon, ritsleting YKK, dan *buckle* asetal diadakan oleh Lukla melalui **Purchase Order Supplier** resmi.
3. **Full Package (CMT + Bahan)**:
   - Lukla bertanggung jawab atas 100% pengadaan kain, benang, aksesori, hingga proses produksi tas utuh siap kirim.
   - Menjadi skema standar mutlak untuk seluruh lini produk internal **Snøhund**.

---

## 4. Pemisahan Harga Komersial vs Tarif Borongan Internal (BRD-11)

Sistem membedakan secara tegas dua struktur tarif:
1. **Harga Komersial Jasa Maklon (Client Facing)**: Tarif pemotongan, penjahitan, dan bahan yang disepakati bersama Klien B2B dan tercantum pada Surat Penawaran / Invoice (misal: Jasa Jahit Ransel Rp 18.500/pcs).
2. **Tarif Borongan Komponen Internal (Worker Facing)**: Tarif satuan yang ditetapkan Owner untuk dasar penggajian penjahit di Finance (misal: Panel Depan Rp 2.500/pcs, Tali Bahu Rp 2.000/pcs, Assembly Ransel Rp 6.000/pcs). Klien B2B **TIDAK memiliki akses** terhadap data tarif borongan internal ini.

---

## 5. Ringkasan Kepatuhan & Jaminan Integritas (BRD-13 & BRD-14)

1. **Pencegahan Kontaminasi Silang Stok (FR-6.2)**: 100% skenario pengeluaran bahan yang tidak sesuai antara pemilik bahan (`client_id`) dan pesanan target (`order_id`) wajib ditolak seketika (HTTP 403) dan dicatat ke dalam audit log insiden.
2. **Integritas Penggajian Borongan**: Seluruh nominal pada slip gaji penjahit hari Sabtu dihitung secara otomatis dari log output 30 menit berstatus `Verified`, bebas dari intervensi manual atau pemotongan sepihak.
3. **Pengendalian Bonus QC Tanpa Duplikasi**: Unit ransel berstatus `Repair` yang masuk inspeksi ulang (*re-inspection*) dan dinyatakan lolos **TIDAK menambah saldo bonus QC untuk kedua kalinya**, guna mencegah manipulasi penggandaan bonus.
