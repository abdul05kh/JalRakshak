import os, sys, time, glob, datetime, comtypes.client

def test():
    work_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    prj = os.path.join(work_dir, "TehriSmokeTest.prj")
    
    # Remove stale runtime files
    for ext in ["*.u01.hdf", "*.b01", "*.bco01", "*.dss", "*.ic.o01", "*.p01.computeMsgs.txt", "*.x01", "*.p01.hdf"]:
        for f in glob.glob(os.path.join(work_dir, ext)):
            try: os.remove(f)
            except Exception: pass
            
    print(f"Opening project: {prj}", flush=True)
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj))
    print(f"Plan file: {ras.CurrentPlanFile()}", flush=True)
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    print("Calling Compute_CurrentPlan()...", flush=True)
    t0 = time.time()
    ret = ras.Compute_CurrentPlan()
    t1 = time.time()
    print(f"Compute returned: {ret} in {t1-t0:.2f}s", flush=True)
    
    # Wait for p01.hdf
    hdf_out = os.path.join(work_dir, "TehriSmokeTest.p01.hdf")
    for i in range(20):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 100000:
            print(f"HDF5 exists: size={os.path.getsize(hdf_out):,} bytes", flush=True)
            break
            
    ras.Project_Close()
    ras.QuitRas()
    print("Closed cleanly!", flush=True)

if __name__ == "__main__":
    test()
