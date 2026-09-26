import math
from typing import Tuple

def wgs84_to_utm44n(lat: float, lon: float) -> Tuple[float, float]:
    """Convert Lat/Lon (WGS84) to UTM Zone 44N Easting/Northing in meters."""
    a = 6378137.0
    f = 1 / 298.257223563
    e_sq = 2 * f - f * f
    
    lon0 = 81.0
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    lon0_rad = math.radians(lon0)
    
    k0 = 0.9996
    e_prime_sq = e_sq / (1 - e_sq)
    
    N = a / math.sqrt(1 - e_sq * (math.sin(lat_rad) ** 2))
    T = math.tan(lat_rad) ** 2
    C = e_prime_sq * (math.cos(lat_rad) ** 2)
    A = (lon_rad - lon0_rad) * math.cos(lat_rad)
    
    M = a * ((1 - e_sq/4 - 3*e_sq**2/64 - 5*e_sq**3/256) * lat_rad
             - (3*e_sq/8 + 3*e_sq**2/32 + 45*e_sq**3/1024) * math.sin(2*lat_rad)
             + (15*e_sq**2/256 + 45*e_sq**3/1024) * math.sin(4*lat_rad)
             - (35*e_sq**3/3072) * math.sin(6*lat_rad))
             
    easting = k0 * N * (A + (1 - T + C) * (A**3)/6 + (5 - 18*T + T**2 + 72*C - 58*e_prime_sq) * (A**5)/120) + 500000.0
    northing = k0 * (M + N * math.tan(lat_rad) * ((A**2)/2 + (5 - T + 9*C + 4*C**2) * (A**4)/24 + (61 - 58*T + T**2 + 600*C - 330*e_prime_sq) * (A**6)/720))
    return easting, northing
