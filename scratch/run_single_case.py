"""
Run a single HEC-RAS scenario cleanly and deterministically
"""
import os
import sys
import shutil
import time
import datetime
import numpy as np
import h5py
import comtypes.client

def run_case(scenario_name="CENTRAL", q_peak=65000.0, t_peak=0.4, slope=0.004, work_dir=r"C:\HEC_Work\TehriGate3_Central"):
    print(f"=== Starting Scenario: {scenario_name} in {work_dir} ===")
    sys.stdout.flush()
    
    os.makedirs(work_dir, exist_ok=True)
    base_src = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    
    # Copy baseline geometry and terrain
    for item in os.listdir(base_src):
        sp = os.path.join(base_src, item)
        dp = os.path.join(work_dir, item)
        if os.path.isdir(sp):
            if os.path.exists(dp): shutil.rmtree(dp)
            shutil.copytree(sp, dp)
        elif not item.endswith(".p01.hdf") and not item.endswith(".dss") and not item.endswith(".computeMsgs.txt") and not item.endswith(".bco01") and not item.endswith(".ic.o01"):
            shutil.copy2(sp, dp)

    # Write flow file
    times_hr = np.arange(0, 1.1, 0.1) # 11 time steps (0.0 to 1.0 hr)
    t_base = 180.0
    flows = []
    for t in times_hr:
        if t <= t_peak:
            q = t_base + (q_peak - t_base) * ((t / t_peak) ** 2.0)
        else:
            q = t_base + (q_peak - t_base) * np.exp(-3.5 * (t - t_peak))
        flows.append(int(round(q)))

    u01_file = os.path.join(work_dir, "TehriSmokeTest.u01")
    n_flows = len(flows)
    with open(u01_file, "w") as f:
        f.write(f"""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope={slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=6MIN
Flow Hydrograph= {n_flows} 
""")
        for i in range(0, n_flows, 5):
            chunk = flows[i:i+5]
            f.write(" " + " ".join(f"{int(q):8d}" for q in chunk) + "\n")
        f.write(f"""Flow Hydrograph Slope= {slope:.6f}
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    prj_file = os.path.join(work_dir, "TehriSmokeTest.prj")
    hdf_out = os.path.join(work_dir, "TehriSmokeTest.p01.hdf")
    if os.path.exists(hdf_out): os.remove(hdf_out)

    print(f"Launching HEC-RAS 7.0.1 calculation...")
    sys.stdout.flush()
    t0 = time.time()
    
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    print(f"Compute launched with status: {ret}")
    sys.stdout.flush()

    for i in range(30):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 100000:
            print(f"Simulation completed at t={i+1}s! Output size: {os.path.getsize(hdf_out):,} bytes")
            sys.stdout.flush()
            time.sleep(1)
            break

    ras.Project_Close()
    ras.QuitRas()
    t1 = time.time()
    print(f"Run completed in {t1 - t0:.2f} seconds.")
    sys.stdout.flush()

if __name__ == "__main__":
    sname = sys.argv[1] if len(sys.argv) > 1 else "CENTRAL"
    qp = float(sys.argv[2]) if len(sys.argv) > 2 else 65000.0
    tp = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
    sl = float(sys.argv[4]) if len(sys.argv) > 4 else 0.004
    wdir = sys.argv[5] if len(sys.argv) > 5 else r"C:\HEC_Work\TehriGate3_Central"
    run_case(sname, qp, tp, sl, wdir)
