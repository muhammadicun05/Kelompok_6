import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_DEFAULT_CHAT_ID || "";
  const isConfigured = Boolean(token.trim());

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    mode: isConfigured ? "live" : "simulated",
    bot_username: isConfigured ? "@LuklaOpsBot" : "Simulator Mode (Pending Token)",
    default_chat_id: chatId ? `${chatId.slice(0, 4)}****` : "Belum diset",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, order_id, client_name, article_name, quantity, scheme, chat_id, message } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN || "";
    const targetChatId = chat_id || process.env.TELEGRAM_DEFAULT_CHAT_ID || "123456789";

    // 1. Try forwarding to Python FastAPI RAG microservice if online
    const ragServiceUrl = process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "http://localhost:8000";
    try {
      const pyRes = await fetch(`${ragServiceUrl}/notify/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: event_type || "CUSTOM",
          order_id,
          client_name,
          article_name,
          quantity,
          scheme,
          chat_id: targetChatId,
          custom_message: message,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json({
          success: true,
          source: "PYTHON_RAG_SERVICE",
          data: pyData,
        });
      }
    } catch {
      // Python microservice offline or in sandbox; proceed with native Next.js logic
    }

    // 2. Prepare message text based on event_type
    let textToSend = "";
    let replyMarkup: any = null;

    if (event_type === "FACTORY_PULSE") {
      textToSend =
        "🏭 *LUKLA OPERATIONS — FACTORY PULSE*\n" +
        "📅 *15 Oktober 2026*\n\n" +
        "⚡ *Kapasitas & Alokasi Mesin:*\n" +
        "• *68 / 70 Mesin Aktif* (97.1% Utilisasi)\n" +
        "• Lini A: 25 mesin | Lini B: 25 mesin | Lini C: 18 mesin\n\n" +
        "✂️ *Meja Potong (Cutting Station):*\n" +
        "• Status: 500 pcs (Winter Parka V2) selesai potong\n" +
        "• Diserahkan ke: Penjahit Operator Lini A & B\n\n" +
        "🧵 *Lini Jahit & Stasiun Assembly:*\n" +
        "• Penjahit Operator: 320 pcs komponen terverifikasi (30 menit)\n" +
        "• Penjahit Assembly: *3 bundle siap rakit (Antrean FIFO)*\n\n" +
        "🔍 *Inspeksi QC Produk Utuh:*\n" +
        "• Tingkat Lolos: *98.2%*\n" +
        "• Unit Lolos: 2.946 pcs | Perbaikan: 42 pcs | Cacat: 12 pcs\n" +
        "• *Pool Bonus QC Terkumpul: Rp 883.800*\n" +
        "  └ Dibagi 3-Arah: *Rp 294.600* per Mandor (2x) & Ka. Ops (1x)\n\n" +
        "💰 *Penagihan & Invoice B2B:*\n" +
        "• ORD-2026-004 (Snøhund): *DP 50% Diterima* (Rp 4.550.000)";
    } else if (event_type === "ORDER_APPROVAL") {
      const order = order_id || "ORD-2026-004";
      const client = client_name || "Snøhund";
      const article = article_name || "Winter Parka V2";
      const qty = quantity || 500;
      const maklonScheme = scheme || "SEMI_CMT";

      textToSend =
        "🚨 *PERSETUJUAN PESANAN MASSAL BARU (OWNER)*\n\n" +
        `No. Order: \`${order}\`\n` +
        `Klien: *${client}*\n` +
        `Artikel: *${article}*\n` +
        `Volume: *${qty.toLocaleString("id-ID")} pcs*\n` +
        `Skema Maklon: *${maklonScheme}*\n\n` +
        "Apakah Anda menyetujui penerbitan order produksi massal ini?";

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "✅ Setujui Order Produksi", callback_data: `approve_order:${order}` },
            { text: "❌ Tolak Order", callback_data: `reject_order:${order}` },
          ],
        ],
      };
    } else if (event_type === "CLIENT_STATUS") {
      const order = order_id || "ORD-2026-004";
      textToSend =
        `📦 *STATUS PESANAN B2B: ${order}*\n` +
        "Artikel: *Winter Parka V2 (Heavyweight)*\n" +
        "Klien: *Snøhund*\n" +
        "Skema Maklon: *SEMI_CMT* | Jumlah: *500 pcs*\n\n" +
        "Progres Produksi: `[▓▓▓▓▓▓▓▓░░]` *80%*\n\n" +
        "1. ✅ Intake Spesifikasi & Sampel Disetujui (Approved v2)\n" +
        "2. ✅ Penerimaan Bahan & Meja Potong (Cutting Station)\n" +
        "3. ✅ Jahit Komponen Lepas (Operator 30-Menit)\n" +
        "4. 🔄 *Perakitan Produk Utuh (Penjahit Assembly FIFO)*\n" +
        "5. ⏳ Inspeksi Kualitas (Terminal QC Produk Utuh)\n" +
        "6. ⏳ Pelunasan Tagihan & Pengiriman Ekspedisi\n\n" +
        "Estimasi Selesai: *18 Oktober 2026*";
    } else {
      textToSend = message || "Notifikasi resmi dari Lukla Operations Engine.";
    }

    // 3. If live Telegram token is provided, send to api.telegram.org
    if (token) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: textToSend,
            parse_mode: "Markdown",
            reply_markup: replyMarkup,
          }),
        });

        const tgData = await tgRes.json();
        return NextResponse.json({
          success: tgRes.ok,
          mode: "live",
          delivered: tgRes.ok,
          telegram_response: tgData,
          chat_id: targetChatId,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          mode: "live_error",
          error: err.message,
        }, { status: 502 });
      }
    }

    // 4. Fallback: Simulator Mode (Token belum diisi)
    return NextResponse.json({
      success: true,
      mode: "simulated",
      delivered: true,
      message: "Token TELEGRAM_BOT_TOKEN belum diset di .env.local. Notifikasi berhasil disimulasikan sesuai format resmi.",
      chat_id: targetChatId,
      preview: {
        text: textToSend,
        reply_markup: replyMarkup,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
