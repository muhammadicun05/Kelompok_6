"use client";

import React from "react";
import { Role } from "@/lib/types";
import { Sparkles, Users, Smartphone, Monitor, Factory, Bot } from "lucide-react";

interface AppHeaderProps {
  currentRole: Role;
  onRoleChange: (newRole: Role) => void;
  onToggleAi: () => void;
  onToggleTelegram?: () => void;
  isMobileSimulated: boolean;
  onToggleMobileSim: () => void;
}

const ROLES_LIST: { id: Role; label: string; badge: string }[] = [
  { id: "OWNER", label: "Pak Dedi (Owner)", badge: "Executive" },
  { id: "SAMPLE_TEAM", label: "Mbak Lina (Master Sample)", badge: "Fase 1" },
  { id: "WAREHOUSE", label: "Kang Asep (Kepala Gudang)", badge: "Fase 3" },
  { id: "PRODUCTION_HEAD_MANDOR", label: "Pak Jajang / Mandor Ujang", badge: "Fase 4 (Mandor)" },
  { id: "TAILOR_OPERATOR", label: "Siti Rahma (Penjahit #01 - Operator)", badge: "Operator" },
  { id: "TAILOR_ASSEMBLY", label: "Rina Marlina (Penjahit #02 - Assembly)", badge: "Assembly" },
  { id: "QC_INSPECTOR", label: "Teh Reni (QC Inspector)", badge: "Fase 5" },
  { id: "FINANCE_PAYROLL", label: "Bu Sari (Finance & Payroll)", badge: "Fase 6" },
  { id: "B2B_CLIENT", label: "Pak Hendra (Klien Maklon A)", badge: "Portal B2B" },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentRole,
  onRoleChange,
  onToggleAi,
  onToggleTelegram,
  isMobileSimulated,
  onToggleMobileSim,
}) => {
  return (
    <header className="h-14 bg-white border-b border-garis px-2.5 sm:px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="h-9 w-9 flex items-center justify-center flex-shrink-0">
          <img
            src="/lukla-logo.png"
            alt="Lukla Manufacturing"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-bold text-celup-indigo tracking-tight truncate">
              <span className="inline sm:hidden">Lukla Ops</span>
              <span className="hidden sm:inline">Lukla Operations Engine</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono bg-kabut px-1.5 py-0.5 rounded text-teks-sekunder flex-shrink-0">
              Sistem Operasional
            </span>
          </div>
        </div>
      </div>

      {/* Control Right Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-kabut px-1.5 sm:px-2 py-1 rounded-field border border-garis max-w-[135px] sm:max-w-none">
          <Users className="w-3.5 h-3.5 text-celup-indigo hidden sm:block flex-shrink-0" />
          <span className="text-[11px] font-semibold text-teks-sekunder hidden lg:inline flex-shrink-0">Peran:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="text-[11px] sm:text-xs font-semibold bg-transparent text-celup-indigo focus:outline-none cursor-pointer truncate max-w-[125px] sm:max-w-none"
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

        {/* Telegram Bot Button */}
        {onToggleTelegram && (
          <button
            onClick={onToggleTelegram}
            title="Integrasi Notifikasi & Approval Telegram Bot"
            className="flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-field bg-white border border-garis text-celup-indigo hover:border-celup-indigo font-medium text-xs shadow-sm transition-all active:translate-y-0.5"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="hidden sm:inline">Bot Telegram</span>
          </button>
        )}

        {/* Tanya Lukla AI Button */}
        <button
          onClick={onToggleAi}
          className="flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-field bg-celup-indigo text-white font-medium text-xs hover:bg-celup-indigo/90 shadow-hard transition-all active:translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-kapur flex-shrink-0" />
          <span>Tanya AI</span>
        </button>
      </div>
    </header>
  );
};
