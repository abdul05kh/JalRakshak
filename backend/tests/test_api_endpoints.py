import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_checks():
    resp_live = client.get("/health/live")
    assert resp_live.status_code == 200
    assert resp_live.json()["status"] == "LIVE"

    resp_ready = client.get("/health/ready")
    assert resp_ready.status_code == 200
    assert resp_ready.json()["status"] == "READY"

def test_list_scenarios():
    resp = client.get("/api/v1/scenarios")
    assert resp.status_code == 200
    scenarios = resp.json()
    assert len(scenarios) >= 3
    ids = [s["id"] for s in scenarios]
    assert "scen-tehri-001-baseline" in ids
    assert "scen-tehri-002-catastrophic" in ids

def test_create_scenario_valid():
    payload = {
        "dam_id": "dam-tehri-001",
        "name": "Scenario Custom 65m Breach",
        "breach": {
            "width_m": 65.0,
            "formation_time_min": 12.0,
            "elevation_m": 810.0
        },
        "duration_min": 180
    }
    resp = client.post("/api/v1/scenarios", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "CREATED"
    assert "id" in data

def test_create_scenario_invalid_breach():
    payload = {
        "dam_id": "dam-tehri-001",
        "name": "Invalid Negative Breach",
        "breach": {
            "width_m": -10.0,
            "formation_time_min": 12.0,
            "elevation_m": 0.0
        },
        "duration_min": 180
    }
    resp = client.post("/api/v1/scenarios", json=payload)
    assert resp.status_code == 422 or resp.status_code == 400

def test_point_query():
    # Query point at Koteshwar Settlement (30.2825, 78.5020)
    resp = client.get("/api/v1/scenarios/scen-tehri-001-baseline/point-query?lat=30.2825&lon=78.5020")
    assert resp.status_code == 200
    data = resp.json()
    assert data["scenario_id"] == "scen-tehri-001-baseline"
    assert data["max_depth_m"] > 0
    assert data["arrival_time_s"] is not None

def test_route_analyze_endpoint():
    payload = {
        "scenario_id": "scen-tehri-001-baseline",
        "origin_id": "VILL-02",  # Malidewal
        "destination_id": "SHELTER-01",  # Chamba
        "constraints": {
            "safety_buffer_min": 3.0,
            "depth_limit_m": 0.3,
            "velocity_limit_mps": 1.0
        }
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["primary_status"] == "FEASIBLE"
    assert len(data["alternatives"]) >= 1
    assert data["algorithm_version"] == "1.0.0"

def test_scenario_comparison_endpoint():
    payload = {
        "scenario_id_a": "scen-tehri-001-baseline",
        "scenario_id_b": "scen-tehri-002-catastrophic"
    }
    resp = client.post("/api/v1/scenarios/compare", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["breach_width_diff_m"] == 70.0
    assert len(data["route_status_comparison"]) > 0

def test_scenario_validation_endpoint():
    resp = client.get("/api/v1/scenarios/scen-tehri-001-baseline/validation")
    assert resp.status_code == 200
    data = resp.json()
    assert "analytical_benchmark" in data
    assert data["analytical_benchmark"]["metrics"]["status"] == "PASSED"
