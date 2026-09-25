"""
Test 3: Terrain Tile Continuity & Seam Absence
Verifies that adjacent elevation grid samples and sub-tile boundaries have smooth, continuous transitions without gaps, spikes, or discontinuities.
"""

import os
import json
import pytest
import numpy as np

TERRAIN_META_PATH = "frontend/public/terrain/terrain_meta.json"
TERRAIN_BIN_PATH = "frontend/public/terrain/tehri_valley_elevation.bin"

def test_elevation_continuity_gradients():
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
        
    sa_data = np.fromfile(TERRAIN_BIN_PATH, dtype=np.float32).reshape(
        (meta["grid"]["height"], meta["grid"]["width"])
    )
    
    # Calculate row-wise and column-wise gradients (elevation differences per 30m pixel)
    diff_x = np.abs(np.diff(sa_data, axis=1))
    diff_y = np.abs(np.diff(sa_data, axis=0))
    
    # In steep Himalayan terrain, maximum valid physical slope rarely exceeds 70 degrees (~80m rise per 30m run)
    # A corrupt tile seam or nodata artifact would manifest as a sudden jump > 300m per single pixel
    max_dx = np.max(diff_x)
    max_dy = np.max(diff_y)
    
    assert max_dx < 150.0, f"Suspicious cliff/seam detected in X direction: {max_dx:.2f}m delta between adjacent pixels"
    assert max_dy < 150.0, f"Suspicious cliff/seam detected in Y direction: {max_dy:.2f}m delta between adjacent pixels"
    
    # No NaN or Infinite values
    assert not np.isnan(sa_data).any(), "NaN values found in terrain elevation grid"
    assert not np.isinf(sa_data).any(), "Infinite values found in terrain elevation grid"

def test_subtile_boundary_seamlessness():
    # Test dividing the study area into 4 quadrants and sampling directly on the boundary
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
        
    sa_data = np.fromfile(TERRAIN_BIN_PATH, dtype=np.float32).reshape(
        (meta["grid"]["height"], meta["grid"]["width"])
    )
    
    mid_row = sa_data.shape[0] // 2
    mid_col = sa_data.shape[1] // 2
    
    # Seam along horizontal divider
    h_seam_diff = np.abs(sa_data[mid_row, :] - sa_data[mid_row - 1, :])
    assert np.max(h_seam_diff) < 100.0, f"Horizontal seam discontinuity: {np.max(h_seam_diff)}m"
    
    # Seam along vertical divider
    v_seam_diff = np.abs(sa_data[:, mid_col] - sa_data[:, mid_col - 1])
    assert np.max(v_seam_diff) < 100.0, f"Vertical seam discontinuity: {np.max(v_seam_diff)}m"
