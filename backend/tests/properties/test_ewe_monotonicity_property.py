from backend.app.algorithms.route_robustness import calculate_route_robustness

def test_monotonicity_with_respect_to_arrival_time():
    r_early = calculate_route_robustness([3600.0], [600.0], 180.0, iterations=100)
    r_late = calculate_route_robustness([5400.0], [600.0], 180.0, iterations=100)
    assert r_late >= r_early
