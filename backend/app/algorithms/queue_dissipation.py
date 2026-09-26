def calculate_congested_traversal_time(length_km: float, free_flow_speed_kmh: float, vehicle_count: int, road_capacity_vph: float) -> float:
    """Calculate congestion-adjusted travel time using Bureau of Public Roads (BPR) impedance function."""
    if free_flow_speed_kmh <= 0 or length_km <= 0:
        return 0.0
    nominal_time_sec = (length_km / free_flow_speed_kmh) * 3600.0
    if road_capacity_vph <= 0:
        return nominal_time_sec * 4.0
    alpha = 0.15
    beta = 4.0
    volume_capacity_ratio = min(vehicle_count / road_capacity_vph, 3.0)
    congestion_factor = 1.0 + alpha * (volume_capacity_ratio ** beta)
    return nominal_time_sec * congestion_factor
