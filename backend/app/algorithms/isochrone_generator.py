from typing import List, Dict, Tuple

def compute_distance_isochrone_polygon(origin_lat: float, origin_lng: float, max_radius_km: float, num_points: int = 36) -> List[Tuple[float, float]]:
    """Generate circular isochrone approximation points around evacuation hub."""
    import math
    points = []
    lat_deg_per_km = 1.0 / 111.32
    lng_deg_per_km = 1.0 / (111.32 * math.cos(math.radians(origin_lat)))
    
    for i in range(num_points):
        angle = (2.0 * math.pi * i) / num_points
        d_lat = max_radius_km * math.sin(angle) * lat_deg_per_km
        d_lng = max_radius_km * math.cos(angle) * lng_deg_per_km
        points.append((round(origin_lat + d_lat, 6), round(origin_lng + d_lng, 6)))
        
    points.append(points[0])
    return points
