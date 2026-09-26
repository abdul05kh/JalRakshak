from backend.app.algorithms.slope_penalty import calculate_slope_adjusted_speed

def test_steep_uphill_reduction():
    flat_speed = calculate_slope_adjusted_speed(40.0, 0.0, 1000.0)
    steep_speed = calculate_slope_adjusted_speed(40.0, 200.0, 1000.0)
    assert flat_speed == 40.0
    assert steep_speed < 30.0
