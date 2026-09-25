"""
Run HEC-RAS Compute via COM Controller and wait for completion
"""
import os
import sys
import time
import datetime
import comtypes.client

def run_compute(prj_path):
    print(f"=== Opening HEC-RAS 7.0.1 for Project: {prj_path} ===")
    start_time = datetime.datetime.now()
    
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(prj_path)
    
    print(f"Project Title:    {ras.CurrentProjectTitle()}")
    print(f"Current Plan:     {ras.CurrentPlanFile()}")
    print(f"Current Geometry: {ras.CurrentGeomFile()}")
    print(f"Current Unsteady: {ras.CurrentUnSteadyFile()}")
    print(f"2D Flow Areas:    {ras.Geometry_Get2DFlowAreas()}")
    
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    
    print(f"[{datetime.datetime.now()}] Invoking Compute_CurrentPlan()...")
    try:
        ret = ras.Compute_CurrentPlan()
        print(f"[{datetime.datetime.now()}] Compute_CurrentPlan returned: {ret}")
    except Exception as e:
        print(f"Compute exception: {e}")
    
    end_time = datetime.datetime.now()
    duration = (end_time - start_time).total_seconds()
    print(f"Computation Duration: {duration:.2f} seconds")
    
    ras.Project_Close()
    ras.QuitRas()
    print("HEC-RAS Controller closed.")

if __name__ == "__main__":
    prj = sys.argv[1] if len(sys.argv) > 1 else r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\TehriSmokeTest.prj"
    run_compute(prj)
