"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ClipboardList, 
  X, 
  ShieldCheck,
  Check
} from "lucide-react";
import { getClients, saveClient, ClientRecord } from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function ClientsPage() {
  const { currentRole } = useRole();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "b2b" as "internal" | "b2b",
    contactPerson: "",
    contactPhone: "",
    email: "",
    address: "",
  });

  const loadData = () => {
    setClients(getClients());
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

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;

    saveClient({
      id: `cli-${Date.now()}`,
      code: form.code.toUpperCase().trim(),
      name: form.name.trim(),
      type: form.type,
      contactPerson: form.contactPerson.trim(),
      contactPhone: form.contactPhone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      activeOrdersCount: 0,
      createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    });

    setShowModal(false);
    setForm({ code: "", name: "", type: "b2b", contactPerson: "", contactPhone: "", email: "", address: "" });
    alert(`Klien ${form.name} berhasil didaftarkan ke sistem!`);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = currentRole === "OWNER" || currentRole === "SAMPLE_TEAM";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Building2 className="w-6 h-6 text-celup-indigo" />
            <span>Direktori Klien Maklon &amp; Brand</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Master database klien multi-tenant, isolasi stok bahan baku (FR-6.1), dan riwayat pesanan
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-celup-indigo text-white font-bold text-xs rounded-work shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-kapur" />
            <span>+ Daftarkan Klien Baru</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama klien, kode, atau kontak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
        <span className="text-xs font-semibold text-teks-sekunder hidden sm:inline">
          {clients.length} Klien Terdaftar
        </span>
      </div>

      {/* Clients Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4 hover:border-celup-indigo/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-garis pb-3">
                <div>
                  <h3 className="font-bold text-sm text-celup-indigo">{client.name}</h3>
                  <div className="font-mono text-[11px] font-bold text-teks-sekunder mt-0.5">
                    Kode: <span className="text-celup-indigo bg-kabut px-1.5 py-0.5 rounded">{client.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    client.type === "internal"
                      ? "bg-celup-indigo/10 text-celup-indigo"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {client.type === "internal" ? "Brand Internal" : "Klien Maklon B2B"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-tinta">
                {client.contactPerson && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teks-sekunder min-w-[70px]">Kontak:</span>
                    <span className="font-medium truncate">{client.contactPerson}</span>
                  </div>
                )}
                {client.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teks-sekunder flex-shrink-0" />
                    <span className="font-mono">{client.contactPhone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-teks-sekunder flex-shrink-0" />
                    <span className="text-teks-sekunder truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teks-sekunder flex-shrink-0 mt-0.5" />
                    <span className="text-teks-sekunder leading-relaxed line-clamp-2">{client.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-garis flex items-center justify-between text-xs">
              <span className="text-teks-sekunder">
                Pesanan Aktif: <strong className="text-celup-indigo font-mono">{client.activeOrdersCount || 1}</strong>
              </span>

              <Link
                href={`/orders`}
                className="text-celup-indigo font-bold hover:underline flex items-center gap-1"
              >
                <span>Lihat Pesanan →</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Tambah Klien */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-work border-2 border-celup-indigo shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-celup-indigo text-white">
              <div>
                <h3 className="font-bold text-sm">Daftarkan Klien Baru</h3>
                <p className="text-xs text-white/80">Masukkan informasi klien untuk tag anti-kontaminasi multi-tenant</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Kode Klien (Singkat / Monogram):</label>
                  <input
                    type="text"
                    placeholder="Contoh: KLIEN_C"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-garis rounded p-2 font-mono font-bold text-celup-indigo bg-lembar uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Tipe Klien:</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full border border-garis rounded p-2 text-celup-indigo font-bold bg-lembar"
                  >
                    <option value="b2b">Klien Maklon B2B (Eksternal)</option>
                    <option value="internal">Brand Internal (Snøhund)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Nama Perusahaan / Brand:</label>
                <input
                  type="text"
                  placeholder="Contoh: PT Surya Tekstil Makmur"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-garis rounded p-2 font-semibold text-tinta bg-lembar"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Nama Kontak Person (PIC):</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Ridwan"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full border border-garis rounded p-2 text-tinta bg-lembar"
                  />
                </div>

                <div>
                  <label className="font-bold text-teks-sekunder block mb-1">Nomor Telepon / WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-9988-7766"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-garis rounded p-2 font-mono text-tinta bg-lembar"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Email Resmi:</label>
                <input
                  type="email"
                  placeholder="Contoh: sourcing@suryatekstil.co.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-garis rounded p-2 text-tinta bg-lembar"
                />
              </div>

              <div>
                <label className="font-bold text-teks-sekunder block mb-1">Alamat Pabrik / Kantor Klien:</label>
                <textarea
                  placeholder="Contoh: Jl. Industri Cimahi No. 12, Bandung"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
