import os
import pytest
import numpy as np
from backend.app.domain.hecras_adapter import HecRasHdfAdapter

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras"))
HDF5_PATH = os.path.join(ARTIFACTS_DIR, "tehri_dam_break.p01.hdf")

def test_hecras_hdf_adapter_loads_artifact():
    assert os.path.exists(HDF5_PATH), f"Artifact missing: {HDF5_PATH}"
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    data = adapter.load_scenario(HDF5_PATH)

    assert data.scenario_id == "scen-hecras-real-001"
    assert data.source_type == "HECRAS_REAL_RESULT"
    assert data.units == "meters" or data.units == "SI"
    assert "EPSG:32644" in data.crs
    assert len(data.cell_coords) > 0
    assert len(data.cell_min_elev) == len(data.cell_coords)
    assert len(data.timesteps_sec) > 0
    assert len(data.sha256_checksum) == 64

def test_hecras_depth_derivation_non_negative():
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    data = adapter.load_scenario(HDF5_PATH)

    # Depth must be exactly max(0, WSE - Z_min)
    computed_depth = np.maximum(0.0, data.water_surface - data.cell_min_elev[np.newaxis, :])
    np.testing.assert_allclose(data.depth_series, computed_depth, rtol=1e-5, atol=1e-5)
    assert np.all(data.depth_series >= 0.0), "Found negative depth in derived depth series"

def test_hecras_arrival_threshold_monotonicity():
    adapter = HecRasHdfAdapter()
    data_03 = adapter.load_scenario(HDF5_PATH, arrival_threshold_m=0.30)
    data_08 = adapter.load_scenario(HDF5_PATH, arrival_threshold_m=0.80)

    # For any cell, arrival time at 0.8m must be >= arrival time at 0.3m
    valid_mask = np.isfinite(data_03.cell_arrival_times_sec) & np.isfinite(data_08.cell_arrival_times_sec)
    assert np.all(data_08.cell_arrival_times_sec[valid_mask] >= data_03.cell_arrival_times_sec[valid_mask])
