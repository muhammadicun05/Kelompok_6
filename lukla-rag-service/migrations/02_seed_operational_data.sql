-- ====================================================================
-- Lukla Operations Engine - Operational Seed Data (Valid UUIDs)
-- ====================================================================

-- 1. CLIENTS
INSERT INTO public.clients (id, client_code, name, client_type, thread_color_hex, contact_person, contact_phone)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'SNOHUND', 'Snøhund Alpine Wear', 'INTERNAL_SNOHUND', '#26325B', 'Lukla Internal Design', '0812-3456-7890'),
    ('22222222-2222-2222-2222-222222222222', 'KLIEN_A', 'PT Bandung Apparel Eksklusif', 'EXTERNAL_B2B', '#C46D29', 'Pak Hendra (Merchandiser)', '0813-9876-5432'),
    ('33333333-3333-3333-3333-333333333333', 'KLIEN_B', 'CV Priangan Outdoor Nusantara', 'EXTERNAL_B2B', '#3B7A57', 'Ibu Ratna (Procurement)', '0821-1122-3344')
ON CONFLICT (client_code) DO UPDATE 
SET name = EXCLUDED.name, thread_color_hex = EXCLUDED.thread_color_hex;

-- 2. USER PROFILES (8 ROLES)
INSERT INTO public.user_profiles (id, email, full_name, role, client_id)
VALUES
    ('a1111111-0000-0000-0000-000000000001', 'owner@lukla.id', 'Pak Dedi (Owner)', 'OWNER', NULL),
    ('a1111111-0000-0000-0000-000000000002', 'sample@lukla.id', 'Mbak Lina (Master Sample)', 'SAMPLE_TEAM', NULL),
    ('a1111111-0000-0000-0000-000000000003', 'gudang@lukla.id', 'Kang Asep (Kepala Gudang)', 'WAREHOUSE', NULL),
    ('a1111111-0000-0000-0000-000000000004', 'kepala.ops@lukla.id', 'Pak Jajang (Kepala Operasional)', 'PRODUCTION_HEAD_MANDOR', NULL),
    ('a1111111-0000-0000-0000-000000000005', 'mandor1@lukla.id', 'Mandor Ujang (Lini 1)', 'PRODUCTION_HEAD_MANDOR', NULL),
    ('a1111111-0000-0000-0000-000000000006', 'mandor2@lukla.id', 'Mandor Dadang (Lini 2)', 'PRODUCTION_HEAD_MANDOR', NULL),
    ('a1111111-0000-0000-0000-000000000007', 'tailor.siti@lukla.id', 'Siti Rahma (Penjahit #01)', 'TAILOR_OPERATOR', NULL),
    ('a1111111-0000-0000-0000-000000000008', 'tailor.rina@lukla.id', 'Rina Wati (Penjahit #02)', 'TAILOR_OPERATOR', NULL),
    ('a1111111-0000-0000-0000-000000000009', 'cutting.agus@lukla.id', 'Agus Supriadi (Tim Cutting #03)', 'TAILOR_OPERATOR', NULL),
    ('a1111111-0000-0000-0000-000000000010', 'tailor.budi@lukla.id', 'Budi Santoso (Penjahit Baru #61)', 'TAILOR_OPERATOR', NULL),
    ('a1111111-0000-0000-0000-000000000011', 'tailor.wawan@lukla.id', 'Wawan Setiawan (Penjahit Baru #62)', 'TAILOR_OPERATOR', NULL),
    ('a1111111-0000-0000-0000-000000000012', 'qc@lukla.id', 'Teh Reni (QC Inspector)', 'QC_INSPECTOR', NULL),
    ('a1111111-0000-0000-0000-000000000013', 'finance@lukla.id', 'Bu Sari (Finance & Payroll)', 'FINANCE_PAYROLL', NULL),
    ('a1111111-0000-0000-0000-000000000014', 'b2b.hendra@bandungapparel.id', 'Pak Hendra (Klien A Merchandiser)', 'B2B_CLIENT', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (email) DO NOTHING;

-- 3. SAMPLES & VERSIONS
INSERT INTO public.samples (id, client_id, article_name, article_code, category, current_version, status)
VALUES
    ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Snøhund Alpine Heavy Hoodie', 'SNO-HD-01', 'Hoodie', 2, 'APPROVED'),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Urban Windbreaker Parka', 'BAE-PRK-02', 'Parka', 2, 'APPROVED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sample_versions (id, sample_id, version_number, revision_notes, total_smv_seconds, material_consumption, is_approved)
VALUES
    ('b1111111-0001-0000-0000-000000000001', 'b1111111-1111-1111-1111-111111111111', 1, 'Versi awal: Fitting lengan terlalu sempit, konsumsi fleece 2.1 yard/pcs', 720, '[{"fabric": "Cotton Heavy Fleece 330gsm", "yard": 2.1}, {"rib": "Rib Spandex", "kg": 0.2}]'::jsonb, FALSE),
    ('b1111111-0002-0000-0000-000000000002', 'b1111111-1111-1111-1111-111111111111', 2, 'Revisi disetujui: Pola lingkar lengan diperlebar 2cm, efisiensi konsumsi pola 1.85 yard/pcs', 660, '[{"fabric": "Cotton Heavy Fleece 330gsm", "yard": 1.85}, {"rib": "Rib Spandex", "kg": 0.18}]'::jsonb, TRUE),
    ('b2222222-0001-0000-0000-000000000001', 'b2222222-2222-2222-2222-222222222222', 1, 'Sampel awal Maklon Klien A: Ritsleting YKK miring', 900, '[{"fabric": "Taslan Milky Coating", "yard": 2.3}]'::jsonb, FALSE),
    ('b2222222-0002-0000-0000-000000000002', 'b2222222-2222-2222-2222-222222222222', 2, 'Revisi disetujui Maklon Klien A: Ritsleting lurus & penambahan storm flap', 840, '[{"fabric": "Taslan Milky Coating", "yard": 2.25}]'::jsonb, TRUE)
ON CONFLICT (sample_id, version_number) DO NOTHING;

-- 4. ORDERS & RATE CARDS
INSERT INTO public.orders (id, order_number, client_id, sample_version_id, scheme, article_name, target_qty, completed_qty, status, start_date, target_delivery_date)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'ORD-2026-001', '11111111-1111-1111-1111-111111111111', 'b1111111-0002-0000-0000-000000000002', 'FULL_PACKAGE', 'Snøhund Alpine Heavy Hoodie', 500, 320, 'SEWING', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days'),
    ('e2222222-2222-2222-2222-222222222222', 'ORD-2026-002', '22222222-2222-2222-2222-222222222222', 'b2222222-0002-0000-0000-000000000002', 'SEMI_CMT', 'Urban Windbreaker Parka', 1000, 650, 'SEWING', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
    ('e3333333-3333-3333-3333-333333333333', 'ORD-2026-003', '33333333-3333-3333-3333-333333333333', NULL, 'CMT', 'Priangan Outdoor Trackpants', 800, 150, 'CUTTING', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '20 days')
ON CONFLICT (order_number) DO NOTHING;

-- RATE CARDS
INSERT INTO public.order_rate_cards (order_id, component_name, operation_type, rate_per_piece)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Potong Pola Komplit', 'CUTTING', 1200.00),
    ('e1111111-1111-1111-1111-111111111111', 'Badan Depan & Kantong Kanguru', 'SEWING', 2500.00),
    ('e1111111-1111-1111-1111-111111111111', 'Lengan & Pasang Rib Manset', 'SEWING', 1800.00),
    ('e1111111-1111-1111-1111-111111111111', 'Assembly Kap & Finishing Utuh', 'ASSEMBLY', 3000.00),

    ('e2222222-2222-2222-2222-222222222222', 'Potong Taslan Pola', 'CUTTING', 1500.00),
    ('e2222222-2222-2222-2222-222222222222', 'Badan & Pasang Zipper Depan', 'SEWING', 3200.00),
    ('e2222222-2222-2222-2222-222222222222', 'Lengan & Manset Velcro', 'SEWING', 2000.00),
    ('e2222222-2222-2222-2222-222222222222', 'Assembly Hood & Lining Furing', 'ASSEMBLY', 3500.00)
ON CONFLICT DO NOTHING;

-- 5. INVENTORY ITEMS (FR-6.1 MANDATORY CLIENT & ORDER TAGGING)
INSERT INTO public.inventory_items (id, sku_tag_code, client_id, order_id, item_name, item_category, ownership_source, qty_on_hand, unit, warehouse_location)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'RAW-SNO-FLEECE-01', '11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Cotton Heavy Fleece Midnight Blue', 'RAW_MATERIAL', 'LUKLA_PURCHASE', 850.00, 'Yard', 'Rack A-01 (Snøhund)'),
    ('f2222222-2222-2222-2222-222222222222', 'RAW-KLA-TASLAN-02', '22222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'Taslan Milky Waterproof Black Titipan Klien A', 'RAW_MATERIAL', 'CLIENT_CONSIGNMENT', 1500.00, 'Yard', 'Rack B-03 (Klien A)'),
    ('f3333333-3333-3333-3333-333333333333', 'RAW-KLB-TERRY-03',  '33333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'Baby Terry Charcoal Titipan Klien B', 'RAW_MATERIAL', 'CLIENT_CONSIGNMENT', 1200.00, 'Yard', 'Rack C-02 (Klien B)')
ON CONFLICT (sku_tag_code) DO NOTHING;

-- 6. SYSTEM CONFIG POLICIES
INSERT INTO public.system_config_policies (policy_key, active_mode, parameters)
VALUES
    ('QC_PAYROLL_POLICY', 'NO_CLAWBACK_PIECE_RATE', '{"qc_affects_tailor_wage": false, "qc_pool_rate_per_pass_unit": 300.00}'::jsonb),
    ('MEAL_ALLOWANCE_MODE', 'CASH_IN_SLIP', '{"default_percentage": 12.00, "min_percentage": 10.00, "max_percentage": 15.00}'::jsonb),
    ('QC_BONUS_DISTRIBUTION', 'SPLIT_EQUAL', '{"default_mandor_count": 2, "head_of_ops_count": 1, "custom_mandor_count": 2}'::jsonb),
    ('MONTHLY_OVERHEAD', 'PER_UNIT_ALLOCATION', '{"current_month_overhead_idr": 18500000.00, "estimated_monthly_units": 6000}'::jsonb)
ON CONFLICT (policy_key) DO UPDATE
SET parameters = EXCLUDED.parameters, updated_at = NOW();

-- 7. PRODUCTION ALLOCATIONS (±70 MACHINES)
INSERT INTO public.production_allocations (order_id, machine_number, operator_user_id, line_name, assigned_component, shift_date)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 1, 'a1111111-0000-0000-0000-000000000007', 'Lini A (Hoodie)', 'Badan Depan & Kantong Kanguru', CURRENT_DATE),
    ('e1111111-1111-1111-1111-111111111111', 2, 'a1111111-0000-0000-0000-000000000008', 'Lini A (Hoodie)', 'Lengan & Pasang Rib Manset', CURRENT_DATE),
    ('e1111111-1111-1111-1111-111111111111', 3, 'a1111111-0000-0000-0000-000000000009', 'Cutting Area', 'Potong Pola Komplit', CURRENT_DATE),
    ('e2222222-2222-2222-2222-222222222222', 61, 'a1111111-0000-0000-0000-000000000010', 'Lini C (Ekspansi)', 'Badan & Pasang Zipper Depan', CURRENT_DATE),
    ('e2222222-2222-2222-2222-222222222222', 62, 'a1111111-0000-0000-0000-000000000011', 'Lini C (Ekspansi)', 'Lengan & Manset Velcro', CURRENT_DATE)
ON CONFLICT (machine_number, shift_date) DO NOTHING;

-- 8. OUTPUT LOGS 30 MENIT (DUAL-MODE)
INSERT INTO public.output_logs_30min (order_id, machine_number, operator_user_id, component_name, slot_time, slot_date, qty_completed, verification_status, inputted_by_role, verified_by, verified_at)
VALUES
    -- Mesin 1 diinput mandor -> Langsung Verified
    ('e1111111-1111-1111-1111-111111111111', 1, 'a1111111-0000-0000-0000-000000000007', 'Badan Depan & Kantong Kanguru', '08:00-08:30', CURRENT_DATE, 18, 'VERIFIED', 'MANDOR', 'a1111111-0000-0000-0000-000000000005', NOW()),
    ('e1111111-1111-1111-1111-111111111111', 1, 'a1111111-0000-0000-0000-000000000007', 'Badan Depan & Kantong Kanguru', '08:30-09:00', CURRENT_DATE, 20, 'VERIFIED', 'MANDOR', 'a1111111-0000-0000-0000-000000000005', NOW()),
    -- Mesin 2 diinput penjahit -> Status PENDING
    ('e1111111-1111-1111-1111-111111111111', 2, 'a1111111-0000-0000-0000-000000000008', 'Lengan & Pasang Rib Manset', '08:00-08:30', CURRENT_DATE, 15, 'PENDING', 'TAILOR_OPERATOR', NULL, NULL),
    ('e1111111-1111-1111-1111-111111111111', 2, 'a1111111-0000-0000-0000-000000000008', 'Lengan & Pasang Rib Manset', '08:30-09:00', CURRENT_DATE, 17, 'PENDING', 'TAILOR_OPERATOR', NULL, NULL),
    -- Mesin 61 & 62 (Penjahit Baru UAT-02)
    ('e2222222-2222-2222-2222-222222222222', 61, 'a1111111-0000-0000-0000-000000000010', 'Badan & Pasang Zipper Depan', '08:00-08:30', CURRENT_DATE, 12, 'VERIFIED', 'MANDOR', 'a1111111-0000-0000-0000-000000000005', NOW()),
    ('e2222222-2222-2222-2222-222222222222', 62, 'a1111111-0000-0000-0000-000000000011', 'Lengan & Manset Velcro', '08:00-08:30', CURRENT_DATE, 14, 'VERIFIED', 'MANDOR', 'a1111111-0000-0000-0000-000000000005', NOW())
ON CONFLICT DO NOTHING;

-- 9. QC INSPECTIONS & BONUS LEDGER
INSERT INTO public.qc_inspections (order_id, inspector_id, product_serial_tag, decision, defect_category, bonus_pool_increment)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000012', 'QC-SNO-001-001', 'PASS', NULL, 300.00),
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000012', 'QC-SNO-001-002', 'PASS', NULL, 300.00),
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000012', 'QC-SNO-001-003', 'REPAIR', 'Jahitan Saku Miring', 0.00),
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000012', 'QC-SNO-001-004', 'REJECT', 'Kain Robek / Noda Kimia Permanen', 0.00)
ON CONFLICT DO NOTHING;

INSERT INTO public.qc_bonus_ledger (order_id, pass_qty, rate_per_unit, amount)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 1, 300.00, 300.00),
    ('e1111111-1111-1111-1111-111111111111', 1, 300.00, 300.00)
ON CONFLICT DO NOTHING;
