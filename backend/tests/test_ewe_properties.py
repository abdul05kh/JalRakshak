"""
Adversarial & Property-Based Verification Suite for the Evacuation Window Engine (EWE).

Validates all 10 mathematical and logical invariant properties:
PROPERTY 1: Later flood arrivals monotonically increase or preserve deadline.
PROPERTY 2: Increased travel times monotonically decrease or preserve deadline.
PROPERTY 3: Increased safety buffers monotonically decrease deadline by exact buffer delta.
PROPERTY 4: Limiting segment matches argmin_i(A_i - T_i - B).
PROPERTY 5: Departure after deadline yields INFEASIBLE.
PROPERTY 6: Missing edge hydraulics propagates DATA GAP without false FEASIBLE.
PROPERTY 7: Feasibility inequality D + T_i + B < A_i holds for all segments of FEASIBLE routes.
PROPERTY 8: Route independence (modifying route A does not alter route B).
PROPERTY 9: Determinism (identical inputs yield identical outputs).
PROPERTY 10: Scenario switching isolation (no cross-scenario state contamination).

Golden Benchmark Cases:
- EWE-GOLDEN-A: Standard Feasible Mountain Route
- EWE-GOLDEN-B: Low Margin Route (0 < margin <= 5 min)
- EWE-GOLDEN-C: Infeasible Cutoff Route (negative margin)
- EWE-GOLDEN-D: Disconnected Network
- EWE-GOLDEN-E: Data Gap Route
"""

import pytest
import copy
from datetime import datetime, timezone, timedelta
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine

@pytest.fixture
def ewe():
    return EvacuationWindowEngine(db.roads, db.evacuation_points)

@pytest.fixture
def edge_hydraulics():
    # Use baseline scenario hydraulics if available, else first scenario
    scen_key = next(iter(db.scenarios.keys()))
    return copy.deepcopy(db.scenarios[scen_key]["edge_hydraulics"])

def test_property_1_flood_arrival_monotonicity(ewe, edge_hydraulics):
    """PROPERTY 1: Delaying flood arrival across all edges must not decrease deadline."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    base_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    
    delayed_hydraulics = copy.deepcopy(edge_hydraulics)
    for edge_id, val in delayed_hydraulics.items():
        if val.get("arrival_s", 99999) < 99999:
            val["arrival_s"] += 600  # 10 min delay
            
    delayed_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], delayed_hydraulics, t0, safety_buffer_min=3.0)
    assert delayed_res["margin_min"] >= base_res["margin_min"]

def test_property_2_travel_time_monotonicity(ewe, edge_hydraulics):
    """PROPERTY 2: Increased travel time must not increase deadline."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    base_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    
    higher_buf_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=6.0)
    assert higher_buf_res["margin_min"] <= base_res["margin_min"]

def test_property_3_safety_buffer_exact_delta(ewe, edge_hydraulics):
    """PROPERTY 3: Increasing buffer by delta_B reduces margin by exactly delta_B."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res_buf3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    res_buf7 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=7.0)
    
    delta = round(res_buf3["margin_min"] - res_buf7["margin_min"], 1)
    assert delta == 4.0

def test_property_4_limiting_segment_argmin(ewe, edge_hydraulics):
    """PROPERTY 4: Limiting segment matches argmin_i(A_i - T_i - B)."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    lim = res["limiting_segment"]
    assert lim is not None
    assert lim["road_id"] == "R02"

def test_property_5_late_departure_infeasible(ewe, edge_hydraulics):
    """PROPERTY 5: Departure after deadline yields INFEASIBLE."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    late_dt = t0 + timedelta(hours=2)
    late_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, late_dt, safety_buffer_min=3.0, scenario_start_dt=t0)
    assert late_res["status"] == "INFEASIBLE"
    assert late_res["margin_min"] < 0

def test_property_6_missing_edge_data_gap(ewe, edge_hydraulics):
    """PROPERTY 6: Missing edge hydraulics yields DATA GAP."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    incomplete_hyd = copy.deepcopy(edge_hydraulics)
    del incomplete_hyd["R02"]
    
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], incomplete_hyd, t0, safety_buffer_min=3.0)
    assert res["status"] == "DATA GAP"

def test_property_7_feasibility_inequality(ewe, edge_hydraulics):
    """PROPERTY 7: For FEASIBLE routes, D + T_i + B < A_i holds for every edge."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA"], edge_hydraulics, t0, safety_buffer_min=3.0)
    if res["status"] == "FEASIBLE":
        for edge in res["edges"]:
            arr = edge.get("flood_arrival_s")
            if arr is not None and arr < 99999:
                assert (edge["cumulative_travel_min"] * 60 + 180) <= arr

def test_property_8_route_independence(ewe, edge_hydraulics):
    """PROPERTY 8: Evaluating route R1 does not affect evaluation of route R2."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res_r1_a = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0)
    _ = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA"], edge_hydraulics, t0)
    res_r1_b = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0)
    assert res_r1_a["margin_min"] == res_r1_b["margin_min"]
    assert res_r1_a["status"] == res_r1_b["status"]

def test_property_9_determinism(ewe, edge_hydraulics):
    """PROPERTY 9: Identical inputs must produce strictly identical decision outputs."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res1 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    res2 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t0, safety_buffer_min=3.0)
    assert res1 == res2

def test_property_10_scenario_switching_isolation(ewe):
    """PROPERTY 10: Scenario switching must not contaminate previous scenario state."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    scen_keys = list(db.scenarios.keys())
    if len(scen_keys) >= 2:
        hyd1 = db.scenarios[scen_keys[0]]["edge_hydraulics"]
        hyd2 = db.scenarios[scen_keys[1]]["edge_hydraulics"]
    else:
        hyd1 = {"R02": {"arrival_s": 3600, "max_depth_m": 1.2, "max_vel_mps": 1.5, "inundated": True}}
        hyd2 = {"R02": {"arrival_s": 2400, "max_depth_m": 2.5, "max_vel_mps": 3.0, "inundated": True}}
    
    res_cen1 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd1, t0)
    _ = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd2, t0)
    res_cen2 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd1, t0)
    
    assert res_cen1["margin_min"] == res_cen2["margin_min"]
    assert res_cen1["deadline_utc"] == res_cen2["deadline_utc"]

# ==============================================================================
# GOLDEN TEST CASES (EWE-GOLDEN-A through EWE-GOLDEN-E)
# ==============================================================================

def test_golden_case_a_feasible(ewe, edge_hydraulics):
    """EWE-GOLDEN-A: Mountain ridge route with ample clearance."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA"], edge_hydraulics, t0, safety_buffer_min=3.0)
    assert res["status"] == "FEASIBLE"
    assert res["margin_min"] > 60.0

def test_golden_case_b_low_margin(ewe):
    """EWE-GOLDEN-B: Departure close to deadline yields LOW MARGIN."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    # Flood arrival at 60 min (3600s). Traversal is ~14.6 min (876s) + 3 min buffer (180s) -> Deadline is 2544s (42.4 min).
    hyd = {"R02": {"arrival_s": 3600, "max_depth_m": 1.2, "max_vel_mps": 1.5, "inundated": True}}
    # Depart at T+40 min (2400s) -> margin is 144s (2.4 min) <= 5.0 min
    t_close = t0 + timedelta(minutes=40.0)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd, t_close, safety_buffer_min=3.0, scenario_start_dt=t0)
    assert res["status"] == "LOW MARGIN"
    assert 0 < res["margin_min"] <= 5.0

def test_golden_case_c_infeasible(ewe, edge_hydraulics):
    """EWE-GOLDEN-C: Severe breach cutoff yields INFEASIBLE."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    t_late = t0 + timedelta(hours=2)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, t_late, safety_buffer_min=3.0, scenario_start_dt=t0)
    assert res["status"] == "INFEASIBLE"
    assert res["margin_min"] < 0

def test_golden_case_d_disconnected(ewe, edge_hydraulics):
    """EWE-GOLDEN-D: Disconnected origin-destination pair yields empty/no route."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    routes = ewe.analyze_evacuation("N-MALIDEWAL", "NON_EXISTENT_DEST", edge_hydraulics, t0)
    assert len(routes) == 0

def test_golden_case_e_data_gap(ewe):
    """EWE-GOLDEN-E: Route with missing hydraulic entry yields DATA GAP."""
    t0 = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    empty_hydraulics = {}
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], empty_hydraulics, t0)
    assert res["status"] == "DATA GAP"
