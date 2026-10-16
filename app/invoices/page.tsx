"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Building2, 
  Check, 
  X, 
  ArrowLeft,
  DollarSign,
  Plus,
  FileText
} from "lucide-react";
import { 
  getIssuedInvoices, 
  saveIssuedInvoice, 
  getAllMassOrders, 
  IssuedInvoiceRecord, 
  MassOrder 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function InvoicesPage() {
  const { currentRole } = useRole();
  const [invoices, setInvoices] = useState<IssuedInvoiceRecord[]>([]);
  const [orders, setOrders] = useState<MassOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<IssuedInvoiceRecord | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form State for manual issue
  const [form, setForm] = useState({
    orderNumber: "ORD-2026-002",
    pricePerUnit: 165000,
    quantity: 100,
    fulfillmentMethod: "SHIPPING" as "SHIPPING" | "PICKUP",
  });

  const loadData = () => {
    setInvoices(getIssuedInvoices());
    setOrders(getAllMassOrders().filter((o) => o.status === "DONE" || (o.clearedQc || 0) > 0));
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

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOrder = orders.find((o) => o.orderNumber === form.orderNumber) || orders[0];
    if (!selectedOrder) return;

    const nextSeq = invoices.length + 1;
    const invoiceNumber = `INV-2026-${String(nextSeq).padStart(3, "0")}`;
    const qty = Number(form.quantity);
    const price = Number(form.pricePerUnit);
    const subtotalWithoutPpn = qty * price;
    const ppnRate = 11;
    const ppnAmount = Math.round((subtotalWithoutPpn * ppnRate) / 100);
    const totalWithPpn = subtotalWithoutPpn + ppnAmount;

    const newInv: IssuedInvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      orderNumber: selectedOrder.orderNumber,
      clientCode: selectedOrder.clientCode,
      clientName: selectedOrder.clientName,
      articleName: selectedOrder.article,
      scheme: selectedOrder.scheme,
      quantity: qty,
      pricePerUnit: price,
      subtotalWithoutPpn,
      ppnRate,
      ppnAmount,
      totalWithPpn,
      fulfillmentMethod: form.fulfillmentMethod,
      paymentStatus: "UNPAID",
      issuedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    };

    saveIssuedInvoice(newInv);
    setShowIssueModal(false);
    alert(`Invoice ${newInv.invoiceNumber} berhasil diterbitkan dengan komponen PPN 11%!`);
    loadData();
  };

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.articleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canIssue = currentRole === "OWNER" || currentRole === "FINANCE_PAYROLL";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-celup-indigo" />
            <span>Faktur &amp; Invoice Resmi B2B</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Penerbitan faktur penagihan klien dengan rincian eksplisit Subtotal DPP, PPN 11%, dan Total Akhir
          </p>
        </div>

        {canIssue && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Terbitkan Invoice Baru</span>
          </button>
        )}
      </div>

      {/* Search & Info Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Invoice, pesanan, klien, atau artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
        <span className="text-xs font-semibold text-teks-sekunder hidden sm:inline">
          {invoices.length} Invoice Diterbitkan
        </span>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-work border border-dashed border-garis p-12 text-center shadow-hard space-y-2">
          <p className="text-sm font-semibold text-teks-sekunder">Belum ada invoice yang diterbitkan.</p>
          <p className="text-xs text-teks-sekunder">
            Invoice dapat diterbitkan dari halaman Detail Pesanan setelah barang lolos QC dan masuk Gudang Barang Jadi.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-work border border-garis shadow-hard overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">No. Invoice</th>
                  <th className="p-3.5">No. Pesanan</th>
                  <th className="p-3.5">Klien / Brand</th>
                  <th className="p-3.5 text-right">Qty (Unit)</th>
                  <th className="p-3.5 text-right">Subtotal (Tanpa PPN)</th>
                  <th className="p-3.5 text-right">PPN 11%</th>
                  <th className="p-3.5 text-right">Total (+ PPN 11%)</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-lembar transition-colors">
                    <td className="p-3.5 font-mono font-bold text-celup-indigo">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:underline text-left"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>

                    <td className="p-3.5 font-mono text-tinta">
                      <Link href={`/orders/${inv.orderNumber}`} className="hover:underline">
                        {inv.orderNumber}
                      </Link>
                    </td>

                    <td className="p-3.5 font-bold text-tinta">
                      {inv.clientName}
                    </td>

                    <td className="p-3.5 text-right font-mono tabular-nums font-semibold text-tinta">
                      {inv.quantity.toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5 text-right font-mono tabular-nums text-tinta">
                      Rp {inv.subtotalWithoutPpn.toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5 text-right font-mono tabular-nums text-amber-900 font-semibold">
                      + Rp {inv.ppnAmount.toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5 text-right font-mono tabular-nums font-black text-celup-indigo text-sm">
                      Rp {inv.totalWithPpn.toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5 text-teks-sekunder font-mono text-[11px]">
                      {inv.issuedAt}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 bg-celup-indigo text-white font-bold text-[11px] rounded hover:bg-celup-indigo/90 shadow-sm inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-kapur" />
                        <span>Cetak / Lihat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Print View: Dokumen Invoice Resmi */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white print:hidden">
              <span className="font-bold text-sm">Dokumen Invoice Resmi Lukla</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-kapur text-celup-indigo font-bold text-xs rounded flex items-center gap-1 hover:bg-kapur/90"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-8 space-y-6 text-xs text-tinta bg-white print:p-0">
              {/* Company Header */}
              <div className="flex items-start justify-between border-b-2 border-celup-indigo pb-6">
                <div>
                  <h2 className="text-xl font-black text-celup-indigo tracking-tight">LUKLA MANUFACTURING</h2>
                  <p className="text-xs text-teks-sekunder">Pabrik Garmen &amp; Perlengkapan Taktikal</p>
                  <p className="text-xs text-teks-sekunder mt-1">Jl. Raya Ciwidey Km 24, Kabupaten Bandung, Jawa Barat</p>
                  <p className="text-xs text-teks-sekunder">NPWP: 01.345.678.9-445.000 · Telp: (022) 595-8888</p>
                </div>

                <div className="text-right space-y-1">
                  <h3 className="text-xl font-black text-celup-indigo tracking-widest uppercase">FAKTUR / INVOICE</h3>
                  <div className="font-mono font-bold text-sm text-tinta">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-teks-sekunder">Tanggal: {selectedInvoice.issuedAt}</div>
                  <div className="font-mono text-[11px] text-teks-sekunder">Pesanan: {selectedInvoice.orderNumber}</div>
                </div>
              </div>

              {/* Tagihan Kepada */}
              <div className="grid grid-cols-2 gap-4 bg-lembar p-4 rounded border border-garis">
                <div>
                  <span className="text-teks-sekunder font-bold uppercase text-[10px] block mb-1">Diterbitkan Kepada:</span>
                  <div className="font-bold text-sm text-celup-indigo">{selectedInvoice.clientName}</div>
                  <div className="text-xs text-teks-sekunder mt-0.5">Kode Klien: {selectedInvoice.clientCode}</div>
                </div>

                <div className="text-right">
                  <span className="text-teks-sekunder font-bold uppercase text-[10px] block mb-1">Skema Operasi:</span>
                  <div className="font-mono font-bold text-xs text-celup-indigo">{selectedInvoice.scheme}</div>
                  <div className="text-xs text-teks-sekunder mt-0.5">Metode: {selectedInvoice.fulfillmentMethod}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left text-xs border border-garis">
                <thead className="bg-lembar border-b border-garis uppercase font-bold text-[10px] text-teks-sekunder">
                  <tr>
                    <th className="p-3">Deskripsi Produk</th>
                    <th className="p-3 text-right">Kuantitas</th>
                    <th className="p-3 text-right">Harga Satuan (DPP)</th>
                    <th className="p-3 text-right">Jumlah (DPP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  <tr>
                    <td className="p-3 font-bold text-tinta">
                      {selectedInvoice.articleName}
                      <span className="text-[10px] font-normal text-teks-sekunder block">
                        Pesanan Produksi Massal Ref: {selectedInvoice.orderNumber}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums font-semibold">
                      {selectedInvoice.quantity.toLocaleString("id-ID")} Unit
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      Rp {selectedInvoice.pricePerUnit.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums font-bold">
                      Rp {selectedInvoice.subtotalWithoutPpn.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Explicit Totals Breakdown: DPP, PPN 11%, Total Setelah PPN */}
              <div className="flex justify-end">
                <div className="w-72 bg-lembar p-4 rounded border border-garis space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-teks-sekunder">Subtotal (Dasar Pengenaan Pajak / DPP):</span>
                    <span className="font-bold text-tinta">Rp {selectedInvoice.subtotalWithoutPpn.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-amber-900 border-t border-garis/60 pt-1.5 font-bold">
                    <span>PPN (11%):</span>
                    <span>+ Rp {selectedInvoice.ppnAmount.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-sm font-black text-celup-indigo border-t-2 border-celup-indigo pt-2">
                    <span>Total Pembayaran (+ PPN):</span>
                    <span>Rp {selectedInvoice.totalWithPpn.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp & Bank Transfer */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-garis text-xs">
                <div>
                  <span className="font-bold text-teks-sekunder block mb-1">Instruksi Pembayaran Bank:</span>
                  <div className="text-teks-sekunder">Bank Mandiri Cabang Ciwidey</div>
                  <div className="font-mono font-bold text-tinta">No. Rek: 130-00-9876543-2</div>
                  <div className="text-teks-sekunder">Atas Nama: PT Lukla Tirta Manufaktur</div>
                </div>

                <div className="text-right space-y-8">
                  <div>
                    <span className="text-teks-sekunder block">Kabupaten Bandung, {selectedInvoice.issuedAt}</span>
                    <span className="font-bold text-celup-indigo">Bagian Keuangan &amp; Pajak Lukla</span>
                  </div>
                  <div className="font-bold text-tinta underline">( Ibu Sri Wahyuni )</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Terbitkan Invoice Baru */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Terbitkan Invoice Penagihan Baru</h3>
                <p className="text-xs text-white/80">Otomatis menghitung Subtotal DPP dan PPN 11%</p>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueInvoice} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Pilih Pesanan Selesai / Siap Invoice:</label>
                <select
                  value={form.orderNumber}
                  onChange={(e) => {
                    const sel = orders.find((o) => o.orderNumber === e.target.value);
                    setForm({
                      ...form,
                      orderNumber: e.target.value,
                      pricePerUnit: sel?.sellingPricePerUnit || 165000,
                      quantity: sel?.clearedQc || sel?.targetQty || 100,
                    });
                  }}
                  className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                >
                  {orders.map((o) => (
                    <option key={o.orderNumber} value={o.orderNumber}>
                      {o.orderNumber} — {o.clientName} ({o.article})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Jumlah Unit Ditagihkan:</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Harga Satuan DPP (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.pricePerUnit}
                    onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Metode Pengiriman:</label>
                <select
                  value={form.fulfillmentMethod}
                  onChange={(e) => setForm({ ...form, fulfillmentMethod: e.target.value as any })}
                  className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                >
                  <option value="SHIPPING">Pengiriman Ekspedisi Pabrik (Shipping)</option>
                  <option value="PICKUP">Pengambilan Mandiri oleh Klien (Pickup)</option>
                </select>
              </div>

              {/* Live Preview of PPN 11% */}
              <div className="bg-lembar p-3 rounded border border-garis font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-teks-sekunder">Subtotal DPP:</span>
                  <span>Rp {(form.quantity * form.pricePerUnit).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-amber-900 font-bold">
                  <span>PPN 11%:</span>
                  <span>+ Rp {Math.round((form.quantity * form.pricePerUnit * 11) / 100).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-celup-indigo font-black border-t border-garis pt-1">
                  <span>Total Faktur:</span>
                  <span>Rp {Math.round(form.quantity * form.pricePerUnit * 1.11).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-garis">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-garis rounded font-semibold text-teks-sekunder hover:bg-kabut"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-celup-indigo text-white font-bold rounded shadow-hard hover:bg-celup-indigo/90"
                >
                  Terbitkan Invoice Resmi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
