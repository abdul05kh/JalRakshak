import pytest
from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine

@pytest.fixture
def ewe():
    return EvacuationWindowEngine(db.roads, db.evacuation_points)

@pytest.fixture
def edge_hydraulics():
    return db.scenarios["scen-tehri-001-baseline"]["edge_hydraulics"]

def test_property_arrival_time_monotonicity(ewe, edge_hydraulics):
    """
    Property 1: If flood arrival time is increased everywhere by Delta,
    the route deadline MUST NOT decrease.
    """
    departure_dt = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    base_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR", "N-DEVPRAYAG"], edge_hydraulics, departure_dt, safety_buffer_min=3.0)
    
    # Increase arrival time by 600s (10 min) on all edges
    delayed_hydraulics = {}
    for edge_id, val in edge_hydraulics.items():
        delayed_hydraulics[edge_id] = {
            **val,
            "arrival_s": val["arrival_s"] + 600 if val["arrival_s"] < 99999 else 99999
        }
    
    delayed_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR", "N-DEVPRAYAG"], delayed_hydraulics, departure_dt, safety_buffer_min=3.0)
    
    # Margin in delayed scenario must be >= base margin
    assert delayed_res["margin_min"] >= base_res["margin_min"], "Monotonicity violated: Later flood arrival reduced deadline!"

def test_property_travel_time_monotonicity(ewe, edge_hydraulics):
    """
    Property 2: If travel time on the limiting segment increases,
    the route deadline MUST NOT increase.
    """
    departure_dt = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    base_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, departure_dt, safety_buffer_min=3.0)
    
    # Increase safety buffer (equivalent to increasing required travel allowance)
    higher_buffer_res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, departure_dt, safety_buffer_min=8.0)
    
    assert higher_buffer_res["margin_min"] <= base_res["margin_min"], "Monotonicity violated: Higher buffer/travel time increased deadline!"

def test_property_safety_buffer_monotonicity(ewe, edge_hydraulics):
    """
    Property 3: If safety buffer is increased by B_delta,
    the calculated margin must decrease by exactly B_delta.
    """
    departure_dt = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res_buf3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, departure_dt, safety_buffer_min=3.0)
    res_buf5 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], edge_hydraulics, departure_dt, safety_buffer_min=5.0)
    
    delta_margin = round(res_buf3["margin_min"] - res_buf5["margin_min"], 1)
    assert delta_margin == 2.0, f"Expected 2.0 min margin reduction for 2 min buffer increase, got {delta_margin}"

def test_depth_threshold_failure(ewe):
    """
    Verify that an edge exceeding the depth threshold before vehicle clears produces INFEASIBLE.
    """
    departure_dt = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    test_hydraulics = {
        "R02": {"arrival_s": 300, "max_depth_m": 2.5, "max_vel_mps": 1.5, "inundated": True}
    }
    # Travel time on R02 is ~14.6 min (876s) > arrival 300s (5 min)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], test_hydraulics, departure_dt, depth_limit_m=0.3)
    assert res["status"] == "INFEASIBLE"
    assert res["limiting_segment"]["road_id"] == "R02"

def test_unaffected_high_altitude_route(ewe, edge_hydraulics):
    """
    Verify that mountain ridge routes unaffected by flood are FEASIBLE.
    """
    departure_dt = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res = ewe.evaluate_route(["N-MALIDEWAL", "N-CHAMBA"], edge_hydraulics, departure_dt)
    assert res["status"] == "FEASIBLE"
    assert res["margin_min"] > 60.0
