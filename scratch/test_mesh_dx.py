import os, sys, shutil, time, comtypes.client
import numpy as np

def build_fine_mesh_proper(dx=30.0):
    work_dir = r"C:\HEC_Work\TehriMeshSens"
    artifacts_dir = r"d:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
    os.makedirs(work_dir, exist_ok=True)
    terrain_dir = os.path.join(work_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    # 1. Copy terrain
    src_terr_tif = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\Terrain\TehriSmokeTerrain.tif"
    src_terr_prj = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\Terrain\TehriSmokeTerrain.prj"
    src_terr_hdf = r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\Terrain\TehriSmokeTerrain.hdf"
    shutil.copy2(src_terr_tif, os.path.join(terrain_dir, "TehriSmokeTerrain.tif"))
    shutil.copy2(src_terr_prj, os.path.join(terrain_dir, "TehriSmokeTerrain.prj"))
    shutil.copy2(src_terr_hdf, os.path.join(terrain_dir, "TehriSmokeTerrain.hdf"))

    # Mesh bounds: 257000 to 258500, 3362500 to 3364000
    min_x, max_x = 257000.0, 258500.0
    min_y, max_y = 3362500.0, 3364000.0
    
    mesh_xs = np.arange(min_x + dx, max_x - dx/2, dx)
    mesh_ys = np.arange(min_y + dx, max_y - dx/2, dx)
    grid_points = [(x, y) for y in mesh_ys for x in mesh_xs]
    n_pts = len(grid_points)
    print(f"Generated {n_pts} points for dx={dx}m mesh.")

    prj_file = os.path.join(work_dir, "TehriSmokeTest.prj")
    with open(prj_file, "w") as f:
        f.write("""Proj Title=Tehri Dam Break Smoke Test (Mesh Sens)
Current Plan=p01
Default Exp/Contr=0.3,0.1
SI Units
Geom File=g01
Unsteady File=u01
Plan File=p01
""")

    g01_file = os.path.join(work_dir, "TehriSmokeTest.g01")
    with open(g01_file, "w") as f:
        f.write(f"""Geom Title=Tehri 1.5km Canyon Geometry
Program Version=6.00
Viewing Rectangle= {min_x - 500} , {max_x + 500} , {max_y + 500} , {min_y - 500} 

Storage Area=TehriCanyon     ,257750.0,3363250.0
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
BC Line Storage Area=TehriCanyon     
BC Line Start Position= {min_x:16.2f} , {min_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {min_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{min_y:16.2f}{(min_x+max_x)/2:16.2f}{min_y:16.2f}
{max_x:16.2f}{min_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 

BC Line Name=UpstreamInflow
BC Line Storage Area=TehriCanyon     
BC Line Start Position= {min_x:16.2f} , {max_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {max_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{max_y:16.2f}{(min_x+max_x)/2:16.2f}{max_y:16.2f}
{max_x:16.2f}{max_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
""")

    u01_file = os.path.join(work_dir, "TehriSmokeTest.u01")
    with open(u01_file, "w") as f:
        f.write("""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope=0.004000,0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=1HOUR
Flow Hydrograph= 2 
     180     65000
Flow Hydrograph Slope= 0.004000
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    p01_file = os.path.join(work_dir, "TehriSmokeTest.p01")
    with open(p01_file, "w") as f:
        f.write("""Plan Title=Tehri Smoke Test 2D Plan
Program Version=6.00
Short Identifier=TehriSmokeMesh                                                 
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

    rasmap_file = os.path.join(work_dir, "TehriSmokeTest.rasmap")
    with open(rasmap_file, "w") as f:
        f.write(f"""<RASMapper>
  <Version>2.0.0</Version>
  <RASProjectionFilename Filename="Terrain\\TehriSmokeTerrain.prj" />
  <Geometries Checked="True" Expanded="True">
    <Layer Name="Tehri 1.5km Canyon Geometry" Type="RASGeometry" Filename="TehriSmokeTest.g01.hdf">
      <Layer Type="RASD2FlowArea" Checked="True" />
    </Layer>
  </Geometries>
  <Terrains Checked="True" Expanded="True">
    <Layer Name="Terrain" Type="TerrainLayer" Checked="True" Filename="Terrain\\TehriSmokeTerrain.hdf">
      <ResampleMethod>near</ResampleMethod>
      <Surface On="True" />
    </Layer>
  </Terrains>
</RASMapper>
""")

    # Clean old HDF
    hdf_out = os.path.join(work_dir, "TehriSmokeTest.p01.hdf")
    if os.path.exists(hdf_out): os.remove(hdf_out)

    print(f"Running HEC-RAS 7.0.1 for dx={dx}m mesh ({n_pts} points)...", flush=True)
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    print(f"Compute returned: {ret}", flush=True)

    for i in range(25):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
            print(f"Completed at t={i+1}s! Output size: {os.path.getsize(hdf_out):,} bytes", flush=True)
            time.sleep(1)
            break

    ras.Project_Close()
    ras.QuitRas()

    if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
        dst = os.path.join(artifacts_dir, f"scenario_mesh_sens_{int(dx)}m.p01.hdf")
        shutil.copy2(hdf_out, dst)
        print(f"Saved: {dst}", flush=True)
        return dst
    else:
        print(f"Failed to generate output for dx={dx}m", flush=True)
        return None

if __name__ == "__main__":
    # Test dx=40m (1,369 cells) and dx=35m (1,764 cells)
    build_fine_mesh_proper(dx=40.0)
