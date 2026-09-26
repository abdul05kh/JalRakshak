from backend.app.algorithms.haversine_distance import calculate_geodesic_3d_distance

def test_distance_accuracy():
    dist = calculate_geodesic_3d_distance(30.3781, 78.4806, 800.0, 30.3781, 78.4906, 900.0)
    assert 900.0 < dist < 1200.0
