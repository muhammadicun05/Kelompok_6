# DESIGN_SYSTEM.md: Lukla Operations Engine

Dokumen ini diturunkan dari BRD V3 dan PRD v1.0. Ini usulan arah desain. Kalau tim sudah punya referensi visual sendiri (PRD bagian 8 menyebut desain diekstrak dari referensi pilihan pengguna), bagian warna dan font bisa ditukar tanpa mengubah prinsip dan komponennya.

---

## 1. Arah desain: "Lembar kerja pabrik, bukan dashboard SaaS"

### Siapa yang memakai, di mana
- Mandor dan penjahit memakai tablet atau HP di lantai pabrik: cahaya terang, tangan lembap atau berdebu benang, waktu terbatas, input setiap 30 menit.
- Finance dan Owner memakai desktop untuk membaca angka: gaji, pool bonus, overhead.
- Klien B2B membuka portal dari kantor mereka sendiri dan hanya ingin tahu "pesanan saya sampai mana".
- Gudang memakai HP untuk scan QR. Satu kesalahan (bahan Klien A masuk pesanan Klien B) adalah masalah paling mahal di sistem ini.

### Dari mana identitas visualnya diambil
Visualnya diambil dari bahan dan kebiasaan dunia garmen, bukan dari template aplikasi:

| Dunia garmen | Menjadi apa di UI |
| :--- | :--- |
| Benang berwarna per kerjaan | **Warna klien**: setiap klien punya satu warna benang yang menempel di semua barang miliknya |
| Jahitan jelujur (basting) vs jahitan mati | **Status verifikasi**: garis putus-putus = belum diverifikasi, garis penuh = sah |
| Kapur penjahit | **Satu-satunya aksen cerah**: menandai "yang sedang dikerjakan sekarang" |
| Kain denim / celupan indigo | **Warna dasar** teks dan navigasi |
| Tiket kerja (bundle ticket) dan hang tag | Bentuk **Tag Klien** dan **Slip Gaji** |
| Udara dingin Ciwidey, nama Lukla dan Snøhund | Kanvas abu kebiruan seperti kabut, bukan krem hangat |

### Satu hal yang dibuat paling berkesan
**Warna benang klien.** Fungsinya langsung menjawab masalah utama BRD (kontaminasi silang): setiap item, baris tabel, label QR, dan notifikasi memakai warna dan monogram klien yang sama. Saat Gudang salah ambil, layar menampilkan dua warna yang bertabrakan, sehingga kesalahannya terbaca dalam sekejap tanpa perlu membaca paragraf.

Elemen lain sengaja dibuat tenang supaya satu hal ini menonjol.

---

## 2. Yang sengaja dihindari

Ini daftar "tanda tangan" desain buatan AI yang tidak dipakai di sini:

- Latar krem dengan serif dan aksen terakota.
- Latar hitam dengan satu warna neon (hijau asam atau merah jingga).
- Gaya koran: garis tipis dan kolom rapat tanpa sudut membulat.
- Semua konten dipotong jadi kartu identik, sudut sama, bayangan abu lembut yang sama.
- Gradien sebagai hiasan, atau KPI "angka besar + label kecil + gradien".
- Label ALL CAPS berjarak lebar di atas setiap judul.
- Teks kecil berfont monospace sebagai "gaya teknis".
- Tanda panah "→" di setiap tombol, dan string meta berpemisah titik tengah.
- Satu kata di judul diberi warna atau miring berbeda.
- Setiap section muncul dengan fade dan slide-up, setiap kartu bereaksi saat di-hover.
- Penomoran 01 / 02 / 03 pada konten yang bukan urutan. (Penomoran hanya dipakai untuk versi sampel v1, v2 dan 6 fase, karena itu memang berurutan.)

---

## 3. Warna

### 3.1 Palet dasar (6 warna bernama)

| Nama | Hex | Peran |
| :--- | :--- | :--- |
| **Kabut** | `#E6ECEE` | Kanvas halaman |
| **Lembar** | `#F8FAFA` | Permukaan kerja (tabel, form, slip) |
| **Celup Indigo** | `#26325B` | Navigasi, judul, tombol utama |
| **Tinta** | `#151A24` | Teks utama (bukan hitam murni) |
| **Kapur** | `#E8E36B` | Aksen: penanda "sekarang" dan "terpilih" |
| **Benang Abu** | `#9AA5AE` | Garis, ikon nonaktif, teks sekunder pada permukaan gelap |

Teks sekunder pada Lembar memakai `#4B5563`. Garis pembatas memakai `#C9D2D7`.

Kapur hanya dipakai sebagai latar sorotan dengan teks Indigo di atasnya, seperti coretan kapur: slot 30 menit yang sedang berjalan, mesin yang sedang dipilih, baris yang sedang difokuskan. Kapur tidak dipakai untuk tombol, tautan, atau dekorasi.

### 3.2 Warna status (makna tetap, tidak dipakai untuk hal lain)

| Status | Hex | Dipakai untuk |
| :--- | :--- | :--- |
| Lolos | `#1F7A4D` | QC Lolos, stok cocok |
| Perbaikan | `#A86A00` | QC Repair, menunggu tindakan |
| Cacat / Blokir | `#B3261E` | QC Reject, blokir anti-kontaminasi, error |
| Info | `#2F5FA8` | Notifikasi netral |

Warna status **tidak pernah berdiri sendiri**: selalu disertai ikon dan teks (Lolos = centang, Perbaikan = panah putar, Cacat = silang). Ini penting untuk pekerja yang buta warna dan untuk layar tablet di bawah cahaya terang.

### 3.3 Warna Benang Klien (identitas tenant)

Palet ini sengaja **tidak memakai hijau, merah, dan kuning-oranye**, supaya tidak tertukar dengan warna status.

| Slot | Hex | Catatan |
| :--- | :--- | :--- |
| Snøhund (tetap) | `#5FA0C8` | Biru es, merek internal |
| Klien 1 | `#7A5BB0` | Ungu |
| Klien 2 | `#BE3F7C` | Magenta |
| Klien 3 | `#8A5A3B` | Cokelat |
| Klien 4 | `#1F8A93` | Teal |
| Klien 5 | `#6E7480` | Batu |
| Klien 6+ | Variasi dari slot di atas + pola garis | Pola dipakai bila warna habis |

Aturan pakai:
1. Warna klien ditetapkan otomatis saat klien dibuat, bukan dipilih manual.
2. Selalu muncul bersama **monogram dua huruf** dan nama (misal `SH Snøhund`, `KA Klien A`). Warna saja tidak boleh menjadi satu-satunya penanda.
3. Muncul sebagai: garis benang di sisi kiri baris tabel (4px), Tag Klien, label QR, garis tipis di atas Portal B2B.
4. Di Portal B2B, hanya warna klien itu sendiri yang tampil.

### 3.4 Dark mode
Tidak untuk rilis pertama. Lantai pabrik terang, dan satu tema yang diuji ketat lebih berguna daripada dua tema setengah matang. Kalau nanti ditambah, mulai dari Terminal (shift malam), bukan dari Dashboard.

---

## 4. Tipografi

**Satu keluarga font: [Archivo](https://fonts.google.com/specimen/Archivo)** (variable, punya sumbu lebar `wdth` 62–125).

Alasan: satu keluarga dengan dua "kepribadian" lewat lebar huruf. Lebar normal untuk teks dan form. Lebar sempit tebal untuk angka besar di terminal, supaya digit 3–4 angka tetap terbaca dari jarak lengan. Tidak memakai Inter atau font default lain.

| Peran | Pengaturan |
| :--- | :--- |
| Judul halaman | Archivo 600, `wdth 100`, 31px, tracking −0.01em |
| Judul seksi | Archivo 600, 20px |
| Teks isi | Archivo 400, 16px, line-height 1.5, panjang baris maks 70 karakter |
| Teks tabel | Archivo 400, 14px, `font-variant-numeric: tabular-nums` |
| Label field | Archivo 500, 14px, sentence case |
| Angka terminal | Archivo 700, `wdth 80`, 64–96px |
| Angka rupiah (payroll) | Archivo 500, tabular-nums, rata kanan, format `Rp 1.250.000` |

Skala (rasio ±1.25, desktop): 12 · 14 · 16 · 20 · 25 · 31 · 39.
Skala terminal (tablet): 20 · 28 · 40 · 64 · 96.

Aturan:
- Label memakai **sentence case**, tidak ALL CAPS.
- Tidak ada label kecil di atas judul hanya untuk hiasan.
- Angka selalu rata kanan di tabel, dengan satuan di header kolom, bukan di setiap sel.
- Pastikan fitur `tnum` aktif di build font yang dipakai. Kalau tidak, uji kolom payroll dan ganti ke font cadangan dengan angka tabular.
- Cadangan: `"Archivo", "Arial Narrow", system-ui, sans-serif`.

---

## 5. Bentuk, jarak, elevasi

### Sudut: berbeda sesuai peran, bukan satu radius untuk semua

| Elemen | Radius |
| :--- | :--- |
| Sel tabel, input form | 3px |
| Panel kerja | 6px |
| Tombol terminal (besar) | 12px |
| Chip status | Pill penuh |
| Tag Klien | Sudut kanan atas dipotong (efek hang tag), 45° 8px |

### Jarak
Basis 4px: 4 · 8 · 12 · 16 · 24 · 32 · 48. Terminal memakai jarak antar-tombol minimal 12px agar tidak salah ketuk.

### Elevasi
- **Tanpa bayangan lembut.** Pemisahan lewat warna permukaan (Kabut ke Lembar) dan garis 1px `#C9D2D7`.
- Satu-satunya "angkat" adalah bayangan keras `0 2px 0 #C9D2D7` pada elemen yang bisa diketuk, memberi kesan tumpukan kertas.
- Modal dan drawer: garis 1px Indigo dan overlay Indigo 40%, tanpa blur.

### Struktur
Garis, pemisah, dan border selalu membawa informasi:
- Garis benang kiri = milik klien siapa.
- Garis putus-putus = belum diverifikasi.
- Garis penuh = sudah sah.
- Pemisah horizontal di tabel hanya ada bila ada pengelompokan (per klien, per minggu).

---

## 6. Dua pola khas sistem

### 6.1 Benang Klien (`ThreadEdge` + `ClientTag`)
```
┃ SH  Kain Katun Combed 30s     120 m     Pesanan #SH-0412
┃ KA  Kain Drill                 86 m     Pesanan #KA-0098
```
Garis tebal di kiri adalah benang klien. Pada grid gudang, filter klien memakai Tag Klien sebagai tombol.

### 6.2 Jahitan Status (`StitchBorder`)
Menerjemahkan aturan bisnis #7 PRD (Mandor langsung `Verified`, Penjahit `Pending Verification`):

| Status | Tampilan |
| :--- | :--- |
| `Pending Verification` | Border putus-putus (jelujur) berwarna Indigo, latar Lembar |
| `Verified` | Border penuh Indigo, ikon centang kecil |
| `Menunggu QC` | Border penuh, label Info |
| Terkunci (histori) | Border penuh Benang Abu, ikon gembok |

Saat Mandor menekan **Verifikasi**, garis putus-putus berubah menjadi penuh dengan animasi jahitan (lihat bagian Gerak). Tidak perlu penjelasan teks: tampilan yang berubah sudah menunjukkan apa yang terjadi.

---

## 7. Gerak

Prinsip: **gerak menjawab tindakan pengguna.** Tidak ada animasi yang berjalan sendiri kecuali satu momen pembuka.

| Token | Nilai |
| :--- | :--- |
| `--dur-fast` | 120ms (tekan tombol, toggle) |
| `--dur-base` | 220ms (buka drawer, expand baris) |
| `--dur-slow` | 420ms (jahitan, grafik pertama kali) |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` |

### Gerak yang dipakai

1. **Jahitan verifikasi (420ms).** Saat Mandor mengetuk Verifikasi, garis penuh "dijahit" menimpa garis putus-putus dari kiri ke kanan (`stroke-dashoffset`). Setelah selesai, chip berganti ke `Verified`.
2. **Tombol angka (120ms).** Tombol menekan turun 2px (bayangan keras hilang), lalu naik. Memberi umpan balik fisik tanpa suara.
3. **Odometer bonus QC.** Saat QC Inspector mengetuk **Lolos**, angka Pool Bonus naik dengan digit bergulir vertikal (160ms per digit). Hanya terjadi sebagai respons ketukan, tidak berulang sendiri.
4. **Blokir anti-kontaminasi.** Layar merah muncul **tanpa transisi** (instan), karena ini peringatan. Dua Tag Klien yang bertabrakan menetap di tengah. Di perangkat yang mendukung, getar `navigator.vibrate([80, 40, 80])`. Tidak ada otomatis tutup: pengguna harus mengetuk **Mengerti**.
5. **Grafik kecepatan 30 menit.** Garis tergambar sekali saat Dashboard pertama kali dibuka (420ms). Saat data baru masuk, hanya titik terakhir yang bergeser, tidak menggambar ulang.
6. **Kapur berpindah.** Sorotan Kapur pada slot waktu aktif bergeser ke slot berikutnya setiap 30 menit (220ms). Ini satu-satunya gerak yang tidak dipicu pengguna, dan sengaja, untuk menarik perhatian ke waktu input berikutnya.
7. **Drawer dan expand.** Slide dari tepi 220ms, ease-out. Hanya untuk membuka/menutup.

### Yang tidak dipakai
Entrance bertahap pada setiap section, hover yang mengangkat kartu, parallax, shimmer dekoratif, dan skeleton berkedip lebih dari 1 siklus.

### Reduced motion
Bila `prefers-reduced-motion: reduce`: jahitan diganti perubahan garis instan + ikon centang, odometer diganti angka langsung, Kapur berpindah tanpa transisi. Getar tetap berjalan karena itu peringatan keselamatan data.

```css
.stitch-fill {
  stroke-dasharray: var(--len);
  stroke-dashoffset: var(--len);
  animation: stitch var(--dur-slow) var(--ease-out) forwards;
}
@keyframes stitch { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .stitch-fill { animation: none; stroke-dashoffset: 0; }
}
```

---

## 8. Komponen kunci

### 8.1 Terminal Input 30 Menit
- Target ketuk minimal **72 × 72px**, jarak 12px.
- Numpad 3×4 (1–9, hapus, 0, simpan). Angka Archivo 700 `wdth 80`, 40px.
- Header menampilkan slot waktu (`08:00`, `08:30`, `09:00`...). Slot aktif diberi sorotan Kapur.
- Jumlah yang diketik tampil sangat besar (64–96px) di atas numpad.
- Tombol **Verifikasi** besar satu ketukan untuk Mandor. Untuk Penjahit, tombolnya **Kirim ke Mandor**, dan hasilnya bergaris putus-putus.
- Peta mesin ±70 tampil sebagai grid 10 × 7 (tablet) atau 7 × 10 dengan scroll (HP).

**Status petak mesin** (dibedakan dengan bentuk garis, bukan hanya warna):

| Kondisi | Tampilan |
| :--- | :--- |
| Kosong | Garis tipis Benang Abu, tanpa isi |
| Aktif, sudah terverifikasi | Isi Indigo 10%, garis penuh |
| Ada input `Pending` | Garis putus-putus Indigo |
| Terlambat input (> 30 menit) | Titik Perhatian Perbaikan di pojok atas |
| Dipilih | Isi Kapur |

### 8.2 Terminal QC
Tiga tombol raksasa, setiap tombol minimal 40% tinggi layar tablet, urutan tetap (tidak diacak):

| Tombol | Warna | Ikon | Label |
| :--- | :--- | :--- | :--- |
| Lolos | Hijau status, teks putih | Centang | Lolos |
| Perbaikan | Amber status, teks putih | Panah putar | Perbaikan |
| Cacat | Merah status, teks putih | Silang | Cacat |

Setelah Cacat diketuk, muncul pemilih jenis cacat (chip besar). Di sisi layar, penghitung **Pool Bonus QC** terlihat terus. Pool menampilkan juga pembagiannya (contoh: `Rp 900.000 dibagi 3 = Rp 300.000`) agar sesuai UAT-03.

### 8.3 Gudang dan layar blokir
Layar blokir (FR-6.2) berisi:
```
┌───────────────────────────────────────────────┐
│  Pengeluaran dibatalkan                       │
│                                               │
│   [KA Klien A]   tidak cocok   [KB Klien B]   │
│   Bahan milik                  Pesanan milik  │
│                                               │
│   Stok tidak dikurangi. Kejadian dicatat.     │
│                                               │
│   [ Pindai ulang ]        [ Mengerti ]        │
└───────────────────────────────────────────────┘
```
Latar penuh merah status, teks putih, kedua Tag Klien memakai warna klien masing-masing dengan kontur putih.

### 8.4 Sample dan versi
Daftar versi adalah **urutan sungguhan**, jadi penomoran dipakai:
```
v1  Ditolak      12 Okt   Konsumsi kain 1,2 m    Waktu jahit 14:20
v2  Disetujui    15 Okt   Konsumsi kain 1,1 m    Waktu jahit 12:45   [ Jadikan pesanan massal ]
```
Perubahan antar versi ditandai di tempat (selisih BOM dan waktu), bukan di halaman terpisah.
Stopwatch: angka 64px, tombol Mulai / Lap / Reset / Simpan ke komponen, tinggi 72px.

### 8.5 Slip Gaji dan Workspace Payroll
Slip digambarkan seperti slip kertas: lebar tetap 360px, garis perforasi putus-putus di atas dan bawah, angka rata kanan.
```
Penjahit   Dewi S.        Mesin #14
Minggu     5–11 Okt 2026
- - - - - - - - - - - - - - - - - - - - - - - -
Kerah       420 pcs × 800            Rp   336.000
Lengan      380 pcs × 1.100          Rp   418.000
Upah borongan                        Rp   754.000
Uang makan  12%                      Rp    90.480
- - - - - - - - - - - - - - - - - - - - - - - -
Total diterima                       Rp   844.480
```
Slider uang makan 10–15% punya langkah 1%, nilai terpilih ditampilkan di samping tanpa perlu hitung manual. Kartu Bonus QC menunjukkan 3 penerima default dengan opsi menambah jumlah Mandor.

### 8.6 Tanya Lukla AI
- Drawer di desktop (kanan, 420px), layar penuh di HP.
- Jawaban berupa teks biasa. **Kutipan** memakai bentuk label dokumen: nama berkas `.md` + potongan teks pendek, bisa dibuka.
- Pertanyaan cepat disesuaikan peran (Gudang: "Kapan bahan boleh dikeluarkan?", Finance: "Bagaimana uang makan dihitung?").
- Indikator memuat: tiga titik statis bergilir (tanpa gelombang berkilau). Bila gagal, tampilkan penyebab dan tombol coba lagi.
- Tidak memakai ikon bintang percikan, avatar robot, atau gradien ungu.

### 8.7 Portal Klien Maklon
Tenang dan lapang: satu kolom utama, garis benang warna klien di atas halaman, **timeline 6 fase** dengan penomoran (karena memang urutan), dan stok titipan sebagai tabel sederhana. Tidak ada elemen yang menyiratkan ada klien lain.

---

## 9. Layout

### 9.1 Desktop (1440 × 900)
```
┌────┬──────────────────────────────────────────────┐
│Nav │  Lantai pabrik (peta mesin ±70, hero)        │
│72px│  ─────────────────────────────────────────── │
│    │  Output 30 menit (garis)  │  Peringatan       │
│    │  Pesanan aktif per klien  │  Menunggu verif.  │
└────┴──────────────────────────────────────────────┘
```
- Navigasi kiri sempit (ikon + label di bawah, 72px), isi mengikuti peran.
- Konten rata kiri, lebar maks 1360px, grid 12 kolom.
- **Hero Dashboard adalah peta mesin hidup**, bukan baris 4 KPI. Angka ringkasan berupa satu baris kalimat di atasnya:
  `52 dari 70 mesin aktif. 1.840 pcs hari ini. 94% lolos QC.`

### 9.2 Tablet (768 × 1024) dan HP (390 × 844)
```
┌──────────────────────┐
│ Slot 08:30   Lini 2  │
│ ┌──────────────────┐ │
│ │   Mesin #14      │ │
│ │       118        │ │   angka 96px
│ └──────────────────┘ │
│  [1] [2] [3]         │
│  [4] [5] [6]         │
│  [7] [8] [9]         │
│  [⌫] [0] [Simpan]    │
└──────────────────────┘
```
- HP: tab bawah maksimal 4 item, tombol Tanya Lukla AI terpisah di pojok kanan bawah.
- Terminal dipakai dalam mode lanskap dan potret, dan kedua orientasi diuji.
- Zona ibu jari: aksi utama selalu di separuh bawah layar.

### 9.3 Pola per peran
| Peran | Layar awal |
| :--- | :--- |
| Owner | Dashboard + parameter (Rate Card, % uang makan, jumlah Mandor) |
| Tim Sample | Sample & Time Study |
| Gudang | Grid stok + tombol Pindai |
| Kepala Produksi / Mandor | Terminal 30 Menit |
| Penjahit | Tugas hari ini + input |
| QC Inspector | Terminal QC |
| Finance | Workspace Payroll |
| Klien B2B | Portal pesanan |

---

## 10. Suara dan teks antarmuka

- Bahasa Indonesia sehari-hari, **sentence case**, kata kerja aktif.
- Tombol menyebut hasil: "Simpan output", "Verifikasi", "Kirim ke Mandor", bukan "Submit" atau "OK".
- Nama aksi tetap sama di seluruh alur. Tombol **Verifikasi** menghasilkan notifikasi **Diverifikasi**.
- Error menjelaskan apa yang terjadi dan apa langkah berikutnya, tanpa meminta maaf.
- Layar kosong mengajak bertindak.

| Situasi | Teks |
| :--- | :--- |
| Blokir gudang | "Bahan milik Klien A, pesanan milik Klien B. Stok tidak dikurangi." |
| Input menunggu | "Menunggu verifikasi Mandor." |
| Sampel disetujui | "v2 disetujui. Jadikan pesanan massal?" |
| Gudang kosong | "Belum ada bahan masuk untuk klien ini. Terima bahan baru." |
| Gagal simpan | "Output belum tersimpan. Periksa koneksi, lalu ketuk Simpan lagi." |
| Slot terlewat | "Slot 09:00 belum diisi." |

Istilah mengikuti BRD/PRD (Lolos, Perbaikan, Cacat, Menunggu QC, Uang makan, Bonus QC). Hindari istilah teknis di tampilan (RLS, tenant, RPC).

---

## 11. Aksesibilitas dan keandalan

- Kontras teks isi minimal 4,5:1, teks besar dan tombol terminal minimal 3:1. Verifikasi nilai Amber `#A86A00` dengan alat kontras saat implementasi, karena paling dekat batas.
- Status tidak pernah hanya berupa warna: selalu ikon + teks, atau bentuk garis.
- Fokus keyboard terlihat: garis Indigo 2px + jarak 2px (di Kapur untuk latar gelap).
- Target ketuk umum 44px, terminal 72px.
- Layar blokir dapat dibaca pembaca layar (`role="alertdialog"`).
- Input angka memakai `inputmode="numeric"` agar keyboard HP benar.
- Terminal tetap berfungsi bila koneksi putus sebentar: input disimpan lokal dan diberi tanda "Belum terkirim" dengan garis putus-putus, lalu dikirim ulang otomatis.
- Dukungan uji: viewport 1440×900, 768×1024, 390×844 (sesuai UAT-05).

---

## 12. Token (CSS dan Tailwind v4)

```css
:root {
  /* dasar */
  --kabut: #E6ECEE;
  --lembar: #F8FAFA;
  --indigo: #26325B;
  --tinta: #151A24;
  --kapur: #E8E36B;
  --benang-abu: #9AA5AE;
  --garis: #C9D2D7;
  --teks-2: #4B5563;

  /* status */
  --lolos: #1F7A4D;
  --perbaikan: #A86A00;
  --cacat: #B3261E;
  --info: #2F5FA8;

  /* benang klien */
  --klien-snohund: #5FA0C8;
  --klien-1: #7A5BB0;
  --klien-2: #BE3F7C;
  --klien-3: #8A5A3B;
  --klien-4: #1F8A93;
  --klien-5: #6E7480;

  /* gerak */
  --dur-fast: 120ms;
  --dur-base: 220ms;
  --dur-slow: 420ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);

  /* bentuk */
  --r-cell: 3px;
  --r-panel: 6px;
  --r-terminal: 12px;
  --tekan: 0 2px 0 var(--garis);
}

html { background: var(--kabut); color: var(--tinta); }
body { font-family: "Archivo", "Arial Narrow", system-ui, sans-serif; }
table, .angka { font-variant-numeric: tabular-nums; }
.terminal-angka { font-weight: 700; font-stretch: 80%; }
```

```css
/* Tailwind v4: app/globals.css */
@theme {
  --color-kabut: #E6ECEE;
  --color-lembar: #F8FAFA;
  --color-indigo-celup: #26325B;
  --color-tinta: #151A24;
  --color-kapur: #E8E36B;
  --color-lolos: #1F7A4D;
  --color-perbaikan: #A86A00;
  --color-cacat: #B3261E;
  --font-sans: "Archivo", "Arial Narrow", system-ui, sans-serif;
}
```

Warna klien tidak ditulis keras di komponen. Ambil dari data (`client.threadColor`) supaya klien baru otomatis mendapat warna dan monogram.

---

## 13. Catatan keputusan desain

Rencana awal saya sempat mengarah ke latar krem hangat dengan serif, lalu ke tema industri gelap dengan aksen neon. Keduanya saya buang, karena itu pilihan umum yang muncul untuk "pabrik" atau "sistem operasional" dan tidak menjawab masalah nyata sistem ini. Yang dipertahankan hanya yang punya alasan fungsional:

- **Kanvas Kabut yang dingin**: nyaman dibaca lama dan jelas berbeda dari tema krem. Mengikuti suasana Ciwidey dan nama Lukla/Snøhund.
- **Warna benang klien**: langsung melayani FR-6.1 dan FR-6.2.
- **Garis putus-putus vs penuh**: langsung melayani aturan verifikasi Mandor.
- **Kapur sebagai satu-satunya aksen**: menandai konteks "sekarang" di lantai pabrik.
- **Archivo lebar-variabel**: angka besar di terminal tanpa perlu font kedua.

---

## 14. Checklist sebelum menggabungkan UI baru

- [ ] Apakah ada Tag Klien (warna + monogram + nama) di setiap tempat yang menyangkut stok, pesanan, atau label?
- [ ] Apakah status verifikasi dibedakan dengan bentuk garis dan ikon, bukan hanya warna?
- [ ] Apakah semua angka uang rata kanan dan tabular?
- [ ] Apakah tombol di terminal setidaknya 72px dan berjarak 12px?
- [ ] Apakah ada animasi yang berjalan tanpa tindakan pengguna selain pergeseran Kapur? Kalau ada, hapus.
- [ ] Apakah ada kartu identik berderet hanya sebagai pembungkus? Gabungkan jadi satu panel atau tabel.
- [ ] Apakah ada label ALL CAPS, gradien, bayangan lembut, atau panah "→" yang dipakai tanpa alasan? Hapus.
- [ ] Apakah pesan error menyebut penyebab dan langkah berikutnya?
- [ ] Apakah layar diuji di 1440×900, 768×1024, dan 390×844?
- [ ] Apakah `prefers-reduced-motion` ditangani?
