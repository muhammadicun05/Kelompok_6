"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  Award, 
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  Layers,
  ShieldAlert,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  getQcQueue, 
  updateQcQueueItem, 
  getLiveQcPoolBonus, 
  incrementLiveQcPoolBonus, 
  getApprovedMassOrders, 
  QcQueueItem 
} from "@/lib/dataBus";

const DEFECT_CATEGORIES = [
  "Jahitan Melompat / Benang Putus (Nylon Thread)",
  "Resleting YKK Macet / Gigi Rusak",
  "Buckle Acetal Longgar / Patah",
  "Jahitan Tali Bahu Tidak Simetris / Lemah",
  "Noda Oli Mesin pada Kain Cordura",
  "Webbing Molle Miring / Jarak Tidak Standar",
  "Lapisan Busa Punggung Bergeser",
];

export default function QcTerminalPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [productSerial, setProductSerial] = useState<string>("BAG-SNO-1001");
  const [selectedDefect, setSelectedDefect] = useState<string>("");
  const [defectNotes, setDefectNotes] = useState<string>("");
  const [showDefectPicker, setShowDefectPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // FIFO Queue Produk Menunggu QC (QA Pak Harry Point 4)
  const [qcQueue, setQcQueue] = useState<QcQueueItem[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState<number>(0);

  // QC Bonus Pool State (UAT-03)
  const [poolBonus, setPoolBonus] = useState<number>(600);
  const [numRecipients, setNumRecipients] = useState<number>(3); // 2 Mandors + 1 Head of Ops

  const loadQcData = async () => {
    try {
      // 1. Fetch orders from Supabase + combine with approved mass orders from dataBus
      const { data: ords } = await supabase
        .from("orders")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      const busOrders = getApprovedMassOrders().map((bo) => ({
        id: bo.id || bo.orderNumber,
        order_number: bo.orderNumber,
        article_name: bo.article,
        clients: { client_code: bo.clientCode, name: bo.clientName },
      }));

      const combinedOrders = [...busOrders, ...(ords || [])];
      if (combinedOrders.length > 0) {
        setOrders(combinedOrders);
        if (!selectedOrderId) setSelectedOrderId(combinedOrders[0].id);
      }

      // 2. Sync FIFO Queue from dataBus
      const busQueue = getQcQueue();
      setQcQueue(busQueue);
      if (busQueue.length > 0) {
        setProductSerial(busQueue[activeQueueIndex]?.serial || busQueue[0].serial);
      }

      // 3. Sync live Pool Bonus
      const livePool = getLiveQcPoolBonus(600);
      setPoolBonus(livePool);
    } catch (err) {
      console.error("Error loading QC data:", err);
    }
  };

  useEffect(() => {
    loadQcData();

    const handleBusUpdate = () => {
      const q = getQcQueue();
      setQcQueue(q);
      setPoolBonus(getLiveQcPoolBonus());
      if (q.length > 0 && activeQueueIndex < q.length) {
        setProductSerial(q[activeQueueIndex].serial);
      }
    };

    window.addEventListener("lukla_bus_update", handleBusUpdate);
    window.addEventListener("storage", handleBusUpdate);

    return () => {
      window.removeEventListener("lukla_bus_update", handleBusUpdate);
      window.removeEventListener("storage", handleBusUpdate);
    };
  }, [activeQueueIndex]);

  const handleDecision = async (decision: "PASS" | "REPAIR" | "REJECT") => {
    if (decision === "REJECT" && !showDefectPicker) {
      setShowDefectPicker(true);
      return;
    }

    try {
      setLoading(true);
      const currentItem = qcQueue[activeQueueIndex];
      const isReins = currentItem?.isReinspection || false;

      const res = await fetch("/api/qc/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId || orders[0]?.id,
          productSerialTag: productSerial,
          decision,
          defectCategory: decision !== "PASS" ? (selectedDefect || "Resleting YKK Macet / Gigi Rusak") : null,
          defectNotes: defectNotes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (decision === "PASS") {
          if (isReins) {
            setLastActionMessage(
              `Unit Re-inspeksi ${productSerial} LOLOS QC! Barang diteruskan ke Gudang Jadi (Bonus QC TIDAK digandakan sesuai aturan no-duplicate).`
            );
            updateQcQueueItem(productSerial, "PASS");
          } else {
            const nextPool = incrementLiveQcPoolBonus(300);
            setPoolBonus(nextPool);
            updateQcQueueItem(productSerial, "PASS");
            setLastActionMessage(
              `Unit ${productSerial} LOLOS QC! Pool Bonus bertambah +Rp 300 (Total: Rp ${nextPool.toLocaleString("id-ID")})`
            );
          }
        } else if (decision === "REPAIR") {
          updateQcQueueItem(productSerial, "REPAIR");
          setLastActionMessage(
            `Unit ${productSerial} dialihkan ke status PERBAIKAN (dikembalikan ke lini jahit). Gaji penjahit TIDAK dipotong.`
          );
        } else {
          updateQcQueueItem(productSerial, "REJECT");
          setLastActionMessage(
            `Unit ${productSerial} dinyatakan CACAT (${selectedDefect || "Resleting YKK Rusak"}). Barang dialihkan. Gaji penjahit TIDAK dipotong.`
          );
        }

        // Update local queue view
        const updatedQueue = getQcQueue();
        setQcQueue(updatedQueue);

        setShowDefectPicker(false);
        setSelectedDefect("");
        setDefectNotes("");

        // Advance to next waiting item in FIFO queue
        const nextIdx = updatedQueue.findIndex(
          (item, idx) => idx > activeQueueIndex && (item.status === "WAITING" || item.status === "REINSPECTION_PENDING")
        );
        if (nextIdx !== -1) {
          setActiveQueueIndex(nextIdx);
          setProductSerial(updatedQueue[nextIdx].serial);
        }
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UAT-03: Simulate 3,000 units PASS (Pool = Rp 900.000 -> Rp 300.000 each)
  const handleSimulateUat03 = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lukla_qc_pool", "900000");
      window.dispatchEvent(new CustomEvent("lukla_bus_update", { detail: { eventKey: "QC_POOL_INCREMENTED" } }));
    }
    setPoolBonus(900000);
    setLastActionMessage(
      "Simulasi UAT-03 Berhasil: 3.000 Unit Lolos QC tercapai! Total Pool = Rp 900.000 (Masing-masing 2 Mandor & 1 Kepala Ops menerima Rp 300.000)."
    );
  };

  const perSupervisorBonus = Math.round(poolBonus / numRecipients);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 5: Terminal Inspeksi QC Produk Utuh
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Inspeksi HANYA pada 1 Produk Jadi Utuh • Akumulasi Pool Bonus QC (FR-5.1 s/d FR-5.2)
          </p>
        </div>

        {/* Selected Order & Article Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-teks-sekunder">Inspeksi Order:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold text-celup-indigo bg-white border border-garis px-3 py-1.5 rounded-field"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} — {o.article_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Business Rule Banner (Asumsi #1, #2 & #4) */}
      <div className="p-3 bg-white border-l-4 border-celup-indigo rounded-field shadow-hard flex items-start gap-2.5 text-xs text-tinta">
        <Info className="w-4 h-4 text-celup-indigo flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-celup-indigo">Aturan Resmi Bisnis Lukla (Asumsi #1, #2 & #4):</strong>{" "}
          Inspeksi QC dilakukan <strong>HANYA saat barang sudah jadi 1 tas / ransel utuh</strong> (hasil stasiun assembly perakitan akhir), bukan komponen lepas. Gaji borongan penjahit <strong>TIDAK terpengaruh</strong> oleh hasil QC (*no clawback*). Unit Lolos murni menambah saldo <strong>Pool Bonus QC</strong> untuk supervisor (2 Mandor + 1 Kepala Operasional).
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

      {/* FIFO Inspection Queue List (QA Pak Harry Point 4) */}
      <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo/40 shadow-hard space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-celup-indigo" />
            <h2 className="text-sm font-bold text-celup-indigo">
              Daftar Antrean Tas Utuh Menunggu Inspeksi (FIFO Inspection Queue)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teks-sekunder bg-white px-2 py-0.5 rounded border border-garis">
              QA Fix: Pak Harry #4
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-kapur text-celup-indigo border border-celup-indigo/30">
              {qcQueue.filter((q) => q.status === "WAITING" || q.status === "REINSPECTION_PENDING").length} Dalam Antrean
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {qcQueue.map((item, idx) => {
            const isActive = activeQueueIndex === idx;
            const isDone = item.status === "PASS" || item.status === "REPAIR" || item.status === "REJECT";

            return (
              <div
                key={item.serial}
                onClick={() => {
                  setActiveQueueIndex(idx);
                  setProductSerial(item.serial);
                }}
                className={`p-3 rounded-field border text-xs cursor-pointer transition-all ${
                  isActive
                    ? "bg-white border-2 border-celup-indigo shadow-md scale-[1.01]"
                    : isDone
                    ? "bg-kabut/40 border-garis opacity-70"
                    : "bg-white/80 border-garis hover:border-celup-indigo"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-kabut px-2 py-0.5 rounded text-celup-indigo border border-garis">
                      {item.serial}
                    </span>
                    <div>
                      <span className="font-bold text-tinta">{item.articleName}</span>
                      <div className="text-[11px] text-teks-sekunder mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{item.assembledBy}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-celup-indigo" />
                          Masuk: {item.arrivedAt}
                        </span>
                        {item.isReinspection && (
                          <span className="text-[10px] bg-status-perbaikan/20 text-status-perbaikan font-bold px-1.5 py-0.2 rounded border border-status-perbaikan/40">
                            🔄 Unit Perbaikan Ulang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.status === "WAITING" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-semibold bg-kabut text-celup-indigo border border-garis">
                        ⏱️ Menunggu Inspeksi
                      </span>
                    ) : item.status === "REINSPECTION_PENDING" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-perbaikan/10 text-status-perbaikan border border-status-perbaikan">
                        🔄 Re-inspeksi (No Double Bonus)
                      </span>
                    ) : item.status === "PASS" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-lolos text-white">
                        ✅ LOLOS (PASS)
                      </span>
                    ) : item.status === "REPAIR" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-perbaikan text-white">
                        🛠️ PERBAIKAN
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-cacat text-white">
                        ❌ CACAT (REJECT)
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQueueIndex(idx);
                        setProductSerial(item.serial);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        isActive
                          ? "bg-celup-indigo text-white shadow-sm"
                          : "bg-white border border-garis text-celup-indigo hover:bg-kabut"
                      }`}
                    >
                      {isActive ? "● Sedang Diperiksa" : "Pilih"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Giant Inspection Buttons (Section 8.2 of DESIGN_SYSTEM.md) */}
      <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
        {qcQueue[activeQueueIndex]?.isReinspection && (
          <div className="p-3 bg-status-perbaikan/10 border-2 border-status-perbaikan rounded-field text-xs text-status-perbaikan font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>
              PERINGATAN RE-INSPEKSI: Unit ini merupakan produk hasil perbaikan (re-work). Jika LOLOS, unit diteruskan ke gudang barang jadi TANPA penambahan bonus ganda (+Rp 0).
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-garis pb-2">
          <span className="text-xs font-bold text-celup-indigo font-mono">
            Tag Produk Utuh: <strong className="text-tinta">{productSerial}</strong>
          </span>
          <span className="text-xs text-teks-sekunder">
            Inspeksi 1 Produk Ransel Utuh (Barang Jadi)
          </span>
        </div>

        {/* 3 Giant Buttons: Fixed Order, Minimal 40% height feel, high contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Button 1: LOLOS (PASS) */}
          <button
            onClick={() => handleDecision("PASS")}
            disabled={loading}
            className="min-h-[120px] sm:min-h-[140px] rounded-terminal bg-status-lolos text-white p-4 sm:p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-lolos/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">LOLOS</span>
            <span className="text-xs opacity-90 font-medium text-center">
              +Rp 300 ke Pool Bonus • Masuk Barang Jadi
            </span>
          </button>

          {/* Button 2: PERBAIKAN (REPAIR) */}
          <button
            onClick={() => handleDecision("REPAIR")}
            disabled={loading}
            className="min-h-[120px] sm:min-h-[140px] rounded-terminal bg-status-perbaikan text-white p-4 sm:p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-perbaikan/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">PERBAIKAN</span>
            <span className="text-xs opacity-90 font-medium text-center">
              Kembali ke Lini Jahit • Tanpa Potong Upah
            </span>
          </button>

          {/* Button 3: CACAT (REJECT) */}
          <button
            onClick={() => handleDecision("REJECT")}
            disabled={loading}
            className="min-h-[120px] sm:min-h-[140px] rounded-terminal bg-status-cacat text-white p-4 sm:p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-cacat/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">CACAT</span>
            <span className="text-xs opacity-90 font-medium text-center">
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
