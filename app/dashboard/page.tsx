"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Sparkles,
  Users,
  Timer,
  Check,
  X,
  Clock,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThreadEdge, ClientTag } from "@/components/Design/ThreadEdge";
import { UniversalFilterBar, FilterState } from "@/components/Design/UniversalFilterBar";

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: "",
    clientCode: "ALL",
    startDate: "",
    endDate: "",
    datePreset: "ALL",
  });

  const [stats, setStats] = useState({
    activeMachines: 52,
    totalMachines: 70,
    outputToday: 184,
    qcPassRate: 94.2,
    contaminationBlocks: 0,
    qcPoolBonus: 600,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pendingMassOrders, setPendingMassOrders] = useState<any[]>([
    {
      orderNumber: "ORD-2026-004",
      clientCode: "SNOHUND",
      clientName: "Snøhund Alpine Wear",
      article: "Snøhund Alpine Tactical Backpack 35L",
      scheme: "FULL_PACKAGE",
      targetQty: 500,
      inheritedVersion: "v2 (Approved)",
      inheritedSmv: "18m 30s",
      inheritedFabric: "1.45 m Cordura 1000D / pcs",
      status: "PENDING_OWNER_APPROVAL",
      createdAt: "15 Okt 2026, 14:00",
    }
  ]);

  const handleOwnerApproval = (orderNum: string, decision: "APPROVED" | "REJECTED") => {
    const updated = pendingMassOrders.map((o) =>
      o.orderNumber === orderNum ? { ...o, status: decision } : o
    );
    setPendingMassOrders(updated);
    try {
      localStorage.setItem("lukla_pending_orders", JSON.stringify(updated));
    } catch {}

    if (decision === "APPROVED") {
      alert(`Order ${orderNum} TELAH RESMI DISETUJUI OLEH OWNER! Status pesanan kini ACTIVE, Rate Card terkunci, dan instruksi kerja diteruskan ke Kepala Operasional & Meja Potong Gudang.`);
    } else {
      alert(`Order ${orderNum} DITOLAK oleh Owner. Proses produksi dibatalkan.`);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lukla_pending_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setPendingMassOrders(parsed);
        }
      }
    } catch {}

    async function loadDashboardData() {
      try {
        // Fetch orders
        const { data: orders } = await supabase
          .from("orders")
          .select("*, clients(*)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (orders) setRecentOrders(orders);

        // Fetch pending 30-min output logs
        const { data: pendings } = await supabase
          .from("output_logs_30min")
          .select("*, user_profiles(*), orders(*)")
          .eq("verification_status", "PENDING")
          .order("created_at", { ascending: false })
          .limit(4);

        if (pendings) setPendingVerifications(pendings);

        // Fetch total QC bonus pool
        const { data: qcPool } = await supabase
          .from("qc_bonus_ledger")
          .select("amount");

        if (qcPool && qcPool.length > 0) {
          const total = qcPool.reduce((acc, row) => acc + Number(row.amount), 0);
          setStats((prev) => ({ ...prev, qcPoolBonus: total }));
        }

        // Fetch blocked contamination count
        const { count } = await supabase
          .from("inventory_transactions")
          .select("*", { count: "exact", head: true })
          .eq("is_blocked_contamination", true);

        if (count !== null) {
          setStats((prev) => ({ ...prev, contaminationBlocks: count }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-celup-indigo tracking-tight">
            Dashboard Operasional Pabrik
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Monitoring Kapasitas: {stats.activeMachines} / {stats.totalMachines} Mesin Aktif
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
          <Link
            href="/production/terminal"
            className="px-3 py-2 rounded-work bg-celup-indigo text-white text-xs font-semibold hover:bg-celup-indigo/90 shadow-hard flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <Activity className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Terminal 30m</span>
          </Link>
          <Link
            href="/qc/terminal"
            className="px-3 py-2 rounded-work bg-white border border-garis text-celup-indigo text-xs font-semibold hover:border-celup-indigo shadow-hard flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-status-lolos flex-shrink-0" />
            <span className="truncate">Terminal QC</span>
          </Link>
        </div>
      </div>

      {/* Universal Filter & Date Range Bar */}
      <UniversalFilterBar
        filter={filter}
        onChange={setFilter}
        searchPlaceholder="Cari pesanan massal, nomor order, artikel..."
      />

      {/* 4 KPI Cards Grid (Industrial Paper Style, No soft shadows) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Machines */}
        <div className="bg-lembar p-4 rounded-work border border-garis shadow-hard">
          <div className="flex items-center justify-between text-teks-sekunder text-xs mb-2">
            <span className="font-medium">Mesin Jahit Aktif</span>
            <Users className="w-4 h-4 text-celup-indigo" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-celup-indigo tabular-nums">
              {stats.activeMachines}
            </span>
            <span className="text-xs text-teks-sekunder">/ {stats.totalMachines} mesin</span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Lini Produksi A, B, dan C
          </div>
        </div>

        {/* KPI 2: Today's Output */}
        <div className="bg-lembar p-4 rounded-work border border-garis shadow-hard">
          <div className="flex items-center justify-between text-teks-sekunder text-xs mb-2">
            <span className="font-medium">Output Terverifikasi Hari Ini</span>
            <Activity className="w-4 h-4 text-celup-indigo" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-celup-indigo tabular-nums">
              {filter.clientCode === "SNOHUND" ? 112 : filter.clientCode !== "ALL" ? 72 : stats.outputToday}
            </span>
            <span className="text-xs text-teks-sekunder">pcs komponen</span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Interval pencatatan per 30 menit
          </div>
        </div>

        {/* KPI 3: QC Pass Rate & Pool */}
        <div className="bg-lembar p-4 rounded-work border border-garis shadow-hard">
          <div className="flex items-center justify-between text-teks-sekunder text-xs mb-2">
            <span className="font-medium">Tingkat Lolos QC Utuh</span>
            <CheckCircle2 className="w-4 h-4 text-status-lolos" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-status-lolos tabular-nums">
              {filter.clientCode === "SNOHUND" ? 96.5 : filter.clientCode !== "ALL" ? 93.8 : stats.qcPassRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Pool Bonus QC: <span className="font-bold text-celup-indigo">Rp {stats.qcPoolBonus.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* KPI 4: Contamination Prevention Blocks */}
        <div className="bg-lembar p-4 rounded-work border border-garis shadow-hard">
          <div className="flex items-center justify-between text-teks-sekunder text-xs mb-2">
            <span className="font-medium">Pencegahan Bahan Tertukar</span>
            <span className="sr-only">Blokir Anti-Kontaminasi</span>
            <ShieldAlert className="w-4 h-4 text-status-cacat" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-status-cacat tabular-nums">
              {stats.contaminationBlocks}
            </span>
            <span className="text-xs text-teks-sekunder">insiden dicegah</span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Validasi kecocokan bahan & pesanan (FR-6.2)
          </div>
        </div>
      </div>

      {/* Owner Mass Order Approval Queue (QA Pak Harry Point 2) */}
      <div className="bg-lembar rounded-work border-2 border-celup-indigo/40 p-4 sm:p-5 shadow-hard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-kapur flex items-center justify-center font-bold text-celup-indigo border border-celup-indigo/30 text-sm">
              👑
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-celup-indigo flex items-center gap-2">
                Antrean Persetujuan Pesanan Massal (Wewenang Tunggal Owner)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-kapur text-celup-indigo font-bold border border-celup-indigo/30">
                  {pendingMassOrders.filter((o) => o.status === "PENDING_OWNER_APPROVAL").length} Menunggu
                </span>
              </h2>
              <p className="text-xs text-teks-sekunder">
                Persetujuan Owner mengunci Rate Card, SMV, dan BOM sampel approved sebelum pesanan dieksekusi Gudang & Lini Jahit.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-teks-sekunder bg-white px-2.5 py-1 rounded border border-garis self-start sm:self-auto">
            QA Fix: Pak Harry #2
          </span>
        </div>

        <div className="space-y-3">
          {pendingMassOrders.map((order, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-work border transition-all ${
                order.status === "PENDING_OWNER_APPROVAL"
                  ? "bg-white border-celup-indigo/40 shadow-sm"
                  : order.status === "APPROVED"
                  ? "bg-status-lolos/5 border-status-lolos/30"
                  : "bg-status-cacat/5 border-status-cacat/30 opacity-70"
              }`}
            >
              <ThreadEdge clientCode={order.clientCode} className="pl-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ClientTag clientCode={order.clientCode} clientName={order.clientName} />
                      <span className="font-mono text-xs font-bold text-celup-indigo bg-kabut px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-celup-indigo text-white">
                        {order.scheme}
                      </span>
                      <span className="text-xs text-teks-sekunder">
                        Diterbitkan: {order.createdAt}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-tinta">
                      {order.article}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-teks-sekunder pt-1">
                      <div className="bg-lembar px-2.5 py-1 rounded border border-garis">
                        <span className="block text-[10px] uppercase font-semibold text-teks-sekunder">Target Volume</span>
                        <span className="font-mono font-bold text-celup-indigo">{order.targetQty} pcs</span>
                      </div>
                      <div className="bg-lembar px-2.5 py-1 rounded border border-garis">
                        <span className="block text-[10px] uppercase font-semibold text-teks-sekunder">Versi Sampel</span>
                        <span className="font-bold text-status-lolos">{order.inheritedVersion}</span>
                      </div>
                      <div className="bg-lembar px-2.5 py-1 rounded border border-garis">
                        <span className="block text-[10px] uppercase font-semibold text-teks-sekunder">Kunci SMV</span>
                        <span className="font-mono font-bold text-tinta">{order.inheritedSmv}</span>
                      </div>
                      <div className="bg-lembar px-2.5 py-1 rounded border border-garis">
                        <span className="block text-[10px] uppercase font-semibold text-teks-sekunder">Bahan Baku (BOM)</span>
                        <span className="font-bold text-tinta truncate">{order.inheritedFabric}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-garis">
                    {order.status === "PENDING_OWNER_APPROVAL" ? (
                      <>
                        <button
                          onClick={() => handleOwnerApproval(order.orderNumber, "APPROVED")}
                          className="w-full sm:w-auto px-4 py-2 rounded-work bg-status-lolos hover:bg-status-lolos/90 text-white text-xs font-bold shadow-hard flex items-center justify-center gap-1.5 transition-all min-h-[42px]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui Order</span>
                        </button>
                        <button
                          onClick={() => handleOwnerApproval(order.orderNumber, "REJECTED")}
                          className="w-full sm:w-auto px-4 py-2 rounded-work bg-white border border-status-cacat text-status-cacat hover:bg-status-cacat hover:text-white text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </>
                    ) : order.status === "APPROVED" ? (
                      <span className="px-3 py-1.5 rounded-work bg-status-lolos/15 border border-status-lolos text-status-lolos text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Disetujui (Aktif di Pabrik)
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-work bg-status-cacat/15 border border-status-cacat text-status-cacat text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Ditolak Owner
                      </span>
                    )}
                  </div>
                </div>
              </ThreadEdge>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders in Progress & Line Pace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders List */}
          <div className="bg-lembar rounded-work border border-garis p-4 shadow-hard">
            <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
              <h2 className="text-sm font-bold text-celup-indigo">
                Pesanan Massal Berjalan (Multi-Tenant)
              </h2>
              <span className="text-xs text-teks-sekunder">FR-6.1 Mandatory Tagging</span>
            </div>

            <div className="divide-y divide-garis">
              {recentOrders
                .filter((ord) => {
                  if (filter.clientCode !== "ALL" && ord.clients?.client_code !== filter.clientCode) {
                    return false;
                  }
                  if (filter.searchQuery) {
                    const q = filter.searchQuery.toLowerCase();
                    const matchNo = ord.order_number?.toLowerCase().includes(q);
                    const matchArt = ord.article_name?.toLowerCase().includes(q);
                    const matchCli = ord.clients?.name?.toLowerCase().includes(q);
                    if (!matchNo && !matchArt && !matchCli) return false;
                  }
                  return true;
                })
                .map((ord) => (
                <div key={ord.id} className="py-3">
                  <ThreadEdge clientCode={ord.clients?.client_code} className="pl-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <ClientTag
                            clientCode={ord.clients?.client_code}
                            clientName={ord.clients?.name}
                          />
                          <span className="font-mono text-xs font-bold text-celup-indigo">
                            {ord.order_number}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-kabut font-semibold text-teks-sekunder">
                            {ord.scheme}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-tinta mt-1 truncate">
                          {ord.article_name}
                        </p>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-1 sm:pt-0 sm:text-right border-t sm:border-t-0 border-garis/40">
                        <div>
                          <div className="text-[11px] font-medium text-teks-sekunder">
                            Progres Selesai:
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-celup-indigo tabular-nums">
                            {ord.completed_qty || 0} / {ord.target_qty} pcs
                          </div>
                        </div>
                        <div className="w-24 sm:w-28 h-1.5 bg-kabut rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full bg-celup-indigo"
                            style={{
                              width: `${Math.min(100, Math.round(((ord.completed_qty || 0) / ord.target_qty) * 100))}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </ThreadEdge>
                </div>
              ))}
            </div>
          </div>

          {/* Line Speed Visualization / Parallel Lines */}
          <div className="bg-lembar rounded-work border border-garis p-4 shadow-hard">
            <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
              <h2 className="text-sm font-bold text-celup-indigo">
                Status Kecepatan Lini Produksi
              </h2>
              <span className="text-xs text-teks-sekunder">Monitoring 30 Menit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-field border border-garis">
                <span className="text-xs text-teks-sekunder font-medium block">Lini A (Hoodie Snøhund)</span>
                <span className="text-lg font-bold text-celup-indigo tabular-nums">Mesin #1 - #20</span>
                <div className="mt-1 text-xs text-status-lolos font-semibold">● Berjalan Normal (38 pcs/jam)</div>
              </div>

              <div className="bg-white p-3 rounded-field border border-garis">
                <span className="text-xs text-teks-sekunder font-medium block">Lini B (Parka Klien A)</span>
                <span className="text-lg font-bold text-celup-indigo tabular-nums">Mesin #21 - #45</span>
                <div className="mt-1 text-xs text-status-lolos font-semibold">● Berjalan Normal (42 pcs/jam)</div>
              </div>

              <div className="bg-white p-3 rounded-field border border-garis">
                <span className="text-xs text-teks-sekunder font-medium block">Lini C (Cadangan & Tambahan)</span>
                <span className="text-lg font-bold text-celup-indigo tabular-nums">Mesin #46 - #70</span>
                <div className="mt-1 text-xs text-status-perbaikan font-semibold">▲ Penambahan Penjahit Baru</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Verifications & Quick Audit */}
        <div className="space-y-6">
          {/* Pending Verifications Widget */}
          <div className="bg-lembar rounded-work border border-garis p-4 shadow-hard">
            <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
              <h2 className="text-sm font-bold text-celup-indigo">
                Menunggu Verifikasi Mandor
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-kapur text-celup-indigo font-bold">
                {pendingVerifications.length} Pending
              </span>
            </div>

            {pendingVerifications.length === 0 ? (
              <p className="text-xs text-teks-sekunder py-4 text-center">
                Semua output 30 menit telah diverifikasi Mandor.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border-2 border-dashed border-celup-indigo rounded-field text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-celup-indigo">
                        Mesin #{log.machine_number}
                      </span>
                      <span className="font-mono text-[10px] text-teks-sekunder">
                        {log.slot_time}
                      </span>
                    </div>
                    <div className="text-tinta font-medium">
                      {log.component_name}: <span className="font-bold">{log.qty_completed} pcs</span>
                    </div>
                    <div className="text-teks-sekunder text-[11px] mt-1 flex items-center justify-between">
                      <span>Operator: Siti / Rina</span>
                      <Link
                        href="/production/terminal"
                        className="text-celup-indigo font-bold hover:underline"
                      >
                        Buka Terminal →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Business Rules Defense Box (Bahan Presentasi) */}
          <div className="bg-white rounded-work border border-garis p-4 shadow-hard">
            <h3 className="text-xs font-bold text-celup-indigo uppercase tracking-wider mb-2">
              Aturan Bisnis Resmi Lukla
            </h3>
            <ul className="text-xs text-teks-sekunder space-y-2 list-disc pl-4">
              <li>
                <strong className="text-tinta">Tim Sampler (Fase 1 & 2):</strong> Personel yang mendaftarkan klaim/spesifikasi klien ke sistem dan menerbitkan order produksi massal.
              </li>
              <li>
                <strong className="text-tinta">Cutting (Gudang):</strong> Proses pemotongan kain dilakukan langsung oleh Tim Gudang setelah lolos anti-kontaminasi FR-6.2.
              </li>
              <li>
                <strong className="text-tinta">QC Produk Utuh:</strong> Inspeksi QC dilakukan <span className="text-celup-indigo font-semibold">HANYA saat barang jadi utuh</span> (hasil assembly), bukan komponen lepas.
              </li>
              <li>
                <strong className="text-tinta">Gaji Borongan:</strong> Murni dari output 30 menit yang telah <span className="text-status-lolos font-semibold">Verified</span> (*no clawback*).
              </li>
              <li>
                <strong className="text-tinta">Uang Makan (10–15%):</strong> Masuk slip gaji sebagai uang tunai langsung.
              </li>
              <li>
                <strong className="text-tinta">Bonus QC:</strong> Dibagi rata kepada 2 Mandor + 1 Kepala Operasional.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
