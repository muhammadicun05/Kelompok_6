"""
Test Suite for Lukla Agentic Workflow & /ask-agent Endpoint
Memverifikasi:
1. SQLGuardrail Whitelist Enforcement (HANYA SELECT dan HANYA orders, products, production_lines)
2. QueryDecomposer Step Planning (JSON format)
3. 3 Tools execution (lookup_database, process_llm_query_result, answer_knowledge_question)
4. Iterative loop execution
5. Compatibility contract endpoint /ask-agent
"""

import sys
import unittest
sys.path.append("lukla-rag-service")

from rag_agent import SQLGuardrail, QueryDecomposer, AgenticWorkflowEngine
from fastapi.testclient import TestClient
from main import app

class TestLuklaAgenticWorkflow(unittest.TestCase):

    def setUp(self):
        self.engine = AgenticWorkflowEngine()
        self.client = TestClient(app)

    def test_01_sql_guardrail_whitelist_allowed(self):
        """Query SELECT pada orders, products, dan production_lines harus diizinkan."""
        valid_queries = [
            "SELECT * FROM orders",
            "SELECT id, article_name, target_qty FROM orders WHERE status = 'SEWING'",
            "SELECT * FROM products LIMIT 5",
            "SELECT line_name, capacity_machines, status FROM production_lines",
            "SELECT o.order_number, p.name FROM orders o JOIN products p ON o.article_name = p.name"
        ]
        for q in valid_queries:
            is_valid, err = SQLGuardrail.validate_query(q)
            self.assertTrue(is_valid, f"Harusnya valid: {q}, error: {err}")
            self.assertIsNone(err)

    def test_02_sql_guardrail_whitelist_forbidden_tables(self):
        """Query ke tabel di luar whitelist (misal: user_profiles, clients) harus diblokir."""
        forbidden_queries = [
            "SELECT * FROM user_profiles",
            "SELECT * FROM clients",
            "SELECT * FROM payroll_items",
            "SELECT * FROM inventory_items"
        ]
        for q in forbidden_queries:
            is_valid, err = SQLGuardrail.validate_query(q)
            self.assertFalse(is_valid, f"Harusnya diblokir: {q}")
            self.assertIn("Security Error", err)

    def test_03_sql_guardrail_forbidden_dml_ddl(self):
        """Statement non-SELECT (INSERT, UPDATE, DELETE, DROP) harus diblokir seketika."""
        malicious_queries = [
            "DELETE FROM orders WHERE id = '1'",
            "UPDATE products SET base_cost = 0",
            "INSERT INTO orders (order_number) VALUES ('ORD-HACK')",
            "DROP TABLE production_lines",
            "SELECT * FROM orders; DROP TABLE products"
        ]
        for q in malicious_queries:
            is_valid, err = SQLGuardrail.validate_query(q)
            self.assertFalse(is_valid, f"Harusnya ditolak: {q}")

    def test_04_query_decomposer_plan(self):
        """Decomposer harus memecah query menjadi JSON plan langkah-langkah kerja."""
        query = "Berapa kapasitas Lini B dan apa nama produk yang diproduksi?"
        decomposed = QueryDecomposer.decompose(query, role="OWNER")
        self.assertIn("plan", decomposed)
        self.assertGreaterEqual(len(decomposed["plan"]), 2)
        tools_in_plan = [s["tool"] for s in decomposed["plan"]]
        self.assertIn("lookup_database", tools_in_plan)
        self.assertIn("process_llm_query_result", tools_in_plan)

    def test_05_agent_execution_loop(self):
        """Agentic loop harus mengembalikan respons berformat identik dengan /ask."""
        query = "Tampilkan status lini produksi dan kapasitas mesinnya"
        result = self.engine.run(question=query, role="OWNER")
        self.assertIn("answer", result)
        self.assertIn("citations", result)
        self.assertIn("agent_trace", result)
        self.assertGreaterEqual(result["agent_trace"]["iterations_count"], 1)

    def test_06_endpoint_ask_agent(self):
        """Endpoint POST /ask-agent harus mengembalikan status 200 dan schema identik."""
        response = self.client.post("/ask-agent", json={
            "question": "Berapa target kuantitas pesanan hoodie yang sedang berjalan?",
            "role": "OWNER"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("citations", data)
        self.assertIsInstance(data["citations"], list)
        self.assertIn("agent_trace", data)

if __name__ == "__main__":
    unittest.main()
