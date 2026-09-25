import os, sys, time, glob, datetime, comtypes.client

def test_wait():
    work_dir = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1"
    prj = os.path.join(work_dir, "TehriSmokeTest.prj")
    hdf_out = os.path.join(work_dir, "TehriSmokeTest.p01.hdf")
    
    # Remove old output
    if os.path.exists(hdf_out): os.remove(hdf_out)
    
    print(f"Opening project: {prj}", flush=True)
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    
    print("Calling Compute_CurrentPlan()...", flush=True)
    ret = ras.Compute_CurrentPlan()
    print(f"Compute initiated: {ret}", flush=True)
    
    for i in range(30):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
            print(f"Found {hdf_out}! Size: {os.path.getsize(hdf_out):,} bytes at t={i+1}s", flush=True)
            # Give it 2 more seconds for HEC-RAS to finalize write
            time.sleep(2)
            break
        print(f"Waiting... t={i+1}s", flush=True)
        
    print(f"Final HDF5 Size: {os.path.getsize(hdf_out):,} bytes", flush=True)
    ras.Project_Close()
    ras.QuitRas()
    print("Closed controller cleanly.", flush=True)

if __name__ == "__main__":
    test_wait()
