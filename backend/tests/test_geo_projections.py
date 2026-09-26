from backend.app.algorithms.geo_projections import wgs84_to_utm44n

def test_tehri_dam_utm():
    easting, northing = wgs84_to_utm44n(30.3781, 78.4806)
    assert 250000.0 < easting < 300000.0
    assert 3300000.0 < northing < 3400000.0
