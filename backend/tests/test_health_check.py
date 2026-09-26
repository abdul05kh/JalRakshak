from backend.app.telemetry.health_check import get_system_diagnostic_metrics

def test_health_metrics():
    metrics = get_system_diagnostic_metrics()
    assert metrics["status"] == "HEALTHY"
    assert metrics["memory_rss_mb"] > 0
    assert metrics["thread_count"] >= 1
