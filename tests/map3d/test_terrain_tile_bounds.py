"""
Test 2: Terrain Tile Bounds
Verifies that terrain tile spatial extents and geographic bounding boxes align strictly with the study area coordinate system.
"""

import os
import json
import pytest

TERRAIN_META_PATH = "frontend/public/terrain/terrain_meta.json"

def test_terrain_meta_bounds_and_coverage():
    assert os.path.exists(TERRAIN_META_PATH), "terrain_meta.json not found"
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
        
    bounds = meta["bounds"]
    full_bounds = meta["full_bounds"]
    
    # Study area must be within full tile
    assert full_bounds["min_lon"] <= bounds["min_lon"]
    assert full_bounds["max_lon"] >= bounds["max_lon"]
    assert full_bounds["min_lat"] <= bounds["min_lat"]
    assert full_bounds["max_lat"] >= bounds["max_lat"]
    
    # Verify key landmarks fall strictly inside study area bounds
    landmarks = [
        ("Tehri Dam", 78.4803, 30.3780),
        ("Breach", 78.4790, 30.3750),
        ("Malidewal", 78.4680, 30.3420),
        ("Koteshwar (R02-E07)", 78.5020, 30.2825),
        ("Chamba Shelter", 78.3965, 30.3475)
    ]
    
    for name, lon, lat in landmarks:
        assert bounds["min_lon"] <= lon <= bounds["max_lon"], f"{name} (lon {lon}) outside study bounds [{bounds['min_lon']}, {bounds['max_lon']}]"
        assert bounds["min_lat"] <= lat <= bounds["max_lat"], f"{name} (lat {lat}) outside study bounds [{bounds['min_lat']}, {bounds['max_lat']}]"

def test_pixel_dimensions_match_grid_bounds():
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
        
    bounds = meta["bounds"]
    grid = meta["grid"]
    
    expected_width = round((bounds["max_lon"] - bounds["min_lon"]) / grid["dx"]) + 1
    expected_height = round((bounds["max_lat"] - bounds["min_lat"]) / grid["dy"]) + 1
    
    assert abs(grid["width"] - expected_width) <= 1, f"Grid width {grid['width']} mismatch with bounds calculation {expected_width}"
    assert abs(grid["height"] - expected_height) <= 1, f"Grid height {grid['height']} mismatch with bounds calculation {expected_height}"
