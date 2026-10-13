"use client";

import React, { useState } from "react";
import { Role } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";
import { AiAssistantDrawer } from "../AiAssistantDrawer";

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>("OWNER");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMobileSimulated, setIsMobileSimulated] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-kabut">
      <AppHeader
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onToggleAi={() => setIsAiOpen(true)}
        isMobileSimulated={isMobileSimulated}
        onToggleMobileSim={() => setIsMobileSimulated((prev) => !prev)}
      />

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
};
