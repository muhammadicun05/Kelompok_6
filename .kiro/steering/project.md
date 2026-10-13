---
inclusion: always
---

# Project Context — Lukla Operations Engine

## Ringkasan Proyek
**Lukla Operations Engine** adalah platform operasional pabrik garmen multi-tenant untuk **Lukla Manufacturing** (Ciwidey, ±70 mesin jahit aktif) dan merk internal **Snøhund** (*made-to-order*), serta klien maklon B2B eksternal. Aplikasi ini kompatibel di perangkat **PC/Desktop** dan **Mobile/Tablet (Touch Terminal)**.

## 3 Skema Kerja Sama Maklon
1. **CMT (Cut, Make, Trim)**: Klien menyediakan 100% bahan baku titipan; Lukla menyediakan jasa potong, jahit, dan finishing.
2. **Semi-CMT**: Klien menyediakan bahan utama (titipan); Lukla menyediakan bahan pendukung & aksesori melalui PO.
3. **CMT + Bahan (Full Package)**: Lukla menyediakan 100% bahan baku dan produksi (standar untuk merk internal **Snøhund**).

## 6 Fase Alur Operasional (BPMN 2.0)
1. **Fase Sampel**: Input konsumsi bahan sampel, studi waktu per komponen (Digital Stopwatch), dan kontrol versi revisi (`v1 -> v2`).
2. **Persetujuan & Pesanan Massal**: Konfirmasi order massal dari versi sampel yang disetujui, pemilihan skema maklon, dan penetapan Rate Card serta parameter oleh Owner.
3. **Gudang & Pemotongan**: Pengajuan/persetujuan PO bahan baku, penerimaan bahan dengan **Mandatory Client Tagging (`FR-6.1`: `Tag ID Klien` + `ID Pesanan`)**, **Blokir Otomatis Anti-Kontaminasi (`FR-6.2`)** saat pengeluaran bahan ke Cutting jika pemilik tidak cocok, dan Cutting Massal.
4. **Lini Produksi**: Alokasi dinamis lintas lini hingga ±70 mesin jahit (`FR-7.1`), pencatatan output per **30 menit** pada layar sentuh (`FR-7.3`), verifikasi Mandor, dan penggabungan komponen ke status `Menunggu QC` (`FR-7.4`).
5. **QC & Barang Jadi**: Inspeksi di Terminal QC (`Lolos`, `Perbaikan/Repair`, `Cacat/Reject`), pencatatan kategori cacat, dan akumulasi otomatis **Pool Bonus QC** untuk setiap unit yang lolos.
6. **Penggajian & Rekap**: Perhitungan upah borongan mingguan setiap hari **Sabtu** (`FR-10.1`), input persentase **Uang Makan fleksibel 10–15%** (`FR-10.2`), pembagian **Bonus QC 3-Arah** rata kepada 2 Mandor + 1 Kepala Operasional (`FR-10.3`), alokasi **Overhead bulanan per unit** (`FR-10.4`), serta penerbitan Invoice & Slip Gaji.

## 8 Peran Pengguna (RBAC)
1. **Owner / Eksekutif**
2. **Tim Sample**
3. **Gudang (Warehouse)**
4. **Kepala Produksi / Mandor**
5. **Penjahit / Operator**
6. **QC Inspector**
7. **Finance & Payroll**
8. **Klien Maklon (B2B Portal)** — Terisolasi ketat hanya pada data milik `Tag ID Klien` sendiri.

## 10 Asumsi & Aturan Bisnis Resmi (Locked Rules & Bahan Presentasi)
1. **Gaji Borongan vs QC**: Gaji TIDAK terpengaruh status barang QC (tidak ada potongan/clawback).
2. **Fungsi QC**: QC HANYA memicu penambahan Pool Bonus QC (setiap unit lolos).
3. **Uang Makan (10–15%)**: Menjadi uang tunai dan masuk langsung ke Slip Gaji penjahit (`THP = Upah Borongan + Uang Makan`).
4. **Objek QC**: QC diasumsikan memeriksa pakaian yang sudah berupa 1 produk utuh (barang jadi).
5. **PO CMT Murni**: Tetap menerbitkan PO langsung ke Client (sebagai *reminder* & *tracking* komitmen titipan).
6. **Mandor vs Kepala Ops**: Akses platform setara, struktural Kepala Ops di atas Mandor. Default bonus QC: 2 Mandor + 1 Kepala Ops, dengan opsi dinamis jika Mandor > 2.
7. **Dual-Mode 30 Menit**: Input Mandor -> langsung `Verified`. Input Penjahit -> `Pending Verification` (wajib diverifikasi Mandor).
8. **Tim Cutting**: Diasumsikan sama seperti penjahit (masuk borongan setara).
9. **Sisa Bahan**: Diasumsikan TIDAK ADA sisa bahan (kelebihan maupun kekurangan).
10. **Dukungan Perangkat**: SEMUA 8 Role wajib bisa diakses dan nyaman di Mobile maupun Desktop (PC).

