"""Verify full app loads with all routes"""
import sys
sys.path.insert(0, '.')
from app.main import app

routes = [(r.path, r.methods) for r in app.routes if hasattr(r, 'path')]
print(f'Total routes: {len(routes)}')
for path, methods in sorted(routes, key=lambda x: x[0]):
    print(f'  {methods} {path}')
