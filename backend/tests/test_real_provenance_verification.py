"""
Automated Test Suite for Real SHA-256 Physical Disk Provenance Verification.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_verify_scenario_provenance_endpoint():
    response = client.get("/api/v1/scenarios/SCENARIO_CENTRAL/verify-provenance")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == "SCENARIO_CENTRAL"
    assert "verification_timestamp_utc" in data
    assert "verified_artifacts" in data
    assert len(data["verified_artifacts"]) > 0

    # Ensure SHA-256 hashes are 64-character hexadecimal strings
    for artifact in data["verified_artifacts"]:
        if artifact["status"] == "VERIFIED_ON_DISK":
            assert len(artifact["sha256"]) == 64
            assert artifact["bytes"] > 0
