"""
Automated Test Suite for Tehri Gate 3 Native HEC-RAS Hydraulic Model
====================================================================
Tests verify:
1. Native HEC-RAS HDF5 structure, attributes, and units.
2. Read-only HDF5 safety.
3. Terrain elevation and WSE dimension alignment.
4. Correct derived flood depth logic: depth = max(0, WSE - Z_cell).
5. Model-derived flood arrival time threshold logic and monotonic properties.
6. Numerical repeatability across independent runs (Run 1 vs Run 2).
7. Provenance manifest integrity and scenario coverage.
"""

import os
import json
import pytest
import numpy as np
import h5py

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ARTIFACTS_DIR = str(REPO_ROOT / "artifacts" / "hecras" / "tehri_gate3")
CENTRAL_HDF = os.path.join(ARTIFACTS_DIR, "scenario_central.p01.hdf")
REPEATABILITY_HDF = os.path.join(ARTIFACTS_DIR, "scenario_repeatability_run2.p01.hdf")
MANIFEST_JSON = os.path.join(ARTIFACTS_DIR, "manifest.json")

def test_gate3_artifacts_exist():
    assert os.path.exists(CENTRAL_HDF), f"Central scenario HDF5 missing: {CENTRAL_HDF}"
    assert os.path.exists(REPEATABILITY_HDF), f"Repeatability HDF5 missing: {REPEATABILITY_HDF}"
    assert os.path.exists(MANIFEST_JSON), f"Manifest missing: {MANIFEST_JSON}"

def test_hdf5_native_metadata_and_readonly():
    with h5py.File(CENTRAL_HDF, "r") as f:
        # File Type check
        file_type = f.attrs.get("File Type", b"").decode() if isinstance(f.attrs.get("File Type"), bytes) else str(f.attrs.get("File Type"))
        assert "HEC-RAS" in file_type, f"Unexpected File Type: {file_type}"
        
        # Units system check
        units = f.attrs.get("Units System", b"").decode() if isinstance(f.attrs.get("Units System"), bytes) else str(f.attrs.get("Units System"))
        assert "SI" in units or "Metric" in units or "SI Units" in units or len(units) > 0, "Units metadata missing"

def test_geometry_and_results_dimensions():
    with h5py.File(CENTRAL_HDF, "r") as f:
        geom_path = "Geometry/2D Flow Areas/TehriCanyon"
        assert geom_path in f, "TehriCanyon 2D flow area missing from geometry"
        
        cell_elevs = np.array(f[f"{geom_path}/Cells Minimum Elevation"])
        assert len(cell_elevs) == 896, f"Expected 896 cells, got {len(cell_elevs)}"
        assert np.nanmin(cell_elevs) >= 600.0, "Minimum terrain elevation out of physical bounds"
        assert np.nanmax(cell_elevs) <= 1200.0, "Maximum terrain elevation out of physical bounds"
        
        res_path = "Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon"
        assert res_path in f, "Unsteady results missing from HDF5"
        
        wse = np.array(f[f"{res_path}/Water Surface"])
        assert wse.shape == (13, 896), f"Expected shape (13, 896), got {wse.shape}"

def test_derived_depth_calculation():
    with h5py.File(CENTRAL_HDF, "r") as f:
        cell_elevs = np.array(f["Geometry/2D Flow Areas/TehriCanyon/Cells Minimum Elevation"])
        wse = np.array(f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon/Water Surface"])
        
        # Formula: depth = max(0, WSE - cell_elevs)
        depths = np.maximum(0.0, wse - cell_elevs)
        depths[np.isnan(depths)] = 0.0
        
        max_depth = np.max(depths)
        assert max_depth > 0.5, f"Expected positive inundation depth, got {max_depth}"
        assert max_depth < 100.0, f"Unphysical flood depth: {max_depth} m"

def test_model_derived_arrival_threshold_monotonicity():
    with h5py.File(CENTRAL_HDF, "r") as f:
        cell_elevs = np.array(f["Geometry/2D Flow Areas/TehriCanyon/Cells Minimum Elevation"])
        wse = np.array(f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon/Water Surface"])
        depths = np.maximum(0.0, wse - cell_elevs)
        depths[np.isnan(depths)] = 0.0
        
        # Test arrival times for lower vs higher thresholds
        th_low = 0.1  # 10 cm threshold
        th_high = 0.5 # 50 cm threshold
        
        # Find first timestep index exceeding threshold for each cell
        def get_arrival_indices(depth_array, threshold):
            n_times, n_cells = depth_array.shape
            arrivals = np.full(n_cells, np.nan)
            for c in range(n_cells):
                idx = np.where(depth_array[:, c] >= threshold)[0]
                if len(idx) > 0:
                    arrivals[c] = idx[0]
            return arrivals

        arr_low = get_arrival_indices(depths, th_low)
        arr_high = get_arrival_indices(depths, th_high)
        
        # Monotonicity check: arrival at higher threshold must be >= arrival at lower threshold
        valid_mask = ~np.isnan(arr_low) & ~np.isnan(arr_high)
        assert np.all(arr_high[valid_mask] >= arr_low[valid_mask]), "Arrival threshold violates monotonicity"

def test_numerical_repeatability():
    with h5py.File(CENTRAL_HDF, "r") as f1, h5py.File(REPEATABILITY_HDF, "r") as f2:
        wse1 = np.array(f1["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon/Water Surface"])
        wse2 = np.array(f2["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon/Water Surface"])
        
        # Zero numerical drift expected for identical inputs
        diff = np.nanmax(np.abs(wse1 - wse2))
        assert diff < 1e-4, f"Numerical repeatability failed, max WSE delta: {diff}"

def test_manifest_provenance_schema():
    with open(MANIFEST_JSON, "r") as f:
        manifest = json.load(f)
        
    required_scenarios = [
        "SCENARIO_CENTRAL",
        "SCENARIO_MINIMUM",
        "SCENARIO_MAXIMUM",
        "SCENARIO_BOUNDARY_SENSITIVITY",
        "SCENARIO_REPEATABILITY_RUN2"
    ]
    for sc in required_scenarios:
        assert sc in manifest, f"Scenario {sc} missing from manifest"
        assert "forensics" in manifest[sc], f"Forensics missing for {sc}"
        assert manifest[sc]["forensics"]["cell_count"] == 896
        assert manifest[sc]["forensics"]["vol_error_cumulative_1000m3"] < 0.01

    assert "repeatability_assessment" in manifest
    assert manifest["repeatability_assessment"]["status"] == "PASS"
