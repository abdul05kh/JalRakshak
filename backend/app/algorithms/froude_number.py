import math

def calculate_froude_number(velocity_ms: float, hydraulic_depth_m: float) -> float:
    """Calculate Froude number Fr = v / sqrt(g * D_h) for open channel flow regimes."""
    if hydraulic_depth_m <= 0:
        return 0.0
    g = 9.80665
    return velocity_ms / math.sqrt(g * hydraulic_depth_m)

def classify_flow_regime(fr: float) -> str:
    if fr < 0.95:
        return "SUBCRITICAL"
    elif fr > 1.05:
        return "SUPERCRITICAL"
    else:
        return "CRITICAL_TRANSITION"
