"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight,
  Filter,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThreadEdge, ClientTag, getClientMonogram } from "@/components/Design/ThreadEdge";
import { AntiContaminationModal } from "@/components/Warehouse/AntiContaminationModal";

export default function WarehousePage() {
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [qtyToIssue, setQtyToIssue] = useState<number>(50);
  const [filterClient, setFilterClient] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [warehouseTab, setWarehouseTab] = useState<"INVENTORY" | "CUTTING">("INVENTORY");
  const [cuttingBatches, setCuttingBatches] = useState([
    {
      id: "CUT-2026-001",
      orderNumber: "ORD-2026-001",
      clientName: "Snøhund Alpine Wear",
      material: "Taslan Milky #K-01 (Hitam)",
      componentSet: "Badan Depan, Belakang, Lengan, Kantong",
      qtyCutSets: 150,
      cutDate: "14 Okt 2026, 09:30",
      status: "Siap Dijahit Operator",
    },
    {
      id: "CUT-2026-002",
      orderNumber: "ORD-2026-002",
      clientName: "PT Bandung Apparel",
      material: "Parasut Ribstop #P-04 (Navy)",
      componentSet: "Badan, Lengan, Tudung Kepala, Saku Zipper",
      qtyCutSets: 100,
      cutDate: "14 Okt 2026, 11:15",
      status: "Siap Dijahit Operator",
    },
  ]);
  const [newCutOrder, setNewCutOrder] = useState<string>("ORD-2026-001");
  const [newCutQty, setNewCutQty] = useState<number>(50);

  // Anti-Contamination Modal State (FR-6.2 & UAT-01)
  const [blockModal, setBlockModal] = useState<{
    isOpen: boolean;
    sourceClientCode: string;
    sourceClientName: string;
    targetClientCode: string;
    targetClientName: string;
    orderNumber: string;
    reason: string;
  }>({
    isOpen: false,
    sourceClientCode: "",
    sourceClientName: "",
    targetClientCode: "",
    targetClientName: "",
    orderNumber: "",
    reason: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch inventory items with client & order relations
      const { data: invData } = await supabase
        .from("inventory_items")
        .select("*, clients(*), orders(*)")
        .order("created_at", { ascending: false });

      if (invData) {
        setItems(invData);
        if (invData.length > 0) {
          setSelectedItem((prev: any) => prev || invData[0]);
        }
      }

      // Fetch active orders
      const { data: ordData } = await supabase
        .from("orders")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (ordData) {
        setOrders(ordData);
        if (ordData.length > 0) {
          setSelectedOrderId((prev: any) => prev || ordData[0].id);
        }
      }

      // Fetch audit logs
      const { data: txData } = await supabase
        .from("inventory_transactions")
        .select("*, inventory_items(*)")
        .order("created_at", { ascending: false })
        .limit(6);

      if (txData) setAuditLogs(txData);
    } catch (err) {
      console.error("Error loading warehouse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueMaterial = async () => {
    if (!selectedItem || !selectedOrderId) return;
    setSuccessMessage(null);

    const targetOrder = orders.find((o) => o.id === selectedOrderId);
    if (!targetOrder) return;

    try {
      const res = await fetch("/api/anti-contamination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          targetOrderId: targetOrder.id,
          qty: qtyToIssue,
          operatorId: "a1111111-0000-0000-0000-000000000003", // Kang Asep
        }),
      });

      const result = await res.json();

      if (result.blocked || res.status === 403) {
        // Trigger Full Screen Red Anti-Contamination Modal (FR-6.2 / UAT-01)
        setBlockModal({
          isOpen: true,
          sourceClientCode: selectedItem.clients?.client_code || "KLIEN_A",
          sourceClientName: selectedItem.clients?.name || "Klien Asal",
          targetClientCode: targetOrder.clients?.client_code || "KLIEN_B",
          targetClientName: targetOrder.clients?.name || "Klien Tujuan",
          orderNumber: targetOrder.order_number,
          reason: result.message || "Bahan baku milik Klien berbeda dengan pemilik pesanan!",
        });
      } else if (result.success) {
        setSuccessMessage(
          `Pengeluaran ${qtyToIssue} ${selectedItem.unit} untuk ${targetOrder.order_number} berhasil diverifikasi bebas kontaminasi!`
        );
        loadData();
      } else {
        alert(result.message || "Gagal memproses transaksi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan jaringan: " + err.message);
    }
  };

  const filteredItems = items.filter((it) => {
    if (filterClient === "ALL") return true;
    return it.clients?.client_code === filterClient;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-garis pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-celup-indigo tracking-tight">
            Gudang Multi-Tenant & Anti-Kontaminasi
          </h1>
          <p className="text-xs text-teks-sekunder mt-0.5">
            FR-6.1 Mandatory Tagging Klien • Stasiun Meja Potong (Cutting) • FR-6.2 Validasi Pintu Cutting
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-field bg-white border border-garis text-celup-indigo hover:border-celup-indigo text-xs font-semibold flex items-center justify-center gap-1.5 w-full md:w-auto shadow-hard transition-all active:translate-y-0.5"
        >
          <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Refresh Stok</span>
        </button>
      </div>

      {/* 2 Stasiun Kerja: Inventaris vs Meja Potong (Cutting Station) - Opsi A */}
      <div className="flex gap-2 border-b border-garis pb-1 overflow-x-auto">
        <button
          onClick={() => setWarehouseTab("INVENTORY")}
          className={`px-4 py-2 text-xs font-bold rounded-field transition-all whitespace-nowrap ${
            warehouseTab === "INVENTORY"
              ? "bg-celup-indigo text-white shadow-sm"
              : "bg-white text-teks-sekunder hover:text-celup-indigo border border-garis"
          }`}
        >
          1. Penerimaan & Stok Bahan (Validasi Tag Klien)
        </button>
        <button
          onClick={() => setWarehouseTab("CUTTING")}
          className={`px-4 py-2 text-xs font-bold rounded-field transition-all whitespace-nowrap ${
            warehouseTab === "CUTTING"
              ? "bg-celup-indigo text-white shadow-sm"
              : "bg-white text-teks-sekunder hover:text-celup-indigo border border-garis"
          }`}
        >
          2. Meja Potong (Cutting Station)
        </button>
      </div>

      {/* Operational Cutting by Warehouse Banner */}
      <div className="p-3 bg-white border-l-4 border-status-lolos rounded-field shadow-hard text-xs text-tinta flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-status-lolos flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-celup-indigo">Aturan Operasional Gudang & Cutting:</strong>{" "}
          Proses pemotongan bahan baku (<strong>Cutting</strong>) dilakukan langsung oleh personil Tim Gudang setelah bahan lolos validasi anti-kontaminasi FR-6.2, sebelum diteruskan ke lini jahit.
        </div>
      </div>

      {warehouseTab === "INVENTORY" && (
        <>
          {/* Interactive Material Issue Bar (Simulasi QR Scanner & Pintu Cutting) */}
          <div className="bg-lembar p-5 rounded-work border-2 border-celup-indigo shadow-hard space-y-4">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-celup-indigo" />
                <h2 className="text-sm font-bold text-celup-indigo">
                  Terminal Pengeluaran Bahan ke Area Cutting
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-status-lolos bg-white px-2 py-0.5 rounded border border-garis">
                Proteksi Anti-Kontaminasi Otomatis (FR-6.2)
              </span>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Select Material */}
          <div>
            <label className="text-xs font-semibold text-tinta block mb-1">
              1. Pilih / Scan Bahan Baku Fisik:
            </label>
            <select
              data-testid="select-material"
              value={selectedItem?.id || ""}
              onChange={(e) => {
                const found = items.find((it) => it.id === e.target.value);
                setSelectedItem(found || null);
              }}
              className="w-full text-xs border border-garis bg-white p-2.5 rounded-field font-medium text-tinta focus:border-celup-indigo"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{getClientMonogram(it.clients?.client_code)}] {it.item_name} (Sisa: {it.qty_on_hand} {it.unit})
                </option>
              ))}
            </select>
            {selectedItem && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teks-sekunder">
                <span>Pemilik Terdaftar:</span>
                <ClientTag clientCode={selectedItem.clients?.client_code} clientName={selectedItem.clients?.name} />
              </div>
            )}
          </div>

          {/* Select Target Order */}
          <div>
            <label className="text-xs font-semibold text-tinta block mb-1">
              2. Target Pesanan Cutting (Order ID):
            </label>
            <select
              data-testid="select-target-order"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full text-xs border border-garis bg-white p-2.5 rounded-field font-medium text-tinta focus:border-celup-indigo"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} — {o.article_name} ([{getClientMonogram(o.clients?.client_code)}] {o.clients?.name})
                </option>
              ))}
            </select>
            {selectedOrderId && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teks-sekunder">
                <span>Pemilik Order:</span>
                {(() => {
                  const o = orders.find((x) => x.id === selectedOrderId);
                  return o ? <ClientTag clientCode={o.clients?.client_code} clientName={o.clients?.name} /> : null;
                })()}
              </div>
            )}
          </div>

          {/* Quantity & Action */}
          <div>
            <label className="text-xs font-semibold text-tinta block mb-1">
              3. Kuantitas Dikeluarkan (Yard):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                min="1"
                value={qtyToIssue}
                onChange={(e) => setQtyToIssue(Number(e.target.value))}
                className="w-full sm:w-24 text-xs border border-garis bg-white p-2.5 rounded-field font-bold tabular-nums text-celup-indigo"
              />
              <button
                onClick={handleIssueMaterial}
                className="w-full sm:flex-1 bg-celup-indigo text-white font-bold text-xs p-2.5 rounded-field shadow-hard hover:bg-celup-indigo/90 flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5 whitespace-nowrap"
              >
                <span>Keluarkan ke Cutting</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-white border-2 border-status-lolos rounded-field flex items-center gap-2 text-xs font-semibold text-status-lolos">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="text-[11px] text-teks-sekunder bg-white p-2.5 rounded border border-garis flex items-center justify-between">
          <span>
            💡 <strong>Uji UAT-01:</strong> Pilih bahan milik <em>[KA] Klien A</em> dan arahkan ke Order milik <em>[KB] Klien B</em> untuk membuktikan proteksi layar merah blokir anti-kontaminasi seketika.
          </span>
        </div>
      </div>

      {/* Inventory Grid with Client Filter Tags (Section 6.1) */}
      <div className="bg-lembar p-5 rounded-work border border-garis shadow-hard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-garis pb-3">
          <div>
            <h2 className="text-sm font-bold text-celup-indigo">
              Multi-Tenant Inventory Stock Grid (FR-6.1)
            </h2>
            <span className="text-xs text-teks-sekunder">
              Setiap gulung kain terikat mutlak pada Tag ID Klien dan ID Pesanan
            </span>
          </div>

          {/* Client Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterClient("ALL")}
              className={`px-2.5 py-1 text-xs rounded font-semibold border ${
                filterClient === "ALL"
                  ? "bg-celup-indigo text-white border-celup-indigo"
                  : "bg-white text-teks-sekunder border-garis hover:border-celup-indigo"
              }`}
            >
              Semua Klien
            </button>
            <button
              onClick={() => setFilterClient("SNOHUND")}
              className={`px-2.5 py-1 text-xs rounded font-semibold border ${
                filterClient === "SNOHUND"
                  ? "bg-thread-snohund text-white border-thread-snohund"
                  : "bg-white text-teks-sekunder border-garis"
              }`}
            >
              SH Snøhund
            </button>
            <button
              onClick={() => setFilterClient("KLIEN_A")}
              className={`px-2.5 py-1 text-xs rounded font-semibold border ${
                filterClient === "KLIEN_A"
                  ? "bg-thread-klien1 text-white border-thread-klien1"
                  : "bg-white text-teks-sekunder border-garis"
              }`}
            >
              KA Klien A
            </button>
            <button
              onClick={() => setFilterClient("KLIEN_B")}
              className={`px-2.5 py-1 text-xs rounded font-semibold border ${
                filterClient === "KLIEN_B"
                  ? "bg-thread-klien2 text-white border-thread-klien2"
                  : "bg-white text-teks-sekunder border-garis"
              }`}
            >
              KB Klien B
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-garis text-left text-teks-sekunder">
                <th className="py-2.5 pl-3">Klien & Tag QR</th>
                <th className="py-2.5">Nama Bahan Baku</th>
                <th className="py-2.5">Kategori</th>
                <th className="py-2.5">Sumber Stok</th>
                <th className="py-2.5 text-right">Sisa Stok</th>
                <th className="py-2.5 text-right pr-3">Lokasi Rak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3 pl-3">
                    <ThreadEdge clientCode={it.clients?.client_code} className="pl-2">
                      <div className="flex items-center gap-1.5">
                        <ClientTag
                          clientCode={it.clients?.client_code}
                          clientName={it.clients?.name}
                        />
                        <span className="font-mono text-[11px] font-bold text-celup-indigo">
                          {it.sku_tag_code}
                        </span>
                      </div>
                    </ThreadEdge>
                  </td>
                  <td className="py-3 font-semibold text-tinta">{it.item_name}</td>
                  <td className="py-3 text-teks-sekunder">{it.item_category}</td>
                  <td className="py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-kabut font-semibold text-teks-sekunder">
                      {it.ownership_source}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-celup-indigo tabular-nums">
                    {it.qty_on_hand} {it.unit}
                  </td>
                  <td className="py-3 text-right pr-3 text-teks-sekunder">
                    {it.warehouse_location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* STASIUN MEJA POTONG (CUTTING STATION) - OPSI A & BRD v1.5 */}
      {warehouseTab === "CUTTING" && (
        <div className="space-y-6">
          <div className="p-4 bg-lembar rounded-work border-2 border-celup-indigo shadow-hard space-y-4">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-celup-indigo" />
                <h2 className="text-sm font-bold text-celup-indigo">
                  Pencatatan Pemotongan Pola Kain (Cutting Station)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-status-lolos bg-white px-2 py-0.5 rounded border border-garis">
                Petugas Cutting • Verifikasi Bebas Kontaminasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-tinta block mb-1">
                  Target Order Pesanan:
                </label>
                <select
                  value={newCutOrder}
                  onChange={(e) => setNewCutOrder(e.target.value)}
                  className="w-full text-xs border border-garis bg-white p-2.5 rounded-field font-medium text-tinta"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.order_number}>
                      {o.order_number} — {o.article_name} ({o.clients?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-tinta block mb-1">
                  Bahan Baku yang Digunakan:
                </label>
                <div className="p-2.5 bg-white border border-garis rounded-field text-xs font-medium text-tinta">
                  Taslan Milky / Parasut (Tervalidasi FR-6.2)
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-tinta block mb-1">
                  Jumlah Set Potong Selesai:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newCutQty}
                    onChange={(e) => setNewCutQty(Number(e.target.value))}
                    className="w-24 text-xs border border-garis bg-white p-2.5 rounded-field font-bold text-celup-indigo"
                  />
                  <button
                    onClick={() => {
                      const newBatch = {
                        id: `CUT-2026-00${cuttingBatches.length + 1}`,
                        orderNumber: newCutOrder,
                        clientName: "Snøhund / Klien B2B",
                        material: "Kain Tervalidasi",
                        componentSet: "Pola Lengkap (Badan, Lengan, Kantong, Rib)",
                        qtyCutSets: newCutQty,
                        cutDate: "Baru saja",
                        status: "Siap Dijahit Operator",
                      };
                      setCuttingBatches([newBatch, ...cuttingBatches]);
                      alert(`Hasil potong ${newCutQty} set pola untuk ${newCutOrder} berhasil dicatat & diteruskan ke Penjahit-Operator!`);
                    }}
                    className="flex-1 px-3 py-2 bg-celup-indigo text-white text-xs font-bold rounded-field shadow-hard hover:bg-celup-indigo/90"
                  >
                    Kirim ke Penjahit-Operator →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-work border border-garis shadow-hard p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-garis pb-2">
              <h3 className="text-xs font-bold text-celup-indigo uppercase tracking-wider">
                Daftar Batch Hasil Potong di Meja Cutting (WIP Siap Jahit)
              </h3>
              <span className="text-[11px] text-teks-sekunder">
                Total {cuttingBatches.length} Batch Dipotong
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-kabut text-tinta font-bold border-b border-garis">
                  <tr>
                    <th className="py-2.5 px-3">Batch ID</th>
                    <th className="py-2.5 px-2">Order & Klien</th>
                    <th className="py-2.5 px-2">Material Kain</th>
                    <th className="py-2.5 px-2">Komponen Pola</th>
                    <th className="py-2.5 px-2 text-right">Jumlah Set</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {cuttingBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-lembar">
                      <td className="py-2.5 px-3 font-mono font-bold text-celup-indigo">{b.id}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-bold text-tinta block">{b.orderNumber}</span>
                        <span className="text-[10px] text-teks-sekunder">{b.clientName}</span>
                      </td>
                      <td className="py-2.5 px-2 text-teks-sekunder">{b.material}</td>
                      <td className="py-2.5 px-2 text-tinta font-medium">{b.componentSet}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-status-lolos">{b.qtyCutSets} set</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-lolos/10 text-status-lolos border border-status-lolos/20">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs of Anti-Contamination Incidents */}
      <div className="bg-white p-4 rounded-work border border-garis shadow-hard">
        <h3 className="text-xs font-bold text-celup-indigo mb-2">
          Log Audit Transaksi Gudang & Peringatan Keamanan
        </h3>
        <div className="divide-y divide-garis text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {log.is_blocked_contamination ? (
                  <span className="px-1.5 py-0.5 bg-status-cacat text-white rounded font-bold text-[10px]">
                    BLOKIR KONTAMINASI
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-status-lolos text-white rounded font-bold text-[10px]">
                    LOLOS VERIFIKASI
                  </span>
                )}
                <span className="text-tinta font-mono">{log.tx_type}</span>
                <span className="text-teks-sekunder">
                  ({log.qty} {log.inventory_items?.unit || "Yard"})
                </span>
              </div>
              <span className="text-teks-sekunder text-[11px] font-mono">
                {new Date(log.created_at).toLocaleTimeString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Red Anti-Contamination Alert Modal */}
      <AntiContaminationModal
        isOpen={blockModal.isOpen}
        sourceClientCode={blockModal.sourceClientCode}
        sourceClientName={blockModal.sourceClientName}
        targetClientCode={blockModal.targetClientCode}
        targetClientName={blockModal.targetClientName}
        orderNumber={blockModal.orderNumber}
        reason={blockModal.reason}
        onClose={() => {
          setBlockModal((prev) => ({ ...prev, isOpen: false }));
          loadData();
        }}
      />
    </div>
  );
}
