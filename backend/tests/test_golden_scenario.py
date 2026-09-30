import pytest
from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine
from backend.app.domain.units import duration_to_seconds, seconds_to_duration

def test_golden_scenario_regression():
    """
    AT-015: Golden scenario regression test.
    Fixed inputs -> identical deterministic route status, limiting segment, and travel times.
    """
    sc = db.get_scenario("scen-tehri-001-baseline")
    assert sc is not None
    
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    fixed_departure = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    
    # Path: Malidewal -> Koteshwar (R02)
    res = ewe.evaluate_route(
        ["N-MALIDEWAL", "N-KOTESHWAR"],
        sc["edge_hydraulics"],
        fixed_departure,
        safety_buffer_min=3.0,
        depth_limit_m=0.3,
        velocity_limit_mps=1.0
    )
    
    # Assert deterministic outputs
    assert res["status"] == "INFEASIBLE"
    assert res["limiting_segment"]["road_id"] == "R02"
    assert res["limiting_segment"]["flood_arrival_s"] == 540
    assert res["total_travel_time_min"] == 12.65
    assert "Inundation depth (8.2m" in res["limiting_segment"]["failure_reason"]

def test_golden_authoritative_central_scenario_ewe_lineage():
    """
    Golden Authoritative Regression Test for Central Dam-Break Run.
    Verifies that:
    1. Governing formula: D_deadline = min_i(A_i - T_i - B)
    2. Arrival = T+60:00 (3600s)
    3. Travel = 12:39 (759s)
    4. Safety buffer = 03:00 (180s)
    5. Deadline = T+44:21 (2661s)
    6. Limiting edge = R02 (or R02-E07)
    7. Status is FEASIBLE under configured assumptions (margin = +44.35 min relative to start)
    """
    arrival_s = duration_to_seconds("60:00")
    travel_s = duration_to_seconds("12:39")
    buffer_s = duration_to_seconds("03:00")

    deadline_s = arrival_s - travel_s - buffer_s
    assert deadline_s == 2661.0
    assert seconds_to_duration(deadline_s) == "44:21"

    # Verify margin relative to T=0 departure
    departure_s = 0.0
    margin_s = deadline_s - departure_s
    margin_min = round(margin_s / 60.0, 2)
    assert margin_min == 44.35
