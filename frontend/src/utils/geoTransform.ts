/**
 * Authoritative Coordinate Transformation & Landmark Utilities for JalRakshak
 * Supports WGS84 (EPSG:4326) and UTM Zone 44N (EPSG:32644) conversions.
 */

// UTM Zone 44N projection constants (WGS84 ellipsoid)
const A = 6378137.0; // semi-major axis
const F = 1 / 298.257223563; // flattening
const E = Math.sqrt(2 * F - F * F); // eccentricity
const K0 = 0.9996; // scale factor
const LON0 = 81.0 * (Math.PI / 180.0); // Central meridian for UTM Zone 44N = 81°E
const FALSE_EASTING = 500000.0;
const FALSE_NORTHING = 0.0;

export interface ProjectedPoint {
  easting: number;
  northing: number;
}

export interface GeoPoint {
  longitude: number;
  latitude: number;
}

export function wgs84ToUtm44n(lon: number, lat: number): ProjectedPoint {
  const phi = lat * (Math.PI / 180.0);
  const lambda = lon * (Math.PI / 180.0);
  const lambda0 = LON0;

  const n = A / Math.sqrt(1 - E * E * Math.sin(phi) * Math.sin(phi));
  const t = Math.tan(phi) * Math.tan(phi);
  const c = (E * E / (1 - E * E)) * Math.cos(phi) * Math.cos(phi);
  const a = Math.cos(phi) * (lambda - lambda0);

  // Meridian arc
  const m = A * (
    (1 - E * E / 4 - 3 * Math.pow(E, 4) / 64 - 5 * Math.pow(E, 6) / 256) * phi
    - (3 * E * E / 8 + 3 * Math.pow(E, 4) / 32 + 45 * Math.pow(E, 6) / 1024) * Math.sin(2 * phi)
    + (15 * Math.pow(E, 4) / 256 + 45 * Math.pow(E, 6) / 1024) * Math.sin(4 * phi)
    - (35 * Math.pow(E, 6) / 3072) * Math.sin(6 * phi)
  );

  const easting = FALSE_EASTING + K0 * n * (
    a + (1 - t + c) * Math.pow(a, 3) / 6 + (5 - 18 * t + t * t + 72 * c - 58 * (E * E / (1 - E * E))) * Math.pow(a, 5) / 120
  );

  const northing = FALSE_NORTHING + K0 * (
    m + n * Math.tan(phi) * (
      Math.pow(a, 2) / 2 + (5 - t + 9 * c + 4 * c * c) * Math.pow(a, 4) / 24 + (61 - 58 * t + t * t + 600 * c - 330 * (E * E / (1 - E * E))) * Math.pow(a, 6) / 720
    )
  );

  return { easting: Math.round(easting * 100) / 100, northing: Math.round(northing * 100) / 100 };
}

export const LANDMARK_COORDINATES = {
  TEHRI_DAM_CREST: { lon: 78.4803, lat: 30.3780, elev_m: 830.0, name: "Tehri Dam Crest (830m MSL)" },
  BREACH_INVERT: { lon: 78.4790, lat: 30.3750, elev_m: 635.0, name: "Breach Invert (635m — Model Assumption)" },
  MALIDEWAL_ORIGIN: { lon: 78.4680, lat: 30.3420, elev_m: 645.0, name: "Malidewal Origin" },
  LIMITING_EDGE_R02_E07: { lon: 78.5020, lat: 30.2825, elev_m: 612.0, name: "Limiting Segment R02-E07 (Koteshwar)" },
  CHAMBA_SHELTER: { lon: 78.3965, lat: 30.3475, elev_m: 1650.0, name: "Chamba Safe Shelter (1650m High Ground)" }
};
