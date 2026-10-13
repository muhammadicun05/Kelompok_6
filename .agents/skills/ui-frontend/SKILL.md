---
name: ui-frontend
description: >-
  Reverse-engineers visual design from reference websites or screenshots into a production-grade
  DESIGN_SYSTEM.md file for Lukla Operations Engine (responsive on PC desktop and mobile/tablet touch terminals).
---

# UI Front-End Reverse Engineering Skill

Skill ini bertugas menganalisis situs web referensi yang diberikan oleh pengguna, mengekstrak bahasa desain visualnya, dan menyusun spesifikasi desain lengkap ke dalam file `DESIGN_SYSTEM.md`.

## Alur Kerja Reverse Engineering

1. **Input Referensi**:
   - Pengguna memberikan URL situs referensi (misalnya: Stripe Dashboard, Linear, Vercel, platform ERP industri, atau e-commerce apparel).
   - Atau pengguna mengunggah gambar/screenshot antarmuka.

2. **Ekstraksi Elemen Desain**:
   - **Atmosfer & Tema Visual**: Modern Industrial Precision, Scandinavian Elegance (karakteristik Snøhund), High-Contrast Factory Floor.
   - **Palet Warna**:
     - *Base*: Background, Card Surface, Border, Foreground Text.
     - *Brand / Accent*: Snøhund Brand Accent (Navy / Nordic Slate / Alpine Blue).
     - *Status Operasional Pabrik*:
       - Lolos QC: Emerald Green (`#10B981`)
       - Perbaikan (Repair): Amber Orange (`#F59E0B`)
       - Cacat (Reject): Crimson Red (`#EF4444`)
       - Blokir Anti-Kontaminasi: Flashing Alert Red (`#DC2626`)
       - 30-Min Telemetry Active: Cyan / Indigo Pulse
   - **Tipografi**:
     - *Display / Headings*: Clean Sans (Inter / Geist Sans)
     - *Terminal Numpad & Stopwatch Data*: Tabular Monospace (Geist Mono / JetBrains Mono) agar angka 30 menit & detik stopwatch tidak bergeser saat live-updating.
   - **Desain Komponen Adaptif**:
     - **Mode PC Desktop (`1440x900`)**: Data Table padat (*dense grid*), multi-column KPIs, modal filter, fixed sidebar.
     - **Mode Mobile/Tablet Touch Terminal (`390x844` & `768x1024`)**: Tombol aksi raksasa (*Touch Target* $\ge 48\text{px}$ hingga $64\text{px}$), Numpad layar sentuh, drawer bottom-sheet, tanpa *horizontal scrolling*.

3. **Output File**:
   - Simpan hasil ekstraksi ke dalam `DESIGN_SYSTEM.md` di root proyek.
   - Semua pembuatan komponen Next.js + Tailwind CSS selanjutnya wajib merujuk pada token di file tersebut.
