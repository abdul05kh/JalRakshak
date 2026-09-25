"""
Test 5: Coordinate Transformation Precision
Validates bidirectional transformations between EPSG:4326 (WGS84) and EPSG:32644 (UTM Zone 44N).
"""

import pytest
from backend.app.domain.geo_transform import geo_transformer

def test_control_point_transformations():
    results = geo_transformer.validate_control_points()
    assert len(results) >= 5
    for r in results:
        assert r["status"] == "PASS", f"Control point {r['name']} failed transformation test: {r}"
        assert r["residual_error_deg"][0] < 1e-5, f"Longitude residual error too high: {r['residual_error_deg'][0]}"
        assert r["residual_error_deg"][1] < 1e-5, f"Latitude residual error too high: {r['residual_error_deg'][1]}"

def test_projected_easting_northing_ranges():
    # In UTM Zone 44N, Tehri study area is around Easting 240,000 - 270,000 m and Northing 3,340,000 - 3,380,000 m
    tehri_dam_lon, tehri_dam_lat = 78.4803, 30.3780
    east, north = geo_transformer.wgs84_to_utm(tehri_dam_lon, tehri_dam_lat)
    
    assert 240000 <= east <= 270000, f"Tehri Dam Easting {east} outside valid UTM44N range"
    assert 3340000 <= north <= 3380000, f"Tehri Dam Northing {north} outside valid UTM44N range"
