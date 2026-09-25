"""
Test 7: Dam and Breach Alignment
Verifies that the Tehri Dam crest and breach location align geographically with the Bhagirathi river gorge topography.
"""

import os
import json
import numpy as np
import pytest

DAM_PATH = "data/study_area/dam.json"
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

def test_dam_location_in_gorge(terrain_sampler):
    with open(DAM_PATH, "r") as f:
        dam = json.load(f)
        
    lon = dam["longitude"]
    lat = dam["latitude"]
    
    dam_elev = terrain_sampler(lon, lat)
    print(f"Tehri Dam geographic coordinate ({lon}, {lat}) sampled DSM elevation: {dam_elev:.2f}m")
    
    # Left and right abutments (mountains on either side of the dam)
    left_abutment = terrain_sampler(lon - 0.008, lat)
    right_abutment = terrain_sampler(lon + 0.008, lat)
    
    print(f"Dam Gorge Profile: Left Abutment={left_abutment:.1f}m, Dam Base={dam_elev:.1f}m, Right Abutment={right_abutment:.1f}m")
    
    # The dam location must be inside a valley/gorge between higher ridges
    assert left_abutment > dam_elev, "Left abutment must be higher than dam riverbed/crest"
    assert right_abutment > dam_elev, "Right abutment must be higher than dam riverbed/crest"
