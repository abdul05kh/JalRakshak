export interface LatLng {
  lat: number;
  lng: number;
}

export function interpolateLatLng(p1: LatLng, p2: LatLng, fraction: number): LatLng {
  const t = Math.max(0, Math.min(1, fraction));
  return {
    lat: p1.lat + (p2.lat - p1.lat) * t,
    lng: p1.lng + (p2.lng - p1.lng) * t
  };
}

export function computeBoundingBox(points: LatLng[]): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  let minLat = points[0].lat, maxLat = points[0].lat;
  let minLng = points[0].lng, maxLng = points[0].lng;
  
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}
