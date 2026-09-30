import pytest
import os
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.domain.provenance_service import provenance_service
from backend.app.domain.models import ValidationStatus

client = TestClient(app)

def test_provenance_service_and_endpoint():
    # 1. Analyze route via API
    payload = {
        "scenario_id": "scen-tehri-001-baseline",
        "origin_id": "EVAC-01",
        "destination_id": "EVAC-02",
        "departure_time_utc": "2026-09-20T10:00:00Z",
        "constraints": {
            "safety_buffer_min": 3.0,
            "depth_limit_m": 0.3,
            "velocity_limit_mps": 1.0
        }
    }
    resp = client.post("/api/v1/routes/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    decision_id = data["decision_id"]
    assert decision_id is not None

    # 2. Query provenance endpoint
    prov_resp = client.get(f"/api/v1/decisions/{decision_id}/provenance")
    assert prov_resp.status_code == 200
    prov_data = prov_resp.json()
    assert prov_data["decision_id"] == decision_id
    assert prov_data["scenario_id"] == "scen-tehri-001-baseline"
    assert prov_data["travel_speed_status"] == "CONFIGURED_ASSUMPTION"
    assert prov_data["safety_buffer_status"] == "CONFIGURED_ASSUMPTION"
    assert prov_data["travel_speed_kmh"] == 50.0

def test_scenario_import_failure_modes():
    # Missing file
    res = client.post("/api/v1/scenarios/import", json={
        "artifact_path": "non_existent_file.p01.hdf"
    })
    assert res.status_code == 422
    err = res.json()["detail"]
    assert err["status"] == "DATA_GAP"
    assert err["error_code"] == "ARTIFACT_INVALID"

    # Non-HDF5 extension
    res2 = client.post("/api/v1/scenarios/import", json={
        "artifact_path": "malicious.exe"
    })
    assert res2.status_code == 422
    assert res2.json()["detail"]["status"] == "DATA_GAP"

def test_scenario_import_genuine_gate3b_artifact():
    artifact_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras", "tehri_gate3b", "tehri_15km_scenario_central.p01.hdf")
    )
    if os.path.exists(artifact_path):
        res = client.post("/api/v1/scenarios/import", json={
            "artifact_path": artifact_path,
            "scenario_id": "scen-imported-central-test",
            "scenario_name": "Imported Tehri Central Test Run",
            "dam_id": "dam-tehri-001",
            "arrival_threshold_m": 0.30
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "READY"
        assert data["scenario_id"] == "scen-imported-central-test"
        assert len(data["sha256_checksum"]) == 64
        assert data["cell_count"] > 0
        assert data["inundated_cells_count"] > 0
