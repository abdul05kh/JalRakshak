"""
Test 8: Evacuation Shelter Alignment
Verifies that the Chamba relief shelter and designated evacuation points are placed on verified high ground topography above flood levels.
"""

import os
import json
import numpy as np
import pytest

EVAC_PATH = "data/study_area/evacuation_points.json"
TERRAIN_META_PATH = "frontend/public/terrain/terrain_meta.json"
TERRAIN_BIN_PATH = "frontend/public/terrain/tehri_valley_elevation.bin"

@pytest.fixture
def terrain_sampler():
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
    sa_data = np.fromfile(TERRAIN_BIN_PATH, dtype=np.float32).reshape(
        (meta["grid"]["height"], meta["grid"]["width"])
    )
    
    sa_min_lon = meta["bounds"]["min_lon"]
    sa_max_lat = meta["bounds"]["max_lat"]
    pixel_dx = meta["grid"]["dx"]
    pixel_dy = meta["grid"]["dy"]
    
    def sample(lon, lat):
        c = (lon - sa_min_lon) / pixel_dx
        r = (sa_max_lat - lat) / pixel_dy
        c0, r0 = int(np.floor(c)), int(np.floor(r))
        c1, r1 = min(c0 + 1, sa_data.shape[1] - 1), min(r0 + 1, sa_data.shape[0] - 1)
        fx, fy = c - c0, r - r0
        return float((sa_data[r0, c0]*(1-fx) + sa_data[r0, c1]*fx)*(1-fy) + 
                     (sa_data[r1, c0]*(1-fx) + sa_data[r1, c1]*fx)*fy)
    return sample

def test_chamba_shelter_high_ground(terrain_sampler):
    with open(EVAC_PATH, "r") as f:
        pts = json.load(f)
        
    chamba = next((p for p in pts["features"] if p["properties"]["id"] == "SHELTER-01"), None)
    assert chamba is not None, "Chamba shelter (SHELTER-01) not found in evacuation_points.json"
    
    lon, lat = chamba["geometry"]["coordinates"]
    shelter_elev = terrain_sampler(lon, lat)
    
    print(f"Chamba Shelter coordinate ({lon}, {lat}) DSM elevation: {shelter_elev:.2f}m")
    
    # Valley floor near Tehri/Malidewal is ~600-650m. Chamba is on the ridge at >1500m
    assert shelter_elev > 1400.0, f"Chamba shelter elevation ({shelter_elev}m) is not on high ground ridge (>1400m)"
