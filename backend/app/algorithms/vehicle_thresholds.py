def check_vehicle_passability(vehicle_type: str, depth_m: float, velocity_ms: float) -> bool:
    """Determine if a road segment is passable for a specific emergency vehicle type."""
    limits = {
        "passenger_car": {"max_d": 0.30, "max_dv": 0.30},
        "ambulance_4wd": {"max_d": 0.50, "max_dv": 0.60},
        "heavy_bus": {"max_d": 0.80, "max_dv": 1.20}
    }
    spec = limits.get(vehicle_type, limits["passenger_car"])
    if depth_m > spec["max_d"]:
        return False
    if (depth_m * velocity_ms) > spec["max_dv"]:
        return False
    return True
