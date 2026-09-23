import pytest
from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine

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
