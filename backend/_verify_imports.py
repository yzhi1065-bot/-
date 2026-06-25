"""Verify all API modules import correctly"""
import sys
sys.path.insert(0, '.')

from app.api.prescriptions import router as r1
print('prescriptions OK:', len(r1.routes), 'routes')

from app.api.pharmacy import router as r2
print('pharmacy OK:', len(r2.routes), 'routes')

from app.api.stats_api import router as r3
print('stats_api OK:', len(r3.routes), 'routes')

from app.api.export_api import router as r4
print('export_api OK:', len(r4.routes), 'routes')

from app.api.offline_api import router as r5
print('offline_api OK:', len(r5.routes), 'routes')

from app.api.ai_enhance import router as r6
print('ai_enhance OK:', len(r6.routes), 'routes')

print()
print('All 6 files imported successfully!')
