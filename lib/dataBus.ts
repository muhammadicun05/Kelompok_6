// lib/dataBus.ts
// Real-time Event & State Bus for Lukla Operations Engine
// Connects Phase 1 (Samples) -> Phase 2 (Dashboard) -> Phase 3 (Warehouse) -> Phase 4 (Production) -> Phase 5 (QC) -> Phase 6 (Payroll)

export interface MassOrder {
  id: string;
  orderNumber: string;
  clientCode: string;
  clientName: string;
  article: string;
  scheme: "FULL_PACKAGE" | "SEMI_CMT" | "CMT";
  targetQty: number;
  completedQty?: number;
  inheritedVersion: string;
  inheritedSmv: string;
  inheritedFabric: string;
  status: "PENDING_OWNER_APPROVAL" | "APPROVED" | "REJECTED";
  createdAt: string;
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
  status: "WAITING" | "REINSPECTION_PENDING" | "PASS" | "REPAIR" | "REJECT";
  isReinspection: boolean;
  repairNote?: string;
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
    inheritedVersion: "v2 (Approved)",
    inheritedSmv: "18m 30s",
    inheritedFabric: "1.45 m Cordura 1000D / pcs",
    status: "PENDING_OWNER_APPROVAL",
    createdAt: "15 Okt 2026, 14:00",
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

  emitDataBusSync("ORDER_APPROVED");
  return target;
}

export function rejectMassOrder(orderNumber: string) {
  if (typeof window === "undefined") return;
  const pendings = getPendingMassOrders();
  const updated = pendings.map((o) =>
    o.orderNumber === orderNumber ? { ...o, status: "REJECTED" as const } : o
  );
  localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(updated));
  emitDataBusSync("ORDER_REJECTED");
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

// 3. QC Queue (Assembly Selesai -> Antrean Terminal QC)
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

export function updateQcQueueItem(serial: string, status: QcQueueItem["status"]) {
  if (typeof window === "undefined") return;
  const current = getQcQueue();
  const updated = current.map((item) => (item.serial === serial ? { ...item, status } : item));
  localStorage.setItem(STORAGE_KEYS.QC_QUEUE, JSON.stringify(updated));
  emitDataBusSync("QC_QUEUE_UPDATED");
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
