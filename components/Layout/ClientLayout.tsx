"use client";

import React, { useState } from "react";
import { Role } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";
import { AiAssistantDrawer } from "../AiAssistantDrawer";
import { usePathname } from "next/navigation";
import { UserCheck, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { RoleProvider, useRole, ROLE_ALLOWED_ROUTES, ROLE_DEFAULT_ROUTES } from "./RoleContext";

const ROLE_INFO: Record<Role, { name: string; desc: string; color: string }> = {
  OWNER: { name: "Pak Dedi (Owner)", desc: "Akses Penuh Seluruh Lini & Kebijakan", color: "#26325B" },
  SAMPLE_TEAM: { name: "Mbak Lina (Master Sample)", desc: "Fase 1: Time Study Stopwatch & BOM", color: "#2F5FA8" },
  WAREHOUSE: { name: "Kang Asep (Kepala Gudang)", desc: "Fase 3: Multi-Tenant & Scanner Anti-Kontaminasi", color: "#1F7A4D" },
  PRODUCTION_HEAD_MANDOR: { name: "Pak Jajang / Mandor Ujang", desc: "Fase 4: Verifikasi Output 30 Menit", color: "#A86A00" },
  TAILOR_OPERATOR: { name: "Siti Rahma (Penjahit #01)", desc: "Fase 4: Input Output Numpad (Pending)", color: "#7A5BB0" },
  QC_INSPECTOR: { name: "Teh Reni (QC Inspector)", desc: "Fase 5: Inspeksi Produk Utuh & Bonus QC", color: "#1F7A4D" },
  FINANCE_PAYROLL: { name: "Bu Sari (Finance & Payroll)", desc: "Fase 6: Rekap Gaji Sabtu & Uang Makan", color: "#26325B" },
  B2B_CLIENT: { name: "Pak Hendra (Klien Maklon A)", desc: "Portal Klien B2B", color: "#7A5BB0" },
};

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { currentRole, setRole, isMobileSimulated, toggleMobileSim } = useRole();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const pathname = usePathname();
  const info = ROLE_INFO[currentRole] || ROLE_INFO.OWNER;

  const allowedRoutes = ROLE_ALLOWED_ROUTES[currentRole] || ROLE_ALLOWED_ROUTES.OWNER;
  const isRouteAllowed =
    allowedRoutes.some((route) => pathname === route || (route !== "/dashboard" && pathname.startsWith(route))) ||
    pathname === "/";

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
        className="bg-white border-b border-garis px-2.5 sm:px-4 py-1.5 flex items-center justify-between text-xs gap-2 min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: info.color }}
          ></span>
          <span className="font-bold text-celup-indigo truncate">{info.name}</span>
          <span className="text-teks-sekunder hidden md:inline truncate">• {info.desc}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {currentRole === "B2B_CLIENT" ? (
            <span className="text-[10px] sm:text-[11px] font-bold text-status-lolos flex items-center gap-1 bg-kabut px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Akses Klien Terverifikasi</span>
              <span className="sr-only">Multi-Tenant RLS Terkunci</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-mono text-teks-sekunder hidden sm:inline whitespace-nowrap">
              Operasional Pabrik
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <SidebarNav currentRole={currentRole} />

        {/* Content area: if simulated mobile is on, render in a 390x844 smartphone bezel frame */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-6 flex justify-center">
          {!isRouteAllowed ? (
            <div className="bg-white border-2 border-status-cacat rounded-work p-8 max-w-lg mx-auto text-center shadow-hard my-8 self-center">
              <div className="w-12 h-12 bg-status-cacat/10 text-status-cacat rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-celup-indigo mb-1">
                Akses Terbatas (RBAC Terkunci)
              </h2>
              <p className="text-xs text-teks-sekunder mb-4 leading-relaxed">
                Peran aktif Anda saat ini (<strong className="text-tinta">{info.name}</strong>) tidak memiliki hak akses operasional untuk membuka halaman <code className="font-mono bg-kabut px-1.5 py-0.5 rounded text-celup-indigo">{pathname}</code>.
              </p>
              <button
                onClick={() => setRole(currentRole)}
                className="px-4 py-2.5 bg-celup-indigo text-white font-bold text-xs rounded-field shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-2 mx-auto"
              >
                <span>Buka Workspace Resmi ({ROLE_DEFAULT_ROUTES[currentRole]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isMobileSimulated ? (
            <div className="w-[390px] max-w-full min-h-[844px] bg-white border-4 border-celup-indigo rounded-[36px] p-4 shadow-2xl relative overflow-y-auto overflow-x-hidden my-4 flex flex-col mobile-frame-sim">
              <div className="w-32 h-4 bg-celup-indigo rounded-full mx-auto mb-3 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">{children}</div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto min-w-0">{children}</div>
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
