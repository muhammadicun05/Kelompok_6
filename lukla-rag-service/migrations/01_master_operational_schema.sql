-- ====================================================================
-- Lukla Operations Engine - Master Operational Database Migration
-- Supports 6 BPMN Operational Phases, 10 Locked Business Rules,
-- Multi-Tenant Client Tagging (FR-6.1), Anti-Contamination Check (FR-6.2),
-- Dual-Mode 30-Min Output, QC Pool, and 3-Way Bonus Split.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTS & MULTI-TENANCY
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. SNOHUND, KLIEN_A, KLIEN_B
    name VARCHAR(255) NOT NULL,
    client_type VARCHAR(50) NOT NULL CHECK (client_type IN ('INTERNAL_SNOHUND', 'EXTERNAL_B2B')),
    thread_color_hex VARCHAR(20) DEFAULT '#26325B', -- Used for UI ThreadEdge border
    contact_person VARCHAR(100),
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES & 8 RBAC ROLES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'OWNER',
        'SAMPLE_TEAM',
        'WAREHOUSE',
        'PRODUCTION_HEAD_MANDOR',
        'TAILOR_OPERATOR',
        'QC_INSPECTOR',
        'FINANCE_PAYROLL',
        'B2B_CLIENT'
    )),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- Only populated if role = 'B2B_CLIENT'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FASE 1: SAMPLES, VERSIONS & TIME STUDY (STOPWATCH)
CREATE TABLE IF NOT EXISTS public.samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    article_name VARCHAR(255) NOT NULL,
    article_code VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g. Hoodie, Parka, Pants, Kemeja
    current_version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'IN_REVIEW' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sample_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_id UUID NOT NULL REFERENCES public.samples(id) ON DELETE CASCADE,
    version_number INT NOT NULL, -- 1, 2, ...
    revision_notes TEXT,
    total_smv_seconds INT DEFAULT 0, -- Total Standard Minute Value (in seconds)
    material_consumption JSONB DEFAULT '[]'::jsonb, -- BOM: [{"fabric_type": "Fleece", "consumption_per_pc_yard": 1.8}]
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sample_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.sample_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_version_id UUID NOT NULL REFERENCES public.sample_versions(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL, -- e.g. Badan Depan, Lengan Kiri, Kerah, Saku
    component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('CUTTING', 'SEWING', 'ASSEMBLY')),
    smv_seconds INT NOT NULL DEFAULT 0, -- Standard time recorded by digital stopwatch
    difficulty_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FASE 2: ORDERS, RATE CARDS & PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. ORD-2026-001
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT, -- FR-6.1 Mandatory
    sample_version_id UUID REFERENCES public.sample_versions(id),
    scheme VARCHAR(50) NOT NULL CHECK (scheme IN ('CMT', 'SEMI_CMT', 'FULL_PACKAGE')),
    article_name VARCHAR(255) NOT NULL,
    target_qty INT NOT NULL CHECK (target_qty > 0),
    completed_qty INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (status IN (
        'DRAFT', 'CONFIRMED', 'MATERIAL_RECEIVING', 'CUTTING', 'SEWING', 'MENUNGGU_QC', 'COMPLETED', 'DELIVERED'
    )),
    start_date DATE,
    target_delivery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_rate_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('CUTTING', 'SEWING', 'ASSEMBLY')),
    rate_per_piece NUMERIC(12, 2) NOT NULL CHECK (rate_per_piece >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id),
    po_type VARCHAR(50) NOT NULL CHECK (po_type IN (
        'CLIENT_CONSIGNMENT_REMINDER', -- CMT scheme: PO directly to client as commitment reminder & tracking
        'SUPPLIER_PURCHASE'            -- SEMI_CMT / FULL_PACKAGE: PO to fabric/accessories supplier
    )),
    item_description TEXT NOT NULL,
    target_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'RECEIVED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FASE 3: INVENTORY & ANTI-CONTAMINATION ENGINE (FR-6.1 & FR-6.2)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_tag_code VARCHAR(100) UNIQUE NOT NULL, -- Barcode/QR tag
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT, -- FR-6.1
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,   -- FR-6.1
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(50) NOT NULL CHECK (item_category IN (
        'RAW_MATERIAL', 'WIP_CUT', 'FINISHED_GOOD', 'DEFECT'
    )),
    ownership_source VARCHAR(50) NOT NULL CHECK (ownership_source IN (
        'CLIENT_CONSIGNMENT', 'LUKLA_PURCHASE'
    )),
    qty_on_hand NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (qty_on_hand >= 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'Yard', -- Yard, Roll, Pcs
    warehouse_location VARCHAR(100) DEFAULT 'Ciwidey Warehouse Rack A-01',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
    source_client_id UUID NOT NULL REFERENCES public.clients(id),
    target_order_id UUID NOT NULL REFERENCES public.orders(id),
    target_client_id UUID NOT NULL REFERENCES public.clients(id),
    tx_type VARCHAR(50) NOT NULL CHECK (tx_type IN (
        'INBOUND', 'ISSUE_TO_CUTTING', 'WIP_TRANSFER', 'FINISHING_TRANSFER', 'OUTBOUND'
    )),
    qty NUMERIC(12, 2) NOT NULL,
    is_blocked_contamination BOOLEAN NOT NULL DEFAULT FALSE, -- FR-6.2 flag
    block_reason TEXT,
    operator_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FASE 4: PRODUCTION ALLOCATIONS & 30-MINUTE DUAL-MODE TERMINAL (FR-7.1 s/d FR-7.4)
CREATE TABLE IF NOT EXISTS public.production_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    machine_number INT NOT NULL CHECK (machine_number BETWEEN 1 AND 70), -- ±70 active machines
    operator_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    line_name VARCHAR(50) NOT NULL DEFAULT 'Lini A', -- Lini A, Lini B, Lini C, etc.
    assigned_component VARCHAR(100) NOT NULL,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_number, shift_date)
);

CREATE TABLE IF NOT EXISTS public.output_logs_30min (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    machine_number INT NOT NULL CHECK (machine_number BETWEEN 1 AND 70),
    operator_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    component_name VARCHAR(100) NOT NULL,
    slot_time VARCHAR(20) NOT NULL, -- e.g. "08:00-08:30", "08:30-09:00", etc.
    slot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    qty_completed INT NOT NULL CHECK (qty_completed >= 0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN (
        'PENDING', 'VERIFIED', 'REJECTED'
    )),
    inputted_by_role VARCHAR(50) NOT NULL CHECK (inputted_by_role IN (
        'MANDOR', 'TAILOR_OPERATOR'
    )),
    verified_by UUID REFERENCES public.user_profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FASE 5: QC INSPECTIONS & POOL BONUS QC
CREATE TABLE IF NOT EXISTS public.qc_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    inspector_id UUID NOT NULL REFERENCES public.user_profiles(id),
    product_serial_tag VARCHAR(100) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('PASS', 'REPAIR', 'REJECT')),
    defect_category VARCHAR(100), -- Jahitan Melompat, Noda Oli, Ukuran Beda, Kerah Miring, etc.
    defect_notes TEXT,
    bonus_pool_increment NUMERIC(10, 2) NOT NULL DEFAULT 0, -- e.g. +Rp 300 per unit PASS
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qc_bonus_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qc_inspection_id UUID REFERENCES public.qc_inspections(id) ON DELETE SET NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    pass_qty INT NOT NULL DEFAULT 1,
    rate_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 300.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FASE 6: PAYROLL & FINANCIAL RECAP (SATURDAY PERIODS & 3-WAY BONUS SPLIT)
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. PAY-2026-W41
    period_start DATE NOT NULL,
    period_end DATE NOT NULL, -- Ends on Saturday
    meal_allowance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 12.00 CHECK (meal_allowance_percentage BETWEEN 10.00 AND 15.00), -- 10% - 15%
    total_piece_rate NUMERIC(14, 2) DEFAULT 0,
    total_meal_allowance NUMERIC(14, 2) DEFAULT 0,
    total_qc_bonus_pool NUMERIC(14, 2) DEFAULT 0,
    total_monthly_overhead NUMERIC(14, 2) DEFAULT 0,
    num_mandors INT NOT NULL DEFAULT 2, -- Default 2 mandors (+ 1 kepala ops)
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'APPROVED', 'DISBURSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    worker_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    worker_role VARCHAR(50) NOT NULL, -- TAILOR_OPERATOR / CUTTING
    verified_output_pcs INT NOT NULL DEFAULT 0,
    piece_rate_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    meal_allowance_cash NUMERIC(12, 2) NOT NULL DEFAULT 0, -- 10-15% cash in slip gaji
    qc_bonus_received NUMERIC(12, 2) DEFAULT 0, -- Populated for Mandor & Head of Ops
    take_home_pay NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_config_policies (
    policy_key VARCHAR(100) PRIMARY KEY,
    active_mode VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANTI-CONTAMINATION RPC STORED PROCEDURE (FR-6.1 & FR-6.2)
CREATE OR REPLACE FUNCTION public.issue_cutting_material(
    p_item_id UUID,
    p_target_order_id UUID,
    p_qty NUMERIC,
    p_operator_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_item RECORD;
    v_order RECORD;
    v_is_blocked BOOLEAN := FALSE;
    v_reason TEXT := NULL;
    v_tx_id UUID;
BEGIN
    -- Fetch item
    SELECT * INTO v_item FROM public.inventory_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item inventaris dengan ID % tidak ditemukan', p_item_id;
    END IF;

    -- Fetch order
    SELECT * INTO v_order FROM public.orders WHERE id = p_target_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order dengan ID % tidak ditemukan', p_target_order_id;
    END IF;

    -- VALIDASI ANTI-KONTAMINASI (FR-6.1 & FR-6.2)
    -- Bahan baku WAJIB memiliki client_id dan order_id yang sama persis dengan order tujuan
    IF v_item.client_id <> v_order.client_id THEN
        v_is_blocked := TRUE;
        v_reason := format('BLOKIR ANTI-KONTAMINASI [FR-6.2]: Bahan baku milik Klien ID %s dicoba dikeluarkan untuk Order milik Klien ID %s! Transaksi ditolak seketika.', v_item.client_id, v_order.client_id);
    ELSIF v_item.order_id <> v_order.id THEN
        v_is_blocked := TRUE;
        v_reason := format('BLOKIR ANTI-KONTAMINASI [FR-6.2]: Bahan baku terdaftar untuk Order %s dicoba dikeluarkan untuk Order %s!', v_item.order_id, v_order.id);
    ELSIF v_item.qty_on_hand < p_qty THEN
        v_is_blocked := TRUE;
        v_reason := format('STOK TIDAK MENCUKUPI: Permintaan %s %s, stok tersedia %s %s', p_qty, v_item.unit, v_item.qty_on_hand, v_item.unit);
    END IF;

    -- Log transaction audit
    INSERT INTO public.inventory_transactions (
        inventory_item_id,
        source_client_id,
        target_order_id,
        target_client_id,
        tx_type,
        qty,
        is_blocked_contamination,
        block_reason,
        operator_id
    ) VALUES (
        v_item.id,
        v_item.client_id,
        v_order.id,
        v_order.client_id,
        'ISSUE_TO_CUTTING',
        p_qty,
        v_is_blocked,
        v_reason,
        p_operator_id
    ) RETURNING id INTO v_tx_id;

    -- Jika terblokir, kembalikan respons error
    IF v_is_blocked THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'blocked', TRUE,
            'status_code', 403,
            'message', v_reason,
            'transaction_id', v_tx_id
        );
    END IF;

    -- Jika valid, kurangi stok bahan baku
    UPDATE public.inventory_items
    SET qty_on_hand = qty_on_hand - p_qty,
        updated_at = NOW()
    WHERE id = p_item_id;

    -- Buat/Update entri WIP Cut untuk area Cutting (tanpa sisa bahan)
    INSERT INTO public.inventory_items (
        sku_tag_code,
        client_id,
        order_id,
        item_name,
        item_category,
        ownership_source,
        qty_on_hand,
        unit,
        warehouse_location
    ) VALUES (
        format('WIP-CUT-%s-%s', v_order.order_number, substring(gen_random_uuid()::text, 1, 6)),
        v_order.client_id,
        v_order.id,
        format('Potongan Pola - %s', v_order.article_name),
        'WIP_CUT',
        v_item.ownership_source,
        p_qty,
        'Pcs',
        'Cutting Floor Area Ciwidey'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'blocked', FALSE,
        'status_code', 200,
        'message', 'Pengeluaran bahan ke Cutting berhasil diverifikasi bebas kontaminasi.',
        'transaction_id', v_tx_id,
        'remaining_stock', (v_item.qty_on_hand - p_qty)
    );
END;
$$;
