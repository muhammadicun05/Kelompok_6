"""
Lukla Operations Engine — Agentic RAG Workflow Service (rag-agent.py)
Stand-alone / root executable version of the Agentic Workflow Engine
"""

import sys
import os

# Tambahkan lukla-rag-service ke path python
sys.path.append(os.path.join(os.path.dirname(__file__), "lukla-rag-service"))

from rag_agent import (
    SQLGuardrail,
    LuklaAgentTools,
    QueryDecomposer,
    AgenticWorkflowEngine
)

if __name__ == "__main__":
    print("=== Lukla Operations Engine: Agentic Workflow Test ===")
    engine = AgenticWorkflowEngine()

    test_queries = [
        "Bagaimana kapasitas dan status Lini B di pabrik Ciwidey?",
        "Tampilkan daftar pesanan berjalan dan progres kuantitasnya",
        "Apakah gaji borongan penjahit dipotong jika produk cacat di QC?",
        "SELECT * FROM orders WHERE status = 'SEWING'",
        "SELECT * FROM user_profiles" # Harus ditolak oleh SQLGuardrail
    ]

    for q in test_queries:
        print(f"\n--- Testing Query: '{q}' ---")
        res = engine.run(question=q, role="OWNER")
        print("Answer Preview:\n", res["answer"][:200] + "...")
        print("Citations:", len(res["citations"]))
        trace = res.get("agent_trace", {})
        print("Iterations:", trace.get("iterations_count"))
        for s in trace.get("execution_steps", []):
            print(f"  [Step {s['iteration']}] {s['tool']} -> Status: {s['status']}")
