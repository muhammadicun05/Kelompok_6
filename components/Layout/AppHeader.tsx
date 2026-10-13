"use client";

import React from "react";
import { Role } from "@/lib/types";
import { Sparkles, Users, Smartphone, Monitor, Factory } from "lucide-react";

interface AppHeaderProps {
  currentRole: Role;
  onRoleChange: (newRole: Role) => void;
  onToggleAi: () => void;
  isMobileSimulated: boolean;
  onToggleMobileSim: () => void;
}

const ROLES_LIST: { id: Role; label: string; badge: string }[] = [
  { id: "OWNER", label: "Pak Dedi (Owner)", badge: "Executive" },
  { id: "SAMPLE_TEAM", label: "Mbak Lina (Master Sample)", badge: "Fase 1" },
  { id: "WAREHOUSE", label: "Kang Asep (Kepala Gudang)", badge: "Fase 3" },
  { id: "PRODUCTION_HEAD_MANDOR", label: "Pak Jajang / Mandor Ujang", badge: "Fase 4" },
  { id: "TAILOR_OPERATOR", label: "Siti Rahma (Penjahit #01)", badge: "Lantai" },
  { id: "QC_INSPECTOR", label: "Teh Reni (QC Inspector)", badge: "Fase 5" },
  { id: "FINANCE_PAYROLL", label: "Bu Sari (Finance & Payroll)", badge: "Fase 6" },
  { id: "B2B_CLIENT", label: "Pak Hendra (Klien Maklon A)", badge: "Portal B2B" },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentRole,
  onRoleChange,
  onToggleAi,
  isMobileSimulated,
  onToggleMobileSim,
}) => {
  return (
    <header className="h-14 bg-white border-b border-garis px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-work bg-celup-indigo flex items-center justify-center text-white font-bold text-sm tracking-widest shadow-sm">
          LK
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-celup-indigo tracking-tight">
              Lukla Operations Engine
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono bg-kabut px-1.5 py-0.5 rounded text-teks-sekunder">
              Ciwidey ±70 Mesin
            </span>
          </div>
        </div>
      </div>

      {/* Control Right Bar */}
      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-kabut px-2 py-1 rounded-field border border-garis max-w-[140px] sm:max-w-none">
          <Users className="w-3.5 h-3.5 text-celup-indigo hidden sm:block flex-shrink-0" />
          <span className="text-[11px] font-semibold text-teks-sekunder hidden md:inline flex-shrink-0">Peran:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="text-xs font-semibold bg-transparent text-celup-indigo focus:outline-none cursor-pointer truncate max-w-[120px] sm:max-w-none"
          >
            {ROLES_LIST.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Viewport Simulation Toggle */}
        <button
          onClick={onToggleMobileSim}
          title={isMobileSimulated ? "Kembali ke Desktop View" : "Simulasikan Tampilan Layar HP/Tablet"}
          className={`p-1.5 rounded-field border text-xs font-medium flex-shrink-0 items-center gap-1 transition-all hidden sm:flex ${
            isMobileSimulated
              ? "bg-kapur border-celup-indigo text-celup-indigo"
              : "bg-white border-garis text-teks-sekunder hover:border-celup-indigo"
          }`}
        >
          {isMobileSimulated ? (
            <>
              <Smartphone className="w-4 h-4 text-celup-indigo" />
              <span className="hidden sm:inline text-[11px]">Mode Mobile</span>
            </>
          ) : (
            <>
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Desktop</span>
            </>
          )}
        </button>

        {/* Tanya Lukla AI Button */}
        <button
          onClick={onToggleAi}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-field bg-celup-indigo text-white font-medium text-xs hover:bg-celup-indigo/90 shadow-hard transition-all active:translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-kapur" />
          <span>Tanya AI</span>
        </button>
      </div>
    </header>
  );
};
