"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Check, 
  Clock, 
  Send, 
  Delete, 
  UserPlus, 
  Layers, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StitchBorder } from "@/components/Design/StitchBorder";
import { ClientTag } from "@/components/Design/ThreadEdge";
import { useRole } from "@/components/Layout/RoleContext";

const TIME_SLOTS = [
  "08:00-08:30",
  "08:30-09:00",
  "09:00-09:30",
  "09:30-10:00",
  "10:00-10:30",
  "10:30-11:00",
  "11:00-11:30",
  "13:00-13:30",
  "13:30-14:00",
  "14:00-14:30",
  "14:30-15:00",
  "15:00-15:30",
];

export default function ProductionTerminalPage() {
  const { currentRole } = useRole();
  const [selectedMachine, setSelectedMachine] = useState<number>(1);
  const [activeSlot, setActiveSlot] = useState<string>("09:00-09:30");
  const [typedQty, setTypedQty] = useState<string>("20");
  const [activeComponent, setActiveComponent] = useState<string>("Badan Depan & Kantong Kanguru");
  const [activeRole, setActiveRole] = useState<"MANDOR" | "TAILOR_OPERATOR">("MANDOR");

  useEffect(() => {
    if (currentRole === "TAILOR_OPERATOR") {
      setActiveRole("TAILOR_OPERATOR");
    } else {
      setActiveRole("MANDOR");
    }
  }, [currentRole]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/production/30min");
      const data = await res.json();
      if (data.logs) {
        setTodayLogs(data.logs);
      }

      const { data: ords } = await supabase
        .from("orders")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (ords && ords.length > 0) {
        setOrders(ords);
        if (!selectedOrderId) setSelectedOrderId(ords[0].id);
      }
    } catch (err) {
      console.error("Error loading logs:", err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Numpad Touch Handlers (Section 8.1)
  const handleDigit = (digit: string) => {
    if (typedQty === "0") {
      setTypedQty(digit);
    } else if (typedQty.length < 3) {
      setTypedQty((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (typedQty.length <= 1) {
      setTypedQty("0");
    } else {
      setTypedQty((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmitOutput = async () => {
    const qty = Number(typedQty);
    if (qty <= 0) {
      alert("Masukkan jumlah unit output yang valid!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/production/30min", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId || orders[0]?.id,
          machineNumber: selectedMachine,
          operatorUserId: "a1111111-0000-0000-0000-000000000007", // Siti / Operator
          componentName: activeComponent,
          slotTime: activeSlot,
          qtyCompleted: qty,
          inputtedByRole: activeRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(
          activeRole === "MANDOR"
            ? `Output ${qty} pcs di Mesin #${selectedMachine} berhasil dicatat & Langsung VERIFIED!`
            : `Output ${qty} pcs di Mesin #${selectedMachine} berhasil dikirim (Status PENDING menunggu verifikasi Mandor).`
        );
        loadLogs();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1-Tap Mandor Verify Handler (Transforms Dashed StitchBorder to Solid Checkmark)
  const handleVerifyLog = async (logId: string) => {
    try {
      const res = await fetch("/api/production/30min", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId,
          mandorUserId: "a1111111-0000-0000-0000-000000000005", // Mandor Ujang
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification("Status berhasil diverifikasi oleh Mandor!");
        loadLogs();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 4: Terminal Input 30 Menit & Lini Mesin
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            ±70 Mesin Jahit Aktif • Dual-Mode Input (Penjahit = Pending, Mandor = Langsung Verified)
          </p>
        </div>

        {/* Dual Mode Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-kabut p-1.5 rounded-field border border-garis w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-teks-sekunder px-1">Mode Terminal:</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveRole("TAILOR_OPERATOR")}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeRole === "TAILOR_OPERATOR"
                  ? "bg-celup-indigo text-white shadow-sm"
                  : "bg-white/80 text-teks-sekunder hover:text-celup-indigo border border-garis"
              }`}
            >
              Penjahit (Pending)
            </button>
            <button
              onClick={() => setActiveRole("MANDOR")}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeRole === "MANDOR"
                  ? "bg-kapur text-celup-indigo shadow-sm border border-celup-indigo"
                  : "bg-white/80 text-teks-sekunder hover:text-celup-indigo border border-garis"
              }`}
            >
              Mandor (Verified)
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-white border-2 border-celup-indigo rounded-field text-xs font-semibold text-celup-indigo flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-status-lolos" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* 30-Minute Time Slot Pill Bar with Kapur Highlight (Section 8.1) */}
      <div className="bg-lembar p-3 rounded-work border border-garis shadow-hard overflow-x-auto">
        <div className="text-[11px] font-semibold text-teks-sekunder mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-celup-indigo" />
          <span>Slot Waktu 30 Menit Hari Ini (Kapur Menandai Slot Aktif):</span>
        </div>
        <div className="flex items-center gap-2">
          {TIME_SLOTS.map((slot) => {
            const isActive = activeSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-field whitespace-nowrap border transition-all ${
                  isActive
                    ? "bg-kapur text-celup-indigo border-celup-indigo shadow-hard"
                    : "bg-white text-teks-sekunder border-garis hover:border-celup-indigo"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Giant Touch Numpad & Input Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo shadow-hard">
            <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
              <span className="text-xs font-bold text-celup-indigo">
                Terminal Input Mesin #{selectedMachine}
              </span>
              <span className="font-mono text-xs font-semibold bg-kabut px-2 py-0.5 rounded text-celup-indigo">
                {activeSlot}
              </span>
            </div>

            {/* Target Order & Component Selector */}
            <div className="space-y-2 mb-4">
              <div>
                <label className="text-[11px] font-semibold text-teks-sekunder block mb-0.5">
                  Order Produksi:
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full text-xs bg-white border border-garis rounded p-2 text-celup-indigo font-bold"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — {o.article_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-teks-sekunder block mb-0.5">
                  Komponen Garmen:
                </label>
                <select
                  value={activeComponent}
                  onChange={(e) => setActiveComponent(e.target.value)}
                  className="w-full text-xs bg-white border border-garis rounded p-2 text-tinta font-semibold"
                >
                  <option value="Badan Depan & Kantong Kanguru">Badan Depan & Kantong Kanguru (Jahit)</option>
                  <option value="Lengan & Pasang Rib Manset">Lengan & Pasang Rib Manset (Jahit)</option>
                  <option value="Assembly Kap & Finishing Utuh">Assembly Kap & Finishing Utuh (Assembly)</option>
                  <option value="Potong Pola Komplit">Potong Pola Komplit (Cutting)</option>
                </select>
              </div>
            </div>

            {/* Giant Display of Typed Quantity (64-96px Archivo 700) */}
            <div className="bg-white border-2 border-garis rounded-terminal p-4 text-center mb-4">
              <span className="text-[11px] text-teks-sekunder block uppercase tracking-wider">
                Output 30 Menit Ini
              </span>
              <div className="text-7xl font-extrabold text-celup-indigo font-mono tabular-nums leading-tight">
                {typedQty}
              </div>
              <span className="text-xs font-semibold text-teks-sekunder">pcs selesai</span>
            </div>

            {/* Big 3x4 Touch Numpad (>= 72px buttons, 12px gap) */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-16 rounded-terminal bg-white border-2 border-garis hover:border-celup-indigo text-2xl font-extrabold text-celup-indigo shadow-hard transition-all active:translate-y-1 active:shadow-none"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-16 rounded-terminal bg-kabut border-2 border-garis text-tinta font-bold text-sm shadow-hard flex items-center justify-center transition-all active:translate-y-1 active:shadow-none"
              >
                <Delete className="w-6 h-6 text-teks-sekunder" />
              </button>
              <button
                onClick={() => handleDigit("0")}
                className="h-16 rounded-terminal bg-white border-2 border-garis hover:border-celup-indigo text-2xl font-extrabold text-celup-indigo shadow-hard transition-all active:translate-y-1 active:shadow-none"
              >
                0
              </button>
              <button
                onClick={() => setTypedQty("0")}
                className="h-16 rounded-terminal bg-kabut border-2 border-garis text-tinta font-bold text-xs shadow-hard flex items-center justify-center transition-all active:translate-y-1 active:shadow-none"
              >
                Clear
              </button>
            </div>

            {/* Submission Button */}
            <button
              onClick={handleSubmitOutput}
              disabled={loading}
              className={`w-full py-3.5 sm:py-4 px-2 sm:px-4 rounded-terminal font-extrabold text-sm sm:text-base shadow-hard flex items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none text-center ${
                activeRole === "MANDOR"
                  ? "bg-kapur text-celup-indigo hover:bg-kapur/90"
                  : "bg-celup-indigo text-white hover:bg-celup-indigo/90"
              }`}
            >
              {activeRole === "MANDOR" ? (
                <>
                  <Check className="w-5 h-5 stroke-[3] flex-shrink-0" />
                  <span className="truncate sm:whitespace-normal">Input & Verifikasi Mandor (Langsung Sah)</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate sm:whitespace-normal">Kirim Laporan ke Mandor (Pending)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): ±70 Machine Visual Map & 30-Min Logs with 1-Tap Verify */}
        <div className="lg:col-span-7 space-y-6">
          {/* ±70 Sewing Machine Visual Grid (Section 8.1) */}
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-3">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <div>
                <h2 className="text-sm font-bold text-celup-indigo">
                  Peta Denah ±70 Mesin Jahit Lantai Pabrik
                </h2>
                <span className="text-[11px] text-teks-sekunder">
                  Pilih nomor mesin untuk melihat penugasan atau menginput output
                </span>
              </div>
              <span className="text-xs font-bold text-celup-indigo bg-white px-2 py-1 rounded border border-garis">
                Mesin Terpilih: #{selectedMachine}
              </span>
            </div>

            {/* 70 Machines Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-1">
              {Array.from({ length: 70 }, (_, i) => i + 1).map((mNum) => {
                const isSelected = selectedMachine === mNum;
                // Machines 1-20 Lini A, 21-45 Lini B, 46-70 Lini C (Ekspansi UAT-02)
                const isNewExpansion = mNum >= 61 && mNum <= 65;
                const hasPending = mNum === 2; // Siti/Rina machine pending verification

                return (
                  <button
                    key={mNum}
                    onClick={() => setSelectedMachine(mNum)}
                    className={`h-9 rounded-field text-xs font-bold font-mono transition-all flex flex-col items-center justify-center border ${
                      isSelected
                        ? "bg-kapur text-celup-indigo border-celup-indigo shadow-sm scale-105 z-10"
                        : hasPending
                        ? "border-2 border-dashed border-celup-indigo bg-lembar text-celup-indigo"
                        : isNewExpansion
                        ? "bg-white border-status-perbaikan text-status-perbaikan"
                        : "bg-white border-garis text-tinta hover:border-celup-indigo"
                    }`}
                  >
                    <span>#{mNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 text-[10px] sm:text-[11px] text-teks-sekunder pt-2 border-t border-garis">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-kapur border border-celup-indigo rounded flex-shrink-0"></span> Terpilih
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-dashed border-celup-indigo rounded flex-shrink-0"></span> Ada Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border border-status-perbaikan text-status-perbaikan rounded flex-shrink-0"></span> Mesin Baru (#61–#65)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-white border border-garis rounded flex-shrink-0"></span> Aktif
              </span>
            </div>
          </div>

          {/* Real-time 30-Min Logs Feed with 1-Tap Mandor Verify (Section 6.2 & UAT-02) */}
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-3">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <h2 className="text-sm font-bold text-celup-indigo">
                Riwayat Output 30 Menit & Status Verifikasi
              </h2>
              <span className="text-xs text-teks-sekunder">
                Garis Putus-Putus = Pending • Garis Penuh = Sah
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayLogs.map((log) => {
                const isVerified = log.verification_status === "VERIFIED";

                return (
                  <StitchBorder
                    key={log.id}
                    status={isVerified ? "VERIFIED" : "PENDING"}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-celup-indigo font-mono text-sm">
                            Mesin #{log.machine_number}
                          </span>
                          <span className="text-xs font-mono bg-kabut px-1.5 py-0.5 rounded text-teks-sekunder">
                            {log.slot_time}
                          </span>
                          <span className="text-[11px] text-teks-sekunder">
                            (Diinput: {log.inputted_by_role})
                          </span>
                        </div>
                        <div className="text-xs text-tinta font-semibold mt-1">
                          {log.component_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-celup-indigo font-mono tabular-nums">
                            {log.qty_completed}
                          </span>
                          <span className="text-[10px] text-teks-sekunder block">pcs</span>
                        </div>

                        {!isVerified && (
                          <button
                            onClick={() => handleVerifyLog(log.id)}
                            className="px-3 py-1.5 bg-status-lolos text-white text-xs font-bold rounded-field shadow-hard hover:bg-status-lolos/90 flex items-center gap-1 transition-all active:translate-y-0.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>1-Tap Verifikasi</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </StitchBorder>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
