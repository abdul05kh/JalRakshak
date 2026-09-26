from typing import List, Tuple

def plan_uav_recon_waypoints(takeoff_lat: float, takeoff_lon: float, target_points: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
    """Plan closed-loop shortest flight path for UAV aerial survey."""
    tour = [(takeoff_lat, takeoff_lon)]
    unvisited = list(target_points)
    
    current = tour[0]
    while unvisited:
        nearest = min(unvisited, key=lambda p: (p[0] - current[0])**2 + (p[1] - current[1])**2)
        tour.append(nearest)
        unvisited.remove(nearest)
        current = nearest
        
    tour.append(tour[0])
    return tour
