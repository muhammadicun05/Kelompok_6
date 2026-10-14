export type Role = 
  | 'OWNER'
  | 'SAMPLE_TEAM'
  | 'WAREHOUSE'
  | 'PRODUCTION_HEAD_MANDOR'
  | 'TAILOR_OPERATOR'
  | 'TAILOR_ASSEMBLY'
  | 'QC_INSPECTOR'
  | 'FINANCE_PAYROLL'
  | 'B2B_CLIENT';

export type Scheme = 'CMT' | 'SEMI_CMT' | 'FULL_PACKAGE';

export type ClientType = 'INTERNAL_SNOHUND' | 'EXTERNAL_B2B';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type QCDecision = 'PASS' | 'REPAIR' | 'REJECT';

export interface Client {
  id: string;
  client_code: string;
  name: string;
  client_type: ClientType;
  thread_color_hex: string;
  contact_person?: string;
  contact_phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  client_id?: string;
}

export interface SampleVersion {
  id: string;
  sample_id: string;
  version_number: number;
  revision_notes: string;
  total_smv_seconds: number;
  material_consumption: any;
  is_approved: boolean;
  approved_at?: string;
}

export interface Sample {
  id: string;
  client_id: string;
  article_name: string;
  article_code: string;
  category: string;
  current_version: number;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  client?: Client;
  versions?: SampleVersion[];
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  sample_version_id?: string;
  scheme: Scheme;
  article_name: string;
  target_qty: number;
  completed_qty: number;
  status: 'DRAFT' | 'CONFIRMED' | 'MATERIAL_RECEIVING' | 'CUTTING' | 'SEWING' | 'MENUNGGU_QC' | 'COMPLETED' | 'DELIVERED';
  start_date?: string;
  target_delivery_date?: string;
  client?: Client;
}

export interface InventoryItem {
  id: string;
  sku_tag_code: string;
  client_id: string;
  order_id: string;
  item_name: string;
  item_category: 'RAW_MATERIAL' | 'WIP_CUT' | 'FINISHED_GOOD' | 'DEFECT';
  ownership_source: 'CLIENT_CONSIGNMENT' | 'LUKLA_PURCHASE';
  qty_on_hand: number;
  unit: string;
  warehouse_location: string;
  client?: Client;
  order?: Order;
}

export interface OutputLog30Min {
  id: string;
  order_id: string;
  machine_number: number;
  operator_user_id: string;
  component_name: string;
  slot_time: string;
  slot_date: string;
  qty_completed: number;
  verification_status: VerificationStatus;
  inputted_by_role: 'MANDOR' | 'TAILOR_OPERATOR';
  verified_by?: string;
  verified_at?: string;
  operator?: UserProfile;
}

export interface QCInspection {
  id: string;
  order_id: string;
  inspector_id: string;
  product_serial_tag: string;
  decision: QCDecision;
  defect_category?: string;
  defect_notes?: string;
  bonus_pool_increment: number;
  created_at: string;
}

export interface PayrollPeriod {
  id: string;
  period_code: string;
  period_start: string;
  period_end: string;
  meal_allowance_percentage: number;
  total_piece_rate: number;
  total_meal_allowance: number;
  total_qc_bonus_pool: number;
  num_mandors: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'DISBURSED';
}

export interface PayrollItem {
  id: string;
  payroll_period_id: string;
  worker_user_id: string;
  worker_role: string;
  verified_output_pcs: number;
  piece_rate_subtotal: number;
  meal_allowance_cash: number;
  qc_bonus_received: number;
  take_home_pay: number;
  notes?: string;
  worker?: UserProfile;
}
