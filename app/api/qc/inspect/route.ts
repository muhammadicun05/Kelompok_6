import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      inspectorId = "a1111111-0000-0000-0000-000000000012",
      productSerialTag,
      decision, // 'PASS' | 'REPAIR' | 'REJECT'
      defectCategory,
      defectNotes,
    } = body;

    const isPass = decision === "PASS";
    const bonusIncrement = isPass ? 300.0 : 0.0;

    // 1. Record Inspection
    const { data: inspection, error: inspError } = await supabase
      .from("qc_inspections")
      .insert({
        order_id: orderId,
        inspector_id: inspectorId,
        product_serial_tag: productSerialTag || `QC-SN-${Date.now().toString().slice(-6)}`,
        decision,
        defect_category: isPass ? null : defectCategory,
        defect_notes: defectNotes || null,
        bonus_pool_increment: bonusIncrement,
      })
      .select()
      .single();

    if (inspError) {
      return NextResponse.json({ success: false, message: inspError.message }, { status: 500 });
    }

    // 2. If PASS, increment QC bonus ledger
    if (isPass) {
      await supabase.from("qc_bonus_ledger").insert({
        qc_inspection_id: inspection.id,
        order_id: orderId,
        pass_qty: 1,
        rate_per_unit: 300.0,
        amount: 300.0,
      });

      // Increment order completed_qty
      const { data: ord } = await supabase
        .from("orders")
        .select("completed_qty, target_qty")
        .eq("id", orderId)
        .single();

      if (ord) {
        await supabase
          .from("orders")
          .update({ completed_qty: (ord.completed_qty || 0) + 1 })
          .eq("id", orderId);
      }
    }

    // 3. Fetch updated total QC Pool
    const { data: poolData } = await supabase
      .from("qc_bonus_ledger")
      .select("amount");

    const totalPool = (poolData || []).reduce((acc: number, item: any) => acc + Number(item.amount), 0);

    return NextResponse.json({
      success: true,
      inspection,
      totalQcBonusPool: totalPool,
      bonusSplitEstimate: {
        totalPool,
        numRecipients: 3,
        perSupervisor: Math.round(totalPool / 3),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
