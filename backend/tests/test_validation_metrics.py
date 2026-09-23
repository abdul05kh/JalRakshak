import pytest
from backend.app.domain.validation_service import ScientificValidationService

def test_ritter_analytical_benchmark():
    res = ScientificValidationService.get_ritter_analytical_benchmark()
    assert res["metrics"]["status"] == "PASSED"
    assert res["metrics"]["relative_error_depth_percent"] < 5.0
    assert res["expected_analytical"]["water_depth_m"] > 0
    assert res["wave_front_position_m"] > 0

def test_satellite_validation_metrics():
    res = ScientificValidationService.get_satellite_validation_metrics()
    assert res["spatial_metrics"]["intersection_over_union_iou"] > 0.8
    assert res["spatial_metrics"]["precision"] > 0.85
    assert res["spatial_metrics"]["recall"] > 0.85
