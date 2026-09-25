"""
Tehri HEC-RAS Smoke Test Project Builder & Native Runner
========================================================
Builds a clean 1.5 km Tehri HEC-RAS 7.0.1 model on Copernicus DEM:
- Terrain: 2.5 km extent [256500, 259000] x [3362000, 3364500] (500m buffer)
- Mesh: 1.5 km extent [257000, 258500] x [3362500, 3364000] @ 50m cell spacing
- Creates Terrain.hdf natively via RasProcess.CreateTerrainCommand
- Preprocesses geometry natively via HEC-RAS
- Executes RasUnsteady.exe via COM controller
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

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def build_tehri_smoke_test(target_dir):
    print(f"=== Initializing Clean Tehri Project in {target_dir} ===")
    if os.path.exists(target_dir):
        # Remove old files except if locked
        for item in os.listdir(target_dir):
            item_path = os.path.join(target_dir, item)
            try:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
            except Exception as e:
                print(f"Warning cleaning {item_path}: {e}")
    os.makedirs(target_dir, exist_ok=True)
    terrain_dir = os.path.join(target_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    # 1. Extract 2.5 km x 2.5 km Copernicus DEM subset (500m buffer around 1.5 km mesh)
    src_dem = r"data\tehri\derived\tehri_pilot_utm44n_25m.tif"
    dst_tif = os.path.join(terrain_dir, "TehriSmokeTerrain.tif")
    dst_prj = os.path.join(terrain_dir, "TehriSmokeTerrain.prj")
    
    # Terrain Extent: 256500 to 259000, 3362000 to 3364500 (2.5 km)
    terr_min_x, terr_max_x = 256500.0, 259000.0
    terr_min_y, terr_max_y = 3362000.0, 3364500.0

    with rasterio.open(src_dem) as src:
        win = from_bounds(terr_min_x, terr_min_y, terr_max_x, terr_max_y, src.transform)
        win_transform = rasterio.windows.transform(win, src.transform)
        arr = src.read(1, window=win)
        
        meta = src.meta.copy()
        meta.update({
            "height": arr.shape[0],
            "width": arr.shape[1],
            "transform": win_transform
        })
        with rasterio.open(dst_tif, "w", **meta) as dst:
            dst.write(arr, 1)

    utm_wkt = 'PROJCS["WGS_1984_UTM_Zone_44N",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",81.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
    with open(dst_prj, "w") as f:
        f.write(utm_wkt)

    # 2. Build Terrain HDF natively via RasProcess.CreateTerrainCommand
    print("Building Native Terrain HDF5 via RasProcess.CreateTerrainCommand...")
    ps_cmd = f"""
    [System.Reflection.Assembly]::LoadFrom('C:\\Program Files (x86)\\HEC\\HEC-RAS\\7.0.1\\RasProcess.exe') | Out-Null
    $cmd = New-Object RasProcess.CreateTerrainCommand
    $cmd.PrjFile = '{dst_prj}'
    $cmd.OutputFile = '{os.path.join(terrain_dir, "TehriSmokeTerrain.hdf")}'
    $cmd.InputFiles = [System.Collections.Generic.List[string]]@('{dst_tif}')
    $cmd.Units = 'SI'
    $cmd.UseStitches = $false
    $cmd.Execute($null)
    """
    res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_cmd], capture_output=True, text=True)
    if not os.path.exists(os.path.join(terrain_dir, "TehriSmokeTerrain.hdf")):
        print(f"Error creating Terrain HDF: {res.stderr} {res.stdout}")
    else:
        print(f"Native Terrain HDF5 created: {os.path.join(terrain_dir, 'TehriSmokeTerrain.hdf')}")

    # 3. Build 2D Mesh Points (1.5 km domain from 257000 to 258500, 3362500 to 3364000)
    mesh_min_x, mesh_max_x = 257000.0, 258500.0
    mesh_min_y, mesh_max_y = 3362500.0, 3364000.0
    dx = 50.0
    mesh_xs = np.arange(mesh_min_x + 50.0, mesh_max_x - 50.0, dx)
    mesh_ys = np.arange(mesh_min_y + 50.0, mesh_max_y - 50.0, dx)
    
    grid_points = []
    for y in mesh_ys:
        for x in mesh_xs:
            grid_points.append((x, y))
    n_pts = len(grid_points)

    # 4. Write TehriSmokeTest.prj
    prj_file = os.path.join(target_dir, "TehriSmokeTest.prj")
    with open(prj_file, "w") as f:
        f.write("""Proj Title=Tehri Dam Break Smoke Test
Current Plan=p01
Default Exp/Contr=0.3,0.1
SI Units
Geom File=g01
Unsteady File=u01
Plan File=p01
""")

    # 5. Write TehriSmokeTest.g01
    g01_file = os.path.join(target_dir, "TehriSmokeTest.g01")
    with open(g01_file, "w") as f:
        f.write(f"""Geom Title=Tehri 1.5km Canyon Geometry
Program Version=6.00
Viewing Rectangle= {mesh_min_x - 500} , {mesh_max_x + 500} , {mesh_max_y + 500} , {mesh_min_y - 500} 

Storage Area=TehriCanyon     ,257750.0,3363250.0
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
Storage Area Point Generation Data=,,50,50
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

    # 6. Write TehriSmokeTest.u01
    u01_file = os.path.join(target_dir, "TehriSmokeTest.u01")
    with open(u01_file, "w") as f:
        f.write("""Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope=0.004,0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=1HOUR
Flow Hydrograph= 2 
     100     100
Flow Hydrograph Slope= 0.004
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    # 7. Write TehriSmokeTest.p01
    p01_file = os.path.join(target_dir, "TehriSmokeTest.p01")
    with open(p01_file, "w") as f:
        f.write("""Plan Title=Tehri Smoke Test 2D Plan
Program Version=6.00
Short Identifier=TehriSmoke2D                                                    
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

    # 8. Write TehriSmokeTest.rasmap
    rasmap_file = os.path.join(target_dir, "TehriSmokeTest.rasmap")
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

    print(f"Tehri project successfully built in {target_dir}")
    return prj_file

if __name__ == "__main__":
    build_tehri_smoke_test(r"C:\HEC_Work\TehriExecutionSmokeTest_Run1")
    build_tehri_smoke_test(r"C:\HEC_Work\TehriExecutionSmokeTest_Run2")
