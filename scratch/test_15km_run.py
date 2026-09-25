"""
15 km Tehri Pilot Model Builder and Runner based on verified Gate 2 Architecture
"""
import os
import sys
import shutil
import hashlib
import json
import time
import datetime
import subprocess
import rasterio
from rasterio.windows import from_bounds
import numpy as np
import h5py
import comtypes.client

def compute_sha256(filepath):
    if not os.path.exists(filepath): return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536): h.update(chunk)
    return h.hexdigest()

def run_15km_tehri_scenario(target_dir, scenario="CENTRAL", cell_spacing=100.0, friction_slope=0.005, manning=0.045, sim_hours=4):
    print(f"\n=======================================================")
    print(f"Building and Executing 15 km Tehri Scenario: {scenario}")
    print(f"Target: {target_dir} | Spacing: {cell_spacing}m | Slope: {friction_slope}")
    print(f"=======================================================")
    sys.stdout.flush()

    os.makedirs(target_dir, exist_ok=True)
    terrain_dir = os.path.join(target_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    # 1. Terrain
    src_dem = r"data\tehri\derived\tehri_pilot_utm44n_25m.tif"
    dst_tif = os.path.join(terrain_dir, "TehriTerrain.tif")
    dst_prj = os.path.join(terrain_dir, "TehriTerrain.prj")
    dst_hdf = os.path.join(terrain_dir, "TehriTerrain.hdf")

    terr_min_x, terr_max_x = 255000.0, 262000.0
    terr_min_y, terr_max_y = 3349000.0, 3365000.0

    with rasterio.open(src_dem) as src:
        win = from_bounds(terr_min_x, terr_min_y, terr_max_x, terr_max_y, src.transform)
        win_transform = rasterio.windows.transform(win, src.transform)
        arr = src.read(1, window=win)
        meta = src.meta.copy()
        meta.update({"height": arr.shape[0], "width": arr.shape[1], "transform": win_transform})
        with rasterio.open(dst_tif, "w", **meta) as dst:
            dst.write(arr, 1)

    utm_wkt = 'PROJCS["WGS_1984_UTM_Zone_44N",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",81.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
    with open(dst_prj, "w") as f:
        f.write(utm_wkt)

    print("Compiling Terrain.hdf via RasProcess.exe...")
    sys.stdout.flush()
    ps_cmd = f"""
    [System.Reflection.Assembly]::LoadFrom('C:\\Program Files (x86)\\HEC\\HEC-RAS\\7.0.1\\RasProcess.exe') | Out-Null
    $cmd = New-Object RasProcess.CreateTerrainCommand
    $cmd.PrjFile = '{dst_prj}'
    $cmd.OutputFile = '{dst_hdf}'
    $cmd.InputFiles = [System.Collections.Generic.List[string]]@('{dst_tif}')
    $cmd.Units = 'SI'
    $cmd.UseStitches = $false
    $cmd.Execute($null)
    """
    res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_cmd], capture_output=True, text=True)
    if not os.path.exists(dst_hdf):
        raise RuntimeError(f"Terrain HDF failed: {res.stderr} {res.stdout}")
    print(f"Terrain HDF created: {dst_hdf} ({os.path.getsize(dst_hdf):,} bytes)")
    sys.stdout.flush()

    # 2. Geometry Grid Points (15 km canyon reach from Tehri 3364000 to Koteshwar 3350000)
    mesh_min_x, mesh_max_x = 256500.0, 260500.0
    mesh_min_y, mesh_max_y = 3350000.0, 3364000.0
    mesh_xs = np.arange(mesh_min_x + cell_spacing, mesh_max_x - cell_spacing, cell_spacing)
    mesh_ys = np.arange(mesh_min_y + cell_spacing, mesh_max_y - cell_spacing, cell_spacing)
    
    grid_points = []
    for y in mesh_ys:
        for x in mesh_xs:
            grid_points.append((x, y))
    n_pts = len(grid_points)

    prj_file = os.path.join(target_dir, "TehriSmokeTest.prj")
    g01_file = os.path.join(target_dir, "TehriSmokeTest.g01")
    u01_file = os.path.join(target_dir, "TehriSmokeTest.u01")
    p01_file = os.path.join(target_dir, "TehriSmokeTest.p01")
    rasmap_file = os.path.join(target_dir, "TehriSmokeTest.rasmap")

    with open(prj_file, "w") as f:
        f.write("""Proj Title=Tehri Dam Break Smoke Test
Current Plan=p01
Default Exp/Contr=0.3,0.1
SI Units
Geom File=g01
Unsteady File=u01
Plan File=p01
""")

    with open(g01_file, "w") as f:
        f.write(f"""Geom Title=Tehri 1.5km Canyon Geometry
Program Version=6.00
Viewing Rectangle= {mesh_min_x - 500} , {mesh_max_x + 500} , {mesh_max_y + 500} , {mesh_min_y - 500} 

Storage Area=TehriCanyon     ,258500.0,3357000.0
Storage Area Surface Line= 5 
{mesh_min_x:16.2f}{mesh_min_y:16.2f}                
{mesh_max_x:16.2f}{mesh_min_y:16.2f}                
{mesh_max_x:16.2f}{mesh_max_y:16.2f}                
{mesh_min_x:16.2f}{mesh_max_y:16.2f}                
{mesh_min_x:16.2f}{mesh_min_y:16.2f}                
Storage Area Type= 1 
Storage Area Area=
Storage Area Min Elev=
Storage Area Is2D=-1
Storage Area Point Generation Data=,,{int(cell_spacing)},{int(cell_spacing)}
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
Storage Area Mannings={manning:.4f}

BC Line Name=DSNormalDepth
BC Line Storage Area=TehriCanyon     
BC Line Start Position= {mesh_min_x:16.2f} , {mesh_min_y:16.2f} 
BC Line Middle Position= {(mesh_min_x+mesh_max_x)/2:16.2f} , {mesh_min_y:16.2f} 
BC Line End Position= {mesh_max_x:16.2f} , {mesh_min_y:16.2f} 
BC Line Arc= 3 
{mesh_min_x:16.2f}{mesh_min_y:16.2f}{(mesh_min_x+mesh_max_x)/2:16.2f}{mesh_min_y:16.2f}
{mesh_max_x:16.2f}{mesh_min_y:16.2f}
BC Line Text Position= {(mesh_min_x+mesh_max_x)/2:16.2f} , {mesh_min_y:16.2f} 

BC Line Name=UpstreamInflow
BC Line Storage Area=TehriCanyon     
BC Line Start Position= {mesh_min_x:16.2f} , {mesh_max_y:16.2f} 
BC Line Middle Position= {(mesh_min_x+mesh_max_x)/2:16.2f} , {mesh_max_y:16.2f} 
BC Line End Position= {mesh_max_x:16.2f} , {mesh_max_y:16.2f} 
BC Line Arc= 3 
{mesh_min_x:16.2f}{mesh_max_y:16.2f}{(mesh_min_x+mesh_max_x)/2:16.2f}{mesh_max_y:16.2f}
{mesh_max_x:16.2f}{mesh_max_y:16.2f}
BC Line Text Position= {(mesh_min_x+mesh_max_x)/2:16.2f} , {mesh_max_y:16.2f} 
""")

    # Hydrograph
    times_hr = np.arange(0, sim_hours + 0.25, 0.25)
    if scenario == "MINIMUM":
        q_peak, t_peak, t_base = 28500.0, 3.5, 180.0
    elif scenario == "MAXIMUM":
        q_peak, t_peak, t_base = 115000.0, 1.5, 180.0
    else: # CENTRAL
        q_peak, t_peak, t_base = 65000.0, 2.4, 180.0

    flows = []
    for t in times_hr:
        if t <= t_peak:
            q = t_base + (q_peak - t_base) * ((t / t_peak) ** 2.2)
        else:
            q = t_base + (q_peak - t_base) * np.exp(-0.65 * (t - t_peak))
        flows.append(int(round(q)))

    n_flows = len(flows)
    with open(u01_file, "w") as f:
        f.write(f"""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope={friction_slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=15MIN
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

    with open(p01_file, "w") as f:
        f.write(f"""Plan Title=Tehri Smoke Test 2D Plan
Program Version=6.00
Short Identifier=TehriSmoke2D                                                    
Simulation Date=24SEP2026,0000,24SEP2026,{sim_hours:02d}00
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
Computation Interval=2SEC
Output Interval=15MIN
Instantaneous Interval=15MIN
Mapping Interval=15MIN
Detailed Output Interval=15MIN
2D Equation Set=SWE-ELM
2D Coriolis=False
2D Matrix Solver=PARDISO
2D Only=True
""")

    with open(rasmap_file, "w") as f:
        f.write(f"""<RASMapper>
  <Version>2.0.0</Version>
  <RASProjectionFilename Filename="Terrain\\TehriTerrain.prj" />
  <Geometries Checked="True" Expanded="True">
    <Layer Name="Tehri 1.5km Canyon Geometry" Type="RASGeometry" Filename="TehriSmokeTest.g01.hdf">
      <Layer Type="RASD2FlowArea" Checked="True" />
    </Layer>
  </Geometries>
  <Terrains Checked="True" Expanded="True">
    <Layer Name="Terrain" Type="TerrainLayer" Checked="True" Filename="Terrain\\TehriTerrain.hdf">
      <ResampleMethod>near</ResampleMethod>
      <Surface On="True" />
    </Layer>
  </Terrains>
</RASMapper>
""")

    # 3. COM Execution
    print(f"Opening HEC-RAS 7.0.1 for {prj_file}...")
    sys.stdout.flush()
    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    print(f"Project Opened: {ras.CurrentProjectTitle()}")
    sys.stdout.flush()

    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    print(f"Compute launched. Initial return: {ret}")
    sys.stdout.flush()

    for i in range(180):
        time.sleep(1)
        done = ras.Compute_Complete()
        if done:
            print(f"Simulation completed successfully at t={i+1} seconds!")
            break
        if (i + 1) % 5 == 0:
            print(f"  Computing in progress... ({i+1}s elapsed)")
            sys.stdout.flush()

    ras.Project_Close()
    ras.QuitRas()
    t1 = time.time()
    sys.stdout.flush()

    hdf_out = prj_file.replace(".prj", ".p01.hdf")
    if not os.path.exists(hdf_out):
        raise RuntimeError(f"Native HDF5 output not found: {hdf_out}")
    print(f"Native HDF5 produced: {hdf_out} ({os.path.getsize(hdf_out):,} bytes, SHA-256: {compute_sha256(hdf_out)})")
    return hdf_out, t1 - t0

if __name__ == "__main__":
    work_dir = r"C:\HEC_Work\TehriGate3_Central"
    hdf, dur = run_15km_tehri_scenario(work_dir, scenario="CENTRAL", cell_spacing=100.0)
    print(f"Execution finished in {dur:.2f}s.")
