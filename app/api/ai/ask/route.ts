import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledgeEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, role, clientId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ success: false, message: "Pertanyaan wajib diisi." }, { status: 400 });
    }

    const ragServiceUrl = process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "http://localhost:8000";

    // 1. Attempt to call Python FastAPI Pure RAG microservice (AWS Bedrock) if online
    try {
      const response = await fetch(`${ragServiceUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, role, client_id: clientId }),
        signal: AbortSignal.timeout(5000), // Sufficient timeout for RAG microservice response
      });

      if (response.ok) {
        const data = await response.json();
        // If the python microservice gave an actual answer and not empty
        if (data && data.answer) {
          return NextResponse.json({
            success: true,
            answer: data.answer,
            citations: data.citations || [],
            source: "AWS_BEDROCK_RAG",
          });
        }
      }
    } catch {
      // Microservice is offline or AWS Bedrock credentials not provided; proceed to domain knowledge engine
    }

    // 2. High-Precision Domain Knowledge Engine (BRD V3, 10 Asumsi Resmi, SOP 6 Fase)
    const { answer, citations } = searchKnowledge(question, role);

    return NextResponse.json({
      success: true,
      answer,
      citations,
      source: "LUKLA_DOMAIN_KNOWLEDGE_ENGINE",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
