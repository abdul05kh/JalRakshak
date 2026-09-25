"""
Test 1: Terrain Source Fidelity
Verifies that elevation values extracted by the terrain engine match the authoritative Copernicus GLO-30 DSM GeoTIFF.
"""

import os
import json
import pytest
import tifffile
import numpy as np

DSM_PATH = "data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif"
TERRAIN_META_PATH = "frontend/public/terrain/terrain_meta.json"
TERRAIN_BIN_PATH = "frontend/public/terrain/tehri_valley_elevation.bin"

@pytest.fixture(scope="module")
def dsm_context():
    assert os.path.exists(DSM_PATH), f"Authoritative DSM not found at {DSM_PATH}"
    with tifffile.TiffFile(DSM_PATH) as tif:
        page = tif.pages[0]
        data = page.asarray().astype(np.float32)
        scale = page.tags['ModelPixelScaleTag'].value
        tiepoint = page.tags['ModelTiepointTag'].value
    
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
        
    sa_data = np.fromfile(TERRAIN_BIN_PATH, dtype=np.float32).reshape(
        (meta["grid"]["height"], meta["grid"]["width"])
    )
    
    return {
        "full_data": data,
        "sa_data": sa_data,
        "scale": scale,
        "tiepoint": tiepoint,
        "meta": meta
    }

def test_source_fidelity_statistical_sample(dsm_context):
    full_data = dsm_context["full_data"]
    sa_data = dsm_context["sa_data"]
    scale = dsm_context["scale"]
    tiepoint = dsm_context["tiepoint"]
    meta = dsm_context["meta"]
    
    min_lon = float(tiepoint[3])
    max_lat = float(tiepoint[4])
    pixel_dx = float(scale[0])
    pixel_dy = float(scale[1])
    
    sa_min_lon = meta["bounds"]["min_lon"]
    sa_max_lat = meta["bounds"]["max_lat"]
    sa_max_lon = meta["bounds"]["max_lon"]
    sa_min_lat = meta["bounds"]["min_lat"]
    
    # Sample 1000 random points within study area
    np.random.seed(12345)
    lons = np.random.uniform(sa_min_lon + 0.02, sa_max_lon - 0.02, 1000)
    lats = np.random.uniform(sa_min_lat + 0.02, sa_max_lat - 0.02, 1000)
    
    diffs = []
    for lon, lat in zip(lons, lats):
        # Full DSM bilinear
        c_f = (lon - min_lon) / pixel_dx
        r_f = (max_lat - lat) / pixel_dy
        c0_f, r0_f = int(np.floor(c_f)), int(np.floor(r_f))
        c1_f, r1_f = min(c0_f + 1, full_data.shape[1] - 1), min(r0_f + 1, full_data.shape[0] - 1)
        fx_f, fy_f = c_f - c0_f, r_f - r0_f
        z_full = (full_data[r0_f, c0_f]*(1-fx_f) + full_data[r0_f, c1_f]*fx_f)*(1-fy_f) + \
                 (full_data[r1_f, c0_f]*(1-fx_f) + full_data[r1_f, c1_f]*fx_f)*fy_f
                 
        # SA binary grid bilinear
        c_s = (lon - sa_min_lon) / pixel_dx
        r_s = (sa_max_lat - lat) / pixel_dy
        c0_s, r0_s = int(np.floor(c_s)), int(np.floor(r_s))
        c1_s, r1_s = min(c0_s + 1, sa_data.shape[1] - 1), min(r0_s + 1, sa_data.shape[0] - 1)
        fx_s, fy_s = c_s - c0_s, r_s - r0_s
        z_sa = (sa_data[r0_s, c0_s]*(1-fx_s) + sa_data[r0_s, c1_s]*fx_s)*(1-fy_s) + \
               (sa_data[r1_s, c0_s]*(1-fx_s) + sa_data[r1_s, c1_s]*fx_s)*fy_s
               
        diffs.append(abs(z_full - z_sa))
        
    diffs = np.array(diffs)
    max_error = np.max(diffs)
    rmse = np.sqrt(np.mean(diffs**2))
    
    assert max_error < 1e-4, f"Elevation fidelity deviation too high: max error = {max_error}m"
    assert rmse < 1e-5, f"RMSE too high: {rmse}m"
    print(f"Source fidelity verified on 1000 points. Max diff: {max_error:.10e}m, RMSE: {rmse:.10e}m")
