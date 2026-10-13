import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      periodCode = `PAY-2026-W${Math.ceil(new Date().getDate() / 7)}`, 
      mealPct = 12.0, 
      numMandors = 2, 
      monthlyOverhead = 18500000.0 
    } = body;

    const { data, error } = await supabase.rpc("calculate_weekly_payroll", {
      p_period_code: periodCode,
      p_meal_pct: Number(mealPct),
      p_num_mandors: Number(numMandors),
      p_monthly_overhead: Number(monthlyOverhead),
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Also fetch the created payroll items with worker names
    const { data: items, error: itemsError } = await supabase
      .from("payroll_items")
      .select(`
        id,
        worker_role,
        verified_output_pcs,
        piece_rate_subtotal,
        meal_allowance_cash,
        qc_bonus_received,
        take_home_pay,
        notes,
        user_profiles (
          id,
          full_name,
          role
        )
      `)
      .eq("payroll_period_id", data.period_id);

    return NextResponse.json({
      success: true,
      calculation: data,
      items: items || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
