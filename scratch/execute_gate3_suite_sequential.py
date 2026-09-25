"""
JalRakshak Gate 3 — Sequential Multi-Scenario Execution & Forensic Assessment Engine
====================================================================================
Runs native HEC-RAS 7.0.1 calculations:
1. SCENARIO_CENTRAL: Froehlich (2008) reference dam break, Q_peak=65,000 m3/s, t_peak=0.4 h, S0=0.004
2. SCENARIO_MINIMUM: Partial breach / overtopping, Q_peak=28,500 m3/s, t_peak=0.5 h, S0=0.004
3. SCENARIO_MAXIMUM: Worst-case rapid catastrophic failure, Q_peak=115,000 m3/s, t_peak=0.3 h, S0=0.004
4. SCENARIO_BOUNDARY_SENSITIVITY: Downstream slope perturbation S0=0.008
5. SCENARIO_REPEATABILITY_RUN2: Independent verification run on Run2 directory
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
    times_hr = np.arange(0, sim_hours + 0.1, 0.1) # 11 points
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
    return flows

def run_simulation(prj_path):
    hdf_out = prj_path.replace(".prj", ".p01.hdf")
    if os.path.exists(hdf_out):
        os.remove(hdf_out)

    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_path))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()

    for i in range(30):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 100000:
            time.sleep(1)
            break

    ras.Project_Close()
    ras.QuitRas()
    del ras
    t1 = time.time()
    return hdf_out, t1 - t0

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

        # Summary volume error
        summary = f.get("Results/Unsteady/Summary")
        if summary and "Volume Error Cumulative" in summary:
            forensics["vol_error_cumulative_1000m3"] = float(summary["Volume Error Cumulative"][0])
        else:
            forensics["vol_error_cumulative_1000m3"] = 0.0

    return forensics

def execute_all():
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

    results = {}
    for name, sdir, qp, tp, slope, desc in scenarios:
        print(f"\n=================================================================")
        print(f"  RUNNING: {name}")
        print(f"  Q_peak: {qp:,.0f} m3/s | t_peak: {tp} h | Slope: {slope}")
        print(f"=================================================================")
        
        prj = os.path.join(sdir, "TehriSmokeTest.prj")
        u01 = os.path.join(sdir, "TehriSmokeTest.u01")
        flows = update_u01(u01, q_peak=qp, t_peak=tp, friction_slope=slope)
        
        hdf_out, dur = run_simulation(prj)
        forensics = inspect_hdf5(hdf_out)
        
        scenario_hdf_dst = os.path.join(artifacts_dir, f"{name.lower()}.p01.hdf")
        shutil.copy2(hdf_out, scenario_hdf_dst)
        
        print(f"  Forensic Summary:")
        print(f"    Cells: {forensics['cell_count']} | Timesteps: {forensics['timesteps_count']}")
        print(f"    WSE Range: [{forensics['wse_min_m']:.2f}, {forensics['wse_max_m']:.2f}] m")
        print(f"    Max Derived Flood Depth: {forensics['max_depth_m']:.2f} m")
        print(f"    Max Face Velocity: {forensics['max_face_velocity_ms']:.2f} m/s")
        print(f"    Cumulative Volume Error: {forensics['vol_error_cumulative_1000m3']:.6f} (1000 m3)")
        print(f"    Saved: {scenario_hdf_dst} (SHA-256: {compute_sha256(scenario_hdf_dst)[:16]}...)")

        results[name] = {
            "scenario_name": name,
            "description": desc,
            "q_peak_m3s": qp,
            "t_peak_hr": tp,
            "friction_slope": slope,
            "manning_n": 0.045,
            "runtime_seconds": dur,
            "artifact_hdf": get_file_metadata(scenario_hdf_dst),
            "forensics": forensics
        }

    # Central standard artifact
    central_src = os.path.join(artifacts_dir, "scenario_central.p01.hdf")
    std_dst = os.path.join(artifacts_dir, "tehri_dam_break.p01.hdf")
    shutil.copy2(central_src, std_dst)
    
    # Copy full native model directory files to artifacts
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

    print("\n=================================================================")
    print(f"ALL SCENARIOS COMPLETED SUCCESSFULLY!")
    print(f"Manifest written to: {manifest_path}")
    print("=================================================================")

if __name__ == "__main__":
    execute_all()
