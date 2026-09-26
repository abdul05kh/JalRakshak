from backend.app.algorithms.hazard_classifier import classify_hazard_level

def test_safe_zone():
    assert classify_hazard_level(0.02, 0.1) == "SAFE"

def test_low_hazard():
    assert classify_hazard_level(0.3, 0.8) == "LOW"

def test_extreme_hazard():
    assert classify_hazard_level(3.5, 5.0) == "EXTREME"
