"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Gift, 
  PackageCheck, 
  ArrowLeft, 
  Check, 
  Boxes, 
  Search, 
  MapPin, 
  Building2,
  FileSpreadsheet
} from "lucide-react";
import { 
  getFinishedGoods, 
  receiveFinishedGoodToWarehouse, 
  receiveAllReadyFinishedGoodsByOrder,
  FinishedGoodRecord 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function FinishedGoodsPage() {
  const { currentRole } = useRole();
  const [goods, setGoods] = useState<FinishedGoodRecord[]>([]);
  const [rackInput, setRackInput] = useState("RAK-FG-A1");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    setGoods(getFinishedGoods());
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

  const readyItems = goods.filter((g) => g.status === "READY_FOR_WAREHOUSE");
  const storedItems = goods.filter((g) => g.status === "STORED");

  const canReceive = currentRole === "OWNER" || currentRole === "WAREHOUSE";

  const handleReceiveOne = (serialNumber: string) => {
    receiveFinishedGoodToWarehouse(serialNumber, `${currentRole} (Gudang)`, rackInput);
    alert(`Unit ${serialNumber} berhasil diterima dan disimpan di ${rackInput}!`);
    loadData();
  };

  const handleReceiveAll = (orderNumber: string) => {
    receiveAllReadyFinishedGoodsByOrder(orderNumber, `${currentRole} (Gudang)`, rackInput);
    alert(`Seluruh unit siap simpan untuk pesanan ${orderNumber} berhasil dipindahkan ke rak ${rackInput}!`);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/warehouse" className="text-xs font-bold text-teks-sekunder hover:text-celup-indigo flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gudang Bahan Baku</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Gift className="w-6 h-6 text-celup-indigo" />
            <span>Gudang Barang Jadi (Finished Goods)</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Penerimaan barang jadi yang telah lulus Terminal QC, penataan nomor rak gudang, dan kesiapan pengiriman invoice
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="px-3.5 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-kapur" />
            <span>Buka Modul Invoice →</span>
          </Link>
        </div>
      </div>

      {/* Rack Selector Bar */}
      {canReceive && readyItems.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-work p-4 shadow-hard flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Lokasi Rak Penerimaan Barang Jadi:</span>
            <input
              type="text"
              value={rackInput}
              onChange={(e) => setRackInput(e.target.value)}
              className="bg-white border border-amber-300 rounded px-2.5 py-1 font-mono font-bold text-celup-indigo text-xs uppercase"
            />
          </div>

          <span className="text-[11px] text-amber-800">
            {readyItems.length} unit lolos QC menunggu konfirmasi masuk gudang
          </span>
        </div>
      )}

      {/* Section 1: Siap Masuk Gudang (Lolos QC) */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-celup-indigo">Siap Masuk Gudang (Lolos QC)</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
              readyItems.length > 0 ? "bg-amber-100 text-amber-800" : "bg-kabut text-teks-sekunder"
            }`}>
              {readyItems.length} unit
            </span>
          </div>
        </div>

        {readyItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-teks-sekunder border border-dashed border-garis rounded">
            Tidak ada unit lolos QC yang sedang menunggu penerimaan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">No. Seri Produk</th>
                  <th className="p-3">Pesanan</th>
                  <th className="p-3">Klien</th>
                  <th className="p-3">Artikel Ransel</th>
                  <th className="p-3">Lolos QC Pada</th>
                  {canReceive && <th className="p-3 text-right">Aksi Gudang</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {readyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-lembar transition-colors">
                    <td className="p-3 font-mono font-bold text-celup-indigo">{item.serialNumber}</td>
                    <td className="p-3 font-mono text-tinta">{item.orderNumber}</td>
                    <td className="p-3 font-bold text-tinta">{item.clientName}</td>
                    <td className="p-3 text-tinta">{item.articleName}</td>
                    <td className="p-3 text-teks-sekunder font-mono text-[11px]">{item.passedQcAt}</td>
                    {canReceive && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleReceiveOne(item.serialNumber)}
                          className="px-3 py-1 bg-status-lolos text-white font-bold text-xs rounded hover:bg-status-lolos/90 shadow-sm inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Terima ke Rak</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Barang Jadi Tersimpan (Stored) */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-celup-indigo">Barang Jadi Tersimpan di Rak (Stored)</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-lolos/15 text-status-lolos font-mono">
              {storedItems.length} unit tersimpan
            </span>
          </div>
        </div>

        {storedItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-teks-sekunder border border-dashed border-garis rounded">
            Belum ada barang jadi yang tersimpan di rak gudang.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">No. Seri Produk</th>
                  <th className="p-3">Pesanan</th>
                  <th className="p-3">Klien</th>
                  <th className="p-3">Artikel Ransel</th>
                  <th className="p-3">Lokasi Rak</th>
                  <th className="p-3">Diterima Pada</th>
                  <th className="p-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {storedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-lembar transition-colors">
                    <td className="p-3 font-mono font-bold text-celup-indigo">{item.serialNumber}</td>
                    <td className="p-3 font-mono text-tinta">{item.orderNumber}</td>
                    <td className="p-3 font-bold text-tinta">{item.clientName}</td>
                    <td className="p-3 text-tinta">{item.articleName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-kabut border border-garis text-celup-indigo">
                        {item.rackLocation || "RAK-FG-A1"}
                      </span>
                    </td>
                    <td className="p-3 text-teks-sekunder font-mono text-[11px]">{item.storedAt || item.passedQcAt}</td>
                    <td className="p-3 text-teks-sekunder">{item.storedBy || "Kang Asep (Gudang)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
