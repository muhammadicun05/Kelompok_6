"""
Lukla Operations Engine — Telegram Bot Module & Notification Architecture
Kompatibel dengan BRD v1.5 dan Catatan Tambahan (14-10-2026):
1. Quick Action Approval On-The-Fly untuk Owner & Finance
2. Factory Daily Pulse (/pulse) dengan ringkasan output, 68/70 mesin, FIFO assembly, dan pool bonus QC
3. B2B Client Visual Progress Bar (/status <order_no>)
4. Dual-Mode: Live Telegram API via httpx bila token terpasang, atau Fallback Simulator bila token belum diisi.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, Optional, List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import httpx
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger("lukla-telegram-bot")
logger.setLevel(logging.INFO)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_DEFAULT_CHAT_ID = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "")
TELEGRAM_API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}" if TELEGRAM_BOT_TOKEN else ""


class LuklaTelegramBot:
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        self.default_chat_id = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "").strip()
        self.is_active = bool(self.token)

    def is_configured(self) -> bool:
        """Cek apakah token Telegram sudah dikonfigurasi di environment."""
        return bool(self.token)

    def send_message(
        self,
        chat_id: Optional[str] = None,
        text: str = "",
        parse_mode: str = "Markdown",
        reply_markup: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Kirim pesan ke Telegram Chat ID.
        Jika token belum ada, otomatis berjalan dalam Simulator Mode dan mencatat ke log.
        """
        target_chat = chat_id or self.default_chat_id or "123456789"

        if not self.is_configured():
            # Mode Simulasi Arsitektur Siap Pakai
            sim_result = {
                "status": "simulated",
                "delivered": True,
                "message": "Token TELEGRAM_BOT_TOKEN belum diset di .env. Pesan disimulasikan berhasil.",
                "chat_id": target_chat,
                "payload": {
                    "text": text,
                    "parse_mode": parse_mode,
                    "reply_markup": reply_markup
                }
            }
            print(f"[Lukla Telegram Simulator] Chat {target_chat}:\n{text}")
            if reply_markup:
                print(f"[Buttons]: {json.dumps(reply_markup, indent=2)}")
            return sim_result

        # Mode Live Telegram API
        try:
            url = f"{TELEGRAM_API_BASE}/sendMessage"
            body: Dict[str, Any] = {
                "chat_id": target_chat,
                "text": text,
                "parse_mode": parse_mode
            }
            if reply_markup:
                body["reply_markup"] = reply_markup

            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=body)
                data = res.json()
                return {
                    "status": "delivered" if res.status_code == 200 else "error",
                    "telegram_response": data,
                    "status_code": res.status_code
                }
        except Exception as e:
            logger.error(f"Telegram send error: {str(e)}")
            return {
                "status": "exception",
                "error": str(e)
            }

    def format_factory_pulse(self) -> str:
        """
        Generate ringkasan Factory Daily Pulse (/pulse).
        """
        pulse_text = (
            "🏭 *LUKLA OPERATIONS — FACTORY PULSE*\n"
            "📅 *14 Oktober 2026*\n\n"
            "⚡ *Kapasitas & Alokasi Mesin:*\n"
            "• *68 / 70 Mesin Aktif* (97.1% Utilisasi)\n"
            "• Lini A: 25 mesin | Lini B: 25 mesin | Lini C: 18 mesin\n\n"
            "✂️ *Meja Potong (Cutting Station):*\n"
            "• Status: 500 pcs (Winter Parka V2) selesai potong\n"
            "• Diserahkan ke: Penjahit-Operator Lini A & B\n\n"
            "🧵 *Lini Jahit & Assembly (Dual-Mode):*\n"
            "• Penjahit-Operator: 320 pcs komponen verified (interval 30 menit)\n"
            "• Penjahit-Assembly: *3 bundle siap rakit dalam antrean FIFO*\n"
            "  └ *FIFO #1*: BND-2026-001 (Badan Depan & Belakang)\n\n"
            "🔍 *Inspeksi QC Produk Utuh:*\n"
            "• Tingkat Lolos: *98.2%*\n"
            "• Unit Lolos: 2.946 pcs | Perbaikan: 42 pcs | Cacat: 12 pcs\n"
            "• *Pool Bonus QC Terkumpul: Rp 883.800*\n"
            "  └ Dibagi 3-Arah: *Rp 294.600* per Mandor (2x) & Ka. Ops (1x)\n\n"
            "💰 *Penagihan & Invoice B2B:*\n"
            "• ORD-2026-004 (Snøhund): *DP 50% Diterima* (Rp 4.550.000)\n"
        )
        return pulse_text

    def format_client_status(self, order_id: str = "ORD-2026-004") -> str:
        """
        Generate visual progress bar untuk Portal Klien B2B (/status <order_no>).
        """
        progress_text = (
            f"📦 *STATUS PESANAN B2B: {order_id}*\n"
            "Artikel: *Winter Parka V2 (Heavyweight)*\n"
            "Klien: *Snøhund*\n"
            "Skema Maklon: *SEMI_CMT* | Jumlah: *500 pcs*\n\n"
            "Progres Produksi: `[▓▓▓▓▓▓▓▓░░]` *80%*\n\n"
            "1. ✅ Intake Spesifikasi & Sampel Disetujui (Approved v2)\n"
            "2. ✅ Penerimaan Bahan & Meja Potong (Cutting Station)\n"
            "3. ✅ Jahit Komponen Lepas (Operator 30-Menit)\n"
            "4. 🔄 *Perakitan Produk Utuh (Penjahit-Assembly FIFO #1)*\n"
            "5. ⏳ Inspeksi Kualitas (Terminal QC Produk Utuh)\n"
            "6. ⏳ Pelunasan Tagihan & Pengiriman Ekspedisi\n\n"
            "Estimasi Selesai: *18 Oktober 2026*"
        )
        return progress_text

    def send_order_approval_request(
        self,
        order_id: str,
        client_name: str,
        article_name: str,
        quantity: int,
        scheme: str,
        chat_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Kirim Quick Action Approval ke Owner saat Sampler membuat pesanan massal.
        """
        text = (
            "🚨 *PERSETUJUAN PESANAN MASSAL BARU (OWNER)*\n\n"
            f"No. Order: `{order_id}`\n"
            f"Klien: *{client_name}*\n"
            f"Artikel: *{article_name}*\n"
            f"Volume: *{quantity:,} pcs*\n"
            f"Skema Maklon: *{scheme}*\n\n"
            "Apakah Anda menyetujui penerbitan order produksi ini?"
        )

        reply_markup = {
            "inline_keyboard": [
                [
                    {
                        "text": "✅ Setujui Order Produksi",
                        "callback_data": f"approve_order:{order_id}"
                    },
                    {
                        "text": "❌ Tolak Order",
                        "callback_data": f"reject_order:{order_id}"
                    }
                ]
            ]
        }

        return self.send_message(
            chat_id=chat_id,
            text=text,
            reply_markup=reply_markup
        )

    def handle_callback_query(self, callback_data: str) -> Dict[str, Any]:
        """
        Tangani interaksi tombol inline quick action.
        """
        if callback_data.startswith("approve_order:"):
            order_id = callback_data.split(":")[1]
            return {
                "action": "APPROVED",
                "order_id": order_id,
                "message": f"Order {order_id} berhasil disetujui oleh Owner via Telegram. Akun portal klien kini dapat diaktifkan oleh Tim Sampler."
            }
        elif callback_data.startswith("reject_order:"):
            order_id = callback_data.split(":")[1]
            return {
                "action": "REJECTED",
                "order_id": order_id,
                "message": f"Order {order_id} ditolak oleh Owner."
            }
        return {"action": "UNKNOWN", "message": "Callback tidak dikenali"}


# Singleton instance
telegram_bot = LuklaTelegramBot()


if __name__ == "__main__":
    print("=== Testing Lukla Telegram Bot Architecture ===")
    print(f"Is Configured: {telegram_bot.is_configured()}")
    
    # Test Pulse
    print("\n--- Factory Pulse ---")
    pulse = telegram_bot.format_factory_pulse()
    print(pulse)

    # Test Order Approval Alert
    print("\n--- Order Approval Alert ---")
    res = telegram_bot.send_order_approval_request(
        order_id="ORD-2026-004",
        client_name="Snøhund",
        article_name="Winter Parka V2",
        quantity=500,
        scheme="SEMI_CMT"
    )
    print("Approval Alert Result:", res)

    # Test Client Status
    print("\n--- Client Status ---")
    status = telegram_bot.format_client_status("ORD-2026-004")
    print(status)
