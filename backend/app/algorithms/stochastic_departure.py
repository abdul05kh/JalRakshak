import math
from typing import List

def generate_rayleigh_departure_curve(total_population: int, modal_warning_lag_minutes: float, time_steps: int = 12) -> List[float]:
    """Model human reaction and evacuation preparation delay using Rayleigh distribution curve."""
    sigma = modal_warning_lag_minutes
    curve = []
    accumulated = 0.0
    for i in range(1, time_steps + 1):
        t = i * (modal_warning_lag_minutes * 2.0 / time_steps)
        prob = 1.0 - math.exp(-(t ** 2) / (2.0 * (sigma ** 2)))
        fraction = prob - accumulated
        accumulated = prob
        curve.append(round(fraction * total_population, 1))
    return curve
