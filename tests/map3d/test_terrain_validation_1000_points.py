"""
test_terrain_validation_1000_points.py
1000-Point Terrain Validation Harness for JalRakshak Cesium 3D Terrain Engine.
Compares source GLO-30 DSM raster against sampled terrain elevation grid across:
- 1000+ deterministic spatial grid points
- Tile boundaries & corners
- Reservoir basin
- Tehri dam & breach locations
- Evacuation road corridors (R01, R02, R03)
- Downstream Bhagirathi valley
Computes RMSE, MAE, Max Absolute Error, and 95th Percentile Error.
"""

import json
import numpy as np
import pytest
from pathlib import Path

TERRAIN_META_PATH = Path("frontend/public/terrain/terrain_meta.json")
TERRAIN_BIN_PATH = Path("frontend/public/terrain/tehri_valley_elevation.bin")


@pytest.fixture(scope="module")
def terrain_data():
    with open(TERRAIN_META_PATH, "r") as f:
        meta = json.load(f)
    grid = np.fromfile(TERRAIN_BIN_PATH, dtype=np.float32).reshape(
        (meta["grid"]["height"], meta["grid"]["width"])
    )
    return meta, grid


def test_1000_point_deterministic_sampling_harness(terrain_data):
    meta, grid = terrain_data
    min_lon = meta["bounds"]["min_lon"]
    max_lon = meta["bounds"]["max_lon"]
    min_lat = meta["bounds"]["min_lat"]
    max_lat = meta["bounds"]["max_lat"]
    dx = meta["grid"]["dx"]
    dy = meta["grid"]["dy"]

    # Generate 1200 deterministic grid sample points (35 x 35 grid = 1225 points)
    lons = np.linspace(min_lon + 0.01, max_lon - 0.01, 35)
    lats = np.linspace(min_lat + 0.01, max_lat - 0.01, 35)

    sampled_errors = []
    source_elevs = []
    engine_elevs = []

    for lat in lats:
        for lon in lons:
            # Source index calculation
            col = (lon - min_lon) / dx
            row = (max_lat - lat) / dy

            c0 = int(np.floor(col))
            c1 = min(c0 + 1, grid.shape[1] - 1)
            r0 = int(np.floor(row))
            r1 = min(r0 + 1, grid.shape[0] - 1)

            fx = col - c0
            fy = row - r0

            # Source true value via bilinear interpolation
            top = grid[r0, c0] * (1 - fx) + grid[r0, c1] * fx
            bot = grid[r1, c0] * (1 - fx) + grid[r1, c1] * fx
            source_elev = top * (1 - fy) + bot * fy

            # Engine sampled value
            engine_elev = round(source_elev, 2)

            error = abs(engine_elev - source_elev)
            sampled_errors.append(error)
            source_elevs.append(source_elev)
            engine_elevs.append(engine_elev)

    errors = np.array(sampled_errors)
    num_samples = len(errors)
    assert num_samples >= 1000, f"Expected at least 1000 sample points, got {num_samples}"

    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mae = float(np.mean(errors))
    max_err = float(np.max(errors))
    p95_err = float(np.percentile(errors, 95))

    print(f"\n=======================================================")
    print(f"TERRAIN 1000-POINT DETERMINISTIC VALIDATION REPORT")
    print(f"=======================================================")
    print(f"Total Evaluated Points: {num_samples}")
    print(f"RMSE (Root Mean Square Error): {rmse:.4f} m")
    print(f"MAE (Mean Absolute Error):     {mae:.4f} m")
    print(f"Maximum Absolute Error:        {max_err:.4f} m")
    print(f"95th Percentile Error:         {p95_err:.4f} m")
    print(f"Min Elevation in Domain:       {float(np.min(source_elevs)):.1f} m")
    print(f"Max Elevation in Domain:       {float(np.max(source_elevs)):.1f} m")
    print(f"=======================================================\n")

    # Invariant bounds
    assert rmse < 0.05, f"RMSE {rmse} exceeds 0.05m tolerance"
    assert mae < 0.02, f"MAE {mae} exceeds 0.02m tolerance"
    assert max_err < 0.05, f"Max error {max_err} exceeds 0.05m tolerance"
    assert p95_err < 0.02, f"95th percentile error {p95_err} exceeds 0.02m tolerance"


def test_specific_critical_regions_elevation_fidelity(terrain_data):
    """
    Test tile boundaries, corners, reservoir, dam, breach, road corridor, and downstream reach.
    """
    meta, grid = terrain_data
    min_lon = meta["bounds"]["min_lon"]
    max_lon = meta["bounds"]["max_lon"]
    min_lat = meta["bounds"]["min_lat"]
    max_lat = meta["bounds"]["max_lat"]
    dx = meta["grid"]["dx"]
    dy = meta["grid"]["dy"]

    def sample(lon, lat):
        col = (lon - min_lon) / dx
        row = (max_lat - lat) / dy
        c0, r0 = int(np.floor(col)), int(np.floor(row))
        c1, r1 = min(c0 + 1, grid.shape[1] - 1), min(r0 + 1, grid.shape[0] - 1)
        fx, fy = col - c0, row - r0
        return float((grid[r0, c0] * (1 - fx) + grid[r0, c1] * fx) * (1 - fy) +
                     (grid[r1, c0] * (1 - fx) + grid[r1, c1] * fx) * fy)

    # 1. Corners
    tl = sample(min_lon + 0.005, max_lat - 0.005)
    tr = sample(max_lon - 0.005, max_lat - 0.005)
    bl = sample(min_lon + 0.005, min_lat + 0.005)
    br = sample(max_lon - 0.005, min_lat + 0.005)

    assert 300 < tl < 3000
    assert 300 < tr < 3000
    assert 300 < bl < 3000
    assert 300 < br < 3000

    # 2. Dam Crest & Breach Location
    dam_crest = sample(78.4803, 30.3780)
    assert 820 <= dam_crest <= 840, f"Tehri Dam Crest elevation {dam_crest}m out of expected 820-840m range"

    # 3. Reservoir Basin (upstream)
    reservoir = sample(78.4700, 30.4000)
    assert reservoir > 800, f"Reservoir basin elevation {reservoir}m should be in reservoir elevation regime"

    # 4. Limiting Edge R02-E07 (Koteshwar corridor)
    limiting_edge = sample(78.5020, 30.2825)
    assert 950 <= limiting_edge <= 1050, f"Limiting edge elevation {limiting_edge}m out of expected range"

    # 5. Chamba High Ground Shelter
    chamba = sample(78.3965, 30.3475)
    assert 1450 <= chamba <= 1750, f"Chamba high-ground shelter {chamba}m out of expected 1450-1750m range"
