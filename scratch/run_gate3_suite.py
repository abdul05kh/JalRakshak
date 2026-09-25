"""
Run Master Gate 3 Scenarios and Scientific Forensics
"""
import os
import sys
import shutil
import hashlib
import json
import time
import datetime
import subprocess
import h5py
import rasterio
import numpy as np

from execute_gate3_pipeline import (
    prepare_terrain,
    build_native_geometry,
    generate_breach_hydrograph,
    write_flow_and_plan,
    run_hecras_simulation,
    compute_sha256,
    get_file_metadata
)

RAW_DEM = r"d:\projects\JalRakshak\data\tehri\raw\Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif"
DERIVED_DEM = r"d:\projects\JalRakshak\data\tehri\derived\tehri_pilot_utm44n_25m.tif"

def execute_single_scenario(case_name, work_dir, cell_spacing=75.0, scenario_type="CENTRAL", friction_slope=0.005, manning=0.045, sim_hours=4):
    print(f"\n=======================================================")
    print(f"EXECUTING SCENARIO: {case_name}")
    print(f"Directory: {work_dir}")
    print(f"Cell Spacing: {cell_spacing}m | Scenario Type: {scenario_type} | Slope: {friction_slope}")
    print(f"=======================================================")

    os.makedirs(work_dir, exist_ok=True)
    
    # 1. Terrain
    terr_hdf, terr_prj = prepare_terrain(work_dir, RAW_DEM, DERIVED_DEM)
    
    # 2. Geometry
    g01_file, n_pts = build_native_geometry(work_dir, cell_spacing=cell_spacing, manning=manning)
    
    # 3. Flow & Plan
    hydrograph = generate_breach_hydrograph(scenario_type=scenario_type)
    prj_file, u01_file, p01_file, rasmap_file = write_flow_and_plan(
        work_dir, hydrograph, friction_slope=friction_slope, sim_hours=sim_hours
    )
    
    # 4. Execute Native HEC-RAS
    run_result = run_hecras_simulation(prj_file)
    
    # 5. Read-only Forensic Inspection
    hdf_path = run_result["hdf_path"]
    forensics = inspect_hdf5(hdf_path)
    
    return {
        "case_name": case_name,
        "work_dir": work_dir,
        "cell_spacing": cell_spacing,
        "cell_count": n_pts,
        "scenario_type": scenario_type,
        "friction_slope": friction_slope,
        "manning": manning,
        "runtime_seconds": run_result["runtime_seconds"],
        "files": {
            "prj": get_file_metadata(prj_file),
            "g01": get_file_metadata(g01_file),
            "u01": get_file_metadata(u01_file),
            "p01": get_file_metadata(p01_file),
            "rasmap": get_file_metadata(rasmap_file),
            "terrain_hdf": get_file_metadata(terr_hdf),
            "plan_hdf": get_file_metadata(hdf_path)
        },
        "forensics": forensics
    }

def inspect_hdf5(hdf_path):
    print(f"Inspecting HEC-RAS HDF5 (READ-ONLY): {hdf_path}")
    results = {}
    with h5py.File(hdf_path, "r") as f:
        results["file_type"] = f.attrs.get("File Type", b"").decode() if isinstance(f.attrs.get("File Type"), bytes) else str(f.attrs.get("File Type"))
        results["file_version"] = f.attrs.get("File Version", b"").decode() if isinstance(f.attrs.get("File Version"), bytes) else str(f.attrs.get("File Version"))
        
        # Results tree
        res_group = f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriReach"]
        wse_ds = res_group["Water Surface"]
        results["wse_shape"] = list(wse_ds.shape) # [timesteps, cells]
        results["n_timesteps"] = int(wse_ds.shape[0])
        results["n_cells"] = int(wse_ds.shape[1])
        
        # Sample min/max WSE
        wse_arr = np.array(wse_ds)
        # Valid WSE (ignoring dry cells / NaN values)
        valid_wse = wse_arr[~np.isnan(wse_arr) & (wse_arr > 0)]
        if len(valid_wse) > 0:
            results["wse_min"] = float(np.nanmin(valid_wse))
            results["wse_max"] = float(np.nanmax(valid_wse))
        else:
            results["wse_min"] = None
            results["wse_max"] = None
            
        # Geometry data
        geom_group = f["Geometry/2D Flow Areas/TehriReach"]
        results["cell_elev_min"] = float(np.nanmin(geom_group["Cells Minimum Elevation"]))
        results["cell_elev_max"] = float(np.nanmax(geom_group["Cells Minimum Elevation"]))
        
        # Times
        times_ds = f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/Time Date Stamp"]
        results["time_stamps"] = [t.decode() if isinstance(t, bytes) else str(t) for t in times_ds[:]]
        
        # Volume Accounting / Summary
        summary_group = f.get("Results/Unsteady/Summary")
        if summary_group:
            vol_err = summary_group.get("Volume Error Cumulative")
            if vol_err:
                results["volume_error_cumulative"] = float(vol_err[0]) if len(vol_err) > 0 else None
                
    print(f"Forensic Summary: {results['n_timesteps']} timesteps, {results['n_cells']} cells, WSE range: [{results['wse_min']:.2f}, {results['wse_max']:.2f}] m")
    return results

if __name__ == "__main__":
    # Test Central Run
    res = execute_single_scenario(
        "SCENARIO_CENTRAL",
        r"C:\HEC_Work\TehriGate3_Central",
        cell_spacing=75.0,
        scenario_type="CENTRAL",
        friction_slope=0.005,
        manning=0.045,
        sim_hours=4
    )
    with open(r"scratch\test_central_result.json", "w") as f:
        json.dump(res, f, indent=2)
    print("\nCentral Scenario Run Completed Successfully.")
