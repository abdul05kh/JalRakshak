import time
from backend.app.telemetry.heartbeat_service import TelemetryHeartbeatMonitor

def test_heartbeat_monitor():
    mon = TelemetryHeartbeatMonitor(timeout_seconds=0.1)
    mon.record_pulse("GAUGE-01")
    time.sleep(0.15)
    assert "GAUGE-01" in mon.get_stale_stations()
