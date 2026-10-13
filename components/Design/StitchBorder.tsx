"use client";

import React from "react";
import { Check, Clock, AlertCircle, Lock } from "lucide-react";

export type StitchStatus = "PENDING" | "VERIFIED" | "MENUNGGU_QC" | "LOCKED";

interface StitchBorderProps {
  status: StitchStatus;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StitchBorder: React.FC<StitchBorderProps> = ({
  status,
  children,
  className = "",
  onClick,
}) => {
  let borderStyle = "";
  let badge = null;

  switch (status) {
    case "PENDING":
      borderStyle = "border-2 border-dashed border-celup-indigo bg-lembar";
      badge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-celup-indigo bg-kabut px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          Pending Verifikasi
        </span>
      );
      break;
    case "VERIFIED":
      borderStyle = "border-2 border-solid border-celup-indigo bg-white";
      badge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-status-lolos px-2 py-0.5 rounded-full">
          <Check className="w-3 h-3 stroke-[3]" />
          Verified
        </span>
      );
      break;
    case "MENUNGGU_QC":
      borderStyle = "border-2 border-solid border-status-info bg-white";
      badge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-status-info px-2 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3" />
          Menunggu QC
        </span>
      );
      break;
    case "LOCKED":
      borderStyle = "border border-solid border-benang-abu bg-kabut opacity-80";
      badge = (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teks-sekunder bg-white px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3" />
          Terkunci
        </span>
      );
      break;
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-work p-3 transition-all ${borderStyle} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {badge}
      </div>
      <div>{children}</div>
    </div>
  );
};
