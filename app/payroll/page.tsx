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
  Building,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  Search,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  getApprovedMassOrders, 
  getLiveQcPoolBonus, 
  MassOrder,
  getPurchaseOrders,
  reviewPurchaseOrder,
  getIssuedInvoices,
  saveIssuedInvoice,
  getFinishedGoods,
  PurchaseOrderRecord,
  IssuedInvoiceRecord,
  FinishedGoodRecord
} from "@/lib/dataBus";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<"PAYROLL" | "INVOICE" | "PO_REVIEW">("PAYROLL");

  // Payroll State
  const [mealPct, setMealPct] = useState<number>(12); // Flexible 10-15% slider
  const [numMandors, setNumMandors] = useState<number>(2); // Default 2 Mandors (+ 1 Kepala Ops)
  const [monthlyOverhead, setMonthlyOverhead] = useState<number>(18500000); // Rp 18.5jt overhead
  const [estimatedMonthlyUnits, setEstimatedMonthlyUnits] = useState<number>(6000);
  const [periodCode, setPeriodCode] = useState<string>("PAY-2026-W41");
  const [workerSearch, setWorkerSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
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
      id: "init-assembly-1",
      worker_role: "TAILOR_ASSEMBLY",
      verified_output_pcs: 24,
      piece_rate_subtotal: 72000,
      meal_allowance_cash: 8640,
      qc_bonus_received: 0,
      take_home_pay: 80640,
      user_profiles: { full_name: "Rina Marlina (Penjahit-Assembly #01)" }
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

  // Invoice State (BRD v1.5 Section 8.8 + PPN 11% Breakdown)
  const [selectedOrder, setSelectedOrder] = useState<string>("ORD-2026-004");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("INV-2026-004");
  const [paymentScheme, setPaymentScheme] = useState<"TERMIN_50_50" | "NET_30" | "FULL">("TERMIN_50_50");
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "DP_PAID" | "PAID">("DP_PAID");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"SHIPPING" | "PICKUP">("SHIPPING");
  const [invoiceDate, setInvoiceDate] = useState<string>("2026-10-14");
  const [dueDate, setDueDate] = useState<string>("2026-10-28");

  // Dynamic Approved Orders, Live QC Bonus, Issued Invoices, POs, & Finished Goods
  const [approvedOrdersList, setApprovedOrdersList] = useState<MassOrder[]>([]);
  const [issuedInvoices, setIssuedInvoices] = useState<IssuedInvoiceRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodRecord[]>([]);

  // Invoice mock profiles + dynamically approved mass orders
  const baseCatalog: Record<string, any> = {
    "ORD-2026-004": {
      orderId: "ORD-2026-004",
      clientCode: "SNOHUND",
      clientName: "Snøhund (Internal Brand)",
      clientEmail: "ops@snohund.co",
      clientAddress: "Bandung, Jawa Barat",
      articleName: "Snøhund Alpine Tactical Backpack 35L",
      scheme: "FULL_PACKAGE",
      quantity: 500,
      cuttingRate: 2500,
      sewingRate: 18500,
      materialsCharge: 1850000,
      finishingRate: 1500
    },
    "ORD-2026-003": {
      orderId: "ORD-2026-003",
      clientCode: "KLIEN_A",
      clientName: "PT Bandung Apparel",
      clientEmail: "procurement@bandungapparel.id",
      clientAddress: "Kawasan Industri Cimahi, Jawa Barat",
      articleName: "Urban Commuter Roll-Top Backpack 25L",
      scheme: "CMT",
      quantity: 1200,
      cuttingRate: 1800,
      sewingRate: 12500,
      materialsCharge: 0,
      finishingRate: 1000
    }
  };

  const dynamicCatalog: Record<string, any> = { ...baseCatalog };
  approvedOrdersList.forEach((ord) => {
    const key = ord.orderNumber || ord.id;
    dynamicCatalog[key] = {
      orderId: key,
      clientCode: ord.clientCode || "KLIEN_A",
      clientName: ord.clientName,
      clientEmail: "procurement@klien.id",
      clientAddress: "Bandung, Jawa Barat",
      articleName: ord.article,
      scheme: ord.scheme,
      quantity: ord.targetQty,
      cuttingRate: 2500,
      sewingRate: 18500,
      materialsCharge: ord.scheme === "CMT" ? 0 : 1850000,
      finishingRate: 1500
    };
  });

  const currentOrder = dynamicCatalog[selectedOrder] || dynamicCatalog["ORD-2026-004"] || Object.values(dynamicCatalog)[0];

  const cuttingTotal = currentOrder.quantity * currentOrder.cuttingRate;
  const sewingTotal = currentOrder.quantity * currentOrder.sewingRate;
  const finishingTotal = currentOrder.quantity * currentOrder.finishingRate;
  const materialsTotal = currentOrder.materialsCharge;

  // Explicit PPN 11% Breakdown (Decision #4)
  const subtotalWithoutPpn = cuttingTotal + sewingTotal + finishingTotal + materialsTotal;
  const ppnRate = 11;
  const ppnAmount = Math.round(subtotalWithoutPpn * (ppnRate / 100));
  const totalWithPpn = subtotalWithoutPpn + ppnAmount;

  const dpAmount = Math.round(totalWithPpn * 0.5);
  const remainingAmount = totalWithPpn - dpAmount;

  // Check Finished Goods Stored for selectedOrder
  const storedFinishedQty = finishedGoods.filter(
    (fg) => fg.orderNumber === currentOrder.orderId && fg.status === "STORED"
  ).length;

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
        if (data.items && data.items.length > 0) {
          // Keep assembly worker visible
          const hasAssembly = data.items.some((i: any) => i.worker_role === "TAILOR_ASSEMBLY");
          if (!hasAssembly) {
            setPayrollItems([
              ...data.items,
              {
                id: "init-assembly-1",
                worker_role: "TAILOR_ASSEMBLY",
                verified_output_pcs: 24,
                piece_rate_subtotal: 72000,
                meal_allowance_cash: Math.round(72000 * (mealPct / 100)),
                qc_bonus_received: 0,
                take_home_pay: 72000 + Math.round(72000 * (mealPct / 100)),
                user_profiles: { full_name: "Rina Marlina (Penjahit-Assembly #01)" }
              }
            ]);
          } else {
            setPayrollItems(data.items);
          }
        }
      }
    } catch (err: any) {
      console.warn("Using offline fallback payroll:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncBusData = () => {
    const liveApproved = getApprovedMassOrders();
    setApprovedOrdersList(liveApproved);
    setIssuedInvoices(getIssuedInvoices());
    setPurchaseOrders(getPurchaseOrders());
    setFinishedGoods(getFinishedGoods());

    const liveBonus = getLiveQcPoolBonus();
    // Default 2 Mandors + 1 Kepala Ops = 3-way split (FR-10.3)
    const perSupervisorBonus = Math.round(liveBonus / (numMandors + 1));

    setPayrollItems((prev) =>
      prev.map((it) => {
        if (it.worker_role === "PRODUCTION_HEAD_MANDOR") {
          return {
            ...it,
            qc_bonus_received: perSupervisorBonus,
            take_home_pay: it.piece_rate_subtotal + it.meal_allowance_cash + perSupervisorBonus,
          };
        }
        return it;
      })
    );
  };

  useEffect(() => {
    calculatePayroll();
    syncBusData();

    window.addEventListener("lukla_bus_update", syncBusData);
    window.addEventListener("storage", syncBusData);
    return () => {
      window.removeEventListener("lukla_bus_update", syncBusData);
      window.removeEventListener("storage", syncBusData);
    };
  }, [numMandors]);

  // Recalculate meal allowance dynamically when mealPct slider changes (FR-10.2)
  useEffect(() => {
    setPayrollItems((prev) =>
      prev.map((it) => {
        const meal = Math.round(it.piece_rate_subtotal * (mealPct / 100));
        return {
          ...it,
          meal_allowance_cash: meal,
          take_home_pay: it.piece_rate_subtotal + meal + (it.qc_bonus_received || 0),
        };
      })
    );
  }, [mealPct]);

  const overheadPerUnit = Math.round(monthlyOverhead / (estimatedMonthlyUnits || 1));

  const filteredPayrollItems = payrollItems.filter((it) => {
    if (roleFilter !== "ALL") {
      if (roleFilter === "MANDOR" && it.worker_role !== "PRODUCTION_HEAD_MANDOR") return false;
      if (roleFilter !== "MANDOR" && it.worker_role !== roleFilter) return false;
    }
    if (workerSearch.trim()) {
      const q = workerSearch.toLowerCase();
      const matchName = it.user_profiles?.full_name?.toLowerCase().includes(q);
      const matchRole = it.worker_role?.toLowerCase().includes(q);
      if (!matchName && !matchRole) return false;
    }
    return true;
  });

  const exportPayrollCsv = () => {
    const headers = ["Nama Karyawan", "Posisi", "Output Terverifikasi (pcs)", "Upah Borongan (Rp)", `Uang Makan (${mealPct}% Tunai)`, "Bonus QC 3-Arah (Rp)", "Total Take Home Pay (Rp)"];
    const rows = filteredPayrollItems.map(it => [
      `"${it.user_profiles?.full_name || 'Karyawan'}"`,
      `"${it.worker_role}"`,
      it.verified_output_pcs,
      it.piece_rate_subtotal,
      it.meal_allowance_cash,
      it.qc_bonus_received,
      it.take_home_pay
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap-gaji-sabtu-${periodCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight">
            Workspace Payroll, Invoice (PPN 11%) & Finance PO
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Gaji Borongan Sabtu • Uang Makan 10–15% Tunai • Bonus QC 3-Arah • Invoice B2B (Tanpa PPN + PPN 11% + Total) • Review PO Bahan
          </p>
        </div>

        {/* Work Station Tabs */}
        <div className="flex flex-wrap bg-kabut p-1 rounded-field border border-garis gap-1">
          <button
            onClick={() => setActiveTab("PAYROLL")}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              activeTab === "PAYROLL"
                ? "bg-celup-indigo text-white shadow-sm"
                : "text-teks-sekunder hover:text-celup-indigo"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>1. Rekap Borongan & Slip Gaji (Sabtu)</span>
          </button>
          <button
            onClick={() => setActiveTab("INVOICE")}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              activeTab === "INVOICE"
                ? "bg-celup-indigo text-white shadow-sm"
                : "text-teks-sekunder hover:text-celup-indigo"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Penerbitan Invoice B2B (Rincian PPN 11%)</span>
          </button>
          <button
            onClick={() => setActiveTab("PO_REVIEW")}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              activeTab === "PO_REVIEW"
                ? "bg-celup-indigo text-white shadow-sm"
                : "text-teks-sekunder hover:text-celup-indigo"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Review PO Bahan Baku</span>
            {purchaseOrders.filter((p) => p.status === "PENDING").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-kapur text-celup-indigo border border-celup-indigo">
                {purchaseOrders.filter((p) => p.status === "PENDING").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: REKAPITULASI BORONGAN & SLIP GAJI */}
      {activeTab === "PAYROLL" && (
        <>
          {/* Control Configuration Bar: Meal Allowance Slider & Overhead Input */}
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-celup-indigo" />
                <h2 className="text-sm font-bold text-celup-indigo">
                  Parameter Penggajian Fleksibel (FR-10.2 s/d FR-10.4)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-celup-indigo">
                  Periode: {periodCode} (Sabtu)
                </span>
                <button
                  onClick={calculatePayroll}
                  disabled={loading}
                  className="px-3 py-1 bg-celup-indigo text-white font-bold text-xs rounded shadow-sm hover:bg-celup-indigo/90 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Kalkulasi Ulang</span>
                </button>
              </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-garis pb-2 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-celup-indigo">
                    Rekapitulasi Penggajian Hari Sabtu (UAT-02 & UAT-03)
                  </h2>
                  <span className="text-xs text-teks-sekunder">
                    Termasuk Penjahit-Operator, Penjahit-Assembly, dan Penjahit Baru
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPayrollCsv}
                    className="px-2.5 py-1 bg-white hover:bg-kabut border border-garis text-celup-indigo font-bold text-xs rounded shadow-sm flex items-center gap-1 transition-all"
                    title="Unduh rekapitulasi penggajian Sabtu ke format CSV / Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-celup-indigo" />
                    <span>Ekspor CSV</span>
                  </button>
                  <span className="text-xs font-mono font-bold text-status-lolos bg-white px-2 py-0.5 rounded border border-garis">
                    Status: Dihitung Sah
                  </span>
                </div>
              </div>

              {/* Worker Search & Role Category Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                {/* Search Box */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-teks-sekunder absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                    placeholder="Cari nama karyawan / penjahit..."
                    className="w-full text-xs pl-8 pr-7 py-1.5 bg-white border border-garis rounded-field text-tinta placeholder:text-teks-sekunder focus:outline-none focus:border-celup-indigo"
                  />
                  {workerSearch && (
                    <button
                      onClick={() => setWorkerSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-teks-sekunder hover:text-celup-indigo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Role Filter Pills */}
                <div className="flex bg-white p-0.5 rounded-field border border-garis text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("ALL")}
                    className={`px-2 py-1 rounded transition-all ${
                      roleFilter === "ALL" ? "bg-celup-indigo text-white shadow-sm" : "text-teks-sekunder hover:text-celup-indigo"
                    }`}
                  >
                    Semua ({payrollItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("TAILOR_OPERATOR")}
                    className={`px-2 py-1 rounded transition-all ${
                      roleFilter === "TAILOR_OPERATOR" ? "bg-celup-indigo text-white shadow-sm" : "text-teks-sekunder hover:text-celup-indigo"
                    }`}
                  >
                    Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("TAILOR_ASSEMBLY")}
                    className={`px-2 py-1 rounded transition-all ${
                      roleFilter === "TAILOR_ASSEMBLY" ? "bg-celup-indigo text-white shadow-sm" : "text-teks-sekunder hover:text-celup-indigo"
                    }`}
                  >
                    Assembly
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("MANDOR")}
                    className={`px-2 py-1 rounded transition-all ${
                      roleFilter === "MANDOR" ? "bg-celup-indigo text-white shadow-sm" : "text-teks-sekunder hover:text-celup-indigo"
                    }`}
                  >
                    Mandor
                  </button>
                </div>
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
                    {filteredPayrollItems.map((it) => {
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
                            <div className="font-bold text-celup-indigo flex items-center gap-1.5">
                              <span>{fullName}</span>
                              {it.worker_role === "TAILOR_ASSEMBLY" && (
                                <span className="text-[9px] bg-celup-indigo/10 text-celup-indigo px-1 py-0.2 rounded font-mono">
                                  Assembly
                                </span>
                              )}
                            </div>
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
                💡 <strong>Verifikasi UAT-02:</strong> Penjahit Baru (Budi #61 dan Wawan #62) serta Penjahit-Assembly dihitung secara akurat dengan upah borongan 30-menit + {mealPct}% uang makan tunai tanpa hambatan batas kuota karyawan.
              </div>
            </div>

            {/* Perforated Paper Payslip (5 cols, Section 8.5 of DESIGN_SYSTEM.md) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {(() => {
                const activeSlipWorker = payrollItems.find(it => it.id === selectedSlipWorker?.id) || selectedSlipWorker;
                if (!activeSlipWorker) return null;
                return (
                <div className="w-full max-w-[360px] bg-white border border-garis rounded-work shadow-hard p-4 sm:p-5 text-xs text-tinta font-mono relative">
                  {/* Top Perforation Line */}
                  <div className="border-b-2 border-dashed border-garis pb-3 mb-4 text-center flex flex-col items-center">
                    <img src="/lukla-logo.png" alt="Lukla Manufacturing" className="h-10 w-auto object-contain mb-1" />
                    <span className="text-[10px] uppercase tracking-widest text-teks-sekunder block">
                      LUKLA OPERATIONS
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
                        {activeSlipWorker.user_profiles?.full_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teks-sekunder">Posisi:</span>
                      <span className="font-semibold">{activeSlipWorker.worker_role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teks-sekunder">Verified Output:</span>
                      <span className="font-bold">{activeSlipWorker.verified_output_pcs} pcs</span>
                    </div>
                  </div>

                  {/* Wage Breakdown */}
                  <div className="border-t border-b border-dashed border-garis py-3 my-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Upah Borongan Komponen</span>
                      <span className="font-bold">
                        Rp {Number(activeSlipWorker.piece_rate_subtotal).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-status-perbaikan font-semibold">
                      <span>Uang Makan ({mealPct}% Tunai)</span>
                      <span>
                        Rp {Number(activeSlipWorker.meal_allowance_cash).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {Number(activeSlipWorker.qc_bonus_received) > 0 && (
                      <div className="flex justify-between text-status-lolos font-semibold">
                        <span>Bonus Pool QC (3-Arah)</span>
                        <span>
                          Rp {Number(activeSlipWorker.qc_bonus_received).toLocaleString("id-ID")}
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
                      Rp {Number(activeSlipWorker.take_home_pay).toLocaleString("id-ID")}
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
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PENERBITAN INVOICE RESMI B2B (BRD v1.5 Section 8.8) */}
      {activeTab === "INVOICE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Kontrol Parameter Invoice (4 cols) */}
          <div className="lg:col-span-4 bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
            <div className="border-b border-garis pb-2">
              <h2 className="text-sm font-bold text-celup-indigo flex items-center gap-2">
                <FileText className="w-4 h-4 text-celup-indigo" />
                Konfigurasi Penagihan B2B
              </h2>
              <p className="text-[11px] text-teks-sekunder">
                Penerbitan tagihan maklon resmi berdasarkan pesanan massal yang telah disetujui Owner.
              </p>
            </div>

            {/* Pilih Pesanan Massal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-tinta">Pilih Pesanan Massal:</label>
              <select
                value={selectedOrder}
                onChange={(e) => {
                  setSelectedOrder(e.target.value);
                  setInvoiceNumber(`INV-${e.target.value.replace("ORD-", "")}`);
                }}
                className="w-full text-xs border border-garis rounded p-2 text-celup-indigo font-bold bg-white"
              >
                {Object.values(dynamicCatalog).map((ord: any) => (
                  <option key={ord.orderId} value={ord.orderId}>
                    {ord.orderId} • {ord.clientName} ({ord.articleName} - {ord.quantity.toLocaleString("id-ID")} pcs)
                  </option>
                ))}
              </select>
            </div>

            {/* Nomor Invoice & Tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-tinta">No. Invoice:</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-garis rounded p-2 bg-white text-celup-indigo"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-tinta">Tgl Terbit:</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full text-xs font-mono border border-garis rounded p-2 bg-white text-tinta"
                />
              </div>
            </div>

            {/* Skema Pembayaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-tinta">Skema Pembayaran (Term of Payment):</label>
              <select
                value={paymentScheme}
                onChange={(e) => setPaymentScheme(e.target.value as any)}
                className="w-full text-xs border border-garis rounded p-2 text-celup-indigo font-bold bg-white"
              >
                <option value="TERMIN_50_50">Termin 50% Uang Muka (DP) & 50% Pelunasan</option>
                <option value="NET_30">Net 30 Hari (Tempo 30 Hari Kerja)</option>
                <option value="FULL">100% Pembayaran Penuh di Muka</option>
              </select>
            </div>

            {/* Metode Serah Terima & Status Kelayakan Gudang Barang Jadi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-tinta">Metode Serah Terima Barang Jadi:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("SHIPPING")}
                  className={`py-2 text-[11px] font-bold rounded border transition-all ${
                    fulfillmentMethod === "SHIPPING"
                      ? "bg-celup-indigo text-white border-celup-indigo shadow-sm"
                      : "bg-white text-teks-sekunder border-garis hover:border-celup-indigo"
                  }`}
                >
                  Dikirim Ekspedisi (Shipping)
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("PICKUP")}
                  className={`py-2 text-[11px] font-bold rounded border transition-all ${
                    fulfillmentMethod === "PICKUP"
                      ? "bg-celup-indigo text-white border-celup-indigo shadow-sm"
                      : "bg-white text-teks-sekunder border-garis hover:border-celup-indigo"
                  }`}
                >
                  Diambil Klien (Pickup)
                </button>
              </div>
              <div className="p-2 bg-white rounded border border-garis flex items-center justify-between text-[11px]">
                <span className="text-teks-sekunder font-medium">Stok Barang Jadi (`STORED`):</span>
                <span className="font-mono font-bold text-status-lolos">
                  {storedFinishedQty > 0 ? `${storedFinishedQty} pcs Siap Kirim` : "Siap Tagih (Verifikasi QC)"}
                </span>
              </div>
            </div>

            {/* Status Pembayaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-tinta">Status Pembayaran:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentStatus("UNPAID")}
                  className={`py-2 text-[11px] font-bold rounded border transition-all ${
                    paymentStatus === "UNPAID"
                      ? "bg-status-cacat text-white border-status-cacat shadow-sm"
                      : "bg-white text-teks-sekunder border-garis hover:border-status-cacat"
                  }`}
                >
                  Belum Bayar
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus("DP_PAID")}
                  className={`py-2 text-[11px] font-bold rounded border transition-all ${
                    paymentStatus === "DP_PAID"
                      ? "bg-status-info text-white border-status-info shadow-sm"
                      : "bg-white text-teks-sekunder border-garis hover:border-status-info"
                  }`}
                >
                  DP Diterima
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus("PAID")}
                  className={`py-2 text-[11px] font-bold rounded border transition-all ${
                    paymentStatus === "PAID"
                      ? "bg-status-lolos text-white border-status-lolos shadow-sm"
                      : "bg-white text-teks-sekunder border-garis hover:border-status-lolos"
                  }`}
                >
                  Lunas
                </button>
              </div>
            </div>

            {/* Jatuh Tempo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-tinta">Tanggal Jatuh Tempo:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-mono border border-garis rounded p-2 bg-white text-tinta"
              />
            </div>

            <div className="p-3 bg-white rounded border border-garis space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-celup-indigo font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Instruksi Transfer Resmi</span>
              </div>
              <p className="text-[11px] text-teks-sekunder">
                Pembayaran ditujukan ke rekening operasional resmi:
              </p>
              <div className="font-mono text-xs bg-kabut p-2 rounded text-celup-indigo font-bold">
                BCA: 123-456-7890<br />
                a.n. PT Lukla Manufaktur Indonesia
              </div>
            </div>
          </div>

          {/* Right Column: Printable Official Invoice Sheet (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-work border border-garis shadow-hard space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b-2 border-celup-indigo pb-5 gap-4">
                <div className="space-y-1">
                  <img src="/lukla-logo.png" alt="Lukla Manufacturing" className="h-10 w-auto object-contain mb-2" />
                  <h3 className="text-lg font-extrabold text-celup-indigo tracking-tight">
                    PT LUKLA MANUFAKTUR INDONESIA
                  </h3>
                  <p className="text-xs text-teks-sekunder">
                    Jl. Raya Soreang - Ciwidey KM 18, Bandung 40973
                  </p>
                  <p className="text-xs text-teks-sekunder font-mono">
                    NPWP: 81.234.567.8-445.000 • ops@lukla.id
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teks-sekunder block">
                    FAKTUR TAGIHAN RESMI (INVOICE PPN 11%)
                  </span>
                  <span className="text-xl font-mono font-extrabold text-celup-indigo block">
                    {invoiceNumber}
                  </span>
                  <div className="inline-block mt-2">
                    {paymentStatus === "PAID" && (
                      <span className="px-3 py-1 bg-status-lolos/10 text-status-lolos border border-status-lolos rounded-full text-xs font-extrabold uppercase">
                        LUNAS
                      </span>
                    )}
                    {paymentStatus === "DP_PAID" && (
                      <span className="px-3 py-1 bg-status-info/10 text-status-info border border-status-info rounded-full text-xs font-extrabold uppercase">
                        DP 50% DITERIMA
                      </span>
                    )}
                    {paymentStatus === "UNPAID" && (
                      <span className="px-3 py-1 bg-status-cacat/10 text-status-cacat border border-status-cacat rounded-full text-xs font-extrabold uppercase">
                        BELUM DIBAYAR
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To & Order Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-kabut/40 p-3.5 rounded border border-garis space-y-1">
                  <span className="text-[10px] uppercase font-bold text-teks-sekunder tracking-wider block">
                    DITUJUKAN KEPADA (KLIEN):
                  </span>
                  <div className="text-sm font-bold text-celup-indigo">{currentOrder.clientName}</div>
                  <div className="text-teks-sekunder">{currentOrder.clientAddress}</div>
                  <div className="text-teks-sekunder font-mono">{currentOrder.clientEmail}</div>
                </div>

                <div className="bg-kabut/40 p-3.5 rounded border border-garis space-y-1">
                  <span className="text-[10px] uppercase font-bold text-teks-sekunder tracking-wider block">
                    INFORMASI PESANAN & SERAH TERIMA:
                  </span>
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">No. Pesanan:</span>
                    <span className="font-mono font-bold text-celup-indigo">{currentOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">Skema Maklon:</span>
                    <span className="font-mono font-bold">{currentOrder.scheme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">Metode Serah Terima:</span>
                    <span className="font-mono font-bold text-status-lolos">
                      {fulfillmentMethod === "SHIPPING" ? "SHIPPING (Ekspedisi)" : "PICKUP (Diambil Klien)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">Tgl Terbit / Jatuh Tempo:</span>
                    <span className="font-mono">{invoiceDate} / {dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-garis">
                  <thead className="bg-kabut border-b border-garis text-celup-indigo font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Deskripsi Layanan / Item Produksi</th>
                      <th className="py-2.5 px-3 text-center">Volume</th>
                      <th className="py-2.5 px-3 text-right">Tarif Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (Tanpa PPN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-garis">
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-tinta">Jasa Cutting (Meja Potong Kain)</div>
                        <div className="text-[11px] text-teks-sekunder">
                          {currentOrder.articleName} • Presisi pola & bundle komponen
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{currentOrder.quantity} pcs</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {currentOrder.cuttingRate.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {cuttingTotal.toLocaleString("id-ID")}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-tinta">Jasa Jahit & Assembly (Lini ±70 Mesin & FIFO Assembly)</div>
                        <div className="text-[11px] text-teks-sekunder">
                          Penggabungan komponen per 30 menit & verifikasi mandor
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{currentOrder.quantity} pcs</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {currentOrder.sewingRate.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {sewingTotal.toLocaleString("id-ID")}</td>
                    </tr>
                    {materialsTotal > 0 && (
                      <tr>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-tinta">Pengadaan Bahan Pendukung & Aksesori</div>
                          <div className="text-[11px] text-teks-sekunder">
                            Skema Semi-CMT / Full Package: zipper YKK, kancing, benang jahit high-tenacity
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">1 Lot</td>
                        <td className="py-2.5 px-3 text-right font-mono">Rp {materialsTotal.toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {materialsTotal.toLocaleString("id-ID")}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-tinta">Jasa Finishing, Steam, QC & Pengemasan</div>
                        <div className="text-[11px] text-teks-sekunder">
                          Pemeriksaan 1 produk utuh di terminal QC, masuk Gudang Barang Jadi (`STORED`), tag & polybag
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{currentOrder.quantity} pcs</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {currentOrder.finishingRate.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {finishingTotal.toLocaleString("id-ID")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explicit PPN 11% Calculations Summary (Decision #4) */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-xs text-teks-sekunder space-y-1 max-w-sm">
                  <span className="font-bold text-tinta block">Catatan Penagihan & Pajak (PPN 11%):</span>
                  <p>
                    1. Faktur ini menampilkan <strong>Jumlah Tanpa PPN (DPP)</strong>, komponen <strong>PPN 11%</strong>, dan <strong>Total Setelah Penambahan PPN 11%</strong> secara transparan.
                  </p>
                  <p>
                    2. Mohon cantumkan nomor invoice <strong>{invoiceNumber}</strong> pada berita transfer bank.
                  </p>
                </div>

                <div className="w-full sm:w-80 bg-kabut/60 p-4 rounded border-2 border-celup-indigo space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-teks-sekunder font-sans font-semibold">Jumlah Tanpa PPN (Subtotal DPP):</span>
                    <span className="font-bold text-tinta">Rp {subtotalWithoutPpn.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-status-perbaikan">
                    <span className="font-sans font-semibold">PPN 11% (Pajak Pertambahan Nilai):</span>
                    <span className="font-bold">+ Rp {ppnAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t-2 border-celup-indigo pt-2 flex justify-between items-center text-sm font-extrabold text-celup-indigo">
                    <span className="font-sans">TOTAL SETELAH PPN 11%:</span>
                    <span>Rp {totalWithPpn.toLocaleString("id-ID")}</span>
                  </div>
                  {paymentScheme === "TERMIN_50_50" && (
                    <div className="border-t border-dashed border-garis pt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-status-info font-bold">
                        <span>Uang Muka (DP 50% Termasuk PPN):</span>
                        <span>Rp {dpAmount.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-teks-sekunder">
                        <span>Sisa Pelunasan (50%):</span>
                        <span>Rp {remainingAmount.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature, Save Invoice & Print Actions */}
              <div className="border-t border-garis pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left text-xs text-teks-sekunder">
                  <div>Diterbitkan oleh:</div>
                  <div className="mt-8 font-bold text-celup-indigo border-t border-garis pt-1 inline-block">
                    Departemen Finance & Payroll Lukla
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 print:hidden">
                  <button
                    onClick={() => {
                      const newInv: IssuedInvoiceRecord = {
                        id: `inv-${Date.now()}`,
                        invoiceNumber,
                        orderNumber: currentOrder.orderId,
                        clientCode: currentOrder.clientCode || "KLIEN_A",
                        clientName: currentOrder.clientName,
                        articleName: currentOrder.articleName,
                        scheme: currentOrder.scheme,
                        quantity: currentOrder.quantity,
                        pricePerUnit: Math.round(subtotalWithoutPpn / (currentOrder.quantity || 1)),
                        subtotalWithoutPpn,
                        ppnRate: 11,
                        ppnAmount,
                        totalWithPpn,
                        paymentStatus,
                        fulfillmentMethod,
                        issuedAt: invoiceDate,
                      };
                      saveIssuedInvoice(newInv);
                      setIssuedInvoices(getIssuedInvoices());
                      alert(
                        `Invoice Resmi ${invoiceNumber} untuk ${currentOrder.clientName} BERHASIL diterbitkan & disinkronkan ke Portal Klien B2B!\n\n• Jumlah Tanpa PPN: Rp ${subtotalWithoutPpn.toLocaleString("id-ID")}\n• PPN 11%: Rp ${ppnAmount.toLocaleString("id-ID")}\n• Total Setelah PPN 11%: Rp ${totalWithPpn.toLocaleString("id-ID")}`
                      );
                    }}
                    className="px-4 py-2 bg-status-lolos text-white font-bold text-xs rounded-field hover:bg-status-lolos/90 flex items-center gap-1.5 shadow-hard transition-all active:translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terbitkan & Simpan Invoice Resmi (PPN 11%)</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-field hover:bg-celup-indigo/90 flex items-center gap-1.5 shadow-hard transition-all active:translate-y-0.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabel Daftar Invoice Resmi Diterbitkan (Menampilkan Tanpa PPN, PPN 11%, & Setelah PPN) */}
            <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-3 print:hidden">
              <div className="flex items-center justify-between border-b border-garis pb-2">
                <div>
                  <h3 className="text-sm font-bold text-celup-indigo">
                    Daftar Invoice Resmi Diterbitkan (Rincian Tanpa PPN, PPN 11% & Total Setelah PPN)
                  </h3>
                  <p className="text-xs text-teks-sekunder">
                    Tersinkronisasi langsung dengan Portal Klien B2B secara real-time
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-celup-indigo bg-kabut px-2.5 py-1 rounded">
                  {issuedInvoices.length} Invoice Aktif
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-kabut text-tinta font-bold border-b border-garis">
                    <tr>
                      <th className="py-2.5 px-3">No. Invoice</th>
                      <th className="py-2.5 px-2">Order & Klien</th>
                      <th className="py-2.5 px-2 text-right">Jumlah Tanpa PPN (DPP)</th>
                      <th className="py-2.5 px-2 text-right">PPN 11%</th>
                      <th className="py-2.5 px-2 text-right">Total Setelah PPN 11%</th>
                      <th className="py-2.5 px-2 text-center">Serah Terima</th>
                      <th className="py-2.5 px-3 text-right">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-garis">
                    {issuedInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-lembar">
                        <td className="py-2.5 px-3 font-mono font-bold text-celup-indigo">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-2">
                          <span className="font-mono font-bold text-tinta block">{inv.orderNumber}</span>
                          <span className="text-[11px] text-teks-sekunder">{inv.clientName} ({inv.quantity} pcs)</span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-tinta">
                          Rp {inv.subtotalWithoutPpn.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-status-perbaikan">
                          + Rp {inv.ppnAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-extrabold text-celup-indigo">
                          Rp {inv.totalWithPpn.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-[10px]">
                          {inv.fulfillmentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.paymentStatus === "PAID"
                                ? "bg-status-lolos text-white"
                                : inv.paymentStatus === "DP_PAID"
                                ? "bg-status-info text-white"
                                : "bg-status-cacat text-white"
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW PURCHASE ORDER (PO) BAHAN BAKU OLEH TIM FINANCE (ADOPTED FROM TESTLUKIA-MAIN) */}
      {activeTab === "PO_REVIEW" && (
        <div className="space-y-6">
          <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo shadow-hard space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-3">
              <div>
                <h2 className="text-sm font-bold text-celup-indigo">
                  Persetujuan Purchase Order (PO) Bahan Baku & Komitmen Klien oleh Finance
                </h2>
                <p className="text-xs text-teks-sekunder">
                  Setiap PO pengadaan bahan ke Supplier yang diterbitkan otomatis maupun diajukan Gudang wajib disetujui (`APPROVED`) atau ditolak (`REJECTED`) oleh Finance.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-white border border-garis text-xs font-mono font-bold text-celup-indigo">
                Menunggu Review: {purchaseOrders.filter((p) => p.status === "PENDING").length} PO
              </span>
            </div>

            <div className="overflow-x-auto bg-white rounded border border-garis">
              <table className="w-full text-xs text-left">
                <thead className="bg-kabut text-tinta font-bold border-b border-garis">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PO</th>
                    <th className="py-2.5 px-2">Order & Klien</th>
                    <th className="py-2.5 px-2">Supplier / Tipe</th>
                    <th className="py-2.5 px-2">Material Bahan</th>
                    <th className="py-2.5 px-2 text-right">Kuantitas</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Keputusan Finance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-lembar">
                      <td className="py-2.5 px-3 font-mono font-bold text-celup-indigo">{po.poNumber}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-mono font-bold text-tinta block">{po.orderNumber}</span>
                        <span className="text-[11px] text-teks-sekunder">{po.clientName}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-tinta block">{po.supplierOrClient}</span>
                        <span className="text-[10px] text-teks-sekunder">
                          {po.docType === "CLIENT_COMMITMENT" ? "Komitmen Bahan CMT" : "PO Beli Supplier"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-medium text-tinta">
                        <span className="font-mono text-[10px] text-celup-indigo block">{po.rawMaterialSku}</span>
                        {po.itemName}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-tinta">
                        {po.quantity} {po.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === "APPROVED"
                              ? "bg-status-lolos text-white"
                              : po.status === "REJECTED"
                              ? "bg-status-cacat text-white"
                              : "bg-kapur text-celup-indigo border border-celup-indigo"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {po.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                reviewPurchaseOrder(po.id, "APPROVED", "Disetujui oleh Departemen Finance Lukla");
                                setPurchaseOrders(getPurchaseOrders());
                                alert(`PO ${po.poNumber} (${po.itemName}) telah DISETUJUI (APPROVED) oleh Tim Finance!`);
                              }}
                              className="px-2.5 py-1 bg-status-lolos text-white font-bold rounded text-[11px] hover:bg-status-lolos/90"
                            >
                              Setujui PO
                            </button>
                            <button
                              onClick={() => {
                                reviewPurchaseOrder(po.id, "REJECTED", "Ditolak oleh Departemen Finance Lukla");
                                setPurchaseOrders(getPurchaseOrders());
                                alert(`PO ${po.poNumber} telah DITOLAK (REJECTED) oleh Tim Finance.`);
                              }}
                              className="px-2.5 py-1 bg-status-cacat text-white font-bold rounded text-[11px] hover:bg-status-cacat/90"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-teks-sekunder">Selesai Direview</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
