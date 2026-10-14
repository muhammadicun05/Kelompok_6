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
  Timer
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThreadEdge, ClientTag } from "@/components/Design/ThreadEdge";

export default function DashboardPage() {
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

  useEffect(() => {
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
              {stats.outputToday}
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
              {stats.qcPassRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Pool Bonus QC: <span className="font-bold text-celup-indigo">Rp {stats.qcPoolBonus.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* KPI 4: Contamination Prevention Blocks */}
        <div className="bg-lembar p-4 rounded-work border border-garis shadow-hard">
          <div className="flex items-center justify-between text-teks-sekunder text-xs mb-2">
            <span className="font-medium">Blokir Anti-Kontaminasi</span>
            <ShieldAlert className="w-4 h-4 text-status-cacat" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-status-cacat tabular-nums">
              {stats.contaminationBlocks}
            </span>
            <span className="text-xs text-teks-sekunder">insiden dicegah</span>
          </div>
          <div className="mt-2 text-[11px] text-teks-sekunder">
            Validasi FR-6.2 aktif di pintu Cutting
          </div>
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
              {recentOrders.map((ord) => (
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
