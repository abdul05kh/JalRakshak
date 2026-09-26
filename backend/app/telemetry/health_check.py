import os
import sys
import time
from typing import Dict, Any

def get_system_diagnostic_metrics() -> Dict[str, Any]:
    return {
        "status": "HEALTHY",
        "timestamp_utc": time.time(),
        "python_version": sys.version.split()[0],
        "pid": os.getpid(),
        "backend_module": "JalRakshak EWE Core"
    }
