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
  switch (clientCode) {
    case "SNOHUND":
      return "#5FA0C8"; // Biru es
    case "KLIEN_A":
      return "#7A5BB0"; // Ungu
    case "KLIEN_B":
      return "#BE3F7C"; // Magenta
    default:
      return "#6E7480"; // Batu
  }
}

export function getClientMonogram(clientCode?: string): string {
  switch (clientCode) {
    case "SNOHUND":
      return "SH";
    case "KLIEN_A":
      return "KA";
    case "KLIEN_B":
      return "KB";
    default:
      return (clientCode || "LK").slice(0, 2).toUpperCase();
  }
}

export const ThreadEdge: React.FC<ThreadEdgeProps> = ({
  clientCode,
  clientName,
  colorHex,
  children,
  className = "",
}) => {
  const threadColor = colorHex || getClientColor(clientCode);
  const monogram = getClientMonogram(clientCode);

  return (
    <div
      className={`relative flex items-center border-l-4 ${className}`}
      style={{ borderLeftColor: threadColor }}
    >
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const ClientTag: React.FC<{ clientCode?: string; clientName?: string; colorHex?: string; className?: string }> = ({
  clientCode,
  clientName,
  colorHex,
  className = "",
}) => {
  const threadColor = colorHex || getClientColor(clientCode);
  const monogram = getClientMonogram(clientCode);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-white rounded-work max-w-full ${className}`}
      style={{
        backgroundColor: threadColor,
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
      }}
    >
      <span className="font-bold tracking-wider flex-shrink-0">{monogram}</span>
      {clientName && <span className="opacity-90 truncate max-w-[110px] sm:max-w-none">{clientName}</span>}
    </span>
  );
};
