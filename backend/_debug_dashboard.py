"""Debug dashboard endpoint"""
import sys, json, subprocess

BASE = "http://localhost:8000"

# Login
r = json.loads(subprocess.check_output(
    ["curl", "-s", "-X", "POST", f"{BASE}/api/auth/login",
     "-H", "Content-Type: application/json",
     "-d", '{"username":"admin","password":"admin123"}'],
    text=True, timeout=10))
token = r["access_token"]

# Test dashboard
result = subprocess.check_output(
    ["curl", "-s", "-H", f"Authorization: Bearer {token}",
     f"{BASE}/api/stats/dashboard"],
    text=True, timeout=10)
print("Raw response:")
print(repr(result[:500]))
print()

try:
    d = json.loads(result)
    print(f"Parsed: code={d.get('code')}, data keys={list(d.get('data', {}).keys())}")
except json.JSONDecodeError as e:
    print(f"JSON parse error: {e}")
