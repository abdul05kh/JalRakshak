"""
Authoritative Coordinate Transformation Utility for JalRakshak
Handles bidirectional transformations between WGS84 (EPSG:4326) and UTM Zone 44N (EPSG:32644).
"""

from typing import Tuple, List
import math

class GeoTransformer:
    def __init__(self, target_crs: str = "EPSG:32644", source_crs: str = "EPSG:4326"):
        self.target_crs = target_crs
        self.source_crs = source_crs
        # WGS84 Ellipsoid constants
        self.a = 6378137.0
        self.f = 1 / 298.257223563
        self.b = self.a * (1 - self.f)
        self.e = math.sqrt(2 * self.f - self.f * self.f)
        self.e_prime_sq = (self.a**2 - self.b**2) / (self.b**2)
        self.k0 = 0.9996
        self.lon0 = math.radians(81.0) # UTM Zone 44N central meridian = 81°E
        self.false_easting = 500000.0
        self.false_northing = 0.0

    def wgs84_to_utm(self, lon: float, lat: float) -> Tuple[float, float]:
        """Transform (lon, lat) in EPSG:4326 to (easting, northing) in EPSG:32644."""
        phi = math.radians(lat)
        lam = math.radians(lon)
        
        n = self.a / math.sqrt(1 - self.e**2 * math.sin(phi)**2)
        t = math.tan(phi)**2
        c = self.e_prime_sq * math.cos(phi)**2
        A = math.cos(phi) * (lam - self.lon0)
        
        m = self.a * (
            (1 - self.e**2/4 - 3*self.e**4/64 - 5*self.e**6/256) * phi
            - (3*self.e**2/8 + 3*self.e**4/32 + 45*self.e**6/1024) * math.sin(2*phi)
            + (15*self.e**4/256 + 45*self.e**6/1024) * math.sin(4*phi)
            - (35*self.e**6/3072) * math.sin(6*phi)
        )
        
        easting = self.false_easting + self.k0 * n * (
            A + (1 - t + c) * A**3 / 6.0 + (5 - 18*t + t**2 + 72*c - 58*self.e_prime_sq) * A**5 / 120.0
        )
        northing = self.false_northing + self.k0 * (
            m + n * math.tan(phi) * (
                A**2 / 2.0 + (5 - t + 9*c + 4*c**2) * A**4 / 24.0 + (61 - 58*t + t**2 + 600*c - 330*self.e_prime_sq) * A**6 / 720.0
            )
        )
        return round(easting, 2), round(northing, 2)

    def utm_to_wgs84(self, easting: float, northing: float) -> Tuple[float, float]:
        """Transform (easting, northing) in EPSG:32644 to (lon, lat) in EPSG:4326."""
        e1 = (1 - math.sqrt(1 - self.e**2)) / (1 + math.sqrt(1 - self.e**2))
        x = easting - self.false_easting
        y = northing - self.false_northing
        
        m = y / self.k0
        mu = m / (self.a * (1 - self.e**2/4 - 3*self.e**4/64 - 5*self.e**6/256))
        
        phi1 = mu + (3*e1/2 - 27*e1**3/32) * math.sin(2*mu) + (21*e1**2/16 - 55*e1**4/32) * math.sin(4*mu) + (151*e1**3/96) * math.sin(6*mu) + (1097*e1**4/512) * math.sin(8*mu)
        
        n1 = self.a / math.sqrt(1 - self.e**2 * math.sin(phi1)**2)
        t1 = math.tan(phi1)**2
        c1 = self.e_prime_sq * math.cos(phi1)**2
        r1 = self.a * (1 - self.e**2) / (1 - self.e**2 * math.sin(phi1)**2)**1.5
        d = x / (n1 * self.k0)
        
        lat = phi1 - (n1 * math.tan(phi1) / r1) * (
            d**2/2 - (5 + 3*t1 + 10*c1 - 4*c1**2 - 9*self.e_prime_sq) * d**4/24
            + (61 + 90*t1 + 298*c1 + 45*t1**2 - 252*self.e_prime_sq - 3*c1**2) * d**6/720
        )
        lon = self.lon0 + (
            d - (1 + 2*t1 + c1) * d**3/6
            + (5 - 2*c1 + 28*t1 - 3*c1**2 + 8*self.e_prime_sq + 24*t1**2) * d**5/120
        ) / math.cos(phi1)
        
        return round(math.degrees(lon), 6), round(math.degrees(lat), 6)

    def validate_control_points(self) -> List[dict]:
        """Validates forward and inverse transformations on known study area landmarks."""
        test_points = [
            {"name": "Tehri Dam Crest", "lon": 78.4803, "lat": 30.3780},
            {"name": "Breach Invert", "lon": 78.4790, "lat": 30.3750},
            {"name": "Malidewal Origin", "lon": 78.4680, "lat": 30.3420},
            {"name": "Limiting Segment R02-E07", "lon": 78.5020, "lat": 30.2825},
            {"name": "Chamba Relief Shelter", "lon": 78.3965, "lat": 30.3475}
        ]

        results = []
        for pt in test_points:
            east, north = self.wgs84_to_utm(pt["lon"], pt["lat"])
            rev_lon, rev_lat = self.utm_to_wgs84(east, north)
            error_lon = abs(pt["lon"] - rev_lon)
            error_lat = abs(pt["lat"] - rev_lat)
            passed = (error_lon < 1e-4) and (error_lat < 1e-4)

            results.append({
                "name": pt["name"],
                "source_wgs84": (pt["lon"], pt["lat"]),
                "utm44n": (east, north),
                "roundtrip_wgs84": (rev_lon, rev_lat),
                "residual_error_deg": (error_lon, error_lat),
                "status": "PASS" if passed else "FAIL"
            })
        return results

geo_transformer = GeoTransformer()

