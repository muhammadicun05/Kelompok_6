Business Requirement Document (BRD)
Nama Proyek	Lukla Operations Engine
Product Owner	Tim Operasional Lukla Manufacturing & Manajemen Merk Snøhund
Revision	1.0
	

Kelompok 6
Anggota:

	Harry Wirawan (Ketua)
	Andrini Banjarnahor
	Mochammad Ikhsan
________________________________________
	Konteks Bisnis & Ruang Lingkup
Lukla Manufacturing mengoperasikan fasilitas produksi garmen dinamis di Ciwidey, memanfaatkan hingga ±70 mesin jahit aktif. Fasilitas ini beroperasi dengan model multi-tenant, secara bersamaan memenuhi pesanan untuk merek internal Snøhund dan klien maklon B2B eksternal.
Sistem harus mengakomodasi tiga skema kerja sama berbeda untuk setiap pesanan:
	CMT (Cut, Make, Trim): Klien menyediakan seluruh bahan baku; Lukla menyediakan jasa potong, jahit, dan penyelesaian (finishing).
	Semi-CMT: Klien menyediakan bahan utama, sementara Lukla menyediakan bahan pendukung dan aksesori.
	CMT + Bahan (Full Package): Lukla menyediakan seluruh bahan baku dan jasa produksi, yang juga merupakan standar untuk pesanan merk internal Snøhund.
	Tujuan Proyek
Pengembangan sistem Lukla Operations Engine bertujuan untuk membangun platform operasional pabrik yang mengintegrasikan pemisahan inventaris, pencatatan produksi real-time, dan penggajian fleksibel. Sasaran utamanya meliputi:
	Skalabilitas Kapasitas: Mendukung kapasitas produksi cair dari 1 hingga ±70 mesin jahit tanpa batasan sistemik.
	Fleksibilitas Operasional: Memungkinkan pengubahan parameter variabel (rate card, persentase uang makan, rate bonus QC) oleh pengguna berwenang tanpa modifikasi kode.
	Integritas Multi-Tenant: Menjamin pemisahan mutlak antar-klien untuk mencegah kontaminasi stok dan kebocoran data. 
	Pernyataan Masalah (Problem Statement)
Lukla Operations Engine dirancang untuk menyelesaikan tiga hambatan operasional utama:
	Risiko Kontaminasi Silang Stok: Bahan baku, barang setengah jadi (WIP), dan barang jadi untuk banyak klien saat ini dikelola tanpa pemisahan sistemik, menciptakan risiko tinggi bercampurnya bahan milik Klien A dengan pesanan Klien B.
	Penggajian (Payroll) Kompleks & Jumlah Karyawan Dinamis: Kapasitas penjahit berfluktuasi berdasarkan volume pesanan. Menghitung upah borongan mingguan berdasarkan output 30 menit, bonus QC bersama, persentase uang makan, dan alokasi biaya overhead membutuhkan pelacakan yang akurat dan otomatis.
	Kurangnya Pelacakan & Riwayat Revisi: Tidak ada pelacakan digital terpusat untuk perubahan spesifikasi sampel, estimasi penggunaan bahan, studi waktu, atau log cacat (defect). Sistem belum memiliki pembuatan versi (versioning) untuk melacak revisi sampel hingga konversi produksi massal.
	Cakupan dan Asumsi
	Cakupan
	Pengelolaan sampel dan riwayat revisi.
	Pengelolaan pesanan dan model bisnis CMT, Semi-CMT, serta Full Package.
	Pengelolaan stok berdasarkan klien dan pesanan.
	Pencatatan alokasi tenaga kerja dan output produksi.
	Pencatatan hasil pemeriksaan QC.
	Perhitungan payroll berdasarkan komponen dan parameter yang ditentukan.
	Pengaturan hak akses berdasarkan peran pengguna.
	Penyajian informasi dan rekapitulasi operasional.
	Pantau status pesanan dan stok bahan titipan.
	Asumsi
	Produksi Snøhund berdasarkan sistem made to order.
	Kepala produksi adalah PIC yang bertanggung jawab melakukan PO raw material.
	Alur Operasional (Operational Flow)
Sistem harus mendukung 6 fase alur operasional:
 
	Fase Sampel (Sample Phase): Manajemen PO/titipan dan studi waktu per komponen.
	Persetujuan & Pesanan Massal: Penentuan skema maklon (CMT / Semi-CMT / Full Package).
	Gudang & Pemotongan: Penerimaan bahan multi-klien dan pemotongan massal.
	Lini Produksi: Alokasi dinamis ±70 mesin dan pelacakan output per 30 menit.
	QC & Barang Jadi: Kategorisasi Lolos/Perbaikan/Cacat yang memicu pool bonus QC.
	Penggajian & Rekap: Perhitungan upah borongan mingguan, uang makan, dan overhead.
	Persyaratan Fungsional
	Inventaris Multi-Tenant & Anti-Kontaminasi
	Mandatory Client Tagging (FR-6.1): Setiap item inventaris (mentah, WIP, barang jadi) wajib terikat pada Tag ID Klien dan ID Pesanan saat penerimaan. Setiap transaksi keluar-masuk stok harus memvalidasi kedua pengenal ini.
	Aturan Anti-Kontaminasi (FR-6.2): Sistem secara otomatis memblokir dan mengeluarkan peringatan jika staf gudang mencoba mengeluarkan bahan milik Klien A untuk pesanan Klien B, mencegah transaksi sebelum dicatat.
	 Pelacakan Produksi
	Alokasi Dinamis (FR-7.1): Sistem mengizinkan Kepala Produksi untuk mengalokasikan penjahit melintasi lini paralel tanpa batas slot yang kaku, mendukung hingga ± 70 mesin aktif.
	Rate Cards (FR-7.2): Sistem menyimpan kustomisasi tarif potong dan jahit per komponen/artikel untuk setiap klien, dilengkapi riwayat perubahan.
	Pelacakan Output 30 Menit (FR-7.3/7.4): Mandor atau penjahit dapat menginput jumlah potongan yang selesai setiap 30 menit. Sistem melacak penggabungan komponen menjadi produk utuh, mengubah statusnya menjadi "Menunggu QC". Input memerlukan antarmuka terminal besar yang ramah sentuhan (touch-friendly).
	Mesin Payroll Fleksibel
	Borongan Mingguan (FR-10.1): Gaji penjahit dihitung setiap Sabtu berdasarkan akumulasi output terverifikasi mandor dikalikan tarif jahit artikel, tanpa batasan jumlah penjahit.
	Uang Makan (FR-10.2): Input manual persentase uang makan fleksibel (biasanya 10-15%) per periode produksi, dihitung terhadap total dana ongkos jahit yang dihasilkan.
	Bonus QC 3-Arah (FR-10.3): Setiap produk yang lolos QC menyumbang pool bonus akumulatif. Total pool ini dibagi rata kepada 3 penerima: 2 Mandor dan 1 Kepala Operasional.
	Alokasi Overhead (FR-10.4): Sistem menghitung biaya overhead per unit dengan membagi total biaya operasional bulanan (listrik, air, internet) dengan total unit yang diproduksi pada bulan tersebut.
	Matrik Role-Based Access Control (RBAC)
Sistem membutuhkan 8 peran pengguna dengan izin dan batasan yang ketat.
Peran (Role)	Izin (Permissions)	Batasan (Limitations)
Owner / Eksekutif	Analitik tingkat tinggi, konfigurasi sistem, mengubah rate card.	Tidak dapat mengubah histori transaksi yang dikunci.
Tim Sample	Catat pemakaian bahan sampel, input studi waktu per komponen, setujui versi sampel.	Tidak dapat menyetujui pesanan massal tanpa konfirmasi.
Gudang (Warehouse)	Terima bahan/titipan klien, keluarkan bahan ke cutting, stok opname.	Dilarang mengeluarkan bahan jika ID Klien/Pesanan tidak cocok.
Kepala Produksi / Mandor	Atur lini & alokasi penjahit, tentukan rate card komponen, catat output 30 menit.
Mengajukan PO bahan.	Tidak dapat mengubah formula penggajian atau hasil QC final.
Penjahit / Operator	Lihat tugas komponen, laporkan hasil kerja (diverifikasi mandor).	Tidak dapat mengedit catatan output yang sudah diverifikasi.
QC Inspector	Periksa barang jadi, set status lolos/reject/repair, catat jenis cacat.	Tidak dapat mengubah harga borongan atau data order klien.
Finance & Payroll	Buat/setujui PO bahan, terbitkan invoice, hitung gaji mingguan & bulanan.	Tidak dapat mengubah fisik stok di gudang.
Klien Maklon (B2B Portal)	Pantau status pesanan, lihat progres real-time, periksa stok bahan titipan.	Terbatas hanya pada data yang cocok dengan ID Klien milik sendiri.
	Tampilan Antarmuka (UI Views) yang Dibutuhkan
Tampilan UI	Fungsi Utama
Dashboard Utama Operasional	Overview kondisi pabrik real-time, lini aktif, jumlah penjahit, progres order klien, dan grafik kecepatan produksi 30 menit.
Sample & Time Study Tracker	Kontrol versi untuk revisi sampel (v1, v2, dst), stopwatch digital untuk studi waktu komponen, dan log waktu.
Gudang Multi-Klien & Stok	Grid inventaris multi-tenant dengan filter klien, form penerimaan bahan, dan peringatan anti-kontaminasi stok.
Terminal Input 30 Menit	Antarmuka layar sentuh besar untuk mandor mencatat output per penjahit setiap 30 menit langsung di lantai pabrik.
Terminal Inspeksi QC	Pencatatan status pemeriksaan produk (lolos, repair, cacat), pemilihan kategori defect, dan pengalihan rute barang.
Workspace Payroll & Biaya	Penghitungan gaji borongan mingguan penjahit, kalkulasi pembagian bonus QC 3-arah, uang makan, dan alokasi overhead pabrik bulanan.
	Kriteria Penerimaan / Skenario Pengujian
Untuk memvalidasi kesiapan sistem, platform harus lulus skenario pengujian utama berikut:
	Proteksi Kontaminasi Silang Stok: Mencoba mengeluarkan bahan atas nama Klien A untuk pesanan Klien B harus menghasilkan penolakan sistem seketika dan peringatan eksplisit tentang ketidakcocokan pemilik.
	Payroll Jumlah Karyawan Dinamis: Menambah 5 penjahit baru di pertengahan minggu, menginput output 30 menit mereka, dan menjalankan kalkulasi gaji hari Sabtu harus menghasilkan perhitungan borongan yang akurat tanpa batasan sistem.
	Pembagian Bonus QC 3-Arah: Menginput 3.000 unit produk yang lolos QC dari gabungan berbagai pesanan klien harus mengakumulasi total pool bonus dengan benar, dan membaginya rata kepada 2 Mandor dan 1 Kepala Operasional.
	Alur Revisi Sampel ke Massal: Membuat revisi pada Sampel v1 menjadi v2, menyetujui v2, dan mengubahnya menjadi Pesanan Produksi Massal (Skema Semi-CMT) harus berhasil membawa semua riwayat spesifikasi v2 ke pesanan aktif tersebut.


 
	Lampiran BPMN

