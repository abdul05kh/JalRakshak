from backend.app.algorithms.queue_dissipation import calculate_congested_traversal_time

def test_uncongested_flow():
    t_sec = calculate_congested_traversal_time(10.0, 60.0, 100, 2000.0)
    assert abs(t_sec - 600.0) < 5.0

def test_heavy_congestion_flow():
    t_sec = calculate_congested_traversal_time(10.0, 60.0, 3000, 1000.0)
    assert t_sec > 600.0 * 2.0
