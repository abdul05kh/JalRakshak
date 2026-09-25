import os
import pytest
import numpy as np
from backend.app.domain.hecras_adapter import HecRasHdfAdapter

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras"))
HDF5_PATH = os.path.join(ARTIFACTS_DIR, "tehri_dam_break.p01.hdf")

def test_arrival_time_threshold_detection():
    adapter = HecRasHdfAdapter()
    data = adapter.load_scenario(HDF5_PATH, arrival_threshold_m=0.30)

    # Check for cells with finite arrival time
    finite_mask = np.isfinite(data.cell_arrival_times_sec)
    assert np.any(finite_mask), "Expected flood arrival for downstream corridor cells"

    # Verify that at arrival time index, depth is indeed >= 0.30m
    for c_idx in np.where(finite_mask)[0][:10]:
        t_arr = data.cell_arrival_times_sec[c_idx]
        t_idx = np.where(data.timesteps_sec == t_arr)[0][0]
        assert data.depth_series[t_idx, c_idx] >= 0.30, f"Depth {data.depth_series[t_idx, c_idx]} < 0.30 at arrival time"
        if t_idx > 0:
            assert data.depth_series[t_idx - 1, c_idx] < 0.30, "Arrival time was not the earliest threshold crossing"

def test_dry_cells_have_infinite_arrival():
    adapter = HecRasHdfAdapter()
    data = adapter.load_scenario(HDF5_PATH, arrival_threshold_m=50.0) # Unreachably high threshold
    assert np.all(np.isinf(data.cell_arrival_times_sec)), "Expected inf arrival for unreachable threshold"
