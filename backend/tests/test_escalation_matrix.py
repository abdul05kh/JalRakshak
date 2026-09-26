from backend.app.algorithms.escalation_matrix import evaluate_emergency_alert_stage

def test_breach_escalation():
    assert evaluate_emergency_alert_stage(830.0, 65000.0, True) == "STAGE_4_CATASTROPHIC"

def test_watch_stage():
    assert evaluate_emergency_alert_stage(822.0, 2000.0, False) == "STAGE_1_WATCH"
