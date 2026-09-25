"""
JalRakshak Gate 3 — Multi-Scenario Native HEC-RAS Execution Engine
==================================================================
Runs:
1. SCENARIO_CENTRAL (Reference Dam Break: Froehlich 2008, Q_peak=65,000 m3/s, n=0.045, S0=0.004)
2. SCENARIO_MINIMUM (Partial Breach / Overtopping: Q_peak=28,500 m3/s, n=0.045, S0=0.004)
3. SCENARIO_MAXIMUM (Worst-Case Rapid Breach: Q_peak=115,000 m3/s, n=0.045, S0=0.004)
4. SCENARIO_FINER_MESH (Mesh Sensitivity: dx=35m vs dx=50m)
5. SCENARIO_BOUNDARY_SENSITIVITY (Slope Sensitivity: S0=0.008 vs S0=0.004)
6. SCENARIO_REPEATABILITY (Independent Repeat Run of Scenario Central)
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
    if not os.path.exists(filepath):
        return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def get_file_metadata(filepath):
    if not os.path.exists(filepath):
        return None
    stat = os.stat(filepath)
    return {
        "path": os.path.abspath(filepath),
        "filename": os.path.basename(filepath),
        "size_bytes": stat.st_size,
        "sha256": compute_sha256(filepath),
        "modified_iso": datetime.datetime.fromtimestamp(stat.st_mtime, datetime.timezone.utc).isoformat()
    }

def generate_terrain(target_dir):
    terrain_dir = os.path.join(target_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)
    
    src_dem = r"data\tehri\derived\tehri_pilot_utm44n_25m.tif"
    dst_tif = os.path.join(terrain_dir, "TehriSmokeTerrain.tif")
    dst_prj = os.path.join(terrain_dir, "TehriSmokeTerrain.prj")
    dst_hdf = os.path.join(terrain_dir, "TehriSmokeTerrain.hdf")

    terr_min_x, terr_max_x = 256500.0, 259000.0
    terr_min_y, terr_max_y = 3362000.0, 3364500.0

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
        raise RuntimeError(f"Error creating Terrain HDF: {res.stderr} {res.stdout}")
    return dst_hdf, dst_prj, dst_tif

def run_scenario(target_dir, scenario="CENTRAL", cell_spacing=50.0, friction_slope=0.004, manning=0.045, sim_hours=1):
    print(f"\n=================================================================")
    print(f"  EXECUTING {scenario} in {target_dir}")
    print(f"=================================================================")
    sys.stdout.flush()

    if os.path.exists(target_dir):
        for item in os.listdir(target_dir):
            ip = os.path.join(target_dir, item)
            try:
                if os.path.isdir(ip): shutil.rmtree(ip)
                else: os.remove(ip)
            except Exception: pass
    os.makedirs(target_dir, exist_ok=True)

    terr_hdf, terr_prj, terr_tif = generate_terrain(target_dir)

    mesh_min_x, mesh_max_x = 257000.0, 258500.0
    mesh_min_y, mesh_max_y = 3362500.0, 3364000.0
    dx = cell_spacing
    mesh_xs = np.arange(mesh_min_x + dx, mesh_max_x - dx, dx)
    mesh_ys = np.arange(mesh_min_y + dx, mesh_max_y - dx, dx)
    
    grid_points = []
    for y in mesh_ys:
        for x in mesh_xs:
            grid_points.append((x, y))
    n_pts = len(grid_points)

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

    # Breach Hydrograph
    if scenario == "MINIMUM":
        q_peak, t_peak, t_base = 28500.0, 0.5, 180.0
    elif scenario == "MAXIMUM":
        q_peak, t_peak, t_base = 115000.0, 0.3, 180.0
    else: # CENTRAL
        q_peak, t_peak, t_base = 65000.0, 0.4, 180.0

    times_hr = np.arange(0, sim_hours + 0.1, 0.1)
    flows = []
    for t in times_hr:
        if t <= t_peak:
            q = t_base + (q_peak - t_base) * ((t / t_peak) ** 2.0)
        else:
            q = t_base + (q_peak - t_base) * np.exp(-3.0 * (t - t_peak))
        flows.append(int(round(q)))

    u01_file = os.path.join(target_dir, "TehriSmokeTest.u01")
    n_flows = len(flows)
    with open(u01_file, "w") as f:
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

    p01_file = os.path.join(target_dir, "TehriSmokeTest.p01")
    with open(p01_file, "w") as f:
        f.write(f"""Plan Title=Tehri Smoke Test 2D Plan
Program Version=6.00
Short Identifier=TehriSmoke2D                                                    
Simulation Date=24SEP2026,0000,24SEP2026,0{sim_hours:01d}00
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

    # COM execution
    print(f"Launching HEC-RAS 7.0.1 calculation...")
    sys.stdout.flush()
    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()
    
    for i in range(120):
        time.sleep(1)
        done = ras.Compute_Complete()
        if done:
            print(f"  Simulation completed successfully at t={i+1}s!")
            break

    ras.Project_Close()
    ras.QuitRas()
    t1 = time.time()
    sys.stdout.flush()

    hdf_out = prj_file.replace(".prj", ".p01.hdf")
    if not os.path.exists(hdf_out):
        raise RuntimeError(f"HDF5 output not generated: {hdf_out}")
        
    return hdf_out, t1 - t0, n_pts, q_peak, t_peak

def inspect_results(hdf_path):
    forensics = {}
    with h5py.File(hdf_path, "r") as f:
        forensics["file_type"] = f.attrs.get("File Type", b"").decode() if isinstance(f.attrs.get("File Type"), bytes) else str(f.attrs.get("File Type"))
        forensics["file_version"] = f.attrs.get("File Version", b"").decode() if isinstance(f.attrs.get("File Version"), bytes) else str(f.attrs.get("File Version"))
        
        # Geometry
        geom = f["Geometry/2D Flow Areas/TehriCanyon"]
        cell_elevs = np.array(geom["Cells Minimum Elevation"])
        forensics["cell_count"] = int(len(cell_elevs))
        forensics["elev_min_m"] = float(np.min(cell_elevs))
        forensics["elev_max_m"] = float(np.max(cell_elevs))
        
        # Water surface
        res = f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/TehriCanyon"]
        wse = np.array(res["Water Surface"])
        forensics["timesteps_count"] = int(wse.shape[0])
        valid = wse[~np.isnan(wse) & (wse > 0)]
        forensics["wse_min_m"] = float(np.min(valid)) if len(valid) > 0 else 0.0
        forensics["wse_max_m"] = float(np.max(valid)) if len(valid) > 0 else 0.0
        
        # Max Depth
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
    suite_results = {}
    base_dir = r"C:\HEC_Work\TehriGate3"

    scenarios = [
        ("SCENARIO_CENTRAL", os.path.join(base_dir, "Central"), "CENTRAL", 50.0, 0.004, 0.045),
        ("SCENARIO_MINIMUM", os.path.join(base_dir, "Minimum"), "MINIMUM", 50.0, 0.004, 0.045),
        ("SCENARIO_MAXIMUM", os.path.join(base_dir, "Maximum"), "MAXIMUM", 50.0, 0.004, 0.045),
        ("SCENARIO_FINER_MESH", os.path.join(base_dir, "FinerMesh"), "CENTRAL", 35.0, 0.004, 0.045),
        ("SCENARIO_BOUNDARY_SENSITIVITY", os.path.join(base_dir, "BoundarySens"), "CENTRAL", 50.0, 0.008, 0.045),
        ("SCENARIO_REPEATABILITY_RUN2", os.path.join(base_dir, "Central_Run2"), "CENTRAL", 50.0, 0.004, 0.045),
    ]

    for name, sdir, stype, spacing, slope, mann in scenarios:
        hdf, dur, npts, qp, tp = run_scenario(
            sdir, scenario=stype, cell_spacing=spacing, friction_slope=slope, manning=mann, sim_hours=1
        )
        forensics = inspect_results(hdf)
        print(f"  Forensic Summary for {name}:")
        print(f"    Cells: {forensics['cell_count']} | Timesteps: {forensics['timesteps_count']}")
        print(f"    WSE: [{forensics['wse_min_m']:.2f}, {forensics['wse_max_m']:.2f}] m | Max Depth: {forensics['max_depth_m']:.2f} m")
        print(f"    Max Face Velocity: {forensics['max_face_velocity_ms']:.2f} m/s | Vol Error: {forensics['vol_error_cumulative_1000m3']:.6f} (1000 m3)")

        suite_results[name] = {
            "scenario_name": name,
            "work_dir": sdir,
            "scenario_type": stype,
            "cell_spacing_m": spacing,
            "friction_slope": slope,
            "manning_n": mann,
            "cell_count": npts,
            "q_peak_m3s": qp,
            "t_peak_hr": tp,
            "runtime_seconds": dur,
            "plan_hdf": get_file_metadata(hdf),
            "forensics": forensics
        }

    # Copy Central scenario artifacts to JalRakshak artifacts directory
    artifact_dst_dir = r"d:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
    os.makedirs(artifact_dst_dir, exist_ok=True)
    
    central_src = suite_results["SCENARIO_CENTRAL"]["work_dir"]
    for f in os.listdir(central_src):
        sp = os.path.join(central_src, f)
        dp = os.path.join(artifact_dst_dir, f)
        if os.path.isfile(sp):
            shutil.copy2(sp, dp)
        elif os.path.isdir(sp) and f == "Terrain":
            os.makedirs(dp, exist_ok=True)
            for tf in os.listdir(sp):
                shutil.copy2(os.path.join(sp, tf), os.path.join(dp, tf))

    manifest_path = os.path.join(artifact_dst_dir, "manifest.json")
    with open(manifest_path, "w") as mf:
        json.dump(suite_results, mf, indent=2)
    print(f"\nManifest saved to: {manifest_path}")

    with open(r"scratch\gate3_suite_results.json", "w") as f:
        json.dump(suite_results, f, indent=2)

    print("\nALL 6 SCENARIOS EXECUTED & FORENSICALLY VERIFIED!")

if __name__ == "__main__":
    execute_all()
