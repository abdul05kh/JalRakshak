import math

def calculate_geodesic_3d_distance(lat1: float, lon1: float, elev1_m: float, lat2: float, lon2: float, elev2_m: float) -> float:
    """Calculate true 3D spatial separation between two geographic coordinates in meters."""
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2) + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    surface_dist = R * c
    
    delta_elev = elev2_m - elev1_m
    return math.sqrt(surface_dist ** 2 + delta_elev ** 2)
