"""
Test 9: Hydraulic Alignment
Verifies that HEC-RAS flood inundation layers align geographically with the Bhagirathi river channel and valley floor terrain.
"""

import os
import json
import numpy as np
import pytest

INUNDATION_PATH = "data/scenarios/scen-tehri-001-baseline/inundation.geojson"
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

def test_hydraulic_inundation_in_valley_floor(terrain_sampler):
    with open(INUNDATION_PATH, "r") as f:
        inundation = json.load(f)
        
    assert len(inundation["features"]) > 0, "No inundation features found in scenario"
    
    inundated_points = []
    for feat in inundation["features"]:
        geom = feat["geometry"]
        coords = geom["coordinates"]
        if geom["type"] == "Polygon":
            for ring in coords:
                for pt in ring:
                    inundated_points.append(pt)
        elif geom["type"] == "MultiPolygon":
            for poly in coords:
                for ring in poly:
                    for pt in ring:
                        inundated_points.append(pt)
                        
    assert len(inundated_points) > 0, "No polygon vertices found in inundation layer"
    
    elevations = [terrain_sampler(p[0], p[1]) for p in inundated_points]
    mean_flood_elev = np.mean(elevations)
    max_flood_elev = np.max(elevations)
    
    print(f"Hydraulic Inundation Points: {len(inundated_points)}, Mean Terrain Elev: {mean_flood_elev:.1f}m, Max: {max_flood_elev:.1f}m")
    
    # Inundation must be confined to the lower valley floor (< 1100m MSL in Tehri corridor) and not climbing mountaintops (2000m+)
    assert mean_flood_elev < 1000.0, f"Mean flood terrain elevation ({mean_flood_elev}m) is abnormally high"
    assert max_flood_elev < 1200.0, f"Max flood terrain elevation ({max_flood_elev}m) suggests flood climbing mountain summits"
