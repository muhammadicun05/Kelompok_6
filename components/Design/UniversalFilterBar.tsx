"use client";

import React from "react";
import { Search, Calendar, Filter, X, RotateCcw } from "lucide-react";
import { getClientColor, getClientMonogram } from "./ThreadEdge";

export interface FilterState {
  searchQuery: string;
  clientCode: string; // "ALL" or specific client code
  startDate: string;
  endDate: string;
  datePreset: "ALL" | "TODAY" | "7DAYS" | "MONTH" | "CUSTOM";
}

interface UniversalFilterBarProps {
  filter: FilterState;
  onChange: (newFilter: FilterState) => void;
  searchPlaceholder?: string;
  showDateFilter?: boolean;
  showClientFilter?: boolean;
  className?: string;
  additionalControls?: React.ReactNode;
}

export const CLIENT_CATALOG = [
  { code: "ALL", name: "Semua Klien & Brand", group: "ALL" },
  { code: "SNOHUND", name: "Snøhund (Internal Made-to-Order)", group: "INTERNAL" },
  { code: "KLIEN_A", name: "PT Bintang Tekstil Mandiri (Klien A)", group: "MAKLON" },
  { code: "KLIEN_B", name: "CV Bandung Garment Lestari (Klien B)", group: "MAKLON" },
  { code: "KLIEN_C", name: "PT Cipta Busana Sejahtera (Klien C)", group: "MAKLON" },
];

export const UniversalFilterBar: React.FC<UniversalFilterBarProps> = ({
  filter,
  onChange,
  searchPlaceholder = "Cari data, artikel, atau nomor...",
  showDateFilter = true,
  showClientFilter = true,
  className = "",
  additionalControls,
}) => {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const handlePresetChange = (preset: "ALL" | "TODAY" | "7DAYS" | "MONTH") => {
    const today = new Date();
    const todayStr = getTodayStr();

    if (preset === "ALL") {
      onChange({ ...filter, datePreset: "ALL", startDate: "", endDate: "" });
    } else if (preset === "TODAY") {
      onChange({ ...filter, datePreset: "TODAY", startDate: todayStr, endDate: todayStr });
    } else if (preset === "7DAYS") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      onChange({
        ...filter,
        datePreset: "7DAYS",
        startDate: past.toISOString().split("T")[0],
        endDate: todayStr,
      });
    } else if (preset === "MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onChange({
        ...filter,
        datePreset: "MONTH",
        startDate: firstDay.toISOString().split("T")[0],
        endDate: todayStr,
      });
    }
  };

  const handleReset = () => {
    onChange({
      searchQuery: "",
      clientCode: "ALL",
      startDate: "",
      endDate: "",
      datePreset: "ALL",
    });
  };

  const hasActiveFilters =
    filter.searchQuery !== "" ||
    filter.clientCode !== "ALL" ||
    filter.startDate !== "" ||
    filter.endDate !== "";

  return (
    <div className={`bg-lembar p-3.5 rounded-work border border-garis shadow-hard space-y-3 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search Bar & Client Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
              placeholder={searchPlaceholder}
              className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-garis rounded-field text-tinta placeholder:text-teks-sekunder focus:outline-none focus:border-celup-indigo"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onChange({ ...filter, searchQuery: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teks-sekunder hover:text-celup-indigo p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hierarchical Client Dropdown */}
          {showClientFilter && (
            <div className="min-w-[230px] flex-shrink-0">
              <select
                value={filter.clientCode}
                onChange={(e) => onChange({ ...filter, clientCode: e.target.value })}
                className="w-full text-xs font-bold py-2 px-3 bg-white border border-garis rounded-field text-celup-indigo focus:outline-none focus:border-celup-indigo cursor-pointer truncate"
              >
                <option value="ALL">🏢 Semua Klien & Brand</option>
                <optgroup label="── MERK INTERNAL ──">
                  <option value="SNOHUND">🏷️ [SH] Snøhund (Made-to-Order)</option>
                </optgroup>
                <optgroup label="── KLIEN MAKLON B2B ──">
                  <option value="KLIEN_A">🏭 [KA] PT Bintang Tekstil Mandiri</option>
                  <option value="KLIEN_B">🏭 [KB] CV Bandung Garment Lestari</option>
                  <option value="KLIEN_C">🏭 [KC] PT Cipta Busana Sejahtera</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>

        {/* Right: Date Presets & Custom Date Range */}
        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Presets */}
            <div className="flex bg-white p-0.5 rounded-field border border-garis text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handlePresetChange("ALL")}
                className={`px-2 py-1 rounded transition-all ${
                  filter.datePreset === "ALL"
                    ? "bg-celup-indigo text-white shadow-sm"
                    : "text-teks-sekunder hover:text-celup-indigo"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("TODAY")}
                className={`px-2 py-1 rounded transition-all ${
                  filter.datePreset === "TODAY"
                    ? "bg-celup-indigo text-white shadow-sm"
                    : "text-teks-sekunder hover:text-celup-indigo"
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("7DAYS")}
                className={`px-2 py-1 rounded transition-all ${
                  filter.datePreset === "7DAYS"
                    ? "bg-celup-indigo text-white shadow-sm"
                    : "text-teks-sekunder hover:text-celup-indigo"
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("MONTH")}
                className={`px-2 py-1 rounded transition-all ${
                  filter.datePreset === "MONTH"
                    ? "bg-celup-indigo text-white shadow-sm"
                    : "text-teks-sekunder hover:text-celup-indigo"
                }`}
              >
                Bulan Ini
              </button>
            </div>

            {/* Custom Date Range Pickers */}
            <div className="flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded-field border border-garis">
              <Calendar className="w-3.5 h-3.5 text-teks-sekunder flex-shrink-0" />
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) =>
                  onChange({ ...filter, startDate: e.target.value, datePreset: "CUSTOM" })
                }
                title="Dari Tanggal"
                className="text-[11px] font-mono text-tinta bg-transparent focus:outline-none"
              />
              <span className="text-teks-sekunder text-[11px] font-bold">s/d</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) =>
                  onChange({ ...filter, endDate: e.target.value, datePreset: "CUSTOM" })
                }
                title="Sampai Tanggal"
                className="text-[11px] font-mono text-tinta bg-transparent focus:outline-none"
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset seluruh filter ke default"
                className="px-2.5 py-1.5 bg-white hover:bg-kabut border border-garis text-status-cacat rounded-field text-xs font-bold flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {additionalControls}
          </div>
        )}
      </div>

      {/* Active Filter Tags Indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 border-t border-garis/60">
          <span className="text-teks-sekunder font-semibold">Filter Aktif:</span>
          {filter.searchQuery && (
            <span className="bg-white px-2 py-0.5 rounded border border-garis text-celup-indigo font-medium">
              Kata Kunci: <strong>"{filter.searchQuery}"</strong>
            </span>
          )}
          {filter.clientCode !== "ALL" && (
            <span className="bg-white px-2 py-0.5 rounded border border-garis text-celup-indigo font-bold flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getClientColor(filter.clientCode) }}
              ></span>
              <span>Klien: {CLIENT_CATALOG.find((c) => c.code === filter.clientCode)?.name}</span>
            </span>
          )}
          {(filter.startDate || filter.endDate) && (
            <span className="bg-white px-2 py-0.5 rounded border border-garis text-celup-indigo font-mono">
              Periode: {filter.startDate || "Awal"} s/d {filter.endDate || "Hari Ini"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
