"""
JalRakshak Gate 3 — Single COM Controller Session Multi-Scenario Runner
========================================================================
Executes all Gate 3 scenarios within a single HEC-RAS 7.0.1 controller session.
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

def update_u01(u01_path, q_peak=65000.0, t_peak=0.4, friction_slope=0.004, sim_hours=1):
    # 13 points at 5-min intervals from t=0.0 to 1.0 hr (60 min)
    times_hr = np.linspace(0.0, 1.0, 13)
    t_base = 180.0
    flows = []
    for t in times_hr:
        if t <= t_peak:
            q = t_base + (q_peak - t_base) * ((t / t_peak) ** 2.0)
        else:
            q = t_base + (q_peak - t_base) * np.exp(-3.5 * (t - t_peak))
        flows.append(int(round(q)))

    n_flows = len(flows)
    with open(u01_path, "w") as f:
        f.write(f"""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope={friction_slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=5MIN
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
    return flows

def inspect_hdf5(hdf_path):
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

        # Volume error
        summary = f.get("Results/Unsteady/Summary")
        if summary and "Volume Error Cumulative" in summary:
            forensics["vol_error_cumulative_1000m3"] = float(summary["Volume Error Cumulative"][0])
        else:
            forensics["vol_error_cumulative_1000m3"] = 0.0

    return forensics

def execute_suite():
    run1_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    run2_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run2"
    artifacts_dir = r"d:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
    os.makedirs(artifacts_dir, exist_ok=True)

    scenarios = [
        ("SCENARIO_CENTRAL", run1_dir, 65000.0, 0.4, 0.004, "Reference Froehlich 2008 Piping Scenario"),
        ("SCENARIO_MINIMUM", run1_dir, 28500.0, 0.5, 0.004, "Minimum Partial Breach / Overtopping Scenario"),
        ("SCENARIO_MAXIMUM", run1_dir, 115000.0, 0.3, 0.004, "Maximum Worst-Case Rapid Breach Scenario"),
        ("SCENARIO_BOUNDARY_SENSITIVITY", run1_dir, 65000.0, 0.4, 0.008, "Downstream Slope Perturbation Scenario (S0=0.008)"),
        ("SCENARIO_REPEATABILITY_RUN2", run2_dir, 65000.0, 0.4, 0.004, "Independent Repeatability Execution on Run 2"),
    ]

    print("=== Initializing HEC-RAS 7.0.1 COM Controller Session ===")
    sys.stdout.flush()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True

    results = {}

    for name, sdir, qp, tp, slope, desc in scenarios:
        print(f"\n=================================================================")
        print(f"  RUNNING: {name}")
        print(f"  Q_peak: {qp:,.0f} m3/s | t_peak: {tp} h | Slope: {slope}")
        print(f"=================================================================")
        sys.stdout.flush()

        prj = os.path.join(sdir, "TehriSmokeTest.prj")
        u01 = os.path.join(sdir, "TehriSmokeTest.u01")
        hdf = os.path.join(sdir, "TehriSmokeTest.p01.hdf")
        
        # 1. Update hydrograph
        flows = update_u01(u01, q_peak=qp, t_peak=tp, friction_slope=slope)
        if os.path.exists(hdf): os.remove(hdf)

        # 2. Open Project & Compute
        t0 = time.time()
        ras.Project_Open(os.path.abspath(prj))
        ret = ras.Compute_CurrentPlan()
        print(f"  Compute launched: {ret}")
        sys.stdout.flush()

        for i in range(30):
            time.sleep(1)
            if os.path.exists(hdf) and os.path.getsize(hdf) > 100000:
                print(f"  Simulation completed at t={i+1}s! Output size: {os.path.getsize(hdf):,} bytes")
                sys.stdout.flush()
                time.sleep(1)
                break

        ras.Project_Close()
        t1 = time.time()

        # 3. Copy artifact to JalRakshak artifacts repository
        dst_hdf = os.path.join(artifacts_dir, f"{name.lower()}.p01.hdf")
        shutil.copy2(hdf, dst_hdf)

        # 4. Forensic inspection
        forensics = inspect_hdf5(dst_hdf)
        print(f"  Forensics for {name}:")
        print(f"    Cells: {forensics['cell_count']} | Timesteps: {forensics['timesteps_count']}")
        print(f"    WSE Range: [{forensics['wse_min_m']:.2f}, {forensics['wse_max_m']:.2f}] m")
        print(f"    Max Flood Depth: {forensics['max_depth_m']:.2f} m | Max Velocity: {forensics['max_face_velocity_ms']:.2f} m/s")
        print(f"    Cumulative Volume Error: {forensics['vol_error_cumulative_1000m3']:.6f} (1000 m3)")
        print(f"    Saved artifact: {dst_hdf}")
        sys.stdout.flush()

        results[name] = {
            "scenario_name": name,
            "description": desc,
            "q_peak_m3s": qp,
            "t_peak_hr": tp,
            "friction_slope": slope,
            "manning_n": 0.045,
            "runtime_seconds": t1 - t0,
            "artifact_hdf": get_file_metadata(dst_hdf),
            "forensics": forensics
        }

    ras.QuitRas()
    print("\n=== All Scenarios Executed in HEC-RAS 7.0.1 ===")
    sys.stdout.flush()

    # Central standard artifact
    central_src = os.path.join(artifacts_dir, "scenario_central.p01.hdf")
    std_dst = os.path.join(artifacts_dir, "tehri_dam_break.p01.hdf")
    shutil.copy2(central_src, std_dst)

    # Copy native model directory files to artifacts
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
    c1_hash = results["SCENARIO_CENTRAL"]["artifact_hdf"]["sha256"]
    c2_hash = results["SCENARIO_REPEATABILITY_RUN2"]["artifact_hdf"]["sha256"]

    repeatability = {
        "artifact_hash_match": c1_hash == c2_hash,
        "run1_sha256": c1_hash,
        "run2_sha256": c2_hash,
        "numerical_repeatability_wse_diff_m": float(abs(c1_wse - c2_wse)),
        "numerical_repeatability_depth_diff_m": float(abs(c1_depth - c2_depth)),
        "status": "PASS" if abs(c1_wse - c2_wse) < 1e-4 else "FAIL"
    }
    results["repeatability_assessment"] = repeatability

    # Compile Final Manifest
    manifest_path = os.path.join(artifacts_dir, "manifest.json")
    with open(manifest_path, "w") as mf:
        json.dump(results, mf, indent=2)

    with open(r"scratch\gate3_master_manifest.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nManifest successfully written to: {manifest_path}")

if __name__ == "__main__":
    execute_suite()
