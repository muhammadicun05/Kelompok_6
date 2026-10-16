"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  ShieldAlert, 
  X,
  Lock
} from "lucide-react";
import { getUserAccounts, UserAccountRecord } from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function UsersPage() {
  const { currentRole } = useRole();
  const [users, setUsers] = useState<UserAccountRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setUsers(getUserAccounts());
    const handleBusUpdate = () => setUsers(getUserAccounts());
    window.addEventListener("lukla_bus_update", handleBusUpdate);
    window.addEventListener("storage", handleBusUpdate);
    return () => {
      window.removeEventListener("lukla_bus_update", handleBusUpdate);
      window.removeEventListener("storage", handleBusUpdate);
    };
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Users className="w-6 h-6 text-celup-indigo" />
            <span>Manajemen Pengguna &amp; Matriks RBAC 8 Role</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Konfigurasi otorisasi peran pengguna dan batas kewenangan operasional pabrik Lukla
          </p>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-work border border-garis shadow-hard overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-garis pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, email, atau peran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
            />
          </div>
          <span className="text-xs font-semibold text-teks-sekunder">
            {users.length} Akun Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Nama Pengguna</th>
                <th className="p-3">Alamat Email</th>
                <th className="p-3">Peran Resmi (Role)</th>
                <th className="p-3">Status Akun</th>
                <th className="p-3">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredUsers.map((user) => {
                const isCurrent = user.role === currentRole;
                return (
                  <tr key={user.id} className="hover:bg-lembar transition-colors">
                    <td className="p-3 font-bold text-tinta">
                      <span>{user.name}</span>
                      {isCurrent && (
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-celup-indigo text-white font-mono">
                          Anda
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-teks-sekunder font-mono">{user.email}</td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-kabut border border-garis text-celup-indigo">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-lolos bg-status-lolos/15 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aktif</span>
                      </span>
                    </td>
                    <td className="p-3 text-teks-sekunder font-mono text-[11px]">{user.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC 8 Role Reference Table */}
      <div className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4">
        <div className="border-b border-garis pb-2.5">
          <h2 className="text-sm font-bold text-celup-indigo">Matriks Otorisasi &amp; Batasan 8 Role (Master Policy)</h2>
          <p className="text-xs text-teks-sekunder">
            Ketentuan hak akses baku sesuai BRD V3 &amp; BPMN 2.0 untuk mencegah kebocoran data dan salah wewenang
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lembar text-teks-sekunder border-b border-garis uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3">Kewenangan Utama</th>
                <th className="p-3">Batasan Mutlak (Sistem Guard)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {[
                {
                  role: "OWNER (Eksekutif)",
                  perms: "Akses analitik eksekutif, persetujuan pesanan massal, penetapan Rate Card, dan konfigurasi master.",
                  limits: "Tidak dapat mengubah histori audit trail transaksi yang telah dikunci.",
                },
                {
                  role: "SAMPLE_TEAM (Tim Sampler)",
                  perms: "Pendaftaran klaim/spesifikasi klien, uji digital stopwatch (SMV), penetapan BOM sampel, konversi ke order massal.",
                  limits: "Tidak dapat menyetujui pesanan massal sendiri tanpa approval Owner.",
                },
                {
                  role: "WAREHOUSE (Kepala Gudang)",
                  perms: "Inbound bahan baku ber-QR, validasi anti-kontaminasi FR-6.2, operasional cutting, penerimaan barang jadi.",
                  limits: "Ditolak seketika oleh sistem (HTTP 403) jika Client ID / Order ID tidak cocok saat pengeluaran bahan.",
                },
                {
                  role: "PRODUCTION_HEAD_MANDOR (Kepala Produksi / Mandor)",
                  perms: "Alokasi penjahit hingga 70 mesin, verifikasi output 30 menit (Dual-Mode), perakitan tas utuh, review rate card.",
                  limits: "Tidak dapat mengubah rumus payroll borongan atau mendistribusikan bonus QC sepihak.",
                },
                {
                  role: "TAILOR_OPERATOR (Penjahit Lini)",
                  perms: "Input kuantitas output komponen setiap 30 menit melalui Numpad Touch Terminal (status Pending Verification).",
                  limits: "Tidak dapat mengedit output yang telah diverifikasi oleh Mandor.",
                },
                {
                  role: "QC_INSPECTOR (Petugas QC)",
                  perms: "Inspeksi 1 produk tas utuh pada Terminal QC dengan 2 keputusan resmi: LOLOS (PASS) atau PERBAIKAN (REPAIR).",
                  limits: "Tidak dapat mengubah harga borongan penjahit; hasil QC tidak memotong gaji borongan.",
                },
                {
                  role: "FINANCE_PAYROLL (Finance & Payroll)",
                  perms: "Rekap gaji borongan Sabtu, kalkulasi uang makan 10-15%, pembagian bonus QC 3-arah, penerbitan invoice PPN 11%, review PO.",
                  limits: "Tidak dapat mengubah stok fisik gudang tanpa dokumen approval operasional.",
                },
                {
                  role: "B2B_CLIENT (Klien Maklon External)",
                  perms: "Portal klien terisolasi: pelacakan stepper 6 fase, saldo live kain titipan, PO komitmen CMT, dan faktur invoice.",
                  limits: "Terisolasi ketat hanya pada client_id miliknya sendiri via Row-Level Security.",
                },
              ].map((item) => (
                <tr key={item.role} className="hover:bg-lembar transition-colors">
                  <td className="p-3 font-bold text-celup-indigo min-w-[180px]">{item.role}</td>
                  <td className="p-3 text-tinta leading-relaxed">{item.perms}</td>
                  <td className="p-3 text-teks-sekunder font-medium leading-relaxed">{item.limits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
