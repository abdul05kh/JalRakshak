import math
from typing import Tuple

def calculate_courant_number(velocity_ms: float, celerity_ms: float, delta_t_sec: float, delta_x_m: float) -> float:
    """Calculate Courant number C = (u + sqrt(g*h)) * dt / dx for shallow water equations."""
    total_speed = velocity_ms + celerity_ms
    if delta_x_m <= 0:
        raise ValueError("Spatial step delta_x must be strictly positive")
    return (total_speed * delta_t_sec) / delta_x_m

def verify_cfl_stability(max_velocity_ms: float, max_depth_m: float, delta_t_sec: float, delta_x_m: float, max_cfl: float = 1.0) -> Tuple[bool, float]:
    g = 9.80665
    celerity = math.sqrt(g * max(max_depth_m, 0.01))
    cfl = calculate_courant_number(max_velocity_ms, celerity, delta_t_sec, delta_x_m)
    return cfl <= max_cfl, cfl
