import pytest
from datetime import datetime, timezone, timedelta
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine, EWE_ALGORITHM_VERSION

@pytest.fixture
def ewe():
    return EvacuationWindowEngine(db.roads, db.evacuation_points)

# 1. Departure exactly at deadline (Available margin = 0 seconds)
def test_boundary_departure_exactly_at_deadline(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # Travel for R02 is 12.65 min (759.0s). Set Arrival = 939.0s and Buffer = 180.0s (3 min)
    # D = 939.0 - 759.0 - 180.0 = 0.0s (0.0 min margin)
    hyd = {"R02": {"arrival_s": 939, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True}}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    assert res["margin_min"] == 0.0
    assert res["status"] == "LOW MARGIN"

# 2. Departure one second before deadline (Margin = +1 second)
def test_boundary_departure_one_second_before_deadline(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # D = 940.0 - 759.0 - 180.0 = +1.0s (+0.02 min)
    hyd = {"R02": {"arrival_s": 940, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True}}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    assert res["margin_min"] >= 0.0
    assert res["status"] == "LOW MARGIN"

# 3. Departure one second after deadline (Margin = -1 second)
def test_boundary_departure_one_second_after_deadline(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # D = 938.0 - 759.0 - 180.0 = -1.0s (-0.02 min)
    hyd = {"R02": {"arrival_s": 938, "max_depth_m": 1.5, "max_vel_mps": 2.0, "inundated": True}}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    assert res["margin_min"] <= 0.0
    assert res["status"] == "INFEASIBLE"

# 4. Zero safety buffer (B = 0)
def test_boundary_zero_safety_buffer(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    hyd = {"R02": {"arrival_s": 2000, "max_depth_m": 2.0, "max_vel_mps": 2.0, "inundated": True}}
    res_b3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    res_b0 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=0.0)
    # 2000 - 759 - 180 = 1061s = 17.68 min -> 17.7 min
    # 2000 - 759 - 0 = 1241s = 20.68 min -> 20.7 min
    # Delta must be exactly 3.0 min
    assert round(res_b0["margin_min"] - res_b3["margin_min"], 1) == 3.0

# 5. Larger safety buffer (B = 15 min)
def test_boundary_larger_safety_buffer(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    hyd = {"R02": {"arrival_s": 2000, "max_depth_m": 2.0, "max_vel_mps": 2.0, "inundated": True}}
    res_b3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=3.0)
    res_b15 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, safety_buffer_min=15.0)
    # Delta must be exactly 12.0 min
    assert round(res_b3["margin_min"] - res_b15["margin_min"], 1) == 12.0

# 6 & 7. Later flood arrival and earlier flood arrival monotonicity
def test_boundary_arrival_monotonicity(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    hyd_base = {"R02": {"arrival_s": 1500, "max_depth_m": 2.0, "max_vel_mps": 1.5, "inundated": True}}
    hyd_later = {"R02": {"arrival_s": 2000, "max_depth_m": 2.0, "max_vel_mps": 1.5, "inundated": True}}
    hyd_earlier = {"R02": {"arrival_s": 1000, "max_depth_m": 2.0, "max_vel_mps": 1.5, "inundated": True}}
    
    res_base = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_base, now_utc, safety_buffer_min=3.0)
    res_later = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_later, now_utc, safety_buffer_min=3.0)
    res_earlier = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_earlier, now_utc, safety_buffer_min=3.0)
    
    assert res_later["margin_min"] > res_base["margin_min"]
    assert res_earlier["margin_min"] < res_base["margin_min"]

# 8 & 9. Longer travel time and shorter travel time
def test_boundary_travel_time_monotonicity(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    sc_a = db.get_scenario("scen-tehri-001-baseline")
    
    # 1-edge route vs 2-edge route extending travel
    res_1edge = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], sc_a["edge_hydraulics"], now_utc)
    res_2edge = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR", "N-DEVPRAYAG"], sc_a["edge_hydraulics"], now_utc)
    
    assert res_2edge["total_travel_time_min"] > res_1edge["total_travel_time_min"]

# 10. One-edge route calculation
def test_boundary_one_edge_route(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    sc_a = db.get_scenario("scen-tehri-001-baseline")
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA"], sc_a["edge_hydraulics"], now_utc)
    assert len(res["edges"]) == 1
    assert res["edges"][0]["edge_id"] == "R01"
    assert res["status"] == "FEASIBLE"

# 11. Multi-edge route calculation
def test_boundary_multi_edge_route(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    sc_a = db.get_scenario("scen-tehri-001-baseline")
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA", "N-NARENDRANAGAR", "N-RANIPOKHARI"], sc_a["edge_hydraulics"], now_utc)
    assert len(res["edges"]) == 3
    assert res["edges"][0]["edge_id"] == "R01"
    assert res["edges"][1]["edge_id"] == "R05"
    assert res["edges"][2]["edge_id"] == "R15"

# 12. Multiple edges with identical minimum deadline
def test_boundary_identical_minimum_deadlines(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # Travel for R01 is 9.18 min (550.8s). Travel for R05 is 27.12 min (1627.2s).
    # Cumulative travel for R05 is 550.8 + 1627.2 = 2178.0s.
    # Set arrival R01 = 1000.8s -> D1 = 1000.8 - 550.8 - 180 = 270.0s
    # Set arrival R05 = 2628.0s -> D2 = 2628.0 - 2178.0 - 180 = 270.0s
    hyd = {
        "R01": {"arrival_s": 1000.8, "max_depth_m": 1.0, "max_vel_mps": 1.0, "inundated": True},
        "R05": {"arrival_s": 2628.0, "max_depth_m": 1.0, "max_vel_mps": 1.0, "inundated": True}
    }
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA", "N-NARENDRANAGAR"], hyd, now_utc)
    assert res["limiting_segment"]["road_id"] == "R01"  # First encountered limiting segment

# 13 & 14. Missing arrival-time value & data gap
def test_boundary_missing_arrival_data_gap(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # Empty hydraulics dictionary (complete data gap)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], {}, now_utc)
    assert res["status"] == "DATA GAP"
    assert res["deadline_utc"] is None
    assert res["margin_min"] is None

# 15. Depth threshold exceeded
def test_boundary_depth_threshold_exceeded(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # Water arrives before vehicle clears (arrival 200s, cumul travel 759s), depth 1.5m >= 0.3m limit
    hyd = {"R02": {"arrival_s": 200, "max_depth_m": 1.5, "max_vel_mps": 0.5, "inundated": True}}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, depth_limit_m=0.3)
    assert res["status"] == "INFEASIBLE"
    assert res["edges"][0]["edge_feasible"] is False

# 16. Velocity threshold exceeded
def test_boundary_velocity_threshold_exceeded(ewe):
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    # Water arrives before vehicle clears, velocity 2.5 m/s >= 1.0 m/s limit
    hyd = {"R02": {"arrival_s": 200, "max_depth_m": 0.2, "max_vel_mps": 2.5, "inundated": True}}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, now_utc, velocity_limit_mps=1.0)
    assert res["status"] == "INFEASIBLE"
    assert res["edges"][0]["edge_feasible"] is False

# 17. No route between disconnected nodes
def test_boundary_no_route(ewe):
    ewe.graph.add_node("N-ISLAND")
    res = ewe.analyze_evacuation("N-MALIDEWAL", "N-ISLAND", {}, datetime.now(timezone.utc))
    assert res == []
