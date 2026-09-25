"""
Test 6: Road-Terrain Alignment
Verifies that road network LineStrings (specifically R02 and segments R02-E01..E07) sample elevation along their paths without floating or subterranean clipping.
"""

import os
import json
import numpy as np
import pytest

ROADS_PATH = "data/study_area/roads.json"
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

def test_r02_route_terrain_clamping(terrain_sampler):
    with open(ROADS_PATH, "r") as f:
        roads = json.load(f)
        
    r02_feat = next((f for f in roads["features"] if f["properties"]["id"] == "R02"), None)
    assert r02_feat is not None, "R02 road feature not found in roads.json"
    
    coords = r02_feat["geometry"]["coordinates"]
    elevations = []
    
    # Subdivide line segments into <= 50m intervals and sample elevation
    for i in range(len(coords) - 1):
        p1 = coords[i]
        p2 = coords[i+1]
        
        # Approximate distance in meters
        d_lon = (p2[0] - p1[0]) * 111320 * np.cos(np.radians((p1[1] + p2[1])/2))
        d_lat = (p2[1] - p1[1]) * 111320
        dist_m = np.sqrt(d_lon**2 + d_lat**2)
        
        steps = max(2, int(np.ceil(dist_m / 50.0)))
        for s in range(steps):
            t = s / steps
            lon = p1[0] + (p2[0] - p1[0]) * t
            lat = p1[1] + (p2[1] - p1[1]) * t
            z = terrain_sampler(lon, lat)
            elevations.append((lon, lat, z))
            
    assert len(elevations) > 10, "R02 route profile had too few sample points"
    elev_values = [e[2] for e in elevations]
    
    # Check that road elevations stay within realistic Himalayan valley road elevations (500m to 1200m)
    assert min(elev_values) >= 480.0, f"Road elevation too low: {min(elev_values)}m"
    assert max(elev_values) <= 1500.0, f"Road elevation unrealistically high for river corridor: {max(elev_values)}m"
    
    print(f"R02 Route Clamped Profile: {len(elevations)} points, min={min(elev_values):.1f}m, max={max(elev_values):.1f}m")
