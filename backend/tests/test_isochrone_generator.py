from backend.app.algorithms.isochrone_generator import compute_distance_isochrone_polygon

def test_isochrone_closing():
    poly = compute_distance_isochrone_polygon(30.3781, 78.4806, 5.0, 16)
    assert len(poly) == 17
    assert poly[0] == poly[-1]
