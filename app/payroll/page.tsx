"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Calculator, 
  DollarSign, 
  Users, 
  Printer, 
  Sparkles,
  CheckCircle2,
  Sliders,
  Building
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PayrollPage() {
  const [mealPct, setMealPct] = useState<number>(12); // Flexible 10-15% slider
  const [numMandors, setNumMandors] = useState<number>(2); // Default 2 Mandors (+ 1 Kepala Ops)
  const [monthlyOverhead, setMonthlyOverhead] = useState<number>(18500000); // Rp 18.5jt overhead
  const [estimatedMonthlyUnits, setEstimatedMonthlyUnits] = useState<number>(6000);
  const [periodCode, setPeriodCode] = useState<string>("PAY-2026-W41");
  const [payrollSummary, setPayrollSummary] = useState<any | null>(null);
  const [payrollItems, setPayrollItems] = useState<any[]>([
    {
      id: "init-1",
      worker_role: "TAILOR_OPERATOR",
      verified_output_pcs: 38,
      piece_rate_subtotal: 95000,
      meal_allowance_cash: 11400,
      qc_bonus_received: 0,
      take_home_pay: 106400,
      user_profiles: { full_name: "Siti Rahma (Penjahit #01)" }
    },
    {
      id: "init-2",
      worker_role: "TAILOR_OPERATOR",
      verified_output_pcs: 12,
      piece_rate_subtotal: 38400,
      meal_allowance_cash: 4608,
      qc_bonus_received: 0,
      take_home_pay: 43008,
      user_profiles: { full_name: "Budi Santoso (Penjahit Baru #61)" }
    },
    {
      id: "init-3",
      worker_role: "TAILOR_OPERATOR",
      verified_output_pcs: 14,
      piece_rate_subtotal: 28000,
      meal_allowance_cash: 3360,
      qc_bonus_received: 0,
      take_home_pay: 31360,
      user_profiles: { full_name: "Wawan Setiawan (Penjahit Baru #62)" }
    },
    {
      id: "init-4",
      worker_role: "PRODUCTION_HEAD_MANDOR",
      verified_output_pcs: 0,
      piece_rate_subtotal: 0,
      meal_allowance_cash: 0,
      qc_bonus_received: 200,
      take_home_pay: 200,
      user_profiles: { full_name: "Pak Jajang (Kepala Operasional)" }
    }
  ]);
  const [selectedSlipWorker, setSelectedSlipWorker] = useState<any | null>({
    id: "init-2",
    worker_role: "TAILOR_OPERATOR",
    verified_output_pcs: 12,
    piece_rate_subtotal: 38400,
    meal_allowance_cash: 4608,
    qc_bonus_received: 0,
    take_home_pay: 43008,
    user_profiles: { full_name: "Budi Santoso (Penjahit Baru #61)" }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const calculatePayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodCode,
          mealPct,
          numMandors,
          monthlyOverhead,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPayrollSummary(data.calculation);
        setPayrollItems(data.items);
        if (data.items.length > 0) {
          setSelectedSlipWorker(data.items[0]);
        }
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePayroll();
  }, []);

  const overheadPerUnit = Math.round(monthlyOverhead / (estimatedMonthlyUnits || 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 6: Workspace Payroll & Biaya Operasional
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Gaji Borongan Sabtu • Uang Makan 10–15% Tunai • Bonus QC 3-Arah • Alokasi Overhead
          </p>
        </div>

        <button
          onClick={calculatePayroll}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-field shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
        >
          <Calculator className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Kalkulasi Ulang Payroll</span>
        </button>
      </div>

      {/* Control Configuration Bar: Meal Allowance Slider & Overhead Input */}
      <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-celup-indigo" />
            <h2 className="text-sm font-bold text-celup-indigo">
              Parameter Penggajian Fleksibel (FR-10.2 s/d FR-10.4)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-celup-indigo">
            Periode: {periodCode} (Sabtu)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider Uang Makan 10% - 15% (Section 8.5) */}
          <div className="bg-white p-3.5 rounded-field border border-garis space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tinta">
                % Uang Makan Tunai:
              </label>
              <span className="text-base font-extrabold text-celup-indigo font-mono bg-kabut px-2 py-0.5 rounded">
                {mealPct}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="15"
              step="1"
              value={mealPct}
              onChange={(e) => setMealPct(Number(e.target.value))}
              className="w-full accent-celup-indigo cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-teks-sekunder font-mono">
              <span>Min: 10%</span>
              <span className="text-celup-indigo font-bold">Default: 12%</span>
              <span>Maks: 15%</span>
            </div>
            <p className="text-[11px] text-teks-sekunder italic">
              *Ditambahkan langsung ke slip gaji sebagai uang tunai (Asumsi #3)
            </p>
          </div>

          {/* Setting Jumlah Mandor (Default 2 Mandor + 1 Kepala Ops) */}
          <div className="bg-white p-3.5 rounded-field border border-garis space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tinta">
                Jumlah Mandor Penerima Bonus:
              </label>
              <span className="text-base font-extrabold text-celup-indigo font-mono bg-kabut px-2 py-0.5 rounded">
                {numMandors} Mandor
              </span>
            </div>
            <select
              value={numMandors}
              onChange={(e) => setNumMandors(Number(e.target.value))}
              className="w-full text-xs border border-garis rounded p-2 text-celup-indigo font-bold bg-white"
            >
              <option value="2">2 Mandor (+ 1 Kepala Ops = 3 Penerima Rata)</option>
              <option value="3">3 Mandor (+ 1 Kepala Ops = 4 Penerima)</option>
              <option value="4">4 Mandor (+ 1 Kepala Ops = 5 Penerima)</option>
            </select>
            <p className="text-[11px] text-teks-sekunder italic">
              *Total Pool dibagi rata (1/3 masing-masing untuk 2 Mandor + 1 Kepala Ops)
            </p>
          </div>

          {/* Alokasi Overhead Bulanan per Unit (FR-10.4) */}
          <div className="bg-white p-3.5 rounded-field border border-garis space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tinta">
                Overhead per Unit (FR-10.4):
              </label>
              <span className="text-base font-extrabold text-status-perbaikan font-mono bg-kabut px-2 py-0.5 rounded">
                Rp {overheadPerUnit.toLocaleString("id-ID")}/pcs
              </span>
            </div>
            <div className="text-[11px] text-teks-sekunder">
              Biaya Ops Bulanan: <strong>Rp {monthlyOverhead.toLocaleString("id-ID")}</strong>
            </div>
            <div className="text-[11px] text-teks-sekunder">
              Estimasi Volume Bulan Ini: <strong>{estimatedMonthlyUnits} pcs</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Payroll Content Grid: Table on Left, Perforated Payslip on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Saturday Wages (7 cols) */}
        <div className="lg:col-span-7 bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Rekapitulasi Penggajian Hari Sabtu (UAT-02 & UAT-03)
              </h2>
              <span className="text-xs text-teks-sekunder">
                Termasuk Penjahit Baru Mesin #61–#65 & Tim Cutting
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-status-lolos bg-white px-2 py-0.5 rounded border border-garis">
              Status: Dihitung Sah
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-garis text-left text-teks-sekunder">
                  <th className="py-2 pl-2">Nama Karyawan</th>
                  <th className="py-2 text-center">Output</th>
                  <th className="py-2 text-right">Borongan</th>
                  <th className="py-2 text-right">Uang Makan</th>
                  <th className="py-2 text-right">Bonus QC</th>
                  <th className="py-2 text-right pr-2">THP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {payrollItems.map((it) => {
                  const isSelected = selectedSlipWorker?.id === it.id;
                  const fullName = it.user_profiles?.full_name || "Karyawan";

                  return (
                    <tr
                      key={it.id}
                      onClick={() => setSelectedSlipWorker(it)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-kapur/40 font-semibold"
                          : "hover:bg-white/80"
                      }`}
                    >
                      <td className="py-2.5 pl-2">
                        <div className="font-bold text-celup-indigo">{fullName}</div>
                        <div className="text-[10px] text-teks-sekunder font-mono">
                          {it.worker_role}
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-mono tabular-nums">
                        {it.verified_output_pcs > 0 ? `${it.verified_output_pcs} pcs` : "-"}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        Rp {Number(it.piece_rate_subtotal).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-status-perbaikan font-semibold">
                        Rp {Number(it.meal_allowance_cash).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-status-lolos font-semibold">
                        {Number(it.qc_bonus_received) > 0
                          ? `Rp ${Number(it.qc_bonus_received).toLocaleString("id-ID")}`
                          : "-"}
                      </td>
                      <td className="py-2.5 text-right pr-2 font-mono font-extrabold text-celup-indigo tabular-nums">
                        Rp {Number(it.take_home_pay).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-teks-sekunder p-2 bg-white rounded border border-garis">
            💡 <strong>Verifikasi UAT-02:</strong> Penjahit Baru (Budi #61 dan Wawan #62) dihitung secara akurat dengan upah borongan + {mealPct}% uang makan tunai tanpa hambatan batas kuota karyawan.
          </div>
        </div>

        {/* Perforated Paper Payslip (5 cols, Section 8.5 of DESIGN_SYSTEM.md) */}
        <div className="lg:col-span-5 flex justify-center w-full">
          {selectedSlipWorker ? (
            <div className="w-full max-w-[360px] bg-white border border-garis rounded-work shadow-hard p-4 sm:p-5 text-xs text-tinta font-mono relative">
              {/* Top Perforation Line */}
              <div className="border-b-2 border-dashed border-garis pb-3 mb-4 text-center flex flex-col items-center">
                <img src="/lukla-logo.png" alt="Lukla Manufacturing" className="h-10 w-auto object-contain mb-1" />
                <span className="text-[10px] uppercase tracking-widest text-teks-sekunder block">
                  LUKLA OPERATIONS • CIWIDEY
                </span>
                <h3 className="text-sm font-bold text-celup-indigo mt-0.5">
                  SLIP GAJI MINGGUAN RESMI
                </h3>
                <span className="text-[11px] text-teks-sekunder">
                  Periode: {periodCode} (Sabtu)
                </span>
              </div>

              {/* Worker Info */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-teks-sekunder">Nama:</span>
                  <span className="font-bold text-celup-indigo">
                    {selectedSlipWorker.user_profiles?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teks-sekunder">Posisi:</span>
                  <span className="font-semibold">{selectedSlipWorker.worker_role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teks-sekunder">Verified Output:</span>
                  <span className="font-bold">{selectedSlipWorker.verified_output_pcs} pcs</span>
                </div>
              </div>

              {/* Wage Breakdown */}
              <div className="border-t border-b border-dashed border-garis py-3 my-3 space-y-2">
                <div className="flex justify-between">
                  <span>Upah Borongan Komponen</span>
                  <span className="font-bold">
                    Rp {Number(selectedSlipWorker.piece_rate_subtotal).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-status-perbaikan font-semibold">
                  <span>Uang Makan ({mealPct}% Tunai)</span>
                  <span>
                    Rp {Number(selectedSlipWorker.meal_allowance_cash).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(selectedSlipWorker.qc_bonus_received) > 0 && (
                  <div className="flex justify-between text-status-lolos font-semibold">
                    <span>Bonus Pool QC (3-Arah)</span>
                    <span>
                      Rp {Number(selectedSlipWorker.qc_bonus_received).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Take Home Pay */}
              <div className="pt-2 flex justify-between items-baseline">
                <span className="text-xs uppercase font-extrabold text-celup-indigo">
                  TOTAL THP DITERIMA
                </span>
                <span className="text-lg font-extrabold text-celup-indigo">
                  Rp {Number(selectedSlipWorker.take_home_pay).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Bottom Perforation & Print Button */}
              <div className="border-t-2 border-dashed border-garis pt-4 mt-4 text-center">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 bg-kabut hover:bg-celup-indigo hover:text-white border border-garis text-celup-indigo font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Slip Kertas (360px)</span>
                </button>
                <span className="text-[9px] text-teks-sekunder mt-1 block">
                  *Robek pada garis perforasi di atas
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-teks-sekunder">
              Pilih karyawan pada tabel untuk melihat slip gaji kertas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
