"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Bot, X, RefreshCw, Smartphone, ExternalLink } from "lucide-react";

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [customText, setCustomText] = useState("");
  const [targetChatId, setTargetChatId] = useState("6050043896");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/telegram");
      const data = await res.json();
      setStatus(data);
      if (data.raw_chat_id) {
        setTargetChatId(data.raw_chat_id);
      }
    } catch {
      setStatus({ configured: false, mode: "simulated", bot_username: "Simulator Mode" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setResult(null);
    }
  }, [isOpen]);

  const triggerNotification = async (eventType: string, extra: any = {}) => {
    try {
      setSending(true);
      setResult(null);
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          chat_id: targetChatId || undefined,
          ...extra,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-terminal max-w-lg w-full border border-garis shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-garis bg-lembar flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-celup-indigo/10 flex items-center justify-center text-celup-indigo">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-celup-indigo flex items-center gap-2">
                Integrasi Telegram Bot Pabrik
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  status?.configured ? "bg-status-lolos/15 text-status-lolos" : "bg-amber-100 text-amber-800"
                }`}>
                  {status?.configured ? "LIVE BOT" : "SIMULATOR READY"}
                </span>
              </h2>
              <p className="text-[11px] text-teks-sekunder">
                Kirim notifikasi otomatis, laporan harian, dan approval order langsung ke Telegram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-kabut text-teks-sekunder hover:text-celup-indigo transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status Box */}
          <div className="p-3 bg-kabut rounded-field border border-garis flex items-center justify-between">
            <div>
              <span className="text-[10px] text-teks-sekunder uppercase font-bold tracking-wider block">
                Status Koneksi Bot:
              </span>
              <span className="font-semibold text-celup-indigo text-xs">
                {status?.configured ? "Terhubung ke Telegram API" : "Mode Simulasi (Siap Dipasang Token)"}
              </span>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-2 py-1 bg-white border border-garis rounded text-[11px] text-teks-sekunder hover:text-celup-indigo flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Cek Status</span>
            </button>
          </div>

          {/* Quick Actions Title */}
          <div>
            <span className="font-bold text-celup-indigo text-xs block mb-1.5">
              Pilih Aksi Pengujian Notifikasi:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {/* Action 1: Factory Pulse */}
              <button
                onClick={() => triggerNotification("FACTORY_PULSE")}
                disabled={sending}
                className="p-3 rounded-field border border-garis bg-white hover:border-celup-indigo hover:bg-lembar text-left transition-all group flex items-start gap-2.5 active:translate-y-0.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-celup-indigo group-hover:text-blue-700 flex items-center gap-1.5">
                    <span>Kirim Factory Daily Pulse (/pulse)</span>
                  </div>
                  <p className="text-[11px] text-teks-sekunder mt-0.5 leading-snug">
                    Laporan ringkasan lantai pabrik: 68/70 mesin aktif, output potong 500 pcs, antrean assembly FIFO, dan saldo bonus QC Rp 883.800.
                  </p>
                </div>
              </button>

              {/* Action 2: Quick Approval */}
              <button
                onClick={() => triggerNotification("ORDER_APPROVAL", {
                  order_id: "ORD-2026-004",
                  client_name: "Snøhund",
                  article_name: "Winter Parka V2",
                  quantity: 500,
                  scheme: "SEMI_CMT",
                })}
                disabled={sending}
                className="p-3 rounded-field border border-garis bg-white hover:border-celup-indigo hover:bg-lembar text-left transition-all group flex items-start gap-2.5 active:translate-y-0.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  🚨
                </div>
                <div>
                  <div className="font-bold text-celup-indigo group-hover:text-amber-800 flex items-center gap-1.5">
                    <span>Kirim Quick Action Approval Order (Owner)</span>
                  </div>
                  <p className="text-[11px] text-teks-sekunder mt-0.5 leading-snug">
                    Pemberitahuan persetujuan order ORD-2026-004 dengan tombol inline [Setujui Order] dan [Tolak Order] interaktif.
                  </p>
                </div>
              </button>

              {/* Action 3: Client Status */}
              <button
                onClick={() => triggerNotification("CLIENT_STATUS", { order_id: "ORD-2026-004" })}
                disabled={sending}
                className="p-3 rounded-field border border-garis bg-white hover:border-celup-indigo hover:bg-lembar text-left transition-all group flex items-start gap-2.5 active:translate-y-0.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  📦
                </div>
                <div>
                  <div className="font-bold text-celup-indigo group-hover:text-purple-700 flex items-center gap-1.5">
                    <span>Kirim Status Progres Pesanan B2B (/status)</span>
                  </div>
                  <p className="text-[11px] text-teks-sekunder mt-0.5 leading-snug">
                    Progress bar visual pesanan Klien Snøhund [▓▓▓▓▓▓▓▓░░] 80% dari meja potong hingga siap kirim.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Message Field */}
          <div className="space-y-1.5 pt-1 border-t border-garis">
            <label className="text-[11px] font-bold text-celup-indigo">Kirim Pesan Kustom / Chat ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Chat Telegram (opsional)..."
                value={targetChatId}
                onChange={(e) => setTargetChatId(e.target.value)}
                className="w-1/3 px-2.5 py-1.5 border border-garis rounded text-xs focus:outline-none focus:border-celup-indigo"
              />
              <input
                type="text"
                placeholder="Tulis pesan pengumuman pabrik..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-garis rounded text-xs focus:outline-none focus:border-celup-indigo"
              />
              <button
                onClick={() => triggerNotification("CUSTOM", { message: customText })}
                disabled={sending || !customText.trim()}
                className="px-3 py-1.5 bg-celup-indigo text-white font-semibold rounded text-xs hover:bg-celup-indigo/90 disabled:opacity-40 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Kirim</span>
              </button>
            </div>
          </div>

          {/* Result Alert Preview */}
          {result && (
            <div className={`p-3 rounded-field border text-xs space-y-1.5 ${
              result.success ? "bg-status-lolos/10 border-status-lolos text-celup-indigo" : "bg-red-50 border-red-300 text-red-900"
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {result.success ? <CheckCircle2 className="w-4 h-4 text-status-lolos" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{result.success ? "Notifikasi Berhasil Terkirim!" : "Gagal Mengirim"}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-garis ml-auto font-normal">
                  Mode: {result.mode || (result.data?.status === "delivered" ? "Live" : "Simulasi")}
                </span>
              </div>
              {result.message && (
                <p className={`text-[11px] leading-relaxed ${result.success ? "text-teks-sekunder" : "text-red-800 font-medium bg-red-100/70 p-2 rounded border border-red-200"}`}>
                  {result.message}
                </p>
              )}
              {result.preview?.text && (
                <div className="bg-white p-2.5 rounded border border-garis font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {result.preview.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info on setup */}
        <div className="px-5 py-3 border-t border-garis bg-lembar flex items-center justify-between text-[11px] text-teks-sekunder">
          <span>Pasang <code>TELEGRAM_BOT_TOKEN</code> di <code>.env.local</code> untuk bot aktif</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-garis rounded font-semibold text-celup-indigo hover:border-celup-indigo"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
