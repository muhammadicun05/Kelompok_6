"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Plus, 
  Search, 
  X, 
  Check, 
  Building2, 
  Layers, 
  ArrowRight 
} from "lucide-react";
import { getRateCards, saveRateCard, RateCardRecord, getClients } from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function RateCardsPage() {
  const { currentRole } = useRole();
  const [rateCards, setRateCards] = useState<RateCardRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Saku Samping Mesh & Kompresi",
    rateSew: 1250,
    rateCut: 300,
  });

  const loadData = () => {
    setRateCards(getRateCards());
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveRateCard({
      id: `rc-${Date.now()}`,
      clientCode: form.clientCode,
      clientName: form.clientName,
      articleName: form.articleName,
      componentName: form.componentName,
      rateSew: Number(form.rateSew),
      rateCut: Number(form.rateCut),
      effectiveFrom: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    });

    setShowModal(false);
    alert(`Tarif rate card untuk ${form.componentName} berhasil disimpan!`);
    loadData();
  };

  const filteredCards = rateCards.filter(
    (r) =>
      r.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.articleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = currentRole === "OWNER" || currentRole === "PRODUCTION_HEAD_MANDOR";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-celup-indigo" />
            <span>Master Rate Cards (Tarif Borongan Potong &amp; Jahit)</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Konfigurasi tarif resmi ongkos potong dan jahit per komponen artikel sebagai basis perhitungan penggajian Sabtu
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Tambah / Ubah Tarif</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari komponen, artikel, atau klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
        <span className="text-xs font-semibold text-teks-sekunder hidden sm:inline">
          {rateCards.length} Tarif Komponen Aktif
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-work border border-garis shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Klien / Brand</th>
                <th className="p-3.5">Artikel Produk</th>
                <th className="p-3.5">Nama Komponen Jahit</th>
                <th className="p-3.5 text-right">Tarif Jahit / Pcs</th>
                <th className="p-3.5 text-right">Tarif Potong / Pcs</th>
                <th className="p-3.5">Berlaku Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredCards.map((rc) => (
                <tr key={rc.id} className="hover:bg-lembar transition-colors">
                  <td className="p-3.5 font-bold text-celup-indigo">
                    {rc.clientName}
                  </td>
                  <td className="p-3.5 text-tinta font-medium">
                    {rc.articleName}
                  </td>
                  <td className="p-3.5 font-bold text-tinta">
                    {rc.componentName}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-celup-indigo tabular-nums text-sm">
                    Rp {rc.rateSew.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3.5 text-right font-mono text-teks-sekunder tabular-nums">
                    {rc.rateCut > 0 ? `Rp ${rc.rateCut.toLocaleString("id-ID")}` : "—"}
                  </td>
                  <td className="p-3.5 text-teks-sekunder font-mono text-[11px]">
                    {rc.effectiveFrom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Tarif */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Tambah Tarif Rate Card</h3>
                <p className="text-xs text-white/80">Tetapkan ongkos borongan jahit dan potong per pcs</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Klien:</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Artikel Produk:</label>
                <input
                  type="text"
                  value={form.articleName}
                  onChange={(e) => setForm({ ...form, articleName: e.target.value })}
                  className="w-full border border-garis rounded p-2 text-tinta font-semibold bg-lembar"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Komponen Jahit:</label>
                <input
                  type="text"
                  value={form.componentName}
                  onChange={(e) => setForm({ ...form, componentName: e.target.value })}
                  className="w-full border border-garis rounded p-2 text-tinta font-semibold bg-lembar"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Tarif Jahit / Pcs (Rp):</label>
                  <input
                    type="number"
                    value={form.rateSew}
                    onChange={(e) => setForm({ ...form, rateSew: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-celup-indigo bg-lembar"
                    min="0"
                    step="50"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Tarif Potong / Pcs (Rp):</label>
                  <input
                    type="number"
                    value={form.rateCut}
                    onChange={(e) => setForm({ ...form, rateCut: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    min="0"
                    step="50"
                  />
                </div>
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
                  Simpan Rate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
