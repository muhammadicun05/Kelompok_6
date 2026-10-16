"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Clock, 
  Boxes, 
  Gift, 
  Wrench
} from "lucide-react";
import { 
  getQcQueue, 
  getLiveQcPoolBonus, 
  getFinishedGoods, 
  QcQueueItem, 
  FinishedGoodRecord 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function QcPage() {
  const { currentRole } = useRole();
  const [queue, setQueue] = useState<QcQueueItem[]>([]);
  const [poolBonus, setPoolBonus] = useState(600);
  const [finishedGoodsReady, setFinishedGoodsReady] = useState(0);

  const loadData = () => {
    setQueue(getQcQueue());
    setPoolBonus(getLiveQcPoolBonus(600));
    const ready = getFinishedGoods().filter((f) => f.status === "READY_FOR_WAREHOUSE").length;
    setFinishedGoodsReady(ready);
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

  const waitingItems = queue.filter((q) => q.status === "WAITING" || q.status === "REINSPECTION_PENDING");
  const passedUnitsCount = Math.round(poolBonus / 300);
  const splitAmount = Math.round(poolBonus / 3);

  const canInspect = currentRole === "OWNER" || currentRole === "QC_INSPECTOR";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-celup-indigo" />
            <span>Quality Control &amp; Pool Bonus QC</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Inspeksi 1 produk tas utuh, pembagian bonus QC 3-arah, dan pemindahan ke gudang barang jadi
          </p>
        </div>

        {canInspect && (
          <Link
            href="/qc/terminal"
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-kapur" />
            <span>Buka Terminal QC (Pass / Repair) →</span>
          </Link>
        )}
      </div>

      {/* Finished Goods Ready Alert Banner */}
      {finishedGoodsReady > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-work p-4 flex items-center justify-between shadow-hard">
          <div className="flex items-center gap-2.5 text-xs text-blue-900">
            <Gift className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <span>
              <strong>{finishedGoodsReady} unit</strong> telah lolos inspeksi QC dan menunggu penerimaan masuk Gudang Barang Jadi.
            </span>
          </div>

          <Link
            href="/warehouse/finished"
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            <span>Buka Barang Jadi →</span>
          </Link>
        </div>
      )}

      {/* Active QC Bonus Pool Card (Rules #2 & #6) */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-celup-indigo">Saldo Pool Bonus QC Periode Berjalan (Aturan Bisnis #2)</h2>
            <p className="text-xs text-teks-sekunder">
              Setiap 1 unit LOLOS QC otomatis menambah saldo pool sebesar Rp 300 tanpa clawback upah penjahit
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-lolos/15 text-status-lolos font-mono">
            FR-10.3 Terhubung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-lembar p-4 rounded-work border border-garis">
            <span className="text-[11px] font-semibold text-teks-sekunder block">Unit Lolos QC Periode Ini:</span>
            <span className="text-2xl font-black text-celup-indigo font-mono mt-1 block">
              {passedUnitsCount} Unit
            </span>
            <span className="text-[10px] text-teks-sekunder">Tercatat di sistem</span>
          </div>

          <div className="bg-lembar p-4 rounded-work border border-garis">
            <span className="text-[11px] font-semibold text-teks-sekunder block">Total Saldo Pool Bonus QC:</span>
            <span className="text-2xl font-black text-status-lolos font-mono mt-1 block">
              Rp {poolBonus.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-teks-sekunder">Akumulasi tarif Rp 300/unit</span>
          </div>

          <div className="bg-lembar p-4 rounded-work border border-garis">
            <span className="text-[11px] font-semibold text-teks-sekunder block">Bagian per Penerima (3-Arah ÷3):</span>
            <span className="text-2xl font-black text-celup-indigo font-mono mt-1 block">
              Rp {splitAmount.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-teks-sekunder">2 Mandor + 1 Kepala Operasional</span>
          </div>
        </div>
      </div>

      {/* Antrean Inspeksi QC */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-garis pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-celup-indigo">Antrean Inspeksi Terminal QC</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
              {waitingItems.length} unit menunggu
            </span>
          </div>

          <Link href="/qc/terminal" className="text-xs font-bold text-celup-indigo hover:underline flex items-center gap-1">
            <span>Buka Terminal Layar Penuh →</span>
          </Link>
        </div>

        {waitingItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-teks-sekunder border border-dashed border-garis rounded">
            Tidak ada produk utuh yang sedang menunggu inspeksi QC saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">No. Seri Tag Produk</th>
                  <th className="p-3">Pesanan</th>
                  <th className="p-3">Artikel Tas Ransel</th>
                  <th className="p-3">Stasiun Perakitan (Assembly)</th>
                  <th className="p-3">Tiba di QC</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {waitingItems.map((item) => (
                  <tr key={item.serial} className="hover:bg-lembar transition-colors">
                    <td className="p-3 font-mono font-bold text-celup-indigo">{item.serial}</td>
                    <td className="p-3 font-mono text-tinta">{item.orderNumber}</td>
                    <td className="p-3 font-semibold text-tinta">{item.articleName}</td>
                    <td className="p-3 text-teks-sekunder">{item.assembledBy}</td>
                    <td className="p-3 font-mono text-[11px] text-teks-sekunder">{item.arrivedAt}</td>
                    <td className="p-3">
                      {item.isReinspection ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                          <Wrench className="w-3 h-3 text-amber-700" />
                          <span>Re-Inspeksi Ulang</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-kabut text-tinta border border-garis">
                          Menunggu Inspeksi
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href="/qc/terminal"
                        className="px-2.5 py-1 bg-celup-indigo text-white font-bold text-[11px] rounded hover:bg-celup-indigo/90 shadow-sm inline-flex items-center gap-1"
                      >
                        <span>Inspeksi</span>
                        <ArrowRight className="w-3 h-3 text-kapur" />
                      </Link>
                    </td>
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
