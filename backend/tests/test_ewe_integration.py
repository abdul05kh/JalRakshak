from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine

def test_ewe_integration_with_hecras_scenario():
    sc = db.get_scenario("scen-tehri-001-baseline")
    assert sc is not None
    assert sc["source_type"] == "SYNTHETIC_TEST_FIXTURE"

    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 6, 0, 0, tzinfo=timezone.utc)

    # Route from Malidewal to Koteshwar (Flood-constrained valley route)
    results = ewe.analyze_evacuation(
        origin_node="N-MALIDEWAL",
        dest_node="N-KOTESHWAR",
        edge_hydraulics=sc["edge_hydraulics"],
        departure_dt=now_utc,
        safety_buffer_min=3.0,
        depth_limit_m=0.30
    )

    assert len(results) > 0
    primary = results[0]
    assert primary["status"] in ["FEASIBLE", "LOW MARGIN", "INFEASIBLE"]
    assert primary["limiting_segment"] is not None
    assert "road_id" in primary["limiting_segment"]
    assert "margin_min" in primary["limiting_segment"]
    assert primary["deadline_utc"] is not None
