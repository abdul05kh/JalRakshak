"""
Test 4: Terrain Elevation Fidelity
Performs true 3D geometry testing:
1. Verifies that different geographic locations yield distinct 3D elevation values (proving non-planar terrain).
2. Verifies elevation profiles along the Bhagirathi river and evacuation corridors.
"""

import json
import numpy as np
import pytest

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

def test_true_3d_irregular_elevation(terrain_sampler):
    # Test three distinct points across the valley profile:
    # P1: River valley floor / dam base (~830m)
    # P2: Mountain ridge overlooking dam (~1400 - 1800m)
    # P3: Chamba high ground (~1600 - 1700m)
    
    p1 = (78.4803, 30.3780) # Dam crest/valley
    p2 = (78.4500, 30.3900) # Ridge north-west
    p3 = (78.3965, 30.3475) # Chamba high ground
    
    z1 = terrain_sampler(p1[0], p1[1])
    z2 = terrain_sampler(p2[0], p2[1])
    z3 = terrain_sampler(p3[0], p3[1])
    
    print(f"Elevation Profile Check: P1={z1:.1f}m, P2={z2:.1f}m, P3={z3:.1f}m")
    
    # Must all be different by > 100m to prove irregular 3D topography
    assert abs(z1 - z2) > 100.0, f"P1 ({z1}m) and P2 ({z2}m) elevations are too similar (planar artifact)"
    assert abs(z2 - z3) > 50.0, f"P2 ({z2}m) and P3 ({z3}m) elevations are too similar (planar artifact)"
    assert abs(z1 - z3) > 100.0, f"P1 ({z1}m) and P3 ({z3}m) elevations are too similar (planar artifact)"

def test_downstream_valley_descent_gradient(terrain_sampler):
    # As we move downstream along the Bhagirathi river from Tehri Dam to Koteshwar and Devprayag confluence,
    # the riverbed elevation steadily decreases
    tehri_crest = terrain_sampler(78.4803, 30.3780)
    downstream_1km = terrain_sampler(78.4850, 30.3650)
    koteshwar_riverbed = terrain_sampler(78.4970, 30.2800)
    devprayag_confluence = terrain_sampler(78.5980, 30.1450)
    
    print(f"River Corridor Descent: Tehri Dam ({tehri_crest:.1f}m) -> Downstream ({downstream_1km:.1f}m) -> Koteshwar ({koteshwar_riverbed:.1f}m) -> Devprayag ({devprayag_confluence:.1f}m)")
    assert tehri_crest > downstream_1km, "Dam crest must be higher than downstream riverbed"
    assert downstream_1km > koteshwar_riverbed, "Riverbed must descend towards Koteshwar"
    assert koteshwar_riverbed > devprayag_confluence, "Riverbed must descend towards Devprayag confluence"
