"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Users, 
  Layers, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Boxes,
  Plus
} from "lucide-react";
import { 
  getLineAllocations, 
  saveLineAllocation, 
  getUnverifiedOutputs, 
  verifyOutputEntry, 
  assembleCompletedProducts, 
  getAllMassOrders, 
  LineAllocationRecord, 
  UnverifiedOutputRecord, 
  MassOrder 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function ProductionPage() {
  const { currentRole } = useRole();
  const [allocations, setAllocations] = useState<LineAllocationRecord[]>([]);
  const [unverifiedOutputs, setUnverifiedOutputs] = useState<UnverifiedOutputRecord[]>([]);
  const [orders, setOrders] = useState<MassOrder[]>([]);

  // Assembly Form State
  const [assemblyOrderNum, setAssemblyOrderNum] = useState("ORD-2026-004");
  const [assemblyCount, setAssemblyCount] = useState(5);
  const [assembledBy, setAssembledBy] = useState("Meja Assembly #1 (Rina & Siti)");

  // New Allocation Modal State
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocForm, setAllocForm] = useState({
    workerName: "Budi Santoso (Penjahit #05)",
    machineNumber: 5,
    lineName: "Lini 1 (Sewing Body)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Tali Bahu & Sternum Strap",
    targetQuantity: 500,
  });

  const loadData = () => {
    setAllocations(getLineAllocations());
    setUnverifiedOutputs(getUnverifiedOutputs().filter((u) => u.status === "PENDING"));
    setOrders(getAllMassOrders().filter((o) => o.status !== "REJECTED"));
  };

  useEffect(() => {
    loadData();
    const handleBusUpdate = () => loadData();
    window.addEventListener("lukla_bus_update", handleBusUpdate);
    window.addEventListener("storage", handleBusUpdate);
    return () => {
      window.removeEventListener("lukla_bus_update", handleBusUpdate);
      window.removeEventListener("storage", handleBusUpdate);
    };
  }, []);

  const handleVerify = (id: string) => {
    verifyOutputEntry(id);
    alert("Output 30 menit berhasil diverifikasi oleh Mandor! Status menjadi Verified dan terakumulasi ke payroll.");
    loadData();
  };

  const handleAssemble = (e: React.FormEvent) => {
    e.preventDefault();
    if (assemblyCount <= 0) return;
    assembleCompletedProducts(assemblyOrderNum, Number(assemblyCount), assembledBy);
    alert(`${assemblyCount} unit ransel utuh berhasil dirakit dan dikirimkan ke Antrean Terminal QC!`);
    loadData();
  };

  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    saveLineAllocation({
      id: `alloc-${Date.now()}`,
      workerName: allocForm.workerName,
      machineNumber: Number(allocForm.machineNumber),
      lineName: allocForm.lineName,
      orderNumber: allocForm.orderNumber,
      articleName: allocForm.articleName,
      componentName: allocForm.componentName,
      producedUnits: 0,
      targetQuantity: Number(allocForm.targetQuantity),
      status: "ACTIVE",
      allocatedAt: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    });

    setShowAllocModal(false);
    alert(`Alokasi penjahit untuk ${allocForm.workerName} pada ${allocForm.lineName} berhasil disimpan!`);
    loadData();
  };

  const canVerify = currentRole === "OWNER" || currentRole === "PRODUCTION_HEAD_MANDOR";
  const canManage = currentRole === "OWNER" || currentRole === "PRODUCTION_HEAD_MANDOR";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Cpu className="w-6 h-6 text-celup-indigo" />
            <span>Monitoring Lini Produksi &amp; Alokasi Jahit</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Pengelolaan lini cair hingga ±70 mesin jahit, verifikasi output 30 menit Mandor, dan stasiun perakitan produk utuh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <button
              onClick={() => setShowAllocModal(true)}
              className="px-3.5 py-2 bg-kabut border border-garis rounded-work text-xs font-bold text-celup-indigo hover:bg-garis flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alokasikan Penjahit</span>
            </button>
          )}

          <Link
            href="/production/terminal"
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-kapur" />
            <span>Buka Touch Terminal 30 Menit →</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-work border border-garis shadow-hard">
          <span className="text-[11px] font-semibold text-teks-sekunder block">Mesin Jahit Aktif:</span>
          <span className="text-2xl font-black text-celup-indigo font-mono">52 / 70</span>
          <span className="text-[10px] text-status-lolos font-bold block mt-0.5">±70 Kapasitas Cair</span>
        </div>

        <div className="bg-white p-4 rounded-work border border-garis shadow-hard">
          <span className="text-[11px] font-semibold text-teks-sekunder block">Penjahit Teralokasi:</span>
          <span className="text-2xl font-black text-celup-indigo font-mono">{allocations.length}</span>
          <span className="text-[10px] text-teks-sekunder block mt-0.5">3 Lini Sewing Aktif</span>
        </div>

        <div className="bg-white p-4 rounded-work border border-garis shadow-hard">
          <span className="text-[11px] font-semibold text-teks-sekunder block">Output Menunggu Verifikasi:</span>
          <span className="text-2xl font-black text-amber-900 font-mono">{unverifiedOutputs.length}</span>
          <span className="text-[10px] text-amber-800 font-bold block mt-0.5">Dual-Mode Mandor</span>
        </div>

        <div className="bg-white p-4 rounded-work border border-garis shadow-hard">
          <span className="text-[11px] font-semibold text-teks-sekunder block">Stasiun Perakitan:</span>
          <span className="text-2xl font-black text-status-lolos font-mono">2 Meja</span>
          <span className="text-[10px] text-teks-sekunder block mt-0.5">Antrean FIFO Menunggu QC</span>
        </div>
      </div>

      {/* Section 1: Alokasi Aktif Penjahit */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2.5">
          <h2 className="text-sm font-bold text-celup-indigo">Alokasi Penjahit Lini Aktif</h2>
          <span className="text-xs text-teks-sekunder">{allocations.length} Operator</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Penjahit &amp; Mesin</th>
                <th className="p-3">Lini</th>
                <th className="p-3">No. Order</th>
                <th className="p-3">Komponen Dikerjakan</th>
                <th className="p-3 text-right">Output / Target</th>
                <th className="p-3">Progres</th>
                <th className="p-3">Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {allocations.map((alloc) => {
                const pct = Math.min(100, Math.round((alloc.producedUnits / alloc.targetQuantity) * 100));
                return (
                  <tr key={alloc.id} className="hover:bg-lembar transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-tinta">{alloc.workerName}</div>
                      <span className="font-mono text-[10px] text-teks-sekunder">Mesin #{alloc.machineNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-kabut font-bold text-celup-indigo border border-garis">
                        {alloc.lineName}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-tinta">{alloc.orderNumber}</td>
                    <td className="p-3 font-medium text-tinta">{alloc.componentName}</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      <span className="font-bold text-celup-indigo">{alloc.producedUnits}</span>
                      <span className="text-teks-sekunder"> / {alloc.targetQuantity}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-kabut h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-status-lolos h-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-tinta">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-teks-sekunder font-mono text-[11px]">{alloc.allocatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Verifikasi Output 30 Menit (Mandor) */}
      {canVerify && (
        <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-garis pb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-celup-indigo">Verifikasi Output 30 Menit Mandor</h2>
              {unverifiedOutputs.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
                  {unverifiedOutputs.length} menunggu
                </span>
              )}
            </div>
            <span className="text-xs text-teks-sekunder">Aturan #7: Dual-Mode Input &amp; Approval Mandor</span>
          </div>

          {unverifiedOutputs.length === 0 ? (
            <div className="p-6 text-center text-xs text-teks-sekunder border border-dashed border-garis rounded">
              Semua output 30 menit telah terverifikasi oleh Mandor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Slot Waktu</th>
                    <th className="p-3">Penjahit</th>
                    <th className="p-3">Lini</th>
                    <th className="p-3">Pesanan &amp; Komponen</th>
                    <th className="p-3 text-right">Output</th>
                    <th className="p-3 text-right">Aksi Mandor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {unverifiedOutputs.map((out) => (
                    <tr key={out.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-celup-indigo">{out.periodStart}</td>
                      <td className="p-3 font-bold text-tinta">{out.workerName}</td>
                      <td className="p-3 text-teks-sekunder">{out.lineName}</td>
                      <td className="p-3">
                        <div className="font-semibold text-tinta">{out.componentName}</div>
                        <span className="font-mono text-[10px] text-teks-sekunder">{out.orderNumber}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-celup-indigo tabular-nums text-sm">
                        +{out.quantity} pcs
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleVerify(out.id)}
                          className="px-3 py-1 bg-status-lolos text-white font-bold text-xs rounded hover:bg-status-lolos/90 shadow-sm inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verifikasi Output</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Rakit Produk (Assembly) */}
      {canManage && (
        <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
          <div className="border-b border-garis pb-2">
            <h2 className="text-sm font-bold text-celup-indigo">Rakit Komponen Menjadi Produk Utuh (Assembly Meja)</h2>
            <p className="text-xs text-teks-sekunder">
              Penggabungan komponen yang selesai dijahit menjadi 1 tas utuh untuk dikirimkan ke Antrean Terminal QC
            </p>
          </div>

          <form onSubmit={handleAssemble} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-teks-sekunder block mb-1">Pilih Pesanan Siap Rakit:</label>
              <select
                value={assemblyOrderNum}
                onChange={(e) => setAssemblyOrderNum(e.target.value)}
                className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
              >
                {orders.map((o) => (
                  <option key={o.orderNumber} value={o.orderNumber}>
                    {o.orderNumber} — {o.article}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-teks-sekunder block mb-1">Jumlah Unit Dirakit:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={assemblyCount}
                onChange={(e) => setAssemblyCount(Number(e.target.value))}
                className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                required
              />
            </div>

            <div>
              <label className="font-bold text-teks-sekunder block mb-1">Meja / Tim Perakitan:</label>
              <input
                type="text"
                value={assembledBy}
                onChange={(e) => setAssembledBy(e.target.value)}
                className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-celup-indigo text-white font-bold rounded shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-kapur" />
                <span>Rakit &amp; Kirim ke QC</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
