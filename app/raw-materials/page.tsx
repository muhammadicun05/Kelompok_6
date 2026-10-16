"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Boxes, 
  Plus, 
  Search, 
  Layers, 
  Package, 
  ArrowRight,
  X
} from "lucide-react";
import { 
  getRawMaterialCatalog, 
  addRawMaterial, 
  RawMaterialMaster 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function RawMaterialsPage() {
  const { currentRole } = useRole();
  const [materials, setMaterials] = useState<RawMaterialMaster[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    sku: "",
    name: "",
    defaultUnit: "Meter",
    category: "Kain Utama" as RawMaterialMaster["category"],
    stockOnHand: 500,
  });

  const loadData = () => {
    setMaterials(getRawMaterialCatalog());
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

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const sku = form.sku || `RM-${String(materials.length + 1).padStart(4, "0")}`;
    addRawMaterial({
      id: `rm-${Date.now()}`,
      sku,
      name: form.name.trim(),
      defaultUnit: form.defaultUnit,
      category: form.category,
      stockOnHand: Number(form.stockOnHand),
      clientCount: 1,
    });

    setShowModal(false);
    setForm({ sku: "", name: "", defaultUnit: "Meter", category: "Kain Utama", stockOnHand: 500 });
    alert(`Bahan baku ${form.name} (${sku}) berhasil didaftarkan ke katalog induk!`);
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = currentRole === "OWNER" || currentRole === "WAREHOUSE";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Boxes className="w-6 h-6 text-celup-indigo" />
            <span>Katalog Bahan Baku Induk</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Master SKU bahan baku, pelapis, hardware, dan agregasi stok fisik gudang lintas klien
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Tambah Bahan Baku</span>
          </button>
        )}
      </div>

      {/* Search & Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari SKU, nama bahan, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
            />
          </div>
          <span className="text-xs font-semibold text-teks-sekunder hidden sm:inline whitespace-nowrap">
            {materials.length} Master SKU
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center justify-between">
          <span className="text-xs text-teks-sekunder font-semibold">Gudang Bahan:</span>
          <Link href="/warehouse" className="text-xs font-bold text-celup-indigo hover:underline flex items-center gap-1">
            <span>Stok Fisik &amp; Inbound →</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-work border border-garis shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">SKU Tag</th>
                <th className="p-3.5">Nama Bahan Baku</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Satuan</th>
                <th className="p-3.5 text-right">Total Stok Gudang</th>
                <th className="p-3.5 text-right">Jumlah Klien Terkait</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-lembar transition-colors">
                  <td className="p-3.5 font-mono font-bold text-celup-indigo">
                    <span className="bg-kabut px-2 py-0.5 rounded border border-garis">{mat.sku}</span>
                  </td>
                  <td className="p-3.5 font-bold text-tinta">
                    {mat.name}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-kabut border border-garis text-tinta">
                      {mat.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-teks-sekunder font-medium">
                    {mat.defaultUnit}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-celup-indigo tabular-nums text-sm">
                    {mat.stockOnHand.toLocaleString("id-ID")} {mat.defaultUnit}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-tinta tabular-nums">
                    {mat.clientCount} Klien
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href="/warehouse"
                      className="px-2.5 py-1 bg-kabut text-celup-indigo font-bold text-[11px] rounded hover:bg-garis inline-flex items-center gap-1"
                    >
                      <span>Lihat Lot Gudang</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Bahan Baku */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Tambah Master Bahan Baku</h3>
                <p className="text-xs text-white/80">Daftarkan SKU baru ke katalog induk pabrik Lukla</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">SKU Tag (Otomatis jika kosong):</label>
                  <input
                    type="text"
                    placeholder="Contoh: RM-0006"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-celup-indigo bg-lembar uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Kategori Material:</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="Kain Utama">Kain Utama</option>
                    <option value="Pelapis & Busa">Pelapis &amp; Busa</option>
                    <option value="Hardware & Resleting">Hardware &amp; Resleting</option>
                    <option value="Webbing & Tali">Webbing &amp; Tali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  placeholder="Contoh: Taslan Milky Waterproof Grey"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Satuan Dasar:</label>
                  <select
                    value={form.defaultUnit}
                    onChange={(e) => setForm({ ...form, defaultUnit: e.target.value })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="Meter">Meter</option>
                    <option value="Yard">Yard</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Roll">Roll</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Stok Awal di Gudang:</label>
                  <input
                    type="number"
                    value={form.stockOnHand}
                    onChange={(e) => setForm({ ...form, stockOnHand: Number(e.target.value) })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-tinta bg-lembar"
                    min="0"
                    required
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
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
