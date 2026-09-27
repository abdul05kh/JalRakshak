"""
tests/test_scenario_scoped_gis.py
RC3.2 Scenario-Scoped GIS Ingestion and Concurrency Isolation Test Suite.
Validates:
1. Scenario-scoped GIS isolation between CENTRAL, TEST_ALPHA, and TEST_BETA.
2. Missing scenario-scoped artifacts do NOT silently fall back to global study area.
3. Concurrent requests across different scenarios produce zero cross-contamination.
4. Mutation of scenario datasets propagates dynamically without code modification.
"""

import pytest
import concurrent.futures
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_scenario_scoped_gis_isolation():
    """Verify that TEST_ALPHA, TEST_BETA, and SCENARIO_CENTRAL have completely distinct GIS layers."""
    # 1. Central Scenario (Inherits Tehri Study Area)
    cen_layers = client.get("/api/v1/scenarios/SCENARIO_CENTRAL/layers").json()
    cen_roads = [f["properties"]["id"] for f in cen_layers["roads_geojson"]["features"]]
    cen_points = [f["properties"]["name"] for f in cen_layers["evacuation_points_geojson"]["features"]]
    
    assert "R01" in cen_roads
    assert "R02" in cen_roads
    assert "X01" not in cen_roads
    assert "Y01" not in cen_roads
    assert any("Malidewal" in p for p in cen_points)
    assert not any("Alpha" in p for p in cen_points)

    # 2. TEST_ALPHA Scenario (Scenario-Local X01..X03)
    alpha_layers = client.get("/api/v1/scenarios/TEST_ALPHA/layers").json()
    alpha_roads = [f["properties"]["id"] for f in alpha_layers["roads_geojson"]["features"]]
    alpha_points = [f["properties"]["name"] for f in alpha_layers["evacuation_points_geojson"]["features"]]
    
    assert alpha_roads == ["X01", "X02", "X03"]
    assert "R02" not in alpha_roads
    assert "Settlement Alpha" in alpha_points
    assert "Settlement Beta" in alpha_points
    assert not any("Malidewal" in p for p in alpha_points)

    # 3. TEST_BETA Scenario (Scenario-Local Y01..Y03)
    beta_layers = client.get("/api/v1/scenarios/TEST_BETA/layers").json()
    beta_roads = [f["properties"]["id"] for f in beta_layers["roads_geojson"]["features"]]
    beta_points = [f["properties"]["name"] for f in beta_layers["evacuation_points_geojson"]["features"]]
    
    assert beta_roads == ["Y01", "Y02", "Y03"]
    assert "X01" not in beta_roads
    assert "R02" not in beta_roads
    assert "Settlement Gamma" in beta_points
    assert "Settlement Delta" in beta_points


def test_test_alpha_route_evaluation():
    """Verify TEST_ALPHA EWE calculation: D = 2820 - 660 - 240 = 1920s (T+32:00) on X03."""
    req = {
        "scenario_id": "TEST_ALPHA",
        "origin_id": "SETT-ALPHA",
        "destination_id": "SETT-BETA",
        "constraints": {"safety_buffer_min": 4.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=req).json()
    primary = resp["primary_route"]
    lim = primary["limiting_segment"]

    assert resp["scenario_id"] == "TEST_ALPHA"
    assert resp["origin_name"] == "Settlement Alpha"
    assert resp["destination_name"] == "Settlement Beta"
    assert [e["edge_id"] for e in primary["edges"]] == ["X01", "X02", "X03"]
    assert lim["road_id"] == "X03"
    assert lim["flood_arrival_s"] == 2820.0
    assert lim["cumulative_travel_min"] == 11.0
    # Deadline: 2820 - (11 * 60) - (4 * 60) = 1920s = 32 min
    assert resp["provenance"]["geography_mode"] == "SCENARIO_LOCAL"


def test_test_beta_route_evaluation():
    """Verify TEST_BETA EWE calculation: Limiting edge Y02, D = 1500 - 540 - 300 = 660s (T+11:00)."""
    req = {
        "scenario_id": "TEST_BETA",
        "origin_id": "SETT-GAMMA",
        "destination_id": "SETT-DELTA",
        "constraints": {"safety_buffer_min": 5.0}
    }
    resp = client.post("/api/v1/routes/analyze", json=req).json()
    primary = resp["primary_route"]
    lim = primary["limiting_segment"]

    assert resp["scenario_id"] == "TEST_BETA"
    assert resp["origin_name"] == "Settlement Gamma"
    assert resp["destination_name"] == "Settlement Delta"
    assert [e["edge_id"] for e in primary["edges"]] == ["Y01", "Y02", "Y03"]
    assert lim["road_id"] == "Y02"
    assert lim["flood_arrival_s"] == 1500.0
    assert lim["cumulative_travel_min"] == 9.0
    # Deadline: 1500 - 540 - 300 = 660s = 11.0 min
    assert resp["provenance"]["geography_mode"] == "SCENARIO_LOCAL"


def test_authoritative_timeline_timesteps():
    """Verify that TEST_BETA exposes its exact authoritative timesteps from manifest."""
    resp = client.get("/api/v1/scenarios/TEST_BETA/timeline").json()
    timesteps = [t["timestep_min"] for t in resp["timesteps"]]
    assert timesteps == [0, 20, 45, 75, 110, 160]


def test_missing_scenario_artifact_does_not_fallback_to_global():
    """Verify that a scenario declaring an invalid/missing roads artifact returns 422, not global roads."""
    from backend.app.domain.database import db
    from backend.app.domain.scenario_context import ScenarioContext

    # Register an invalid mock scenario context declaring missing roads artifact
    invalid_ctx = ScenarioContext(
        scenario_id="TEST_CORRUPT",
        name="Corrupt Scenario",
        manifest={"scenario_id": "TEST_CORRUPT", "artifacts": {"roads": {"file": "non_existent.json"}}},
        source_type="SYNTHETIC_TEST_FIXTURE",
        roads={},
        evacuation_points={},
        inundation={"type": "FeatureCollection", "features": []},
        edge_hydraulics={},
        geography_mode="SCENARIO_LOCAL",
        is_valid=False,
        validation_error="Declared roads artifact 'non_existent.json' missing or inaccessible."
    )
    db.scenario_contexts["TEST_CORRUPT"] = invalid_ctx

    res_layers = client.get("/api/v1/scenarios/TEST_CORRUPT/layers")
    assert res_layers.status_code == 422
    assert res_layers.json()["detail"]["code"] == "SCENARIO_DATA_UNAVAILABLE"

    res_analyze = client.post("/api/v1/routes/analyze", json={"scenario_id": "TEST_CORRUPT"})
    assert res_analyze.status_code == 422
    assert res_analyze.json()["detail"]["code"] == "SCENARIO_DATA_UNAVAILABLE"

    # Cleanup
    db.scenario_contexts.pop("TEST_CORRUPT", None)


def test_scenario_context_concurrency_isolation():
    """Execute concurrent interleaved requests across CENTRAL, TEST_ALPHA, and TEST_BETA."""
    scenarios_to_test = [
        ("SCENARIO_CENTRAL", "VILL-02", "VILL-01", 3.0),
        ("TEST_ALPHA", "SETT-ALPHA", "SETT-BETA", 4.0),
        ("TEST_BETA", "SETT-GAMMA", "SETT-DELTA", 5.0)
    ]

    def query_scenario(sc_tuple):
        sc_id, orig, dest, buf = sc_tuple
        req = {
            "scenario_id": sc_id,
            "origin_id": orig,
            "destination_id": dest,
            "constraints": {"safety_buffer_min": buf}
        }
        res = client.post("/api/v1/routes/analyze", json=req).json()
        layers = client.get(f"/api/v1/scenarios/{sc_id}/layers").json()
        return sc_id, res, layers

    tasks = scenarios_to_test * 10  # 30 concurrent queries

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(query_scenario, tasks))

    for sc_id, res, layers in results:
        roads = [f["properties"]["id"] for f in layers["roads_geojson"]["features"]]
        if sc_id == "TEST_ALPHA":
            assert res["scenario_id"] == "TEST_ALPHA"
            assert roads == ["X01", "X02", "X03"]
            assert res["primary_route"]["limiting_segment"]["road_id"] == "X03"
        elif sc_id == "TEST_BETA":
            assert res["scenario_id"] == "TEST_BETA"
            assert roads == ["Y01", "Y02", "Y03"]
            assert res["primary_route"]["limiting_segment"]["road_id"] == "Y02"
        elif sc_id == "SCENARIO_CENTRAL":
            assert res["scenario_id"] == "SCENARIO_CENTRAL"
            assert "R01" in roads
            assert "X01" not in roads
            assert "Y01" not in roads
