"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Package, 
  ExternalLink,
  ShieldCheck,
  Send,
  Receipt
} from "lucide-react";
import { ClientTag } from "@/components/Design/ThreadEdge";
import { 
  getIssuedInvoices, 
  getFinishedGoods, 
  getPurchaseOrders, 
  IssuedInvoiceRecord, 
  FinishedGoodRecord, 
  PurchaseOrderRecord 
} from "@/lib/dataBus";

const PHASES = [
  { num: 1, name: "Sampel & Studi Waktu (SMV)", status: "COMPLETED", date: "10 Okt" },
  { num: 2, name: "Persetujuan Pesanan & PO Komitmen", status: "COMPLETED", date: "12 Okt" },
  { num: 3, name: "Gudang & Penerimaan Kain Titipan", status: "COMPLETED", date: "13 Okt" },
  { num: 4, name: "Lini Jahit & Assembly", status: "IN_PROGRESS", date: "Sedang Berjalan (65%)" },
  { num: 5, name: "Inspeksi QC Produk Utuh (Pass / Repair)", status: "WAITING", date: "Menunggu Selesai Jahit" },
  { num: 6, name: "Gudang Barang Jadi & Tagihan (PPN 11%)", status: "WAITING", date: "Target 20 Okt" },
];

export default function B2bPortalPage() {
  const [activeTab, setActiveTab] = useState<"PROGRESS" | "FABRIC" | "PO" | "INVOICES">("PROGRESS");
  const [invoices, setInvoices] = useState<IssuedInvoiceRecord[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodRecord[]>([]);
  const [pos, setPos] = useState<PurchaseOrderRecord[]>([]);

  useEffect(() => {
    const syncPortal = () => {
      setInvoices(getIssuedInvoices());
      setFinishedGoods(getFinishedGoods());
      setPos(getPurchaseOrders());
    };
    syncPortal();
    window.addEventListener("lukla_bus_update", syncPortal);
    window.addEventListener("storage", syncPortal);
    return () => {
      window.removeEventListener("lukla_bus_update", syncPortal);
      window.removeEventListener("storage", syncPortal);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClientTag clientCode="KLIEN_A" clientName="PT Bandung Apparel" />
            <span className="text-xs px-2 py-0.5 rounded bg-kabut font-semibold text-teks-sekunder">
              Portal Klien B2B Terisolasi
            </span>
          </div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight mt-1">
            Status Pesanan: ORD-2026-002 & ORD-2026-003
          </h1>
          <p className="text-xs text-teks-sekunder">
            Artikel: <strong>Urban Commuter Roll-Top Backpack 25L</strong> • Skema: <strong>CMT / SEMI_CMT</strong> • Target: <strong>1.200 pcs</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-field bg-white border border-garis text-status-lolos text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-status-lolos" />
            <span>Akses Terverifikasi</span>
          </span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex gap-2 border-b border-garis pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("PROGRESS")}
          className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-work border-b-2 transition-all whitespace-nowrap ${
            activeTab === "PROGRESS"
              ? "border-celup-indigo text-celup-indigo bg-white"
              : "border-transparent text-teks-sekunder hover:text-celup-indigo"
          }`}
        >
          1. Timeline 6 Fase & Gudang Barang Jadi
        </button>
        <button
          onClick={() => setActiveTab("FABRIC")}
          className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-work border-b-2 transition-all whitespace-nowrap ${
            activeTab === "FABRIC"
              ? "border-celup-indigo text-celup-indigo bg-white"
              : "border-transparent text-teks-sekunder hover:text-celup-indigo"
          }`}
        >
          2. Saldo Kain Titipan di Gudang
        </button>
        <button
          onClick={() => setActiveTab("PO")}
          className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-work border-b-2 transition-all whitespace-nowrap ${
            activeTab === "PO"
              ? "border-celup-indigo text-celup-indigo bg-white"
              : "border-transparent text-teks-sekunder hover:text-celup-indigo"
          }`}
        >
          3. PO Komitmen & Tracking CMT
        </button>
        <button
          onClick={() => setActiveTab("INVOICES")}
          className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-work border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "INVOICES"
              ? "border-celup-indigo text-celup-indigo bg-white"
              : "border-transparent text-teks-sekunder hover:text-celup-indigo"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>4. Tagihan & Invoice Resmi (PPN 11%)</span>
        </button>
      </div>

      {/* Tab 1: Timeline 6 Fase */}
      {activeTab === "PROGRESS" && (
        <div className="bg-lembar p-6 rounded-work border border-garis shadow-hard space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-garis pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Alur Kerja Produksi Massal (BPMN 6 Fase)
              </h2>
              <span className="text-xs text-teks-sekunder">
                Pembaruan data otomatis dan langsung dari lantai pabrik & Gudang Barang Jadi
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-teks-sekunder block">Barang Jadi Tersimpan di Gudang (`STORED`):</span>
              <span className="text-lg font-extrabold text-status-lolos font-mono">
                {finishedGoods.filter((f) => f.status === "STORED").length} Unit Serial Siap Kirim
              </span>
            </div>
          </div>

          {/* Sequential 6-Phase Stepper */}
          <div className="space-y-4">
            {PHASES.map((phase) => {
              const isDone = phase.status === "COMPLETED";
              const isCurrent = phase.status === "IN_PROGRESS";

              return (
                <div
                  key={phase.num}
                  className={`p-4 rounded-field border flex items-center justify-between transition-all ${
                    isCurrent
                      ? "bg-white border-2 border-celup-indigo shadow-md"
                      : isDone
                      ? "bg-white/80 border-garis"
                      : "bg-kabut/40 border-garis opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone
                          ? "bg-status-lolos text-white"
                          : isCurrent
                          ? "bg-kapur text-celup-indigo border border-celup-indigo font-extrabold"
                          : "bg-kabut text-teks-sekunder border border-garis"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : phase.num}
                    </div>

                    <div>
                      <h3
                        className={`text-xs font-bold ${
                          isCurrent ? "text-celup-indigo text-sm" : "text-tinta"
                        }`}
                      >
                        Fase {phase.num}: {phase.name}
                      </h3>
                      <span className="text-[11px] text-teks-sekunder block">
                        {phase.date}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isDone && (
                      <span className="px-2.5 py-1 rounded bg-status-lolos text-white text-[10px] font-bold">
                        Selesai
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded bg-kapur text-celup-indigo font-extrabold text-[10px] border border-celup-indigo animate-pulse">
                        Sedang Berjalan
                      </span>
                    )}
                    {!isDone && !isCurrent && (
                      <span className="px-2.5 py-1 rounded bg-kabut text-teks-sekunder text-[10px] font-medium">
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Sisa Saldo Kain Titipan di Gudang */}
      {activeTab === "FABRIC" && (
        <div className="bg-lembar p-6 rounded-work border border-garis shadow-hard space-y-4">
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Saldo Kain Titipan Klien di Gudang Lukla
              </h2>
              <span className="text-xs text-teks-sekunder">
                Pencatatan real-time saat bahan dipotong di Cutting
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-garis text-celup-indigo">
              Lokasi: Ciwidey Rack B-03
            </span>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-garis text-left text-teks-sekunder">
                <th className="py-2.5">Tag QR Bahan</th>
                <th className="py-2.5">Jenis Kain Titipan</th>
                <th className="py-2.5 text-right">Total Dikirim</th>
                <th className="py-2.5 text-right">Terpakai Cutting</th>
                <th className="py-2.5 text-right">Sisa Bersih di Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              <tr className="hover:bg-white">
                <td className="py-3 font-mono font-bold text-celup-indigo">RAW-KLA-CORDURA-01</td>
                <td className="py-3 font-semibold text-tinta">Cordura 1000D Waterproof Black Olive</td>
                <td className="py-3 text-right font-mono tabular-nums">1.500 Yard</td>
                <td className="py-3 text-right font-mono tabular-nums text-teks-sekunder">100 Yard</td>
                <td className="py-3 text-right font-mono font-extrabold text-status-lolos tabular-nums">
                  1.400 Yard
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-[11px] text-teks-sekunder p-3 bg-white rounded border border-garis">
            ℹ️ Sesuai <strong>Asumsi #9</strong>: Bahan yang dikeluarkan diasumsikan pas dan terkonversi sempurna sesuai pesanan (*zero remnant/shortage*).
          </div>
        </div>
      )}

      {/* Tab 3: CMT PO Commitment & Reminder */}
      {activeTab === "PO" && (
        <div className="bg-lembar p-6 rounded-work border border-garis shadow-hard space-y-4">
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Surat Komitmen & Pengingat PO CMT (Asumsi #5)
              </h2>
              <span className="text-xs text-teks-sekunder">
                Mekanisme tracking komitmen pengiriman bahan titipan klien
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-status-lolos text-white">
              PO Terkonfirmasi
            </span>
          </div>

          <div className="bg-white p-4 rounded-field border border-garis space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-garis pb-3">
              <div>
                <span className="text-teks-sekunder block">Nomor PO Komitmen:</span>
                <span className="font-mono font-bold text-celup-indigo text-sm">
                  CMT-PO-2026-0002
                </span>
              </div>
              <div className="text-right">
                <span className="text-teks-sekunder block">Tanggal Komitmen Pengiriman:</span>
                <span className="font-mono font-bold text-tinta">12 Okt 2026 (Tepat Waktu)</span>
              </div>
            </div>

            <p className="text-teks-sekunder leading-relaxed">
              <strong>Aturan Bisnis Resmi:</strong> Pada skema maklon murni (CMT), Lukla tetap menerbitkan Purchase Order (PO) langsung kepada Klien Maklon sebagai surat komitmen resmi, sarana pelacakan (*tracking*), dan *reminder* pengiriman kain tepat waktu agar kapasitas ±70 mesin di lini jahit tidak menganggur.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Tagihan & Invoice Resmi B2B (Menampilkan Tanpa PPN, PPN 11%, & Total Setelah PPN) */}
      {activeTab === "INVOICES" && (
        <div className="bg-lembar p-6 rounded-work border border-garis shadow-hard space-y-4">
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Tagihan & Faktur Resmi B2B (Rincian Tanpa PPN, PPN 11% & Setelah PPN)
              </h2>
              <span className="text-xs text-teks-sekunder">
                Diterbitkan secara real-time oleh Departemen Finance Lukla setelah barang jadi masuk Gudang (`STORED`)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded border border-garis">
            <table className="w-full text-xs text-left">
              <thead className="bg-kabut text-tinta font-bold border-b border-garis">
                <tr>
                  <th className="py-2.5 px-3">No. Invoice</th>
                  <th className="py-2.5 px-2">No. Order & Artikel</th>
                  <th className="py-2.5 px-2 text-right">Jumlah Tanpa PPN (DPP)</th>
                  <th className="py-2.5 px-2 text-right">PPN 11%</th>
                  <th className="py-2.5 px-2 text-right">Total Setelah PPN 11%</th>
                  <th className="py-2.5 px-2 text-center">Serah Terima</th>
                  <th className="py-2.5 px-3 text-right">Status Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-lembar">
                    <td className="py-3 px-3 font-mono font-bold text-celup-indigo">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold text-tinta block">{inv.orderNumber}</span>
                      <span className="text-[11px] text-teks-sekunder">{inv.articleName} ({inv.quantity} pcs)</span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-tinta">
                      Rp {inv.subtotalWithoutPpn.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-status-perbaikan">
                      + Rp {inv.ppnAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-extrabold text-celup-indigo">
                      Rp {inv.totalWithPpn.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[10px]">
                      {inv.fulfillmentMethod}
                    </td>
                    <td className="py-3 px-3 text-right">
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
      )}
    </div>
  );
}
