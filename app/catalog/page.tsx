"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Layers, 
  RotateCcw, 
  Search, 
  Check, 
  Clock, 
  Boxes, 
  ArrowRight,
  Plus
} from "lucide-react";
import { 
  getProductCatalog, 
  createMassOrder, 
  ProductCatalogItem 
} from "@/lib/dataBus";
import { useRole } from "@/components/Layout/RoleContext";

export default function CatalogPage() {
  const { currentRole } = useRole();
  const [catalog, setCatalog] = useState<ProductCatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const loadData = () => {
    setCatalog(getProductCatalog());
  };

  useEffect(() => {
    loadData();
    const handleBusUpdate = () => loadData();
    window.addEventListener("lukla_bus_update", handleBusUpdate);
    window.addEventListener("storage", handleBusUpdate);
    return () => {
      window.removeEventListener("lukla_bus_update", handleBusUpdate);
      window.removeEventListener("storage", handleBusUpdate);
    };
  }, []);

  const handleReorder = (item: ProductCatalogItem) => {
    const qtyStr = prompt(`Masukkan jumlah target pesanan ulang (Re-Order) untuk ${item.articleName}:`, "300");
    if (!qtyStr) return;
    const targetQty = parseInt(qtyStr, 10);
    if (isNaN(targetQty) || targetQty <= 0) {
      alert("Jumlah pesanan tidak valid.");
      return;
    }

    setReorderingId(item.id);
    const newOrder = createMassOrder({
      clientCode: item.clientCode,
      clientName: item.clientName,
      clientType: item.clientCode === "SNOHUND" ? "internal" : "b2b",
      article: item.articleName,
      scheme: item.defaultScheme,
      targetQty,
      sellingPricePerUnit: item.defaultSellingPricePerUnit,
      productCatalogId: item.id,
      inheritedVersion: "Katalog Disetujui",
      inheritedSmv: item.smvSummary,
      inheritedFabric: item.bomSummary,
      notes: `Pesanan ulang (Re-Order) dari katalog master ${item.articleCode}`,
    });

    setTimeout(() => {
      setReorderingId(null);
      alert(`Pesanan ulang ${newOrder.orderNumber} (${targetQty} unit) berhasil diterbitkan ke sistem! Menunggu persetujuan Owner.`);
    }, 300);
  };

  const filteredCatalog = catalog.filter(
    (item) =>
      item.articleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canReorder = currentRole === "OWNER" || currentRole === "SAMPLE_TEAM";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garis pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-celup-indigo flex items-center gap-2">
            <Layers className="w-6 h-6 text-celup-indigo" />
            <span>Katalog Produk Master</span>
          </h1>
          <p className="text-xs sm:text-sm text-teks-sekunder">
            Master artikel terverifikasi yang telah lulus uji studi waktu SMV &amp; BOM sampel, siap dipesan ulang (1-Click Re-Order)
          </p>
        </div>

        <Link
          href="/samples"
          className="px-3.5 py-2 bg-kabut border border-garis rounded-work text-xs font-bold text-celup-indigo hover:bg-garis flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Clock className="w-4 h-4" />
          <span>+ Uji Sampel Baru di Studio</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-work border border-garis shadow-hard flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-teks-sekunder absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode artikel, nama produk, atau klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lembar border border-garis rounded-field pl-9 pr-3 py-1.5 text-xs text-tinta placeholder-teks-sekunder"
          />
        </div>
        <span className="text-xs font-semibold text-teks-sekunder hidden sm:inline">
          {catalog.length} Produk Terkatalogkan
        </span>
      </div>

      {/* Catalog Grid */}
      {filteredCatalog.length === 0 ? (
        <div className="bg-white rounded-work border border-dashed border-garis p-12 text-center shadow-hard space-y-2">
          <p className="text-sm font-semibold text-teks-sekunder">Belum ada produk di katalog master.</p>
          <p className="text-xs text-teks-sekunder">
            Produk otomatis masuk ke katalog setelah pesanan pertama disetujui oleh Owner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCatalog.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-work border border-garis shadow-hard p-5 space-y-4 hover:border-celup-indigo/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-garis pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-celup-indigo bg-kabut px-2 py-0.5 rounded">
                      {item.articleCode}
                    </span>
                    <h3 className="font-bold text-base text-tinta mt-1.5">{item.articleName}</h3>
                    <p className="text-xs text-teks-sekunder">{item.clientName}</p>
                  </div>

                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-celup-indigo text-white uppercase">
                    {item.defaultScheme}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-lembar border border-garis">
                    <span className="text-teks-sekunder font-semibold block text-[10px]">Studi Waktu (SMV):</span>
                    <span className="font-mono font-bold text-celup-indigo text-xs mt-0.5 block">{item.smvSummary}</span>
                    <span className="text-[10px] text-teks-sekunder">{item.componentCount} Komponen Jahit</span>
                  </div>

                  <div className="p-2.5 rounded bg-lembar border border-garis">
                    <span className="text-teks-sekunder font-semibold block text-[10px]">Harga Patokan / Unit:</span>
                    <span className="font-mono font-bold text-tinta text-xs mt-0.5 block">
                      Rp {item.defaultSellingPricePerUnit.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-teks-sekunder">Sebelum PPN 11%</span>
                  </div>
                </div>

                <div className="text-xs text-tinta space-y-1">
                  <span className="font-semibold text-teks-sekunder block text-[10px]">Ringkasan BOM (Bahan Baku):</span>
                  <p className="text-xs text-tinta bg-lembar p-2 rounded border border-garis leading-relaxed">
                    {item.bomSummary}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-garis flex items-center justify-between gap-2">
                <span className="text-[11px] text-teks-sekunder font-mono">
                  Didaftarkan: {item.cataloguedAt}
                </span>

                {canReorder && (
                  <button
                    disabled={reorderingId === item.id}
                    onClick={() => handleReorder(item)}
                    className="px-3.5 py-1.5 bg-kapur text-celup-indigo font-bold text-xs rounded shadow-hard hover:bg-kapur/90 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{reorderingId === item.id ? "Memproses..." : "Pesan Ulang (Re-Order)"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
