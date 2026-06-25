"""List all API routes"""
from app.api import (
    auth_router, patients_router, diagnosis_router,
    ai_diagnosis_router, prescriptions_router, devices_router,
    ai_config_router, constitution_router, export_router, pharmacy_router,
    ai_enhance_router, offline_router, stats_router, tongue_router,
    compatibility_router, fallback_router,
)

routers = [
    ('auth', auth_router),
    ('patients', patients_router),
    ('diagnosis', diagnosis_router),
    ('ai_diagnosis', ai_diagnosis_router),
    ('prescriptions', prescriptions_router),
    ('pharmacy', pharmacy_router),
    ('devices', devices_router),
    ('ai_config', ai_config_router),
    ('constitution', constitution_router),
    ('export', export_router),
    ('stats', stats_router),
    ('offline', offline_router),
    ('ai_enhance', ai_enhance_router),
    ('compatibility', compatibility_router),
    ('tongue', tongue_router),
    ('fallback', fallback_router),
]
for name, r in routers:
    routes = [(route.path, sorted(route.methods)) for route in r.routes]
    print(f'{name}: {routes}')
