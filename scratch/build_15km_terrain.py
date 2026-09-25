"""
JalRakshak Gate 3B — 15 km Domain Builder & Pilot Test
=====================================================
Builds clean 15 km Tehri -> Koteshwar domain:
- Terrain Extent: [254000, 262000] x [3350000, 3365000] (8 km x 15 km)
- Mesh Extent: [255500, 260500] x [3351000, 3364000] (5 km x 13 km)
"""

import os
import sys
import shutil
import hashlib
import json
import time
import subprocess
import rasterio
from rasterio.windows import from_bounds
import numpy as np

def build_15km_terrain(target_dir):
    os.makedirs(target_dir, exist_ok=True)
    terrain_dir = os.path.join(target_dir, "Terrain")
    os.makedirs(terrain_dir, exist_ok=True)

    src_dem = r"data\tehri\derived\tehri_pilot_utm44n_25m.tif"
    dst_tif = os.path.join(terrain_dir, "Tehri15kmTerrain.tif")
    dst_prj = os.path.join(terrain_dir, "Tehri15kmTerrain.prj")
    dst_hdf = os.path.join(terrain_dir, "Tehri15kmTerrain.hdf")

    min_x, max_x = 254000.0, 262000.0
    min_y, max_y = 3350000.0, 3365000.0

    with rasterio.open(src_dem) as src:
        win = from_bounds(min_x, min_y, max_x, max_y, src.transform)
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

    print("Building 15km Native Terrain HDF5 via RasProcess.CreateTerrainCommand...")
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
    if os.path.exists(dst_hdf):
        print(f"15km Native Terrain HDF5 created: {dst_hdf} ({os.path.getsize(dst_hdf):,} bytes)")
    else:
        print(f"Error creating Terrain HDF: {res.stderr} {res.stdout}")
    return dst_hdf

if __name__ == "__main__":
    build_15km_terrain(r"C:\HEC_Work\Tehri15km_Test")
