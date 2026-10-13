import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, targetOrderId, qty, operatorId } = body;

    if (!itemId || !targetOrderId || !qty) {
      return NextResponse.json(
        { success: false, message: "Parameter itemId, targetOrderId, dan qty wajib diisi." },
        { status: 400 }
      );
    }

    // Call Supabase RPC stored procedure: issue_cutting_material
    const { data, error } = await supabase.rpc("issue_cutting_material", {
      p_item_id: itemId,
      p_target_order_id: targetOrderId,
      p_qty: Number(qty),
      p_operator_id: operatorId || "a1111111-0000-0000-0000-000000000003",
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (data.blocked) {
      return NextResponse.json(data, { status: 403 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
