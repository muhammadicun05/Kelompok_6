"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Check, 
  X, 
  Search, 
  Filter, 
  Clock, 
  Building2, 
  Boxes, 
  ArrowLeft
} from "lucide-react";
import { 
  getPurchaseOrders, 
  addPurchaseOrder, 
  reviewPurchaseOrder, 
  getAllMassOrders, 
  getRawMaterialCatalog, 
  PurchaseOrderRecord 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function PurchaseOrdersPage() {
  const { currentRole } = useRole();
  const [poList, setPoList] = useState<PurchaseOrderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    orderNumber: "ORD-2026-004",
    clientName: "Snøhund Alpine Wear",
    supplierOrClient: "PT Tekstil Nusantara",
    rawMaterialSku: "RM-0001",
    itemName: "Cordura 1000D Tactical Waterproof",
    quantity: 500,
    unit: "Meter",
    docType: "SUPPLIER_PO" as "SUPPLIER_PO" | "CLIENT_COMMITMENT",
    notes: "Pengadaan bahan baku produksi massal",
  });

  const loadData = () => {
    setPoList(getPurchaseOrders());
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

  const handleReview = (poId: string, decision: "APPROVED" | "REJECTED") => {
    const notes = prompt(`Masukkan catatan review ${decision === "APPROVED" ? "persetujuan" : "penolakan"} PO:`, decision === "APPROVED" ? "Disetujui Finance — harga & jadwal kirim sesuai" : "Harga melebihi anggaran");
    if (notes !== null) {
      reviewPurchaseOrder(poId, decision, notes);
      alert(`PO berhasil di-${decision === "APPROVED" ? "setujui" : "tolak"}!`);
      loadData();
    }
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const newPo: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      poNumber: form.docType === "CLIENT_COMMITMENT"
        ? `CMT-COM-2026-${Math.floor(100 + Math.random() * 900)}`
        : `PO-SUP-2026-${Math.floor(100 + Math.random() * 900)}`,
      docType: form.docType,
      orderNumber: form.orderNumber,
      clientName: form.clientName,
      supplierOrClient: form.supplierOrClient,
      rawMaterialSku: form.rawMaterialSku,
      itemName: form.itemName,
      quantity: Number(form.quantity),
      unit: form.unit,
      status: "PENDING",
      notes: form.notes,
      createdBy: currentRole,
      createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    };

    addPurchaseOrder(newPo);
    setShowModal(false);
    alert(`Purchase Order ${newPo.poNumber} berhasil diajukan! Menunggu review Finance.`);
  };

  const filteredList = poList.filter((p) => {
    const matchesSearch =
      p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierOrClient.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "PENDING") return p.status === "PENDING";
    if (activeTab === "APPROVED") return p.status === "APPROVED";
    if (activeTab === "REJECTED") return p.status === "REJECTED";
    return true;
  });

  const pendingCount = poList.filter((p) => p.status === "PENDING").length;
  const canReview = currentRole === "OWNER" || currentRole === "FINANCE_PAYROLL";
  const canCreate = currentRole === "OWNER" || currentRole === "WAREHOUSE" || currentRole === "SAMPLE_TEAM";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/warehouse" className="text-xs font-bold text-teks-sekunder hover:text-celup-indigo flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gudang</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <FileText className="w-6 h-6 text-celup-indigo" />
            <span>Purchase Order Bahan Baku &amp; Komitmen Klien</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Pengadaan bahan baku resmi supplier (Full-Package / Semi-CMT) dan PO Komitmen Klien titipan (CMT - Aturan #5)
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Ajukan PO Bahan</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: "ALL", label: `Semua PO (${poList.length})` },
            { id: "PENDING", label: `Menunggu Review (${pendingCount})` },
            { id: "APPROVED", label: `Disetujui (${poList.filter((p) => p.status === "APPROVED").length})` },
            { id: "REJECTED", label: `Ditolak (${poList.filter((p) => p.status === "REJECTED").length})` },
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
            placeholder="Cari No. PO, bahan, supplier, pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
      </div>

      {/* PO Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-work border border-dashed border-garis p-12 text-center shadow-hard">
          <p className="text-sm font-semibold text-teks-sekunder">Belum ada Purchase Order yang sesuai filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((po) => {
            const isPending = po.status === "PENDING";
            return (
              <div
                key={po.id}
                className={`bg-white rounded-work border p-5 shadow-hard transition-all ${
                  isPending ? "border-amber-300 bg-amber-50/20" : "border-garis"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-celup-indigo">{po.poNumber}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        po.status === "APPROVED" ? "bg-status-lolos/15 text-status-lolos border border-status-lolos/30" :
                        po.status === "REJECTED" ? "bg-status-cacat/10 text-status-cacat border border-status-cacat/30" :
                        "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}>
                        {po.status === "APPROVED" ? "Disetujui" : po.status === "REJECTED" ? "Ditolak" : "Menunggu Review Finance"}
                      </span>

                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-kabut text-celup-indigo">
                        {po.docType === "CLIENT_COMMITMENT" ? "Surat Komitmen Bahan Klien" : "PO Supplier Resmi"}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-tinta">{po.itemName}</h3>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-teks-sekunder">
                      <span>SKU: <strong className="font-mono text-tinta">{po.rawMaterialSku || "—"}</strong></span>
                      <span>Jumlah: <strong className="font-mono text-celup-indigo">{po.quantity.toLocaleString("id-ID")} {po.unit}</strong></span>
                      <span>Terkait Pesanan: <strong className="font-mono text-tinta">{po.orderNumber}</strong></span>
                      <span>Pihak: <strong className="text-tinta">{po.supplierOrClient}</strong></span>
                      <span>Diajukan: {po.createdAt} oleh {po.createdBy}</span>
                    </div>

                    {po.notes && (
                      <p className="text-xs text-tinta bg-lembar p-2.5 rounded border border-garis">
                        📝 {po.notes}
                      </p>
                    )}

                    {po.reviewNotes && (
                      <p className={`text-xs font-semibold p-2.5 rounded border ${
                        po.status === "APPROVED"
                          ? "bg-status-lolos/10 text-status-lolos border-status-lolos/30"
                          : "bg-status-cacat/10 text-status-cacat border-status-cacat/30"
                      }`}>
                        💬 Catatan Review Finance: {po.reviewNotes}
                      </p>
                    )}
                  </div>

                  {/* Finance Action Controls */}
                  {canReview && isPending && (
                    <div className="bg-amber-50 border border-amber-200 rounded-work p-3.5 space-y-2 lg:min-w-[220px] self-start">
                      <span className="text-[11px] font-bold text-amber-900 block">
                        Tindakan Finance / Owner:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleReview(po.id, "APPROVED")}
                          className="w-full py-1.5 bg-status-lolos text-white font-bold text-xs rounded hover:bg-status-lolos/90 shadow-sm flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui PO Bahan</span>
                        </button>
                        <button
                          onClick={() => handleReview(po.id, "REJECTED")}
                          className="w-full py-1.5 bg-status-cacat text-white font-bold text-xs rounded hover:bg-status-cacat/90 shadow-sm flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak Pengajuan</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Ajukan PO Bahan Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Ajukan Purchase Order Bahan</h3>
                <p className="text-xs text-white/80">Pengadaan bahan pendukung atau komitmen titipan klien</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Tipe Dokumen:</label>
                  <select
                    value={form.docType}
                    onChange={(e) => setForm({ ...form, docType: e.target.value as any })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="SUPPLIER_PO">PO Pembelian Supplier (Lukla)</option>
                    <option value="CLIENT_COMMITMENT">Komitmen Bahan Klien (CMT Rule #5)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Nomor Pesanan Terkait:</label>
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-celup-indigo bg-lembar"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Pihak (Supplier / Klien):</label>
                <input
                  type="text"
                  value={form.supplierOrClient}
                  onChange={(e) => setForm({ ...form, supplierOrClient: e.target.value })}
                  className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Bahan / Aksesori:</label>
                <input
                  type="text"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Jumlah Diadakan:</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Satuan:</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="Meter">Meter</option>
                    <option value="Yard">Yard</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Roll">Roll</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Catatan Tambahan:</label>
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-garis rounded font-semibold text-teks-sekunder hover:bg-kabut"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-celup-indigo text-white font-bold rounded shadow-hard hover:bg-celup-indigo/90"
                >
                  Ajukan PO ke Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
