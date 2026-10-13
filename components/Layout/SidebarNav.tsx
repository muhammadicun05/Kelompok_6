"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Timer, 
  Package, 
  Activity, 
  CheckCircle2, 
  Receipt, 
  Building2 
} from "lucide-react";
import { Role } from "@/lib/types";

interface SidebarNavProps {
  currentRole: Role;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/samples", label: "Sampel", icon: Timer },
  { href: "/warehouse", label: "Gudang", icon: Package },
  { href: "/production/terminal", label: "Lini 30m", icon: Activity },
  { href: "/qc/terminal", label: "QC", icon: CheckCircle2 },
  { href: "/payroll", label: "Payroll", icon: Receipt },
  { href: "/b2b-portal", label: "Portal B2B", icon: Building2 },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentRole }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop 72px Industrial Nav (Section 9.1) */}
      <aside className="hidden md:flex flex-col items-center w-[76px] bg-white border-r border-garis py-4 gap-2 flex-shrink-0 min-h-[calc(100vh-3.5rem)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-14 h-14 rounded-work flex flex-col items-center justify-center gap-1 transition-all text-center ${
                isActive
                  ? "bg-celup-indigo text-white shadow-hard-indigo"
                  : "text-teks-sekunder hover:bg-kabut hover:text-celup-indigo"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </aside>

      {/* Mobile Sticky Bottom Bar (Section 9.2) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-garis z-30 flex items-center justify-around px-2 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 rounded transition-all ${
                isActive
                  ? "text-celup-indigo font-bold"
                  : "text-teks-sekunder hover:text-celup-indigo"
              }`}
            >
              <div
                className={`p-1 rounded-field ${
                  isActive ? "bg-kapur text-celup-indigo" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
