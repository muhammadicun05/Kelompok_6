"use client";

import React, { useEffect } from "react";
import { AlertOctagon, XCircle } from "lucide-react";
import { ClientTag } from "../Design/ThreadEdge";

interface AntiContaminationModalProps {
  isOpen: boolean;
  sourceClientCode: string;
  sourceClientName: string;
  targetClientCode: string;
  targetClientName: string;
  orderNumber: string;
  reason?: string;
  onClose: () => void;
  onRescan?: () => void;
}

export const AntiContaminationModal: React.FC<AntiContaminationModalProps> = ({
  isOpen,
  sourceClientCode,
  sourceClientName,
  targetClientCode,
  targetClientName,
  orderNumber,
  reason,
  onClose,
  onRescan,
}) => {
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch (e) {
        // Safe fallback if permissions restrict vibration
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-status-cacat text-white"
      style={{ animation: "none" }} // Instant appearance as requested in Section 7.4
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-black/20">
            <AlertOctagon className="w-12 h-12 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengeluaran Dibatalkan!</h2>
          <p className="text-white/90 text-sm mt-1">
            Pencegahan Bahan Tertukar • Validasi Anti-Kontaminasi FR-6.2
          </p>
        </div>

        {/* Colliding Client Tags */}
        <div className="bg-black/25 p-5 rounded-terminal border border-white/20 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="text-right">
              <span className="text-[11px] block uppercase tracking-wider text-white/70 mb-1">
                Bahan Milik
              </span>
              <ClientTag clientCode={sourceClientCode} clientName={sourceClientName} />
            </div>

            <div className="px-2 py-1 bg-white text-status-cacat font-extrabold text-xs rounded-full">
              TIDAK COCOK
            </div>

            <div className="text-left">
              <span className="text-[11px] block uppercase tracking-wider text-white/70 mb-1">
                Pesanan Milik
              </span>
              <ClientTag clientCode={targetClientCode} clientName={targetClientName} />
            </div>
          </div>

          <div className="text-xs text-white/90 pt-2 border-t border-white/10">
            Target Pesanan: <span className="font-mono font-bold">{orderNumber}</span>
          </div>

          {reason && (
            <p className="text-xs text-white/80 italic mt-1 bg-black/20 p-2 rounded">
              {reason}
            </p>
          )}
        </div>

        <div className="text-xs text-white/90">
          Stok kain aman dan tidak berkurang. Sistem otomatis memproteksi kain agar tidak tertukar antar-pesanan klien.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {onRescan && (
            <button
              onClick={onRescan}
              className="px-5 py-3 rounded-work bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-all"
            >
              Pindai Ulang
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-work bg-white text-status-cacat font-bold text-sm shadow-hard transition-all active:translate-y-0.5"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
