"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Plus, 
  Check, 
  X, 
  ArrowRight, 
  Search, 
  Filter, 
  Building2, 
  PackageCheck, 
  Clock, 
  AlertCircle,
  FileText
} from "lucide-react";
import { 
  getAllMassOrders, 
  approveMassOrder, 
  rejectMassOrder, 
  createMassOrder, 
  getClients, 
  MassOrder, 
  ClientRecord 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function OrdersPage() {
  const { currentRole } = useRole();
  const [orders, setOrders] = useState<MassOrder[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "DONE" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for New Order
  const [form, setForm] = useState({
    clientCode: "SNOHUND",
    article: "Snøhund Tactical Daypack 28L",
    scheme: "FULL_PACKAGE" as "FULL_PACKAGE" | "SEMI_CMT" | "CMT",
    targetQty: 300,
    sellingPricePerUnit: 220000,
    inheritedVersion: "v1 (Approved)",
    inheritedSmv: "16m 45s",
    inheritedFabric: "1.25 m Cordura 1000D / pcs",
    notes: "Order pesanan massal dari katalog produk terdaftar.",
  });

  const loadData = () => {
    setOrders(getAllMassOrders());
    setClients(getClients());
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

  const handleApprove = (orderNumber: string) => {
    if (confirm(`Setujui pesanan massal ${orderNumber} sebagai Owner?\nProduk akan otomatis didaftarkan ke Katalog Produk dan PO bahan baku diterbitkan.`)) {
      approveMassOrder(orderNumber);
      alert(`Pesanan ${orderNumber} berhasil disetujui! Status aktif dan siap diproduksi.`);
    }
  };

  const handleReject = (orderNumber: string) => {
    const reason = prompt("Masukkan alasan penolakan pesanan:", "Spesifikasi harga atau kapasitas belum disetujui Owner");
    if (reason) {
      rejectMassOrder(orderNumber, reason);
      alert(`Pesanan ${orderNumber} telah ditolak.`);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => c.code === form.clientCode) || clients[0];
    
    createMassOrder({
      clientCode: selectedClient.code,
      clientName: selectedClient.name,
      clientType: selectedClient.type,
      article: form.article,
      scheme: form.scheme,
      targetQty: Number(form.targetQty),
      sellingPricePerUnit: Number(form.sellingPricePerUnit),
      inheritedVersion: form.inheritedVersion,
      inheritedSmv: form.inheritedSmv,
      inheritedFabric: form.inheritedFabric,
      notes: form.notes,
    });

    setShowCreateModal(false);
    alert(`Pesanan massal untuk ${selectedClient.name} berhasil dibuat! Menunggu persetujuan Owner.`);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.article.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "PENDING") return o.status === "PENDING_OWNER_APPROVAL";
    if (activeTab === "ACTIVE") return o.status === "APPROVED" || o.status === "IN_PRODUCTION" || o.status === "QC";
    if (activeTab === "DONE") return o.status === "DONE";
    if (activeTab === "REJECTED") return o.status === "REJECTED";
    return true;
  });

  const canApprove = currentRole === "OWNER";
  const canCreate = currentRole === "OWNER" || currentRole === "SAMPLE_TEAM";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-celup-indigo" />
            <span>Manajemen Pesanan Massal</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Pusat koordinasi pesanan produksi antar-fase, persetujuan Owner, dan alokasi skema maklon
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Buat Pesanan Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: "ALL", label: `Semua (${orders.length})` },
            { id: "PENDING", label: `Menunggu Approval (${orders.filter((o) => o.status === "PENDING_OWNER_APPROVAL").length})` },
            { id: "ACTIVE", label: `Aktif & Produksi (${orders.filter((o) => o.status === "APPROVED" || o.status === "IN_PRODUCTION" || o.status === "QC").length})` },
            { id: "DONE", label: `Selesai (${orders.filter((o) => o.status === "DONE").length})` },
            { id: "REJECTED", label: `Ditolak (${orders.filter((o) => o.status === "REJECTED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-field transition-all ${
                activeTab === tab.id
                  ? "bg-celup-indigo text-white font-bold shadow-hard-indigo"
                  : "bg-kabut text-tinta hover:bg-garis"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Order, Klien, Artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-work border border-dashed border-garis p-12 text-center shadow-hard">
          <p className="text-sm font-semibold text-teks-sekunder">Tidak ada pesanan yang sesuai filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-work border border-garis shadow-hard overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">No. Order</th>
                  <th className="p-3.5">Klien &amp; Tipe</th>
                  <th className="p-3.5">Artikel</th>
                  <th className="p-3.5">Skema</th>
                  <th className="p-3.5 text-right">Target</th>
                  <th className="p-3.5 text-right">Lolos QC</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "PENDING_OWNER_APPROVAL";
                  const isFullyCleared = (order.clearedQc || 0) >= order.targetQty;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-lembar/80 transition-colors ${
                        isPending ? "bg-amber-50/70" : ""
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-celup-indigo">
                        <Link href={`/orders/${order.orderNumber}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-tinta">{order.clientName}</div>
                        <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          order.clientType === "internal" ? "bg-celup-indigo/10 text-celup-indigo" : "bg-purple-100 text-purple-800"
                        }`}>
                          {order.clientType === "internal" ? "Internal" : "B2B Maklon"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-tinta max-w-xs truncate">{order.article}</div>
                        <div className="text-[10px] text-teks-sekunder">SMV: {order.inheritedSmv}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-kabut border border-garis text-celup-indigo">
                          {order.scheme}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-tinta tabular-nums">
                        {order.targetQty.toLocaleString("id-ID")}
                      </td>

                      <td className="p-3.5 text-right font-mono tabular-nums">
                        <span className={isFullyCleared ? "text-status-lolos font-bold" : "text-teks-sekunder"}>
                          {order.clearedQc || 0} / {order.targetQty}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {order.status === "PENDING_OWNER_APPROVAL" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Owner</span>
                          </span>
                        )}
                        {order.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                            <Check className="w-3 h-3" />
                            <span>Disetujui</span>
                          </span>
                        )}
                        {order.status === "IN_PRODUCTION" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <span>Lini Produksi</span>
                          </span>
                        )}
                        {order.status === "QC" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                            <span>Menunggu QC</span>
                          </span>
                        )}
                        {order.status === "DONE" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-lolos bg-status-lolos/15 px-2 py-0.5 rounded-full border border-status-lolos/30">
                            <PackageCheck className="w-3 h-3" />
                            <span>Selesai (Done)</span>
                          </span>
                        )}
                        {order.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-cacat bg-status-cacat/10 px-2 py-0.5 rounded-full border border-status-cacat/30">
                            <X className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-teks-sekunder font-mono text-[11px]">
                        {order.createdAt}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(order.orderNumber)}
                                className="px-2.5 py-1 bg-status-lolos text-white font-bold text-[11px] rounded hover:bg-status-lolos/90 shadow-sm flex items-center gap-1"
                                title="Setujui Pesanan Massal"
                              >
                                <Check className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => handleReject(order.orderNumber)}
                                className="px-2 py-1 bg-status-cacat text-white font-bold text-[11px] rounded hover:bg-status-cacat/90 shadow-sm flex items-center gap-1"
                                title="Tolak Pesanan"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="px-2.5 py-1 bg-kabut text-celup-indigo font-bold text-[11px] rounded hover:bg-garis flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Buat Pesanan Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Buat Pesanan Produksi Baru</h3>
                <p className="text-xs text-white/80">Input pesanan massal dari katalog atau spesifikasi sampel</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Pilih Klien:</label>
                  <select
                    value={form.clientCode}
                    onChange={(e) => setForm({ ...form, clientCode: e.target.value })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    {clients.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.type === "internal" ? "Internal" : "B2B"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Skema Maklon:</label>
                  <select
                    value={form.scheme}
                    onChange={(e) => setForm({ ...form, scheme: e.target.value as any })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="FULL_PACKAGE">FULL_PACKAGE (100% Bahan Lukla)</option>
                    <option value="SEMI_CMT">SEMI_CMT (Bahan Klien + PO Lukla)</option>
                    <option value="CMT">CMT (100% Bahan Titipan Klien)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Artikel Garmen / Ransel:</label>
                <input
                  type="text"
                  value={form.article}
                  onChange={(e) => setForm({ ...form, article: e.target.value })}
                  className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Target Produksi (Pcs / Unit):</label>
                  <input
                    type="number"
                    value={form.targetQty}
                    onChange={(e) => setForm({ ...form, targetQty: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Harga Jual / Unit (Rp DPP):</label>
                  <input
                    type="number"
                    value={form.sellingPricePerUnit}
                    onChange={(e) => setForm({ ...form, sellingPricePerUnit: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Catatan Pesanan:</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-garis rounded p-2 text-tinta bg-lembar"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-garis">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-garis rounded font-semibold text-teks-sekunder hover:bg-kabut"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-celup-indigo text-white font-bold rounded shadow-hard hover:bg-celup-indigo/90"
                >
                  Terbitkan Pesanan ke Sistem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
