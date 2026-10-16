"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  Sparkles,
  Info,
  Clock,
  Layers,
  ShieldAlert,
  PackageCheck,
  Wrench,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  getQcQueue, 
  updateQcQueueItem, 
  completeRepairAndReturnToQc,
  getFinishedGoods,
  getLiveQcPoolBonus, 
  incrementLiveQcPoolBonus, 
  getApprovedMassOrders, 
  QcQueueItem 
} from "@/lib/dataBus";

const REPAIR_CATEGORIES = [
  "Jahitan Melompat / Benang Putus (Nylon Thread)",
  "Resleting YKK Macet / Perlu Setel Slider",
  "Buckle Acetal Longgar / Pemasangan Terbalik",
  "Jahitan Tali Bahu Kurang Presisi / Perlu Bar-Tack Ulang",
  "Noda Kapur / Benang Sisa Belum Dibersihkan",
  "Webbing Molle Miring / Jarak Perlu Dirapikan",
  "Lapisan Busa Punggung Bergeser",
];

export default function QcTerminalPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [productSerial, setProductSerial] = useState<string>("BAG-SNO-1001");
  const [selectedDefect, setSelectedDefect] = useState<string>("");
  const [defectNotes, setDefectNotes] = useState<string>("");
  const [showRepairPicker, setShowRepairPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // FIFO Queue Produk Menunggu QC
  const [qcQueue, setQcQueue] = useState<QcQueueItem[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState<number>(0);
  const [readyForWarehouseCount, setReadyForWarehouseCount] = useState<number>(0);

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

      // 3. Sync Finished Goods waiting for warehouse intake
      const fgList = getFinishedGoods();
      setReadyForWarehouseCount(fgList.filter((f) => f.status === "READY_FOR_WAREHOUSE").length);

      // 4. Sync live Pool Bonus
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
      const fgList = getFinishedGoods();
      setReadyForWarehouseCount(fgList.filter((f) => f.status === "READY_FOR_WAREHOUSE").length);
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

  const handleDecision = async (decision: "PASS" | "REPAIR") => {
    if (decision === "REPAIR" && !showRepairPicker) {
      setShowRepairPicker(true);
      return;
    }

    try {
      setLoading(true);
      const currentItem = qcQueue[activeQueueIndex];
      const isReins = currentItem?.isReinspection || false;
      const chosenCategory = selectedDefect || "Jahitan Tali Bahu Kurang Presisi / Perlu Bar-Tack Ulang";

      const res = await fetch("/api/qc/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId || orders[0]?.id,
          productSerialTag: productSerial,
          decision,
          defectCategory: decision === "REPAIR" ? chosenCategory : null,
          defectNotes: defectNotes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (decision === "PASS") {
          if (isReins) {
            updateQcQueueItem(productSerial, "PASS");
            setLastActionMessage(
              `Unit Re-inspeksi ${productSerial} LOLOS QC! Barang otomatis diteruskan ke antrean Barang Jadi Gudang (Bonus QC TIDAK digandakan sesuai aturan no-duplicate).`
            );
          } else {
            const nextPool = incrementLiveQcPoolBonus(300);
            setPoolBonus(nextPool);
            updateQcQueueItem(productSerial, "PASS");
            setLastActionMessage(
              `Unit ${productSerial} LOLOS QC! Pool Bonus bertambah +Rp 300 (Total: Rp ${nextPool.toLocaleString("id-ID")}) & unit masuk antrean Siap Masuk Gudang Barang Jadi.`
            );
          }
        } else {
          updateQcQueueItem(productSerial, "REPAIR", {
            defectCategory: chosenCategory,
            repairNote: defectNotes || `Perlu perbaikan: ${chosenCategory}`,
          });
          setLastActionMessage(
            `Unit ${productSerial} dialihkan ke status PERBAIKAN (${chosenCategory}) & dikembalikan ke lini jahit. Gaji penjahit TIDAK dipotong.`
          );
        }

        // Update local queue view
        const updatedQueue = getQcQueue();
        setQcQueue(updatedQueue);
        setReadyForWarehouseCount(
          getFinishedGoods().filter((f) => f.status === "READY_FOR_WAREHOUSE").length
        );

        setShowRepairPicker(false);
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

  const handleCompleteRepair = (serial: string) => {
    completeRepairAndReturnToQc(
      serial,
      "Perbaikan selesai dikerjakan oleh lini produksi, siap diinspeksi ulang (Re-inspeksi)"
    );
    const updatedQueue = getQcQueue();
    setQcQueue(updatedQueue);
    const idx = updatedQueue.findIndex((i) => i.serial === serial);
    if (idx !== -1) {
      setActiveQueueIndex(idx);
      setProductSerial(serial);
    }
    setLastActionMessage(
      `Perbaikan unit ${serial} SELESAI! Unit kini kembali berada di Antrean Inspeksi QC dengan status Re-inspeksi.`
    );
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
  const repairItems = qcQueue.filter((q) => q.status === "REPAIR");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 5: Terminal Inspeksi QC Produk Utuh
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Inspeksi 1 Produk Tas Utuh (Keputusan: LOLOS atau PERBAIKAN) • Akumulasi Pool Bonus QC
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

      {/* Finished Goods Waiting for Warehouse Intake Banner (Adopted from TestLukia-main) */}
      {readyForWarehouseCount > 0 && (
        <div className="p-3.5 bg-status-info/10 border border-status-info rounded-work flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-celup-indigo">
            <PackageCheck className="w-4 h-4 text-status-info flex-shrink-0" />
            <span>
              Terdapat <strong>{readyForWarehouseCount} unit produk utuh LOLOS QC</strong> yang siap diterima masuk ke Gudang Barang Jadi (<em>Finished Goods Intake</em>).
            </span>
          </div>
          <Link
            href="/warehouse"
            className="px-3 py-1.5 bg-celup-indigo text-white font-bold rounded text-xs inline-flex items-center gap-1 self-start sm:self-auto hover:bg-celup-indigo/90"
          >
            <span>Buka Gudang Barang Jadi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Critical Business Rule Banner (Asumsi #1, #2 & #4) */}
      <div className="p-3 bg-white border-l-4 border-celup-indigo rounded-field shadow-hard flex items-start gap-2.5 text-xs text-tinta">
        <Info className="w-4 h-4 text-celup-indigo flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-celup-indigo">Aturan Resmi Bisnis Lukla:</strong>{" "}
          Inspeksi QC dilakukan <strong>HANYA saat barang sudah jadi 1 tas / ransel utuh</strong> (hasil stasiun assembly), dengan 2 keputusan: <strong>LOLOS (Pass)</strong> atau <strong>PERBAIKAN (Repair)</strong>. Gaji borongan penjahit <strong>TIDAK terpengaruh</strong> oleh hasil QC (<em>no clawback</em>). Setiap unit Lolos otomatis menambah <strong>Pool Bonus QC</strong> dan siap diterima ke Gudang Barang Jadi.
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

      {/* FIFO Inspection Queue List */}
      <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo/40 shadow-hard space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-celup-indigo" />
            <h2 className="text-sm font-bold text-celup-indigo">
              Daftar Antrean Tas Utuh Menunggu Inspeksi (FIFO Inspection Queue)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-kapur text-celup-indigo border border-celup-indigo/30">
              {qcQueue.filter((q) => q.status === "WAITING" || q.status === "REINSPECTION_PENDING").length} Menunggu Inspeksi
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {qcQueue.map((item, idx) => {
            const isActive = activeQueueIndex === idx;
            const isDone = item.status === "PASS" || item.status === "REPAIR";

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
                    ? "bg-kabut/40 border-garis opacity-75"
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
                            🔄 Unit Selesai Perbaikan (Re-inspeksi)
                          </span>
                        )}
                      </div>
                      {item.repairNote && (
                        <div className="text-[11px] text-status-perbaikan font-medium mt-0.5">
                          Catatan: {item.repairNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.status === "WAITING" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-semibold bg-kabut text-celup-indigo border border-garis">
                        ⏱️ Menunggu Inspeksi
                      </span>
                    ) : item.status === "REINSPECTION_PENDING" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-perbaikan/10 text-status-perbaikan border border-status-perbaikan">
                        🔄 Re-inspeksi (Tanpa Bonus Ganda)
                      </span>
                    ) : item.status === "PASS" ? (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-lolos text-white">
                        ✅ LOLOS (PASS)
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded font-bold bg-status-perbaikan text-white">
                        🛠️ PERBAIKAN (REPAIR)
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

      {/* 2 Giant Inspection Buttons: LOLOS (PASS) & PERBAIKAN (REPAIR) */}
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
            Keputusan Terminal QC (Pass / Repair)
          </span>
        </div>

        {/* 2 Giant Buttons: LOLOS & PERBAIKAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Button 1: LOLOS (PASS) */}
          <button
            onClick={() => handleDecision("PASS")}
            disabled={loading}
            className="min-h-[120px] sm:min-h-[140px] rounded-terminal bg-status-lolos text-white p-4 sm:p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-lolos/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">LOLOS (PASS)</span>
            <span className="text-xs opacity-90 font-medium text-center">
              +Rp 300 ke Pool Bonus • Siap Masuk Gudang Barang Jadi
            </span>
          </button>

          {/* Button 2: PERBAIKAN (REPAIR) */}
          <button
            onClick={() => handleDecision("REPAIR")}
            disabled={loading}
            className="min-h-[120px] sm:min-h-[140px] rounded-terminal bg-status-perbaikan text-white p-4 sm:p-6 shadow-hard flex flex-col items-center justify-center gap-2 hover:bg-status-perbaikan/95 transition-all active:translate-y-1 active:shadow-none"
          >
            <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">PERBAIKAN (REPAIR)</span>
            <span className="text-xs opacity-90 font-medium text-center">
              Kembali ke Lini Jahit untuk Diperbaiki • Tanpa Potong Upah
            </span>
          </button>
        </div>

        {/* Repair Category Selector (Shown when PERBAIKAN is clicked) */}
        {showRepairPicker && (
          <div className="p-4 bg-white border-2 border-status-perbaikan rounded-work space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-status-perbaikan">
                Pilih Titik Temuan yang Perlu Diperbaiki (Wajib untuk Instruksi Lini):
              </span>
              <button
                onClick={() => setShowRepairPicker(false)}
                className="text-xs text-teks-sekunder hover:underline"
              >
                Batal
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {REPAIR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDefect(cat)}
                  className={`px-3 py-2 rounded-field text-xs font-semibold border transition-all ${
                    selectedDefect === cat
                      ? "bg-status-perbaikan text-white border-status-perbaikan"
                      : "bg-kabut text-tinta border-garis hover:border-status-perbaikan"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                placeholder="Instruksi perbaikan spesifik untuk lini jahit (opsional)..."
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                className="flex-1 text-xs border border-garis rounded p-2 text-tinta"
              />
              <button
                onClick={() => handleDecision("REPAIR")}
                disabled={!selectedDefect}
                className="px-4 py-2 bg-status-perbaikan text-white text-xs font-bold rounded shadow-hard disabled:opacity-50"
              >
                Kirim ke Antrean Perbaikan Lini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Repair Tasks Loop (Close the loop from REPAIR -> REINSPECTION_PENDING) */}
      {repairItems.length > 0 && (
        <div className="bg-white p-5 rounded-work border-2 border-status-perbaikan/50 shadow-hard space-y-3">
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-status-perbaikan" />
              <h2 className="text-sm font-bold text-celup-indigo">
                Daftar Tugas Perbaikan Lini Aktif (Loop Kembali ke QC)
              </h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-status-perbaikan/15 text-status-perbaikan">
              {repairItems.length} Unit Sedang Diperbaiki
            </span>
          </div>
          <div className="space-y-2">
            {repairItems.map((rep) => (
              <div
                key={rep.serial}
                className="p-3 rounded border border-garis bg-kabut/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-celup-indigo bg-white px-2 py-0.5 rounded border border-garis">
                      {rep.serial}
                    </span>
                    <span className="font-bold text-tinta">{rep.articleName}</span>
                  </div>
                  <p className="text-[11px] text-status-perbaikan font-semibold mt-1">
                    Temuan: {rep.defectCategory || rep.repairNote || "Perbaikan jahitan komponen"}
                  </p>
                </div>
                <button
                  onClick={() => handleCompleteRepair(rep.serial)}
                  className="px-3 py-1.5 bg-celup-indigo text-white font-bold rounded text-xs hover:bg-celup-indigo/90 shadow-sm whitespace-nowrap"
                >
                  ✅ Selesai Diperbaiki → Kembalikan ke Antrean QC
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pool Bonus QC & 3-Way Split Panel (FR-10.3 & UAT-03) */}
      <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-garis pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-status-lolos" />
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Akumulasi Pool Bonus QC & Pembagian 3-Arah (FR-10.3)
              </h2>
              <p className="text-xs text-teks-sekunder">
                Default dibagi rata (33,33%) kepada 2 Mandor + 1 Kepala Operasional
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateUat03}
            className="px-3 py-1.5 rounded-field bg-kapur text-celup-indigo font-bold text-xs border border-celup-indigo/30 hover:bg-kapur/80 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi UAT-03 (3.000 Unit Lolos)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Total Pool Card */}
          <div className="bg-white p-4 rounded-field border border-garis">
            <span className="text-xs text-teks-sekunder block">Total Saldo Pool Bonus QC</span>
            <span className="text-2xl font-extrabold text-status-lolos font-mono tabular-nums mt-1 block">
              Rp {poolBonus.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-teks-sekunder mt-1 block">
              Tarif: Rp 300 / unit utuh Lolos
            </span>
          </div>

          {/* Recipient 1: Kepala Operasional */}
          <div className="bg-white p-4 rounded-field border border-garis">
            <span className="text-xs font-semibold text-celup-indigo block">
              1. Pak Jajang (Kepala Ops)
            </span>
            <span className="text-xl font-bold text-tinta font-mono tabular-nums mt-1 block">
              Rp {perSupervisorBonus.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-status-lolos font-semibold mt-1 block">
              Porsi 1/{numRecipients} ({(100 / numRecipients).toFixed(1)}%)
            </span>
          </div>

          {/* Recipient 2: Mandor Lini A */}
          <div className="bg-white p-4 rounded-field border border-garis">
            <span className="text-xs font-semibold text-celup-indigo block">
              2. Kang Ujang (Mandor Lini A)
            </span>
            <span className="text-xl font-bold text-tinta font-mono tabular-nums mt-1 block">
              Rp {perSupervisorBonus.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-status-lolos font-semibold mt-1 block">
              Porsi 1/{numRecipients} ({(100 / numRecipients).toFixed(1)}%)
            </span>
          </div>

          {/* Recipient 3: Mandor Lini B */}
          <div className="bg-white p-4 rounded-field border border-garis">
            <span className="text-xs font-semibold text-celup-indigo block">
              3. Teh Yeti (Mandor Lini B)
            </span>
            <span className="text-xl font-bold text-tinta font-mono tabular-nums mt-1 block">
              Rp {perSupervisorBonus.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-status-lolos font-semibold mt-1 block">
              Porsi 1/{numRecipients} ({(100 / numRecipients).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

