import time
from typing import Dict

class TelemetryHeartbeatMonitor:
    def __init__(self, timeout_seconds: float = 60.0):
        self._last_heartbeat: Dict[str, float] = {}
        self._timeout = timeout_seconds

    def record_pulse(self, station_id: str):
        self._last_heartbeat[station_id] = time.time()

    def get_stale_stations(self) -> list:
        now = time.time()
        stale = []
        for station_id, last_time in self._last_heartbeat.items():
            if now - last_time > self._timeout:
                stale.append(station_id)
        return stale
