"use client";

import React, { useState, useEffect } from "react";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  FileCheck, 
  ArrowRight,
  Plus
} from "lucide-react";
import { ThreadEdge, ClientTag } from "@/components/Design/ThreadEdge";

interface VersionItem {
  version: number;
  status: "APPROVED" | "REJECTED" | "IN_REVIEW";
  date: string;
  fabricConsumption: string;
  smvMinutes: string;
  notes: string;
  isApproved: boolean;
}

export default function SamplesPage() {
  // Digital Stopwatch State (Section 8.4)
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeComponent, setActiveComponent] = useState("Pasang Lengan & Rib");

  // Sample Articles with Versioning (v1, v2)
  const [versions, setVersions] = useState<VersionItem[]>([
    {
      version: 1,
      status: "REJECTED",
      date: "10 Okt 2026",
      fabricConsumption: "2.1 yard/pcs (Pola Lengan Sempit)",
      smvMinutes: "12m 00s",
      notes: "Fitting lingkar lengan sempit, boros konsumsi kain.",
      isApproved: false,
    },
    {
      version: 2,
      status: "APPROVED",
      date: "12 Okt 2026",
      fabricConsumption: "1.85 yard/pcs (Efisiensi Pola)",
      smvMinutes: "11m 00s",
      notes: "Lingkar lengan diperlebar 2cm, layout pola dipadatkan.",
      isApproved: true,
    },
  ]);

  const [convertedOrder, setConvertedOrder] = useState<any | null>(null);
  const [selectedScheme, setSelectedScheme] = useState("SEMI_CMT");

  // Timer Interval Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleConvertToMassOrder = () => {
    setConvertedOrder({
      orderNumber: `ORD-2026-004`,
      scheme: selectedScheme,
      article: "Snøhund Alpine Heavy Hoodie",
      targetQty: 600,
      inheritedVersion: "v2",
      inheritedSmv: "11m 00s",
      inheritedFabric: "1.85 yard/pcs",
      status: "CONFIRMED",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 1: Sample & Time Study Tracker
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Studi Waktu (SMV) Komponen & Versioning Revisi Sampel (v1 → v2)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ClientTag clientCode="SNOHUND" clientName="Snøhund Alpine Wear" />
          <span className="font-mono text-xs font-bold text-celup-indigo bg-kabut px-2 py-1 rounded">
            SNO-HD-01
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Version History & Mass Order Conversion (UAT-04) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard">
            <div className="flex items-center justify-between mb-4 border-b border-garis pb-3">
              <div>
                <h2 className="text-sm font-bold text-celup-indigo">
                  Histori Versi Sampel (v1 → v2)
                </h2>
                <span className="text-xs text-teks-sekunder">
                  Pola tidak menimpa versi lama (*non-destructive versioning*)
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-status-lolos text-white">
                v2 Disetujui
              </span>
            </div>

            {/* Version List (Sequential Order) */}
            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.version}
                  className={`p-4 rounded-field border ${
                    ver.isApproved
                      ? "border-celup-indigo bg-white"
                      : "border-garis bg-kabut/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-celup-indigo font-mono">
                        v{ver.version}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          ver.isApproved
                            ? "bg-status-lolos text-white"
                            : "bg-status-cacat text-white"
                        }`}
                      >
                        {ver.status === "APPROVED" ? "Disetujui" : "Ditolak / Revisi"}
                      </span>
                    </div>
                    <span className="text-xs text-teks-sekunder font-mono">{ver.date}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="text-teks-sekunder block">Konsumsi Bahan (BOM):</span>
                      <span className="font-semibold text-tinta">{ver.fabricConsumption}</span>
                    </div>
                    <div>
                      <span className="text-teks-sekunder block">Waktu Jahit (SMV):</span>
                      <span className="font-semibold text-celup-indigo font-mono">{ver.smvMinutes}</span>
                    </div>
                  </div>

                  <p className="text-xs text-teks-sekunder mt-2 italic border-t border-garis pt-2">
                    Catatan: {ver.notes}
                  </p>

                  {ver.isApproved && (
                    <div className="mt-4 pt-3 border-t border-garis flex flex-col sm:flex-row items-center justify-between gap-3 bg-kabut/40 p-3 rounded">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-tinta whitespace-nowrap">
                          Skema Maklon:
                        </label>
                        <select
                          value={selectedScheme}
                          onChange={(e) => setSelectedScheme(e.target.value)}
                          className="text-xs border border-garis bg-white px-2 py-1 rounded text-celup-indigo font-semibold"
                        >
                          <option value="CMT">CMT (Titipan 100%)</option>
                          <option value="SEMI_CMT">SEMI_CMT (Kain Klien + PO Aksesoris)</option>
                          <option value="FULL_PACKAGE">FULL_PACKAGE (100% Lukla)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleConvertToMassOrder}
                        className="w-full sm:w-auto px-4 py-2 bg-celup-indigo text-white text-xs font-bold rounded-field shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
                      >
                        <span>Jadikan Pesanan Massal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mass Order Converted Result Card (UAT-04 verification) */}
          {convertedOrder && (
            <div className="bg-white p-5 rounded-work border-2 border-status-lolos shadow-hard space-y-3">
              <div className="flex items-center gap-2 text-status-lolos font-bold text-sm">
                <FileCheck className="w-5 h-5" />
                <span>Pesanan Massal Berhasil Diterbitkan dari {convertedOrder.inheritedVersion}!</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-kabut p-3 rounded text-xs">
                <div>
                  <span className="text-teks-sekunder block">ID Pesanan:</span>
                  <span className="font-mono font-bold text-celup-indigo">{convertedOrder.orderNumber}</span>
                </div>
                <div>
                  <span className="text-teks-sekunder block">Skema Terkunci:</span>
                  <span className="font-bold text-tinta">{convertedOrder.scheme}</span>
                </div>
                <div>
                  <span className="text-teks-sekunder block">BOM Diwarisi:</span>
                  <span className="font-bold text-tinta">{convertedOrder.inheritedFabric}</span>
                </div>
                <div>
                  <span className="text-teks-sekunder block">SMV Diwarisi:</span>
                  <span className="font-bold text-celup-indigo font-mono">{convertedOrder.inheritedSmv}</span>
                </div>
              </div>

              <p className="text-xs text-teks-sekunder">
                Sesuai <strong>UAT-04</strong>: Pesanan massal mewarisi seluruh spesifikasi BOM dan studi waktu dari versi disetujui (v2), sementara riwayat v1 tetap tersimpan utuh di sistem.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Mobile & Tablet Digital Stopwatch (Section 8.4) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard text-center">
            <div className="flex items-center justify-between text-xs text-teks-sekunder mb-3 border-b border-garis pb-2">
              <span className="font-bold text-celup-indigo">Digital Stopwatch Studio Sampel</span>
              <Timer className="w-4 h-4 text-celup-indigo" />
            </div>

            <div className="text-xs text-teks-sekunder mb-2">
              Komponen yang Sedang Diuji:
            </div>
            <select
              value={activeComponent}
              onChange={(e) => setActiveComponent(e.target.value)}
              className="text-xs font-bold text-celup-indigo bg-white border border-garis px-3 py-1.5 rounded-field mb-4 w-full"
            >
              <option value="Pasang Lengan & Rib">Pasang Lengan & Rib</option>
              <option value="Badan Depan & Kantong Kanguru">Badan Depan & Kantong Kanguru</option>
              <option value="Assembly Kap Hoodie">Assembly Kap Hoodie</option>
              <option value="Potong Taslan Pola Komplit">Potong Taslan Pola Komplit</option>
            </select>

            {/* Giant Stopwatch Display (64px) */}
            <div className="py-6 px-4 bg-white rounded-terminal border-2 border-garis my-3">
              <div className="font-mono text-6xl font-extrabold text-celup-indigo tracking-wider tabular-nums">
                {formatTimer(seconds)}
              </div>
              <span className="text-[11px] text-teks-sekunder mt-1 block">
                Menit : Detik Standard Minute Value (SMV)
              </span>
            </div>

            {/* 72px Giant Touch Control Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`h-16 rounded-terminal font-bold text-base shadow-hard flex items-center justify-center gap-2 transition-all active:translate-y-0.5 ${
                  isRunning
                    ? "bg-status-cacat text-white"
                    : "bg-status-lolos text-white"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    <span>Mulai</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSeconds(0);
                }}
                className="h-16 rounded-terminal bg-kabut border border-garis text-tinta font-bold text-base shadow-hard hover:bg-white flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>

            <button
              onClick={() => {
                alert(`SMV ${formatTimer(seconds)} disimpan untuk komponen "${activeComponent}"!`);
              }}
              className="w-full mt-3 py-3 rounded-field bg-celup-indigo text-white font-semibold text-xs shadow-hard hover:bg-celup-indigo/90 transition-all"
            >
              Simpan SMV ke Komponen Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
