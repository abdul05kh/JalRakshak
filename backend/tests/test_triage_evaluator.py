from backend.app.algorithms.triage_evaluator import classify_start_triage

def test_walking_green():
    assert classify_start_triage(True, True, 20, 1.5, True) == "GREEN"

def test_severe_respiration_red():
    assert classify_start_triage(False, True, 36, 1.5, True) == "RED"
