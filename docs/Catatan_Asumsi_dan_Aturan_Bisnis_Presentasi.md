# Catatan Resmi Asumsi & Aturan Bisnis — Lukla Operations Engine
*(Bahan Paparan & Lembar Justifikasi Presentasi Kelompok 6)*

Dokumen ini memuat **10 Asumsi & Aturan Bisnis Resmi** yang telah dikunci untuk pengembangan platform **Lukla Operations Engine**. Catatan ini disiapkan khusus sebagai landasan justifikasi desain sistem, alur operasional, dan materi tanya-jawab saat **Presentasi Proyek**.

---

## 📋 Matriks 10 Asumsi & Aturan Bisnis Kunci

| No | Topik / Area | Aturan & Asumsi yang Ditetapkan | Justifikasi Bisnis & Teknis untuk Presentasi |
| :-: | :--- | :--- | :--- |
| **1** | **Gaji vs Hasil QC** | **Gaji borongan TIDAK terpengaruh oleh status barang QC.** | Penjahit dibayar penuh berdasarkan jumlah output potongan/komponen yang **telah diverifikasi oleh Mandor** di lini produksi. Cacat jahitan pasca-inspeksi tidak memotong upah borongan yang sudah disahkan (*no clawback*), menjaga moral dan kecepatan kerja penjahit lantai pabrik. |
| **2** | **Fungsi QC** | **Hasil QC HANYA berpengaruh terhadap Pool Bonus QC.** | Terminal QC murni berfungsi sebagai gerbang penjaminan mutu barang jadi (*Quality Gate*) dan pemicu akumulasi dana bonus. Setiap unit yang berstatus **`LOLOS (PASS)`** menambah saldo pool bonus yang akan dibagikan ke jajaran pengawas produksi. |
| **3** | **Uang Makan (10–15%)** | **Uang makan (10–15%) dicairkan sebagai uang tunai dan masuk langsung ke Slip Gaji penjahit.** | Persentase uang makan (misal 10–15% dari total dana ongkos jahit yang dihasilkan) dihitung sebagai **tunjangan tambahan tunai (Top-Up)** di atas upah borongan dasar dan tercantum transparan pada slip gaji mingguan hari Sabtu (`Take Home Pay = Upah Borongan + Uang Makan`). |
| **4** | **Bentuk Fisik di Meja QC** | **Inspeksi QC dilakukan HANYA pada 1 produk utuh (Barang Jadi).** | QC Inspector tidak memeriksa per komponen kain lepas (kerah/lengan), melainkan unit pakaian utuh yang telah melewati stasiun penggabungan (*Assembly/Finishing*). Hal ini menyederhanakan pelacakan status unit menjadi tunggal: `Menunggu QC` -> `Lolos` / `Repair` / `Cacat`. |
| **5** | **Alur PO Skema CMT Murni** | **Skema CMT Murni TETAP menerbitkan PO, tetapi langsung ditujukan ke Klien Maklon.** | Berbeda dengan PO pengadaan biasa ke supplier kain, PO pada skema CMT berfungsi sebagai **Surat Pesanan Komitmen Kerja Sama & Tracking Pengingat (Reminder)** ke Klien untuk mengirimkan bahan baku titipan sesuai jadwal dan spesifikasi yang disepakati. |
| **6** | **Hirarki & Fleksibilitas Mandor** | **Secara platform hak akses Kepala Produksi/Ops setara Mandor, namun secara struktural lebih tinggi. Default: 2 Mandor + 1 Kepala Ops, dengan pengaturan dinamis untuk >2 Mandor.** | Dalam sistem, keduanya memiliki menu operasional produksi yang sama. Untuk pembagian **Bonus QC 3-Arah (FR-10.3)**, sistem mengalokasikan default ke 3 orang (2 Mandor + 1 Kepala Ops, masing-masing $\frac{1}{3}$ bagian), namun **disediakan toggle/setting dinamis** jika ke depan jumlah mandor bertambah menjadi 3, 4, atau lebih. |
| **7** | **Dual-Mode Input 30 Menit** | **Input oleh Mandor -> Langsung Terverifikasi (`Verified`). Input oleh Penjahit -> Wajib Diverifikasi Mandor (`Pending`).** | Mendukung fleksibilitas lantai pabrik Ciwidey: Jika Mandor berkeliling membawa tablet dan menginputkan, data langsung sah. Jika Penjahit menginput mandiri lewat terminal/HP, data berstatus `Pending Verification` hingga disahkan oleh Mandor dengan tombol *1-Tap Approve*. |
| **8** | **Operasional Cutting oleh Gudang** | **Pemotongan kain (Cutting) dilakukan langsung oleh Tim Gudang.** | Setelah bahan baku lolos validasi anti-kontaminasi FR-6.2 di pintu gudang, proses pemotongan pola kain (*Cutting*) dilakukan langsung oleh personil Tim Gudang sebelum bundle potongan diserahkan ke penjahit lini jahit. |
| **9** | **Toleransi Sisa Bahan Titipan** | **Diasumsikan TIDAK ADA sisa bahan titipan (tidak ada kelebihan maupun kekurangan bahan).** | Untuk menyederhanakan perhitungan konsumsi bahan pada siklus produksi awal, seluruh kain yang dikeluarkan ke cutting diasumsikan terkonversi pas sesuai target *yield* pesanan massal tanpa residu kain mati (*zero remnant/scrap assumption*). |
| **10** | **Wewenang Tim Sampler & Multi-Role** | **Sampler adalah personel pendaftaran klaim/spesifikasi klien & penerbit order produksi massal.** | Tim Sampler (Mbak Lina) memegang wewenang input awal klaim spesifikasi/sampel klien, menjalankan studi waktu (*Digital Stopwatch* SMV & BOM), dan menerbitkan Order Produksi Massal saat sampel disetujui. Seluruh 8 role wajib nyaman diakses di Mobile maupun PC. |

---

## 🎯 Panduan Menjawab Pertanyaan saat Presentasi (Q&A Defense)

### Q1: *"Mengapa baju yang reject di QC tidak memotong gaji penjahit?"*
> **Jawaban:** *"Di pabrik garmen garmen semi-padat karya seperti Ciwidey dengan ±70 mesin, pemotongan gaji akibat reject di ujung akhir seringkali memicu sengketa karena sulit membuktikan apakah cacat diakibatkan oleh penjahit stasiun 1, perakitan stasiun 2, atau cacat kain dari supplier. Dengan menetapkan bahwa verifikasi Mandor di stasiun 30 menit adalah dasar upah, penjahit tetap termotivasi bekerja cepat, sementara mutu tetap terkendali karena mandor bertanggung jawab langsung di lini dan bonus mandor sendiri terikat pada persentase barang yang lolos QC."*

### Q2: *"Kenapa skema CMT murni yang bahannya dari klien tetap membuat PO?"*
> **Jawaban:** *"PO pada skema CMT bukan Purchase Order komersial untuk beli bahan ke toko kain, melainkan dokumen Purchase Order Jasa Produksi & Surat Tagihan Komitmen Bahan Titipan ke Klien. Dokumen ini menjadi dasar hukum legal gudang untuk menerima surat jalan titipan kain klien dan mengunci Tag ID Klien + ID Pesanan pada sistem Anti-Kontaminasi (FR-6.1)."*

### Q3: *"Bagaimana jika di masa depan pabrik menambah lini dan memiliki 4 mandor?"*
> **Jawaban:** *"Sistem tidak meng-hardcode pembagian 3 orang. Di halaman Pengaturan Owner, kami menyediakan konfigurasi dinamis penerima pool bonus QC. Default sistem terisi 2 Mandor + 1 Kepala Operasional (masing-masing 33,33%), namun Owner dapat menambah daftar penerima menjadi 4 atau 5 pengawas dengan persentase proporsional secara instan tanpa ubah kode program."*

### Q4: *"Apakah penjahit harus punya HP canggih untuk input 30 menit?"*
> **Jawaban:** *"Tidak wajib. Platform mendukung Dual-Mode: Mandor bisa berkeliling membawa 1 tablet lini dan menginputkan langsung untuk penjahit (otomatis terverifikasi). Namun jika ada penjahit yang ingin lapor mandiri atau menggunakan kiosk tablet bersama di ujung lini, mereka bisa tap numpad layar sentuh, yang nantinya tinggal di-ACC sekaligus oleh Mandor."*

### Q5: *"Siapa yang berhak mendaftarkan klaim sampel dan menerbitkan order produksi massal?"*
> **Jawaban:** *"Tim Sampler (Mbak Lina). Sampler adalah personel yang menerima dan mendaftarkan klaim spesifikasi sampel baru klien ke dalam sistem, melakukan pengujian waktu standar (SMV) dan konsumsi bahan (BOM), lalu secara resmi menerbitkan Order Produksi Massal ketika versi sampel telah disetujui (Approved v2)."*

### Q6: *"Siapa yang mengeksekusi cutting dan kapan QC memeriksa pakaian?"*
> **Jawaban:** *"Proses Cutting dilakukan langsung oleh Tim Gudang (Kang Asep) setelah bahan lolos validasi anti-kontaminasi FR-6.2. Sedangkan pemeriksaan QC dilakukan HANYA saat barang sudah menjadi produk pakaian utuh (Barang Jadi hasil stasiun assembly/finishing), bukan pada komponen potongan lepas."*
