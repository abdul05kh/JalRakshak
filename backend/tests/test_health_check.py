from backend.app.telemetry.health_check import get_system_diagnostic_metrics

def test_health_metrics():
    metrics = get_system_diagnostic_metrics()
    assert metrics["status"] == "HEALTHY"
    assert "python_version" in metrics
    assert metrics["pid"] > 0
