import os
import json
import hashlib
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.domain.database import db

client = TestClient(app)
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras"))
HDF5_PATH = os.path.join(ARTIFACTS_DIR, "tehri_dam_break.p01.hdf")
MANIFEST_PATH = os.path.join(ARTIFACTS_DIR, "manifest.json")

def test_provenance_integrity_hash():
    assert os.path.exists(HDF5_PATH)
    assert os.path.exists(MANIFEST_PATH)

    with open(HDF5_PATH, "rb") as f:
        computed_sha256 = hashlib.sha256(f.read()).hexdigest()

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["sha256"] == computed_sha256, "Manifest SHA-256 does not match physical HDF5 artifact"

def test_provenance_api_endpoint():
    resp = client.get("/api/v1/scenarios/scen-baldeagle-hecras-real-001/provenance")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_type"] == "HECRAS_REAL_RESULT"
    assert data["validation_status"] == "VALIDATION_NOT_ESTABLISHED"
    assert "artifacts" in data
