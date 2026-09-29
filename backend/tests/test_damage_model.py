"""
Automated Test Suite for Physical Exposure & Empirical Depth-Damage Vulnerability Modeling.
"""

import pytest
from backend.app.domain.damage_model import ExposureAndDamageEngine


def test_ddf_evaluation():
    # Test zero depth
    ratio, bounds = ExposureAndDamageEngine.evaluate_ddf("RESIDENTIAL", 0.0)
    assert ratio == 0.0
    assert bounds == [0.0, 0.0]

    # Test 1.0m residential depth
    ratio, bounds = ExposureAndDamageEngine.evaluate_ddf("RESIDENTIAL", 1.0)
    assert ratio == 0.32
    assert bounds[0] < ratio < bounds[1]

    # Test high depth interpolation
    ratio_high, _ = ExposureAndDamageEngine.evaluate_ddf("CRITICAL_FACILITY", 3.0)
    assert ratio_high == 1.0


def test_analyze_scenario_exposure():
    settlements_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [78.48, 30.38]},
                "properties": {"id": "VILL-01", "name": "Koteshwar", "max_depth_m": 2.1, "type": "RESIDENTIAL"}
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [78.50, 30.40]},
                "properties": {"id": "SHELTER-01", "name": "Chamba High Shelter", "max_depth_m": 0.0, "type": "CRITICAL_FACILITY"}
            }
        ]
    }
    roads_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[78.48, 30.38], [78.50, 30.40]]},
                "properties": {"id": "R02", "name": "Valley Highway"}
            }
        ]
    }
    edge_hydraulics = {
        "R02": {"max_depth_m": 1.5, "flood_arrival_s": 3600.0}
    }

    res = ExposureAndDamageEngine.analyze_scenario_exposure(
        "SCENARIO_CENTRAL",
        settlements_fc,
        roads_fc,
        edge_hydraulics,
        enable_damage_curves=True
    )
    assert res["status"] == "EXPOSURE_AND_DAMAGE_EVALUATED"
    summary = res["summary"]
    assert summary["total_settlements"] == 2
    assert summary["exposed_settlements"] == 1  # Only VILL-01 (depth >= 0.3m)
    assert summary["total_road_segments"] == 1
    assert summary["exposed_road_segments"] == 1
    assert len(res["damage_estimations"]) == 2  # VILL-01 and R02
