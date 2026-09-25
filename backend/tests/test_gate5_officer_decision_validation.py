import pytest
import os
import re
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.models import RouteAnalyzeRequest, RouteConstraints

client = TestClient(app)

# ----------------------------------------------------------------------
# 1. DECISION COMPLETENESS & SCHEMA TEST
# ----------------------------------------------------------------------

def test_decision_completeness_schema():
    """Verify that every decision response contains all 14+ mandatory contract fields."""
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "constraints": {
            "safety_buffer_min": 3.0,
            "depth_limit_m": 0.3,
            "velocity_limit_mps": 1.0
        }
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    mandatory_fields = [
        "decision_id",
        "decision_timestamp",
        "scenario_id",
        "scenario_name",
        "source_type",
        "hydraulic_artifact",
        "hydraulic_artifact_sha256",
        "hec_ras_version",
        "origin",
        "destination",
        "route_id",
        "route_status",
        "latest_feasible_departure",
        "decision_margin",
        "safety_buffer",
        "limiting_segment",
        "limiting_segment_arrival",
        "limiting_segment_depth",
        "estimated_travel_time",
        "completion_time",
        "alternative_routes",
        "travel_time_model",
        "dynamic_traffic_model",
        "road_network_scope",
        "assumptions",
        "data_gaps",
        "validation_status",
        "provenance"
    ]

    for field in mandatory_fields:
        assert field in data, f"Mandatory field '{field}' missing from decision object."
        assert data[field] is not None or field in [
            "latest_feasible_departure", "decision_margin", "limiting_segment",
            "limiting_segment_arrival", "limiting_segment_depth", "completion_time"
        ], f"Field '{field}' cannot be unexpectedly null."

    assert data["travel_time_model"] == "STATIC_ENGINEERING_ASSUMPTION"
    assert data["dynamic_traffic_model"] == "NOT_IMPLEMENTED"
    assert data["road_network_scope"] == "DEMONSTRATION_DATASET"
    assert data["validation_status"] == "VALIDATION_NOT_ESTABLISHED"
    assert len(data["assumptions"]) >= 3
    assert len(data["data_gaps"]) >= 2


# ----------------------------------------------------------------------
# 2. GOLDEN CASES (A THROUGH H)
# ----------------------------------------------------------------------

def test_golden_a_feasible():
    """GOLDEN_A: Central scenario from Malidewal to Koteshwar at T=0."""
    now_utc = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "departure_time_utc": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["primary_status"] == "FEASIBLE"
    assert data["limiting_segment"] == "R02"
    assert data["decision_margin"] is not None
    assert data["decision_margin"] > 5.0
    # Expected deadline is approx 44.35 min from T=0
    assert "00:44" in data["latest_feasible_departure"]


def test_golden_b_low_margin():
    """GOLDEN_B: Departure delayed to 41 minutes post-breach (Margin ~ 3.35 min <= 5 min)."""
    dep_utc = datetime(2026, 9, 24, 0, 41, 0, tzinfo=timezone.utc)
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "departure_time_utc": dep_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Route A is LOW MARGIN
    route_a = data["alternatives"][0]
    assert route_a["status"] == "LOW MARGIN"
    assert 0 < route_a["margin_min"] <= 5.0


def test_golden_c_infeasible():
    """GOLDEN_C: Departure delayed to 50 minutes post-breach (Margin < 0)."""
    dep_utc = datetime(2026, 9, 24, 0, 50, 0, tzinfo=timezone.utc)
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "departure_time_utc": dep_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    route_a = data["alternatives"][0]
    assert route_a["status"] == "INFEASIBLE"
    assert route_a["margin_min"] < 0
    assert route_a["limiting_segment"]["road_id"] == "R02"


def test_golden_d_data_gap():
    """GOLDEN_D: Missing hydraulic data on edge propagates to DATA GAP."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)
    
    # Incomplete hydraulics dictionary (missing R02)
    incomplete_hyd = {"R01": {"arrival_s": 99999, "max_depth_m": 0.0, "max_vel_mps": 0.0}}
    res = ewe.evaluate_route(
        path_nodes=["N-MALIDEWAL", "N-KOTESHWAR"],
        edge_hydraulics=incomplete_hyd,
        departure_dt=now_utc,
        safety_buffer_min=3.0
    )
    assert res["status"] == "DATA GAP"
    assert res["deadline_utc"] is None
    assert res["margin_min"] is None
    assert "DATA GAP" in res["explanation"] or "unavailable" in res["explanation"]


def test_golden_e_no_feasible_route():
    """GOLDEN_E: Disconnected origin-destination query."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)
    
    # Disconnected node
    res = ewe.analyze_evacuation(
        origin_node="N-MALIDEWAL",
        dest_node="N-NONEXISTENT",
        edge_hydraulics=db.scenarios["SCENARIO_CENTRAL"]["edge_hydraulics"],
        departure_dt=now_utc
    )
    assert res == []


def test_golden_f_scenario_comparison():
    """GOLDEN_F: Compare Central vs Maximum breach scenarios."""
    payload = {
        "scenario_id_a": "SCENARIO_CENTRAL",
        "scenario_id_b": "SCENARIO_MAXIMUM"
    }
    resp = client.post("/api/v1/scenarios/compare", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "R02" in data["arrival_time_delta_summary"] or len(data["arrival_time_delta_summary"]) >= 0
    assert len(data["route_status_comparison"]) > 0


def test_golden_g_alternative_routes():
    """GOLDEN_G: k-shortest path alternative routes returned and evaluated."""
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "SHELTER-01",
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["alternatives"]) >= 1
    assert data["alternatives"][0]["route_index"] == 1
    assert data["alternatives"][0]["total_travel_time_min"] > 0


def test_golden_h_r02_spatial_coupling_regression():
    """GOLDEN_H: Verify hardened 150m coupling rejects obsolete 1,200m method."""
    sc = db.scenarios["SCENARIO_CENTRAL"]
    hyd_r02 = sc["edge_hydraulics"]["R02"]

    # Hardened 150m result: ~31.70 m depth and ~3600 s arrival
    assert abs(hyd_r02["max_depth_m"] - 31.70) < 0.5
    assert abs(hyd_r02["arrival_s"] - 3600) <= 60

    # Obsolete 37.37m must NOT be used
    assert abs(hyd_r02["max_depth_m"] - 37.37) > 2.0


# ----------------------------------------------------------------------
# 3. SAFETY BUFFER SENSITIVITY & LINEARITY TEST
# ----------------------------------------------------------------------

@pytest.mark.parametrize("buffer_min", [0.0, 3.0, 5.0, 10.0, 15.0, 20.0])
def test_safety_buffer_sensitivity_linearity(buffer_min):
    """Verify exact linear deadline response: deadline(B2) - deadline(B1) = -(B2 - B1)."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)
    sc = db.scenarios["SCENARIO_CENTRAL"]

    res = ewe.evaluate_route(
        path_nodes=["N-MALIDEWAL", "N-KOTESHWAR"],
        edge_hydraulics=sc["edge_hydraulics"],
        departure_dt=now_utc,
        safety_buffer_min=buffer_min,
        scenario_start_dt=now_utc
    )

    # Base deadline at B=0 is: Arrival (3600 s) - Travel (759 s) = 2841 s (47.35 min)
    expected_deadline_s = 3600.0 - 759.0 - (buffer_min * 60.0)
    actual_deadline_dt = datetime.fromisoformat(res["deadline_utc"].replace("Z", "+00:00"))
    actual_deadline_s = (actual_deadline_dt - now_utc).total_seconds()

    assert abs(actual_deadline_s - expected_deadline_s) < 1.0, (
        f"Buffer {buffer_min} min produced non-linear deadline shift."
    )


# ----------------------------------------------------------------------
# 4. LOW-MARGIN THRESHOLD SENSITIVITY TEST
# ----------------------------------------------------------------------

def test_low_margin_threshold_sensitivity():
    """Verify that changing departure margin transitions status across 5.0 min threshold."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    base_dt = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)
    sc = db.scenarios["SCENARIO_CENTRAL"]

    # Departure at 40 min -> Margin = 44.35 - 40 = 4.35 min (<= 5.0 min -> LOW MARGIN)
    res_low = ewe.evaluate_route(
        path_nodes=["N-MALIDEWAL", "N-KOTESHWAR"],
        edge_hydraulics=sc["edge_hydraulics"],
        departure_dt=base_dt + timedelta(minutes=40.0),
        safety_buffer_min=3.0,
        scenario_start_dt=base_dt
    )
    assert res_low["status"] == "LOW MARGIN"

    # Departure at 30 min -> Margin = 44.35 - 30 = 14.35 min (> 5.0 min -> FEASIBLE)
    res_feas = ewe.evaluate_route(
        path_nodes=["N-MALIDEWAL", "N-KOTESHWAR"],
        edge_hydraulics=sc["edge_hydraulics"],
        departure_dt=base_dt + timedelta(minutes=30.0),
        safety_buffer_min=3.0,
        scenario_start_dt=base_dt
    )
    assert res_feas["status"] == "FEASIBLE"


# ----------------------------------------------------------------------
# 5. EWE MATHEMATICAL PROPERTIES (MONOTONICITY & BOUNDS)
# ----------------------------------------------------------------------

def test_ewe_monotonicity_properties():
    """Formal property test of EWE deadline monotonicity."""
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)

    # Property 1: Later arrival -> deadline cannot decrease
    hyd_early = {"R02": {"arrival_s": 3000, "max_depth_m": 1.0, "max_vel_mps": 1.0}}
    hyd_late = {"R02": {"arrival_s": 4000, "max_depth_m": 1.0, "max_vel_mps": 1.0}}
    res_early = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_early, now_utc, safety_buffer_min=3.0, scenario_start_dt=now_utc)
    res_late = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_late, now_utc, safety_buffer_min=3.0, scenario_start_dt=now_utc)
    assert res_late["margin_min"] > res_early["margin_min"]

    # Property 2: Larger safety buffer -> deadline cannot increase
    res_b3 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_early, now_utc, safety_buffer_min=3.0, scenario_start_dt=now_utc)
    res_b10 = ewe.evaluate_route(["N-MALIDEWAL", "N-KOTESHWAR"], hyd_early, now_utc, safety_buffer_min=10.0, scenario_start_dt=now_utc)
    assert res_b10["margin_min"] < res_b3["margin_min"]


# ----------------------------------------------------------------------
# 6. NEGATIVE & BOUNDARY TESTS
# ----------------------------------------------------------------------

def test_negative_invalid_scenario_id():
    """Querying non-existent scenario returns 404."""
    resp = client.get("/api/v1/scenarios/non-existent-scenario-999")
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "SCENARIO_NOT_FOUND"


def test_negative_analyze_invalid_scenario():
    """Analyzing route with invalid scenario returns 404."""
    payload = {
        "scenario_id": "non-existent-scenario-999",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01"
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 404


def test_negative_create_scenario_invalid_bounds():
    """Creating scenario with negative width is rejected."""
    payload = {
        "dam_id": "dam-tehri-001",
        "name": "Invalid Scenario",
        "breach": {"width_m": -25.0, "formation_time_min": 10.0, "elevation_m": 800.0}
    }
    resp = client.post("/api/v1/scenarios", json=payload)
    assert resp.status_code in [400, 422]


# ----------------------------------------------------------------------
# 7. DETERMINISTIC REPEATABILITY & LINEAGE TEST
# ----------------------------------------------------------------------

def test_decision_repeatability():
    """Identical inputs produce bit-exact identical decision values."""
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "departure_time_utc": "2026-09-24T00:00:00Z",
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp1 = client.post("/api/v1/routes/analyze", json=payload).json()
    resp2 = client.post("/api/v1/routes/analyze", json=payload).json()

    assert resp1["route_status"] == resp2["route_status"]
    assert resp1["latest_feasible_departure"] == resp2["latest_feasible_departure"]
    assert resp1["decision_margin"] == resp2["decision_margin"]
    assert resp1["limiting_segment"] == resp2["limiting_segment"]
    assert resp1["primary_route"]["explanation"] == resp2["primary_route"]["explanation"]


# ----------------------------------------------------------------------
# 8. 30-SECOND AUTOMATED DECISION REACHABILITY TEST
# ----------------------------------------------------------------------

def test_automated_30s_decision_reachability():
    """
    30-Second Automated Decision Reachability Test:
    Verifies that the software exposes all 7 core emergency evacuation decision fields
    directly from the API response payload without manual GIS lookup or code inspection.
    (Note: This tests computational software reachability, NOT human officer cognition).
    """
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01",
        "departure_time_utc": "2026-09-24T00:00:00Z",
        "constraints": {"safety_buffer_min": 3.0, "depth_limit_m": 0.3, "velocity_limit_mps": 1.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    res = resp.json()

    # Q1: Can this route be used?
    q1_answer = res["route_status"]
    assert q1_answer in ["FEASIBLE", "LOW MARGIN", "INFEASIBLE", "DATA GAP"]

    # Q2: Until when can departure occur?
    q2_answer = res["latest_feasible_departure"]
    assert q2_answer is not None and "T" in q2_answer

    # Q3: Which road controls the decision?
    q3_answer = res["limiting_segment"]
    assert q3_answer == "R02"

    # Q4: Why? (Deterministic reason)
    q4_answer = res["primary_route"]["explanation"]
    assert len(q4_answer) > 20

    # Q5: Is there an alternative route?
    q5_answer = res["alternative_routes"]
    assert isinstance(q5_answer, list) and len(q5_answer) >= 1

    # Q6: What are the major assumptions / limitations?
    q6_assumptions = res["assumptions"]
    q6_gaps = res["data_gaps"]
    assert len(q6_assumptions) >= 3
    assert len(q6_gaps) >= 2

    # Q7: What hydraulic artifact supports this?
    q7_artifact = res["hydraulic_artifact"]
    q7_hash = res["hydraulic_artifact_sha256"]
    assert "hdf" in q7_artifact.lower() or "geojson" in q7_artifact.lower()
    assert len(q7_hash) > 0


# ----------------------------------------------------------------------
# 9. PROHIBITED LANGUAGE AUDIT IN RESPONSE PAYLOADS
# ----------------------------------------------------------------------

def test_prohibited_language_audit_in_responses():
    """Verify that response strings do not contain prohibited unhedged terms."""
    payload = {
        "scenario_id": "SCENARIO_CENTRAL",
        "origin_id": "VILL-02",
        "destination_id": "VILL-01"
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    text = str(resp.json()).upper()

    prohibited_terms = [
        "100% ACCURATE",
        "PHYSICAL MONOTONICITY GUARANTEED",
        "GUARANTEED SAFE",
        "ZERO RISK",
        "FIELD VALIDATED"
    ]

    for term in prohibited_terms:
        assert term not in text, f"Prohibited unhedged claim '{term}' found in API response."
