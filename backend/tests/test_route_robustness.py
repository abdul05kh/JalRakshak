from backend.app.algorithms.route_robustness import calculate_route_robustness

def test_high_margin_robustness():
    score = calculate_route_robustness([7200.0], [600.0], 180.0, iterations=200)
    assert score >= 0.95

def test_low_margin_robustness():
    score = calculate_route_robustness([500.0], [450.0], 180.0, iterations=200)
    assert score <= 0.20
