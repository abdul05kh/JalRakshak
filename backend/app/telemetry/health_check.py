import os
import psutil
import time
from typing import Dict, Any

def get_system_diagnostic_metrics() -> Dict[str, Any]:
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    
    return {
        "status": "HEALTHY",
        "uptime_seconds": time.time() - process.create_time(),
        "memory_rss_mb": round(mem_info.rss / (1024 * 1024), 2),
        "cpu_percent": process.cpu_percent(interval=0.1),
        "thread_count": process.num_threads(),
        "storage_root_free_gb": round(psutil.disk_usage("/").free / (1024**3), 2)
    }
