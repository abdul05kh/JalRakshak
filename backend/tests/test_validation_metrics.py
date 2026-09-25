import pytest
from backend.app.domain.validation_service import ScientificValidationService

def test_ritter_analytical_benchmark():
    res = ScientificValidationService.get_ritter_analytical_benchmark()
    assert res["metrics"]["status"] == "SOFTWARE-VERIFIED"
    assert res["metrics"]["relative_error_depth_percent"] < 5.0
    assert res["expected_analytical"]["water_depth_m"] > 0
    assert res["wave_front_position_m"] > 0

def test_satellite_validation_metrics():
    res = ScientificValidationService.get_satellite_validation_metrics()
    assert res["status"] == "NOT RUN"
    assert "not bundled" in res["reason"].lower()

