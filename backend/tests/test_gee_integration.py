"""
Automated Test Suite for Google Earth Engine (GEE) Remote Sensing Integration.
"""

import pytest
from backend.app.integrations.gee.auth import GEEAuthProvider
from backend.app.integrations.gee.query import GEEQueryBuilder
from backend.app.integrations.gee.comparison import FloodExtentComparator


def test_gee_auth_provider_status():
    provider = GEEAuthProvider()
    status = provider.get_status()
    assert status["provider"] == "Google Earth Engine"
    assert status["status"] in ["CONFIGURED", "NOT_CONFIGURED"]
    assert "scientific_disclaimer" in status


def test_gee_query_builder():
    provider = GEEAuthProvider()
    builder = GEEQueryBuilder(provider)
    query = builder.build_sentinel1_flood_query(
        bbox=[78.40, 30.30, 78.60, 30.45],
        event_date="2026-09-28",
        pre_event_days=10,
        post_event_days=3
    )
    assert query["dataset"] == "COPERNICUS/S1_GRD"
    assert query["polarization"] == "VH"
    assert query["pre_event_window"] == ["2026-09-18", "2026-09-28"]
    assert query["post_event_window"] == ["2026-09-28", "2026-10-01"]


def test_flood_extent_comparator_metrics():
    # Square 1: Simulated [0, 0] to [1, 1]
    sim_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
                },
                "properties": {"id": "SIM_1"}
            }
        ]
    }
    # Square 2: Observed [0.5, 0] to [1.5, 1] (half overlap)
    obs_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[0.5, 0], [1.5, 0], [1.5, 1], [0.5, 1], [0.5, 0]]]
                },
                "properties": {"id": "OBS_1"}
            }
        ]
    }

    res = FloodExtentComparator.compare_geojson_extents(sim_fc, obs_fc, "SCENARIO_TEST")
    assert res["status"] == "COMPARISON_AVAILABLE"
    metrics = res["metrics"]
    assert metrics is not None
    # Inter area = 0.5, Union area = 1.5 => IoU = 0.5 / 1.5 = 0.3333
    assert abs(metrics["intersection_over_union_iou"] - 0.3333) < 0.01
    assert abs(metrics["precision"] - 0.5) < 0.01
    assert abs(metrics["recall"] - 0.5) < 0.01
    assert abs(metrics["f1_score"] - 0.5) < 0.01
