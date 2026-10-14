import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledgeEngine";
import { supabase } from "@/lib/supabase";

/**
 * Next.js API Route for /api/ai/ask-agent
 * Proxies to Python FastAPI /ask-agent (http://localhost:8000/ask-agent)
 * With intelligent full-stack TypeScript Agentic Workflow fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, role, clientId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ success: false, message: "Pertanyaan wajib diisi." }, { status: 400 });
    }

    const ragServiceUrl = process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "http://localhost:8000";

    // 1. Attempt to call FastAPI /ask-agent microservice
    try {
      const response = await fetch(`${ragServiceUrl}/ask-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, role, client_id: clientId }),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.answer) {
          return NextResponse.json({
            success: true,
            answer: data.answer,
            citations: data.citations || [],
            agent_trace: data.agent_trace || null,
            source: "FASTAPI_AGENTIC_WORKFLOW",
          });
        }
      }
    } catch {
      // Microservice offline, proceed to in-engine agentic workflow
    }

    // 2. Full-Stack Agentic Workflow Engine (Fallback)
    const qLower = question.toLowerCase();
    const trace: any[] = [];
    const citations: any[] = [];
    let dbSummary = "";

    // Step 1: Decomposer
    const needsLines = qLower.includes("lini") || qLower.includes("mesin") || qLower.includes("kapasitas");
    const needsOrders = qLower.includes("order") || qLower.includes("pesanan") || qLower.includes("progres");
    const needsProducts = qLower.includes("produk") || qLower.includes("smv") || qLower.includes("artikel");

    // Whitelist query execution
    if (needsLines) {
      trace.push({ step: 1, tool: "lookup_database", table: "production_lines", status: "EXECUTED" });
      const { data: lines } = await supabase.from("production_lines").select("*");
      if (lines && lines.length > 0) {
        dbSummary += "Status Lini Produksi Pabrik Ciwidey (Total ±70 Mesin):\n" +
          lines.map((l: any) => `- ${l.line_name}: Kapasitas ${l.capacity_machines} mesin, Artikel: '${l.current_article}', Status: ${l.status}`).join("\n") + "\n\n";
      }
    }

    if (needsOrders) {
      trace.push({ step: 2, tool: "lookup_database", table: "orders", status: "EXECUTED" });
      const { data: orders } = await supabase.from("orders").select("*").limit(5);
      if (orders && orders.length > 0) {
        dbSummary += "Ringkasan Pesanan Produksi:\n" +
          orders.map((o: any) => `- Pesanan ${o.order_number}: ${o.article_name} (Status: ${o.status}, Selesai: ${o.completed_qty}/${o.target_qty} pcs, Skema: ${o.scheme})`).join("\n") + "\n\n";
      }
    }

    if (needsProducts) {
      trace.push({ step: 3, tool: "lookup_database", table: "products", status: "EXECUTED" });
      const { data: prods } = await supabase.from("products").select("*").limit(5);
      if (prods && prods.length > 0) {
        dbSummary += "Katalog Produk & Waktu Standar SMV:\n" +
          prods.map((p: any) => `- [${p.product_code}] ${p.name}: Kategori ${p.category}, SMV ${p.smv_standard_minutes} menit`).join("\n") + "\n\n";
      }
    }

    // Step 2: Knowledge QA Lookup
    const kbResult = searchKnowledge(question, role);
    citations.push(...kbResult.citations);
    trace.push({ step: trace.length + 1, tool: "answer_knowledge_question", status: "COMPLETED" });

    const finalAnswer = dbSummary ? `${dbSummary.trim()}\n\n---\n\n${kbResult.answer}` : kbResult.answer;

    return NextResponse.json({
      success: true,
      answer: finalAnswer,
      citations,
      agent_trace: {
        iterations_count: trace.length,
        execution_steps: trace,
      },
      source: "LUKLA_INAPP_AGENTIC_ENGINE",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
