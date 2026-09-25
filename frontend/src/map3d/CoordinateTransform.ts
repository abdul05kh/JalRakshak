/**
 * Authoritative Coordinate Transformation Utility for JalRakshak 3D Terrain Engine
 * Bidirectional conversions between WGS84 (EPSG:4326) and UTM Zone 44N (EPSG:32644).
 */

const A = 6378137.0; // semi-major axis
const F = 1 / 298.257223563; // flattening
const B = A * (1 - F);
const E = Math.sqrt(2 * F - F * F); // eccentricity
const E_PRIME_SQ = (A * A - B * B) / (B * B);
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
  elevation_m?: number;
}

export function wgs84ToUtm44n(lon: number, lat: number): ProjectedPoint {
  const phi = lat * (Math.PI / 180.0);
  const lambda = lon * (Math.PI / 180.0);

  const n = A / Math.sqrt(1 - E * E * Math.sin(phi) * Math.sin(phi));
  const t = Math.tan(phi) * Math.tan(phi);
  const c = E_PRIME_SQ * Math.cos(phi) * Math.cos(phi);
  const a = Math.cos(phi) * (lambda - LON0);

  const m = A * (
    (1 - E * E / 4 - 3 * Math.pow(E, 4) / 64 - 5 * Math.pow(E, 6) / 256) * phi
    - (3 * E * E / 8 + 3 * Math.pow(E, 4) / 32 + 45 * Math.pow(E, 6) / 1024) * Math.sin(2 * phi)
    + (15 * Math.pow(E, 4) / 256 + 45 * Math.pow(E, 6) / 1024) * Math.sin(4 * phi)
    - (35 * Math.pow(E, 6) / 3072) * Math.sin(6 * phi)
  );

  const easting = FALSE_EASTING + K0 * n * (
    a + (1 - t + c) * Math.pow(a, 3) / 6 + (5 - 18 * t + t * t + 72 * c - 58 * E_PRIME_SQ) * Math.pow(a, 5) / 120
  );

  const northing = FALSE_NORTHING + K0 * (
    m + n * Math.tan(phi) * (
      Math.pow(a, 2) / 2 + (5 - t + 9 * c + 4 * c * c) * Math.pow(a, 4) / 24 + (61 - 58 * t + t * t + 600 * c - 330 * E_PRIME_SQ) * Math.pow(a, 6) / 720
    )
  );

  return {
    easting: Math.round(easting * 100) / 100,
    northing: Math.round(northing * 100) / 100
  };
}

export function utm44nToWgs84(easting: number, northing: number): GeoPoint {
  const e1 = (1 - Math.sqrt(1 - E * E)) / (1 + Math.sqrt(1 - E * E));
  const x = easting - FALSE_EASTING;
  const y = northing - FALSE_NORTHING;

  const m = y / K0;
  const mu = m / (A * (1 - E * E / 4 - 3 * Math.pow(E, 4) / 64 - 5 * Math.pow(E, 6) / 256));

  const phi1 = mu + (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32) * Math.sin(2 * mu)
    + (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32) * Math.sin(4 * mu)
    + (151 * Math.pow(e1, 3) / 96) * Math.sin(6 * mu)
    + (1097 * Math.pow(e1, 4) / 512) * Math.sin(8 * mu);

  const n1 = A / Math.sqrt(1 - E * E * Math.sin(phi1) * Math.sin(phi1));
  const t1 = Math.tan(phi1) * Math.tan(phi1);
  const c1 = E_PRIME_SQ * Math.cos(phi1) * Math.cos(phi1);
  const r1 = A * (1 - E * E) / Math.pow(1 - E * E * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const d = x / (n1 * K0);

  const lat = phi1 - (n1 * Math.tan(phi1) / r1) * (
    Math.pow(d, 2) / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * E_PRIME_SQ) * Math.pow(d, 4) / 24
    + (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * E_PRIME_SQ - 3 * c1 * c1) * Math.pow(d, 6) / 720
  );

  const lon = LON0 + (
    d - (1 + 2 * t1 + c1) * Math.pow(d, 3) / 6
    + (5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * E_PRIME_SQ + 24 * t1 * t1) * Math.pow(d, 5) / 120
  ) / Math.cos(phi1);

  return {
    longitude: Math.round((lon * 180.0 / Math.PI) * 1e6) / 1e6,
    latitude: Math.round((lat * 180.0 / Math.PI) * 1e6) / 1e6
  };
}

export const AUTHORITATIVE_LANDMARKS = {
  TEHRI_DAM_CREST: { lon: 78.4803, lat: 30.3780, elev_m: 830.63, name: "Tehri Dam Crest (830.63m MSL)" },
  BREACH_INVERT: { lon: 78.4790, lat: 30.3750, elev_m: 635.00, name: "Breach Invert (635m MSL — Model Assumption)" },
  MALIDEWAL_ORIGIN: { lon: 78.4680, lat: 30.3420, elev_m: 1061.79, name: "Malidewal Lowland Village" },
  LIMITING_EDGE_R02_E07: { lon: 78.5020, lat: 30.2825, elev_m: 983.34, name: "Limiting Segment R02-E07 (Koteshwar)" },
  CHAMBA_SHELTER: { lon: 78.3965, lat: 30.3475, elev_m: 1648.52, name: "Chamba Safe Shelter (1648m High Ground)" },
  DEV_PRAYAG_CONFLUENCE: { lon: 78.5980, lat: 30.1450, elev_m: 445.00, name: "Devprayag Confluence" }
};
