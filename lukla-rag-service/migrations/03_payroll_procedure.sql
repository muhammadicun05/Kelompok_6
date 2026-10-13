-- ====================================================================
-- Payroll Calculation Procedure (UAT-02, UAT-03, FR-10.1 s/d FR-10.4)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.calculate_weekly_payroll(
    p_period_code VARCHAR(100),
    p_meal_pct NUMERIC DEFAULT 12.00,
    p_num_mandors INT DEFAULT 2,
    p_monthly_overhead NUMERIC DEFAULT 18500000.00
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_period_id UUID;
    v_total_piece_rate NUMERIC := 0;
    v_total_meal NUMERIC := 0;
    v_total_qc_pool NUMERIC := 0;
    v_total_verified_pcs INT := 0;
    v_total_recipients INT;
    v_bonus_per_supervisor NUMERIC := 0;
    v_worker RECORD;
    v_sup RECORD;
BEGIN
    -- Ensure meal pct within range 10-15%
    IF p_meal_pct < 10.00 OR p_meal_pct > 15.00 THEN
        RAISE EXCEPTION 'Uang makan wajib berada di rentang 10%% s/d 15%% (diberikan: %)', p_meal_pct;
    END IF;

    -- Ensure period exists or create it
    INSERT INTO public.payroll_periods (
        period_code,
        period_start,
        period_end,
        meal_allowance_percentage,
        num_mandors,
        total_monthly_overhead,
        status
    ) VALUES (
        p_period_code,
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        p_meal_pct,
        p_num_mandors,
        p_monthly_overhead,
        'CALCULATED'
    )
    ON CONFLICT (period_code) DO UPDATE
    SET meal_allowance_percentage = EXCLUDED.meal_allowance_percentage,
        num_mandors = EXCLUDED.num_mandors,
        total_monthly_overhead = EXCLUDED.total_monthly_overhead,
        status = 'CALCULATED'
    RETURNING id INTO v_period_id;

    -- Clear old items for this period
    DELETE FROM public.payroll_items WHERE payroll_period_id = v_period_id;

    -- 1. Calculate Tailor & Cutting piece rates from VERIFIED 30-min outputs
    -- Joining with order_rate_cards
    FOR v_worker IN
        SELECT 
            o30.operator_user_id,
            u.full_name,
            u.role,
            COALESCE(SUM(o30.qty_completed), 0) AS total_qty,
            COALESCE(SUM(o30.qty_completed * COALESCE(rc.rate_per_piece, 2000.00)), 0) AS subtotal_wage
        FROM public.output_logs_30min o30
        JOIN public.user_profiles u ON u.id = o30.operator_user_id
        LEFT JOIN public.order_rate_cards rc 
            ON rc.order_id = o30.order_id AND rc.component_name = o30.component_name
        WHERE o30.verification_status = 'VERIFIED'
        GROUP BY o30.operator_user_id, u.full_name, u.role
    LOOP
        DECLARE
            v_worker_meal NUMERIC := ROUND(v_worker.subtotal_wage * (p_meal_pct / 100.0), 2);
            v_worker_thp NUMERIC := v_worker.subtotal_wage + v_worker_meal;
        BEGIN
            INSERT INTO public.payroll_items (
                payroll_period_id,
                worker_user_id,
                worker_role,
                verified_output_pcs,
                piece_rate_subtotal,
                meal_allowance_cash,
                qc_bonus_received,
                take_home_pay,
                notes
            ) VALUES (
                v_period_id,
                v_worker.operator_user_id,
                v_worker.role,
                v_worker.total_qty,
                v_worker.subtotal_wage,
                v_worker_meal,
                0,
                v_worker_thp,
                format('Borongan %s pcs terverifikasi + Uang Makan %s%%', v_worker.total_qty, p_meal_pct)
            );

            v_total_piece_rate := v_total_piece_rate + v_worker.subtotal_wage;
            v_total_meal := v_total_meal + v_worker_meal;
            v_total_verified_pcs := v_total_verified_pcs + v_worker.total_qty;
        END;
    END LOOP;

    -- 2. Calculate QC Bonus Pool (UAT-03: Sum of pass units * rate)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_qc_pool
    FROM public.qc_bonus_ledger;

    -- If no ledger entries yet or 0, fallback to count pass inspections * 300
    IF v_total_qc_pool = 0 THEN
        SELECT COALESCE(COUNT(*) * 300.00, 0) INTO v_total_qc_pool
        FROM public.qc_inspections
        WHERE decision = 'PASS';
    END IF;

    -- 3. Calculate 3-Way Bonus Split (p_num_mandors Mandor + 1 Kepala Ops)
    v_total_recipients := p_num_mandors + 1;
    IF v_total_recipients > 0 AND v_total_qc_pool > 0 THEN
        v_bonus_per_supervisor := ROUND(v_total_qc_pool / v_total_recipients, 2);
    END IF;

    -- Allocate QC Bonus to Supervisors (Production Heads & Mandors)
    FOR v_sup IN
        SELECT id, full_name, role
        FROM public.user_profiles
        WHERE role = 'PRODUCTION_HEAD_MANDOR'
        LIMIT v_total_recipients
    LOOP
        INSERT INTO public.payroll_items (
            payroll_period_id,
            worker_user_id,
            worker_role,
            verified_output_pcs,
            piece_rate_subtotal,
            meal_allowance_cash,
            qc_bonus_received,
            take_home_pay,
            notes
        ) VALUES (
            v_period_id,
            v_sup.id,
            v_sup.role,
            0,
            0,
            0,
            v_bonus_per_supervisor,
            v_bonus_per_supervisor,
            format('Bonus Pool QC (%s penerima: %s Mandor + 1 Kepala Ops)', v_total_recipients, p_num_mandors)
        );
    END LOOP;

    -- Update Payroll Period totals
    UPDATE public.payroll_periods
    SET total_piece_rate = v_total_piece_rate,
        total_meal_allowance = v_total_meal,
        total_qc_bonus_pool = v_total_qc_pool,
        updated_at = NOW()
    WHERE id = v_period_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'period_id', v_period_id,
        'period_code', p_period_code,
        'total_verified_pcs', v_total_verified_pcs,
        'total_piece_rate', v_total_piece_rate,
        'total_meal_allowance', v_total_meal,
        'meal_allowance_pct', p_meal_pct,
        'total_qc_bonus_pool', v_total_qc_pool,
        'num_recipients', v_total_recipients,
        'bonus_per_supervisor', v_bonus_per_supervisor
    );
END;
$$;
