List revisi:

## 1. BPMN

Dokumen: `Lukla_BPMN_2.0_Final.md`&#x20;

\- [BPMN-01] Bagian 1 — Arsitektur Pool & Swimlanes: Dokumen menyebut menggunakan notasi BPMN 2.0, tetapi diagramnya menggunakan Mermaid `flowchart` dan `sequenceDiagram`. Representasi tersebut belum menunjukkan notasi BPMN secara utuh. Revisi: jika deliverable memang diwajibkan sebagai BPMN 2.0, gunakan notasi event, task, gateway, sequence flow, message flow, pool, dan lane yang sesuai. Jika format diagram saat ini memang diterima, nyatakan bahwa diagram merupakan representasi alur proses, bukan diagram BPMN formal.

\- [BPMN-02] Bagian 1 — Pool & Swimlanes: Diagram mencantumkan penjahit komponen dan penjahit assembly sebagai dua lane berbeda. Namun, klarifikasimu menyatakan bahwa satu pekerja dapat mengerjakan keduanya berdasarkan penugasan Mandor/Kepala Produksi. Revisi: tentukan apakah keduanya cukup menjadi dua jenis aktivitas dalam satu role penjahit atau tetap menjadi role terpisah karena perbedaan hak akses. Jangan menyamakan jenis pekerjaan dengan role sistem secara otomatis.

\- [BPMN-03] Bagian 2–3.6 — Seluruh alur produksi: Masih terdapat istilah dan contoh garmen/pakaian, seperti kerah, lengan, badan depan, kancing, dan kain gulungan. Produk prototipe yang benar adalah tas/ransel. Revisi: sesuaikan contoh bahan, komponen, alur pemotongan, assembly, defect, dan produk jadi dengan desain tas yang sebenarnya.

\- [BPMN-04] Bagian 3.1 — Fase 1: Sampel & Studi Waktu: Cabang persetujuan sampel menyebut `Approved (v2)`, padahal sampel dapat disetujui pada versi pertama atau versi berikutnya. Revisi: gunakan versi terakhir yang benar-benar disetujui, yaitu `Approved vN`, dan pastikan versi terdahulu tetap tersimpan tanpa ditimpa.

\- [BPMN-05] Bagian 3.2 — Fase 2: Persetujuan & Penerbitan Pesanan Massal: Urutan saat ini menerbitkan dokumen PO/komitmen setelah pemilihan skema, menetapkan rate card, lalu meminta Owner menyetujui order dan menerbitkan Production Order ID. Ini belum konsisten dengan klarifikasimu mengenai persetujuan Owner sebelum penerbitan order resmi. Revisi: tampilkan urutan yang jelas: Sampler membuat draft order → Owner menyetujui draft → Sampler memfinalisasi atau menerbitkan Production Order resmi dengan ID unik → langkah pengadaan atau komitmen sesuai skema dijalankan pada titik yang disepakati. Pastikan urutan PO pemasok terhadap persetujuan Owner ditentukan secara eksplisit.

\- [BPMN-06] Bagian 3.2 — Istilah PO dan Production Order: PO komitmen untuk klien CMT, Purchase Order pemasok, dan Production Order masih tercampur dalam alur dan penamaan. Revisi: bedakan ketiganya sebagai objek/dokumen yang berbeda beserta pihak penerima, tujuan, status, dan pemicu penerbitannya.

\- [BPMN-07] Bagian 3.2 — Skema CMT, Semi-CMT, dan Full Package: Diagram sudah menyebut ketiga skema, tetapi langkah pembelian material dan komitmen klien perlu diikat pada aturan masing-masing skema. Revisi: pastikan CMT mencatat komitmen/reminder kepada klien tanpa menganggapnya sebagai pembelian bahan oleh Lukla; Semi-CMT memisahkan material dari klien dan pembelian aksesori oleh Lukla; Full Package mengakomodasi Snøhund maupun klien eksternal.

\- [BPMN-08] Bagian 3.3 — Fase 3: Gudang, Validasi Anti-Kontaminasi & Cutting: Ada ketidaktepatan istilah pada alur yang membandingkan tag klien bahan dengan ID pesanan tujuan. ID klien dan ID order adalah dua identitas yang berbeda. Revisi: validasi harus mendapatkan klien dari pesanan target, membandingkannya dengan pemilik stok, dan memeriksa kecocokan `order_id` bila material memang ditetapkan khusus untuk order tertentu. Penanganan stok yang tidak terikat pada order juga harus diputuskan secara eksplisit.

\- [BPMN-09] Bagian 3.3 — Zero Remnant: Diagram mengasumsikan `Zero Remnant`, tetapi juga mencatat saldo roll dan panjang sisa. Keduanya belum konsisten secara konseptual. Revisi: putuskan apakah sisa material benar-benar tidak dicatat dalam lingkup MVP atau saldo material sisa harus tetap dilacak. Jangan mempertahankan dua asumsi yang bertentangan tanpa definisi.

\- [BPMN-10] Bagian 3.4 — Fase 4: Output 30 Menit & Assembly: Alur sudah memisahkan input penjahit dan verifikasi Mandor, tetapi belum secara tegas merepresentasikan klarifikasi bahwa Mandor atau Kepala Produksi dapat memverifikasi output. Assembly juga belum ditunjukkan secara lengkap sebagai aktivitas output yang masuk perhitungan upah borongan. Revisi: tegaskan otoritas verifikasi, status `Pending Verification`/`Verified`, pencatatan output assembly, dan keterkaitannya dengan tarif borongan.

\- [BPMN-11] Bagian 3.5 — Fase 5: QC & Pool Bonus: QC digambarkan pada satu produk utuh, tetapi contoh produknya masih pakaian. Nominal `+Rp 300/unit` juga ditulis sebagai ketentuan pasti. Revisi: objek inspeksi harus satu tas utuh; nilai bonus harus ditulis sebagai parameter yang belum final, bukan nominal tetap yang sudah disepakati.

\- [BPMN-12] Bagian 3.5 — Jalur Repair dan Reinspection: Cabang `REPAIR` mengembalikan produk ke lini jahit, tetapi tidak menunjukkan secara lengkap bagaimana tas kembali untuk QC setelah diperbaiki. Revisi: tambahkan siklus repair → pemeriksaan ulang → Pass/Repair/Reject, serta aturan agar satu tas yang diperiksa ulang tidak menghasilkan bonus ganda.

\- [BPMN-13] Bagian 3.6 — Payroll, Bonus, dan Overhead: Dokumen masih menyediakan konfigurasi pembagian bonus dinamis ketika jumlah Mandor lebih dari dua. Kamu sudah mengklarifikasi bahwa untuk MVP jumlah penerima bersifat tetap: dua Mandor dan satu Kepala Produksi/Operasional. Revisi: hapus kebutuhan konfigurasi dinamis dari lingkup MVP dan konsistenkan nama jabatan di seluruh diagram.

\- [BPMN-14] Bagian 3.6 — Penggabungan Proses Finance: Payroll mingguan, overhead bulanan, dan invoice ditampilkan dalam satu fase. Ini tidak otomatis salah karena dikelola oleh Finance, tetapi pemicu dan periodenya berbeda. Revisi: Finance boleh memakai satu workspace, tetapi payroll harus memiliki periode mingguan, overhead periode bulanan, dan invoice memiliki pemicu/status tersendiri. Hindari menggambarkan semua proses sebagai satu transaksi yang harus selesai bersamaan.

\- [BPMN-15] Bagian 4 — Matriks Data Stores & Entitas Basis Data: Daftar data store belum mencantumkan secara eksplisit entitas pembelian material, penerimaan material, mutasi stok, dan invoice, padahal alur dokumen membahas kegiatan tersebut. Revisi: tambahkan entitas yang diperlukan jika alur tersebut masuk cakupan aplikasi, beserta relasinya dengan klien, order, supplier, material, dan transaksi terkait.

\- [BPMN-16] Bagian 4 — `qc_bonus_pool`: Tabel bonus dicantumkan dengan `order_id`, sementara cakupan pengakumulasian bonus lintas order/periode belum sepenuhnya konsisten di artefak proyek. Revisi: tetapkan apakah pool dihitung per order, lintas order, atau per periode pembayaran, lalu samakan definisi dalam BPMN, BRD, PRD, dan database.

\- [BPMN-17] Bagian 5 — Ringkasan Kepatuhan & Jaminan Integritas: Klaim seperti `Zero Contamination`, `Zero Payroll Dispute`, serta pelacakan setiap detik terlalu absolut jika belum dibuktikan dengan pengujian dan ukuran keberhasilan yang jelas. Revisi: ubah menjadi kriteria terukur, misalnya semua skenario kontaminasi yang sudah ditentukan harus ditolak dan hasil validasi tercatat di audit log.

## 2. BRD

Dokumen: `Lukla_BRD_v2.0_Final.md`&#x20;

Lukla_BRD_v2.0_Final.md



\- [BRD-01] Bagian 1 — Ringkasan Eksekutif & Latar Belakang Bisnis: BRD masih mendefinisikan produk sebagai manufaktur garmen/pakaian dan menyebut Snøhund sebagai lini pakaian outdoor. Revisi: gunakan konteks produk tas/ransel untuk prototipe, termasuk istilah komponen dan barang jadi yang sesuai. Pastikan deskripsi bisnis lain yang memang menggambarkan kondisi organisasi tidak ikut diubah tanpa konfirmasi.

\- [BRD-02] Bagian 2, Aturan Bisnis No. 1 — Gaji Borongan vs Status QC: Ketentuan `No Clawback` sudah sesuai arah klarifikasimu, tetapi contoh masih menggunakan pakaian dan belum cukup eksplisit tentang assembly. Revisi: upah borongan dihitung dari output komponen yang sudah `Verified`, termasuk assembly yang diperlakukan sebagai komponen untuk keperluan output dan payroll. Hasil QC produk jadi tidak membatalkan upah yang telah diverifikasi.

\- [BRD-03] Bagian 2, Aturan Bisnis No. 2 — Fungsi Terminal QC: Bonus QC masih menetapkan `Rp 300/unit` sebagai nilai tetap. Revisi: pertahankan aturan bahwa tas utuh berstatus `Pass` memenuhi syarat menambah pool bonus, tetapi ubah nominal menjadi parameter bisnis yang belum ditetapkan. Rp300 hanya angka ilustrasi.

\- [BRD-04] Bagian 2, Aturan Bisnis No. 4 — Bentuk Fisik Objek di Meja QC: Aturan menyebut satu produk pakaian utuh. Revisi: objek inspeksi adalah satu produk tas/ransel utuh. Pengecekan output komponen setiap 30 menit bukan tanggung jawab QC, melainkan verifikasi produksi oleh Mandor atau Kepala Produksi.

\- [BRD-05] Bagian 2, Aturan Bisnis No. 5 — Alur PO pada Skema CMT Murni: Dokumen sudah membedakan PO komitmen klien dari PO pemasok secara konseptual, tetapi istilah PO masih berpotensi ambigu. Revisi: definisikan nama, tujuan, penerima, serta pemicu untuk komitmen/reminder klien CMT, Purchase Order pemasok, dan Production Order.

\- [BRD-06] Bagian 2, Aturan Bisnis No. 6 — Hirarki & Struktur Mandor: Aturan masih memuat konfigurasi dinamis bila Mandor lebih dari dua. Revisi: untuk MVP, nyatakan pembagian bonus kepada dua Mandor dan satu Kepala Produksi/Operasional tanpa fitur pengaturan jumlah penerima secara dinamis. Selaraskan penyebutan jabatan di seluruh dokumen.

\- [BRD-07] Bagian 2, Aturan Bisnis No. 7 — Dual-Mode Input Output 30 Menit: Aturan membedakan input oleh Mandor dan penjahit, tetapi perlu konsisten dengan kewenangan Kepala Produksi yang juga dapat melakukan verifikasi. Revisi: nyatakan secara eksplisit siapa yang boleh menghasilkan status `Verified`, siapa yang hanya dapat menginput `Pending Verification`, dan kapan data boleh masuk perhitungan payroll.

\- [BRD-08] Bagian 2, Aturan Bisnis No. 8 — Operasional Pemotongan Kain: Ketentuan bahwa cutting dilakukan oleh personel gudang sudah sesuai keputusan yang tercatat. Revisi: bukan mengganti aktornya, melainkan menyesuaikan istilah material dan contoh proses menjadi pemotongan komponen tas. Tetap pertahankan aturan pelaksana cutting adalah tim gudang.

\- [BRD-09] Bagian 2, Aturan Bisnis No. 9 — Toleransi Sisa Bahan Titipan: Asumsi `Zero Remnant / Zero Shortage` bertentangan dengan kebutuhan pelacakan saldo roll atau material sisa pada dokumen lain. Revisi: putuskan perlakuan sisa bahan dalam MVP, lalu nyatakan apakah sistem mengabaikan, mencatat, atau mengelola pemakaian kembali sisa material. Jangan menganggap konflik ini sudah selesai sebelum keputusannya jelas.

\- [BRD-10] Bagian 2, Aturan Bisnis No. 10 — Sampler dan Pesanan Massal: Peran Sampler sebagai penerbit pesanan massal perlu disejajarkan dengan persetujuan Owner. Revisi: jelaskan bahwa Sampler menyiapkan draft, Owner menyetujui, lalu Sampler menerbitkan atau memfinalisasi Production Order resmi. ID pesanan resmi tidak boleh dianggap terbit sebelum titik persetujuan yang disepakati.

\- [BRD-11] Bagian 2 serta aturan rate card — Harga komersial dan upah pekerja: Penyebutan rate card potong/jahit dapat ditafsirkan sebagai satu jenis tarif untuk semua kepentingan. Revisi: pisahkan harga komersial yang disepakati dengan klien dari tarif borongan komponen internal yang digunakan Finance untuk menghitung upah pekerja. Tarif internal tidak boleh otomatis ditampilkan kepada klien.

\- [BRD-12] Bagian 2, Aturan Bisnis No. 3 — Uang Makan Fleksibel: Rumus tunjangan makan sebesar 10–15% dari upah borongan dan penambah THP sudah tercantum. Revisi: tidak perlu mengubah rumus yang sudah diklarifikasi, tetapi jelaskan apakah sistem hanya menghitung nominal pada slip atau juga mencatat konfirmasi bahwa uang tunai benar-benar telah dibayarkan. Kedua hal itu berbeda secara operasional.

\- [BRD-13] Bagian 1–2 — Batasan dan asumsi bisnis: Beberapa ketentuan masih diperlakukan seolah-olah sudah final meskipun terdapat asumsi yang belum tervalidasi, terutama perlakuan sisa material dan nilai bonus QC. Revisi: pisahkan aturan bisnis yang sudah disepakati, asumsi MVP, dan keputusan yang masih menunggu konfirmasi. Jangan mengunci nominal bonus atau asumsi teknis yang belum diputuskan sebagai aturan final.

\- [BRD-14] Header dokumen — Status “Final” dan “Locked”: BRD menyebut versi 2.0 Final dan terkunci, padahal ada aturan yang perlu direvisi berdasarkan hasil review ini. Revisi: setelah revisi disetujui, naikkan versi atau revision number dan catat perubahan, tanggal, serta persetujuannya. Jangan mempertahankan label terkunci seolah-olah isi dokumen tidak berubah.

## 3. PRD

Dokumen: `Lukla_PRD_v2.0_Final(2).md`&#x20;

Lukla_PRD_v2.0_Final(2).md



\- [PRD-01] Bagian 1 — Visi Produk & Sasaran Arsitektur: Deskripsi produk masih menyatakan bahwa aplikasi dibuat untuk fasilitas produksi garmen, dengan contoh pakaian jadi. Revisi: sesuaikan konteks implementasi, nama komponen, hasil assembly, dan istilah QC dengan tas/ransel. Pastikan struktur teknisnya mendukung komponen yang benar-benar dipakai dalam prototipe.

\- [PRD-02] Bagian 1, Pilar Kualitas Rekayasa No. 4 — Playwright E2E Automation: Teks menyatakan jaminan keandalan 100% pada 42 skenario pengujian. Padahal, 42 skenario masih merupakan target, bukan hasil pengujian yang sudah tercapai. Revisi: tulis bahwa targetnya adalah 42 skenario E2E. Setelah pengujian, cantumkan jumlah yang dijalankan, lulus, gagal, dilewati, serta hasil pengujian ulang. Jangan menyamakan target dengan hasil.

\- [PRD-03] Bagian 1, Pilar No. 5 — Strix Security Hardening: Bahasa spesifikasi dapat memberi kesan bahwa perlindungan terhadap IDOR, bypass API, manipulasi payroll, dan prompt injection telah terjamin. Revisi: bedakan mekanisme keamanan yang direncanakan, yang sudah diimplementasikan, dan yang telah diuji. Klaim keamanan harus memiliki bukti pengujian.

\- [PRD-04] Bagian 2 — Matriks 8 Peran RBAC: Judul menyatakan delapan peran, tetapi diagram dan tabel mencantumkan sembilan entri jika R5A dan R5B dihitung secara terpisah. Revisi: tetapkan model role final. Bila penjahit komponen dan assembly memiliki hak akses sama, pertimbangkan satu role penjahit dengan jenis tugas berbeda. Bila hak akses berbeda, dokumentasikan alasan pemisahannya dan koreksi jumlah role.

\- [PRD-05] Bagian 3.1 — Kontrak Endpoint AI `/ask`, `/ingest`, dan otorisasi: Kontrak `/ask` menerima `role` dan `client_id` dari request sebagai parameter opsional. Informasi tersebut tidak boleh menjadi satu-satunya sumber otorisasi. Revisi: ambil identitas serta role dari sesi/token autentikasi yang sudah divalidasi; tentukan client scope dari identitas tepercaya; terapkan pembatasan akses pada pencarian dokumen dan hasilnya. Pastikan endpoint ingest juga dilindungi oleh otorisasi yang sesuai. Pengamanan ini perlu diuji, bukan hanya dijelaskan di PRD.

\- [PRD-06] Bagian 4.1 — Universal Filter Bar: Dropdown klien menggunakan kode contoh seperti `SH`, `KB`, `CB`, dan `CS`. Kode contoh tidak otomatis salah, tetapi aturan keunikan dan kestabilan kode belum cukup didefinisikan. Revisi: tentukan `client_code` yang unik melalui constraint database, dengan format yang disepakati—misalnya `CL-0001`—dan pastikan kode tetap stabil saat nama perusahaan berubah.

\- [PRD-07] Bagian 4.3 — Sample Tracker: Tombol konversi mengacu pada `Approved v2`. Ini tidak sesuai untuk sampel yang disetujui pada `v1`, `v3`, atau versi lainnya. Revisi: konversi harus memakai versi yang memang disetujui, dengan referensi versi yang eksplisit dan histori yang tidak tertimpa.

\- [PRD-08] Bagian 4.3–4.6 — Contoh UI produksi, assembly, dan QC: Komponen serta defect yang ditampilkan masih memakai contoh pakaian seperti kerah, lengan, kancing, atau pakaian jadi. Revisi: perbarui label, dummy data, contoh defect, serta UI menjadi konteks tas, seperti panel, saku, ritsleting, tali bahu, pegangan, buckle, dan lining sesuai BOM produk sebenarnya.

\- [PRD-09] Bagian 4.5 — Terminal Input 30 Menit & Assembly: Alur menjelaskan output komponen dan assembly menjadi barang utuh, tetapi belum menyatakan dengan cukup tegas bahwa assembly juga merupakan jenis output komponen dalam perhitungan borongan. Revisi: setiap output yang termasuk skema borongan—termasuk assembly—harus dapat dicatat, diverifikasi oleh Mandor/Kepala Produksi sesuai kewenangannya, dan ditautkan ke tarif komponen yang relevan. Jangan menggantungkan payroll komponen pada status QC tas jadi.

\- [PRD-10] Bagian 4.6 — Terminal Inspeksi QC Barang Jadi: UI menyatakan inspeksi satu produk utuh, tetapi contoh objeknya masih pakaian dan bonus ditampilkan dengan nominal tetap `Rp300`. Revisi: QC hanya memeriksa tas utuh; nilai bonus per unit harus berasal dari parameter bisnis yang disepakati. Jangan hard-code angka ilustrasi sebagai nominal final.

\- [PRD-11] Bagian 4.6 — Alur `REPAIR` dan pemeriksaan ulang: UI menjelaskan pengembalian ke lini produksi, tetapi belum merinci siklus reinspection setelah repair dan pencegahan pencatatan bonus ganda. Revisi: definisikan status produk, hubungan antarinspeksi, dan aturan kapan bonus boleh ditambahkan. Siklus inspeksi ulang tidak boleh dianggap sebagai unit Pass baru untuk bonus hanya karena inspeksinya diulang.

\- [PRD-12] Bagian 4.7 — Workspace Payroll & Rekap Biaya: Tampilan mendukung konfigurasi pembagian bonus dinamis jika jumlah Mandor bertambah. Revisi: hilangkan fitur dinamis dari lingkup MVP jika keputusan finalnya adalah dua Mandor dan satu Kepala Produksi/Operasional. Pertahankan kemampuan mengubah nominal bonus hanya jika kewenangan dan aturan pengubahannya memang disepakati.

\- [PRD-13] Bagian 4.7 — Tarif dan perhitungan finansial: `sample_components` memiliki tarif potong, tarif jahit, dan SMV, tetapi belum cukup jelas pemisahan antara harga jual/persetujuan harga klien dan tarif borongan pekerja. Revisi: pisahkan data harga komersial pesanan dari tarif internal komponen. Harga klien dapat mencakup material, biaya produksi, overhead, dan margin sesuai kesepakatan, sedangkan tarif operator digunakan untuk menghitung upah borongan. Jangan mengekspos tarif internal melalui portal klien.

\- [PRD-14] Bagian 4.8 — Portal Klien B2B: Portal menampilkan progres order dan saldo kain titipan, tetapi perlu menegaskan pemisahan alamat perusahaan dari alamat pengiriman aktual. Revisi: sediakan data kontak klien yang diperlukan—nama kontak, perusahaan, kanal komunikasi seperti WhatsApp/Telegram, serta alamat perusahaan—dan tentukan alamat pengiriman yang berlaku untuk setiap order. Bila alamat harus tetap sesuai kesepakatan saat order dibuat, simpan snapshot alamat pada order/pengiriman agar perubahan profil tidak mengubah histori.

\- [PRD-15] Bagian 5 — Skema Basis Data, Tabel Inti: Daftar tabel saat ini belum secara eksplisit memodelkan seluruh objek yang digunakan proses bisnis, terutama Purchase Order pemasok, item PO, penerimaan barang, item penerimaan, mutasi stok, dan invoice. Revisi: tambahkan tabel dan relasi yang memang masuk cakupan aplikasi. Hindari menyimpan saldo stok tanpa jejak transaksi apabila sistem harus mengaudit penerimaan dan pengeluaran material.

\- [PRD-16] Bagian 5 — Data dictionary dan ERD: Daftar tabel inti berisi nama tabel dan ringkasan fungsi, tetapi belum memadai sebagai data dictionary per kolom serta spesifikasi hubungan. Revisi: untuk setiap tabel, definisikan nama kolom, tipe data, PK/FK, nullability, unique constraint, default, aturan validasi, status, serta relasi cardinality yang dibutuhkan. Pastikan `client_id` dan `order_id` memiliki fungsi yang berbeda: satu klien dapat mempunyai banyak order.

\- [PRD-17] Bagian 5 — Fungsi RPC `validate_cutting_issue`: Implementasi contoh memeriksa apakah `client_id` item material berbeda dari `client_id` order, lalu mengizinkan transaksi jika perbandingan tidak mendeteksi perbedaan. Logika contoh belum menangani secara eksplisit kondisi item atau order tidak ditemukan; nilai pembanding yang `NULL` dapat membuat kondisi `IF` tidak masuk ke cabang penolakan. Fungsi juga belum terlihat memvalidasi `inventory_items.order_id` terhadap order tujuan. Revisi: pastikan item dan order benar-benar ada; tolak nilai yang tidak valid; periksa kepemilikan klien; dan, jika stok dibatasi untuk order tertentu, verifikasi kecocokan `order_id`. Audit hak eksekusi `SECURITY DEFINER`, konfigurasi `search_path`, dan hubungan validasi dengan transaksi pengurangan stok. Ini adalah celah pada contoh rancangan yang perlu diverifikasi di implementasi nyata.

\- [PRD-18] Bagian 5 — Integritas stok dan transaksi: Fungsi validasi yang diperlihatkan belum membuktikan bahwa validasi dan mutasi stok berjalan secara atomik. Revisi: pastikan validasi, pencatatan pengeluaran, pengurangan saldo, serta audit log dikerjakan dengan kontrol transaksi yang tepat. Uji juga pengeluaran bersamaan dan kemungkinan item yang sama dikeluarkan dua kali.

\- [PRD-19] Bagian 5 — Entitas sample, BOM, komponen, dan versi: Relasi antara `sample_components`, versi sampel, serta tarif/SMV harus menjaga histori tiap versi. Revisi: pastikan BOM, SMV, dan komponen yang diwariskan oleh Production Order mengacu ke versi sampel yang disetujui, bukan nilai komponen terkini yang bisa berubah setelah order dibuat.

\- [PRD-20] Bagian 5 — Entitas produk jadi dan QC: Skema perlu menetapkan apakah produk jadi dilacak satu per satu atau QC mencatat jumlah berdasarkan batch; hal ini belum diputuskan dalam klarifikasi terakhir. Revisi: dokumentasikan keputusan tersebut sebelum menentukan kunci unit, relasi log QC, dan mekanisme bonus. Terlepas dari pilihan modelnya, pemeriksaan ulang tidak boleh memicu bonus duplikat untuk tas yang sama.

\- [PRD-21] Bagian 5 — `qc_bonus_pool`: Deskripsi tabel menyebut akumulasi bonus per pesanan, tetapi batas pool dan periode pembayarannya belum konsisten dengan uraian pengakumulasian lintas order. Revisi: tentukan apakah bonus dicatat per order, lintas order, atau dalam pool per periode. Pisahkan pencatatan pembentukan bonus dari pencatatan alokasi/pembayarannya kepada penerima.

\- [PRD-22] Bagian 6 — Kriteria Penerimaan E2E/UAT: PRD mencantumkan lima skenario UAT utama, sementara bagian awal mengklaim 42 skenario dan keandalan 100%. Revisi: cantumkan 42 sebagai target apabila memang belum selesai, uraikan test case yang benar-benar direncanakan dan dijalankan, serta simpan hasil aktual. Lima skenario penerimaan tidak otomatis membuktikan semua aturan bisnis telah diuji.

\- [PRD-23] Bagian 6 — Skenario uji bonus QC: Skenario 3.000 unit mengasumsikan bonus Rp300 per unit dan hasil pool Rp900.000. Revisi: ubah skenario ini menjadi angka ilustratif atau gunakan nilai bonus konfigurasi pada lingkungan tes. Hasil yang diuji harus mengikuti parameter yang berlaku, bukan memvalidasi angka contoh sebagai aturan bisnis final.

\- [PRD-24] Bagian 6 — Skenario keamanan, payroll, dan alur repair: UAT yang dirangkum belum membuktikan seluruh jalur negatif, seperti order tidak ditemukan, material untuk order berbeda, akses lintas klien, pengeluaran stok ganda, reinspection, dan status output yang belum diverifikasi. Revisi: tambahkan test case positif/negatif untuk kontrol tersebut serta skenario payroll yang memastikan hanya output berstatus `Verified` dihitung.

\- [PRD-25] Bagian 1, 4, dan 6 — Klaim real-time dan jaminan mutu: Klaim keandalan mutlak dan pemantauan setiap detik belum memiliki definisi kinerja serta bukti yang cukup. Revisi: tetapkan metrik yang dapat diuji, seperti latensi pembaruan yang diterima, target keberhasilan skenario, atau waktu penyelesaian sinkronisasi yang disepakati. Jangan memakai angka yang belum terukur.

\- [PRD-26] Header dokumen — Status “Final” dan “Locked”: PRD dinyatakan final/terkunci, tetapi sejumlah keputusan bisnis, model data, dan kontrol belum tervalidasi. Revisi: catat revisi dengan nomor versi baru dan ubah status menjadi draft/review sampai perubahan yang disepakati benar-benar selesai; status final diterapkan kembali setelah persetujuan dan verifikasi.

### Catatan untuk pelaksanaan revisi

Supaya daftar ini tidak dipahami sebagai 26 bug yang sudah terbukti ada di kode, aku membedakan statusnya sebagai berikut:

- Kesalahan atau ketidakkonsistenan dokumen: contohnya penggunaan `Approved v2`, contoh pakaian pada prototipe tas, dan jumlah role yang tidak konsisten.
- Klarifikasi aturan bisnis yang wajib dituntaskan: contohnya perlakuan sisa material, cakupan pool bonus, dan model pencatatan produk jadi per unit atau per batch.
- Risiko teknis yang perlu diverifikasi: contohnya validasi RPC, RLS, otorisasi AI, dan integritas transaksi stok. Kode contoh menunjukkan hal-hal yang perlu diperiksa, tetapi implementasi aktual tetap harus diuji.