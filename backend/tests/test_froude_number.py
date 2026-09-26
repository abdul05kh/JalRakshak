from backend.app.algorithms.froude_number import calculate_froude_number, classify_flow_regime

def test_subcritical_flow():
    fr = calculate_froude_number(2.0, 5.0)
    assert fr < 1.0
    assert classify_flow_regime(fr) == "SUBCRITICAL"

def test_supercritical_flow():
    fr = calculate_froude_number(12.0, 2.0)
    assert fr > 1.0
    assert classify_flow_regime(fr) == "SUPERCRITICAL"
