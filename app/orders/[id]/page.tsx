"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ClipboardList, 
  ArrowLeft, 
  Check, 
  X, 
  PackageCheck, 
  Layers, 
  FileSpreadsheet, 
  Printer, 
  Building2, 
  Clock, 
  AlertTriangle,
  Boxes
} from "lucide-react";
import { 
  getOrderByIdOrRef, 
  approveMassOrder, 
  rejectMassOrder, 
  markMassOrderDone, 
  issueInvoiceFromOrder, 
  getIssuedInvoices, 
  getPurchaseOrders, 
  MassOrder, 
  IssuedInvoiceRecord, 
  PurchaseOrderRecord 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentRole } = useRole();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<MassOrder | null>(null);
  const [invoice, setInvoice] = useState<IssuedInvoiceRecord | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);

  const loadData = () => {
    const o = getOrderByIdOrRef(orderId);
    if (o) {
      setOrder(o);
      const invoices = getIssuedInvoices();
      const inv = invoices.find((i) => i.orderNumber === o.orderNumber) || null;
      setInvoice(inv);

      const pos = getPurchaseOrders().filter((p) => p.orderNumber === o.orderNumber);
      setPurchaseOrders(pos);
    }
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
  }, [orderId]);

  if (!order) {
    return (
      <div className="bg-white rounded-work border border-garis p-12 text-center shadow-hard space-y-4">
        <p className="text-sm font-bold text-celup-indigo">Pesanan tidak ditemukan</p>
        <Link href="/orders" className="inline-block px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work">
          ← Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const isPendingApproval = order.status === "PENDING_OWNER_APPROVAL";
  const canApprove = currentRole === "OWNER";
  const canMarkDone = currentRole === "OWNER" || currentRole === "PRODUCTION_HEAD_MANDOR";
  const canIssueInvoice = currentRole === "OWNER" || currentRole === "FINANCE_PAYROLL";

  const clearedQc = order.clearedQc || 0;
  const isTargetCleared = clearedQc >= order.targetQty;
  const totalValue = (order.sellingPricePerUnit || 245000) * order.targetQty;

  const handleApprove = () => {
    if (confirm(`Setujui pesanan massal ${order.orderNumber}?\nProduk akan otomatis didaftarkan ke Katalog Produk dan PO bahan baku diterbitkan.`)) {
      approveMassOrder(order.orderNumber);
      alert(`Pesanan ${order.orderNumber} telah disetujui Owner!`);
      loadData();
    }
  };

  const handleReject = () => {
    const reason = prompt("Masukkan alasan penolakan pesanan:", "Spesifikasi harga atau kapasitas belum disetujui Owner");
    if (reason) {
      rejectMassOrder(order.orderNumber, reason);
      alert(`Pesanan ${order.orderNumber} telah ditolak.`);
      loadData();
    }
  };

  const handleMarkDone = () => {
    if (confirm(`Tandai pesanan ${order.orderNumber} sebagai Selesai (Done)?\nSeluruh unit target telah tuntas QC dan siap diterbitkan invoice resmi.`)) {
      markMassOrderDone(order.orderNumber);
      alert(`Pesanan ${order.orderNumber} kini berstatus SELESAI (DONE)!`);
      loadData();
    }
  };

  const handleIssueInvoice = () => {
    const issued = issueInvoiceFromOrder(order.orderNumber);
    if (issued) {
      alert(`Invoice resmi ${issued.invoiceNumber} berhasil diterbitkan dengan komponen PPN 11%!\nSubtotal: Rp ${issued.subtotalWithoutPpn.toLocaleString("id-ID")}\nPPN 11%: Rp ${issued.ppnAmount.toLocaleString("id-ID")}\nTotal: Rp ${issued.totalWithPpn.toLocaleString("id-ID")}`);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-garis pb-4">
        <div>
          <Link href="/orders" className="text-xs font-bold text-teks-sekunder hover:text-celup-indigo flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Pesanan</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-celup-indigo font-mono">{order.orderNumber}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              order.status === "PENDING_OWNER_APPROVAL" ? "bg-amber-100 text-amber-900 border border-amber-300" :
              order.status === "DONE" ? "bg-status-lolos/15 text-status-lolos border border-status-lolos/30" :
              order.status === "REJECTED" ? "bg-status-cacat/10 text-status-cacat border border-status-cacat/30" :
              "bg-blue-100 text-blue-900 border border-blue-300"
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-teks-sekunder mt-1">
            {order.clientName} · Skema {order.scheme} · Target {order.targetQty} unit
          </p>
        </div>

        {order.productCatalogId && (
          <Link
            href="/catalog"
            className="px-3 py-1.5 bg-kabut border border-garis rounded-field text-xs font-bold text-celup-indigo hover:bg-garis flex items-center gap-1 self-start sm:self-auto"
          >
            <Layers className="w-4 h-4" />
            <span>Lihat di Katalog Produk →</span>
          </Link>
        )}
      </div>

      {/* Main Grid: Left (2 cols) & Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owner Approval Banner */}
          {isPendingApproval && canApprove && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-work p-5 shadow-hard space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-700" />
                <span>Menunggu Persetujuan Owner (Fase 2 BPMN)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Pesanan massal ini telah diterbitkan oleh Tim Sampler dari hasil uji versi sampel disetujui.
                Setujui untuk mengaktifkan order ke Meja Potong Gudang, menerbitkan PO bahan baku otomatis dari BOM, dan mendaftarkan artikel ke Katalog Produk.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-status-lolos text-white font-bold text-xs rounded-work shadow-hard hover:bg-status-lolos/90 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui Pesanan &amp; Aktifkan Produksi</span>
                </button>
                <button
                  onClick={handleReject}
                  className="px-3.5 py-2 bg-status-cacat text-white font-bold text-xs rounded-work shadow-hard hover:bg-status-cacat/90 flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Tolak Pesanan</span>
                </button>
              </div>
            </div>
          )}

          {/* Order Summary Card */}
          <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-4">
            <h2 className="text-sm font-bold text-celup-indigo border-b border-garis pb-2">
              Spesifikasi &amp; Rincian Pesanan
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-teks-sekunder font-semibold">Nama Klien / Brand</dt>
                <dd className="font-bold text-tinta text-sm mt-0.5">{order.clientName}</dd>
                <span className="text-[10px] text-celup-indigo font-mono">Kode: {order.clientCode}</span>
              </div>

              <div>
                <dt className="text-teks-sekunder font-semibold">Skema Operasional Maklon</dt>
                <dd className="font-mono font-bold text-celup-indigo text-sm mt-0.5">{order.scheme}</dd>
                <span className="text-[10px] text-teks-sekunder">
                  {order.scheme === "FULL_PACKAGE" && "100% Bahan Baku & Produksi dari Lukla"}
                  {order.scheme === "SEMI_CMT" && "Bahan Utama Titipan Klien + Aksesori PO Lukla"}
                  {order.scheme === "CMT" && "100% Bahan Titipan Klien (Inbound Surat Jalan)"}
                </span>
              </div>

              <div>
                <dt className="text-teks-sekunder font-semibold">Artikel Produk</dt>
                <dd className="font-bold text-tinta mt-0.5">{order.article}</dd>
                <span className="text-[10px] text-teks-sekunder">Mewarisi versi: {order.inheritedVersion}</span>
              </div>

              <div>
                <dt className="text-teks-sekunder font-semibold">Studi Waktu Standar (SMV)</dt>
                <dd className="font-mono font-bold text-tinta text-sm mt-0.5">{order.inheritedSmv}</dd>
                <span className="text-[10px] text-teks-sekunder">Berdasarkan Digital Stopwatch Studio Sampel</span>
              </div>

              <div>
                <dt className="text-teks-sekunder font-semibold">Harga Jual / Unit (DPP)</dt>
                <dd className="font-mono font-bold text-tinta text-sm mt-0.5">
                  Rp {(order.sellingPricePerUnit || 245000).toLocaleString("id-ID")}
                </dd>
                <span className="text-[10px] text-teks-sekunder">Belum termasuk PPN 11%</span>
              </div>

              <div>
                <dt className="text-teks-sekunder font-semibold">Total Nilai Pesanan (DPP)</dt>
                <dd className="font-mono font-black text-celup-indigo text-base mt-0.5">
                  Rp {totalValue.toLocaleString("id-ID")}
                </dd>
                <span className="text-[10px] text-teks-sekunder">
                  + PPN 11%: Rp {Math.round((totalValue * 11) / 100).toLocaleString("id-ID")}
                </span>
              </div>
            </dl>

            {order.notes && (
              <div className="pt-3 border-t border-garis">
                <span className="text-teks-sekunder font-semibold block text-[11px] mb-1">Catatan Operasional:</span>
                <p className="text-xs text-tinta bg-lembar p-2.5 rounded border border-garis leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}

            {order.rejectionReason && (
              <div className="pt-3 border-t border-status-cacat/30 bg-status-cacat/5 p-3 rounded">
                <span className="text-status-cacat font-bold block text-[11px] mb-1">Alasan Penolakan Owner:</span>
                <p className="text-xs text-status-cacat font-medium">
                  {order.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Kebutuhan Bahan Baku (BOM Table) */}
          <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-3">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <div>
                <h2 className="text-sm font-bold text-celup-indigo">Kebutuhan Bahan Baku (BOM Pesanan)</h2>
                <p className="text-xs text-teks-sekunder">Alokasi bahan baku untuk target {order.targetQty} unit</p>
              </div>
              <span className="font-mono text-xs text-celup-indigo font-bold bg-kabut px-2 py-0.5 rounded">
                {order.scheme}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2.5">Bahan / Item</th>
                    <th className="p-2.5">SKU Tag</th>
                    <th className="p-2.5 text-right">Konsumsi / Unit</th>
                    <th className="p-2.5 text-right">Total Kebutuhan</th>
                    <th className="p-2.5">Status Pengadaan / PO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  <tr>
                    <td className="p-2.5 font-bold text-tinta">Cordura 1000D Tactical Waterproof</td>
                    <td className="p-2.5 font-mono text-teks-sekunder">RM-0001</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">1.45 Meter</td>
                    <td className="p-2.5 text-right font-mono font-bold text-celup-indigo tabular-nums">
                      {Math.round(order.targetQty * 1.45)} Meter
                    </td>
                    <td className="p-2.5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-status-lolos/15 text-status-lolos">
                        Tersedia di Gudang (Anti-Kontaminasi Lolos)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-tinta">Busa Padding EVA 15mm</td>
                    <td className="p-2.5 font-mono text-teks-sekunder">RM-0002</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">0.40 Meter</td>
                    <td className="p-2.5 text-right font-mono font-bold text-celup-indigo tabular-nums">
                      {Math.round(order.targetQty * 0.4)} Meter
                    </td>
                    <td className="p-2.5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-status-lolos/15 text-status-lolos">
                        Tersedia di Gudang
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-tinta">Resleting YKK Waterproof #10</td>
                    <td className="p-2.5 font-mono text-teks-sekunder">RM-0003</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">2 Pcs</td>
                    <td className="p-2.5 text-right font-mono font-bold text-celup-indigo tabular-nums">
                      {order.targetQty * 2} Pcs
                    </td>
                    <td className="p-2.5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        PO Bahan Diterbitkan
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Status Penyelesaian, Invoicing, Linked Assets */}
        <div className="space-y-6">
          {/* Card: Status Penyelesaian (Completion) */}
          <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-3">
            <h2 className="text-sm font-bold text-celup-indigo border-b border-garis pb-2">
              Status Penyelesaian Pesanan
            </h2>

            <div className="flex items-center justify-between text-xs">
              <span className="text-teks-sekunder">Lolos Inspeksi QC:</span>
              <span className="font-mono font-black text-sm text-celup-indigo">
                {clearedQc} / {order.targetQty} unit
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-kabut h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-status-lolos h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((clearedQc / order.targetQty) * 100))}%` }}
              />
            </div>

            <p className="text-[11px] text-teks-sekunder">
              {isTargetCleared
                ? "Seluruh target unit pesanan telah lolos inspeksi QC."
                : `Masih dibutuhkan ${order.targetQty - clearedQc} unit lolos QC untuk menyelesaikan pesanan.`}
            </p>

            {canMarkDone && order.status !== "DONE" && (
              <button
                disabled={!isTargetCleared}
                onClick={handleMarkDone}
                className={`w-full py-2.5 rounded-field font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isTargetCleared
                    ? "bg-celup-indigo text-white shadow-hard hover:bg-celup-indigo/90"
                    : "bg-kabut text-teks-sekunder border border-garis cursor-not-allowed"
                }`}
              >
                <PackageCheck className="w-4 h-4 text-kapur" />
                <span>Tandai Pesanan Selesai (Done)</span>
              </button>
            )}
          </div>

          {/* Card: Invoicing Resmi dengan PPN 11% */}
          <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-3">
            <h2 className="text-sm font-bold text-celup-indigo border-b border-garis pb-2 flex items-center justify-between">
              <span>Invoice Tagihan B2B</span>
              <FileSpreadsheet className="w-4 h-4 text-celup-indigo" />
            </h2>

            {invoice ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-lembar rounded border border-garis space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">No. Invoice:</span>
                    <span className="font-bold text-celup-indigo">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">Subtotal (DPP):</span>
                    <span className="font-semibold text-tinta">Rp {invoice.subtotalWithoutPpn.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-amber-900">
                    <span>PPN 11%:</span>
                    <span className="font-semibold">+ Rp {invoice.ppnAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between border-t border-garis pt-1 text-sm font-black text-celup-indigo">
                    <span>Total Tagihan:</span>
                    <span>Rp {invoice.totalWithPpn.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/invoices`}
                    className="flex-1 py-2 bg-celup-indigo text-white text-center font-bold text-xs rounded-field hover:bg-celup-indigo/90 shadow-sm flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Unduh PDF</span>
                  </Link>
                </div>
              </div>
            ) : canIssueInvoice ? (
              <div className="space-y-3 text-xs">
                <p className="text-teks-sekunder leading-relaxed">
                  Invoice resmi dapat diterbitkan oleh Finance atau Owner saat pesanan selesai diproduksi.
                </p>

                <button
                  onClick={handleIssueInvoice}
                  className="w-full py-2 bg-kapur text-celup-indigo font-bold text-xs rounded-field shadow-hard hover:bg-kapur/90 flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-celup-indigo" />
                  <span>Terbitkan Invoice (PPN 11%)</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-teks-sekunder">
                Invoice belum diterbitkan oleh bagian Finance.
              </p>
            )}
          </div>

          {/* Card: Purchase Orders Terkait */}
          <div className="bg-white p-5 rounded-work border border-garis shadow-hard space-y-3">
            <h2 className="text-sm font-bold text-celup-indigo border-b border-garis pb-2">
              Purchase Order Terkait
            </h2>

            {purchaseOrders.length === 0 ? (
              <p className="text-xs text-teks-sekunder">Belum ada PO bahan untuk pesanan ini.</p>
            ) : (
              <div className="space-y-2">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="p-2.5 rounded bg-lembar border border-garis text-xs flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-celup-indigo">{po.poNumber}</div>
                      <div className="text-[10px] text-teks-sekunder">{po.itemName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      po.status === "APPROVED" ? "bg-status-lolos/15 text-status-lolos" : "bg-amber-100 text-amber-800"
                    }`}>
                      {po.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
