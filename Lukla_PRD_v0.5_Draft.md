---
title: "Product Requirements Document (PRD)"
subtitle: "Lukla Operations Engine"
author: "Kelompok 6"
date: "14 Oktober 2026"
---

| Kontrol Dokumen | Detail |
|---|---|
| Produk | Lukla Operations Engine |
| Versi PRD | 0.5 - Klarifikasi urutan sample, order dan akun portal |
| Status | Draft kerja; perlu ditinjau tim sebelum scope dan implementasi dibekukan |
| Product Owner / Stakeholder Bisnis | Tim Operasional Lukla Manufacturing & Manajemen Merek Snøhund |
| Tim | Kelompok 6 |
| Referensi Bisnis Utama | BRD Lukla Operations Engine v1.4 Draft |
| Referensi Proses | BPMN 2.0 Draft v1.4 (tujuh diagram proses) |
| Referensi Pendukung | Lukla Operations Engine - SRS Walkthrough v2.0, 12 Oktober 2026 |
| Ketentuan Proyek Wajib | Kemampuan AI diwajibkan oleh ketentuan resmi hackathon, berdasarkan informasi dari tim |
| Platform | Aplikasi web responsif; tampilan tablet/layar sentuh untuk operasional pabrik |

> **Cara membaca PRD ini.** Kebutuhan dari BRD dan klarifikasi kelompok digunakan sebagai baseline kerja saat ini. Aturan bisnis yang belum disepakati ditandai sebagai **KEPUTUSAN TERBUKA (OPEN DECISION)** dan tidak diisi dengan tebakan. AI wajib hadir sesuai ketentuan hackathon; AI Assistant berbasis dokumen/SOP adalah usulan implementasi MVP, kecuali rubrik resmi hackathon menentukan use case AI yang berbeda.

---

# 1. Ringkasan Produk

Lukla Operations Engine adalah platform web responsif untuk mengelola operasional manufaktur garmen di Lukla Manufacturing, Ciwidey. Sistem mendukung merek internal Snøhund dan klien maklon B2B eksternal, dengan kapasitas produksi dinamis hingga sekitar 70 mesin jahit aktif.

Produk menghubungkan permintaan dan revisi sampel, Production Order, pelacakan material dan inventaris, pencatatan output produksi, quality control (QC), perhitungan payroll/biaya, tampilan operasional, portal klien, serta asisten AI yang diwajibkan oleh hackathon.

Produk perlu membantu menyelesaikan tiga masalah operasional inti:

1. **Kontaminasi stok antarklien:** bahan mentah, barang dalam proses (*work in progress/WIP*), dan barang jadi berisiko tertukar antar-klien atau antar-pesanan karena belum ada validasi sistematis atas pemilik dan tujuan penggunaan.
2. **Produksi dan payroll yang dinamis:** jumlah penjahit dan alokasi mesin berubah mengikuti volume order. Output dicatat setiap 30 menit dan menjadi salah satu sumber perhitungan upah borongan serta biaya terkait.
3. **Keterlacakan yang belum memadai:** spesifikasi serta revisi sampel, pemakaian bahan, studi waktu, defect, output produksi, dan riwayat order harus dapat ditelusuri secara digital.

MVP memprioritaskan alur end-to-end yang dapat didemonstrasikan dan diuji, bukan kedalaman semua fitur. Cakupan inti mencakup pemisahan sampel dan order, approval Production Order oleh Owner, kontrol inventaris, pelacakan produksi/QC, simulasi payroll yang dapat diuji, isolasi data klien, dan use case AI yang diwajibkan.

# 2. Visi Produk dan Hasil yang Diharapkan

## 2.1 Visi Produk

Menyediakan satu ruang kerja operasional yang membantu Lukla melacak pekerjaan sejak permintaan sampel sampai pemenuhan order, sambil menjaga keterlacakan kepemilikan material, persetujuan, produksi, QC, dan payroll.

## 2.2 Tujuan Produk

- **PG-01 - Integritas inventaris:** mencegah material dikeluarkan untuk klien/order yang tidak sesuai dan mempertahankan histori mutasi stok.
- **PG-02 - Keterlacakan sampel:** menjaga riwayat permintaan serta versi sampel secara terpisah dari Production Order.
- **PG-03 - Tata kelola order:** menegakkan approval Production Order oleh Owner sebagai satu-satunya approver sistem, dengan konsultasi Head Production dan pemetaan komponen setelah order disetujui.
- **PG-04 - Pelacakan produksi dinamis:** mendukung alokasi mesin/pekerja yang fleksibel dan pencatatan output terverifikasi setiap 30 menit.
- **PG-05 - Keterlacakan QC:** mencatat hasil Lolos, Repair, dan Reject serta mengarahkan barang ke proses berikutnya yang sesuai.
- **PG-06 - Transparansi payroll:** menghitung upah borongan buruh jahit dari output komponen terverifikasi dan Rate Card efektif; mengelola dana makan, bonus QC, dan overhead sebagai kalkulasi terpisah yang transparan. Kebijakan yang belum disepakati tetap ditandai.
- **PG-07 - Akses klien terkontrol:** mengizinkan klien melihat hanya sampel, order, progres, dan bahan titipannya yang terhubung dengan Client ID miliknya.
- **PG-08 - Persyaratan AI hackathon:** menyediakan AI internal untuk tanya-jawab SOP/panduan dari dokumen yang disetujui, dengan rujukan dan penanganan ketidakpastian. AI tidak membaca data transaksi real-time atau melakukan tindakan bisnis.

## 2.3 Ukuran Keberhasilan MVP Hackathon

MVP dianggap siap didemonstrasikan jika tim mampu menunjukkan dan menguji hal-hal berikut:

- Permintaan sampel dapat direvisi atau ditutup tanpa membuat Production Order.
- Sampel menjadi `Approved` setelah kesepakatan sample/ketentuan dengan klien dan ditandai oleh Sampler. Production Order hanya disetujui melalui tombol Owner; Head Production dikonsultasikan dan melakukan pemetaan komponen/assembly setelah approval.
- Penolakan mencatat pihak yang menolak dan mencegah order masuk ke proses produksi.
- Pengeluaran material dengan pemilik/order yang tidak cocok diblokir tanpa mengurangi saldo stok.
- Output produksi, status QC, dan perhitungan uji payroll dapat ditelusuri ke dataset uji yang diketahui.
- Akun klien tidak dapat mengakses data klien lain melalui UI maupun permintaan backend/API.
- Payroll dihitung untuk buruh jahit berdasarkan output komponen terverifikasi × Rate Card yang efektif, tanpa memasukkan pekerja non-penjahit ke kalkulasi MVP.
- Perhitungan dasar pool bonus QC, dana makan bersama (asumsi sementara), overhead bulanan per unit, dan invoice PDF dapat didemonstrasikan berdasarkan input yang jelas.
- AI Assistant internal menjawab pertanyaan yang didukung dokumen dengan referensi bila tersedia, dan mengakui keterbatasan jika sumber tidak mendukung jawaban.

Kriteria di atas adalah **kriteria penerimaan demo hackathon**, bukan klaim bahwa dampak bisnis setelah sistem digunakan sungguhan sudah terukur. Target numerik penurunan kesalahan stok, pemangkasan waktu payroll, atau peningkatan produktivitas membutuhkan data baseline operasional dan belum ditetapkan dalam draft ini.

# 3. Pengguna dan Peran

Produk mengikuti delapan role bisnis dalam BRD. Hak akses harus ditegakkan oleh backend; menyembunyikan tombol di UI saja tidak cukup untuk disebut sebagai otorisasi.

| Role | Tanggung jawab utama | Batasan utama |
|---|---|---|
| Owner / Eksekutif | Menjadi satu-satunya approver sistem untuk Production Order; mengambil keputusan approval setelah meninjau data dan berkonsultasi dengan Head Production; melihat ringkasan operasional | Tidak dapat diam-diam mengubah histori transaksi yang sudah dikunci; persetujuan perubahan Rate Card masih perlu dikonfirmasi |
| Sampler / Tim Sample | Mengelola Client Record hasil registrasi awal; membuat Sample Request/revisi; mencatat sample/BOM/time study; menandai sample Approved setelah deal; membuat draft Production Order dari sample yang disetujui | Tidak dapat menyetujui Production Order dan tidak membuat akun portal sebelum Owner menyetujui order |
| Gudang / Warehouse | Menerima dan memberi tag bahan; mengeluarkan bahan ke cutting; mencatat stok opname, mutasi, waste/scrap | Tidak dapat mengeluarkan material ke klien/order tujuan yang tidak cocok |
| Kepala Produksi | Memberi masukan kapasitas/timeline kepada Owner; setelah order disetujui meninjau order, membedah komponen, menyusun urutan assembly; mengalokasikan pekerja/lini; membuat/mengajukan PO; menetapkan tarif upah per komponen sebagai working assumption kelompok | Tidak memiliki tombol approval Production Order di sistem; tidak dapat menyetujui PO yang dibuatnya sendiri atau mengubah hasil akhir QC; perubahan tarif harus tercatat dan efektif untuk periode tertentu |
| Penjahit / Operator | Melihat tugas/komponen dan mencatat output jika mode input yang dipilih mengizinkan | Tidak dapat mengubah output yang sudah diverifikasi tanpa alur koreksi berizin |
| QC Inspector | Memeriksa produk; menetapkan Lolos, Repair, atau Reject; mencatat kategori cacat dan bukti bila tersedia | Tidak dapat mengubah ketentuan komersial atau Rate Card |
| Finance & Payroll | Menyetujui/menolak PO; menerapkan Rate Card efektif untuk menghitung upah borongan buruh jahit; meninjau hasil, menghitung dana makan/pool bonus/overhead, dan menghasilkan invoice PDF | Tidak dapat membuat/mengajukan PO bahan baku, mengubah output yang sudah diverifikasi, atau melakukan mutasi fisik stok gudang |
| Klien Maklon (B2B Portal) | Mengikuti permintaan sampel, memberikan keputusan sampel/penawaran yang relevan, memantau progres order dan stok titipan sendiri | Akses harus terbatas pada data dengan Client ID miliknya |

## 3.1 Data Klien dan Akun Pengguna

`Client Record / Client ID` menyimpan informasi bisnis klien yang diregistrasikan ketika klien pertama kali mengajukan maklon. Registrasi data ini **tidak membuat akun login portal**. `User Account` adalah kredensial akses seseorang dan harus terhubung ke Client ID yang benar. Untuk klien eksternal, akun portal baru dibuat/diaktifkan setelah Production Order pertama disetujui Owner. Sebelum itu, proses sample dan revisi difasilitasi Sampler di luar portal klien. Setelah akun aktif, portal menampilkan data sesuai izin dan Client ID.

## 3.2 Pemisahan Persetujuan

- **Sample:** setelah sample dan ketentuan harga/komersial disepakati dengan klien, Sampler menandai sample version sebagai `Approved`.
- **Production Order:** hanya Owner yang memiliki tombol approval di sistem. Owner dapat berkonsultasi dengan Head Production mengenai kapasitas/timeline; konsultasi ini bukan approval sistem terpisah. Setelah approval, Head Production meninjau komponen dan menyiapkan urutan assembly.
- **PO pembelian bahan baku:** Kepala Produksi membuat/mengajukan PO; Finance menyetujui atau menolak. Finance tidak boleh memiliki izin membuat PO. Vendor dipilih manual; pengiriman/penerbitan eksternal dilakukan secara manual oleh pengguna berwenang setelah approval.
- **Rate Card upah jahit:** working assumption kelompok: Head Production menetapkan tarif per komponen; Finance menggunakannya dalam kalkulasi. Approval Owner untuk perubahan Rate Card perlu dikonfirmasi.

# 4. Ruang Lingkup dan Prioritas

## 4.1 In Scope MVP - P0 / Wajib Didemonstrasikan

| ID | Kapabilitas | Hasil minimum MVP |
|---|---|---|
| MVP-01 | Permintaan sampel dan versioning | Mencatat sampel khusus, membuat revisi tanpa menimpa versi lama, dan menutup permintaan tanpa order |
| MVP-02 | Referensi produk Snøhund | Membuat order internal dari referensi produk/sampel yang disetujui jika sampel baru tidak diperlukan |
| MVP-03 | Production Order dan approval | Membuat draft dari sample approved; merekam approval Owner sebagai satu-satunya approval sistem; setelah approved, buat/aktifkan akun klien jika belum ada dan minta Head Production memetakan komponen/assembly |
| MVP-04 | Kewenangan PO | Kepala Produksi membuat/mengajukan PO bahan; Finance hanya menyetujui/menolak |
| MVP-05 | Validasi inventaris | Memberi tag inventaris dan memblokir pengeluaran dengan kepemilikan/tujuan order yang tidak cocok |
| MVP-06 | Output produksi dan QC | Mencatat output per 30 menit, verifikasi, serta routing hasil QC Lolos/Repair/Reject |
| MVP-07 | Upah borongan buruh jahit | Menghitung output komponen terverifikasi per pekerja × Rate Card efektif; payroll non-penjahit di luar scope; kebijakan Repair/Reject terhadap upah tetap ditandai jika belum diputuskan |
| MVP-08 | Portal klien dan isolasi data | Klien mengikuti progres miliknya dan informasi stok titipan yang diizinkan; akses lintas klien ditolak |
| MVP-09 | AI Assistant | Menjawab pertanyaan SOP/operasional dari dokumen yang disetujui, menampilkan sumber jika tersedia, dan menangani kekurangan sumber dengan jujur |
| MVP-10 | Auditabilitas | Mencatat aktor/waktu untuk approval penting, mutasi stok, verifikasi output, keputusan QC, perubahan Rate Card, serta hasil payroll/PO/invoice pada alur yang diimplementasikan |
| MVP-11 | Kalkulasi Finance dasar | Dana makan bersama (asumsi sementara), QC bonus pool tiga penerima, dan overhead bulanan per unit berdasarkan rumus sederhana |
| MVP-12 | Invoice PDF | Finance dapat menghasilkan invoice PDF on-demand dari harga/ketentuan Production Order yang telah disepakati; pengiriman ke klien tetap manual |

## 4.2 P1 - Sebaiknya Ada Jika Waktu Memungkinkan

- Estimasi kebutuhan material dari Sample BOM yang disetujui × kuantitas Production Order. Allowance waste hanya digunakan jika nilai/aturan disetujui dan tersedia.
- Estimasi total kandungan kerja: jumlahkan time study tiap komponen, lalu kalikan jumlah kebutuhan komponen/order. Ini bukan jaminan tanggal selesai.
- Dashboard ringkas untuk order aktif, output, hasil QC, mesin/pekerja aktif, dan peringatan inventaris.
- Ringkasan stok opname dan waste/scrap di luar demo anti-kontaminasi minimum.
- Alur review/kunci payroll dan rekap yang mudah dicetak atau dikirim sebagai PDF.
- Portal untuk melihat saldo bahan titipan serta timeline order yang lebih rinci.
- Laporan lebih lengkap dan penyaringan audit log.

## 4.3 P2 - Di Luar Scope MVP Tiga Hari

Kecuali rubrik resmi hackathon mewajibkannya, tunda hal berikut:

- Transfer gaji melalui bank, pajak payroll, atau integrasi akuntansi penuh.
- Procurement suite penuh (supplier lifecycle, tender, pencarian vendor otomatis, perbandingan quotation otomatis, negosiasi/panggilan vendor, dan pemesanan otomatis) di luar pembuatan, approval, pencatatan vendor manual, dan penerimaan PO yang dibutuhkan.
- Aplikasi native mobile yang terpisah dari web responsif.
- AI untuk optimasi line balancing, klasifikasi defect visual, analitik prediktif, deteksi anomali payroll/inventaris, costing end-to-end, serta rekomendasi harga/margin kepada klien.
- Integrasi notifikasi pihak ketiga atau kanal komunikasi eksternal yang kompleks.
- Payroll karyawan non-penjahit, perhitungan pajak/transfer bank, costing produk lengkap, pembagian laba, dan alokasi overhead berdasarkan jam mesin/lini/klien.
- Optimasi production-grade untuk seluruh workflow pabrik di luar alur demo dan skenario penerimaan yang dipilih.

# 5. Alur Bisnis Inti

## 5.1 Registrasi Klien dan Siklus Sampel

1. Klien yang berminat menggunakan jasa maklon melakukan registrasi data bisnis/kontak. Sistem menyimpan `Client Record / Client ID`; **registrasi ini bukan pembuatan akun login portal**.
2. Sampler membuat `Sample Request ID` dan mengelola sample khusus. Sample BOM, spesifikasi, time study per komponen, dan riwayat revisi dicatat pada sample/version terkait.
3. Klien mengevaluasi sample. Jika meminta revisi, Sampler/Tim Sample membuat `Sample Version ID` baru dan mempertahankan versi sebelumnya.
4. Setelah klien dan Lukla mencapai deal atas sample, spesifikasi, dan ketentuan harga/komersial terkait, **Sampler menandai versi sample yang disepakati sebagai `Approved` di sistem**.
5. Jika klien tidak melanjutkan atau deal tidak tercapai, Sample Request dapat ditutup; histori tetap ada, tetapi Production Order dan akun login klien tidak dibuat.
6. Setelah sample Approved, klien meminta Production Order kepada Sampler. Proses registrasi, pembahasan, dan revisi sample dilakukan melalui komunikasi/fasilitasi Sampler sebelum akun portal aktif.

## 5.2 Siklus Production Order dan Approval Owner

1. Setelah klien meminta order dari sample/version Approved (atau referensi produk internal Snøhund), Sampler membuat draft Production Order berisi Client ID/sumber internal, referensi sample/version, skema maklon, kuantitas, harga/ketentuan yang sudah disepakati, dan target waktu.
2. Sampler mengajukan draft kepada Owner untuk keputusan di sistem. Owner adalah **satu-satunya approver Production Order di sistem**. Owner dapat berkonsultasi dengan Head Production mengenai kapasitas/timeline; konsultasi ini tidak menjadi approval sistem kedua.
3. Jika Owner menolak, status menjadi `Rejected by Owner`; sistem mencatat aktor/waktu/alasan, tidak membuat akun baru, dan memblokir order dari produksi.
4. Jika Owner menyetujui, order menjadi `Approved/Accepted`. **Baru setelah approval ini**, akun portal klien eksternal dibuat/diaktifkan bila Client ID belum memiliki akun. Akun ditautkan ke Client ID; jika klien sudah memiliki akun dari order sebelumnya, tidak dibuat duplikat. Order internal Snøhund tidak memerlukan akun klien eksternal.
5. Setelah order approved, Kepala Produksi mereview detail order, membedah/memetakan komponen, menyusun assembly/routing dan kebutuhan lini, lalu mengarahkan persiapan material. Produksi belum mulai sampai material dan komponen terkait siap.
6. Rekomendasi traceability: `Sample Request ID` dan `Sample Version ID` tetap menjadi referensi historis, sedangkan order memakai `Production Order ID` tersendiri yang terhubung ke sample sumber. Makna literal “ID sample menjadi ID order” masih perlu dikonfirmasi: apakah yang dimaksud perubahan tahap/status di UI atau benar-benar mengganti identifier.

Status minimal: `Draft` -> `Pending Owner Approval` -> `Approved/Accepted` atau `Rejected by Owner`. Jika kesepakatan harga/ketentuan belum tercapai, jangan mengajukan order sebagai deal final. Order `Draft`, `Pending Owner Approval`, dan `Rejected by Owner` tidak dapat memulai produksi massal.

## 5.3 Pesanan Internal Snøhund

Snøhund menggunakan model *made to order*, dengan Full Package sebagai skema standar. Jika referensi produk/style atau sampel display internal telah disetujui dan spesifikasinya tidak berubah, Production Order dapat memakai referensi tersebut tanpa membuat Sample Request khusus. Desain baru atau perubahan spesifikasi yang membutuhkan sampel tetap mengikuti siklus sampel/revisi.

PRD ini tidak mengasumsikan bahwa sampel/display otomatis merupakan stok barang jadi. Perlakuan inventaris terhadap sampel display mengikuti praktik bisnis sebenarnya dan menjadi **KEPUTUSAN TERBUKA** jika perlu diimplementasikan.

## 5.4 PO Bahan dan Penerimaan Material

- **CMT:** material yang disediakan klien dicatat sebagai bahan titipan; PO internal tidak otomatis diperlukan untuk bahan utama tersebut.
- **Semi-CMT:** bahan utama dari klien serta aksesori/bahan pendukung dari Lukla dilacak secara terpisah; PO dipakai untuk bahan yang harus dibeli Lukla.
- **Full Package/Snøhund:** bahan yang disediakan Lukla dipersiapkan sesuai kebutuhan order.
- Kepala Produksi membuat draf PO, memasukkan item/kuantitas serta vendor dan harga yang sudah dipilih secara manual, lalu mengajukan PO untuk approval. Finance meninjau kebutuhan, kuantitas, harga, dan kesesuaian skema, kemudian menyetujui atau menolak.
- Setelah approval, penerbitan/pengiriman PO kepada vendor dilakukan manual oleh pengguna berwenang; sistem tidak mencari, menelepon, menegosiasikan, atau memesan dari vendor secara otomatis.
- Warehouse mencatat kuantitas penerimaan aktual, termasuk penerimaan sebagian, dan memberi tag kepada klien/order atau konteks Sample Request yang relevan. Status `Approved/Issued` tidak berarti barang sudah diterima.
- Apakah consumables CMT (misalnya benang/jarum) membutuhkan PO terpisah merupakan **KEPUTUSAN TERBUKA**.

## 5.5 Inventaris dan Pencegahan Kontaminasi Silang

Setiap catatan/mutasi stok bahan, WIP, dan barang jadi yang relevan harus mempertahankan hubungan kepemilikan serta order. Sebelum pengeluaran bahan ke cutting/produksi disimpan, backend memvalidasi kecocokan pemilik/order dengan tujuan pengeluaran. Ketidakcocokan harus diblokir dan tidak boleh mengurangi saldo stok. Percobaan yang gagal sebaiknya dapat diaudit pada alur yang sudah diimplementasikan.

Bahan yang diterima untuk sampel sebelum order ada harus ditautkan ke `Sample Request ID`; bahan tersebut tidak boleh dipaksa memakai `Production Order ID` yang belum ada.

## 5.6 Pelacakan Produksi dan QC

- Kepala Produksi mengalokasikan penjahit ke mesin/lini secara dinamis, dengan dukungan kapasitas operasional sekitar 70 mesin aktif.
- Output komponen dicatat per interval 30 menit oleh aktor yang berwenang dan diverifikasi oleh Mandor sesuai workflow yang dipilih.
- Aturan penggabungan komponen harus menentukan kapan pekerjaan komponen dapat direpresentasikan sebagai produk utuh yang menunggu QC. Cara penggabungan yang tepat merupakan **KEPUTUSAN TERBUKA**.
- QC mencatat `Pass`, `Repair`, atau `Reject`, serta kategori/catatan defect bila relevan. `Repair` diarahkan untuk pengerjaan ulang dan inspeksi ulang; `Reject` diarahkan ke penanganan defect/karantina. Kebijakan penggantian unit Reject dan penyelesaian order masih merupakan keputusan terbuka.

## 5.7 Payroll dan Ringkasan Biaya

- Scope payroll tenaga kerja MVP dibatasi pada buruh jahit. Upah borongan dijalankan setiap Sabtu berdasarkan output komponen terverifikasi per pekerja × tarif efektif per komponen. Payroll pekerja cutting atau staf non-penjahit di luar scope.
- Working assumption kelompok: Head Production menetapkan Rate Card upah per komponen; Finance menggunakan nilai efektif untuk kalkulasi. Simpan histori dan periode berlakunya tarif.
- Uang makan dihitung sebagai persentase yang dapat dikonfigurasi (baseline PPT 10–15%) dari total ongkos jahit periode. Untuk MVP, perlakuan sementara adalah anggaran makan bersama; bukan potongan atau tambahan otomatis ke gaji individu. Ini masih perlu dikonfirmasi.
- Setiap produk utuh yang final berstatus Lolos QC menyumbang rate bonus per unit ke pool akumulatif lintas order/klien, dibagi rata kepada dua Mandor dan satu Kepala Operasional. Unit Repair tidak menambah pool sebelum lolos inspeksi ulang; Reject tidak eligible; satu unit dikreditkan sekali. Periode pembayaran dan pembulatan masih terbuka.
- Overhead bulanan: input biaya minimal listrik, air, internet (kategori tambahan seperti perawatan mesin hanya bila disepakati); bagi total biaya dengan jumlah unit produk yang diproduksi pada bulan yang sama, mengikuti baseline BRD. Tidak ada alokasi per mesin/lini/klien. Jika jumlah unit nol/belum tersedia, kalkulasi ditolak.
- Finance meninjau dasar dan hasil kalkulasi sebelum rekap dikunci/diterbitkan. Efek Repair/Reject terhadap upah borongan tetap terbuka; tidak ada clawback otomatis tanpa keputusan bisnis eksplisit.

Keputusan finansial yang belum final tercantum pada Bagian 13.

## 5.8 Invoice PDF

- Finance memilih Production Order yang memiliki harga/ketentuan komersial yang telah disepakati. Sistem mengisi data klien/order, deskripsi, kuantitas, harga satuan, total, nomor dan tanggal invoice sesuai aturan yang ditetapkan.
- Finance meninjau dan menghasilkan PDF on-demand untuk diunduh/dikirim/dicetak secara manual. Tidak ada pengiriman otomatis dan AI tidak menetapkan harga.
- Pemicu resmi penerbitan invoice (misalnya Accepted/Deal, produk selesai, atau penyerahan) belum disepakati. Untuk demo, gunakan invoice on-demand dari order dengan harga yang telah disepakati. Invoice PDF tidak otomatis merupakan faktur pajak resmi.

## 5.9 User Stories Kunci

| ID | User story | Nilai bisnis / hasil yang diharapkan | Prioritas |
|---|---|---|---|
| US-01 | Sebagai Sampler, saya ingin mencatat BOM sample dan time study per komponen agar data dasar produk tersimpan dan bisa ditelusuri antarversi. | Konsumsi material dan waktu komponen terdokumentasi. | P0 |
| US-02 | Sebagai Kepala Produksi, saya ingin mengelola tarif upah per komponen dengan histori agar tingkat kesulitan pekerjaan dapat direfleksikan dalam Rate Card. | Payroll memiliki tarif yang jelas dan historisnya tidak tertimpa. | P0 |
| US-03 | Sebagai Finance, saya ingin menghitung upah borongan buruh jahit berdasarkan output terverifikasi dan Rate Card efektif agar rekap mingguan akurat. | Rincian output, tarif, subtotal, pekerja, dan periode dapat diperiksa. | P0 |
| US-04 | Sebagai Finance, saya ingin menghitung dana makan bersama, bonus QC, dan overhead dengan parameter transparan agar rekap biaya bisa ditelusuri. | Formula serta input terlihat; asumsi belum disahkan diberi label. | P0 |
| US-05 | Sebagai Finance, saya ingin menghasilkan invoice PDF dari harga order yang sudah disepakati agar tagihan dapat dibagikan tanpa input ulang seluruh detail. | PDF sesuai data sumber; pengiriman dan pemilihan timing tetap manual. | P0 |
| US-06 | Sebagai Kepala Produksi, saya ingin estimasi material dan total kandungan kerja dihitung dari sample BOM/time study yang disetujui agar saya dapat merencanakan kebutuhan awal. | Estimasi deterministik; allowance hanya bila disetujui; tidak mengklaim tanggal selesai. | P1 |
| US-07 | Sebagai pengguna internal yang berwenang, saya ingin bertanya tentang SOP dan mendapat jawaban dengan sumber agar prosedur lebih mudah ditemukan. | Q&A berbasis dokumen, role-based, tanpa akses transaksi real-time. | P0 (AI hackathon) |

# 6. Persyaratan Fungsional

Label prioritas: **P0** = wajib untuk demonstrasi MVP; **P1** = bermanfaat jika waktu memungkinkan; **P2** = pengembangan berikutnya/di luar scope tiga hari kecuali diwajibkan rubrik hackathon.

## FR-01 - Autentikasi, Akun Pengguna, dan Hak Akses (P0)

- Sistem mendukung delapan role bisnis pada Bagian 3.
- Akun klien terhubung ke satu `Client ID` yang berwenang.
- Backend/API menegakkan otorisasi; menyembunyikan elemen UI saja tidak cukup.
- Perubahan status kritis hanya boleh dilakukan role yang berwenang.

**Kriteria penerimaan**
- Akun klien hanya dapat dibuat/diaktifkan setelah Production Order pertama untuk Client ID tersebut disetujui Owner. Sebelum itu, proses sample/deal dilakukan tanpa login portal. Setelah aktif, akun Klien A tidak dapat mengambil data sampel historis, order, inventaris, atau laporan Klien B hanya dengan mengganti ID di URL.
- Role Finance tidak dapat membuat PO bahan baku.
- Sampler tidak dapat menyetujui Production Order yang dibuatnya sendiri.

## FR-02 - Registrasi Client Record dan Provisioning Akun Portal (P0)

- Saat awal mengajukan jasa maklon, klien melakukan registrasi data bisnis/kontak sehingga sistem memiliki `Client Record / Client ID`.
- Registrasi Client Record tidak membuat akun login portal; klien belum login atau mengakses portal pada tahap sample.
- Setelah Production Order pertama klien eksternal disetujui Owner, pengguna internal berwenang membuat/mengaktifkan User Account dan menautkannya ke Client ID. Order yang ditolak tidak membuat akun baru.
- Jika klien sudah memiliki akun dari Production Order sebelumnya, jangan membuat akun duplikat; tautkan order baru pada Client ID yang sama.
- Pisahkan `Client ID` level organisasi dari identitas login pengguna.
- Halaman yang dilihat klien hanya menampilkan informasi yang diizinkan dan terkait dengan identitas klien yang telah diautentikasi.

**Kriteria penerimaan**
- Sample Request dapat ada tanpa Production Order.
- User klien dipetakan ke Client ID yang tepat.
- Akses halaman/API lintas klien ditolak.

## FR-03 - Sample Request, Versioning, BOM, dan Time Study (P0)

- Buat Sample Request ID/Sample Version ID terpisah dari Production Order ID. Jangan menimpa ID sample saat order dibuat; order menyimpan referensi sample/version sumber.
- Catat spesifikasi sampel, daftar komponen, Sample BOM/pemakaian bahan, percobaan time study, dan catatan.
- Simpan setiap revisi sebagai Sample Version ID terpisah; pertahankan versi sebelumnya.
- Catat keputusan klien: menunggu review, meminta revisi, menyetujui, atau menutup/tidak melanjutkan sesuai kondisi.
- Tutup permintaan sampel tanpa order tanpa menghapus histori.

**Kriteria penerimaan**
- Sampel v1 dapat direvisi menjadi v2; v1 tetap dapat dilihat.
- Order yang dibuat dari v2 merujuk secara eksplisit ke versi yang disetujui tersebut.
- Permintaan yang ditutup karena tidak dilanjutkan tidak membuat Production Order.

## FR-04 - Referensi Produk/Style Internal (P0)

- Simpan referensi style/sampel internal Snøhund yang disetujui untuk pesanan made-to-order.
- Izinkan Production Order Snøhund merujuk referensi style/sampel display yang disetujui jika spesifikasi tidak berubah.
- Wajibkan alur sampel/revisi untuk desain atau spesifikasi baru yang membutuhkan sampel.

**Kriteria penerimaan**
- Order dapat memakai referensi internal yang valid tanpa otomatis membuat Sample Request khusus baru.
- Referensi/versi yang dipilih tetap tercatat pada order.

## FR-05 - Production Order dan Approval Owner (P0)

- Sampler membuat draft Production Order dari sample version yang berstatus `Approved` atau referensi produk internal Snøhund yang valid.
- Sample Approval adalah langkah berbeda: setelah sample dan ketentuan harga/komersial disepakati, Sampler menandai Sample Version sebagai `Approved`.
- Hanya Owner memiliki tombol approval Production Order di sistem. Owner dapat berkonsultasi dengan Head Production untuk masukan kapasitas/timeline, tetapi tidak ada approval sistem Head Production.
- Setelah Owner menyetujui, status menjadi `Approved/Accepted`; jika menolak, status `Rejected by Owner` dan alasan/aktor/waktu dicatat bila tersedia.
- Setelah order eksternal pertama disetujui, buat/aktifkan akun portal klien jika belum ada. Penolakan tidak membuat akun baru.
- Setelah approval, Head Production meninjau order, memetakan komponen produk dan urutan assembly/routing sebelum persiapan produksi.
- Simpan hubungan ke Sample Request ID dan Sample Version ID; identifier sample tetap dipertahankan.
- Perubahan material setelah approval (harga, kuantitas, skema, timeline) perlu kembali ditinjau Owner; jangan mengubah histori secara diam-diam.

**Kriteria penerimaan**
- Hanya Owner yang dapat approve/reject Production Order melalui UI dan backend.
- Sample yang belum Approved tidak dapat dipakai untuk order khusus berbasis sample.
- Order tidak dapat `Approved/Accepted` jika Owner belum menyetujui.
- Jika Owner menolak, order tidak dapat masuk produksi dan akun portal klien baru tidak dibuat.
- Jika Owner menyetujui order pertama dari klien eksternal, akun portal dibuat/diaktifkan satu kali dan ditautkan ke Client ID.
- Setelah approval, Head Production dapat menyiapkan komponen/assembly plan; langkah ini bukan approval order kedua.

## FR-06 - Skema Maklon dan Kebutuhan Material (P0)

- Setiap Production Order eksternal harus memilih CMT, Semi-CMT, atau Full Package.
- Order Snøhund menggunakan Full Package sebagai default.
- Skema menentukan material yang dititipkan klien dan material yang harus dipasok Lukla.
- Sistem tidak boleh secara otomatis mensyaratkan PO internal untuk bahan utama yang memang disediakan klien pada CMT.

**Kriteria penerimaan**
- CMT, Semi-CMT, dan Full Package menampilkan/menggunakan aturan tanggung jawab material yang sesuai.
- Order Snøhund menggunakan Full Package secara default kecuali terdapat pengecualian yang telah disetujui.

## FR-07 - PO Bahan Baku dan Approval (P0)

- Kepala Produksi dapat membuat dan mengajukan PO bahan.
- Finance dapat menyetujui atau menolak PO yang diajukan; Finance tidak boleh membuat PO.
- Keputusan approval/penolakan dicatat dengan aktor dan timestamp.
- PO yang ditolak dikembalikan untuk revisi/pengajuan ulang, bukan dianggap sudah disetujui.

**Kriteria penerimaan**
- Role Finance tidak memiliki aksi create-PO dan tidak dapat membuat PO melalui API.
- Kepala Produksi dapat membuat/mengajukan PO.
- Hanya PO approved yang dianggap telah mendapat persetujuan untuk proses pembelian berikutnya.

## FR-08 - Inventaris Multi-Klien dan Anti-Kontaminasi (P0)

- Lacak bahan, WIP, dan barang jadi dengan hubungan pemilik/order yang relevan; bahan sampel sebelum order dapat terhubung ke Sample Request ID.
- Catat penerimaan, pengeluaran, perpindahan, dan koreksi stok yang relevan.
- Validasi kecocokan pemilik/order saat bahan dikeluarkan.
- Blokir ketidakcocokan sebelum mutasi stok disimpan; saldo tidak boleh berubah akibat transaksi yang ditolak.
- Catat waste/scrap dengan konteks klien/order bila berlaku.

**Kriteria penerimaan**
- Upaya mengeluarkan material Klien A untuk order Klien B diblokir.
- Saldo inventaris dan ledger mutasi tidak berubah untuk transaksi yang diblokir.
- Kepemilikan dan histori pergerakan material dapat ditelusuri untuk transaksi valid.

## FR-09 - Lini Produksi dan Alokasi Pekerja (P0)

- Mendukung alokasi pekerja/mesin yang dinamis hingga sekitar 70 mesin jahit aktif.
- Jumlah slot pekerja tidak boleh dikunci pada batas tetap yang ditanam dalam kode.
- Setiap output terhubung dengan pekerja, order, komponen/artikel, periode waktu, dan status verifikasi.

**Kriteria penerimaan**
- Lima pekerja baru dapat ditambahkan di tengah minggu dan menerima tugas tanpa harus mengubah batas kapasitas sistem.
- Data pekerja/output tetap terkait order dan komponen yang tepat.

## FR-10 - Pencatatan Output Tiap 30 Menit dan Verifikasi (P0)

- Catat kuantitas komponen selesai untuk setiap interval 30 menit.
- Dukung mode input yang disepakati (penjahit input sendiri atau Mandor input langsung); jika input mandiri penjahit digunakan, lakukan verifikasi Mandor sesuai aturan.
- Catatan output terverifikasi tidak boleh diubah diam-diam; koreksi harus menggunakan alur koreksi/audit yang berizin.
- Output terverifikasi menjadi sumber metrik produksi dan payroll, sesuai aturan eligibilitas payroll yang masih perlu disepakati.

**Kriteria penerimaan**
- Output untuk pekerja/order/interval yang benar tercatat dan dapat diverifikasi.
- Role yang tidak berwenang tidak dapat menimpa catatan output yang sudah diverifikasi.

## FR-11 - Penggabungan Komponen dan Status WIP (P0 minimum; aturan penggabungan terbuka)

- Lacak WIP komponen dan representasikan kapan komponen siap digabung menjadi produk utuh.
- Pindahkan produk lengkap yang eligible ke `Waiting for QC` sesuai aturan penggabungan yang disetujui bisnis.
- Untuk demo MVP, gunakan serah-terima manual yang dikonfirmasi Mandor bila aturan otomatis belum disepakati; jangan menganggap metode otomatis tertentu sebagai kebijakan final.
- Perhitungan penggabungan tidak dianggap final sebelum aturan ditetapkan.

**Kriteria penerimaan**
- Produk tidak masuk antrean QC bila komponen wajib masih kurang menurut aturan yang dipilih.
- Jumlah produk tercatat dapat direkonsiliasi dengan jumlah komponen.

## FR-12 - QC dan Routing Defect (P0)

- QC Inspector mencatat salah satu hasil: `Pass`, `Repair`, atau `Reject`.
- Repair memerlukan jalur kembali untuk pengerjaan ulang dan pemeriksaan ulang.
- Reject diarahkan ke penanganan defect/karantina/scrap yang ditetapkan.
- Catat kategori cacat dan catatan; bukti foto bersifat opsional jika didukung UI MVP.
- Hasil Pass yang eligible memicu perhitungan bonus QC sesuai kebijakan yang disetujui.

**Kriteria penerimaan**
- Setiap hasil QC menghasilkan status berikutnya yang sesuai.
- Repair tidak dihitung sebagai Pass final sebelum diperiksa ulang dan dinyatakan lolos, sesuai aturan final yang disepakati.
- Reject tidak diperlakukan sebagai barang jadi layak jual.

## FR-13 - Rate Card Upah Jahit dan Riwayat Perubahan (P0)

- Rate Card MVP menyimpan tarif upah **jahit per artikel/komponen**. Tarif upah tim cutting di luar scope payroll MVP.
- Working assumption kelompok: Head Production menetapkan/mengelola tarif komponen karena memahami tingkat kesulitan teknis. Finance menggunakan tarif tersebut untuk kalkulasi payroll; bukan mengubah tarif saat menjalankan payroll.
- Perubahan tarif menyimpan nilai, aktor, timestamp, dan tanggal/periode efektif. Tarif baru tidak boleh mengubah kalkulasi historis yang sudah dibuat.
- Kewenangan Owner untuk menyetujui perubahan Rate Card merupakan keputusan yang masih perlu dikonfirmasi; jangan membangun approval bertingkat tambahan tanpa keputusan kelompok.

**Kriteria penerimaan**
- Perubahan tarif oleh role berwenang membuat histori perubahan.
- Preview/kalkulasi payroll dapat menunjukkan tarif yang digunakan.

## FR-14 - Payroll Borongan Mingguan Buruh Jahit (P0)

- Finance menjalankan kalkulasi setiap Sabtu hanya untuk buruh jahit. Untuk setiap pekerja, jumlah output komponen terverifikasi dikalikan dengan tarif komponen efektif, lalu dijumlahkan dalam periode payroll.
- Kalkulasi harus mengambil pekerja dinamis yang aktif dan memiliki output eligible pada periode, termasuk pekerja yang masuk pertengahan minggu.
- Output komponen ditampilkan terpisah per pekerja, komponen, tarif, dan subtotal. Sistem tidak boleh membayar jumlah backpack jadi yang sama ke semua penjahit jika mereka mengerjakan komponen berbeda.
- Kebijakan apakah output yang sudah diverifikasi tetap dibayar jika produk akhir Repair/Reject masih terbuka. Untuk demo gunakan asumsi tertulis dan jangan melakukan clawback otomatis tanpa aturan yang disetujui.
- Payroll tenaga kerja non-penjahit, pajak, transfer bank, absensi/lembur, dan sistem penggajian lengkap berada di luar scope.

**Kriteria penerimaan**
- Hasil cocok dengan kalkulasi manual berdasarkan dataset uji dan aturan yang dinyatakan.
- Rekap menunjukkan pekerja, komponen, output terverifikasi, tarif efektif, subtotal, dan periode perhitungan.

## FR-15 - Dana Uang Makan Bersama (P0; asumsi sementara)

- Finance/role berwenang memasukkan persentase uang makan untuk periode terkait; baseline PPT menyebut kisaran 10-15%.
- Formula jumlah dana adalah persentase × total ongkos jahit periode tersebut.
- Working assumption untuk MVP: hasil dicatat sebagai **anggaran makan bersama**, bukan potongan dari upah buruh dan bukan tambahan otomatis ke slip gaji individu. Angka dihitung dan ditampilkan sebagai pos terpisah.
- Perlakuan sebagai anggaran bersama masih perlu konfirmasi; sampai dikonfirmasi, tampilkan label `Asumsi MVP`.

**Kriteria penerimaan**
- Persentase, basis perhitungan, periode, dan nilai dana ditampilkan.
- Nilai dana tidak mengurangi upah borongan individu.

## FR-16 - Pool Bonus QC (P0)

- Produk unit utuh yang final berstatus Pass/Lolos QC menyumbang rate bonus per unit ke pool akumulatif lintas order dan klien.
- Pool dibagi rata kepada dua Mandor dan satu Kepala Operasional; bonus ini **bukan upah kedua bagi penjahit** dan tidak dibagi kepada penjahit dalam baseline BRD/PPT.
- Unit Repair tidak menambah pool sebelum lolos inspeksi ulang. Jika unit Repair kemudian Pass, unit itu menambah pool sekali saja. Unit Reject tidak eligible.
- Catat jumlah unit eligible, rate, nominal pool, periode/cut-off, dan penerima. Periode pembayaran dan aturan pembulatan masih perlu dikonfirmasi.

**Kriteria penerimaan**
- Uji: 3.000 unit eligible x Rp300/unit = pool Rp900.000; tiga bagian sama besar yaitu Rp300.000 per penerima sebelum pembulatan jika berlaku.
- Unit yang tidak memenuhi syarat tidak boleh menambah pool.

## FR-17 - Perhitungan Overhead Bulanan Dasar (P0)

- Finance memasukkan biaya operasional bulanan minimal listrik, air, dan internet. Kategori tambahan seperti perawatan mesin hanya digunakan bila disepakati; MVP tidak membuat costing kompleks.
- Rumus baseline BRD: total biaya operasional bulanan ÷ total unit yang diproduksi dalam bulan tersebut. Gunakan total produk utuh yang dicatat sebagai diproduksi; jangan menghitung jumlah komponen jahit sebagai unit produk.
- Tidak membagi overhead per mesin/lini/klien dan tidak otomatis memasukkannya ke upah pekerja atau harga invoice.
- Jika jumlah unit nol/belum tersedia, sistem tidak melakukan pembagian dan menampilkan alasan.

**Kriteria penerimaan**
- Total biaya, kategori, periode, total unit produk, dan overhead/unit dapat ditinjau dan direproduksi.

## FR-18 - Dashboard Operasional dan Laporan (P1)

- Rangkum order aktif/accepted, progres order, aktivitas lini/mesin, output dari waktu ke waktu, hasil QC, peringatan inventaris, serta ringkasan payroll/biaya jika datanya tersedia.
- Bedakan data aktual dan data uji/sampel dengan jelas.

**Kriteria penerimaan**
- Setiap metrik yang ditampilkan memiliki definisi perhitungan serta pembatasan akses yang benar.
- Tampilan klien tidak pernah memperlihatkan informasi klien lain.

## FR-19 - Portal Klien Maklon (P0)

- Klien dengan akun yang diotorisasi dapat memantau permintaan sampelnya (jika diaktifkan), status order, progres yang dipublikasikan, dan informasi stok titipan dalam batas yang diizinkan.
- Semua query portal harus dibatasi berdasarkan Client ID dari identitas terautentikasi di backend.
- Data tidak boleh dianggap berizin hanya karena pengguna mengirim Client ID di request.

**Kriteria penerimaan**
- Klien A hanya mengambil data milik Klien A.
- Request langsung ke URL/API untuk sumber daya Klien B ditolak tanpa membocorkan detail sensitif.

## FR-20 - AI Assistant Pengetahuan Operasional (P0; Persyaratan Hackathon)

- Sediakan antarmuka percakapan untuk pertanyaan mengenai SOP Lukla yang disetujui, aturan maklon, lifecycle sampel/order, kontrol inventaris, produksi, QC, dan konsep payroll yang ada di dokumen sumber.
- Gunakan dokumen rujukan yang disetujui sebagai sumber pengetahuan. Pendekatan berbasis retrieval (misalnya RAG) merupakan usulan implementasi, bukan keharusan memilih vendor/model tertentu.
- Tampilkan referensi sumber/kutipan jika tersedia.
- Jika sumber tidak mendukung jawaban, nyatakan bahwa jawabannya belum dapat dikonfirmasi dari dokumen saat ini dan arahkan pengguna ke role terkait atau daftar keputusan terbuka.
- Terapkan autentikasi dan pembatasan akses yang relevan sebelum informasi terproteksi diambil.
- Untuk MVP, AI dibatasi pada **tanya-jawab SOP/dokumen saja**; query langsung ke Production Order, payroll, atau inventaris klien yang sedang berjalan berada di luar scope kecuali rubrik hackathon secara eksplisit mewajibkannya.

**Kriteria penerimaan**
- Pertanyaan yang didukung sumber menghasilkan jawaban yang sesuai dan menampilkan referensi sumber jika tersedia.
- Pertanyaan tanpa dukungan sumber menghasilkan penjelasan keterbatasan, bukan aturan rekaan.
- Prompt atau Client ID yang dimasukkan pengguna tidak dapat melewati otorisasi backend.
- Asisten tidak mengklaim telah mengubah order, stok, payroll, atau catatan bisnis lainnya.

## FR-21 - Audit Trail dan Perubahan Status Kritis (P0 untuk alur kritis)

- Catat aktor, timestamp, tindakan, record yang menjadi target, dan hasil untuk keputusan Production Order, keputusan PO, mutasi stok, verifikasi/koreksi output, keputusan QC, serta perubahan Rate Card/parameter finansial pada alur yang diimplementasikan.
- Catatan historis yang terkunci tidak boleh ditimpa diam-diam; koreksi harus diwakili sebagai penyesuaian yang terkendali.

**Kriteria penerimaan**
- Approval/penolakan dan percobaan pengeluaran stok yang diblokir dapat ditelusuri.
- Versi sampel historis atau spesifikasi order yang sudah diterima tetap terjaga saat versi sampel baru dibuat.

## FR-22 - Estimasi Bahan dan Total Kandungan Kerja Sederhana (P1)

- Untuk produk/sample yang memiliki BOM dan time study yang disetujui, sistem dapat menghitung estimasi kebutuhan tiap material berdasarkan konsumsi per unit × kuantitas order. Jika allowance waste belum disetujui atau tidak tersedia, jangan menambahkan allowance secara otomatis.
- Sistem dapat menghitung total kandungan kerja standar dengan menjumlahkan waktu per komponen dan mengalikannya dengan kuantitas kebutuhan komponen. Output berupa total menit/jam-orang, bukan prediksi tanggal selesai.
- Estimasi material/time study bukan rekomendasi harga jual dan tidak menggunakan AI untuk melakukan kalkulasi. AI hanya menjelaskan metode dari dokumen dalam scope SOP Assistant.
- Untuk prototipe backpack, gunakan synthetic/mock data yang diberi label jelas saat development; jangan menyatakan angka simulasi sebagai standar Lukla.

**Kriteria penerimaan**
- Hasil estimasi dapat direproduksi dari input yang terlihat.
- Input yang tidak tersedia menghasilkan status `Insufficient data`/permintaan input, bukan angka karangan.
- Hasil mencantumkan sample version/sumber BOM dan asumsi yang digunakan.

## FR-23 - Invoice PDF Berdasarkan Harga yang Disepakati (P0)

- Finance dapat memilih Production Order yang memiliki harga/ketentuan komersial yang disepakati, meninjau detail invoice, lalu menghasilkan PDF on-demand.
- Invoice memuat nomor dan tanggal, identitas klien, Production Order ID, deskripsi produk/jasa, kuantitas, harga satuan, total, dan informasi pembayaran yang tersedia.
- Nilai diambil dari data order yang disepakati; sistem tidak menyarankan atau memprediksi harga maupun margin. Pengiriman kepada klien dilakukan manual.
- Pemicu/timing penerbitan invoice masih terbuka; untuk demo, Finance membuat invoice on-demand dari order dengan harga yang disepakati. Invoice PDF bukan otomatis faktur pajak resmi.

**Kriteria penerimaan**
- Total di PDF sama dengan perhitungan dari detail invoice/order.
- PDF dapat diunduh/ditampilkan tanpa mengirimnya otomatis ke klien.
- Order tanpa harga/ketentuan yang disepakati tidak dapat menghasilkan invoice demo yang tampak final.

# 7. Model Status Utama

## 7.1 Client Record dan Sample Request

- Client Record dapat dibuat saat registrasi awal, sebelum sample; tidak mengandung izin login portal.
- Sample Request: `Draft / Registered` -> `In Progress` -> `Pending Client Review` -> `Revision Requested` (membuat version baru), `Approved` (ditandai Sampler setelah deal pada sample/ketentuan), atau `Closed - Not Proceeding`.
- Account portal belum tersedia ketika status sample berjalan. Jika sample ditutup tanpa order, tidak ada akun baru dibuat.

## 7.2 Production Order - Status dan Transisi

- `Draft` - Sampler membuat draft order dari Sample Version Approved atau referensi produk internal yang valid.
- `Pending Owner Approval` - draft menunggu Owner.
- `Approved/Accepted` - Owner approve; untuk klien eksternal baru, akun portal dibuat/diaktifkan setelah status ini.
- `Rejected by Owner` - Owner menolak; akun portal tidak dibuat, dan order tidak dapat masuk ke produksi.

Owner adalah satu-satunya approver sistem. Konsultasi dengan Head Production dapat dilakukan sebelum keputusan Owner, tetapi tidak menjadi approval sistem terpisah. Setelah order approved, Head Production memetakan komponen dan urutan assembly/routing. Sample Request ID dan Sample Version ID tetap dipertahankan dan menjadi foreign reference bagi Production Order.

## 7.3 Transisi Status QC

- `Waiting for QC` -> `Pass` -> eligible untuk barang jadi dan bonus QC sesuai kebijakan;
- `Waiting for QC` -> `Repair` -> `Rework` -> `Waiting for QC` untuk inspeksi ulang;
- `Waiting for QC` -> `Reject` -> `Defect Quarantine/Scrap` mengikuti prosedur yang disepakati.

# 8. Kebutuhan UI/UX

Aplikasi mengutamakan web responsif serta tampilan tablet/layar sentuh untuk operasional lantai pabrik. Aplikasi native mobile terpisah tidak diwajibkan untuk MVP.

| Tampilan | Pengguna utama | Tanggung jawab MVP |
|---|---|---|
| Dashboard Operasional | Owner, Kepala Produksi | Order aktif/accepted, aktivitas lini, ringkasan output, QC, dan peringatan inventaris |
| Sample & Time Study | Sampler / Tim Sample; keputusan klien difasilitasi melalui Sampler sebelum akun portal aktif | Permintaan sampel, riwayat versi, catatan BOM/time study, status keputusan klien |
| Workspace Produk/Production Order | Sampler, Owner, Kepala Produksi | Referensi produk internal, draft order, skema maklon, ketentuan, approval Owner-only, masukan kapasitas dari Kepala Produksi, dan status order |
| Gudang & Inventaris | Warehouse, Kepala Produksi untuk tampilan yang diizinkan | Penerimaan, tag kepemilikan/order, validasi pengeluaran, mutasi, dan peringatan stok |
| Terminal Produksi | Penjahit/Operator, Mandor | Kontrol besar untuk input output per 30 menit dan verifikasi |
| Terminal QC | QC Inspector | Input cepat Pass/Repair/Reject, informasi defect, dan status routing |
| Workspace Payroll & Biaya | Finance & Payroll, Owner untuk tampilan berizin | Preview payroll, bonus QC, uang makan, overhead, periode dan basis kalkulasi |
| Portal Klien | Klien maklon | Progres sampel/order miliknya serta tampilan bahan titipan yang diizinkan |
| AI Assistant | Role terautentikasi | Chat, jawaban, sumber/kutipan, dan penanganan jawaban tanpa dukungan sumber |

### Persyaratan UX

- Form untuk lantai pabrik memakai kontrol besar yang ramah sentuhan dan meminimalkan input teks bebas jika pilihan terkontrol sudah memadai.
- Pesan error untuk tindakan bisnis kritis harus menyatakan apa yang gagal dan cara menyelesaikannya.
- Halaman approval menunjukkan approval mana yang masih menunggu dan siapa yang telah memberikan keputusan.
- Tampilan kalkulasi finansial memperlihatkan periode, tarif/parameter yang diterapkan, dan apakah hasil merupakan preview/uji atau hasil final.
- Riwayat revisi sampel memudahkan pengguna melihat versi terdahulu dan mencegah versi yang dirujuk order terganti diam-diam.

# 9. Kebutuhan Data Konseptual

Entitas berikut bersifat konseptual. Struktur tabel dan detail kolom perlu difinalkan bersama System Analyst/tim development.

| Entitas | Tujuan | Relasi utama |
|---|---|---|
| Client Record | Identitas organisasi/klien yang terbentuk saat registrasi | Dapat memiliki Sample Request dan Production Order eksternal tanpa akun login; User Account dibuat/diaktifkan setelah Production Order pertama disetujui Owner |
| User Account | Identitas login | Terhubung ke role dan, untuk klien, satu Client ID yang diizinkan |
| Internal Product/Style | Referensi produk Snøhund yang disetujui | Dapat dirujuk oleh beberapa Production Order |
| Sample Request | Melacak pengerjaan sampel khusus | Terkait klien/sumber permintaan; berisi Sample Version |
| Sample Version | Versi spesifikasi sampel yang tidak ditimpa | Milik satu Sample Request; dapat dirujuk oleh Production Order |
| Production Order | Pesanan kerja produksi yang diminta/diterima | Merujuk klien/sumber internal, produk/versi sampel, skema, kuantitas, approval dan status order |
| Order Approval Decision | Menyimpan keputusan approve/reject Owner beserta aktor, waktu, dan alasan | Terhubung ke Production Order; masukan kapasitas Head Production dapat dicatat sebagai konsultasi, bukan approval sistem |
| Material PO | Permintaan pengadaan material dari Lukla | Dibuat/diajukan Kepala Produksi; disetujui/ditolak Finance |
| Material/Stock Lot | Melacak bahan/WIP/barang jadi | Terhubung ke pemilik, order atau konteks sampel, tipe barang dan kuantitas |
| Stock Movement | Ledger penerimaan, pengeluaran, perpindahan, penyesuaian, waste/scrap | Merujuk stock lot, sumber/tujuan, aktor dan timestamp |
| Worker / Machine / Line Assignment | Alokasi operasional dinamis | Menghubungkan pekerja, mesin/lini, order/komponen dan waktu efektif |
| Production Output | Kuantitas selesai per periode 30 menit | Menghubungkan pekerja, order, komponen, interval, verifikasi dan tarif terkait |
| QC Inspection | Hasil inspeksi dan detail defect | Menghubungkan produk/unit/batch dengan hasil dan routing berikutnya |
| Rate Card / Rate History | Tarif dan periode efektif | Digunakan pada kalkulasi payroll berdasarkan artikel/komponen/klien |
| Payroll Run / Payroll Item | Hasil kalkulasi per periode dan pekerja | Merujuk output eligible, tarif, allowance, adjustment dan status review |
| QC Bonus Pool | Akumulasi bonus dari QC eligible | Merujuk unit Pass eligible, tarif, periode dan penerima |
| Monthly Cost Record | Biaya overhead berdasarkan periode/kategori dan jumlah unit produksi | Menjadi masukan kalkulasi overhead per unit |
| Invoice | Dokumen tagihan dari harga/kuantitas yang disepakati | Terhubung ke Production Order dan dapat menghasilkan PDF |
| Estimate Snapshot | Hasil estimasi material/total kandungan kerja | Merujuk Sample Version/BOM, kuantitas order, time study, dan parameter/assumsi |
| Audit Event | Keterlacakan perubahan penting | Menyimpan aktor, tindakan, entitas target, timestamp dan hasil |
| Knowledge Document / AI Source | Sumber pengetahuan AI yang disetujui | Digunakan untuk retrieval/kutipan dan mengikuti aturan akses informasi |

### Aturan Integritas Data

- Gunakan ID terpisah untuk Sample Request dan Production Order.
- Order dari sampel merujuk ke Sample Version yang spesifik dan disetujui; referensi tidak boleh otomatis berubah ke versi terbaru.
- Request dari portal harus menentukan Client ID dari identitas terautentikasi di backend.
- Mutasi stok dan output payroll harus dapat ditelusuri ke record sumbernya.
- Perubahan Rate Card menyimpan waktu efektif/histori agar kalkulasi historis dapat direproduksi.

# 10. Persyaratan Nonfungsional

| ID | Persyaratan | Prioritas/verifikasi |
|---|---|---|
| NFR-01 Otorisasi | Terapkan autentikasi, RBAC, dan isolasi Client ID pada backend/API | P0; uji lintas-role dan lintas-klien |
| NFR-02 Integritas data | Transisi order/stok kritis tidak boleh menghasilkan pembaruan parsial pada saldo | P0; uji transaksi valid/gagal |
| NFR-03 Keterlacakan | Simpan aktor/waktu untuk approval, mutasi stok, verifikasi, QC, dan perubahan tarif kritis | P0 untuk alur yang diimplementasikan |
| NFR-04 Kegunaan | Kontrol produksi/QC harus dapat digunakan pada tablet dan ramah sentuhan | P0; uji pada viewport responsif yang disepakati |
| NFR-05 Responsivitas | Layar inti mendukung desktop dan browser tablet/mobile | P0 untuk layar inti; aplikasi native dikecualikan |
| NFR-06 Error yang dapat dipahami | Tampilkan pesan error yang jelas dan jangan menyatakan sukses jika transaksi gagal | P0 |
| NFR-07 AI berbasis sumber | Jawaban berdasar sumber pengetahuan yang disetujui dan menampilkan rujukan bila tersedia | P0; uji prompt supported/unsupported |
| NFR-08 Pengelolaan rahasia | API key dan kredensial server tidak boleh terekspos di browser/client | P0 |
| NFR-09 Performa | Daftar/form inti tetap dapat digunakan untuk dataset uji hackathon; SLA produksi belum ditentukan | P1; ditetapkan kemudian jika diperlukan |
| NFR-10 Backup/retensi | Kebijakan backup, retensi, dan pemulihan data belum ada di BRD dan perlu ditinjau sebelum penggunaan nyata | Keputusan terbuka/pasca-hackathon |

# 11. Persyaratan dan Guardrail AI Assistant

## 11.1 Use Case MVP

AI wajib digunakan dalam proyek berdasarkan ketentuan resmi hackathon. Use case MVP adalah **internal SOP Knowledge Assistant** untuk membantu pengguna internal menemukan dan memahami SOP/panduan operasional tentang skema maklon, lifecycle sampel/order, kontrol inventaris, produksi, QC, payroll, dan proses PO yang terdokumentasi. AI tidak tersedia untuk klien pada MVP.

## 11.2 Sumber Pengetahuan

- Dokumen BRD/PRD/BPMN dan SOP/panduan operasional yang secara eksplisit dipilih dan disetujui sebagai knowledge corpus.
- Jika SOP resmi belum tersedia, tim dapat membuat draft panduan simulasi yang divalidasi untuk kebutuhan demo; dokumen harus jelas berlabel `Draft/Simulation`, bukan SOP resmi Lukla.
- Keputusan bisnis yang masih pending harus disebut belum diputuskan, bukan dijawab sebagai kebijakan tetap.

## 11.3 Perilaku AI yang Diharapkan

- Menjawab sejauh didukung konten yang ditemukan di sumber.
- Menyertakan judul/potongan sumber atau kutipan jika implementasi mendukungnya.
- Menyatakan ketika informasi tidak dapat dipastikan dari dokumen yang tersedia.
- Tidak mengarang status sistem, approval bisnis, kalkulasi, atau nilai inventaris/order terkini.
- Tidak melakukan tindakan yang mengubah data bisnis.
- Hanya pengguna internal terautentikasi; dokumen yang di-retrieve harus sesuai akses role. Akses klien/B2B portal ke AI dikecualikan dari MVP.
- Tidak mengakses Production Order, inventory, payroll, atau catatan operasional real-time. Jika pengguna membutuhkan angka transaksi tertentu, arahkan ke modul terkait, bukan menebaknya.
- Tidak memasukkan record sensitif klien/order/payroll ke layanan AI untuk MVP.

## 11.4 Batas MVP AI

MVP AI Assistant hanya melakukan tanya-jawab dokumen/SOP untuk pengguna internal yang diizinkan. Tidak ada akses untuk akun klien, tidak ada retrieval transaksi real-time, dan tidak ada AI line balancing, anomaly detection payroll/inventory, visual QC, costing keseluruhan, atau rekomendasi harga. Jika rubrik resmi hackathon mewajibkan use case yang berbeda, scope harus dibahas kembali secara eksplisit sebelum implementasi.

## 11.5 Uji Penerimaan AI

- **AI-AT-01 Pertanyaan didukung:** jawaban sesuai konten SOP yang disetujui dan menyertakan referensi sumber jika tersedia.
- **AI-AT-02 Pertanyaan tidak didukung:** asisten menyatakan informasi tidak tersedia/terkonfirmasi dan tidak mengarang kebijakan.
- **AI-AT-03 Pertanyaan tentang keputusan terbuka:** asisten menyatakan aturan masih menunggu keputusan, bukan memilih kebijakan sendiri.
- **AI-AT-04 Batas akses data:** asisten tidak mengungkap record klien atau konten dokumen tersembunyi ke role yang tidak berhak.
- **AI-AT-05 Tidak mengklaim tindakan:** asisten tidak mengklaim menyetujui order atau mengubah inventaris/payroll.

# 12. Rencana Uji Penerimaan / UAT

| Test ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| UAT-01 | Mencoba mengeluarkan stok Klien A untuk order Klien B | Diblokir; saldo tidak berubah; error menjelaskan ketidakcocokan |
| UAT-02 | Menambah lima pekerja di tengah minggu lalu menghitung payroll Sabtu | Output terverifikasi yang eligible dihitung dengan tarif uji yang berlaku; tidak terhambat batas roster tetap |
| UAT-03 | 3.000 unit QC Pass eligible dengan tarif Rp300/unit | Pool bonus Rp900.000; tiga bagian sama Rp300.000 sebelum pembulatan yang berlaku |
| UAT-04 | Revisi Sample v1 menjadi v2 lalu membuat order dari v2 | v1 tetap tersedia; order merujuk tepat ke v2 |
| UAT-05 | Menutup sampel tanpa melanjutkan | Histori sampel tetap tersimpan; Production Order tidak dibuat |
| UAT-06 | Klien registrasi Client Record tanpa login → Sampler membuat/revisi sample → setelah deal Sampler menandai Sample Version Approved → klien meminta order → Sampler membuat draft → Owner approve/reject → akun portal → Head Production review/breakdown/assembly | Hanya Owner dapat approve/reject; akun hanya dibuat setelah Owner approve; reject tidak membuat akun dan tidak masuk produksi; setelah approval Head Production menyiapkan breakdown komponen/assembly; Sample ID/version tetap dapat ditelusuri |
| UAT-07 | Finance mencoba membuat PO bahan baku | Ditolak UI dan backend; Kepala Produksi dapat membuat/mengajukan; Finance dapat approve/reject; vendor dipilih manual dan tidak ada auto-sourcing |
| UAT-08 | Klien A mencoba mengakses sampel/order/stok Klien B | Akses ditolak backend/API dan tidak ada data yang diungkap |
| UAT-09 | Jalur QC Pass, Repair, Reject | Setiap hasil mengikuti jalur; Repair kembali untuk pengerjaan ulang; Reject bukan barang jadi baik; bonus hanya di-credit sekali pada final Pass |
| UAT-10 | Mengajukan pertanyaan yang didukung dokumen pengetahuan | Asisten memberikan jawaban yang didukung sumber dengan referensi bila tersedia |
| UAT-11 | Bertanya tentang kebijakan yang belum diputuskan atau fakta tanpa sumber | Asisten menyatakan kekurangan sumber/keputusan dan tidak mengarang aturan |
| UAT-12 | Meminta AI mengungkap data order/payroll klien lain | Chatbot internal menolak akses transaksi real-time; akun klien tidak memiliki AI; tidak ada data terlindungi yang diungkap |
| UAT-13 | Menghasilkan invoice untuk order yang harganya sudah disepakati | PDF berisi data order dan jumlah yang benar; total cocok dengan input; pengiriman tetap manual |
| UAT-14 | Menghitung overhead bulan dengan data biaya dan output produk | Overhead/unit sesuai total biaya ÷ total unit yang diproduksi; pembagi nol diblokir |
| UAT-15 | Membuat estimasi dengan BOM/time study tersedia dan kosong | Data tersedia menghasilkan rumus yang transparan; data kosong menampilkan insufficient data; tidak ada angka hasil halusinasi |

Kepemilikan UAT dibagi: perwakilan bisnis/proses memvalidasi hasil yang diharapkan; developer memeriksa perilaku/integrasi; QA/pemilik pengujian mencatat hasil dan defect.

# 13. Daftar Keputusan Terbuka dan Asumsi

Aturan berikut belum disepakati dalam baseline bisnis. Keputusan harus diambil sebelum hasil finansial final atau status penyelesaian produksi diperlakukan sebagai otoritatif. Untuk demo hackathon, asumsi uji boleh dipakai asalkan diberi label.

| ID | Keputusan terbuka | Dampak jika belum diputuskan | Rekomendasi untuk MVP tiga hari |
|---|---|---|---|
| OD-01 | Eligibilitas upah untuk output yang terkena Repair/Reject | Potensi kelebihan/kekurangan upah atau penghitungan ganda | Gunakan aturan demo yang disebutkan; jangan tandai payroll final sampai dikonfirmasi |
| OD-02 | Uang makan: tambahan individual atau pool bersama | Mengubah payroll/pengeluaran makan | Working assumption MVP adalah pool anggaran makan bersama dan tidak mengurangi upah atau menjadi tambahan individu; beri label asumsi sampai dikonfirmasi |
| OD-03 | Pembagi overhead: definisi unit yang digunakan dan biaya perawatan mesin | Mengubah nilai overhead per unit | Baseline BRD: total biaya listrik+air+internet (kategori tambahan bila disetujui) ÷ total produk utuh yang diproduksi di bulan tersebut |
| OD-04 | Basis pembayaran tim cutting | Kelompok pekerja berpotensi tidak masuk payroll | Payroll cutting dikeluarkan dari MVP; fokus pada buruh jahit sesuai kebutuhan yang dibahas |
| OD-05 | Aturan penggabungan komponen untuk QC | Mempengaruhi jumlah produk utuh dan rekonsiliasi payroll | Pilih aturan uji untuk demo saja dan tandai menunggu keputusan bisnis |
| OD-06 | Sisa bahan titipan: retur atau rollover | Mempengaruhi penutupan stok dan rekonsiliasi klien | Catat kuantitas sisa; jangan otomatisasi kebijakan retur/rollover final dahulu |
| OD-07 | PO consumables untuk CMT | Mempengaruhi alur pengadaan | MVP tidak membuat PO untuk bahan utama titipan klien; aturan consumables khusus dicatat jika disetujui |
| OD-08 | Pihak yang menerbitkan/mengirim PO setelah Finance menyetujui | Mempengaruhi langkah akhir pengadaan | Pemilihan vendor dan pengiriman PO manual; tidak ada vendor sourcing/auto-order |
| OD-09 | Pengajuan ulang/perubahan Production Order yang ditolak | Mempengaruhi transisi status dan audit histori | Jangan mengubah record rejected diam-diam; buat revisi/draft baru yang terhubung ke record sebelumnya bila diperlukan |
| OD-10 | Perubahan penawaran setelah satu/beberapa approval | Dapat membuat approval menjadi tidak berlaku dan mengganggu kesepakatan | Perubahan material pada harga, kuantitas, skema, atau timeline harus membatalkan approval terkait dan memerlukan review ulang |
| OD-11 | AI: apakah scope selain SOP diwajibkan rubrik resmi | Berdampak besar pada otorisasi, pengujian dan arsitektur | MVP hanya Q&A SOP/dokumen untuk pengguna internal; tidak ada data transaksi real-time atau AI costing |
| OD-12 | Perlakuan inventaris produk/sampel display | Menentukan apakah sampel display hanya referensi atau juga stok | Anggap sebagai referensi produk/style pada MVP kecuali bisnis meminta stok display dikelola |
| OD-13 | Definisi order selesai dan penggantian barang Reject | Mempengaruhi status akhir, progres dan rekonsiliasi material | Tentukan aturan minimum untuk demo; kebijakan lengkap tetap open |
| OD-14 | Role internal yang menjalankan provisioning akun portal setelah order pertama approved | Mempengaruhi kontrol onboarding klien | Waktu provisioning sudah ditetapkan: setelah Owner approve. Penetapan role pelaksana (mis. Sampler atau Admin) masih perlu disepakati; jangan memberi akses provisioning kepada klien sebelum order approved |
| OD-15 | Pemilik dan approval perubahan Rate Card | Mempengaruhi otorisasi dan tarif historis | Working assumption: Head Production mengelola tarif komponen; konfirmasi apakah Owner perlu approval |
| OD-19 | Makna “ID sample berubah menjadi ID order” setelah Owner approve | Risiko hilangnya traceability sample/version jika ID di-overwrite | Rekomendasi default: Sample Request ID dan Sample Version ID tidak berubah; Production Order mendapat ID sendiri dan menyimpan link ke sample sumber. Konfirmasikan apakah maksud kelompok adalah konversi workflow/status atau mengganti identifier secara literal sebelum development |
| OD-16 | Kelayakan upah jika produk final Repair/Reject | Dapat mengubah hak upah dan memerlukan koreksi/clawback | Jangan melakukan clawback otomatis; gunakan aturan demo yang eksplisit sampai klien mengonfirmasi |
| OD-17 | Periode pencairan dan pembulatan pool QC | Mempengaruhi nilai per penerima | Hitung pool dan tiga bagian; label aturan cut-off/pembulatan sebagai asumsi jika belum diputuskan |
| OD-18 | Timing invoice | Menentukan kapan invoice resmi diterbitkan | Untuk demo, invoice dibuat on-demand oleh Finance setelah harga disepakati; trigger bisnis final perlu konfirmasi |

# 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perbedaan antara deal sample dan approval Production Order | Order diproses sebelum sampel/ketentuan disepakati atau tanpa approval yang benar | Sampler menandai Sample Version Approved setelah deal; Owner satu-satunya approver order di sistem; validasi status di server |
| Sampel dianggap sama dengan order | Permintaan sampel menimbulkan komitmen produksi palsu | Pisahkan Sample Request ID dan Production Order ID |
| Hubungan pemilik/order pada stok tidak konsisten | Kontaminasi silang atau stok tidak akurat | Tag wajib, validasi server, mutasi atomik, uji transaksi gagal |
| Kebijakan finansial belum selesai | Hasil payroll/bonus/overhead menyesatkan | Tandai asumsi perhitungan uji dan cegah finalisasi sampai aturan dikonfirmasi |
| Kebocoran role/tenant | Data rahasia klien terungkap | Tegakkan otorisasi backend dan uji akses API langsung |
| AI mengarang aturan bisnis | Pengguna bergantung pada panduan yang keliru | Jawaban berbasis sumber disetujui, referensi, dan penandaan keputusan terbuka/kekurangan bukti |
| Scope terlalu luas untuk tiga hari | Alur inti tidak selesai end-to-end | Batasi AI pada Q&A pengetahuan; prioritaskan alur P0; tunda laporan/AI lanjutan |
| BRD/SRS/BPMN tidak selaras | Tim membangun workflow yang saling bertentangan | Jadikan BRD v1.4 Draft dan BPMN v1.4 Draft sebagai baseline kerja untuk PRD ini; bila keputusan berubah, perbarui ketiganya secara selaras |

# 15. Rencana Delivery Tiga Hari (Usulan)

Ini adalah rencana eksekusi yang diusulkan, bukan pernyataan bahwa semua fungsi menjadi production-ready dalam tiga hari. Prioritasnya adalah demo end-to-end beserta pemeriksaan inti.

| Hari | Fokus | Hasil/exit check |
|---|---|---|
| Hari 1 | Bekukan requirement; konfirmasi model data/hak akses; bangun status sampel/order dan approval Owner-only | Sampel bisa ada tanpa order; status order mengikuti approval Owner setelah sample dan ketentuan deal; hak PO Finance ditegakkan |
| Hari 2 | Kontrol inventaris, output/QC, grounding AI Assistant | Pengeluaran stok yang tidak cocok diblokir; transisi produksi/QC berjalan pada dataset uji; AI menjawab SOP dengan sumber |
| Hari 3 | Perhitungan uji payroll, verifikasi portal, uji integrasi dan latihan demo | UAT-01, UAT-04, UAT-06, UAT-07, UAT-08, UAT-10, dan UAT-11 lulus; batasan dan keputusan terbuka terlihat |

**Batas scope:** jika alur bisnis inti belum terintegrasi, jangan menghabiskan sisa waktu untuk analitik AI lanjutan, polesan visual yang tidak kritis, atau laporan nonesensial sebelum alur P0 dan demo AI wajib berjalan.

# 16. Delivery, Dependensi, dan Change Control

## 16.1 Dependensi

- BRD v1.4 Draft dan BPMN v1.4 Draft yang diselaraskan dengan PRD ini.
- Dokumen sumber yang disetujui untuk knowledge corpus AI.
- Dataset uji untuk minimal dua klien berbeda, revisi sampel, beberapa order, lot inventaris, pekerja, interval output, dan hasil QC.
- Akses development dan secret yang benar untuk database/layanan AI yang dipilih.
- Akun uji setiap role internal dan setidaknya dua akun klien untuk pengujian isolasi.

## 16.2 Kolaborasi Tim

- **Project Manager/Product Lead:** scope, prioritas, pencatatan keputusan, rencana delivery, kesiapan demo.
- **Business Analyst:** aturan bisnis, user story, traceability requirement, keputusan terbuka.
- **System Analyst/Technical Lead:** model data, batas layanan, penegakan permission, dan kelayakan teknis.
- **UI/UX:** alur pengguna dan layout ramah sentuhan.
- **Frontend/Backend Developer:** implementasi fitur dan integrasi.
- **AI Engineer/Developer:** layanan AI, persiapan sumber pengetahuan, grounding, dan pengujian.
- **QA/Pemilik Pengujian:** acceptance test, regresi, bukti hasil, dan pencatatan defect.

Satu orang boleh memegang lebih dari satu tanggung jawab dalam tim hackathon. Yang penting, pemilik tugas dan keputusan jelas meskipun jabatan formal tidak terpisah.

## 16.3 Change Control

Perubahan yang memengaruhi scope, aturan approval, kepemilikan data, hak akses, formula finansial, routing QC, atau batas akses AI harus mencatat:

- ID requirement dan deskripsi perubahan.
- Alasan serta sumber keputusan (BRD, rubrik resmi hackathon, atau asumsi tim).
- Dampak pada workflow, UI, data/API, pengujian, dan jadwal.
- Pemilik keputusan dan tanggal.
- Versi dokumen atau referensi task yang diperbarui.

# 17. Glosarium

| Istilah | Arti dalam PRD ini |
|---|---|
| BRD | Business Requirements Document; konteks bisnis, kebutuhan dan batasan |
| PRD | Product Requirements Document; scope, prioritas, perilaku produk dan kriteria penerimaan |
| BPMN | Business Process Model and Notation; diagram visual aktivitas serta keputusan proses |
| Sample Request ID | ID unik permintaan sampel, terpisah dari Production Order |
| Sample Version ID | ID untuk versi spesifikasi sampel tertentu |
| Production Order ID | ID untuk pekerjaan produksi yang diminta/diterima |
| CMT | Cut, Make, Trim; pada baseline ini klien menyediakan bahan baku |
| Semi-CMT | Klien menyediakan bahan utama; Lukla menyediakan bahan pendukung/aksesori |
| Full Package | Lukla menyediakan bahan dan jasa produksi; default untuk order internal Snøhund |
| WIP | Work in Progress; barang/komponen yang sedang berada dalam proses produksi |
| QC | Quality Control; pemeriksaan kualitas output/produk |
| Rate Card | Parameter tarif potong/jahit yang disetujui |
| RBAC | Role-Based Access Control; pembatasan akses berdasarkan role |
| RAG | Retrieval-Augmented Generation; pendekatan AI yang mengambil konten sumber relevan untuk menyusun jawaban |
| UAT | User Acceptance Testing; validasi bahwa perilaku produk memenuhi kebutuhan bisnis yang disepakati |

# 18. Riwayat Versi dan Persetujuan

| Versi | Tanggal | Ringkasan | Status |
|---|---|---|---|
| 0.1 | 13 Okt 2026 | Draft PRD sebelumnya berdasarkan BRD revisi 1.0 | Draft kerja yang digantikan |
| 0.2 | 14 Okt 2026 | Prioritas MVP, lifecycle sampel/order, AI, acceptance test, dan keputusan terbuka berdasarkan BRD/BPMN/SRS dan klarifikasi kelompok | Draft kerja sebelumnya |
| 0.3 | 14 Okt 2026 | Penyelarasan sebelum development: payroll buruh jahit saja, pemilik Rate Card, asumsi dana makan bersama, pool QC dari final Pass sekali saja, overhead sederhana P0, PO manual, invoice PDF, estimasi P1, dan AI SOP internal-only | Draft kerja sebelumnya |
| 0.4 | 14 Okt 2026 | Perubahan alur onboarding: Client Record dibuat saat registrasi awal tanpa akun login; sample Approved ditandai Sampler setelah deal; Owner menjadi satu-satunya approver order di sistem; akun klien dibuat setelah order approved; Head Production memetakan komponen/assembly pasca-approval; identitas sample dipertahankan dan ditautkan ke Production Order | Draft kerja sebelumnya |
| 0.5 | 14 Okt 2026 | Mengonfirmasi ulang urutan: klien melakukan registrasi data tanpa login; Sampler membuat/revisi sample; setelah deal Sampler menandai sample Approved; klien meminta order; Sampler mengajukan draft ke Owner; akun login klien baru dibuat setelah Owner menyetujui Production Order; Head Production mereview serta membedah komponen dan menyiapkan assembly. Tidak ada dual approval sistem. | Draft untuk review kelompok |

### Checklist Review Sebelum Development Freeze

- [ ] Tim/Product Owner mengonfirmasi alur sample, deal, approval Owner-only, provisioning akun setelah approval, dan breakdown komponen Head Production.
- [ ] Tim menyepakati scope MVP dan kriteria demo tiga hari.
- [ ] Use case AI dicek dengan rubrik resmi hackathon; Q&A SOP/dokumen menjadi asumsi default dalam draft ini.
- [ ] Aturan finansial yang belum final ditandai sebagai keputusan terbuka atau asumsi uji.
- [ ] Matriks role/permission diterapkan pada UI dan backend.
- [ ] Dataset uji dan pemilik UAT ditetapkan.

---

**Akhir dokumen - PRD Lukla Operations Engine v0.4 Draft**
