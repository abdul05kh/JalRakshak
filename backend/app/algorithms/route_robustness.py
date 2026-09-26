from typing import Dict, List
import random

def calculate_route_robustness(arrival_times: List[float], traversal_times: List[float], buffer_sec: float, iterations: int = 1000) -> float:
    """Evaluate probability of route feasibility under +/- 20% hydrodynamic uncertainty."""
    success_count = 0
    k = len(arrival_times)
    
    for _ in range(iterations):
        perturbed_arrivals = [a * (1.0 + random.uniform(-0.20, 0.20)) for a in arrival_times]
        feasible = True
        cum_traversal = 0.0
        for j in range(k):
            cum_traversal += traversal_times[j]
            deadline = perturbed_arrivals[j] - cum_traversal - buffer_sec
            if deadline < 0:
                feasible = False
                break
        if feasible:
            success_count += 1
            
    return round(success_count / iterations, 4)
