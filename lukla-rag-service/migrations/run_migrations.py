import json
import os
import sys
import urllib.request

TOKEN = "sbp_fc39e78a0ad2494a0dab1edffb0e443b410db9da"
PROJECT_REF = "wrugjojtvgkuwjqopete"
QUERY_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

def execute_sql(sql_content: str, label: str):
    print(f"[*] Executing {label}...")
    payload = json.dumps({"query": sql_content}).encode("utf-8")
    req = urllib.request.Request(
        QUERY_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = resp.read().decode("utf-8")
            print(f"[+] {label} succeeded! Response: {result[:120]}...")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[-] {label} failed with HTTP {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"[-] Error: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    files = [
        ("01_master_operational_schema.sql", "Migration 01: Schema"),
        ("02_seed_operational_data.sql", "Migration 02: Seed Data")
    ]
    
    for filename, label in files:
        filepath = os.path.join(script_dir, filename)
        if not os.path.exists(filepath):
            print(f"[-] File not found: {filepath}")
            continue
        with open(filepath, "r", encoding="utf-8") as f:
            sql = f.read()
        success = execute_sql(sql, label)
        if not success:
            print(f"[!] Stopping at {filename}")
            sys.exit(1)
            
    print("[SUCCESS] All migrations applied cleanly!")

if __name__ == "__main__":
    main()
