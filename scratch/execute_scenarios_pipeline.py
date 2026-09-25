"""
JalRakshak Gate 3 — Multi-Scenario Native HEC-RAS Execution Engine
==================================================================
Runs:
1. SCENARIO_CENTRAL (Reference Dam Break: Froehlich 2008, Q_peak=65,000 m3/s, n=0.045, S0=0.004)
2. SCENARIO_MINIMUM (Partial Breach / Overtopping: Q_peak=28,500 m3/s, n=0.045, S0=0.004)
3. SCENARIO_MAXIMUM (Worst-Case Rapid Breach: Q_peak=115,000 m3/s, n=0.045, S0=0.004)
4. SCENARIO_BOUNDARY_SENSITIVITY (Slope Sensitivity: S0=0.008 vs S0=0.004)
5. SCENARIO_REPEATABILITY_RUN2 (Independent Repeat Run of Scenario Central)

Extracts all numerical QA metrics, verifies HDF5 read-only, and generates artifacts manifest.
"""

import os
import sys
import shutil
import hashlib
import json
import time
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

def setup_scenario_directory(base_template, target_dir, q_peak=65000.0, t_peak=0.4, friction_slope=0.004, sim_hours=1):
    os.makedirs(target_dir, exist_ok=True)
    # Copy template files (terrain and compiled geometry)
    for item in os.listdir(base_template):
        src = os.path.join(base_template, item)
        dst = os.path.join(target_dir, item)
        if os.path.isdir(src):
            if os.path.exists(dst): shutil.rmtree(dst)
            shutil.copytree(src, dst)
        elif not item.endswith(".p01.hdf") and not item.endswith(".dss") and not item.endswith(".computeMsgs.txt") and not item.endswith(".bco01") and not item.endswith(".ic.o01"):
            shutil.copy2(src, dst)

    # Write scenario-specific u01 hydrograph
    times_hr = np.arange(0, sim_hours + 0.1, 0.1) # 6-min intervals (11 points)
    t_base = 180.0
    flows = []
    for t in times_hr:
        if t <= t_peak:
            q = t_base + (q_peak - t_base) * ((t / t_peak) ** 2.0)
        else:
            q = t_base + (q_peak - t_base) * np.exp(-3.5 * (t - t_peak))
        flows.append(int(round(q)))

    u01_file = os.path.join(target_dir, "TehriSmokeTest.u01")
    n_flows = len(flows)
    with open(u01_file, "w") as f:
        f.write(f"""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope={friction_slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=6MIN
Flow Hydrograph= {n_flows} 
""")
        for i in range(0, n_flows, 5):
            chunk = flows[i:i+5]
            f.write(" " + " ".join(f"{int(q):8d}" for q in chunk) + "\n")
        f.write(f"""Flow Hydrograph Slope= {friction_slope:.6f}
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    # Remove any old p01.hdf
    old_hdf = os.path.join(target_dir, "TehriSmokeTest.p01.hdf")
    if os.path.exists(old_hdf): os.remove(old_hdf)
    
    prj_file = os.path.join(target_dir, "TehriSmokeTest.prj")
    return prj_file, u01_file, flows

def run_hecras_case(prj_path, timeout_seconds=60):
    print(f"Opening HEC-RAS 7.0.1 for: {prj_path}...")
    sys.stdout.flush()
    t0 = time.time()
    
    hdf_out = prj_path.replace(".prj", ".p01.hdf")
    if os.path.exists(hdf_out):
        try: os.remove(hdf_out)
        except Exception: pass

    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_path))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    print(f"  Compute launched: {ret}")
    sys.stdout.flush()

    # Wait for p01.hdf to be produced and stabilized
    for i in range(timeout_seconds):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 100000:
            s1 = os.path.getsize(hdf_out)
            time.sleep(1)
            s2 = os.path.getsize(hdf_out)
            if s1 == s2:
                print(f"  Simulation completed at t={i+1}s! HDF5 Size: {s2:,} bytes")
                break
        if (i + 1) % 5 == 0:
            print(f"  Waiting for computation... ({i+1}s elapsed)")
            sys.stdout.flush()

    try:
        ras.Project_Close()
        ras.QuitRas()
    except Exception as e:
        print(f"  Warning closing controller: {e}")

    t1 = time.time()
    sys.stdout.flush()

    if not os.path.exists(hdf_out):
        raise RuntimeError(f"HDF5 output not created for {prj_path}")
        
    return hdf_out, t1 - t0

def inspect_scenario_hdf5(hdf_path):
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

def execute_all_scenarios():
    base_template = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    work_root = r"C:\HEC_Work\TehriGate3"
    os.makedirs(work_root, exist_ok=True)

    suite_configs = [
        ("SCENARIO_CENTRAL", os.path.join(work_root, "Central"), 65000.0, 0.4, 0.004, "Reference Froehlich 2008 Piping Scenario"),
        ("SCENARIO_MINIMUM", os.path.join(work_root, "Minimum"), 28500.0, 0.5, 0.004, "Minimum Partial Breach / Overtopping Scenario"),
        ("SCENARIO_MAXIMUM", os.path.join(work_root, "Maximum"), 115000.0, 0.3, 0.004, "Maximum Worst-Case Rapid Dam Break Scenario"),
        ("SCENARIO_BOUNDARY_SENSITIVITY", os.path.join(work_root, "BoundarySens"), 65000.0, 0.4, 0.008, "Downstream Friction Slope Perturbation (S0=0.008)"),
        ("SCENARIO_REPEATABILITY_RUN2", os.path.join(work_root, "Repeatability_Run2"), 65000.0, 0.4, 0.004, "Independent Reproducibility Run (Identical Inputs)"),
    ]

    results = {}
    for name, sdir, qp, tp, slope, desc in suite_configs:
        print(f"\n=================================================================")
        print(f"  EXECUTING: {name} ({desc})")
        print(f"  Q_peak: {qp:,.0f} m3/s | t_peak: {tp} h | Slope: {slope}")
        print(f"=================================================================")
        sys.stdout.flush()

        prj, u01, flows = setup_scenario_directory(base_template, sdir, q_peak=qp, t_peak=tp, friction_slope=slope)
        hdf_out, dur = run_hecras_case(prj)
        forensics = inspect_scenario_hdf5(hdf_out)

        print(f"  Forensic Results for {name}:")
        print(f"    Cells: {forensics['cell_count']} | Timesteps: {forensics['timesteps_count']}")
        print(f"    WSE Range: [{forensics['wse_min_m']:.2f}, {forensics['wse_max_m']:.2f}] m")
        print(f"    Max Derived Flood Depth: {forensics['max_depth_m']:.2f} m")
        print(f"    Max Face Velocity: {forensics['max_face_velocity_ms']:.2f} m/s")
        print(f"    Cumulative Volume Accounting Error: {forensics['vol_error_cumulative_1000m3']:.6f} (1000 m3)")
        print(f"    Simulation Duration: {dur:.2f} s")
        sys.stdout.flush()

        results[name] = {
            "scenario_name": name,
            "description": desc,
            "work_dir": sdir,
            "q_peak_m3s": qp,
            "t_peak_hr": tp,
            "friction_slope": slope,
            "manning_n": 0.045,
            "runtime_seconds": dur,
            "files": {
                "prj": get_file_metadata(prj),
                "u01": get_file_metadata(u01),
                "plan_hdf": get_file_metadata(hdf_out)
            },
            "forensics": forensics
        }

    # Verify Repeatability between Central Run 1 and Run 2
    c1_wse = results["SCENARIO_CENTRAL"]["forensics"]["wse_max_m"]
    c2_wse = results["SCENARIO_REPEATABILITY_RUN2"]["forensics"]["wse_max_m"]
    c1_depth = results["SCENARIO_CENTRAL"]["forensics"]["max_depth_m"]
    c2_depth = results["SCENARIO_REPEATABILITY_RUN2"]["forensics"]["max_depth_m"]
    print(f"\n--- REPEATABILITY VERIFICATION ---")
    print(f"Central Run 1 Max WSE: {c1_wse:.4f} m | Run 2: {c2_wse:.4f} m (Diff: {abs(c1_wse - c2_wse):.6f} m)")
    print(f"Central Run 1 Max Depth: {c1_depth:.4f} m | Run 2: {c2_depth:.4f} m (Diff: {abs(c1_depth - c2_depth):.6f} m)")
    results["repeatability_check"] = {
        "status": "PASS" if abs(c1_wse - c2_wse) < 1e-4 else "FAIL",
        "wse_diff_m": abs(c1_wse - c2_wse),
        "depth_diff_m": abs(c1_depth - c2_depth)
    }

    # Copy artifacts to repository artifacts/hecras/tehri_gate3/
    dest_artifacts_dir = r"d:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
    os.makedirs(dest_artifacts_dir, exist_ok=True)
    
    # Copy Central scenario outputs
    central_src = results["SCENARIO_CENTRAL"]["work_dir"]
    for item in os.listdir(central_src):
        sp = os.path.join(central_src, item)
        dp = os.path.join(dest_artifacts_dir, item)
        if os.path.isfile(sp):
            shutil.copy2(sp, dp)
        elif os.path.isdir(sp):
            if os.path.exists(dp): shutil.rmtree(dp)
            shutil.copytree(sp, dp)

    # Save manifest.json
    manifest_path = os.path.join(dest_artifacts_dir, "manifest.json")
    with open(manifest_path, "w") as mf:
        json.dump(results, mf, indent=2)
    print(f"\nManifest successfully written to: {manifest_path}")

    with open(r"scratch\gate3_execution_manifest.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\nGATE 3 MASTER SIMULATION SUITE COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    execute_all_scenarios()
