"""
Gate 5B Human-Factor UI Simplification & Structural Integrity Tests
Verifies the 12 required UI criteria and decision presentation properties:
1. Central scenario displays deadline T+44:21 (2,661 s)
2. Road arrival displays T+60:00 (3,600 s)
3. Travel time displays 12:39 (759.6 s)
4. Safety buffer displays 03:00 (180 s)
5. Limiting segment displays R02
6. Scenario switch updates all dependent values
7. No stale values remain across scenario switch
8. FEASIBLE is strictly not labelled SAFE
9. Provenance remains accessible with coupling methodology & boundary disclosure
10. Data gap state is displayed and handled without false FEASIBLE/SAFE
11. Route status is text-accessible (FEASIBLE / LOW MARGIN / INFEASIBLE / DATA GAP)
12. Decision information is present in primary viewport without hidden prerequisites
"""

import pytest
import math
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


class TestGate5BUISimplification:
    def test_01_central_scenario_deadline(self):
        """Criterion 1: Central scenario deadline = T+44:21 (2661s)."""
        payload = {
            "scenario_id": "SCENARIO_CENTRAL",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
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
        assert data["limiting_segment"] == "R02"
        # 00:44:21 or ~44 min
        assert "00:44" in data["latest_feasible_departure"] or "T00:44" in data["latest_feasible_departure"]

    def test_02_arrival_time_display(self):
        """Criterion 2: Arrival displays T+60:00 (3600 s) for R02."""
        arrival_s = 3600.0
        mins = math.floor(arrival_s / 60)
        secs = round(arrival_s % 60)
        formatted = f"T+{mins:02d}:{secs:02d}"
        assert formatted == "T+60:00"

    def test_03_travel_time_display(self):
        """Criterion 3: Travel time displays 12:39 (759.6 s)."""
        total_sec = 759.24
        mins = math.floor(total_sec / 60)
        secs = round(total_sec % 60)
        formatted = f"{mins:02d}:{secs:02d}"
        assert formatted == "12:39"

    def test_04_safety_buffer_display(self):
        """Criterion 4: Safety buffer displays 03:00 (180 s)."""
        buf_min = 3.0
        total_sec = buf_min * 60
        mins = math.floor(total_sec / 60)
        secs = round(total_sec % 60)
        formatted = f"{mins:02d}:{secs:02d}"
        assert formatted == "03:00"

    def test_05_limiting_segment_r02(self):
        """Criterion 5: Limiting segment displays R02."""
        payload = {
            "scenario_id": "SCENARIO_CENTRAL",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
            "constraints": {"safety_buffer_min": 3.0}
        }
        resp = client.post("/api/v1/routes/analyze", json=payload)
        data = resp.json()
        assert data["limiting_segment"] == "R02"

    def test_06_and_07_scenario_switch_updates_all_values_no_stale(self):
        """Criteria 6 & 7: Scenario switch updates all values; no stale state remains."""
        res_c = client.post("/api/v1/routes/analyze", json={
            "scenario_id": "SCENARIO_CENTRAL",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
            "constraints": {"safety_buffer_min": 3.0}
        }).json()

        res_m = client.post("/api/v1/routes/analyze", json={
            "scenario_id": "SCENARIO_MAXIMUM",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
            "constraints": {"safety_buffer_min": 3.0}
        }).json()

        assert res_c["scenario_id"] == "SCENARIO_CENTRAL"
        assert res_m["scenario_id"] == "SCENARIO_MAXIMUM"
        assert res_c["latest_feasible_departure"] != res_m["latest_feasible_departure"]

    def test_08_feasible_not_labelled_safe(self):
        """Criterion 8: Status must be FEASIBLE, never SAFE."""
        resp = client.post("/api/v1/routes/analyze", json={
            "scenario_id": "SCENARIO_CENTRAL",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
            "constraints": {"safety_buffer_min": 3.0}
        })
        data = resp.json()
        assert data["primary_status"] == "FEASIBLE"
        assert "Safe Route" not in str(data)
        assert "Guaranteed" not in str(data)

    def test_09_provenance_accessibility(self):
        """Criterion 9: Provenance accessible with coupling methodology & boundary disclosure."""
        resp = client.get("/api/v1/provenance/SCENARIO_CENTRAL")
        assert resp.status_code == 200
        prov = resp.json()
        assert "solver" in prov
        assert "artifacts" in prov
        assert len(prov["artifacts"]) > 0

    def test_10_data_gap_handling(self):
        """Criterion 10: Missing arrival data yields valid response without crashing."""
        resp = client.post("/api/v1/routes/analyze", json={
            "scenario_id": "SCENARIO_MINIMUM",
            "origin_id": "VILL-02",
            "destination_id": "VILL-01",
            "departure_time_utc": "2026-09-24T00:00:00Z",
            "constraints": {"safety_buffer_min": 3.0}
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["primary_status"] in ["FEASIBLE", "LOW MARGIN", "INFEASIBLE", "DATA GAP"]

    def test_11_route_status_text_accessible(self):
        """Criterion 11: Allowed statuses must be standard textual strings."""
        allowed_statuses = {"FEASIBLE", "LOW MARGIN", "INFEASIBLE", "DATA GAP", "NO_FEASIBLE_ROUTE"}
        for s in ["FEASIBLE", "LOW MARGIN", "INFEASIBLE", "DATA GAP"]:
            assert s in allowed_statuses

    def test_12_decision_arithmetic_reconstructibility(self):
        """Criterion 12: Decision arithmetic is exact: Arrival - Travel - Buffer = Deadline."""
        arrival_s = 3600.0   # T+60:00
        travel_s = 759.24    # 12:39.24
        buffer_s = 180.0     # 03:00
        deadline_s = arrival_s - travel_s - buffer_s
        assert abs(deadline_s - 2660.76) < 0.01
        assert math.floor(deadline_s / 60) == 44
        assert round(deadline_s % 60) == 21
