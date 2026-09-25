"""
JalRakshak Gate 3B — 15 km Full Model Builder & Test Runner
===========================================================
Constructs and runs the full 15 km Tehri -> Koteshwar HEC-RAS 7.0.1 model.
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

def build_and_run_15km(project_dir=r"C:\HEC_Work\Tehri15km_Central", dx=100.0, q_peak=65000.0, slope=0.004):
    os.makedirs(project_dir, exist_ok=True)
    terrain_dir = os.path.join(project_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    # Copy terrain
    src_terr_dir = r"C:\HEC_Work\Tehri15km_Test\Terrain"
    shutil.copy2(os.path.join(src_terr_dir, "Tehri15kmTerrain.tif"), os.path.join(terrain_dir, "Tehri15kmTerrain.tif"))
    shutil.copy2(os.path.join(src_terr_dir, "Tehri15kmTerrain.prj"), os.path.join(terrain_dir, "Tehri15kmTerrain.prj"))
    shutil.copy2(os.path.join(src_terr_dir, "Tehri15kmTerrain.hdf"), os.path.join(terrain_dir, "Tehri15kmTerrain.hdf"))

    min_x, max_x = 255500.0, 260500.0
    min_y, max_y = 3351000.0, 3364000.0

    # Grid points with dx padding from perimeter
    mesh_xs = np.arange(min_x + dx, max_x - dx/2, dx)
    mesh_ys = np.arange(min_y + dx, max_y - dx/2, dx)
    grid_points = [(x, y) for y in mesh_ys for x in mesh_xs]
    n_pts = len(grid_points)
    print(f"Building 15km model with dx={dx}m: {n_pts} grid points across {min_x}..{max_x} x {min_y}..{max_y}")

    # 1. PRJ
    prj_file = os.path.join(project_dir, "Tehri15km.prj")
    with open(prj_file, "w") as f:
        f.write("""Proj Title=Tehri to Koteshwar 15km Model
Current Plan=p01
Default Exp/Contr=0.3,0.1
SI Units
Geom File=g01
Unsteady File=u01
Plan File=p01
""")

    # 2. G01
    g01_file = os.path.join(project_dir, "Tehri15km.g01")
    with open(g01_file, "w") as f:
        f.write(f"""Geom Title=Tehri Koteshwar 15km Geometry
Program Version=6.00
Viewing Rectangle= {min_x - 1000} , {max_x + 1000} , {max_y + 1000} , {min_y - 1000} 

Storage Area=TehriKoteshwarReach,258000.0,3357500.0
Storage Area Surface Line= 5 
{min_x:16.2f}{min_y:16.2f}                
{max_x:16.2f}{min_y:16.2f}                
{max_x:16.2f}{max_y:16.2f}                
{min_x:16.2f}{max_y:16.2f}                
{min_x:16.2f}{min_y:16.2f}                
Storage Area Type= 1 
Storage Area Area=
Storage Area Min Elev=
Storage Area Is2D=-1
Storage Area Point Generation Data=,,{int(dx)},{int(dx)}
Storage Area 2D Points= {n_pts} 
""")
        for i in range(0, n_pts, 2):
            if i + 1 < n_pts:
                p1, p2 = grid_points[i], grid_points[i+1]
                f.write(f"{p1[0]:16.2f}{p1[1]:16.2f}{p2[0]:16.2f}{p2[1]:16.2f}\n")
            else:
                p1 = grid_points[i]
                f.write(f"{p1[0]:16.2f}{p1[1]:16.2f}\n")
        f.write(f"""Storage Area 2D PointsPerimeterTime=24Sep2026 00:00:00
Storage Area Mannings=0.045

BC Line Name=DSNormalDepth
BC Line Storage Area=TehriKoteshwarReach
BC Line Start Position= {min_x:16.2f} , {min_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {min_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{min_y:16.2f}{(min_x+max_x)/2:16.2f}{min_y:16.2f}
{max_x:16.2f}{min_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 

BC Line Name=UpstreamInflow
BC Line Storage Area=TehriKoteshwarReach
BC Line Start Position= {min_x:16.2f} , {max_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {max_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{max_y:16.2f}{(min_x+max_x)/2:16.2f}{max_y:16.2f}
{max_x:16.2f}{max_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
""")

    # 3. U01
    u01_file = os.path.join(project_dir, "Tehri15km.u01")
    with open(u01_file, "w") as f:
        f.write(f"""Flow Title=Tehri 15km Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriKoteshwarReach,                ,DSNormalDepth                   
Friction Slope={slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriKoteshwarReach,                ,UpstreamInflow                  
Interval=1HOUR
Flow Hydrograph= 2 
     180     {int(q_peak)}
Flow Hydrograph Slope= {slope:.6f}
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    # 4. P01
    p01_file = os.path.join(project_dir, "Tehri15km.p01")
    with open(p01_file, "w") as f:
        f.write("""Plan Title=Tehri 15km 2D Plan
Program Version=6.00
Short Identifier=Tehri15km                                                     
Simulation Date=24SEP2026,0000,24SEP2026,0100
Geom File=g01
Flow File=u01
Subcritical Flow
K Sum by GR= 0 
Std Step Tol= 0.01 
Critical Tol= 0.01 
Num of Std Step Trials= 20 
Max Error Tol= 0.3 
Flow Tol Ratio= 0.001 
Split Flow NTrial= 30 
Split Flow Tol= 0.02 
Split Flow Ratio= 0.02 
Log Output Level= 0 
Friction Slope Method= 1 
Unsteady Friction Slope Method= 2 
Run HTab=-1 
Run UNet=-1 
Run Sediment= 0 
Run PostProcess=-1 
Run WQNet= 0 
Run RASMapper= 0 
UNET Theta= 1 
UNET Theta Warmup= 1 
UNET ZTol= 0.02 
UNET ZSATol= 0.02 
UNET MxIter= 20 
Computation Interval=1SEC
Output Interval=5MIN
Instantaneous Interval=5MIN
Mapping Interval=5MIN
Detailed Output Interval=5MIN
2D Equation Set=SWE-ELM
2D Coriolis=False
2D Matrix Solver=PARDISO
2D Only=True
""")

    # 5. RASMAP
    rasmap_file = os.path.join(project_dir, "Tehri15km.rasmap")
    with open(rasmap_file, "w") as f:
        f.write(f"""<RASMapper>
  <Version>2.0.0</Version>
  <RASProjectionFilename Filename="Terrain\\Tehri15kmTerrain.prj" />
  <Geometries Checked="True" Expanded="True">
    <Layer Name="Tehri Koteshwar 15km Geometry" Type="RASGeometry" Filename="Tehri15km.g01.hdf">
      <Layer Type="RASD2FlowArea" Checked="True" />
    </Layer>
  </Geometries>
  <Terrains Checked="True" Expanded="True">
    <Layer Name="Terrain" Type="TerrainLayer" Checked="True" Filename="Terrain\\Tehri15kmTerrain.hdf">
      <ResampleMethod>near</ResampleMethod>
      <Surface On="True" />
    </Layer>
  </Terrains>
</RASMapper>
""")

    # Clean old results
    hdf_out = os.path.join(project_dir, "Tehri15km.p01.hdf")
    if os.path.exists(hdf_out): os.remove(hdf_out)

    print("Launching HEC-RAS 7.0.1 for 15km Model...", flush=True)
    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    print(f"Compute returned: {ret}", flush=True)

    completed = False
    for i in range(45):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
            print(f"15km Simulation completed at t={i+1}s! Output size: {os.path.getsize(hdf_out):,} bytes", flush=True)
            time.sleep(1)
            completed = True
            break
        if (i+1) % 5 == 0:
            print(f"Simulating 15km reach in HEC-RAS 7.0.1... ({i+1}s elapsed)", flush=True)

    ras.Project_Close()
    ras.QuitRas()
    t1 = time.time()

    return completed, hdf_out, t1 - t0

if __name__ == "__main__":
    build_and_run_15km(dx=100.0)
