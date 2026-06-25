"""Smoke test all new API endpoints"""
import sys, json, subprocess

BASE = "http://localhost:8000"

def req(method, path, data=None):
    cmd = ["curl", "-s"]
    if data:
        cmd += ["-X", method, "-H", "Content-Type: application/json", "-d", json.dumps(data, ensure_ascii=False)]
    else:
        cmd += ["-X", method]
    cmd += [f"{BASE}{path}"]
    return subprocess.check_output(cmd, text=True, timeout=10)

# Login
r = json.loads(req("POST", "/api/auth/login", {"username": "admin", "password": "admin123"}))
token = r["access_token"]
auth_header = ["-H", f"Authorization: Bearer {token}"]

def auth_req(method, path, data=None):
    cmd = ["curl", "-s"]
    if data:
        cmd += ["-X", method, "-H", "Content-Type: application/json", "-d", json.dumps(data, ensure_ascii=False)]
    else:
        cmd += ["-X", method]
    cmd += auth_header + [f"{BASE}{path}"]
    return json.loads(subprocess.check_output(cmd, text=True, timeout=10))

tests = [
    ("GET /api/prescriptions", lambda: auth_req("GET", "/api/prescriptions?page=1&page_size=5")),
    ("GET /api/stats/dashboard", lambda: auth_req("GET", "/api/stats/dashboard")),
    ("GET /api/stats/age-distribution", lambda: auth_req("GET", "/api/stats/age-distribution")),
    ("GET /api/stats/full-report", lambda: auth_req("GET", "/api/stats/full-report")),
    ("GET /api/stats/gender-distribution", lambda: auth_req("GET", "/api/stats/gender-distribution")),
    ("GET /api/stats/prescriptions", lambda: auth_req("GET", "/api/stats/prescriptions")),
    ("GET /api/ai-enhance/diagnosis/available-patterns",
     lambda: auth_req("GET", "/api/ai-enhance/diagnosis/available-patterns")),
    ("POST /api/ai-enhance/formula/compare",
     lambda: auth_req("POST", "/api/ai-enhance/formula/compare", {"patterns": ["脾肾阳虚证", "肝郁脾虚证"]})),
    ("POST /api/ai-enhance/formula/check-compatibility",
     lambda: auth_req("POST", "/api/ai-enhance/formula/check-compatibility",
                      {"herbs": ["黄芪", "当归", "甘草", "甘遂"], "patient_status": None})),
    ("GET /api/ai-enhance/health-advice/脾肾阳虚证",
     lambda: auth_req("GET", "/api/ai-enhance/health-advice/%E8%84%BE%E8%82%BE%E9%98%B3%E8%99%9A%E8%AF%81")),
    ("GET /api/pharmacy/drugs/categories", lambda: auth_req("GET", "/api/pharmacy/drugs/categories")),
    ("GET /api/pharmacy/sales/summary", lambda: auth_req("GET", "/api/pharmacy/sales/summary")),
    ("GET /api/pharmacy/stats/overview", lambda: auth_req("GET", "/api/pharmacy/stats/overview")),
    ("GET /api/offline/status", lambda: auth_req("GET", "/api/offline/status")),
    ("GET /api/offline/health", lambda: auth_req("GET", "/api/offline/health")),
    ("GET /api/export/stats/summary", lambda: auth_req("GET", "/api/export/stats/summary")),
]

passed = 0
failed = 0
for name, fn in tests:
    try:
        r = fn()
        dt = type(r.get('data')).__name__
        code = r.get('code')
        print(f"  [PASS] {name}")
        print(f"         data_type={dt}, code={code}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        failed += 1

print(f"\n{'='*50}")
print(f"Results: {passed} passed, {failed} failed")
if failed == 0:
    print("All tests passed!")
else:
    sys.exit(1)
