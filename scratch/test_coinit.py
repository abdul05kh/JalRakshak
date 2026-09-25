import comtypes
import comtypes.client
import time
import os
import sys

comtypes.CoInitialize()
prj = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\TehriSmokeTest.prj"
print(f"Opening project with CoInitialize: {prj}")
sys.stdout.flush()

ras = comtypes.client.CreateObject('RAS701.HECRASController')
ras.ShowRas()
ras.Project_Open(prj)
print(f"Project opened: {ras.CurrentProjectTitle()}")
sys.stdout.flush()

ras.Compute_ShowComputationWindow()
ras.ComputeStartedFromController = True
ret = ras.Compute_CurrentPlan()
print(f"Compute return: {ret}")
sys.stdout.flush()

for i in range(20):
    time.sleep(1)
    hdf = prj.replace(".prj", ".p01.hdf")
    if os.path.exists(hdf) and os.path.getsize(hdf) > 100000:
        print(f"Simulation completed at t={i+1}s! Output size: {os.path.getsize(hdf):,} bytes")
        sys.stdout.flush()
        break

ras.Project_Close()
ras.QuitRas()
print("All done!")
comtypes.CoUninitialize()
