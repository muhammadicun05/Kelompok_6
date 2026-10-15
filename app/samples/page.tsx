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

import { savePendingMassOrder, MassOrder } from "@/lib/dataBus";

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
  const [activeComponent, setActiveComponent] = useState("Panel Depan & Saku Organizer Zipper");

  // Sample Articles with Versioning (v1, v2) - Tas / Ransel Domain
  const [versions, setVersions] = useState<VersionItem[]>([
    {
      version: 1,
      status: "REJECTED",
      date: "10 Okt 2026",
      fabricConsumption: "1.75 meter Cordura 1000D (Pola Boros & Saku Miring)",
      smvMinutes: "21m 30s",
      notes: "Fitting tali bahu kurang ergonomis, saku organizer miring, efisiensi bahan rendah.",
      isApproved: false,
    },
    {
      version: 2,
      status: "APPROVED",
      date: "12 Okt 2026",
      fabricConsumption: "1.45 meter Cordura 1000D + 0.65m Furing (Efisiensi Pola)",
      smvMinutes: "18m 30s",
      notes: "Pola panel dipadatkan, jahitan bar-tack tali bahu diperkuat, lolos uji beban 15 kg.",
      isApproved: true,
    },
  ]);

  // Active Sample being measured in Studio
  const [activeSample, setActiveSample] = useState({
    id: "CLM-2026-001",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    scheme: "FULL_PACKAGE",
    skuCode: "SNO-BP-35L",
  });

  // Intake Klaim / Spesifikasi Sampel Klien oleh Tim Sampler
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({
    clientCode: "KLIEN_A",
    clientName: "PT Bandung Apparel",
    claimNumber: "CLM-2026-003",
    articleName: "Urban Commuter Roll-Top Backpack 25L",
    targetScheme: "SEMI_CMT",
    notes: "Permintaan sampel ransel roll-top dengan saku laptop busa & buckle magnetic.",
  });
  const [registeredClaims, setRegisteredClaims] = useState([
    {
      id: "CLM-2026-001",
      clientCode: "SNOHUND",
      clientName: "Snøhund Alpine Wear",
      articleName: "Snøhund Alpine Tactical Backpack 35L",
      scheme: "FULL_PACKAGE",
      date: "08 Okt 2026",
      status: "Disetujui (Approved v2)",
    },
    {
      id: "CLM-2026-002",
      clientCode: "KLIEN_A",
      clientName: "PT Bandung Apparel",
      articleName: "Urban Commuter Roll-Top Backpack 25L",
      scheme: "SEMI_CMT",
      date: "11 Okt 2026",
      status: "Uji Stopwatch (v1)",
    },
    {
      id: "CLM-2026-003",
      clientCode: "KLIEN_B",
      clientName: "CV Priangan Outdoor",
      articleName: "Summit Expedition Backpack 50L",
      scheme: "CMT",
      date: "13 Okt 2026",
      status: "Menunggu Uji SMV",
    },
  ]);

  const handleRegisterClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim = {
      id: claimForm.claimNumber,
      clientCode: claimForm.clientCode,
      clientName: claimForm.clientCode === "SNOHUND" ? "Snøhund Alpine Wear" : claimForm.clientCode === "KLIEN_A" ? "PT Bandung Apparel" : "CV Priangan Outdoor",
      articleName: claimForm.articleName,
      scheme: claimForm.targetScheme,
      date: "15 Okt 2026",
      status: "Menunggu Studi Waktu",
    };
    setRegisteredClaims([newClaim, ...registeredClaims]);
    setShowClaimForm(false);
    alert(`Klaim/permintaan sampel ransel ${claimForm.claimNumber} (${claimForm.articleName}) berhasil didaftarkan oleh Tim Sampler ke dalam sistem!`);
  };

  const handleSelectSample = (sample: typeof registeredClaims[0]) => {
    setActiveSample({
      id: sample.id,
      clientCode: sample.clientCode,
      clientName: sample.clientName,
      articleName: sample.articleName,
      scheme: sample.scheme,
      skuCode: sample.clientCode === "SNOHUND" ? "SNO-BP-35L" : `${sample.clientCode}-BP-01`,
    });
    setSeconds(0);
    setIsRunning(false);
    alert(`Sampel aktif diubah menjadi: "${sample.articleName}" (${sample.id}). Stopwatch & BOM siap diuji!`);
  };

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

  const [convertedOrder, setConvertedOrder] = useState<any | null>(null);
  const [ownerApprovalStatus, setOwnerApprovalStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [isClientAccountActive, setIsClientAccountActive] = useState<boolean>(false);
  const [selectedScheme, setSelectedScheme] = useState("FULL_PACKAGE");

  const handleConvertToMassOrder = () => {
    const dynamicNum = activeSample.id === "SNO-HD-01" ? "ORD-2026-004" : `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const orderData: MassOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: dynamicNum,
      scheme: selectedScheme as any,
      clientName: activeSample.clientName,
      clientCode: activeSample.clientCode,
      article: activeSample.articleName,
      targetQty: 500,
      completedQty: 0,
      inheritedVersion: "v2 (Approved)",
      inheritedSmv: "18m 30s",
      inheritedFabric: "1.45 m Cordura 1000D / pcs",
      status: "PENDING_OWNER_APPROVAL",
      createdAt: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
    };
    setConvertedOrder(orderData);
    setOwnerApprovalStatus("PENDING");
    setIsClientAccountActive(false);

    // Save draft order to data bus
    savePendingMassOrder(orderData);

    alert(`Draft Pesanan Massal ${orderData.orderNumber} (${orderData.article}) berhasil diterbitkan oleh Sampler! Terkoneksi secara real-time ke Antrean Approval Owner di Dashboard.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-celup-indigo tracking-tight">
            Fase 1: Sample & Time Study Tracker
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            Pendaftaran Klaim Klien • Studi Waktu (SMV) • Penerbitan Order Produksi Massal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowClaimForm(!showClaimForm)}
            className="w-full sm:w-auto px-3.5 py-2 bg-kapur text-celup-indigo font-bold text-xs rounded-work shadow-hard hover:bg-kapur/90 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-celup-indigo" />
            <span>{showClaimForm ? "Tutup Form Klaim" : "+ Daftarkan Klaim Sampel"}</span>
          </button>
          <div className="flex items-center gap-2">
            <ClientTag clientCode="SNOHUND" clientName="Snøhund Alpine Wear" />
            <span className="font-mono text-xs font-bold text-celup-indigo bg-kabut px-2 py-1 rounded">
              SNO-HD-01
            </span>
          </div>
        </div>
      </div>

      {/* Form Pendaftaran Klaim / Tiket Sampel Baru Klien oleh Tim Sampler */}
      {showClaimForm && (
        <form
          onSubmit={handleRegisterClaim}
          className="bg-white border-2 border-celup-indigo rounded-work p-4 sm:p-5 shadow-hard space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-garis pb-2">
            <div>
              <h2 className="text-sm font-bold text-celup-indigo">
                Pendaftaran Klaim / Tiket Sampel Baru Klien
              </h2>
              <p className="text-xs text-teks-sekunder">
                Tim Sampler mendaftarkan spesifikasi awal artikel atau revisi sebelum uji stopwatch & BOM
              </p>
            </div>
            <span className="text-xs bg-kabut px-2 py-0.5 rounded font-mono font-semibold text-celup-indigo">
              Wewenang Tim Sampler
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-teks-sekunder block mb-1">Pilih Klien / Brand:</label>
              <select
                value={claimForm.clientCode}
                onChange={(e) => setClaimForm({ ...claimForm, clientCode: e.target.value })}
                className="w-full border border-garis rounded p-2 text-celup-indigo font-semibold bg-lembar"
              >
                <option value="SNOHUND">Snøhund Alpine Wear (Internal)</option>
                <option value="KLIEN_A">PT Bandung Apparel (Maklon A)</option>
                <option value="KLIEN_B">CV Priangan Outdoor (Maklon B)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-teks-sekunder block mb-1">Nomor Klaim / Tiket:</label>
              <input
                type="text"
                value={claimForm.claimNumber}
                onChange={(e) => setClaimForm({ ...claimForm, claimNumber: e.target.value })}
                className="w-full border border-garis rounded p-2 text-celup-indigo font-mono font-bold bg-lembar"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-teks-sekunder block mb-1">Nama Artikel / Model:</label>
              <input
                type="text"
                value={claimForm.articleName}
                onChange={(e) => setClaimForm({ ...claimForm, articleName: e.target.value })}
                className="w-full border border-garis rounded p-2 text-tinta font-semibold bg-lembar"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-teks-sekunder block mb-1">Rencana Skema Maklon:</label>
              <select
                value={claimForm.targetScheme}
                onChange={(e) => setClaimForm({ ...claimForm, targetScheme: e.target.value })}
                className="w-full border border-garis rounded p-2 text-celup-indigo font-semibold bg-lembar"
              >
                <option value="CMT">CMT (Kain 100% Titipan Klien)</option>
                <option value="SEMI_CMT">SEMI_CMT (Bahan Klien + PO Lukla)</option>
                <option value="FULL_PACKAGE">FULL_PACKAGE (100% Bahan Lukla)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-teks-sekunder block text-xs mb-1">Catatan Spesifikasi / Klaim Revisi:</label>
            <input
              type="text"
              value={claimForm.notes}
              onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
              className="w-full border border-garis rounded p-2 text-xs text-tinta bg-lembar"
              placeholder="Contoh: Perubahan ukuran lingkar pinggang, zipper anti air, toleransi jahitan 0.5cm..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-garis">
            <button
              type="button"
              onClick={() => setShowClaimForm(false)}
              className="px-3 py-1.5 border border-garis rounded text-xs text-teks-sekunder hover:bg-kabut"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-celup-indigo text-white font-bold text-xs rounded shadow-hard hover:bg-celup-indigo/90"
            >
              Daftarkan Klaim ke Sistem
            </button>
          </div>
        </form>
      )}

      {/* Role Notice Banner */}
      <div className="p-3 bg-white border-l-4 border-celup-indigo rounded-field shadow-hard text-xs text-tinta flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <strong className="text-celup-indigo">Wewenang Operasional Tim Sampler:</strong>{" "}
          1) Pendaftaran klaim/spesifikasi klien ke sistem • 2) Studi waktu per komponen tas ransel (SMV & BOM) • 3) Penerbitan <strong>Order Produksi Massal</strong> setelah sampel berstatus Disetujui (Approved).
        </div>
      </div>

      {/* Pak Harry Issue #1: List Sampel & Pemilihan Sampel Aktif */}
      <div className="bg-white p-4 sm:p-5 rounded-work border border-garis shadow-hard space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-celup-indigo flex items-center gap-2">
              <span>📋 Daftar Sampel & Klaim Klien (Pilih untuk Diuji di Stopwatch)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-lolos/15 text-status-lolos font-bold font-mono">
                {registeredClaims.length} Artikel Ransel
              </span>
            </h2>
            <p className="text-xs text-teks-sekunder">
              Klik tombol &quot;Pilih &amp; Uji&quot; pada salah satu sampel di bawah untuk memuat spesifikasi dan menguji studi waktu (SMV)
            </p>
          </div>
          <div className="text-xs">
            <span className="text-teks-sekunder">Sampel Aktif: </span>
            <span className="font-bold text-celup-indigo bg-kabut px-2 py-1 rounded">
              {activeSample.articleName} ({activeSample.id})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-lembar text-teks-sekunder border-b border-garis">
                <th className="p-2.5">No. Klaim / ID</th>
                <th className="p-2.5">Klien</th>
                <th className="p-2.5">Artikel Tas / Ransel</th>
                <th className="p-2.5">Skema</th>
                <th className="p-2.5">Tanggal</th>
                <th className="p-2.5">Status Persetujuan</th>
                <th className="p-2.5 text-right">Aksi Sampler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {registeredClaims.map((claim) => {
                const isSelected = activeSample.id === claim.id;
                return (
                  <tr
                    key={claim.id}
                    className={`transition-colors ${
                      isSelected ? "bg-kapur/20 font-medium" : "hover:bg-lembar"
                    }`}
                  >
                    <td className="p-2.5 font-mono font-bold text-celup-indigo">
                      {claim.id}
                    </td>
                    <td className="p-2.5">
                      <ClientTag clientCode={claim.clientCode} clientName={claim.clientName} />
                    </td>
                    <td className="p-2.5 font-semibold text-tinta">
                      {claim.articleName}
                    </td>
                    <td className="p-2.5">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-kabut border border-garis">
                        {claim.scheme}
                      </span>
                    </td>
                    <td className="p-2.5 text-teks-sekunder font-mono text-[11px]">
                      {claim.date}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        claim.status.includes("Approved") || claim.status.includes("Disetujui")
                          ? "bg-status-lolos/15 text-status-lolos border border-status-lolos/30"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-lolos bg-status-lolos/10 px-2.5 py-1 rounded border border-status-lolos">
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktif di Stopwatch</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectSample(claim)}
                          className="px-2.5 py-1 bg-celup-indigo text-white rounded text-[11px] font-semibold hover:bg-celup-indigo/90 shadow-sm transition-all"
                        >
                          ⏱️ Pilih &amp; Uji
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Version History & Mass Order Conversion (UAT-04) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard">
            <div className="flex items-center justify-between mb-4 border-b border-garis pb-3">
              <div>
                <h2 className="text-sm font-bold text-celup-indigo">
                  Histori Versi Sampel (v1 → vN) — {activeSample.articleName}
                </h2>
                <span className="text-xs text-teks-sekunder">
                  Pola tidak menimpa versi lama (*non-destructive versioning*)
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-status-lolos text-white">
                v2 Disetujui (Approved)
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
                    <div className="mt-4 pt-3 border-t border-garis flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-kabut/40 p-3 rounded">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-tinta whitespace-nowrap">
                          Skema Maklon:
                        </label>
                        <select
                          value={selectedScheme}
                          onChange={(e) => setSelectedScheme(e.target.value)}
                          className="w-full sm:w-auto text-xs border border-garis bg-white px-2.5 py-1.5 rounded text-celup-indigo font-semibold"
                        >
                          <option value="CMT">CMT (Titipan 100%)</option>
                          <option value="SEMI_CMT">SEMI_CMT (Kain Klien + PO Aksesoris)</option>
                          <option value="FULL_PACKAGE">FULL_PACKAGE (100% Lukla)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleConvertToMassOrder}
                        className="w-full sm:w-auto px-4 py-2 bg-celup-indigo text-white text-xs font-bold rounded-field shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5 whitespace-nowrap"
                      >
                        <span>Jadikan Pesanan Massal</span>
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mass Order Converted Result Card (UAT-04 verification & BRD v1.5) */}
          {convertedOrder && (
            <div className="bg-white p-5 rounded-work border-2 border-status-lolos shadow-hard space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-garis pb-2">
                <div className="flex items-center gap-2 text-status-lolos font-bold text-sm">
                  <FileCheck className="w-5 h-5 flex-shrink-0" />
                  <span>Pesanan Massal Berhasil Diterbitkan dari {convertedOrder.inheritedVersion}!</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${
                  ownerApprovalStatus === "APPROVED"
                    ? "bg-status-lolos/10 text-status-lolos border-status-lolos"
                    : ownerApprovalStatus === "REJECTED"
                    ? "bg-status-cacat/10 text-status-cacat border-status-cacat"
                    : "bg-status-perbaikan/10 text-status-perbaikan border-status-perbaikan"
                }`}>
                  {ownerApprovalStatus === "APPROVED"
                    ? "Status: Disetujui Owner (Approved/Accepted)"
                    : ownerApprovalStatus === "REJECTED"
                    ? "Status: Ditolak Owner (Rejected by Owner)"
                    : "Status: Menunggu Keputusan Owner (Pending Approval)"}
                </span>
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

              {/* Owner Approval Gate (BRD v1.5: Owner Satu-Satunya Approver Sistem) */}
              <div className="p-3 bg-lembar border border-garis rounded-field text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-celup-indigo">Persetujuan Bisnis Owner:</span>
                  <span className="text-[11px] text-teks-sekunder">Wewenang Tunggal Sistem</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOwnerApprovalStatus("APPROVED");
                      alert(`Order ${convertedOrder.orderNumber} telah disetujui oleh Owner! Tahap persiapan material dan produksi diizinkan dimulai.`);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded font-bold text-xs transition-all ${
                      ownerApprovalStatus === "APPROVED"
                        ? "bg-status-lolos text-white shadow-sm"
                        : "bg-white border border-status-lolos text-status-lolos hover:bg-status-lolos hover:text-white"
                    }`}
                  >
                    ✓ Setujui Order (Owner Approval)
                  </button>
                  <button
                    onClick={() => {
                      setOwnerApprovalStatus("REJECTED");
                      alert(`Order ${convertedOrder.orderNumber} ditolak oleh Owner. Produksi tidak dapat dimulai.`);
                    }}
                    className={`py-1.5 px-3 rounded font-bold text-xs transition-all ${
                      ownerApprovalStatus === "REJECTED"
                        ? "bg-status-cacat text-white shadow-sm"
                        : "bg-white border border-status-cacat text-status-cacat hover:bg-status-cacat hover:text-white"
                    }`}
                  >
                    ✕ Tolak Order
                  </button>
                </div>
              </div>

              {/* Provisioning Akun Portal Klien oleh Sampler (BRD v1.5 Section 5.2.5) */}
              <div className="p-3 bg-white border border-garis rounded-field text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-celup-indigo">Aktivasi Akun Portal Klien:</span>
                  <span className="text-[11px] text-teks-sekunder">Dikelola oleh Tim Sampler</span>
                </div>
                
                {isClientAccountActive ? (
                  <div className="p-2 bg-status-lolos/10 border border-status-lolos/30 rounded text-status-lolos font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Akun Portal Klien Aktif! Klien kini dapat login ke Portal B2B untuk melacak pesanan {convertedOrder.orderNumber}.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[11px] text-teks-sekunder">
                      {ownerApprovalStatus === "APPROVED"
                        ? "Order telah disetujui Owner. Akun login portal siap diaktifkan untuk klien."
                        : "Akun login portal baru dapat diaktifkan setelah order disetujui oleh Owner."}
                    </p>
                    <button
                      disabled={ownerApprovalStatus !== "APPROVED"}
                      onClick={() => {
                        setIsClientAccountActive(true);
                        alert(`Akun Portal Klien untuk pesanan ${convertedOrder.orderNumber} berhasil diaktifkan oleh Tim Sampler!`);
                      }}
                      className={`px-3.5 py-1.5 rounded font-bold text-xs transition-all whitespace-nowrap ${
                        ownerApprovalStatus === "APPROVED"
                          ? "bg-celup-indigo text-white shadow-hard hover:bg-celup-indigo/90"
                          : "bg-kabut text-teks-sekunder border border-garis cursor-not-allowed"
                      }`}
                    >
                      {ownerApprovalStatus === "APPROVED" ? "✨ Aktifkan Akun Portal Klien" : "🔒 Terkunci (Menunggu Approval Owner)"}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-teks-sekunder">
                Sesuai <strong>UAT-04</strong> & <strong>BRD v1.5</strong>: Pesanan massal mewarisi seluruh spesifikasi BOM dan studi waktu dari versi disetujui (v2), riwayat v1 tersimpan, dan akun portal klien hanya aktif setelah approval Owner.
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
              <option value="Panel Depan & Saku Organizer Zipper">Panel Depan &amp; Saku Organizer Zipper</option>
              <option value="Panel Belakang & Busa Punggung Ergonomis">Panel Belakang &amp; Busa Punggung Ergonomis</option>
              <option value="Tali Bahu (Shoulder Straps) & Sternum Strap">Tali Bahu (Shoulder Straps) &amp; Sternum Strap</option>
              <option value="Saku Samping Mesh & Tali Kompresi">Saku Samping Mesh &amp; Tali Kompresi</option>
              <option value="Tutup Kompartemen & Acetal Buckle 25mm">Tutup Kompartemen &amp; Acetal Buckle 25mm</option>
              <option value="Perakitan Tas Utuh (Assembly Kompartemen & Lining)">Perakitan Tas Utuh (Assembly Kompartemen &amp; Lining)</option>
              <option value="Potong Bahan Cordura 1000D Pola Ransel">Potong Bahan Cordura 1000D Pola Ransel</option>
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
