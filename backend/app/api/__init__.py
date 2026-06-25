from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.diagnosis import router as diagnosis_router
from app.api.ai_diagnosis import router as ai_diagnosis_router
from app.api.prescriptions import router as prescriptions_router
from app.api.devices import router as devices_router
from app.api.ai_config import router as ai_config_router
from app.api.constitution import router as constitution_router
from app.api.export_api import router as export_router
from app.api.pharmacy import router as pharmacy_router
from app.api.ai_enhance import router as ai_enhance_router
from app.api.offline_api import router as offline_router
from app.api.stats_api import router as stats_router
from app.api.compatibility_api import router as compatibility_router
from app.api.tongue_analysis import router as tongue_router

from app.api.fallback_api import router as fallback_router

__all__ = [
    "auth_router", "patients_router", "diagnosis_router",
    "ai_diagnosis_router", "prescriptions_router", "devices_router",
    "ai_config_router", "constitution_router", "export_router",
    "pharmacy_router", "ai_enhance_router", "offline_router", "stats_router",
    "tongue_router", "compatibility_router", "fallback_router",
]
