"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  Award, 
  AlertTriangle,
  Sparkles,
  Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFECT_CATEGORIES = [
  "Jahitan Melompat / Putus",
  "Noda Oli Mesin Permanen",
  "Ukuran / Dimensi Tidak Sesuai Pola",
  "Kerah / Resleting Miring",
  "Kain Robek / Cacat Tenun",
  "Obras Lepas / Jahitan Terbuka",
];

export default function QcTerminalPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [productSerial, setProductSerial] = useState<string>("");
  const [selectedDefect, setSelectedDefect] = useState<string>("");
  const [defectNotes, setDefectNotes] = useState<string>("");
  const [showDefectPicker, setShowDefectPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // QC Bonus Pool State (UAT-03)
  const [poolBonus, setPoolBonus] = useState<number>(600);
  const [numRecipients, setNumRecipients] = useState<number>(3); // 2 Mandors + 1 Head of Ops

  const loadQcData = async () => {
    try {
      const { data: ords } = await supabase
        .from("orders")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (ords && ords.length > 0) {
        setOrders(ords);
        if (!selectedOrderId) setSelectedOrderId(ords[0].id);
      }

      // Fetch QC Pool total
      const { data: poolData } = await supabase
        .from("qc_bonus_ledger")
        .select("amount");

      if (poolData) {
        const total = poolData.reduce((acc, row) => acc + Number(row.amount), 0);
        setPoolBonus(total);
      }

      // Generate random serial for current piece
      setProductSerial(`QC-SNO-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      console.error("Error loading QC data:", err);
    }
  };

  useEffect(() => {
    loadQcData();
  }, []);

  const handleDecision = async (decision: "PASS" | "REPAIR" | "REJECT") => {
    if (decision === "REJECT" && !showDefectPicker) {
      setShowDefectPicker(true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/qc/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId || orders[0]?.id,
          productSerialTag: productSerial,
          decision,
          defectCategory: decision !== "PASS" ? (selectedDefect || "Kerah / Resleting Miring") : null,
          defectNotes: defectNotes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (decision === "PASS") {
          setLastActionMessage(
            `Unit ${productSerial} LOLOS QC! Pool Bonus bertambah +Rp 300 (Total: Rp ${(data.totalQcBonusPool || poolBonus + 300).toLocaleString("id-ID")})`
          );
        } else if (decision === "REPAIR") {
          setLastActionMessage(
            `Unit ${productSerial} dialihkan ke status PERBAIKAN (dikembalikan ke lini jahit). Gaji penjahit TIDAK dipotong.`
          );
        } else {
          setLastActionMessage(
            `Unit ${productSerial} dinyatakan CACAT (${selectedDefect}). Barang dialihkan. Gaji penjahit TIDAK dipotong.`
          );
        }

        setShowDefectPicker(false);
        setSelectedDefect("");
        setDefectNotes("");
        loadQcData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UAT-03: Simulate 3,000 units PASS (Pool = Rp 900.000 -> Rp 300.000 each)
  const handleSimulateUat03 = async () => {
    setPoolBonus(900000);
    setLastActionMessage(
      "Simulasi UAT-03 Berhasil: 3.000 Unit Lolos QC tercapai! Total Pool = Rp 900.000 (Masing-masing 2 Mandor & 1 Kepala Ops menerima Rp 300.000)."
    );
  };

  const perSupervisorBonus = Math.round(poolBonus / numRecipients);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 5: Terminal Inspeksi QC Produk Utuh
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Inspeksi 1 Produk Utuh • Akumulasi Pool Bonus QC (FR-5.1 s/d FR-5.2)
          </p>
        </div>

        {/* Selected Order & Article Tag */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-teks-sekunder">Inspeksi Order:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="text-xs font-bold text-celup-indigo bg-white border border-garis px-3 py-1.5 rounded-field"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} — {o.article_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Business Rule Banner (Asumsi #1 & #2) */}
      <div className="p-3 bg-white border-l-4 border-celup-indigo rounded-field shadow-hard flex items-start gap-2.5 text-xs text-tinta">
        <Info className="w-4 h-4 text-celup-indigo flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-celup-indigo">Aturan Resmi Bisnis Lukla (Asumsi #1 & #2):</strong>{" "}
          Gaji borongan penjahit <strong>TIDAK terpengaruh</strong> oleh hasil QC (*no clawback*). Unit Lolos murni menambah saldo <strong>Pool Bonus QC</strong> untuk supervisor (2 Mandor + 1 Kepala Operasional).
        </div>
      </div>

      {lastActionMessage && (
        <div className="p-3 bg-kabut border-2 border-celup-indigo rounded-field text-xs font-semibold text-celup-indigo flex items-center justify-between">
          <span>{lastActionMessage}</span>
          <button onClick={() => setLastActionMessage(null)} className="text-xs hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* QC Live Pool Bonus Odometer & Distribution (Section 8.2 & UAT-03) */}
      <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo shadow-hard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-garis pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-status-perbaikan" />
            <h2 className="text-sm font-bold text-celup-indigo">
              Akumulasi Saldo Pool Bonus QC (UAT-03)
            </h2>
          </div>
          <button
            onClick={handleSimulateUat03}
            className="px-3 py-1 bg-kabut border border-garis hover:border-celup-indigo rounded text-xs font-bold text-celup-indigo self-start"
          >
            Simulasikan 3.000 Unit Lolos (UAT-03)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Total Pool */}
          <div className="bg-white p-4 rounded-field border border-garis text-center">
            <span className="text-xs text-teks-sekunder block">Total Saldo Pool QC:</span>
            <div className="text-3xl font-extrabold text-celup-indigo font-mono tabular-nums my-1">
              Rp {poolBonus.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-teks-sekunder">
              +Rp 300 per unit Lolos (PASS)
            </span>
          </div>

          {/* Number of Recipients */}
          <div className="bg-white p-4 rounded-field border border-garis text-center">
            <span className="text-xs text-teks-sekunder block">Penerima Bonus (3-Arah):</span>
            <div className="text-xl font-bold text-tinta my-1">
              {numRecipients} Orang Pengawas
            </div>
            <span className="text-[11px] text-teks-sekunder block">
              2 Mandor + 1 Kepala Operasional
            </span>
          </div>

          {/* Equal Split Result */}
          <div className="bg-white p-4 rounded-field border-2 border-status-lolos text-center">
            <span className="text-xs text-status-lolos font-bold block">
              Bagian Rata per Orang (1/3):
            </span>
            <div className="text-3xl font-extrabold text-status-lolos font-mono tabular-nums my-1">
              Rp {perSupervisorBonus.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-teks-sekunder">
              Masuk ke slip penggajian Sabtu
            </span>
          </div>
        </div>
      </div>

      {/* 3 Giant Inspection Buttons (Section 8.2 of DESIGN_SYSTEM.md) */}
      <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2">
          <span className="text-xs font-bold text-celup-indigo font-mono">
            Tag Produk Utuh: <strong className="text-tinta">{productSerial}</strong>
          </span>
          <span className="text-xs text-teks-sekunder">
            Inspeksi 1 Produk Utuh (Barang Jadi)
          </span>
        </div>

        {/* 3 Giant Buttons: Fixed Order, Minimal 40% height feel, high contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: LOLOS (PASS) */}
          <button
            onClick={() => handleDecision("PASS")}
            disabled={loading}
            className="min-h-[140px] rounded-terminal bg-status-lolos text-white p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-lolos/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            <span className="text-2xl font-extrabold tracking-wider">LOLOS</span>
            <span className="text-xs opacity-90 font-medium">
              +Rp 300 ke Pool Bonus • Masuk Barang Jadi
            </span>
          </button>

          {/* Button 2: PERBAIKAN (REPAIR) */}
          <button
            onClick={() => handleDecision("REPAIR")}
            disabled={loading}
            className="min-h-[140px] rounded-terminal bg-status-perbaikan text-white p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-perbaikan/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <RotateCcw className="w-12 h-12 stroke-[2.5]" />
            <span className="text-2xl font-extrabold tracking-wider">PERBAIKAN</span>
            <span className="text-xs opacity-90 font-medium">
              Kembali ke Lini Jahit • Tanpa Potong Upah
            </span>
          </button>

          {/* Button 3: CACAT (REJECT) */}
          <button
            onClick={() => handleDecision("REJECT")}
            disabled={loading}
            className="min-h-[140px] rounded-terminal bg-status-cacat text-white p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-cacat/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <XCircle className="w-12 h-12 stroke-[2.5]" />
            <span className="text-2xl font-extrabold tracking-wider">CACAT</span>
            <span className="text-xs opacity-90 font-medium">
              Catat Jenis Cacat • Alihkan Rute
            </span>
          </button>
        </div>

        {/* Defect Category Chip Selector (Shown if Cacat is clicked) */}
        {showDefectPicker && (
          <div className="p-4 bg-white border-2 border-status-cacat rounded-work space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-status-cacat">
                Pilih Kategori Cacat (Wajib untuk Analisis Pabrik):
              </span>
              <button
                onClick={() => setShowDefectPicker(false)}
                className="text-xs text-teks-sekunder hover:underline"
              >
                Batal
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DEFECT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDefect(cat)}
                  className={`px-3 py-2 rounded-field text-xs font-semibold border transition-all ${
                    selectedDefect === cat
                      ? "bg-status-cacat text-white border-status-cacat"
                      : "bg-kabut text-tinta border-garis hover:border-status-cacat"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Catatan tambahan (opsional)..."
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                className="flex-1 text-xs border border-garis rounded p-2 text-tinta"
              />
              <button
                onClick={() => handleDecision("REJECT")}
                disabled={!selectedDefect}
                className="px-4 py-2 bg-status-cacat text-white text-xs font-bold rounded shadow-hard disabled:opacity-50"
              >
                Simpan & Tandai Cacat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
