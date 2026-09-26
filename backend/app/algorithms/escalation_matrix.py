def evaluate_emergency_alert_stage(water_elev_m: float, outflow_cumecs: float, breach_confirmed: bool) -> str:
    """Evaluate multi-parameter escalation level for Tehri Dam emergency management."""
    if breach_confirmed:
        return "STAGE_4_CATASTROPHIC"
    if outflow_cumecs > 15000.0:
        return "STAGE_3_EMERGENCY"
    if water_elev_m > 830.0 or outflow_cumecs > 8000.0:
        return "STAGE_2_WARNING"
    if water_elev_m > 820.0:
        return "STAGE_1_WATCH"
    return "NORMAL"
