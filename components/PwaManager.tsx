"use client";

import React, { useEffect, useState } from "react";
import { Download, RefreshCw, CheckCircle2, Smartphone, Monitor } from "lucide-react";

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      setIsInstalled(!!isStandalone);

      // Register Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").then((reg) => {
          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setWaitingWorker(newWorker);
                }
              });
            }
          });
        }).catch((err) => {
          console.warn("SW Registration skipped:", err.message);
        });
      }

      // Listen for install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleUpdateClick = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Update Available Toast Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 right-4 z-50 bg-celup-indigo text-white px-4 py-3 rounded-work shadow-2xl border border-garis flex items-center gap-3 animate-bounce">
          <RefreshCw className="w-4 h-4 text-kapur animate-spin" />
          <div className="text-xs">
            <div className="font-bold">Pembaruan Sistem Tersedia</div>
            <div className="text-[10px] text-teks-terang/80">Versi terbaru telah siap diunduh</div>
          </div>
          <button
            onClick={handleUpdateClick}
            className="px-3 py-1 bg-kapur text-celup-indigo font-bold text-xs rounded hover:bg-white transition-all shadow-sm"
          >
            Segarkan
          </button>
        </div>
      )}

      {/* Floating Install App Button (if browser supports install prompt and not yet installed) */}
      {isInstallable && !isInstalled && (
        <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-white text-celup-indigo font-bold text-xs rounded-field shadow-hard border border-garis hover:bg-kabut flex items-center gap-2 transition-all active:translate-y-0.5"
            title="Download & Install aplikasi Lukla Ops ke desktop atau tablet"
          >
            <Download className="w-3.5 h-3.5 text-celup-indigo" />
            <span>Install Aplikasi (Desktop/Mobile)</span>
          </button>
        </div>
      )}
    </>
  );
}
