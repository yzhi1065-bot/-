#!/bin/bash
set -e

echo "=== TCM Backend Entrypoint ==="

# Initialize DB tables + default admin/doctor accounts (done on import)
echo "--- Initializing database tables and default accounts ---"

# Seed herb/formula/acupoint data
echo "--- Seeding reference data ---"
python seed_data.py || echo "Seed data script skipped or failed (non-fatal)"

# Start uvicorn
echo "--- Starting uvicorn ---"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"
