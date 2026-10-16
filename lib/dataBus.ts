// lib/dataBus.ts
// Real-time Event & State Bus for Lukla Operations Engine
// Connects Phase 1 (Samples & Catalog) -> Phase 2 (Dashboard Approval) -> Phase 3 (Warehouse, Raw Materials, POs, Cutting, Finished Goods) -> Phase 4 (Production) -> Phase 5 (QC Pass/Repair) -> Phase 6 (Payroll & PPN 11% Invoices)

import { Role } from "./types";

export interface MassOrder {
  id: string;
  orderNumber: string;
  clientCode: string;
  clientName: string;
  clientType?: "internal" | "b2b";
  article: string;
  scheme: "FULL_PACKAGE" | "SEMI_CMT" | "CMT";
  targetQty: number;
  completedQty?: number;
  clearedQc?: number;
  sellingPricePerUnit?: number;
  productCatalogId?: string;
  inheritedVersion: string;
  inheritedSmv: string;
  inheritedFabric: string;
  status: "PENDING_OWNER_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "QC" | "DONE" | "REJECTED";
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface ClientRecord {
  id: string;
  code: string;
  name: string;
  type: "internal" | "b2b";
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  activeOrdersCount: number;
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
  rackLocation?: string;
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

export interface LineAllocationRecord {
  id: string;
  workerName: string;
  machineNumber: number;
  lineName: string;
  orderNumber: string;
  articleName: string;
  componentName: string;
  producedUnits: number;
  targetQuantity: number;
  status: "ACTIVE" | "TARGET_REACHED";
  allocatedAt: string;
}

export interface UnverifiedOutputRecord {
  id: string;
  lineName: string;
  workerName: string;
  orderNumber: string;
  articleName: string;
  componentName: string;
  quantity: number;
  periodStart: string;
  status: "PENDING" | "VERIFIED";
}

export interface RateCardRecord {
  id: string;
  clientCode: string;
  clientName: string;
  articleName: string;
  componentName: string;
  rateSew: number;
  rateCut: number;
  effectiveFrom: string;
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

export interface UserAccountRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
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
  ALL_ORDERS: "lukla_all_orders",
  CLIENTS: "lukla_clients",
  PRODUCT_CATALOG: "lukla_product_catalog",
  RAW_MATERIALS: "lukla_raw_materials",
  PURCHASE_ORDERS: "lukla_purchase_orders",
  FINISHED_GOODS: "lukla_finished_goods",
  ISSUED_INVOICES: "lukla_issued_invoices",
  CUTTING_BATCHES: "lukla_cutting_batches",
  LINE_ALLOCATIONS: "lukla_line_allocations",
  UNVERIFIED_OUTPUTS: "lukla_unverified_outputs",
  RATE_CARDS: "lukla_rate_cards",
  QC_QUEUE: "lukla_qc_queue",
  QC_POOL: "lukla_qc_pool",
  CUSTOM_INVENTORY: "lukla_custom_inventory",
  USERS: "lukla_users",
  SYNC_EVENT: "lukla_data_sync_event",
};

// ── Seed Data ──────────────────────────────────────────────────────────────────

const DEFAULT_CLIENTS: ClientRecord[] = [
  {
    id: "cli-001",
    code: "SNOHUND",
    name: "Snøhund Alpine Wear",
    type: "internal",
    contactPerson: "Dedi Suhendar (Brand Manager)",
    contactPhone: "0812-3456-7890",
    email: "dedi@snohund.id",
    address: "Jl. Raya Ciwidey Km 24, Kabupaten Bandung",
    activeOrdersCount: 2,
    createdAt: "01 Jan 2026",
  },
  {
    id: "cli-002",
    code: "KLIEN_A",
    name: "PT Bandung Apparel",
    type: "b2b",
    contactPerson: "Hendra Wijaya (Sourcing Director)",
    contactPhone: "0811-2233-4455",
    email: "hendra@bdgapparel.co.id",
    address: "Kawasan Industri Batununggal No. 402, Bandung",
    activeOrdersCount: 1,
    createdAt: "15 Jan 2026",
  },
  {
    id: "cli-003",
    code: "KLIEN_B",
    name: "CV Priangan Outdoor",
    type: "b2b",
    contactPerson: "Bambang Sutrisno (Owner)",
    contactPhone: "0813-8877-6655",
    email: "bambang@prianganoutdoor.com",
    address: "Jl. Soreang Indah No. 88, Soreang, Bandung",
    activeOrdersCount: 1,
    createdAt: "02 Feb 2026",
  },
];

const DEFAULT_ORDERS: MassOrder[] = [
  {
    id: "ord-001",
    orderNumber: "ORD-2026-001",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    clientType: "internal",
    article: "Snøhund Alpine Tactical Backpack 35L",
    scheme: "FULL_PACKAGE",
    targetQty: 300,
    completedQty: 300,
    clearedQc: 300,
    sellingPricePerUnit: 245000,
    productCatalogId: "cat-001",
    inheritedVersion: "v1 (Approved)",
    inheritedSmv: "18m 30s",
    inheritedFabric: "1.45 m Cordura 1000D / pcs",
    status: "DONE",
    notes: "Batch perdana pesanan internal Snøhund — produksi dan invoice tuntas.",
    createdAt: "10 Okt 2026",
    approvedAt: "11 Okt 2026",
  },
  {
    id: "ord-002",
    orderNumber: "ORD-2026-002",
    clientCode: "KLIEN_A",
    clientName: "PT Bandung Apparel",
    clientType: "b2b",
    article: "Urban Commuter Roll-Top Backpack 25L",
    scheme: "SEMI_CMT",
    targetQty: 200,
    completedQty: 100,
    clearedQc: 100,
    sellingPricePerUnit: 165000,
    productCatalogId: "cat-002",
    inheritedVersion: "v2 (Approved)",
    inheritedSmv: "15m 20s",
    inheritedFabric: "1.25 m Ripstop Nylon / pcs",
    status: "IN_PRODUCTION",
    notes: "Skema Semi-CMT: Kain titipan klien, hardware & busa disediakan Lukla.",
    createdAt: "12 Okt 2026",
    approvedAt: "13 Okt 2026",
  },
  {
    id: "ord-003",
    orderNumber: "ORD-2026-003",
    clientCode: "KLIEN_B",
    clientName: "CV Priangan Outdoor",
    clientType: "b2b",
    article: "Priangan Daypack Lightweight 20L",
    scheme: "CMT",
    targetQty: 150,
    completedQty: 0,
    clearedQc: 0,
    sellingPricePerUnit: 85000,
    inheritedVersion: "v1 (Approved)",
    inheritedSmv: "12m 10s",
    inheritedFabric: "0.95 m Ripstop Diamond / pcs",
    status: "APPROVED",
    notes: "Skema CMT Murni: PO Komitmen bahan baku diterbitkan ke Klien (Rule #5).",
    createdAt: "13 Okt 2026",
    approvedAt: "14 Okt 2026",
  },
  {
    id: "ord-004",
    orderNumber: "ORD-2026-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    clientType: "internal",
    article: "Snøhund Alpine Tactical Backpack 35L v2",
    scheme: "FULL_PACKAGE",
    targetQty: 500,
    completedQty: 45,
    clearedQc: 35,
    sellingPricePerUnit: 245000,
    productCatalogId: "cat-001",
    inheritedVersion: "v2 (Approved)",
    inheritedSmv: "18m 30s",
    inheritedFabric: "1.45 m Cordura 1000D / pcs",
    status: "PENDING_OWNER_APPROVAL",
    notes: "Hasil konversi versi sampel disetujui (Approved v2) oleh Tim Sampler — menunggu aktivasi Owner.",
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
    rackLocation: "RAK-FG-A1",
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
    rackLocation: "RAK-FG-A1",
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

const DEFAULT_RATE_CARDS: RateCardRecord[] = [
  {
    id: "rc-001",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Depan & Saku Organizer",
    rateSew: 1500,
    rateCut: 400,
    effectiveFrom: "01 Jan 2026",
  },
  {
    id: "rc-002",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Belakang & Busa Ergonomis",
    rateSew: 1800,
    rateCut: 450,
    effectiveFrom: "01 Jan 2026",
  },
  {
    id: "rc-003",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Tali Bahu & Sternum Strap",
    rateSew: 1200,
    rateCut: 350,
    effectiveFrom: "01 Jan 2026",
  },
  {
    id: "rc-004",
    clientCode: "SNOHUND",
    clientName: "Snøhund Alpine Wear",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Perakitan Tas Utuh (Assembly)",
    rateSew: 3500,
    rateCut: 0,
    effectiveFrom: "01 Jan 2026",
  },
  {
    id: "rc-005",
    clientCode: "KLIEN_A",
    clientName: "PT Bandung Apparel",
    articleName: "Urban Commuter Roll-Top Backpack 25L",
    componentName: "Roll-Top Main Body",
    rateSew: 1400,
    rateCut: 350,
    effectiveFrom: "15 Jan 2026",
  },
  {
    id: "rc-006",
    clientCode: "KLIEN_A",
    clientName: "PT Bandung Apparel",
    articleName: "Urban Commuter Roll-Top Backpack 25L",
    componentName: "Laptop Sleeve Foam Padding",
    rateSew: 1100,
    rateCut: 300,
    effectiveFrom: "15 Jan 2026",
  },
];

const DEFAULT_LINE_ALLOCATIONS: LineAllocationRecord[] = [
  {
    id: "alloc-001",
    workerName: "Siti Rahma (Penjahit #01)",
    machineNumber: 1,
    lineName: "Lini 1 (Sewing Body)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Depan & Saku Organizer",
    producedUnits: 42,
    targetQuantity: 500,
    status: "ACTIVE",
    allocatedAt: "15 Okt 2026, 08:00",
  },
  {
    id: "alloc-002",
    workerName: "Rina Marlina (Penjahit #02)",
    machineNumber: 2,
    lineName: "Lini 1 (Sewing Body)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Belakang & Busa Ergonomis",
    producedUnits: 38,
    targetQuantity: 500,
    status: "ACTIVE",
    allocatedAt: "15 Okt 2026, 08:00",
  },
  {
    id: "alloc-003",
    workerName: "Agus Susanto (Penjahit #08)",
    machineNumber: 8,
    lineName: "Lini 2 (Straps & Webbing)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Tali Bahu & Sternum Strap",
    producedUnits: 45,
    targetQuantity: 500,
    status: "ACTIVE",
    allocatedAt: "15 Okt 2026, 08:00",
  },
  {
    id: "alloc-004",
    workerName: "Budi Hartono (Penjahit #22)",
    machineNumber: 22,
    lineName: "Lini 3 (Assembly Meja)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Perakitan Tas Utuh (Assembly)",
    producedUnits: 35,
    targetQuantity: 500,
    status: "ACTIVE",
    allocatedAt: "15 Okt 2026, 08:00",
  },
];

const DEFAULT_UNVERIFIED_OUTPUTS: UnverifiedOutputRecord[] = [
  {
    id: "unv-001",
    lineName: "Lini 1 (Sewing Body)",
    workerName: "Siti Rahma (Penjahit #01)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Depan & Saku Organizer",
    quantity: 6,
    periodStart: "10:00 - 10:30 WIB",
    status: "PENDING",
  },
  {
    id: "unv-002",
    lineName: "Lini 1 (Sewing Body)",
    workerName: "Rina Marlina (Penjahit #02)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Panel Belakang & Busa Ergonomis",
    quantity: 5,
    periodStart: "10:00 - 10:30 WIB",
    status: "PENDING",
  },
  {
    id: "unv-003",
    lineName: "Lini 2 (Straps & Webbing)",
    workerName: "Agus Susanto (Penjahit #08)",
    orderNumber: "ORD-2026-004",
    articleName: "Snøhund Alpine Tactical Backpack 35L",
    componentName: "Tali Bahu & Sternum Strap",
    quantity: 7,
    periodStart: "10:00 - 10:30 WIB",
    status: "PENDING",
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

const DEFAULT_USERS: UserAccountRecord[] = [
  { id: "usr-01", name: "Pak Dedi", email: "dedi@lukla.id", role: "OWNER", isActive: true, createdAt: "01 Jan 2026" },
  { id: "usr-02", name: "Mbak Lina", email: "lina@lukla.id", role: "SAMPLE_TEAM", isActive: true, createdAt: "05 Jan 2026" },
  { id: "usr-03", name: "Kang Asep", email: "asep@lukla.id", role: "WAREHOUSE", isActive: true, createdAt: "05 Jan 2026" },
  { id: "usr-04", name: "Pak Jajang", email: "jajang@lukla.id", role: "PRODUCTION_HEAD_MANDOR", isActive: true, createdAt: "08 Jan 2026" },
  { id: "usr-05", name: "Siti Rahma", email: "siti@lukla.id", role: "TAILOR_OPERATOR", isActive: true, createdAt: "10 Jan 2026" },
  { id: "usr-06", name: "Rina Marlina", email: "rina@lukla.id", role: "TAILOR_ASSEMBLY", isActive: true, createdAt: "10 Jan 2026" },
  { id: "usr-07", name: "Teh Reni", email: "reni@lukla.id", role: "QC_INSPECTOR", isActive: true, createdAt: "12 Jan 2026" },
  { id: "usr-08", name: "Bu Sari", email: "sari@lukla.id", role: "FINANCE_PAYROLL", isActive: true, createdAt: "12 Jan 2026" },
  { id: "usr-09", name: "Pak Hendra (Klien Maklon A)", email: "hendra@bdgapparel.co.id", role: "B2B_CLIENT", isActive: true, createdAt: "15 Jan 2026" },
];

// ── Event Bus Dispatcher ───────────────────────────────────────────────────────

export function emitDataBusSync(eventKey: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_EVENT, `${eventKey}_${Date.now()}`);
    window.dispatchEvent(new CustomEvent("lukla_bus_update", { detail: { eventKey } }));
  } catch {}
}

// ── Orders API ────────────────────────────────────────────────────────────────

export function getAllMassOrders(): MassOrder[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function getPendingMassOrders(): MassOrder[] {
  return getAllMassOrders().filter((o) => o.status === "PENDING_OWNER_APPROVAL");
}

export function getApprovedMassOrders(): MassOrder[] {
  return getAllMassOrders().filter((o) => o.status !== "PENDING_OWNER_APPROVAL" && o.status !== "REJECTED");
}

export function getOrderByIdOrRef(idOrRef: string): MassOrder | undefined {
  const all = getAllMassOrders();
  return all.find((o) => o.id === idOrRef || o.orderNumber === idOrRef);
}

export function savePendingMassOrder(order: MassOrder) {
  if (typeof window === "undefined") return;
  const current = getAllMassOrders();
  const filtered = current.filter((o) => o.orderNumber !== order.orderNumber);
  const updated = [order, ...filtered];
  localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(updated));
  emitDataBusSync("ORDER_CREATED");
}

export function createMassOrder(newOrder: Omit<MassOrder, "id" | "orderNumber" | "completedQty" | "clearedQc" | "status" | "createdAt">): MassOrder {
  const current = getAllMassOrders();
  const nextSeq = current.length + 1;
  const orderNumber = `ORD-2026-${String(nextSeq).padStart(3, "0")}`;
  const order: MassOrder = {
    ...newOrder,
    id: `ord-${Date.now()}`,
    orderNumber,
    completedQty: 0,
    clearedQc: 0,
    status: "PENDING_OWNER_APPROVAL",
    createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  };
  savePendingMassOrder(order);
  return order;
}

export function approveMassOrder(orderNumber: string): MassOrder | null {
  if (typeof window === "undefined") return null;
  const all = getAllMassOrders();
  const target = all.find((o) => o.orderNumber === orderNumber);
  if (!target) return null;

  target.status = "APPROVED";
  target.approvedAt = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  
  const updated = all.map((o) => (o.orderNumber === orderNumber ? target : o));
  localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(updated));

  // Graduate to Product Catalog automatically (Adopted from TestLukia-main approveOrderAction)
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
      defaultSellingPricePerUnit: target.sellingPricePerUnit || 245000,
      componentCount: 5,
      smvSummary: target.inheritedSmv || "18m 30s",
      bomSummary: target.inheritedFabric || "1.45 m Cordura 1000D / pcs",
      cataloguedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      sourceOrderNumber: target.orderNumber,
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCT_CATALOG, JSON.stringify([newCatItem, ...catalog]));
  }

  // Auto-generate PO or Client Commitment from BOM (Rule #5 Skema CMT)
  const pos = getPurchaseOrders();
  const existsPo = pos.some((p) => p.orderNumber === target.orderNumber);
  if (!existsPo) {
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
  }

  emitDataBusSync("ORDER_APPROVED");
  return target;
}

export function rejectMassOrder(orderNumber: string, reason?: string) {
  if (typeof window === "undefined") return;
  const all = getAllMassOrders();
  const updated = all.map((o) =>
    o.orderNumber === orderNumber
      ? {
          ...o,
          status: "REJECTED" as const,
          rejectionReason: reason || "Spesifikasi atau harga belum disetujui",
          rejectedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        }
      : o
  );
  localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(updated));
  emitDataBusSync("ORDER_REJECTED");
}

export function markMassOrderDone(orderNumber: string) {
  if (typeof window === "undefined") return;
  const all = getAllMassOrders();
  const updated = all.map((o) =>
    o.orderNumber === orderNumber ? { ...o, status: "DONE" as const } : o
  );
  localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(updated));
  emitDataBusSync("ORDER_DONE");
}

// ── Clients API ───────────────────────────────────────────────────────────────

export function getClients(): ClientRecord[] {
  if (typeof window === "undefined") return DEFAULT_CLIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
      return DEFAULT_CLIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLIENTS;
  }
}

export function saveClient(client: ClientRecord) {
  if (typeof window === "undefined") return;
  const current = getClients();
  const filtered = current.filter((c) => c.code !== client.code && c.id !== client.id);
  const updated = [client, ...filtered];
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
  emitDataBusSync("CLIENT_SAVED");
}

// ── Product Catalog API ───────────────────────────────────────────────────────

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

export function addProductCatalogItem(item: ProductCatalogItem) {
  if (typeof window === "undefined") return;
  const current = getProductCatalog();
  const updated = [item, ...current];
  localStorage.setItem(STORAGE_KEYS.PRODUCT_CATALOG, JSON.stringify(updated));
  emitDataBusSync("CATALOG_UPDATED");
}

// ── Raw Materials & POs API ───────────────────────────────────────────────────

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

export function addRawMaterial(material: RawMaterialMaster) {
  if (typeof window === "undefined") return;
  const current = getRawMaterialCatalog();
  const updated = [material, ...current];
  localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(updated));
  emitDataBusSync("RAW_MATERIAL_ADDED");
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

// ── Finished Goods Warehouse Intake API ───────────────────────────────────────

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

export function receiveFinishedGoodToWarehouse(serialNumber: string, storedBy: string = "Kang Asep (Gudang)", rackLocation: string = "RAK-FG-A1") {
  if (typeof window === "undefined") return;
  const current = getFinishedGoods();
  const nowStr = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const updated = current.map((fg) =>
    fg.serialNumber === serialNumber
      ? { ...fg, status: "STORED" as const, storedAt: nowStr, storedBy, rackLocation }
      : fg
  );
  localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify(updated));
  emitDataBusSync("FINISHED_GOOD_STORED");
}

export function receiveAllReadyFinishedGoodsByOrder(orderNumber: string, storedBy: string = "Kang Asep (Gudang)", rackLocation: string = "RAK-FG-A1") {
  if (typeof window === "undefined") return;
  const current = getFinishedGoods();
  const nowStr = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const updated = current.map((fg) =>
    fg.orderNumber === orderNumber && fg.status === "READY_FOR_WAREHOUSE"
      ? { ...fg, status: "STORED" as const, storedAt: nowStr, storedBy, rackLocation }
      : fg
  );
  localStorage.setItem(STORAGE_KEYS.FINISHED_GOODS, JSON.stringify(updated));
  emitDataBusSync("FINISHED_GOOD_STORED");
}

// ── Invoicing with Explicit PPN 11% ───────────────────────────────────────────

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

export function issueInvoiceFromOrder(orderNumber: string): IssuedInvoiceRecord | null {
  const order = getOrderByIdOrRef(orderNumber);
  if (!order) return null;

  const current = getIssuedInvoices();
  const nextSeq = current.length + 1;
  const invoiceNumber = `INV-2026-${String(nextSeq).padStart(3, "0")}`;
  const price = order.sellingPricePerUnit || 245000;
  const qty = (order.clearedQc && order.clearedQc > 0) ? order.clearedQc : order.targetQty;
  const subtotalWithoutPpn = qty * price;
  const ppnRate = 11;
  const ppnAmount = Math.round((subtotalWithoutPpn * ppnRate) / 100);
  const totalWithPpn = subtotalWithoutPpn + ppnAmount;

  const newInvoice: IssuedInvoiceRecord = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    orderNumber: order.orderNumber,
    clientCode: order.clientCode,
    clientName: order.clientName,
    articleName: order.article,
    scheme: order.scheme,
    quantity: qty,
    pricePerUnit: price,
    subtotalWithoutPpn,
    ppnRate,
    ppnAmount,
    totalWithPpn,
    fulfillmentMethod: "SHIPPING",
    paymentStatus: "UNPAID",
    issuedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
  };

  saveIssuedInvoice(newInvoice);
  return newInvoice;
}

// ── Rate Cards API ────────────────────────────────────────────────────────────

export function getRateCards(): RateCardRecord[] {
  if (typeof window === "undefined") return DEFAULT_RATE_CARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RATE_CARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RATE_CARDS, JSON.stringify(DEFAULT_RATE_CARDS));
      return DEFAULT_RATE_CARDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RATE_CARDS;
  }
}

export function saveRateCard(card: RateCardRecord) {
  if (typeof window === "undefined") return;
  const current = getRateCards();
  const filtered = current.filter((c) => c.id !== card.id);
  const updated = [card, ...filtered];
  localStorage.setItem(STORAGE_KEYS.RATE_CARDS, JSON.stringify(updated));
  emitDataBusSync("RATE_CARD_SAVED");
}

// ── Production Allocations & Outputs API ───────────────────────────────────────

export function getLineAllocations(): LineAllocationRecord[] {
  if (typeof window === "undefined") return DEFAULT_LINE_ALLOCATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINE_ALLOCATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LINE_ALLOCATIONS, JSON.stringify(DEFAULT_LINE_ALLOCATIONS));
      return DEFAULT_LINE_ALLOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LINE_ALLOCATIONS;
  }
}

export function saveLineAllocation(alloc: LineAllocationRecord) {
  if (typeof window === "undefined") return;
  const current = getLineAllocations();
  const filtered = current.filter((a) => a.id !== alloc.id);
  const updated = [alloc, ...filtered];
  localStorage.setItem(STORAGE_KEYS.LINE_ALLOCATIONS, JSON.stringify(updated));
  emitDataBusSync("ALLOCATION_SAVED");
}

export function getUnverifiedOutputs(): UnverifiedOutputRecord[] {
  if (typeof window === "undefined") return DEFAULT_UNVERIFIED_OUTPUTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNVERIFIED_OUTPUTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UNVERIFIED_OUTPUTS, JSON.stringify(DEFAULT_UNVERIFIED_OUTPUTS));
      return DEFAULT_UNVERIFIED_OUTPUTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_UNVERIFIED_OUTPUTS;
  }
}

export function verifyOutputEntry(entryId: string) {
  if (typeof window === "undefined") return;
  const current = getUnverifiedOutputs();
  const target = current.find((e) => e.id === entryId);
  if (!target) return;

  const updated = current.map((e) => (e.id === entryId ? { ...e, status: "VERIFIED" as const } : e));
  localStorage.setItem(STORAGE_KEYS.UNVERIFIED_OUTPUTS, JSON.stringify(updated));

  // Update line allocation count
  const allocs = getLineAllocations();
  const updatedAllocs = allocs.map((a) =>
    a.workerName === target.workerName && a.componentName === target.componentName
      ? { ...a, producedUnits: a.producedUnits + target.quantity }
      : a
  );
  localStorage.setItem(STORAGE_KEYS.LINE_ALLOCATIONS, JSON.stringify(updatedAllocs));

  emitDataBusSync("OUTPUT_VERIFIED");
}

export function assembleCompletedProducts(orderNumber: string, count: number, assembledBy: string = "Meja Assembly #1 (Rina & Siti)") {
  if (typeof window === "undefined") return;
  for (let i = 0; i < count; i++) {
    const serial = `BAG-SNO-${Math.floor(1000 + Math.random() * 9000)}`;
    pushToQcQueue({
      serial,
      orderNumber,
      articleName: "Snøhund Alpine Tactical Backpack 35L",
      assembledBy,
      arrivedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      status: "WAITING",
      isReinspection: false,
    });
  }
  emitDataBusSync("PRODUCTS_ASSEMBLED");
}

// ── Cutting Batches API ───────────────────────────────────────────────────────

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

// ── QC Queue API (PASS and REPAIR only) ────────────────────────────────────────

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

    // Also increment order clearedQc count
    const allOrders = getAllMassOrders();
    const updatedOrders = allOrders.map((o) =>
      o.orderNumber === target.orderNumber
        ? { ...o, clearedQc: (o.clearedQc || 0) + 1, completedQty: (o.completedQty || 0) + 1 }
        : o
    );
    localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(updatedOrders));
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

// ── Custom Inbound Raw Materials API ──────────────────────────────────────────

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

// ── Live QC Pool Bonus API ────────────────────────────────────────────────────

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

// ── Users / RBAC Directory API ────────────────────────────────────────────────

export function getUserAccounts(): UserAccountRecord[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}
