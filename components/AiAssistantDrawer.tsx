"use client";

import React, { useState } from "react";
import { X, Send, BookOpen, ChevronRight, HelpCircle } from "lucide-react";
import { Role } from "@/lib/types";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
}

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
  ],
  SAMPLE_TEAM: [
    "Bagaimana alur revisi sampel v1 ke v2?",
    "Apa perbedaan skema CMT, Semi-CMT, dan Full Package?",
  ],
  WAREHOUSE: [
    "Kapan bahan baku boleh dikeluarkan ke Cutting?",
    "Apa yang terjadi jika terjadi kontaminasi silang (FR-6.2)?",
  ],
  PRODUCTION_HEAD_MANDOR: [
    "Bagaimana cara verifikasi input 30 menit penjahit?",
    "Bagaimana cara menambah penjahit baru di tengah minggu?",
  ],
  TAILOR_OPERATOR: [
    "Bagaimana status laporan output saya diverifikasi?",
    "Apakah perbaikan (repair) QC memotong upah saya?",
  ],
  QC_INSPECTOR: [
    "Bagaimana unit lolos QC menambah Pool Bonus?",
    "Apakah QC memeriksa per komponen atau produk utuh?",
  ],
  FINANCE_PAYROLL: [
    "Bagaimana uang makan 10-15% dimasukkan ke slip gaji?",
    "Bagaimana rumus take home pay penjahit dan mandor?",
  ],
  B2B_CLIENT: [
    "Bagaimana saya melacak progres pesanan saya?",
    "Apa fungsi PO komitmen pada skema CMT murni?",
  ],
};

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentRole,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo, saya Asisten Pengetahuan Operasional Lukla. Tanyakan aturan bisnis, SOP gudang, rumus penggajian, atau alur kerja 6 fase.",
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
        content: data.answer || "Maaf, tidak dapat mengambil jawaban.",
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Terjadi kesalahan jaringan saat menghubungi layanan Tanya Lukla AI.",
          timestamp: "Sekarang",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-celup-indigo/40">
      <div className="w-full sm:w-[420px] h-full bg-lembar border-l border-garis flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-16 px-4 border-b border-garis bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-celup-indigo" />
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">Tanya Lukla AI</h2>
              <span className="text-[11px] text-teks-sekunder">Knowledge Assistant • RAG Bedrock</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teks-sekunder hover:text-celup-indigo rounded-field"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-kabut/60 border-b border-garis overflow-x-auto flex gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs text-celup-indigo bg-white px-2.5 py-1.5 rounded-work border border-garis hover:border-celup-indigo whitespace-nowrap flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] p-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-celup-indigo text-white rounded-work"
                    : "bg-white border border-garis text-tinta rounded-work"
                }`}
              >
                <p>{m.content}</p>

                {/* Citations Pill list */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-garis space-y-1">
                    <span className="text-[10px] font-semibold text-teks-sekunder block">
                      Rujukan Dokumen:
                    </span>
                    {m.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="text-[11px] text-celup-indigo bg-kabut px-2 py-1 rounded border border-garis flex items-center justify-between"
                      >
                        <span className="font-mono truncate">{c.source.split("/").pop()}</span>
                        <span className="text-[10px] text-teks-sekunder ml-2 truncate max-w-[150px]">
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-teks-sekunder mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-1.5 p-3 bg-white border border-garis rounded-work w-24">
              <span className="w-2 h-2 rounded-full bg-celup-indigo animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-celup-indigo animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-celup-indigo animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-garis">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan aturan bisnis, SOP, atau rumus..."
              className="flex-1 bg-kabut border border-garis rounded-field px-3 py-2 text-sm text-tinta focus:outline-none focus:border-celup-indigo"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-celup-indigo text-white rounded-field disabled:opacity-50 hover:bg-celup-indigo/90"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
