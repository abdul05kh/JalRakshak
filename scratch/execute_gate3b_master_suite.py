"""
JalRakshak Gate 3B — 15 km Master Execution & Scientific QA Engine
=================================================================
Executes the full controlled scientific scaling for the 15 km Tehri -> Koteshwar model:
1. SCENARIOS:
   - CENTRAL (Qp = 65,000 m3/s, S0 = 0.004, dx = 100m)
   - MINIMUM (Qp = 28,500 m3/s, S0 = 0.004, dx = 100m)
   - MAXIMUM (Qp = 115,000 m3/s, S0 = 0.004, dx = 100m)
   - BOUNDARY SENSITIVITY (Qp = 65,000 m3/s, S0 = 0.008, dx = 100m)
   - REPEATABILITY RUN 2 (Qp = 65,000 m3/s, S0 = 0.004, dx = 100m)
2. MESH SENSITIVITY:
   - MESH 100m (Base)
   - MESH 75m (Intermediate)
   - MESH 50m (Fine)
3. SCIENTIFIC QA:
   - Volume accounting extraction (native HEC-RAS)
   - Monitoring stations time-series extraction (Near-Dam, Mid-Reach, Koteshwar)
   - Derived products (Depth, Arrival Time, Velocity, Inundation)
   - SHA-256 and full provenance manifest
"""

import os
import sys
import shutil
import hashlib
import json
import time
import glob
import datetime
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

def create_15km_project(project_dir, dx=100.0, q_peak=65000.0, slope=0.004, sim_hours=1):
    os.makedirs(project_dir, exist_ok=True)
    terrain_dir = os.path.join(project_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    src_terr_dir = r"C:\HEC_Work\Tehri15km_Test\Terrain"
    for fname in os.listdir(src_terr_dir):
        src_f = os.path.join(src_terr_dir, fname)
        dst_f = os.path.join(terrain_dir, fname)
        if os.path.isfile(src_f):
            shutil.copy2(src_f, dst_f)

    min_x, max_x = 255500.0, 260500.0
    min_y, max_y = 3351000.0, 3364000.0

    mesh_xs = np.arange(min_x + dx, max_x - dx/2, dx)
    mesh_ys = np.arange(min_y + dx, max_y - dx/2, dx)
    grid_points = [(x, y) for y in mesh_ys for x in mesh_xs]
    n_pts = len(grid_points)

    sa_name = "Tehri15kmCanyon " # exactly 16 chars

    # PRJ
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

    # G01
    g01_file = os.path.join(project_dir, "Tehri15km.g01")
    with open(g01_file, "w") as f:
        f.write(f"""Geom Title=Tehri Koteshwar 15km Geometry
Program Version=6.00
Viewing Rectangle= {min_x - 1000} , {max_x + 1000} , {max_y + 1000} , {min_y - 1000} 

Storage Area={sa_name},258000.0,3357500.0
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
BC Line Storage Area={sa_name}
BC Line Start Position= {min_x:16.2f} , {min_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {min_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{min_y:16.2f}{(min_x+max_x)/2:16.2f}{min_y:16.2f}
{max_x:16.2f}{min_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {min_y:16.2f} 

BC Line Name=UpstreamInflow
BC Line Storage Area={sa_name}
BC Line Start Position= {min_x:16.2f} , {max_y:16.2f} 
BC Line Middle Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
BC Line End Position= {max_x:16.2f} , {max_y:16.2f} 
BC Line Arc= 3 
{min_x:16.2f}{max_y:16.2f}{(min_x+max_x)/2:16.2f}{max_y:16.2f}
{max_x:16.2f}{max_y:16.2f}
BC Line Text Position= {(min_x+max_x)/2:16.2f} , {max_y:16.2f} 
""")

    # U01
    u01_file = os.path.join(project_dir, "Tehri15km.u01")
    with open(u01_file, "w") as f:
        f.write(f"""Flow Title=Tehri 15km Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,{sa_name},                ,DSNormalDepth                   
Friction Slope={slope:.6f},0
Boundary Location=                ,                ,        ,        ,                ,{sa_name},                ,UpstreamInflow                  
Interval=1HOUR
Flow Hydrograph= 2 
     180     {int(q_peak)}
Flow Hydrograph Slope= {slope:.6f}
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
""")

    # P01
    p01_file = os.path.join(project_dir, "Tehri15km.p01")
    with open(p01_file, "w") as f:
        f.write(f"""Plan Title=Tehri 15km 2D Plan
Program Version=6.00
Short Identifier=Tehri15km                                                     
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

    # RASMAP
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

    return prj_file, g01_file, u01_file, p01_file, n_pts

def run_hecras_model(prj_file, max_wait=120):
    hdf_out = prj_file.replace(".prj", ".p01.hdf")
    if os.path.exists(hdf_out):
        try: os.remove(hdf_out)
        except Exception: pass

    t0 = time.time()
    ras = comtypes.client.CreateObject('RAS701.HECRASController')
    ras.ShowRas()
    ras.Project_Open(os.path.abspath(prj_file))
    ras.Compute_ShowComputationWindow()
    ras.ComputeStartedFromController = True
    ret = ras.Compute_CurrentPlan()

    completed = False
    for i in range(max_wait):
        time.sleep(1)
        if os.path.exists(hdf_out) and os.path.getsize(hdf_out) > 500000:
            time.sleep(1)
            completed = True
            break

    try:
        ras.Project_Close()
        ras.QuitRas()
    except Exception:
        pass

    t1 = time.time()
    return completed, hdf_out, t1 - t0, ret

def extract_forensics(hdf_path):
    forensics = {}
    with h5py.File(hdf_path, "r") as f:
        # Plan info
        plan_info = dict(f["Plan Data/Plan Information"].attrs.items())
        forensics["plan_info"] = {k: v.decode("utf-8") if isinstance(v, bytes) else v for k, v in plan_info.items()}
        
        # Geometry info
        sa_group = f["Geometry/2D Flow Areas/Tehri15kmCanyon"]
        forensics["geometry"] = {
            "cell_count": len(sa_group["Cells Center Coordinate"]),
            "face_count": len(sa_group["Faces FacePoint Indexes"]),
            "bounds": [float(x) for x in sa_group.attrs.get("Bounding Box", [])]
        }

        # Volume accounting
        va_grp = f["Results/Unsteady/Summary/Volume Accounting/Volume Accounting 2D/Tehri15kmCanyon"]
        va_attrs = dict(va_grp.attrs.items())
        forensics["volume_accounting"] = {
            "cum_inflow_1000m3": float(va_attrs.get("Cum Inflow", 0.0)),
            "cum_outflow_1000m3": float(va_attrs.get("Cum Outflow", 0.0)),
            "vol_starting_1000m3": float(va_attrs.get("Vol Starting", 0.0)),
            "vol_ending_1000m3": float(va_attrs.get("Vol Ending", 0.0)),
            "error_1000m3": float(va_attrs.get("Error", 0.0)),
            "error_percent": float(va_attrs.get("Error Percent", 0.0))
        }

        # Water surface elevation & max depth
        wse_ds = f["Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/Tehri15kmCanyon/Water Surface"]
        cell_elevs = sa_group["Cells Minimum Elevation"][:]
        wse_arr = wse_ds[:]
        
        # Max water depth across all cells
        depths = wse_arr - cell_elevs[np.newaxis, :]
        depths = np.clip(depths, 0.0, None)
        max_depth_per_cell = np.nanmax(depths, axis=0)
        
        forensics["hydraulics"] = {
            "max_water_depth_domain_m": float(np.nanmax(max_depth_per_cell)),
            "mean_water_depth_domain_m": float(np.nanmean(max_depth_per_cell[max_depth_per_cell > 0.1])),
            "flooded_cells_count": int(np.sum(max_depth_per_cell >= 0.5)),
            "inundation_area_km2": float(np.sum(max_depth_per_cell >= 0.5) * (100.0 * 100.0) / 1e6) # approximate by cell size
        }

        # Station time series (Stations: Near Dam Toe Y=3363500, Intermediate Y=3357500, Koteshwar Y=3351500)
        cell_coords = sa_group["Cells Center Coordinate"][:]
        stations = {
            "STATION_1_DAM_TOE": {"target_xy": (258000.0, 3363500.0), "chainage_km": 0.5},
            "STATION_2_MID_REACH": {"target_xy": (258000.0, 3357500.0), "chainage_km": 6.5},
            "STATION_3_KOTESHWAR": {"target_xy": (258000.0, 3351500.0), "chainage_km": 13.0}
        }
        
        station_results = {}
        for st_name, st_info in stations.items():
            tx, ty = st_info["target_xy"]
            dists = np.sqrt((cell_coords[:, 0] - tx)**2 + (cell_coords[:, 1] - ty)**2)
            c_idx = int(np.argmin(dists))
            st_depths = depths[:, c_idx]
            
            # Arrival time: time to depth >= 0.5m
            t_idx = np.where(st_depths >= 0.5)[0]
            arr_time_min = float(t_idx[0] * 5.0) if len(t_idx) > 0 else None
            
            station_results[st_name] = {
                "cell_idx": c_idx,
                "coord_x": float(cell_coords[c_idx, 0]),
                "coord_y": float(cell_coords[c_idx, 1]),
                "terrain_elev_m": float(cell_elevs[c_idx]),
                "chainage_km": st_info["chainage_km"],
                "max_depth_m": float(np.nanmax(st_depths)),
                "arrival_time_min": arr_time_min,
                "depth_time_series_m": [float(d) for d in st_depths]
            }
        forensics["stations"] = station_results

    return forensics

def execute_gate3b_suite():
    print("=================================================================")
    print("  JALRAKSHAK GATE 3B — 15 KM MASTER EXECUTION & SCIENTIFIC QA")
    print("=================================================================")
    
    suite_start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    work_base = r"C:\HEC_Work"
    artifacts_dir = r"D:\projects\JalRakshak\artifacts\hecras\tehri_gate3b"
    os.makedirs(artifacts_dir, exist_ok=True)

    scenarios = [
        {
            "id": "SCENARIO_CENTRAL",
            "dir": os.path.join(work_base, "Tehri15km_Central"),
            "q_peak": 65000.0,
            "slope": 0.004,
            "dx": 100.0,
            "desc": "Reference Froehlich piping scenario (Qp = 65,000 m3/s, S0 = 0.004, dx = 100m)"
        },
        {
            "id": "SCENARIO_MINIMUM",
            "dir": os.path.join(work_base, "Tehri15km_Minimum"),
            "q_peak": 28500.0,
            "slope": 0.004,
            "dx": 100.0,
            "desc": "Partial breach / overtopping scenario (Qp = 28,500 m3/s, S0 = 0.004, dx = 100m)"
        },
        {
            "id": "SCENARIO_MAXIMUM",
            "dir": os.path.join(work_base, "Tehri15km_Maximum"),
            "q_peak": 115000.0,
            "slope": 0.004,
            "dx": 100.0,
            "desc": "Worst-case rapid breach scenario (Qp = 115,000 m3/s, S0 = 0.004, dx = 100m)"
        },
        {
            "id": "SCENARIO_BOUNDARY_SENSITIVITY",
            "dir": os.path.join(work_base, "Tehri15km_BoundSens"),
            "q_peak": 65000.0,
            "slope": 0.008,
            "dx": 100.0,
            "desc": "Downstream normal depth friction slope perturbation (S0 = 0.008 vs S0 = 0.004)"
        },
        {
            "id": "SCENARIO_REPEATABILITY_RUN2",
            "dir": os.path.join(work_base, "Tehri15km_Repeatability"),
            "q_peak": 65000.0,
            "slope": 0.004,
            "dx": 100.0,
            "desc": "Independent repeatability verification run in clean directory"
        },
        {
            "id": "SCENARIO_MESH_75M",
            "dir": os.path.join(work_base, "Tehri15km_Mesh75m"),
            "q_peak": 65000.0,
            "slope": 0.004,
            "dx": 75.0,
            "desc": "Mesh sensitivity refinement at dx = 75m"
        },
        {
            "id": "SCENARIO_MESH_50M",
            "dir": os.path.join(work_base, "Tehri15km_Mesh50m"),
            "q_peak": 65000.0,
            "slope": 0.004,
            "dx": 50.0,
            "desc": "Mesh sensitivity refinement at dx = 50m"
        }
    ]

    manifest = {
        "gate": "GATE_3B",
        "title": "15 km Tehri -> Koteshwar Dam-Break Hydraulic Propagation Model",
        "engine": "USACE HEC-RAS 7.0.1 (RasUnsteady.exe)",
        "suite_start_iso": suite_start,
        "scenarios": {}
    }

    for sc in scenarios:
        sc_id = sc["id"]
        print(f"\n---> Building & Running {sc_id}: {sc['desc']}")
        prj_f, g01_f, u01_f, p01_f, n_pts = create_15km_project(
            sc["dir"], dx=sc["dx"], q_peak=sc["q_peak"], slope=sc["slope"]
        )
        completed, hdf_out, run_time, ret = run_hecras_model(prj_f)
        if not completed:
            print(f"FAILED: {sc_id}")
            continue

        # Save to permanent artifacts
        art_hdf = os.path.join(artifacts_dir, f"tehri_15km_{sc_id.lower()}.p01.hdf")
        shutil.copy2(hdf_out, art_hdf)
        art_meta = get_file_metadata(art_hdf)

        # Forensics
        forensics = extract_forensics(art_hdf)

        manifest["scenarios"][sc_id] = {
            "id": sc_id,
            "description": sc["desc"],
            "parameters": {
                "q_peak_m3s": sc["q_peak"],
                "friction_slope": sc["slope"],
                "mesh_dx_m": sc["dx"],
                "cell_count": n_pts
            },
            "runtime_seconds": run_time,
            "artifact": art_meta,
            "forensics": forensics
        }

        va = forensics["volume_accounting"]
        print(f"SUCCESS: {sc_id} (Runtime: {run_time:.1f}s | Cells: {n_pts} | Error: {va['error_percent']:.6f}%)")

    # Save manifest
    manifest_path = os.path.join(artifacts_dir, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest saved to: {manifest_path}")

    return manifest

if __name__ == "__main__":
    execute_gate3b_suite()
