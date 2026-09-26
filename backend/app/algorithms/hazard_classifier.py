def classify_hazard_level(depth_m: float, velocity_ms: float) -> str:
    """Classify hydrodynamic hazard based on depth (d) and depth-velocity product (d*v)."""
    if depth_m <= 0.05:
        return "SAFE"
    dv = depth_m * velocity_ms
    if depth_m > 2.5 or velocity_ms > 4.0 or dv >= 4.0:
        return "EXTREME"
    elif depth_m > 1.2 or velocity_ms > 2.0 or dv >= 1.5:
        return "HIGH"
    elif depth_m > 0.5 or velocity_ms > 1.0 or dv >= 0.5:
        return "MEDIUM"
    else:
        return "LOW"
