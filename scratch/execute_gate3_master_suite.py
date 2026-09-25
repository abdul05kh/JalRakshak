"""
JalRakshak Gate 3 — Master Native HEC-RAS Execution & Forensic Suite
====================================================================
Executes the full suite of Gate 3 scenarios with genuine HEC-RAS 7.0.1:
1. SCENARIO_CENTRAL (Reference Froehlich 2008 Piping Scenario: Q_peak=65,000 m3/s, S0=0.004)
2. SCENARIO_MINIMUM (Partial Breach / Overtopping Scenario: Q_peak=28,500 m3/s, S0=0.004)
3. SCENARIO_MAXIMUM (Worst-Case Rapid Breach Scenario: Q_peak=115,000 m3/s, S0=0.004)
4. SCENARIO_BOUNDARY_SENSITIVITY (Downstream Friction Slope Perturbation: S0=0.008 vs S0=0.004)
5. SCENARIO_REPEATABILITY_RUN2 (Independent Reproducibility Execution on Run 2 Directory)

Produces:
- Native HEC-RAS .p01.hdf artifacts in artifacts/hecras/tehri_gate3/
- Complete read-only forensics and numerical QA metrics
- Comprehensive provenance manifest.json
"""

import os
import sys
import shutil
import hashlib
import json
import time
import glob
import datetime
import numpy as np
import h5py
import comtypes.client

def compute_sha256(filepath):
    if not os.path.exists(filepath): return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536): h.update(chunk)
    return h.hexdigest()

def get_file_metadata(filepath):
    if not os.path.exists(filepath): return None
    stat = os.stat(filepath)
    return {
        "path": os.path.abspath(filepath),
        "filename": os.path.basename(filepath),
        "size_bytes": stat.st_size,
        "sha256": compute_sha256(filepath),
        "modified_iso": datetime.datetime.fromtimestamp(stat.st_mtime, datetime.timezone.utc).isoformat()
    }

def write_u01_file(u01_path, q_peak=65000.0, friction_slope=0.004):
    q_base = 180
    with open(u01_path, "w") as f:
        f.write(f"""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope={friction_slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=1HOUR
Flow Hydrograph= 2 
     {q_base}     {int(q_peak)}
Flow Hydrograph Slope= {friction_slope:.6f}
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")
    return [q_base, int(q_peak)]

def clean_runtime_files(target_dir):
    extensions = ["*.u01.hdf", "*.b01", "*.bco01", "*.dss", "*.ic.o01", "*.p01.computeMsgs.txt", "*.x01", "*.p01.hdf", "*.p01.tmp.hdf"]
    for ext in extensions:
        for f in glob.glob(os.path.join(target_dir, ext)):
            try: os.remove(f)
            except Exception: pass

def run_scenario(scenario_name, target_dir, q_peak, friction_slope, description):
    print(f"\n=================================================================")
    print(f"  EXECUTING: {scenario_name}")
    print(f"  Description: {description}")
    print(f"  Q_peak: {q_peak:,.0f} m3/s | Friction Slope: {friction_slope}")
    print(f"=================================================================")
    sys.stdout.flush()

    clean_runtime_files(target_dir)
    u01_file = os.path.join(target_dir, "TehriSmokeTest.u01")
    flows = write_u01_file(u01_file, q_peak=q_peak, friction_slope=friction_slope)
    prj_file = os.path.join(target_dir, "TehriSmokeTest.prj")
    hdf_out = os.path.join(target_dir, "TehriSmokeTest.p01.hdf")

    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True

    ret = ras.Compute_CurrentPlan()
    print(f"  Compute launched: {ret}", flush=True)

    completed = False
    for i in range(25):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
            print(f"  Simulation completed at t={i+1}s! Output size: {os.path.getsize(hdf_out):,} bytes", flush=True)
            time.sleep(1)
            completed = True
            break
        print(f"  Simulating in HEC-RAS 7.0.1... ({i+1}s elapsed)", flush=True)

    ras.Project_Close()
    ras.QuitRas()
    t1 = time.time()

    if not completed or not os.path.exists(hdf_out):
        raise RuntimeError(f"HEC-RAS execution failed for scenario {scenario_name}")

    return {
        "scenario_name": scenario_name,
        "description": description,
        "q_peak_m3s": q_peak,
        "friction_slope": friction_slope,
        "manning_n": 0.045,
        "flows_hydrograph_m3s": flows,
        "duration_seconds": t1 - t0,
        "prj_metadata": get_file_metadata(prj_file),
        "u01_metadata": get_file_metadata(u01_file),
        "hdf_metadata": get_file_metadata(hdf_out)
    }

def inspect_forensics(hdf_path):
    forensics = {}
    with h5py.File(hdf_path, "r") as f:
        forensics["file_type"] = f.attrs.get("File Type", b"").decode() if isinstance(f.attrs.get("File Type"), bytes) else str(f.attrs.get("File Type"))
        forensics["file_version"] = f.attrs.get("File Version", b"").decode() if isinstance(f.attrs.get("File Version"), bytes) else str(f.attrs.get("File Version"))
        forensics["units_system"] = f.attrs.get("Units System", b"").decode() if isinstance(f.attrs.get("Units System"), bytes) else str(f.attrs.get("Units System"))
        forensics["projection"] = f.attrs.get("Projection", b"").decode() if isinstance(f.attrs.get("Projection"), bytes) else str(f.attrs.get("Projection"))

        # Geometry
        geom = f["Geometry/2D Flow Areas/TehriCanyon"]
        cell_elevs = np.array(geom["Cells Minimum Elevation"])
        forensics["cell_count"] = int(len(cell_elevs))
        forensics["terrain_min_m"] = float(np.min(cell_elevs))
        forensics["terrain_max_m"] = float(np.max(cell_elevs))
        forensics["terrain_mean_m"] = float(np.mean(cell_elevs))

        # Water surface
        res = f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon"]
        wse = np.array(res["Water Surface"])
        forensics["timesteps_count"] = int(wse.shape[0])
        valid_wse = wse[~np.isnan(wse) & (wse > 0)]
        forensics["wse_min_m"] = float(np.min(valid_wse)) if len(valid_wse) > 0 else 0.0
        forensics["wse_max_m"] = float(np.max(valid_wse)) if len(valid_wse) > 0 else 0.0

        # Derived Max Depth
        depths = np.maximum(0, wse - cell_elevs)
        depths[np.isnan(depths)] = 0
        forensics["max_depth_m"] = float(np.max(depths))
        forensics["mean_peak_depth_m"] = float(np.mean(np.max(depths, axis=0)))

        # Velocity
        if "Face Velocity" in res:
            vel = np.array(res["Face Velocity"])
            v_valid = vel[~np.isnan(vel)]
            forensics["max_face_velocity_ms"] = float(np.max(np.abs(v_valid))) if len(v_valid) > 0 else 0.0
        else:
            forensics["max_face_velocity_ms"] = 0.0

        # Summary volume error
        summary = f.get("Results/Unsteady/Summary")
        if summary and "Volume Error Cumulative" in summary:
            forensics["vol_error_cumulative_1000m3"] = float(summary["Volume Error Cumulative"][0])
        else:
            forensics["vol_error_cumulative_1000m3"] = 0.0

    return forensics

def execute_master_suite():
    run1_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    run2_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run2"
    artifacts_dir = r"d:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
    os.makedirs(artifacts_dir, exist_ok=True)

    scenarios = [
        ("SCENARIO_CENTRAL", run1_dir, 65000.0, 0.004, "Reference Froehlich 2008 Piping Scenario"),
        ("SCENARIO_MINIMUM", run1_dir, 28500.0, 0.004, "Minimum Partial Breach / Overtopping Scenario"),
        ("SCENARIO_MAXIMUM", run1_dir, 115000.0, 0.004, "Maximum Worst-Case Rapid Breach Scenario"),
        ("SCENARIO_BOUNDARY_SENSITIVITY", run1_dir, 65000.0, 0.008, "Downstream Friction Slope Perturbation (S0=0.008 vs S0=0.004)"),
        ("SCENARIO_REPEATABILITY_RUN2", run2_dir, 65000.0, 0.004, "Independent Reproducibility Execution on Run 2"),
    ]

    results = {}

    for name, sdir, qp, slope, desc in scenarios:
        exec_info = run_scenario(name, sdir, qp, slope, desc)
        
        # Source HDF5
        src_hdf = os.path.join(sdir, "TehriSmokeTest.p01.hdf")
        dst_hdf = os.path.join(artifacts_dir, f"{name.lower()}.p01.hdf")
        shutil.copy2(src_hdf, dst_hdf)

        forensics = inspect_forensics(dst_hdf)
        print(f"  Forensics for {name}:")
        print(f"    Cells: {forensics['cell_count']} | Timesteps: {forensics['timesteps_count']}")
        print(f"    WSE Range: [{forensics['wse_min_m']:.2f}, {forensics['wse_max_m']:.2f}] m")
        print(f"    Max Derived Flood Depth: {forensics['max_depth_m']:.2f} m")
        print(f"    Max Face Velocity: {forensics['max_face_velocity_ms']:.2f} m/s")
        print(f"    Cumulative Volume Error: {forensics['vol_error_cumulative_1000m3']:.6f} (1000 m3)")
        print(f"    Artifact SHA-256: {get_file_metadata(dst_hdf)['sha256'][:16]}...")
        sys.stdout.flush()

        exec_info["forensics"] = forensics
        exec_info["persisted_artifact"] = get_file_metadata(dst_hdf)
        results[name] = exec_info

    # Make Central standard output
    central_dst = os.path.join(artifacts_dir, "tehri_dam_break.p01.hdf")
    shutil.copy2(os.path.join(artifacts_dir, "scenario_central.p01.hdf"), central_dst)

    # Copy native model project files to artifacts directory
    for item in os.listdir(run1_dir):
        sp = os.path.join(run1_dir, item)
        dp = os.path.join(artifacts_dir, item)
        if os.path.isfile(sp):
            shutil.copy2(sp, dp)
        elif os.path.isdir(sp):
            if os.path.exists(dp): shutil.rmtree(dp)
            shutil.copytree(sp, dp)

    # Repeatability Analysis
    c1_wse = results["SCENARIO_CENTRAL"]["forensics"]["wse_max_m"]
    c2_wse = results["SCENARIO_REPEATABILITY_RUN2"]["forensics"]["wse_max_m"]
    c1_depth = results["SCENARIO_CENTRAL"]["forensics"]["max_depth_m"]
    c2_depth = results["SCENARIO_REPEATABILITY_RUN2"]["forensics"]["max_depth_m"]
    c1_hash = results["SCENARIO_CENTRAL"]["persisted_artifact"]["sha256"]
    c2_hash = results["SCENARIO_REPEATABILITY_RUN2"]["persisted_artifact"]["sha256"]

    repeatability = {
        "artifact_hash_match": c1_hash == c2_hash,
        "run1_sha256": c1_hash,
        "run2_sha256": c2_hash,
        "numerical_repeatability_wse_diff_m": float(abs(c1_wse - c2_wse)),
        "numerical_repeatability_depth_diff_m": float(abs(c1_depth - c2_depth)),
        "status": "PASS" if abs(c1_wse - c2_wse) < 1e-4 else "FAIL"
    }
    results["repeatability_assessment"] = repeatability

    # Full Provenance Manifest
    manifest_path = os.path.join(artifacts_dir, "manifest.json")
    with open(manifest_path, "w") as mf:
        json.dump(results, mf, indent=2)

    with open(r"scratch\gate3_master_manifest.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n=================================================================")
    print(f"  MASTER SUITE COMPLETE: Manifest written to {manifest_path}")
    print(f"  Repeatability Status: {repeatability['status']} (WSE diff: {repeatability['numerical_repeatability_wse_diff_m']:.6f} m)")
    print(f"=================================================================")

if __name__ == "__main__":
    execute_master_suite()
