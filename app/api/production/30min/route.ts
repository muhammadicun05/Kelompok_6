import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("output_logs_30min")
      .select(`
        *,
        user_profiles:operator_user_id (
          id, full_name, role
        ),
        orders:order_id (
          id, order_number, article_name, client_id
        )
      `)
      .eq("slot_date", date)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      machineNumber,
      operatorUserId,
      componentName,
      slotTime,
      qtyCompleted,
      inputtedByRole, // 'MANDOR' | 'TAILOR_OPERATOR'
    } = body;

    // Dual-Mode Verification Rule (Locked Rule #7):
    // Mandor input -> langsung VERIFIED
    // Penjahit input -> PENDING
    const isMandor = inputtedByRole === "MANDOR" || inputtedByRole === "PRODUCTION_HEAD_MANDOR";
    const status = isMandor ? "VERIFIED" : "PENDING";
    const verifiedBy = isMandor ? operatorUserId : null;
    const verifiedAt = isMandor ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from("output_logs_30min")
      .insert({
        order_id: orderId,
        machine_number: machineNumber,
        operator_user_id: operatorUserId,
        component_name: componentName,
        slot_time: slotTime,
        slot_date: new Date().toISOString().split("T")[0],
        qty_completed: Number(qtyCompleted),
        verification_status: status,
        inputted_by_role: isMandor ? "MANDOR" : "TAILOR_OPERATOR",
        verified_by: verifiedBy,
        verified_at: verifiedAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 1-Tap Mandor Verify Endpoint
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { logId, mandorUserId } = body;

    if (!logId) {
      return NextResponse.json({ success: false, message: "logId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("output_logs_30min")
      .update({
        verification_status: "VERIFIED",
        verified_by: mandorUserId || "a1111111-0000-0000-0000-000000000005",
        verified_at: new Date().toISOString(),
      })
      .eq("id", logId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
