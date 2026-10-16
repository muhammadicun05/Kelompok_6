"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  BookOpen, 
  Sparkles, 
  FileText, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useRole } from "@/components/Layout/RoleContext";
import { Role } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ source: string; text: string }>;
  timestamp: string;
}

const ROLE_PROMPTS: Record<Role, string[]> = {
  OWNER: [
    "Bagaimana aturan bonus QC dibagi?",
    "Apakah gaji borongan terpengaruh oleh unit cacat di QC?",
    "Bagaimana pembagian overhead per unit dihitung?",
    "Bagaimana alur persetujuan pesanan massal dari sampel v2?",
  ],
  SAMPLE_TEAM: [
    "Bagaimana alur revisi sampel v1 ke v2?",
    "Apa perbedaan skema CMT, Semi-CMT, dan Full Package?",
    "Bagaimana cara mengunci SMV dan BOM ke pesanan massal?",
  ],
  WAREHOUSE: [
    "Kapan bahan baku boleh dikeluarkan ke Cutting?",
    "Apa yang terjadi jika terjadi kontaminasi silang (FR-6.2)?",
    "Bagaimana prosedur penerimaan barang jadi lolos QC?",
  ],
  PRODUCTION_HEAD_MANDOR: [
    "Bagaimana cara verifikasi input 30 menit penjahit?",
    "Bagaimana cara menambah penjahit baru di tengah minggu?",
    "Bagaimana aturan Dual-Mode input 30 menit?",
  ],
  TAILOR_OPERATOR: [
    "Bagaimana status laporan output saya diverifikasi?",
    "Apakah perbaikan (repair) QC memotong upah saya?",
    "Berapa interval waktu pelaporan output di terminal?",
  ],
  TAILOR_ASSEMBLY: [
    "Bagaimana alur penggabungan komponen menjadi produk utuh?",
    "Kapan produk yang sudah digabung berpindah ke status Menunggu QC?",
    "Apakah meja assembly dihitung sebagai stasiun jahit?",
  ],
  QC_INSPECTOR: [
    "Bagaimana unit lolos QC menambah Pool Bonus?",
    "Apakah QC memeriksa per komponen atau produk utuh?",
    "Apa perbedaan keputusan Pass dan Repair di terminal?",
  ],
  FINANCE_PAYROLL: [
    "Bagaimana uang makan 10-15% dimasukkan ke slip gaji?",
    "Bagaimana rumus take home pay penjahit dan mandor?",
    "Bagaimana perhitungan komponen PPN 11% pada faktur B2B?",
  ],
  B2B_CLIENT: [
    "Bagaimana saya melacak progres pesanan saya di portal?",
    "Apa fungsi PO komitmen pada skema CMT murni?",
    "Apakah data stok kain titipan saya terpisah dari klien lain?",
  ],
};

export default function AssistantPage() {
  const { currentRole } = useRole();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        `Halo! Saya Asisten Kecerdasan Operasional Lukla (AI Factory Agent). Saya siap menjawab pertanyaan seputar SOP pabrik, aturan bisnis 10 poin, rumus penggajian, validasi anti-kontaminasi, dan alur 6 fase operasional. Silakan ketik pertanyaan Anda atau pilih topik di bawah.`,
      timestamp: "Baru saja",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = ROLE_PROMPTS[currentRole] || ROLE_PROMPTS.OWNER;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend, role: currentRole }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer || "Maaf, sistem tidak dapat memproses jawaban saat ini.",
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Terjadi gangguan koneksi ke layanan AI. Pastikan server RAG aktif.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-work border border-garis shadow-hard overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-celup-indigo text-white flex items-center justify-between border-b border-garis">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-work bg-kapur text-celup-indigo flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <span>Asisten AI Operasional Lukla</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Titan + Nova Lite
              </span>
            </h1>
            <p className="text-xs text-white/80">
              Pengetahuan Berbasis RAG: BRD V3, BPMN 2.0, 10 Aturan Bisnis Resmi &amp; SOP Pabrik
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-white/80">Peran Aktif:</span>
          <span className="bg-kapur text-celup-indigo font-bold px-2 py-0.5 rounded font-mono">
            {currentRole}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-lembar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-2xl rounded-work p-4 shadow-sm text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-celup-indigo text-white rounded-br-none"
                  : "bg-white text-tinta border border-garis rounded-bl-none space-y-2"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations if available */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-garis/60 space-y-1.5 text-[11px]">
                  <span className="font-bold text-celup-indigo flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sumber Dokumen Rujukan Resmi:</span>
                  </span>
                  {msg.citations.map((c, ci) => (
                    <div key={ci} className="bg-kabut p-2 rounded border border-garis">
                      <span className="font-mono font-bold text-celup-indigo block mb-0.5">
                        {c.source}
                      </span>
                      <p className="text-teks-sekunder italic line-clamp-3">&quot;{c.text}&quot;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[10px] text-teks-sekunder font-mono mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-teks-sekunder font-medium p-3 bg-white rounded-work border border-garis w-fit animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-celup-indigo" />
            <span>Asisten sedang mencari dokumen rujukan &amp; memformulasikan jawaban...</span>
          </div>
        )}
      </div>

      {/* Suggested Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-garis flex items-center gap-2 overflow-x-auto select-none">
        <span className="text-[11px] font-bold text-teks-sekunder flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-celup-indigo" />
          <span>Topik Peran {currentRole}:</span>
        </span>
        {quickPrompts.map((prompt, pi) => (
          <button
            key={pi}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-kabut hover:bg-celup-indigo hover:text-white rounded-full text-[11px] font-medium text-tinta whitespace-nowrap transition-all flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-garis flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Tanyakan aturan operasional atau SOP untuk ${currentRole}...`}
          className="flex-1 bg-lembar border border-garis rounded-field px-4 py-2.5 text-xs text-tinta placeholder-teks-sekunder focus:outline-none focus:border-celup-indigo"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-celup-indigo text-white font-bold text-xs rounded-field shadow-hard hover:bg-celup-indigo/90 disabled:opacity-50 flex items-center gap-1.5 transition-all"
        >
          <span>Kirim</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
