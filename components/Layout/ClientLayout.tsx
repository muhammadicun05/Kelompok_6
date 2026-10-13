"use client";

import React, { useState } from "react";
import { Role } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";
import { AiAssistantDrawer } from "../AiAssistantDrawer";
import { RoleProvider, useRole } from "./RoleContext";
import { UserCheck, ShieldCheck } from "lucide-react";

const ROLE_INFO: Record<Role, { name: string; desc: string; color: string }> = {
  OWNER: { name: "Pak Dedi (Owner)", desc: "Akses Penuh Seluruh Lini & Kebijakan", color: "#26325B" },
  SAMPLE_TEAM: { name: "Mbak Lina (Master Sample)", desc: "Fase 1: Time Study Stopwatch & BOM", color: "#2F5FA8" },
  WAREHOUSE: { name: "Kang Asep (Kepala Gudang)", desc: "Fase 3: Multi-Tenant & Scanner Anti-Kontaminasi", color: "#1F7A4D" },
  PRODUCTION_HEAD_MANDOR: { name: "Pak Jajang / Mandor Ujang", desc: "Fase 4: Verifikasi Output 30 Menit", color: "#A86A00" },
  TAILOR_OPERATOR: { name: "Siti Rahma (Penjahit #01)", desc: "Fase 4: Input Output Numpad (Pending)", color: "#7A5BB0" },
  QC_INSPECTOR: { name: "Teh Reni (QC Inspector)", desc: "Fase 5: Inspeksi Produk Utuh & Bonus QC", color: "#1F7A4D" },
  FINANCE_PAYROLL: { name: "Bu Sari (Finance & Payroll)", desc: "Fase 6: Rekap Gaji Sabtu & Uang Makan", color: "#26325B" },
  B2B_CLIENT: { name: "Pak Hendra (Klien Maklon A)", desc: "Portal B2B Eksternal (Terisolasi Aman)", color: "#7A5BB0" },
};

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { currentRole, setRole, isMobileSimulated, toggleMobileSim } = useRole();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const info = ROLE_INFO[currentRole] || ROLE_INFO.OWNER;

  return (
    <div className="min-h-screen flex flex-col bg-kabut">
      <AppHeader
        currentRole={currentRole}
        onRoleChange={setRole}
        onToggleAi={() => setIsAiOpen(true)}
        isMobileSimulated={isMobileSimulated}
        onToggleMobileSim={toggleMobileSim}
      />

      {/* Active Persona Banner Bar */}
      <div
        data-testid="active-persona-banner"
        className="bg-white border-b border-garis px-4 py-1.5 flex items-center justify-between text-xs"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: info.color }}
          ></span>
          <span className="font-bold text-celup-indigo">{info.name}</span>
          <span className="text-teks-sekunder hidden sm:inline">• {info.desc}</span>
        </div>

        <div className="flex items-center gap-2">
          {currentRole === "B2B_CLIENT" ? (
            <span className="text-[11px] font-bold text-status-lolos flex items-center gap-1 bg-kabut px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant RLS Terkunci</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-teks-sekunder">
              Internal Pabrik Lukla Ciwidey
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <SidebarNav currentRole={currentRole} />

        {/* Content area: if simulated mobile is on, render in a 390x844 smartphone bezel frame */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-6 flex justify-center">
          {isMobileSimulated ? (
            <div className="w-[390px] min-h-[844px] bg-white border-4 border-celup-indigo rounded-[36px] p-4 shadow-2xl relative overflow-y-auto my-4 flex flex-col">
              <div className="w-32 h-4 bg-celup-indigo rounded-full mx-auto mb-3"></div>
              <div className="flex-1">{children}</div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto">{children}</div>
          )}
        </main>
      </div>

      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentRole={currentRole}
      />
    </div>
  );
}

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RoleProvider>
      <InnerLayout>{children}</InnerLayout>
    </RoleProvider>
  );
};
