"use client";

import React from "react";

interface ThreadEdgeProps {
  clientCode?: string;
  clientName?: string;
  colorHex?: string;
  children: React.ReactNode;
  className?: string;
}

export function getClientColor(clientCode?: string): string {
  return clientCode === "SNOHUND" ? "#26325B" : "#475569";
}

export function getClientMonogram(clientCode?: string): string {
  return clientCode === "SNOHUND" ? "Internal" : "B2B";
}

export const ThreadEdge: React.FC<ThreadEdgeProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export const ClientTag: React.FC<{
  clientCode?: string;
  clientName?: string;
  colorHex?: string;
  className?: string;
}> = ({ clientCode, clientName, className = "" }) => {
  const isInternal = clientCode === "SNOHUND";
  const displayLabel =
    clientName ||
    (isInternal
      ? "Snøhund Alpine Wear"
      : clientCode === "KLIEN_A"
      ? "PT Bandung Apparel"
      : clientCode === "KLIEN_B"
      ? "CV Priangan Outdoor"
      : clientCode || "Klien B2B");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded border max-w-full ${
        isInternal
          ? "bg-celup-indigo/10 text-celup-indigo border-celup-indigo/30"
          : "bg-kabut text-tinta border-garis"
      } ${className}`}
    >
      <span className="truncate max-w-[140px] sm:max-w-none font-bold">{displayLabel}</span>
      <span
        className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider flex-shrink-0 ${
          isInternal
            ? "bg-celup-indigo text-white"
            : "bg-white text-teks-sekunder border border-garis"
        }`}
      >
        {isInternal ? "Internal" : "B2B"}
      </span>
    </span>
  );
};

