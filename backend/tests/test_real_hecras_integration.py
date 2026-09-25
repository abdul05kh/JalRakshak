import os
import hashlib
import pytest
import numpy as np
import h5py
from backend.app.domain.hecras_adapter import HecRasHdfAdapter, DEFAULT_REAL_HECRAS_HDF_PATH

KNOWN_BALD_EAGLE_HDF_PATH = r"C:\HEC_Work\BaldEagleCrkMulti2D\BaldEagleDamBrk.p05.hdf"
EXPECTED_BALD_EAGLE_SHA256 = "43aeff5843b74607514dc61e202bae05c23c5dc431070a5d3761330f00b056ec"
EXPECTED_FILE_SIZE_BYTES = 94446713
EXPECTED_NUM_CELLS = 26265
EXPECTED_NUM_TIMESTEPS = 433

def test_real_hecras_file_integrity():
    """Verify that the genuine HEC-RAS 7.0.1 artifact exists with exact bit-level integrity."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    assert os.path.exists(target_path), f"Real HEC-RAS artifact not found at: {target_path}"
    
    file_size = os.path.getsize(target_path)
    assert file_size == EXPECTED_FILE_SIZE_BYTES, f"File size mismatch: {file_size} != {EXPECTED_FILE_SIZE_BYTES}"

    hasher = hashlib.sha256()
    with open(target_path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            hasher.update(chunk)
    computed_sha256 = hasher.hexdigest()

    assert computed_sha256 == EXPECTED_BALD_EAGLE_SHA256, (
        f"SHA-256 mismatch for real HEC-RAS artifact:\n"
        f"Expected: {EXPECTED_BALD_EAGLE_SHA256}\n"
        f"Computed: {computed_sha256}"
    )

def test_real_hecras_read_only_guarantee():
    """Verify that the adapter opens the artifact strictly read-only and never alters the source file."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    
    # Checksum before execution
    hasher_before = hashlib.sha256()
    with open(target_path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            hasher_before.update(chunk)
    sha256_before = hasher_before.hexdigest()

    # Execute adapter
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    data = adapter.load_scenario(target_path)
    assert data is not None

    # Checksum after execution
    hasher_after = hashlib.sha256()
    with open(target_path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            hasher_after.update(chunk)
    sha256_after = hasher_after.hexdigest()

    assert sha256_before == sha256_after == EXPECTED_BALD_EAGLE_SHA256, (
        "Artifact was modified during adapter execution!"
    )

def test_real_hecras_native_dimensions():
    """Verify exact native mesh dimensions from the real HEC-RAS 2D unsteady run."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    adapter = HecRasHdfAdapter()
    data = adapter.load_scenario(target_path)

    assert data.flow_area_name == "BaldEagleCr"
    assert len(data.cell_coords) == EXPECTED_NUM_CELLS
    assert len(data.cell_min_elev_native) == EXPECTED_NUM_CELLS
    assert len(data.timesteps_sec) == EXPECTED_NUM_TIMESTEPS
    assert len(data.time_date_stamps) == EXPECTED_NUM_TIMESTEPS
    assert data.water_surface_native.shape == (EXPECTED_NUM_TIMESTEPS, EXPECTED_NUM_CELLS)
    assert data.face_velocity_native.shape == (EXPECTED_NUM_TIMESTEPS, 54636)
    assert data.is_us_customary is True
    assert data.unit_scale_to_m == 0.3048

def test_real_hecras_independent_unit_conversion_and_depth():
    """
    Independently derive depth in meters from raw HDF5 dataset without relying on adapter methods:
    expected_depth_m = max(0, (WSE_ft - Zmin_ft) * 0.3048)
    """
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    
    # 1. Independent extraction directly via h5py
    with h5py.File(target_path, "r") as hdf:
        raw_zmin = np.array(hdf["Geometry/2D Flow Areas/BaldEagleCr/Cells Minimum Elevation"], dtype=np.float32)
        raw_wse = np.array(hdf["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/BaldEagleCr/Water Surface"], dtype=np.float32)

    # 2. Independent computation
    expected_depth_m = np.maximum(0.0, (raw_wse - raw_zmin[np.newaxis, :]) * 0.3048)
    expected_depth_m = np.nan_to_num(expected_depth_m, nan=0.0, posinf=0.0, neginf=0.0)

    # 3. Compare against adapter output
    adapter = HecRasHdfAdapter()
    data = adapter.load_scenario(target_path)

    np.testing.assert_allclose(data.depth_series_m, expected_depth_m, rtol=1e-4, atol=1e-4)
    assert np.all(data.depth_series_m >= 0.0), "Negative depth values discovered in adapter output!"
    assert data.derived_units == "meters"

def test_real_hecras_independent_arrival_time():
    """
    Independently determine flood arrival threshold crossing time for each cell:
    A(c) = min { t | depth_m(c, t) >= 0.30m }
    """
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    threshold_m = 0.30

    with h5py.File(target_path, "r") as hdf:
        raw_zmin = np.array(hdf["Geometry/2D Flow Areas/BaldEagleCr/Cells Minimum Elevation"], dtype=np.float32)
        raw_wse = np.array(hdf["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/BaldEagleCr/Water Surface"], dtype=np.float32)
        raw_time_days = np.array(hdf["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/Time"], dtype=np.float64)
        independent_timesteps_sec = raw_time_days * 86400.0

    independent_depth_m = np.maximum(0.0, (raw_wse - raw_zmin[np.newaxis, :]) * 0.3048)
    independent_arrivals_sec = np.full((EXPECTED_NUM_CELLS,), np.inf, dtype=np.float64)

    for c_idx in range(EXPECTED_NUM_CELLS):
        idxs = np.where(independent_depth_m[:, c_idx] >= threshold_m)[0]
        if len(idxs) > 0:
            independent_arrivals_sec[c_idx] = independent_timesteps_sec[idxs[0]]

    # Compare against adapter output
    adapter = HecRasHdfAdapter(default_threshold_m=threshold_m)
    data = adapter.load_scenario(target_path, arrival_threshold_m=threshold_m)

    # 1. Compare finite vs infinite states
    adapter_finite = np.isfinite(data.cell_arrival_times_sec)
    expected_finite = np.isfinite(independent_arrivals_sec)
    assert np.array_equal(adapter_finite, expected_finite), "Arrival time finite/infinite mask mismatch"

    # 2. Compare exact values for flooded cells
    np.testing.assert_allclose(
        data.cell_arrival_times_sec[adapter_finite],
        independent_arrivals_sec[expected_finite],
        rtol=1e-5, atol=1e-5
    )

def test_real_hecras_arrival_threshold_monotonicity():
    """Verify that increasing flood arrival threshold from 0.3m to 0.8m never produces an earlier arrival time."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    adapter = HecRasHdfAdapter()
    data_03 = adapter.load_scenario(target_path, arrival_threshold_m=0.30)
    data_08 = adapter.load_scenario(target_path, arrival_threshold_m=0.80)

    # Where both are finite, arrival at 0.8m must be >= arrival at 0.3m
    both_finite = np.isfinite(data_03.cell_arrival_times_sec) & np.isfinite(data_08.cell_arrival_times_sec)
    assert np.all(data_08.cell_arrival_times_sec[both_finite] >= data_03.cell_arrival_times_sec[both_finite])

def test_real_hecras_reproducibility():
    """Verify that two sequential executions of the real adapter yield identical results."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)

    run1 = adapter.load_scenario(target_path)
    run2 = adapter.load_scenario(target_path)

    assert run1.sha256_checksum == run2.sha256_checksum
    assert len(run1.cell_coords) == len(run2.cell_coords) == EXPECTED_NUM_CELLS
    assert len(run1.timesteps_sec) == len(run2.timesteps_sec) == EXPECTED_NUM_TIMESTEPS
    assert run1.time_date_stamps == run2.time_date_stamps
    
    np.testing.assert_array_equal(
        np.isfinite(run1.cell_arrival_times_sec),
        np.isfinite(run2.cell_arrival_times_sec)
    )
    np.testing.assert_allclose(run1.depth_series_m, run2.depth_series_m, rtol=1e-6, atol=1e-6)

def test_real_hecras_geography_guard():
    """Verify that real Pennsylvania hydraulics are not mapped onto Uttarakhand roads."""
    target_path = os.environ.get("REAL_HECRAS_HDF_PATH", KNOWN_BALD_EAGLE_HDF_PATH)
    adapter = HecRasHdfAdapter()
    data = adapter.load_scenario(target_path)

    assert data.source_type == "HECRAS_REAL_RESULT"
    assert data.validation_status == "VALIDATION_NOT_ESTABLISHED"
    assert data.road_integration_status == "ROAD_DATA_UNAVAILABLE"
    assert "NAD_1983_StatePlane_Pennsylvania" in data.crs
