// lib/dataBus.ts
// Real-time Event & State Bus for Lukla Operations Engine
// Connects Phase 1 (Samples & Catalog) -> Phase 2 (Dashboard Approval) -> Phase 3 (Warehouse, Raw Materials, POs, Cutting, Finished Goods) -> Phase 4 (Production) -> Phase 5 (QC Pass/Repair) -> Phase 6 (Payroll & PPN 11% Invoices)

export interface MassOrder {
  id: string;
  orderNumber: string;
  clientCode: string;
  clientName: string;
  article: string;
  scheme: "FULL_PACKAGE" | "SEMI_CMT" | "CMT";
  targetQty: number;
  completedQty?: number;
  sellingPricePerUnit?: number;
  productCatalogId?: string;
  inheritedVersion: string;
  inheritedSmv: string;
  inheritedFabric: string;
  status: "PENDING_OWNER_APPROVAL" | "APPROVED" | "DONE" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
}

export interface ProductCatalogItem {
  id: string;
  articleCode: string;
  articleName: string;
  clientCode: string;
  clientName: string;
  defaultScheme: "FULL_PACKAGE" | "SEMI_CMT" | "CMT";
  defaultSellingPricePerUnit: number;
  componentCount: number;
  smvSummary: string;
  bomSummary: string;
  cataloguedAt: string;
  sourceOrderNumber: string;
}

export interface RawMaterialMaster {
  id: string;
  sku: string;
  name: string;
  defaultUnit: string;
  category: "Kain Utama" | "Pelapis & Busa" | "Webbing & Tali" | "Hardware & Resleting";
  stockOnHand: number;
  clientCount: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  docType: "SUPPLIER_PO" | "CLIENT_COMMITMENT";
  orderNumber: string;
  clientName: string;
  supplierOrClient: string;
  rawMaterialSku: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
  reviewNotes?: string;
  createdBy: string;
  createdAt: string;
}

export interface FinishedGoodRecord {
  id: string;
  serialNumber: string;
  orderNumber: string;
  clientCode: string;
  clientName: string;
  articleName: string;
  status: "READY_FOR_WAREHOUSE" | "STORED";
  passedQcAt: string;
  storedAt?: string;
  storedBy?: string;
}

export interface IssuedInvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  clientCode: string;
  clientName: string;
  articleName: string;
  scheme: string;
  quantity: number;
  pricePerUnit: number;
  subtotalWithoutPpn: number;
  ppnRate: number; // 11%
  ppnAmount: number;
  totalWithPpn: number;
  fulfillmentMethod: "SHIPPING" | "PICKUP";
  paymentStatus: "UNPAID" | "DP_PAID" | "PAID";
  issuedAt: string;
}

export interface CuttingBatch {
  id: string;
  orderNumber: string;
  clientName: string;
  clientCode?: string;
  material: string;
  componentSet: string;
  qtyCutSets: number;
  cutDate: string;
  status: string;
}

export interface QcQueueItem {
  serial: string;
  orderNumber: string;
  articleName: string;
  assembledBy: string;
  arrivedAt: string;
  status: "WAITING" | "REINSPECTION_PENDING" | "PASS" | "REPAIR";
  isReinspection: boolean;
  repairNote?: string;
  defectCategory?: string;
}

export interface InventoryItemCustom {
  id: string;
  item_code: string;
  name: string;
  material_type: string;
  client_id: string;
  order_id: string;
  roll_number: string;
  current_stock: number;
  unit: string;
  clients: { client_code: string; name: string };
  orders: { order_number: string; article_name: string };
}

const STORAGE_KEYS = {
  PENDING_ORDERS: "lukla_pending_orders",
  ACTIVE_ORDERS: "lukla_active_orders",
  PRODUCT_CATALOG: "lukla_product_catalog",
  RAW_MATERIALS: "lukla_raw_materials",
  PURCHASE_ORDERS: "lukla_purchase_orders",
  FINISHED_GOODS: "lukla_finished_goods",
  ISSUED_INVOICES: "lukla_issued_invoices",
  CUTTING_BATCHES: "lukla_cutting_batches",
  QC_QUEUE: "lukla_qc_queue",
  QC_POOL: "lukla_qc_pool",
  CUSTOM_INVENTORY: "lukla_custom_inventory",
  SYNC_EVENT: "lukla_data_sync_event",
};

// Default seed data
const DEFAULT_PENDING_ORDERS: MassOrder[] = [
  {
    id: "ord-seed-004",
    orderNumber: "ORD-2026-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    article: "Snøhund Alpine Tactical Backpack 35L",
    scheme: "FULL_PACKAGE",
    targetQty: 500,
    completedQty: 0,
    sellingPricePerUnit: 245000,
    inheritedVersion: "v2 (Approved)",
    inheritedSmv: "18m 30s",
    inheritedFabric: "1.45 m Cordura 1000D / pcs",
    status: "PENDING_OWNER_APPROVAL",
    createdAt: "15 Okt 2026, 14:00",
  },
];

const DEFAULT_PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    id: "cat-001",
    articleCode: "SNO-2026-001",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    defaultScheme: "FULL_PACKAGE",
    defaultSellingPricePerUnit: 245000,
    componentCount: 5,
    smvSummary: "18m 30s (5 Komponen)",
    bomSummary: "Cordura 1000D (1.45m), Busa EVA 15mm (0.4m), YKK Zipper #10 (2 pcs)",
    cataloguedAt: "12 Okt 2026",
    sourceOrderNumber: "ORD-2026-001",
  },
  {
    id: "cat-002",
    articleCode: "KLA-2026-001",
    articleName: "Urban Commuter Roll-Top Backpack 25L",
    clientCode: "KLIEN_A",
    clientName: "PT Bandung Apparel",
    defaultScheme: "SEMI_CMT",
    defaultSellingPricePerUnit: 165000,
    componentCount: 4,
    smvSummary: "15m 20s (4 Komponen)",
    bomSummary: "Ripstop Nylon 420D (1.25m), Webbing Nylon 38mm (2.2m), Buckle Acetal (4 pcs)",
    cataloguedAt: "13 Okt 2026",
    sourceOrderNumber: "ORD-2026-002",
  },
];

const DEFAULT_RAW_MATERIALS: RawMaterialMaster[] = [
  {
    id: "rm-001",
    sku: "RM-0001",
    name: "Cordura 1000D Tactical Waterproof",
    defaultUnit: "Meter",
    category: "Kain Utama",
    stockOnHand: 1450,
    clientCount: 1,
  },
  {
    id: "rm-002",
    sku: "RM-0002",
    name: "Busa Padding EVA 15mm High-Density",
    defaultUnit: "Meter",
    category: "Pelapis & Busa",
    stockOnHand: 420,
    clientCount: 2,
  },
  {
    id: "rm-003",
    sku: "RM-0003",
    name: "Resleting YKK Waterproof #10 (60cm)",
    defaultUnit: "Pcs",
    category: "Hardware & Resleting",
    stockOnHand: 1200,
    clientCount: 2,
  },
  {
    id: "rm-004",
    sku: "RM-0004",
    name: "Ripstop Diamond Nylon 420D",
    defaultUnit: "Meter",
    category: "Kain Utama",
    stockOnHand: 680,
    clientCount: 1,
  },
  {
    id: "rm-005",
    sku: "RM-0005",
    name: "Webbing Nylon Mil-Spec 38mm & Buckle Acetal",
    defaultUnit: "Meter",
    category: "Webbing & Tali",
    stockOnHand: 950,
    clientCount: 3,
  },
];

const DEFAULT_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: "po-001",
    poNumber: "PO-SUP-2026-001",
    docType: "SUPPLIER_PO",
    orderNumber: "ORD-2026-004",
    clientName: "Snøhund Alpine Wear",
    supplierOrClient: "PT Tekstil Nusantara (Supplier Kain)",
    rawMaterialSku: "RM-0001",
    itemName: "Cordura 1000D Tactical Waterproof (Black Olive)",
    quantity: 725,
    unit: "Meter",
    status: "APPROVED",
    notes: "Auto-generated dari BOM sampel v2 (1.45m × 500 unit)",
    reviewNotes: "Disetujui Finance — harga sesuai kontrak supplier.",
    createdBy: "Sistem Otomatis (BOM)",
    createdAt: "14 Okt 2026",
  },
  {
    id: "po-002",
    poNumber: "PO-SUP-2026-002",
    docType: "SUPPLIER_PO",
    orderNumber: "ORD-2026-002",
    clientName: "PT Bandung Apparel",
    supplierOrClient: "CV Aksesoris Tas Presisi (Supplier Hardware)",
    rawMaterialSku: "RM-0003",
    itemName: "Resleting YKK Waterproof #10 & Buckle Acetal",
    quantity: 600,
    unit: "Pcs",
    status: "PENDING",
    notes: "Pengadaan bahan pendukung Lukla untuk skema Semi-CMT",
    createdBy: "Kang Asep (Gudang)",
    createdAt: "15 Okt 2026",
  },
  {
    id: "po-003",
    poNumber: "CMT-COM-2026-001",
    docType: "CLIENT_COMMITMENT",
    orderNumber: "ORD-2026-003",
    clientName: "CV Priangan Outdoor",
    supplierOrClient: "CV Priangan Outdoor (Komitmen Klien CMT)",
    rawMaterialSku: "RM-0004",
    itemName: "Bahan Titipan Klien: Ripstop Nylon 420D & Webbing Set",
    quantity: 450,
    unit: "Meter",
    status: "APPROVED",
    notes: "Surat Komitmen Pengiriman Bahan Klien (Aturan Bisnis #5 Skema CMT)",
    reviewNotes: "Jadwal kirim bahan klien terkonfirmasi.",
    createdBy: "Mbak Lina (Sampler)",
    createdAt: "15 Okt 2026",
  },
];

const DEFAULT_FINISHED_GOODS: FinishedGoodRecord[] = [
  {
    id: "fg-001",
    serialNumber: "BAG-SNO-0991",
    orderNumber: "ORD-2026-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    status: "STORED",
    passedQcAt: "15 Okt 2026, 09:15",
    storedAt: "15 Okt 2026, 10:00",
    storedBy: "Kang Asep (Gudang)",
  },
  {
    id: "fg-002",
    serialNumber: "BAG-SNO-0992",
    orderNumber: "ORD-2026-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    status: "STORED",
    passedQcAt: "15 Okt 2026, 09:20",
    storedAt: "15 Okt 2026, 10:00",
    storedBy: "Kang Asep (Gudang)",
  },
  {
    id: "fg-003",
    serialNumber: "BAG-SNO-0998",
    orderNumber: "ORD-2026-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    status: "READY_FOR_WAREHOUSE",
    passedQcAt: "15 Okt 2026, 10:25",
  },
];

const DEFAULT_ISSUED_INVOICES: IssuedInvoiceRecord[] = [
  {
    id: "inv-seed-001",
    invoiceNumber: "INV-2026-001",
    orderNumber: "ORD-2026-001",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    scheme: "FULL_PACKAGE",
    quantity: 300,
    pricePerUnit: 245000,
    subtotalWithoutPpn: 73500000,
    ppnRate: 11,
    ppnAmount: 8085000,
    totalWithPpn: 81585000,
    fulfillmentMethod: "SHIPPING",
    paymentStatus: "PAID",
    issuedAt: "14 Okt 2026",
  },
];

const DEFAULT_CUTTING_BATCHES: CuttingBatch[] = [
  {
    id: "CUT-2026-001",
    orderNumber: "ORD-2026-004",
    clientName: "Snøhund Alpine Wear",
    clientCode: "SNOHUND",
    material: "Cordura 1000D #C-01 (Black Olive)",
    componentSet: "Panel Depan, Belakang, Tali Bahu, Saku Organizer, Busa Padding",
    qtyCutSets: 150,
    cutDate: "15 Okt 2026, 09:30",
    status: "Siap Dirakit Assembly",
  },
  {
    id: "CUT-2026-002",
    orderNumber: "ORD-2026-002",
    clientName: "PT Bandung Apparel",
    clientCode: "KLIEN_A",
    material: "Ripstop Diamond Nylon 420D (Navy)",
    componentSet: "Roll-Top Main Body, Laptop Sleeve, Saku Samping, Webbing Straps",
    qtyCutSets: 100,
    cutDate: "15 Okt 2026, 11:15",
    status: "Siap Dirakit Assembly",
  },
];

const DEFAULT_QC_QUEUE: QcQueueItem[] = [
  {
    serial: "BAG-SNO-1001",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    assembledBy: "Meja Assembly #1 (Rina & Siti)",
    arrivedAt: "10:35 WIB",
    status: "WAITING",
    isReinspection: false,
  },
  {
    serial: "BAG-SNO-1002",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    assembledBy: "Meja Assembly #1 (Rina & Siti)",
    arrivedAt: "10:42 WIB",
    status: "WAITING",
    isReinspection: false,
  },
  {
    serial: "BAG-SNO-0994",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    assembledBy: "Meja Assembly #2 (Budi & Agus)",
    arrivedAt: "10:45 WIB",
    status: "REINSPECTION_PENDING",
    isReinspection: true,
    repairNote: "Perbaikan jahitan webbing molle selesai dikerjakan ulang",
  },
  {
    serial: "BAG-SNO-1003",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    assembledBy: "Meja Assembly #1 (Rina & Siti)",
    arrivedAt: "10:50 WIB",
    status: "WAITING",
    isReinspection: false,
  },
  {
    serial: "BAG-SNO-1004",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    assembledBy: "Meja Assembly #2 (Budi & Agus)",
    arrivedAt: "10:55 WIB",
    status: "WAITING",
    isReinspection: false,
  },
];

export function emitDataBusSync(eventKey: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_EVENT, `${eventKey}_${Date.now()}`);
    window.dispatchEvent(new CustomEvent("lukla_bus_update", { detail: { eventKey } }));
  } catch {}
}

// 1. Pending & Active Mass Orders
export function getPendingMassOrders(): MassOrder[] {
  if (typeof window === "undefined") return DEFAULT_PENDING_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(DEFAULT_PENDING_ORDERS));
      return DEFAULT_PENDING_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PENDING_ORDERS;
  }
}

export function savePendingMassOrder(order: MassOrder) {
  if (typeof window === "undefined") return;
  const current = getPendingMassOrders();
  const filtered = current.filter((o) => o.orderNumber !== order.orderNumber);
  const updated = [order, ...filtered];
  localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(updated));
  emitDataBusSync("PENDING_ORDERS_UPDATED");
}

export function getApprovedMassOrders(): MassOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function approveMassOrder(orderNumber: string): MassOrder | null {
  if (typeof window === "undefined") return null;
  const pendings = getPendingMassOrders();
  const target = pendings.find((o) => o.orderNumber === orderNumber);
  if (!target) return null;

  target.status = "APPROVED";
  const updatedPendings = pendings.map((o) => (o.orderNumber === orderNumber ? target : o));
  localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(updatedPendings));

  const actives = getApprovedMassOrders();
  const filteredActives = actives.filter((o) => o.orderNumber !== orderNumber);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify([target, ...filteredActives]));

  // Graduate to Product Catalog automatically (adopted from TestLukia-main approveOrderAction)
  const catalog = getProductCatalog();
  const existsInCatalog = catalog.some(
    (c) => c.articleName.toLowerCase() === target.article.toLowerCase() && c.clientCode === target.clientCode
  );
  if (!existsInCatalog) {
    const prefix = target.clientCode === "SNOHUND" ? "SNO" : target.clientCode === "KLIEN_A" ? "KLA" : "KLB";
    const newCatItem: ProductCatalogItem = {
      id: `cat-${Date.now()}`,
      articleCode: `${prefix}-2026-00${catalog.length + 1}`,
      articleName: target.article,
      clientCode: target.clientCode,
      clientName: target.clientName,
      defaultScheme: target.scheme,
      defaultSellingPricePerUnit: target.sellingPricePerUnit || 225000,
      componentCount: 5,
      smvSummary: target.inheritedSmv || "18m 30s",
      bomSummary: target.inheritedFabric || "1.45 m Cordura 1000D / pcs",
      cataloguedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      sourceOrderNumber: target.orderNumber,
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCT_CATALOG, JSON.stringify([newCatItem, ...catalog]));
  }

  // Auto-generate PO or Client Commitment from BOM (adopted from TestLukia-main + Locked Rule #5)
  const pos = getPurchaseOrders();
  const newPo: PurchaseOrderRecord = {
    id: `po-${Date.now()}`,
    poNumber:
      target.scheme === "CMT"
        ? `CMT-COM-2026-${Math.floor(100 + Math.random() * 900)}`
        : `PO-SUP-2026-${Math.floor(100 + Math.random() * 900)}`,
    docType: target.scheme === "CMT" ? "CLIENT_COMMITMENT" : "SUPPLIER_PO",
    orderNumber: target.orderNumber,
    clientName: target.clientName,
    supplierOrClient:
      target.scheme === "CMT"
        ? `${target.clientName} (Komitmen Bahan Klien CMT)`
        : "PT Tekstil Nusantara (Supplier Resmi Lukla)",
    rawMaterialSku: "RM-0001",
    itemName: target.inheritedFabric || `Paket Bahan Baku ${target.article}`,
    quantity: Math.round(target.targetQty * 1.45),
    unit: "Meter",
    status: "PENDING",
    notes: `Auto-generated saat persetujuan Owner untuk ${target.orderNumber} (${target.targetQty} unit)`,
    createdBy: "Sistem Otomatis (BOM)",
    createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
  };
  localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify([newPo, ...pos]));

  emitDataBusSync("ORDER_APPROVED");
  return target;
}

export function rejectMassOrder(orderNumber: string, reason?: string) {
  if (typeof window === "undefined") return;
  const pendings = getPendingMassOrders();
  const updated = pendings.map((o) =>
    o.orderNumber === orderNumber
      ? { ...o, status: "REJECTED" as const, rejectionReason: reason || "Spesifikasi atau harga belum sesuai" }
      : o
  );
  localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(updated));
  emitDataBusSync("ORDER_REJECTED");
}

// 1B. Product Catalog & Re-Order (Adopted from TestLukia-main)
export function getProductCatalog(): ProductCatalogItem[] {
  if (typeof window === "undefined") return DEFAULT_PRODUCT_CATALOG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCT_CATALOG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCT_CATALOG, JSON.stringify(DEFAULT_PRODUCT_CATALOG));
      return DEFAULT_PRODUCT_CATALOG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRODUCT_CATALOG;
  }
}

// 1C. Raw Material Catalog & Purchase Orders (Adopted from TestLukia-main)
export function getRawMaterialCatalog(): RawMaterialMaster[] {
  if (typeof window === "undefined") return DEFAULT_RAW_MATERIALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(DEFAULT_RAW_MATERIALS));
      return DEFAULT_RAW_MATERIALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RAW_MATERIALS;
  }
}

export function getPurchaseOrders(): PurchaseOrderRecord[] {
  if (typeof window === "undefined") return DEFAULT_PURCHASE_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(DEFAULT_PURCHASE_ORDERS));
      return DEFAULT_PURCHASE_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PURCHASE_ORDERS;
  }
}

export function addPurchaseOrder(po: PurchaseOrderRecord) {
  if (typeof window === "undefined") return;
  const current = getPurchaseOrders();
  localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify([po, ...current]));
  emitDataBusSync("PO_ADDED");
}

export function reviewPurchaseOrder(poId: string, decision: "APPROVED" | "REJECTED", reviewNotes: string) {
  if (typeof window === "undefined") return;
  const current = getPurchaseOrders();
  const updated = current.map((po) =>
    po.id === poId ? { ...po, status: decision, reviewNotes } : po
  );
  localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(updated));
  emitDataBusSync("PO_REVIEWED");
}

// 1D. Finished Goods Warehouse Intake (Adopted from TestLukia-main /warehouse/finished)
export function getFinishedGoods(): FinishedGoodRecord[] {
  if (typeof window === "undefined") return DEFAULT_FINISHED_GOODS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINISHED_GOODS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify(DEFAULT_FINISHED_GOODS));
      return DEFAULT_FINISHED_GOODS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FINISHED_GOODS;
  }
}

export function addFinishedGoodReady(record: FinishedGoodRecord) {
  if (typeof window === "undefined") return;
  const current = getFinishedGoods();
  const exists = current.some((f) => f.serialNumber === record.serialNumber);
  if (!exists) {
    localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify([record, ...current]));
    emitDataBusSync("FINISHED_GOOD_READY");
  }
}

export function receiveFinishedGoodToWarehouse(serialNumber: string, storedBy: string = "Kang Asep (Gudang)") {
  if (typeof window === "undefined") return;
  const current = getFinishedGoods();
  const nowStr = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const updated = current.map((fg) =>
    fg.serialNumber === serialNumber
      ? { ...fg, status: "STORED" as const, storedAt: nowStr, storedBy }
      : fg
  );
  localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify(updated));
  emitDataBusSync("FINISHED_GOOD_STORED");
}

export function receiveAllReadyFinishedGoodsByOrder(orderNumber: string, storedBy: string = "Kang Asep (Gudang)") {
  if (typeof window === "undefined") return;
  const current = getFinishedGoods();
  const nowStr = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const updated = current.map((fg) =>
    fg.orderNumber === orderNumber && fg.status === "READY_FOR_WAREHOUSE"
      ? { ...fg, status: "STORED" as const, storedAt: nowStr, storedBy }
      : fg
  );
  localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify(updated));
  emitDataBusSync("FINISHED_GOOD_STORED");
}

// 1E. Issued Invoices with PPN 11% (Adopted from TestLukia-main)
export function getIssuedInvoices(): IssuedInvoiceRecord[] {
  if (typeof window === "undefined") return DEFAULT_ISSUED_INVOICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ISSUED_INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ISSUED_INVOICES, JSON.stringify(DEFAULT_ISSUED_INVOICES));
      return DEFAULT_ISSUED_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ISSUED_INVOICES;
  }
}

export function saveIssuedInvoice(inv: IssuedInvoiceRecord) {
  if (typeof window === "undefined") return;
  const current = getIssuedInvoices();
  const filtered = current.filter((i) => i.invoiceNumber !== inv.invoiceNumber);
  localStorage.setItem(STORAGE_KEYS.ISSUED_INVOICES, JSON.stringify([inv, ...filtered]));
  emitDataBusSync("INVOICE_ISSUED");
}

// 2. Cutting Batches (Meja Potong Gudang -> FIFO Assembly)
export function getCuttingBatches(): CuttingBatch[] {
  if (typeof window === "undefined") return DEFAULT_CUTTING_BATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUTTING_BATCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUTTING_BATCHES, JSON.stringify(DEFAULT_CUTTING_BATCHES));
      return DEFAULT_CUTTING_BATCHES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CUTTING_BATCHES;
  }
}

export function addCuttingBatch(batch: CuttingBatch) {
  if (typeof window === "undefined") return;
  const current = getCuttingBatches();
  const updated = [batch, ...current];
  localStorage.setItem(STORAGE_KEYS.CUTTING_BATCHES, JSON.stringify(updated));
  emitDataBusSync("CUTTING_BATCH_ADDED");
}

// 3. QC Queue (Assembly Selesai -> Antrean Terminal QC: PASS & REPAIR only)
export function getQcQueue(): QcQueueItem[] {
  if (typeof window === "undefined") return DEFAULT_QC_QUEUE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QC_QUEUE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(DEFAULT_QC_QUEUE));
      return DEFAULT_QC_QUEUE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_QC_QUEUE;
  }
}

export function pushToQcQueue(item: QcQueueItem) {
  if (typeof window === "undefined") return;
  const current = getQcQueue();
  const updated = [item, ...current];
  localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
  emitDataBusSync("QC_QUEUE_PUSHED");
}

export function updateQcQueueItem(
  serial: string,
  status: QcQueueItem["status"],
  extra?: { defectCategory?: string; repairNote?: string }
) {
  if (typeof window === "undefined") return;
  const current = getQcQueue();
  const target = current.find((item) => item.serial === serial);
  const updated = current.map((item) =>
    item.serial === serial
      ? {
          ...item,
          status,
          ...(extra?.defectCategory ? { defectCategory: extra.defectCategory } : {}),
          ...(extra?.repairNote ? { repairNote: extra.repairNote } : {}),
        }
      : item
  );
  localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));

  // If PASS, automatically register in Finished Goods Ready for Warehouse Intake!
  if (status === "PASS" && target) {
    addFinishedGoodReady({
      id: `fg-${Date.now()}`,
      serialNumber: target.serial,
      orderNumber: target.orderNumber,
      clientCode: target.orderNumber === "ORD-2026-004" ? "SNOHUND" : "KLIEN_A",
      clientName: target.orderNumber === "ORD-2026-004" ? "Snøhund Alpine Wear" : "PT Bandung Apparel",
      articleName: target.articleName,
      status: "READY_FOR_WAREHOUSE",
      passedQcAt: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    });
  }

  emitDataBusSync("QC_QUEUE_UPDATED");
}

export function completeRepairAndReturnToQc(serial: string, repairNote?: string) {
  if (typeof window === "undefined") return;
  const current = getQcQueue();
  const updated = current.map((item) =>
    item.serial === serial
      ? {
          ...item,
          status: "REINSPECTION_PENDING" as const,
          isReinspection: true,
          repairNote: repairNote || "Perbaikan selesai dikerjakan lini, siap re-inspeksi QC",
        }
      : item
  );
  localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
  emitDataBusSync("QC_REPAIR_COMPLETED");
}

// 4. Custom Inbound Raw Materials
export function getCustomInventory(): InventoryItemCustom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_INVENTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCustomInventory(item: InventoryItemCustom) {
  if (typeof window === "undefined") return;
  const current = getCustomInventory();
  const updated = [item, ...current];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_INVENTORY, JSON.stringify(updated));
  emitDataBusSync("INVENTORY_ADDED");
}

// 5. QC Pool Bonus Live Sync
export function getLiveQcPoolBonus(defaultPool: number = 600): number {
  if (typeof window === "undefined") return defaultPool;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QC_POOL);
    return raw ? Number(raw) : defaultPool;
  } catch {
    return defaultPool;
  }
}

export function incrementLiveQcPoolBonus(amount: number = 300): number {
  if (typeof window === "undefined") return amount;
  const current = getLiveQcPoolBonus(600);
  const next = current + amount;
  localStorage.setItem(STORAGE_KEYS.QC_POOL, String(next));
  emitDataBusSync("QC_POOL_INCREMENTED");
  return next;
}

