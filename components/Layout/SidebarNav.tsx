"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bot, 
  ClipboardList, 
  Building2, 
  Timer, 
  Layers, 
  Boxes, 
  Package, 
  Gift, 
  FileText, 
  Cpu, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Receipt, 
  FileSpreadsheet, 
  Users, 
  Menu, 
  X,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Role } from "@/lib/types";
import { ROLE_ALLOWED_ROUTES } from "./RoleContext";
import { 
  getPendingMassOrders, 
  getPurchaseOrders, 
  getQcQueue, 
  getFinishedGoods,
  getUnverifiedOutputs
} from "@/lib/dataBus";

interface SidebarNavProps {
  currentRole: Role;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: () => number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentRole }) => {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [counts, setCounts] = useState({
    pendingOrders: 0,
    pendingPOs: 0,
    waitingQC: 0,
    readyFinishedGoods: 0,
    unverifiedOutputs: 0,
  });

  const refreshCounts = () => {
    try {
      const pendingOrders = getPendingMassOrders().length;
      const pendingPOs = getPurchaseOrders().filter((p) => p.status === "PENDING").length;
      const waitingQC = getQcQueue().filter((q) => q.status === "WAITING" || q.status === "REINSPECTION_PENDING").length;
      const readyFinishedGoods = getFinishedGoods().filter((f) => f.status === "READY_FOR_WAREHOUSE").length;
      const unverifiedOutputs = getUnverifiedOutputs().filter((u) => u.status === "PENDING").length;
      setCounts({ pendingOrders, pendingPOs, waitingQC, readyFinishedGoods, unverifiedOutputs });
    } catch {}
  };

  useEffect(() => {
    refreshCounts();
    const handleBusUpdate = () => refreshCounts();
    window.addEventListener("lukla_bus_update", handleBusUpdate);
    window.addEventListener("storage", handleBusUpdate);
    return () => {
      window.removeEventListener("lukla_bus_update", handleBusUpdate);
      window.removeEventListener("storage", handleBusUpdate);
    };
  }, []);

  // Define full navigation sections matching TestLukia-main
  const NAV_SECTIONS: NavSection[] = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/assistant", label: "Asisten AI", icon: Bot },
      ],
    },
    {
      title: "Operasional",
      items: [
        { 
          href: "/orders", 
          label: "Pesanan", 
          icon: ClipboardList,
          badge: () => counts.pendingOrders,
        },
        { href: "/clients", label: "Klien", icon: Building2 },
        { href: "/samples", label: "Sampel & SMV", icon: Timer },
        { href: "/catalog", label: "Katalog Produk", icon: Layers },
        { href: "/raw-materials", label: "Katalog Bahan", icon: Boxes },
        { href: "/warehouse", label: "Gudang & Cutting", icon: Package },
        { 
          href: "/warehouse/finished", 
          label: "Barang Jadi", 
          icon: Gift,
          badge: () => counts.readyFinishedGoods,
        },
        { 
          href: "/warehouse/purchase-orders", 
          label: "PO Bahan Baku", 
          icon: FileText,
          badge: () => counts.pendingPOs,
        },
      ],
    },
    {
      title: "Produksi",
      items: [
        { 
          href: "/production", 
          label: "Lini Produksi", 
          icon: Cpu,
          badge: () => counts.unverifiedOutputs,
        },
        { href: "/production/terminal", label: "Terminal 30 Menit", icon: Clock },
        { href: "/rate-cards", label: "Rate Cards", icon: DollarSign },
      ],
    },
    {
      title: "Kualitas & Bayar",
      items: [
        { 
          href: "/qc", 
          label: "QC Overview", 
          icon: CheckCircle2,
          badge: () => counts.waitingQC,
        },
        { href: "/qc/terminal", label: "Terminal QC", icon: CheckCircle2 },
        { href: "/payroll", label: "Payroll", icon: Receipt },
        { href: "/invoices", label: "Invoice", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Administrasi",
      items: [
        { href: "/users", label: "Pengguna & Akses", icon: Users },
      ],
    },
    {
      title: "Portal Klien",
      items: [
        { href: "/b2b-portal", label: "Portal B2B", icon: ShieldCheck },
      ],
    },
  ];

  // RBAC Filter
  const allowed = ROLE_ALLOWED_ROUTES[currentRole] || ROLE_ALLOWED_ROUTES.OWNER;
  const isAllowed = (href: string) => {
    return allowed.some((route) => href === route || href.startsWith(route));
  };

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => isAllowed(item.href)),
  })).filter((section) => section.items.length > 0);

  // Quick items for mobile bottom bar (top 4 allowed)
  const mobileQuickItems = visibleSections.flatMap((s) => s.items).slice(0, 4);

  return (
    <>
      {/* ── Desktop Industrial Sidebar (w-60 / 240px) ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-garis flex-shrink-0 min-h-[calc(100vh-3.5rem)] select-none">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-teks-sekunder">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  const badgeVal = item.badge ? item.badge() : 0;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center justify-between rounded-work px-2.5 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-celup-indigo text-white font-bold shadow-hard-indigo"
                            : "text-tinta hover:bg-kabut hover:text-celup-indigo"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-kapur" : "text-teks-sekunder group-hover:text-celup-indigo"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {badgeVal > 0 && (
                          <span
                            className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                              isActive ? "bg-kapur text-celup-indigo" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {badgeVal}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-garis text-[10px] text-teks-sekunder flex items-center justify-between bg-lembar">
          <span className="font-mono">Lukla Engine v2.4</span>
          <span className="font-semibold text-celup-indigo">{currentRole}</span>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (≤ md) ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-garis z-30 flex items-center justify-around px-2 shadow-lg select-none">
        {mobileQuickItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-w-[48px] max-w-[80px] flex flex-col items-center justify-center py-1 px-0.5 rounded transition-all ${
                isActive ? "text-celup-indigo font-bold" : "text-teks-sekunder hover:text-celup-indigo"
              }`}
            >
              <div
                className={`p-1 rounded-field transition-all ${
                  isActive ? "bg-kapur text-celup-indigo shadow-sm scale-105" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] mt-0.5 truncate leading-tight text-center">{item.label}</span>
            </Link>
          );
        })}

        {/* Mobile Full Menu Toggle */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex-1 min-w-[48px] max-w-[80px] flex flex-col items-center justify-center py-1 px-0.5 rounded text-teks-sekunder hover:text-celup-indigo transition-all"
        >
          <div className="p-1 rounded-field">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[9px] mt-0.5 leading-tight text-center font-medium">Menu</span>
        </button>
      </nav>

      {/* ── Mobile Slide-Over Drawer for Full Menu ────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-tinta/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-garis bg-lembar">
              <div>
                <h3 className="font-bold text-celup-indigo text-sm">Navigasi Operasional</h3>
                <p className="text-[10px] text-teks-sekunder">Peran: {currentRole}</p>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-kabut flex items-center justify-center text-tinta hover:bg-garis"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {visibleSections.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teks-sekunder mb-1">
                    {section.title}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                      const badgeVal = item.badge ? item.badge() : 0;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`flex items-center justify-between p-2.5 rounded-work text-xs font-medium transition-all ${
                              isActive
                                ? "bg-celup-indigo text-white font-bold shadow-hard-indigo"
                                : "text-tinta hover:bg-kabut"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`w-4 h-4 ${isActive ? "text-kapur" : "text-teks-sekunder"}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {badgeVal > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 font-mono">
                                  {badgeVal}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-kapur" : "text-teks-sekunder"}`} />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-garis bg-lembar text-center text-[10px] text-teks-sekunder font-mono">
              Lukla Operations Engine · Multi-Tenant
            </div>
          </div>
        </div>
      )}
    </>
  );
};
