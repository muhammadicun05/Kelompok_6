"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "@/lib/types";

export const ROLE_DEFAULT_ROUTES: Record<Role, string> = {
  OWNER: "/dashboard",
  SAMPLE_TEAM: "/samples",
  WAREHOUSE: "/warehouse",
  PRODUCTION_HEAD_MANDOR: "/production/terminal",
  TAILOR_OPERATOR: "/production/terminal",
  QC_INSPECTOR: "/qc/terminal",
  FINANCE_PAYROLL: "/payroll",
  B2B_CLIENT: "/b2b-portal",
};

export const ROLE_ALLOWED_ROUTES: Record<Role, string[]> = {
  OWNER: ["/dashboard", "/samples", "/warehouse", "/production/terminal", "/qc/terminal", "/payroll", "/b2b-portal"],
  SAMPLE_TEAM: ["/samples", "/dashboard"],
  WAREHOUSE: ["/warehouse", "/dashboard"],
  PRODUCTION_HEAD_MANDOR: ["/production/terminal", "/warehouse", "/qc/terminal", "/dashboard"],
  TAILOR_OPERATOR: ["/production/terminal"],
  QC_INSPECTOR: ["/qc/terminal", "/dashboard"],
  FINANCE_PAYROLL: ["/payroll", "/dashboard"],
  B2B_CLIENT: ["/b2b-portal"],
};

interface RoleContextType {
  currentRole: Role;
  setRole: (role: Role) => void;
  isMobileSimulated: boolean;
  toggleMobileSim: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>("OWNER");
  const [isMobileSimulated, setIsMobileSimulated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lukla_current_role") as Role;
      if (saved && ROLE_DEFAULT_ROUTES[saved]) {
        setCurrentRole(saved);
      }
    }
  }, []);

  const setRole = (newRole: Role) => {
    setCurrentRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("lukla_current_role", newRole);
    }
    // Automatically navigate to the role's primary landing workspace
    const targetRoute = ROLE_DEFAULT_ROUTES[newRole] || "/dashboard";
    router.push(targetRoute);
  };

  const toggleMobileSim = () => {
    setIsMobileSimulated((prev) => !prev);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        isMobileSimulated,
        toggleMobileSim,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
