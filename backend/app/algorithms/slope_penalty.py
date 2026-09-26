import math

def calculate_slope_adjusted_speed(nominal_speed_kmh: float, elevation_change_m: float, length_m: float, rain_intensity_0_to_1: float = 0.0) -> float:
    if length_m <= 0 or nominal_speed_kmh <= 0:
        return 0.0
    grade = elevation_change_m / length_m
    theta = math.atan(grade)
    
    if theta > 0:
        slope_penalty = 1.0 + 2.5 * math.sin(theta) + 5.0 * (math.sin(theta) ** 2)
    else:
        slope_penalty = 1.0
        
    weather_factor = 1.0 - 0.35 * min(max(rain_intensity_0_to_1, 0.0), 1.0)
    effective_speed = (nominal_speed_kmh * weather_factor) / slope_penalty
    return max(effective_speed, 5.0)
