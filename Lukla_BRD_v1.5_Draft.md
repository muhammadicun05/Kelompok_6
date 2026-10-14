# Business Requirement Document (BRD)

## Lukla Operations Engine

| Informasi Dokumen | Detail |
|---|---|
| Nama Proyek | Lukla Operations Engine |
| Product Owner | Tim Operasional Lukla Manufacturing & Manajemen Merek Snøhund |
| Tim | Kelompok 6 |
| Revisi | 1.5 — Penyelarasan alur order, material, payroll, tarif, dan batas costing |
| Dokumen acuan | BRD v1.4 Draft, BRD v1.0/V3, SRS Walkthrough v2.0 (12 Oktober 2026), serta hasil review kelompok hingga 14 Oktober 2026 |
| Status | Draft kerja v1.5 untuk review kelompok; belum merupakan validasi formal stakeholder Lukla |

> **Catatan status:** Revisi ini mempertahankan struktur BRD v1.4 dan memperbarui hanya bagian yang terdampak hasil review. Keputusan yang belum dikonfirmasi kepada stakeholder Lukla tetap ditandai sebagai asumsi atau keputusan terbuka. Persyaratan AI wajib dimasukkan karena merupakan ketentuan hackathon; bantuan estimasi material/waktu dan SOP Knowledge Assistant adalah lingkup AI yang dibahas untuk MVP, dengan batasan yang dijelaskan pada bagian terkait.

---

## 1. Ringkasan Bisnis

Lukla Manufacturing mengoperasikan fasilitas produksi garmen di Ciwidey dengan kapasitas dinamis hingga sekitar 70 mesin jahit aktif. Fasilitas menangani pesanan merek internal Snøhund dan pesanan maklon B2B dari klien eksternal secara paralel.

Lukla Operations Engine merupakan platform operasional yang menghubungkan pengelolaan permintaan dan revisi sampel, Production Order, inventaris multi-klien, pencatatan produksi, quality control (QC), payroll buruh jahit, ringkasan biaya operasional, invoice, dan pemantauan pesanan oleh klien.

Proyek juga wajib menyertakan AI sesuai ketentuan hackathon. Lingkup AI yang dibahas meliputi **bantuan estimasi material/waktu pada workspace peran terkait** berdasarkan Sample BOM, kuantitas order, dan time study yang tersedia, serta **internal SOP Knowledge Assistant** berbasis dokumen yang disetujui. Rumus estimasi harus transparan dan hasilnya dapat ditelusuri. AI tidak mengakses transaksi real-time, menyetujui atau mengubah data bisnis, maupun menetapkan harga komersial. Costing end-to-end dan rekomendasi harga/margin kepada klien bukan bagian MVP.

## 2. Konteks Bisnis dan Skema Maklon

Sistem harus mendukung tiga skema kerja sama berikut pada pesanan eksternal:

1. **CMT (Cut, Make, Trim):** klien menyediakan seluruh bahan baku; Lukla menyediakan jasa cutting, jahit, dan finishing.
2. **Semi-CMT:** klien menyediakan bahan utama; Lukla menyediakan bahan pendukung dan aksesori.
3. **Full Package (CMT + Bahan):** Lukla menyediakan bahan baku dan jasa produksi. Skema ini juga menjadi standar pesanan internal Snøhund.

### 2.1 Sumber Pesanan

**Pesanan maklon eksternal (B2B):** klien dapat mengajukan permintaan sampel khusus. Jika sample dan spesifikasi yang disepakati telah berstatus Approved dan klien ingin melanjutkan, klien meminta Production Order kepada Sampler. Sampler menyiapkan draft untuk diajukan kepada Owner; persetujuan sample tidak otomatis membuat Production Order yang disetujui.

**Pesanan internal Snøhund:** sistem mendukung model *made to order*. Untuk desain yang sudah memiliki referensi produk atau sampel display internal yang disetujui, pengguna dapat memakai referensi tersebut tanpa membuat permintaan sampel khusus baru selama spesifikasi tidak berubah. Desain baru atau perubahan spesifikasi yang memerlukan sampel mengikuti proses sampel dan revisi. Pesanan internal menggunakan Full Package sebagai skema standar.

### 2.2 Pemisahan Identitas Data

- **Client Record / Client ID:** catatan identitas dan informasi bisnis klien yang dibuat saat klien melakukan registrasi awal. Ini bukan akun login.
- **User Account:** akun login portal yang baru dibuat/diaktifkan setelah Production Order pertama klien disetujui Owner; akun dihubungkan ke Client ID.
- **Sample Request ID:** identitas permintaan/pengerjaan sampel; keberadaannya tidak otomatis membentuk Production Order.
- **Sample Version ID:** identitas versi spesifikasi sampel yang direvisi dan disetujui; setiap versi lama tetap tersimpan.
- **Internal Product/Style ID:** identitas referensi produk internal Snøhund yang dapat digunakan untuk pemesanan berulang.
- **Production Order ID:** identitas order produksi yang telah disetujui Owner dan siap diteruskan ke persiapan operasional.
- **Stock/Material Tag:** identitas pelacakan material atau inventaris yang terkait dengan pemilik dan penggunaan yang diizinkan.

Client Record dapat ada sejak sebelum sample dibuat meskipun belum ada login portal. Sample Request ID dan Sample Version ID tetap dipertahankan sebagai histori. Production Order menggunakan ID terpisah yang merujuk ke sample/versi sumber; ID sample tidak ditimpa atau diganti saat order dibuat. Pemisahan ID ini menjaga keterlacakan dari sample sampai order.

## 3. Pernyataan Masalah

1. **Risiko kontaminasi silang stok:** bahan mentah, barang dalam proses (WIP), dan barang jadi milik berbagai klien dikelola bersama sehingga terdapat risiko material atau barang milik Klien A digunakan untuk pesanan Klien B.
2. **Payroll kompleks dan tenaga kerja dinamis:** jumlah penjahit dapat berubah mengikuti volume pesanan. Penghitungan upah borongan mingguan berdasarkan output 30 menit, bonus QC bersama, uang makan, dan overhead membutuhkan pencatatan yang akurat serta dapat ditelusuri.
3. **Kurangnya pelacakan dan histori revisi:** spesifikasi sampel, estimasi bahan, studi waktu, serta catatan cacat belum memiliki riwayat digital terpusat yang memadai.
4. **Akses informasi operasional:** pengguna perlu memperoleh informasi mengenai SOP dan aturan operasional secara konsisten. Dalam proyek hackathon, kebutuhan ini juga menjadi dasar usulan asisten AI berbasis dokumen.

## 4. Tujuan Bisnis

- Mengurangi risiko pencampuran inventaris lintas klien dan lintas pesanan.
- Mendukung kapasitas produksi dinamis dari 1 hingga sekitar 70 mesin jahit aktif.
- Menyediakan pencatatan output produksi per 30 menit yang dapat ditelusuri.
- Mempertahankan histori versi sampel dan menghubungkannya dengan Production Order.
- Mendukung estimasi sederhana kebutuhan bahan dan total kandungan kerja dari sample BOM/time study bila data tersedia.
- Menghitung upah borongan buruh jahit berdasarkan output komponen terverifikasi dan tarif per komponen.
- Mendukung ringkasan dana makan, pool bonus QC, dan overhead sederhana dengan formula yang dapat ditelusuri.
- Memungkinkan klien eksternal memantau pesanan dan stok bahan titipannya sesuai batas akses.
- Memenuhi persyaratan AI hackathon dengan asisten pengetahuan operasional berbasis dokumen.

## 5. Alur Bisnis Utama

### 5.1 Registrasi Klien dan Permintaan Sampel

1. Klien yang berminat menggunakan jasa maklon melakukan registrasi data klien. Sistem membuat atau memperbarui **Client Record / Client ID** berisi informasi bisnis/kontak yang diperlukan.
2. Registrasi awal tersebut **tidak membuat akun login portal**. Klien belum dapat login atau mengakses portal selama tahap sample.
3. Sampler membuat Sample Request dan Sample Request ID, kemudian mengoordinasikan pembuatan sample. Tim Sample mencatat spesifikasi, daftar komponen, Sample BOM/pemakaian bahan, time study per komponen, dan catatan revisi.
4. Klien mengevaluasi sample. Revisi dicatat sebagai versi baru; versi lama tidak boleh ditimpa.
5. Setelah klien dan Lukla mencapai kesepakatan/deal mengenai sample, spesifikasi, dan ketentuan harga/komersial terkait, Sampler menandai sample version yang disepakati sebagai `Approved` di sistem.
6. Jika kesepakatan tidak tercapai atau klien tidak melanjutkan, Sample Request dapat ditutup dengan histori tetap tersimpan; akun portal dan Production Order tidak dibuat.
7. Setelah sample berstatus Approved, klien dapat meminta Production Order kepada Sampler.

Untuk sample display/internal Snøhund yang telah disetujui dan spesifikasinya tidak berubah, Production Order dapat merujuk ke Internal Product/Style ID atau versi referensi yang sesuai tanpa membuat permintaan sample khusus baru.

### 5.2 Pembuatan, Approval Owner, dan Aktivasi Akun Klien

1. Setelah sample/versi yang relevan disetujui dan klien meminta produksi massal, Sampler membuat draft Production Order yang memuat Client ID atau referensi produk internal, Sample Request ID dan Sample Version ID sumber bila relevan, skema maklon, kuantitas, rincian ukuran bila berlaku, harga/ketentuan komersial yang tersedia atau telah disepakati, dan target waktu. Draft tersebut kemudian diajukan kepada Owner untuk ditinjau dan disetujui atau ditolak.
2. Owner adalah **satu-satunya role dengan tombol approval Production Order di sistem**. Sebelum memberi keputusan, Owner dapat berkonsultasi dengan Kepala Produksi mengenai kelayakan kapasitas/timeline; konsultasi tersebut tidak menjadi approval sistem terpisah oleh Kepala Produksi.
3. Jika Owner menolak, sistem mencatat `Rejected by Owner` dan alasan/waktu keputusan. Tidak ada akun portal baru yang dibuat, dan order tidak boleh masuk ke produksi. Client Record serta histori sample tetap tersimpan.
4. Jika Owner menyetujui, sistem mengubah order ke status `Approved/Accepted` dan menghubungkannya ke Sample Request ID dan Sample Version ID yang disetujui.
5. Setelah approval Owner, Sampler membuat atau mengaktifkan User Account untuk klien eksternal jika akun portal belum tersedia, lalu mengaitkannya dengan Client ID. Akun tidak dibuat saat registrasi awal maupun tahap sample. Order Snøhund internal tidak memerlukan akun klien eksternal.
6. Setelah approval, Kepala Produksi meninjau detail Production Order, membedah/memetakan komponen produk, menyiapkan urutan proses/assembly dan kebutuhan lini, lalu meneruskan ke persiapan material dan produksi sesuai kesiapan operasional.
7. Untuk menjaga histori, Production Order menggunakan ID tersendiri dan tetap merujuk ke Sample Request ID serta Sample Version ID sumber. ID sample tidak diganti atau ditimpa.

### 5.2.1 Status Order Minimum

- `Draft` - Sampler menyusun draft Production Order.
- `Pending Owner Approval` - draft sudah diajukan dan menunggu keputusan Owner.
- `Approved/Accepted` - Owner menyetujui order setelah kesepakatan komersial tercapai.
- `Rejected by Owner` - Owner menolak; order tidak dapat memulai produksi.

Jika penawaran/harga belum disepakati, order belum boleh diajukan untuk final approval sebagai deal. Perubahan material terhadap harga, kuantitas, skema, atau timeline setelah approval membutuhkan review ulang sesuai aturan yang disepakati.

### 5.3 Persiapan Material Berdasarkan Skema

- **CMT:** material utama disediakan klien; sistem mencatat penerimaan bahan titipan dan memastikan material tersedia untuk order terkait.
- **Semi-CMT:** sistem melacak bahan utama dari klien dan bahan pendukung/aksesori yang disediakan Lukla. PO pembelian dibuat hanya untuk kebutuhan bahan yang harus disediakan Lukla.
- **Full Package:** kebutuhan material disediakan Lukla, termasuk untuk pesanan internal Snøhund sesuai skema standar.

### 5.4 Produksi hingga Rekap

1. Warehouse memeriksa identitas pemilik/order dan mencatat penerimaan aktual material. Untuk setiap material yang dibeli Lukla melalui PO, sistem mencatat kuantitas yang dipesan, kuantitas aktual yang diterima, penerimaan sebagian, serta selisih kekurangan/kelebihan yang perlu ditinjau.
2. Warehouse mengeluarkan material yang tervalidasi ke area Cutting. Pemotongan fisik dilakukan oleh petugas Cutting, bukan otomatis dianggap sebagai tugas Warehouse; hasil potong tetap ditelusuri ke klien dan order asal.
3. Bahan yang tidak cocok dengan klien atau pesanan tujuan diblokir sebelum transaksi stok dicatat.
4. Kepala Produksi mengalokasikan penjahit pada mesin/lini dan memantau pelaksanaan produksi.
4. Output komponen dicatat setiap 30 menit dan diverifikasi oleh Mandor sesuai mekanisme yang digunakan.
5. Produk/komponen yang telah memenuhi aturan penggabungan masuk ke antrean QC.
6. QC menetapkan hasil Lolos, Repair, atau Reject dan mencatat informasi yang diperlukan.
7. Finance & Payroll menghitung upah borongan buruh jahit pada periode mingguan; perhitungan output komponen terverifikasi menggunakan rate card efektif. Efek Repair/Reject terhadap upah tetap menjadi keputusan terbuka sampai kebijakan disepakati.
8. Pool bonus hanya dibentuk oleh produk utuh yang lolos QC; satu unit hanya boleh menambah pool sekali.
9. Finance mencatat dana makan bersama sebagai asumsi kerja sementara, menghitung overhead bulanan per unit, dan dapat menghasilkan invoice PDF berdasarkan harga komersial yang telah disepakati.
10. Klien eksternal yang memiliki akun dapat memantau status order dan informasi stok titipan yang menjadi hak aksesnya.

## 6. Ruang Lingkup

### 6.1 In Scope — Kapabilitas Produk

- Registrasi awal Client Record sebelum sample; akun login portal baru dibuat/diaktifkan setelah Production Order pertama disetujui Owner dan dikaitkan ke Client ID.
- Pengelolaan permintaan sampel, spesifikasi, pemakaian bahan sampel, time study, revisi versi, persetujuan klien, serta penutupan permintaan yang tidak berlanjut.
- Estimasi sederhana kebutuhan material (Sample BOM per unit × kuantitas order) dan total kandungan kerja (time study per komponen × kuantitas) sebagai kapabilitas P1 jika data yang diperlukan tersedia; allowance waste hanya digunakan bila disetujui.
- Referensi produk/sampel display internal Snøhund untuk pesanan *made to order*.
- Pembuatan draft Production Order dan pencatatan skema maklon, kuantitas, rincian ukuran, harga/ketentuan, dan target waktu.
- Approval Production Order oleh Owner sebagai satu-satunya approver sistem; konsultasi Owner dengan Kepala Produksi tidak menjadi approval sistem terpisah.
- Pengelolaan inventaris berdasarkan klien/order, penerimaan bahan, mutasi stok, stok opname, pelacakan WIP, pencatatan waste/scrap, dan pencegahan kontaminasi silang.
- Pengelolaan PO pembelian bahan: Kepala Produksi sebagai pembuat/pengaju PO dan Finance sebagai approver. Finance tidak membuat PO bahan baku.
- Alokasi penjahit/mesin, pencatatan output per 30 menit, verifikasi Mandor, dan alur menuju QC.
- Pencatatan hasil QC Lolos, Repair, dan Reject.
- Perhitungan upah borongan buruh jahit berdasarkan output komponen yang terverifikasi, tarif per komponen, dan periode payroll mingguan. Payroll karyawan non-penjahit berada di luar scope MVP.
- Kalkulasi sederhana untuk dana makan berdasarkan persentase dari total ongkos jahit periode, pool bonus QC, dan overhead bulanan per unit sesuai sumber. Perlakuan dana makan setelah nominal dihitung (misalnya alokasi dana atau biaya tambahan serta cara penyalurannya) tetap menjadi keputusan terbuka; sistem tidak mengasumsikan potongan atau tambahan payroll individu.
- Pembuatan invoice PDF berdasarkan data order dan harga komersial yang sudah disepakati, dengan trigger penerbitan masih perlu dikonfirmasi.
- Dashboard operasional dan portal pemantauan klien sesuai hak akses.
- **AI untuk bantuan estimasi material/waktu** pada workspace peran terkait dengan input yang tersedia dan dapat ditelusuri; serta **AI Assistant untuk pengetahuan operasional berbasis dokumen** sebagai penerapan AI untuk memenuhi persyaratan hackathon.
- Role-based access control (RBAC), isolasi data klien, dan histori perubahan pada transaksi/parameter kritis.

### 6.2 Batas MVP Hackathon

Dengan batas waktu implementasi yang singkat, MVP diprioritaskan pada alur yang dapat didemonstrasikan dan diuji secara end-to-end:

1. Sampel khusus dibuat/direvisi dan dapat ditutup tanpa Production Order.
2. Setelah sample/ketentuan disepakati, Sampler membuat draft Production Order; hanya Owner menekan approval dalam sistem. Setelah disetujui, Production Order terkait sample sumber dan akun portal klien baru dibuat/diaktifkan bila belum ada.
3. Order yang pending/ditolak tidak dapat memulai produksi; hanya order Accepted/Deal yang dapat dilanjutkan setelah persiapan yang diperlukan.
4. Validasi stok menolak pengeluaran untuk klien/order yang tidak cocok.
5. Input output produksi, alur QC, dan simulasi payroll mengikuti aturan yang disepakati dan menggunakan dataset uji.
6. Akun klien hanya dapat mengakses data terkait Client ID miliknya.
7. AI Assistant menjawab pertanyaan operasional yang tercakup dalam dokumen rujukan, menampilkan sumber bila tersedia, dan menyatakan keterbatasan saat jawaban tidak didukung sumber. Bantuan estimasi material/waktu hanya menggunakan Sample BOM, kuantitas order, dan time study yang tersedia; hasil disertai input/rumus yang digunakan dan tidak dianggap sebagai janji tanggal selesai.

### 6.3 Out of Scope Sementara untuk MVP

Bagian ini membatasi demo hackathon, bukan meniadakan kemungkinan pengembangan di masa depan:

- Integrasi pembayaran gaji langsung ke bank, perpajakan payroll, atau sistem akuntansi lengkap.
- Procurement suite penuh (supplier lifecycle, tender, dan proses pengadaan lanjutan) di luar pembuatan serta approval PO yang diperlukan.
- Aplikasi mobile native terpisah; prioritas pada web responsif.
- AI lanjutan untuk optimasi line balancing, prediksi/anomali payroll atau inventaris, klasifikasi visual QC, dan analisis transaksi real-time.
- Modul costing end-to-end yang menggabungkan seluruh biaya pesanan, menetapkan harga jual, atau menghitung/rekomendasikan margin sebagai fitur otomatis aplikasi. Bantuan estimasi material/waktu berbasis Sample BOM dan time study tidak sama dengan costing total atau penetapan harga jual.
- Pencarian vendor otomatis, perbandingan quotation otomatis, negosiasi, pemanggilan vendor, dan pemesanan otomatis. Pemilihan vendor dilakukan manual pada MVP.
- Payroll lengkap untuk karyawan selain buruh jahit, integrasi transfer gaji, pajak, dan sistem akuntansi penuh.
- Alokasi overhead berdasarkan pemakaian per mesin/lini/klien, Activity-Based Costing, dan analitik biaya lanjutan.
- Integrasi notifikasi dan kanal komunikasi eksternal yang kompleks.

## 7. Peran dan Tanggung Jawab (RBAC)

| Role | Tanggung Jawab Utama | Batasan Utama |
|---|---|---|
| Owner / Eksekutif | Menilai kelayakan bisnis Production Order; melihat dashboard dan mengesahkan keputusan bisnis/parameter yang memang menjadi kewenangannya. | Tidak mengubah histori transaksi yang sudah dikunci tanpa mekanisme koreksi yang sah. Persetujuan perubahan tarif dan harga komersial final masih perlu dikonfirmasi sebagai kebijakan Lukla. |
| Sampler / Tim Sample | Mengelola Client Record; membuat Sample Request dan revisi; mencatat sample/BOM/time study; menandai sample Approved setelah deal; membuat serta mengajukan draft Production Order; membuat/mengaktifkan akun portal setelah approval Owner bila akun belum tersedia. | Tidak dapat menyetujui Production Order; tidak membuat akun portal sebelum approval Owner. |
| Gudang / Warehouse | Menerima bahan/titipan klien, memberi tag, mengeluarkan bahan ke cutting, stok opname, mencatat waste/scrap. | Sistem memblokir transaksi bila pemilik/order tidak cocok. |
| Kepala Produksi | Memberi masukan kapasitas/timeline kepada Owner; setelah order approved meninjau order, memetakan komponen/assembly; mengalokasikan lini/penjahit; membuat/mengajukan PO; mengelola tarif upah operator per komponen sebagai asumsi kerja kelompok. | Tidak memiliki tombol approval Production Order di sistem; tidak mengubah hasil akhir QC atau menetapkan payroll final secara sepihak. Persetujuan perubahan tarif dan hubungannya dengan tarif komersial klien masih perlu dikonfirmasi. |
| Penjahit / Operator | Melihat tugas dan melaporkan hasil kerja per interval sesuai alur yang berlaku. | Tidak mengubah catatan output yang sudah diverifikasi tanpa proses koreksi berizin. |
| QC Inspector | Melakukan inspeksi, menetapkan Lolos/Repair/Reject, dan mencatat kategori cacat serta bukti bila diperlukan. | Tidak mengubah Rate Card atau spesifikasi komersial pesanan. |
| Finance & Payroll | Menyetujui/menolak PO; menghitung upah borongan buruh jahit dari output terverifikasi dan tarif upah yang berlaku; menghitung dana makan, pool bonus QC, serta overhead; meninjau hasil dan menghasilkan invoice PDF dari harga komersial yang telah disepakati. | **Bukan pembuat/pengaju PO bahan baku;** tidak melakukan mutasi fisik stok gudang dan tidak mengubah output terverifikasi. Penghitungan costing dan penyiapan penawaran harga tidak menjadi fitur aplikasi MVP. |
| Klien Maklon (B2B Portal) | Melakukan registrasi Client Record; setelah order pertama disetujui Owner dan akun diaktifkan, memantau progres order serta bahan titipan sendiri. Keputusan sample/deal difasilitasi bersama Sampler sebelum login portal tersedia. | Tidak memiliki akun portal sebelum Production Order pertama disetujui; setelah aktif, hanya mengakses data yang terhubung ke Client ID miliknya. |

**Catatan:** hanya Owner yang memiliki kontrol approval/reject Production Order di sistem. Konsultasi dengan Kepala Produksi boleh dilakukan sebelum Owner memutuskan, tetapi tidak dibuat sebagai approval sistem kedua. Finance hanya menjadi approver PO pembelian bahan baku; sistem perlu mencegah Finance membuat PO tersebut.

## 8. Persyaratan Fungsional

### 8.1 Sample & Product Reference Management

- **FR-1.1 — Client Registration & Sample Request:** sistem menyimpan Client Record/Client ID dari registrasi awal tanpa membuat login portal. Sampler membuat Sample Request terpisah; permintaan sampel tidak otomatis membuat Production Order.
- **FR-1.2 — Sample BOM:** mencatat pemakaian bahan utama dan aksesori pada sampel.
- **FR-1.3 — Time Study:** mencatat waktu pengerjaan per komponen dan percobaan pengukuran.
- **FR-1.4 — Sample Versioning:** revisi menghasilkan versi baru dan tidak menimpa versi terdahulu.
- **FR-1.5 — Sample Approval/Outcome:** revisi membuat Sample Version baru. Setelah sample dan ketentuan harga/komersial disepakati, Sampler menandai sample version sebagai `Approved`; permintaan dapat berlanjut ke Production Order atau ditutup tanpa order.
- **FR-1.6 — Internal Product Reference:** Production Order Snøhund dapat menggunakan referensi produk/sampel display yang disetujui bila spesifikasi tidak memerlukan sampel baru.
- **FR-1.7 — Simple Estimate (P1):** jika data tersedia, sistem menghitung estimasi material dari konsumsi pada sample BOM yang disetujui × kuantitas order, dan total kandungan kerja dari penjumlahan time study per komponen × kuantitas. Nilai merupakan estimasi perencanaan, bukan janji tanggal selesai atau standar pabrik yang telah disahkan. Data backpack untuk demo akan diberi label synthetic/mock data.

### 8.2 Production Order & Approval

- **FR-2.1 — Order Draft:** Sampler membuat draft Production Order dari permintaan klien atau referensi produk internal.
- **FR-2.2 — Required Order Details:** draft menyimpan skema maklon, produk/referensi sampel, kuantitas, rincian ukuran bila berlaku, harga/ketentuan, dan target waktu.
- **FR-2.3 — Owner-Only System Approval:** hanya Owner yang memiliki tombol approval Production Order. Owner dapat berkonsultasi dengan Kepala Produksi mengenai kapasitas/timeline, tetapi Kepala Produksi bukan approver sistem order.
- **FR-2.4 — Approval Outcome:** Owner approval mengubah order ke `Approved/Accepted`; penolakan menghasilkan `Rejected by Owner` dan mencegah produksi.
- **FR-2.5 — Create Client Account After Approval:** setelah order eksternal pertama disetujui, akun portal klien dibuat/diaktifkan jika belum ada. Penolakan tidak membuat akun portal.
- **FR-2.6 — Post-Approval Component Plan:** setelah order disetujui, Kepala Produksi meninjau order, memetakan komponen dan urutan assembly sebelum persiapan produksi.
- **FR-2.7 — ID Traceability:** Production Order mempertahankan ID terpisah dan link ke Sample Request ID serta Sample Version ID; jangan menimpa ID sample.
- **FR-2.8 — Status Guard:** order Draft/Pending Owner Approval/Rejected tidak dapat memicu produksi massal.

### 8.3 Inventaris Multi-Klien & Anti-Kontaminasi

- **FR-6.1 — Mandatory Tagging:** material, WIP, dan barang jadi harus dapat ditelusuri ke pemilik serta order/referensi yang sesuai. Sampel sebelum Production Order ditautkan ke Sample Request ID.
- **FR-6.2 — Anti-Contamination:** sistem memblokir pengeluaran material ketika identitas pemilik atau order tidak sesuai; transaksi yang ditolak tidak mengurangi saldo stok.
- **FR-6.3 — Waste/Scrap:** sisa potongan dan scrap dicatat berdasarkan order/klien dengan kategori yang relevan untuk pelaporan.
- **FR-6.4 — Stock Traceability:** sistem menyimpan histori penerimaan, pengeluaran, perpindahan, koreksi, dan rekonsiliasi yang diterapkan.

### 8.4 Production Tracking

- **FR-7.1 — Dynamic Allocation:** mendukung alokasi penjahit pada lini/mesin yang dinamis hingga sekitar 70 mesin aktif.
- **FR-7.2 — Rate Card & History:** sistem menyimpan tarif ongkos cutting dan jahit per komponen/artikel untuk setiap klien sesuai sumber, beserta histori perubahan. Untuk payroll, tarif upah borongan operator per komponen yang berlaku pada periode terkait juga harus tersedia. Asumsi kerja kelompok: Kepala Produksi mengelola tarif upah operator berdasarkan kebutuhan teknis, sementara Finance menggunakan tarif yang berlaku untuk menghitung payroll. Sumber belum memastikan apakah tarif jasa yang dikenakan kepada klien sama atau berbeda dari tarif upah operator, dan apakah perubahan tarif upah memerlukan persetujuan Owner; hal ini tetap menjadi keputusan terbuka.
- **FR-7.3 — Output Interval:** mencatat jumlah komponen yang selesai setiap 30 menit.
- **FR-7.4 — Verification & Assembly:** output diverifikasi oleh Mandor sesuai mekanisme operasional; produk yang memenuhi aturan penggabungan dapat masuk status Menunggu QC.

### 8.5 QC & Finished Goods

- **FR-8.1 — QC Outcome:** QC dapat menetapkan Lolos, Repair, atau Reject.
- **FR-8.2 — Defect Record:** hasil Repair/Reject menyimpan kategori cacat dan catatan yang relevan; bukti foto dapat ditambahkan bila tersedia.
- **FR-8.3 — Routing:** produk Repair kembali ke alur perbaikan; produk Reject dialihkan ke penanganan cacat/scrap sesuai kebijakan.
- **FR-8.4 — QC Bonus Trigger:** produk yang memenuhi syarat Lolos QC dihitung untuk pool bonus mengikuti parameter yang berlaku.

### 8.6 Payroll & Ringkasan Biaya

- **FR-10.1 — Weekly Piece Rate (P0):** setiap Sabtu, Finance menghitung upah borongan buruh jahit berdasarkan output komponen terverifikasi per pekerja × tarif upah komponen yang berlaku. Payroll untuk role karyawan lain berada di luar scope MVP. Output komponen yang sudah diverifikasi tidak otomatis dibatalkan atau dikenai clawback karena status QC produk akhir; perlakuan upah atas Repair/Reject mengikuti kebijakan yang masih perlu dikonfirmasi.
- **FR-10.2 — Meal Fund (P0):** sistem menghitung dana uang makan berdasarkan persentase yang dikonfigurasi (baseline sumber 10–15%) dikalikan total ongkos jahit pada periode terkait. Rumus ini menentukan nominal dana, tetapi belum menetapkan apakah nilainya diperlakukan sebagai alokasi dari ongkos jahit atau biaya tambahan, siapa penerimanya, maupun cara penyalurannya. Sistem tidak mengasumsikan potongan atau tambahan otomatis pada payroll individu sebelum kebijakan dikonfirmasi.
- **FR-10.3 — QC Bonus Pool (P0):** setiap produk utuh yang final berstatus Lolos QC menyumbang rate bonus per unit ke pool akumulatif lintas order/klien. Pool dibagi rata kepada dua Mandor dan satu Kepala Operasional. Repair tidak menyumbang sebelum lolos ulang; Reject tidak eligible; satu unit hanya boleh dikreditkan ke pool sekali. Periode pencairan dan pembulatan masih perlu dikonfirmasi.
- **FR-10.4 — Monthly Overhead per Unit (P0 basic):** Finance memasukkan biaya bulanan (minimal listrik, air, internet; kategori operasional tambahan hanya bila disepakati), dan sistem membaginya dengan total unit produk yang diproduksi pada bulan itu. Tidak ada alokasi per mesin/lini/klien. Bila jumlah unit nol atau belum tersedia, hasil tidak dihitung.
- **FR-10.5 — Payroll Calculation Review:** Finance memeriksa dasar kalkulasi, periode, tarif/parameter, dan hasil sebelum rekap dikunci atau diterbitkan. Kebijakan Repair/Reject terhadap upah komponen tetap menjadi keputusan terbuka; sistem tidak otomatis melakukan clawback tanpa aturan disetujui.

### 8.7 Raw Material Purchase Order

- **FR-11.1 — PO Preparation:** Kepala Produksi membuat/mengajukan PO bahan baku yang dibutuhkan untuk pesanan sesuai skema maklon.
- **FR-11.2 — PO Approval:** Finance meninjau dan menyetujui/menolak PO. Finance tidak dapat membuat PO bahan baku.
- **FR-11.3 — Scheme Validation:** kebutuhan PO mengikuti skema: CMT terutama menggunakan bahan titipan klien; Semi-CMT mengadakan bahan pendukung yang disediakan Lukla; Full Package mengadakan bahan yang disediakan Lukla.
- **FR-11.4 — Manual Vendor Selection:** vendor dipilih dan data harga/kuantitas dimasukkan secara manual. Setelah approval, PO dapat diterbitkan secara manual/diunduh/dikirim oleh pengguna berwenang. Sistem tidak mencari, memanggil, menegosiasikan, atau memesan kepada vendor secara otomatis.
- **FR-11.5 — Receipt Tracking:** catat kuantitas yang dipesan, kuantitas aktual yang diterima, dan status penerimaan (belum diterima/sebagian/selesai). Selisih kekurangan atau kelebihan dicatat untuk ditinjau; status PO Approved/Issued tidak disamakan dengan barang sudah datang atau diterima penuh.

### 8.8 Invoice PDF (P0 minimum)

- **FR-13.1 — Invoice Source:** Finance dapat memilih Production Order dengan ketentuan komersial/harga yang sudah disepakati; sistem mengisi nomor/tanggal invoice, informasi klien/order, deskripsi, kuantitas, harga satuan, dan total berdasarkan data yang tersedia.
- **FR-13.2 — PDF Output:** Finance dapat meninjau dan menghasilkan invoice PDF untuk diunduh, dikirim, atau dicetak secara manual. AI tidak membuat/menetapkan harga.
- **FR-13.3 — Manual Issuance:** sistem tidak mengirim invoice otomatis ke klien. Pemicu/timing invoice (misalnya saat order disepakati, selesai, atau diserahkan) masih perlu dikonfirmasi; untuk demo, Finance menghasilkan invoice on-demand untuk order yang harga komersialnya telah disepakati. Invoice ini bukan otomatis faktur pajak resmi.

### 8.9 Client Portal & Access Control

- **FR-12.1 — Client Account:** Client Record dapat didaftarkan sebelum sample tanpa login. Akun klien eksternal baru dibuat/diaktifkan setelah Production Order pertama disetujui Owner; akun ditautkan ke Client ID.
- **FR-12.2 — Client Isolation:** klien hanya dapat melihat data sampel, order, progres, dan bahan titipan yang menjadi haknya.
- **FR-12.3 — Order Tracking:** portal menampilkan status order dan progres yang telah dipublikasikan untuk klien.

### 8.10 AI Assistant — Hackathon Requirement

- **AI-01 — Operational Knowledge Assistant:** sistem menyediakan antarmuka percakapan untuk menjawab pertanyaan mengenai SOP dan aturan operasional berdasarkan dokumen referensi yang disediakan.
- **AI-02 — Source Grounding:** jawaban menampilkan referensi sumber apabila tersedia. Jika informasi tidak ditemukan atau tidak cukup, asisten menyatakan keterbatasannya, bukan membuat aturan bisnis baru.
- **AI-03 — Internal-Only Access:** AI Assistant hanya tersedia untuk role internal yang diizinkan; akun Klien Maklon tidak menggunakan AI pada MVP. Retrieval dibatasi pada dokumen yang boleh diakses role tersebut. MVP tidak mengambil Production Order, payroll, inventaris, atau data transaksi real-time.
- **AI-04 — No Business Actions:** AI tidak dapat menyetujui order/PO/QC/payroll, mengubah stok, menetapkan tarif, menetapkan harga komersial, menghasilkan penawaran harga otomatis, atau mengirim/membeli sesuatu. Costing end-to-end dan rekomendasi harga/margin kepada klien berada di luar scope MVP.
- **AI-05 — Role-Based Material/Time Estimate Assistance:** pada workspace internal yang relevan, AI membantu pengguna memahami atau menyusun estimasi material dan total kandungan kerja berdasarkan Sample BOM yang disetujui, kuantitas order, dan time study yang tersedia. Perhitungan numerik memakai rumus yang transparan, menampilkan input/sumber, dan hasil diberi label estimasi; fitur ini tidak menjanjikan tanggal selesai, membuat transaksi, atau menggantikan persetujuan manusia. Bila input penting tidak tersedia, sistem menyatakan keterbatasan dan tidak mengarang nilai.

> Teknologi/model AI dan rancangan retrieval (misalnya RAG) dijabarkan lebih lanjut di PRD/SRS. BRD ini menetapkan kebutuhan bisnis AI, bukan mengunci penyedia model atau detail implementasi teknis.

## 9. Persyaratan Antarmuka Utama

1. **Dashboard Operasional:** ringkasan order, lini aktif, pekerja, output per 30 menit, dan peringatan operasional.
2. **Sample & Time Study Tracker:** permintaan sampel, versi, BOM, studi waktu, status keputusan klien, dan referensi sampel display internal.
3. **Production Order Workspace:** pembuatan draft, skema maklon, ketentuan komersial, status approval Owner-only, status pending/rejected/Accepted.
4. **Gudang Multi-Klien:** penerimaan dan mutasi bahan, tagging, stok opname, waste/scrap, dan blokir anti-kontaminasi.
5. **Terminal Input Produksi:** input output per 30 menit dan verifikasi.
6. **Terminal QC:** pencatatan Lolos/Repair/Reject, kategori defect, serta routing.
7. **Payroll & Biaya Operasional:** tarif yang digunakan untuk payroll, upah buruh jahit mingguan, nominal dana makan sesuai parameter, pool bonus QC, dan overhead bulanan per unit. Workspace ini tidak mencakup costing end-to-end atau penetapan harga jual otomatis.
8. **Invoice Workspace:** meninjau data komersial order dan menghasilkan invoice PDF.
9. **Portal Klien:** pemantauan sampel/order serta stok titipan yang diizinkan.
10. **Lukla AI Assistant dan bantuan estimasi:** antarmuka percakapan internal dengan referensi sumber jawaban, serta bantuan estimasi material/waktu pada workspace peran terkait; tanpa query transaksi langsung.

Antarmuka diutamakan responsif untuk PC, tablet, dan perangkat lantai produksi. Kebutuhan mobile native terpisah bukan prioritas MVP.

## 10. Kriteria Penerimaan / Skenario Uji

- **AC-01 — Deal, Owner Approval & Account Provisioning:** Setelah sample/versi dan ketentuan komersial disepakati, Sampler menandai Sample Version sebagai `Approved`. Saat klien meminta Production Order, Sampler membuat draft dan mengajukannya ke Owner. Hanya Owner dapat menyetujui/menolak order di sistem. Akun portal klien eksternal baru dibuat/diaktifkan setelah approval Owner; jika ditolak, tidak ada akun baru. Setelah approval, Head Production meninjau order, memetakan komponen, dan menyusun assembly/routing.
- **AC-02 — Pending/Rejected Guard:** order Pending atau Rejected tidak dapat memulai produksi massal.
- **AC-03 — Sample Without Order:** permintaan sampel dapat ditutup tanpa Production Order dan seluruh histori sampel tetap tersimpan.
- **AC-04 — Version Traceability:** order yang berasal dari sampel merujuk pada versi yang disetujui; revisi baru tidak mengubah spesifikasi historis order yang telah dibuat.
- **AC-05 — Internal Product Reference:** order Snøhund dapat dibuat dari referensi produk/sampel display yang valid tanpa membuat sampel khusus baru bila tidak ada perubahan spesifikasi.
- **AC-06 — Cross-Client Inventory:** pengeluaran material Klien A untuk order Klien B ditolak; saldo stok tidak berubah dan insiden/transaksi gagal dapat ditelusuri.
- **AC-07 — Dynamic Payroll:** lima penjahit baru yang ditambahkan di tengah minggu dapat dihitung berdasarkan output komponen terverifikasi × tarif efektif; output setiap pekerja dihitung terpisah.
- **AC-08 — QC Bonus:** 3.000 unit final Pass eligible dengan rate contoh Rp300/unit menghasilkan pool Rp900.000, dibagi rata menjadi Rp300.000 per penerima sebelum pembulatan. Unit Repair/Reject tidak menambah pool; unit Repair yang akhirnya Pass dihitung satu kali saja.
- **AC-09 — Client Isolation:** akun Klien A tidak dapat membaca data Klien B melalui halaman, API, laporan, maupun fitur AI.
- **AC-10 — AI Grounding:** pertanyaan yang didukung dokumen menghasilkan jawaban yang konsisten dan menyertakan sumber; pertanyaan tanpa dukungan sumber menghasilkan respons keterbatasan yang jelas.
- **AC-11 — PO Permission & Receipt Tracking:** Kepala Produksi dapat membuat/mengajukan PO; Finance dapat menyetujui/menolak, tetapi tidak dapat membuat PO bahan baku. Vendor dipilih manual dan tidak ada auto-sourcing/auto-order. Sistem mencatat kuantitas yang dipesan dan diterima, mendukung penerimaan sebagian, serta menampilkan selisih kekurangan/kelebihan untuk ditinjau.
- **AC-12 — QC Routing:** produk berstatus Repair kembali ke alur perbaikan; produk Reject diarahkan ke penanganan cacat yang ditentukan; bonus QC hanya dihitung sekali saat produk final lolos QC.
- **AC-13 — Invoice PDF:** Finance dapat menghasilkan PDF dari order dengan harga yang telah disepakati; total invoice konsisten dengan harga dan kuantitas sumber; tidak ada rekomendasi harga dari AI.
- **AC-14 — Basic Overhead:** kategori biaya bulanan dan total unit produksi menghasilkan overhead/unit sesuai rumus BRD; bila pembagi nol, kalkulasi diblokir.
- **AC-15 — Simple and AI-Assisted Estimate (P1):** bila Sample BOM, kuantitas order, dan/atau time study tersedia, sistem menghitung estimasi material dan total kandungan kerja dengan formula transparan. AI dapat membantu pengguna memahami estimasi pada workspace internal; hasil menampilkan input/sumber dan label estimasi, bukan janji tanggal selesai. Bila input tidak cukup, sistem menyatakan keterbatasannya.

## 11. Kebutuhan Kualitas dan Kontrol

- **Keamanan akses:** RBAC diterapkan pada backend, bukan hanya menyembunyikan tombol di UI.
- **Isolasi klien:** semua query, detail, laporan, ekspor, dan konteks AI yang mengandung data khusus klien harus mengikuti hak akses Client ID.
- **Audit trail:** keputusan approval/rejection, perubahan Rate Card, transaksi stok, verifikasi output, hasil QC, serta perubahan parameter finansial perlu memiliki catatan aktor dan waktu.
- **Integritas data:** transaksi kritis tidak boleh menghasilkan saldo stok, status order, atau nilai payroll yang tidak konsisten.
- **Kemudahan operasional:** terminal input produksi dan QC harus mudah digunakan pada tablet/layar sentuh.
- **Keterlacakan:** sampel, versi sampel, Production Order, material, output, hasil QC, dan hasil payroll harus terhubung sesuai kebutuhan pelacakan bisnis.

## 12. Keputusan Terbuka dan Asumsi yang Perlu Dikonfirmasi

Item berikut tidak boleh ditentukan dengan tebakan. Untuk MVP, gunakan aturan yang telah disepakati stakeholder atau catat sebagai keputusan terbuka:

1. **Payroll Repair/Reject:** apakah output komponen yang sudah diverifikasi tetap dibayar penuh jika produk utuh kemudian Repair/Reject. Tidak ada clawback otomatis tanpa keputusan kebijakan.
2. **Perlakuan uang makan:** formula dasar adalah persentase 10–15% dari total ongkos jahit pada periode terkait. Konfirmasi apakah nilai tersebut merupakan alokasi dari ongkos jahit atau biaya tambahan, siapa penerimanya, dan bagaimana penyalurannya. Jangan mengasumsikan potongan/tambahan payroll individu.
3. **Basis overhead:** BRD menggunakan total unit yang diproduksi; konfirmasi definisi unit produksi dan apakah kategori di luar listrik, air, dan internet, termasuk perawatan mesin, ikut dihitung.
4. **Tarif jasa klien vs tarif upah operator:** sumber menyebut rate card ongkos cutting/jahit per klien dan tarif jahit sebagai dasar upah operator, tetapi belum memastikan apakah keduanya sama atau berbeda. Konfirmasi relasi tarif serta siapa yang menetapkan/mengelola dan menyetujui perubahannya.
5. **Harga komersial dan costing:** rekomendasi kerja adalah Finance mengonsolidasikan informasi biaya dan menyiapkan perhitungan/penawaran di luar aplikasi, lalu harga komersial final disetujui Owner. Pembagian tugas ini belum dikonfirmasi Lukla. Modul costing end-to-end dan rekomendasi harga/margin tidak termasuk MVP saat ini.
6. **Upah cutting:** berada di luar scope payroll MVP; payroll berfokus pada buruh jahit.
7. **Penggabungan komponen:** cara menghitung jumlah produk utuh yang siap masuk QC.
8. **Sisa bahan titipan:** apakah diretur atau dapat dipindahkan ke order lain milik klien yang sama, dengan otorisasi.
9. **Invoice:** kondisi/timing penerbitan invoice resmi masih perlu konfirmasi; MVP hanya membuat PDF on-demand dari harga order yang disepakati.
10. **AI dan estimasi:** pastikan bantuan estimasi material/waktu serta SOP Knowledge Assistant memenuhi kebutuhan demo dan batasan rubrik; estimasi bergantung pada ketersediaan Sample BOM, kuantitas order, dan time study.

## 13. Risiko Utama

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Alur deal sample dan approval order tidak konsisten | Order dapat diproses sebelum sample/ketentuan deal atau tanpa keputusan Owner | Status guard; Sampler menandai sample Approved setelah deal, Owner satu-satunya approver sistem, dan masukan Kepala Produksi bukan approval terpisah. |
| Sampel dianggap sama dengan order | Permintaan sampel yang tidak jadi produksi menimbulkan order palsu | Pertahankan Sample Request ID/Sample Version ID dan tautkan ke Production Order ID terpisah saat order approved. |
| ID/tag material tidak konsisten | Kontaminasi silang dan stok sulit ditelusuri | Validasi owner/order pada semua transaksi relevan. |
| Aturan payroll belum lengkap | Selisih perhitungan dan potensi sengketa pembayaran | Selesaikan keputusan finansial yang memengaruhi formula sebelum kalkulasi dianggap final. |
| Tarif jasa klien dan tarif upah operator tercampur | Harga penawaran, biaya tenaga kerja, dan margin dapat keliru dihitung | Pertahankan konsep tarif sesuai sumber dan konfirmasi hubungan tarif sebelum mengunci rumus payroll/costing. |
| Isolasi data klien gagal | Data bisnis klien lain bocor | Enforce authorization pada backend dan uji akses lintas klien, termasuk melalui AI. |
| Scope MVP terlalu luas | Fitur inti tidak selesai dalam waktu hackathon | Prioritaskan alur end-to-end minimum; tempatkan AI lanjutan di luar MVP kecuali diwajibkan. |

## 14. Definisi Keberhasilan

MVP hackathon dianggap memenuhi kebutuhan inti apabila skenario AC-01 sampai AC-15 yang masuk ke ruang demonstrasi telah diuji dan hasilnya memenuhi expected result. Untuk klaim keberhasilan bisnis setelah penggunaan nyata (misalnya pengurangan kesalahan stok, efisiensi waktu payroll, atau peningkatan produktivitas), diperlukan baseline operasional dan pengukuran setelah sistem digunakan; target numerik belum ditetapkan dalam draft ini.

## 15. Kontrol Revisi

| Revisi | Ringkasan | Status |
|---|---|---|
| 1.0 | BRD awal kelompok | Acuan awal |
| 1.1 | Memperjelas lifecycle sampel dan order, internal product reference Snøhund, dual approval, otorisasi PO, portal klien, scope MVP, success criteria, serta AI sebagai persyaratan hackathon | Draft kerja sebelumnya |
| 1.2 | Menyelaraskan upah komponen untuk buruh jahit, peran Head Production/Finance dalam Rate Card dan payroll, pool makan sementara, bonus QC hanya dari produk final Pass, overhead sederhana, estimasi P1, PO manual dan invoice PDF, serta membatasi AI ke SOP internal | Draft kerja sebelumnya |
| 1.3 | Mengubah onboarding: Client Record sebelum sample tetapi akun login hanya setelah Production Order disetujui Owner; Sampler menandai sample Approved setelah deal; Owner menjadi satu-satunya approver sistem; Head Production meninjau/memetakan komponen dan assembly setelah approval; Sample ID tetap ditautkan ke Production Order ID terpisah sebagai rekomendasi traceability | Draft kerja sebelumnya |
| 1.4 | Menegaskan urutan operasional: klien registrasi tanpa login; Sampler membuat dan merevisi sample; setelah deal Sampler menandai sample Approved; klien meminta order; Sampler membuat draft untuk approval Owner; akun portal baru dibuat setelah Owner approve; Head Production kemudian meninjau dan membedah komponen/assembly. Menghapus dual approval sistem dari bagian aktif; Production Order menggunakan ID terpisah yang ditautkan ke sample sumber. | Draft kerja sebelumnya |
| 1.5 | Mempertahankan struktur BRD v1.4; memperjelas draft Production Order diajukan ke Owner, provisioning akun oleh Sampler setelah approval, memperjelas rate card klien dan tarif upah operator sebagai hal yang perlu dikonfirmasi, menyelaraskan ID FR payroll dengan baseline sumber, mencatat kuantitas PO dan penerimaan aktual, tugas fisik Cutting, perlakuan dana makan sebagai keputusan terbuka, batas costing MVP, serta bantuan estimasi material/waktu berbasis sumber. | Draft untuk review kelompok |

---

**Akhir Dokumen — BRD Lukla Operations Engine v1.5 Draft**
