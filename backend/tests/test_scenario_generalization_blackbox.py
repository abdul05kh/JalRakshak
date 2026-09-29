"""
Black-Box Generalization Acceptance Tests for Scenario Independence.

Proves that the decision engine operates strictly from scenario-scoped data
without hardcoded Tehri, R02, or Malidewal assumptions.
"""

import pytest
from datetime import datetime, timezone
from backend.app.domain.ewe_engine import EvacuationWindowEngine


def test_blackbox_scenario_alpha_isolation():
    """
    TEST_ALPHA:
    Roads: X01, X02, X03
    Settlements: Alpha, Beta
    Limiting edge: X03
    """
    roads_alpha = {
        "X01": {
            "type": "Feature",
            "properties": {"id": "X01", "name": "Alpha North Corridor", "u": "Alpha", "v": "Junction_1", "length_m": 2000.0, "speed_kmh": 50.0, "road_class": "Primary"},
            "geometry": {"type": "LineString", "coordinates": [[77.10, 28.50], [77.12, 28.51]]}
        },
        "X02": {
            "type": "Feature",
            "properties": {"id": "X02", "name": "Alpha Midland Link", "u": "Junction_1", "v": "Junction_2", "length_m": 3000.0, "speed_kmh": 50.0, "road_class": "Primary"},
            "geometry": {"type": "LineString", "coordinates": [[77.12, 28.51], [77.15, 28.52]]}
        },
        "X03": {
            "type": "Feature",
            "properties": {"id": "X03", "name": "Alpha Lowland Bottleneck", "u": "Junction_2", "v": "Beta", "length_m": 4000.0, "speed_kmh": 50.0, "road_class": "Primary"},
            "geometry": {"type": "LineString", "coordinates": [[77.15, 28.52], [77.18, 28.53]]}
        }
    }
    settlements_alpha = {
        "SETTLE_ALPHA": {"type": "Feature", "properties": {"id": "SETTLE_ALPHA", "name": "Alpha Settlement", "type": "ORIGIN"}, "geometry": {"type": "Point", "coordinates": [77.10, 28.50]}},
        "SHELTER_BETA": {"type": "Feature", "properties": {"id": "SHELTER_BETA", "name": "Beta Shelter", "type": "SHELTER"}, "geometry": {"type": "Point", "coordinates": [77.18, 28.53]}}
    }
    hydraulics_alpha = {
        "X01": {"flood_arrival_s": 5400.0, "max_depth_m": 0.5, "max_velocity_mps": 1.2},
        "X02": {"flood_arrival_s": 4500.0, "max_depth_m": 1.1, "max_velocity_mps": 2.0},
        "X03": {"flood_arrival_s": 2820.0, "max_depth_m": 2.8, "max_velocity_mps": 3.5}  # 47 min = 2820 s
    }

    t0 = datetime(2026, 9, 30, 0, 0, tzinfo=timezone.utc)
    engine = EvacuationWindowEngine(roads_alpha, settlements_alpha)
    routes = engine.analyze_evacuation(
        "Alpha", "Beta",
        hydraulics_alpha,
        departure_dt=t0,
        safety_buffer_min=4.0,
        scenario_start_dt=t0
    )

    assert len(routes) == 1
    primary = routes[0]
    lim = primary["limiting_segment"]
    assert lim is not None
    assert lim["road_id"] == "X03"
    assert primary["status"] in ["FEASIBLE", "LOW MARGIN"]
    assert "R02" not in str(primary)
    assert "Tehri" not in str(primary)


def test_blackbox_scenario_beta_isolation():
    """
    TEST_BETA:
    Roads: Y01, Y02, Y03
    Settlements: Gamma, Delta
    Limiting edge: Y02
    """
    roads_beta = {
        "Y01": {
            "type": "Feature",
            "properties": {"id": "Y01", "name": "Gamma Ridge Road", "u": "Gamma", "v": "Pass_1", "length_m": 1500.0, "speed_kmh": 40.0, "road_class": "Secondary"},
            "geometry": {"type": "LineString", "coordinates": [[76.00, 31.00], [76.02, 31.01]]}
        },
        "Y02": {
            "type": "Feature",
            "properties": {"id": "Y02", "name": "Gamma River Causeway", "u": "Pass_1", "v": "Pass_2", "length_m": 2000.0, "speed_kmh": 40.0, "road_class": "Secondary"},
            "geometry": {"type": "LineString", "coordinates": [[76.02, 31.01], [76.04, 31.02]]}
        },
        "Y03": {
            "type": "Feature",
            "properties": {"id": "Y03", "name": "Delta Ascent", "u": "Pass_2", "v": "Delta", "length_m": 2500.0, "speed_kmh": 40.0, "road_class": "Secondary"},
            "geometry": {"type": "LineString", "coordinates": [[76.04, 31.02], [76.06, 31.03]]}
        }
    }
    settlements_beta = {
        "SETTLE_GAMMA": {"type": "Feature", "properties": {"id": "SETTLE_GAMMA", "name": "Gamma Village", "type": "ORIGIN"}, "geometry": {"type": "Point", "coordinates": [76.00, 31.00]}},
        "SHELTER_DELTA": {"type": "Feature", "properties": {"id": "SHELTER_DELTA", "name": "Delta High Ground", "type": "SHELTER"}, "geometry": {"type": "Point", "coordinates": [76.06, 31.03]}}
    }
    hydraulics_beta = {
        "Y01": {"flood_arrival_s": 3600.0, "max_depth_m": 0.2, "max_velocity_mps": 0.8},
        "Y02": {"flood_arrival_s": 1500.0, "max_depth_m": 2.5, "max_velocity_mps": 3.0},  # 25 min = 1500 s
        "Y03": {"flood_arrival_s": 4200.0, "max_depth_m": 0.1, "max_velocity_mps": 0.5}
    }

    t0 = datetime(2026, 9, 30, 0, 0, tzinfo=timezone.utc)
    engine = EvacuationWindowEngine(roads_beta, settlements_beta)
    routes = engine.analyze_evacuation(
        "Gamma", "Delta",
        hydraulics_beta,
        departure_dt=t0,
        safety_buffer_min=5.0,
        scenario_start_dt=t0
    )

    assert len(routes) == 1
    primary = routes[0]
    lim = primary["limiting_segment"]
    assert lim is not None
    assert lim["road_id"] == "Y02"
    assert primary["status"] in ["FEASIBLE", "LOW MARGIN"]
    assert "X0" not in str(primary)
    assert "R02" not in str(primary)
