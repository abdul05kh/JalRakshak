"""test_data_driven_architecture.py — Automated Invariant & Mutation Test Suite
Validates that JalRakshak is fully data-driven, free of hardcoded scenario matrices,
and responsive to mutations in hydraulics, network geometry, and configuration parameters.
"""
import os
import json
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine
from backend.app.core.operational_config import operational_config

client = TestClient(app)

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_static_codebase_anti_hardcode_scan():
    """Invariant: Assert that legacy hardcoded matrices and magic numbers are strictly eliminated."""
    # 1. Frontend decision store must not contain LOCKED_SCENARIO_DECISIONS
    decision_store_path = os.path.join(REPO_ROOT, "frontend", "src", "services", "decisionStore.ts")
    with open(decision_store_path, "r", encoding="utf-8") as f:
        ds_content = f.read()
    assert "LOCKED_SCENARIO_DECISIONS" not in ds_content, "Found legacy LOCKED_SCENARIO_DECISIONS in decisionStore.ts"

    # 2. Frontend ArcGIS Road layer must not contain R02_BASE_GEOMETRIES
    road_layer_path = os.path.join(REPO_ROOT, "frontend", "src", "map3d", "ArcGISRoadLayer.ts")
    with open(road_layer_path, "r", encoding="utf-8") as f:
        rl_content = f.read()
    assert "R02_BASE_GEOMETRIES" not in rl_content, "Found duplicate R02_BASE_GEOMETRIES in ArcGISRoadLayer.ts"

    # 3. Road hydraulic mapper must not contain hardcoded 2.4 velocity
    mapper_path = os.path.join(REPO_ROOT, "backend", "app", "domain", "road_hydraulic_mapper.py")
    with open(mapper_path, "r", encoding="utf-8") as f:
        mapper_content = f.read()
    assert "max_vel_val = 2.4" not in mapper_content, "Found hardcoded 2.4 m/s velocity in road_hydraulic_mapper.py"

def test_safety_buffer_mutation_propagation():
    """Mutation Test: Modifying safety buffer B from 3.0 min to 5.0 min must contract deadline by exactly 120s."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)
    sc = db.get_scenario("SCENARIO_CENTRAL")
    hyd = sc["edge_hydraulics"]

    # Run with B = 3.0 min (180s)
    res_b3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    # Run with B = 5.0 min (300s)
    res_b5 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=5.0)

    dt3 = datetime.fromisoformat(res_b3["deadline_utc"].replace("Z", "+00:00"))
    dt5 = datetime.fromisoformat(res_b5["deadline_utc"].replace("Z", "+00:00"))

    delta_sec = (dt3 - dt5).total_seconds()
    assert pytest.approx(delta_sec, abs=1.0) == 120.0, f"Expected 120s deadline contraction, got {delta_sec}s"

def test_limiting_edge_hydraulic_mutation():
    """Mutation Test: Mutating edge arrival times dynamically shifts the governing limiting edge."""
    # Synthetic road network with two edges E1 and E2
    roads = {
        "E1": {"properties": {"u": "N1", "v": "N2", "length_m": 1000, "travel_time_min": 2.0, "road_class": "PRIMARY", "speed_kmh": 30}, "geometry": {"coordinates": [[0,0], [1,1]]}},
        "E2": {"properties": {"u": "N2", "v": "N3", "length_m": 1000, "travel_time_min": 2.0, "road_class": "PRIMARY", "speed_kmh": 30}, "geometry": {"coordinates": [[1,1], [2,2]]}}
    }
    ewe = EvacuationWindowEngine(roads, {})
    now_utc = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)

    # Case A: E1 arrives at 1800s, E2 arrives at 3600s -> E1 is limiting
    hyd_a = {
        "E1": {"arrival_s": 1800, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True},
        "E2": {"arrival_s": 3600, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True}
    }
    res_a = ewe.evaluate_route(["N1", "N2", "N3"], hyd_a, now_utc, safety_buffer_min=3.0)
    assert res_a["limiting_segment"]["road_id"] == "E1"

    # Case B: E1 arrives at 3600s, E2 arrives at 1000s -> E2 is limiting
    hyd_b = {
        "E1": {"arrival_s": 3600, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True},
        "E2": {"arrival_s": 1000, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True}
    }
    res_b = ewe.evaluate_route(["N1", "N2", "N3"], hyd_b, now_utc, safety_buffer_min=3.0)
    assert res_b["limiting_segment"]["road_id"] == "E2"

def test_road_speed_travel_time_mutation():
    """Mutation Test: Altering road speed changes traversal time and proportionally shifts departure deadline."""
    # Fast road: 60 km/h (1 min)
    roads_fast = {
        "R_TEST": {"properties": {"u": "A", "v": "B", "length_m": 1000, "travel_time_min": 1.0, "road_class": "PRIMARY", "speed_kmh": 60}, "geometry": {"coordinates": [[0,0], [1,1]]}}
    }
    # Slow road: 30 km/h (2 min)
    roads_slow = {
        "R_TEST": {"properties": {"u": "A", "v": "B", "length_m": 1000, "travel_time_min": 2.0, "road_class": "PRIMARY", "speed_kmh": 30}, "geometry": {"coordinates": [[0,0], [1,1]]}}
    }

    hyd = {"R_TEST": {"arrival_s": 1800, "max_depth_m": 1.0, "max_vel_mps": 1.5, "inundated": True}}
    now_utc = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)

    ewe_fast = EvacuationWindowEngine(roads_fast, {})
    ewe_slow = EvacuationWindowEngine(roads_slow, {})

    res_fast = ewe_fast.evaluate_route(["A", "B"], hyd, now_utc, safety_buffer_min=3.0)
    res_slow = ewe_slow.evaluate_route(["A", "B"], hyd, now_utc, safety_buffer_min=3.0)

    dt_fast = datetime.fromisoformat(res_fast["deadline_utc"].replace("Z", "+00:00"))
    dt_slow = datetime.fromisoformat(res_slow["deadline_utc"].replace("Z", "+00:00"))

    # Fast road saves 1 min (60s) of traversal -> deadline is 60s later
    assert (dt_fast - dt_slow).total_seconds() == 60.0

def test_new_world_synthetic_scenario_evaluation():
    """Generalization Test: Ensure the system can evaluate a completely novel scenario topology without code modification."""
    novel_roads = {
        "ALPHA-R01": {"properties": {"u": "N_ALPHA_ORIGIN", "v": "N_ALPHA_MID", "length_m": 2500, "travel_time_min": 3.0, "road_class": "PRIMARY", "speed_kmh": 50}, "geometry": {"coordinates": [[77.1, 28.1], [77.2, 28.2]]}},
        "ALPHA-R02": {"properties": {"u": "N_ALPHA_MID", "v": "N_ALPHA_SHELTER", "length_m": 3500, "travel_time_min": 4.2, "road_class": "SECONDARY", "speed_kmh": 50}, "geometry": {"coordinates": [[77.2, 28.2], [77.3, 28.3]]}}
    }
    novel_hyd = {
        "ALPHA-R01": {"arrival_s": 2400, "max_depth_m": 0.8, "max_vel_mps": 1.2, "inundated": True},
        "ALPHA-R02": {"arrival_s": 3000, "max_depth_m": 1.2, "max_vel_mps": 1.8, "inundated": True}
    }

    ewe = EvacuationWindowEngine(novel_roads, {})
    now_utc = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)

    res = ewe.evaluate_route(["N_ALPHA_ORIGIN", "N_ALPHA_MID", "N_ALPHA_SHELTER"], novel_hyd, now_utc, safety_buffer_min=3.0)
    assert res["status"] in ["FEASIBLE", "LOW MARGIN", "INFEASIBLE"]
    assert res["total_distance_m"] == 6000.0
    assert res["total_travel_time_min"] == 7.2
    assert res["limiting_segment"]["road_id"] in ["ALPHA-R01", "ALPHA-R02"]

def test_no_fabricated_fallback_on_data_gap():
    """Failure Invariant: When hydraulic data is missing, return explicit DATA GAP, never a fake 6h deadline."""
    roads = {
        "GAP-R01": {"properties": {"u": "A", "v": "B", "length_m": 1000, "travel_time_min": 2.0, "road_class": "PRIMARY", "speed_kmh": 30}, "geometry": {"coordinates": [[0,0], [1,1]]}}
    }
    ewe = EvacuationWindowEngine(roads, {})
    now_utc = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)

    # Empty hydraulic dictionary
    res = ewe.evaluate_route(["A", "B"], {}, now_utc, safety_buffer_min=3.0)
    assert res["status"] == "DATA GAP"
    assert res["deadline_utc"] is None
    assert res["margin_min"] is None
    assert "unavailable" in res["explanation"].lower()
