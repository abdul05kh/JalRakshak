import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative, PointQueryResponse } from "../types";

interface MapViewProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  layerVisibility: {
    inundation: boolean;
    roads: boolean;
    origins: boolean;
    destinations: boolean;
  };
  onMapClick: (lat: number, lon: number) => void;
  pointQueryData: PointQueryResponse | null;
}

export const MapView: React.FC<MapViewProps> = ({
  inundationGeoJSON,
  roads,
  evacPoints,
  activeRoute,
  layerVisibility,
  onMapClick,
  pointQueryData
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer Groups
  const inundationLayerRef = useRef<L.GeoJSON | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const pointsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const clickPopupRef = useRef<L.Popup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [30.22, 78.42],
      zoom: 11,
      zoomControl: true
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    inundationLayerRef.current = L.geoJSON(undefined, {
      style: {
        color: "#0284c7",
        weight: 2,
        fillColor: "#38bdf8",
        fillOpacity: 0.45
      }
    }).addTo(map);

    roadsLayerRef.current = L.layerGroup().addTo(map);
    pointsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Inundation Layer
  useEffect(() => {
    if (!inundationLayerRef.current) return;
    inundationLayerRef.current.clearLayers();
    if (inundationGeoJSON && layerVisibility.inundation) {
      inundationLayerRef.current.addData(inundationGeoJSON);
    }
  }, [inundationGeoJSON, layerVisibility.inundation]);

  // Update Roads Layer
  useEffect(() => {
    if (!roadsLayerRef.current) return;
    roadsLayerRef.current.clearLayers();
    if (!layerVisibility.roads) return;

    roads.forEach((road) => {
      const coords = road.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]);
      const isPrimary = road.properties.road_class === "PRIMARY";
      
      const poly = L.polyline(coords, {
        color: isPrimary ? "#475569" : "#94a3b8",
        weight: isPrimary ? 3 : 2,
        opacity: 0.8
      });

      poly.bindTooltip(`
        <strong>${road.properties.id}</strong> (${road.properties.road_class})<br/>
        Length: ${(road.properties.length_m / 1000).toFixed(1)} km | Speed: ${road.properties.speed_kmh} km/h<br/>
        Travel Time: ${road.properties.travel_time_min} min
      `);

      poly.addTo(roadsLayerRef.current!);
    });
  }, [roads, layerVisibility.roads]);

  // Update Points Layer (Origins and Destinations)
  useEffect(() => {
    if (!pointsLayerRef.current) return;
    pointsLayerRef.current.clearLayers();

    evacPoints.forEach((pt) => {
      const coords: [number, number] = [pt.geometry.coordinates[1], pt.geometry.coordinates[0]];
      const isOrigin = pt.properties.category === "ORIGIN";

      if (isOrigin && !layerVisibility.origins) return;
      if (!isOrigin && !layerVisibility.destinations) return;

      const marker = L.circleMarker(coords, {
        radius: isOrigin ? 6 : 8,
        fillColor: isOrigin ? "#d97706" : "#16a34a",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.95
      });

      marker.bindTooltip(`
        <strong>${pt.properties.name}</strong><br/>
        Type: ${pt.properties.type}<br/>
        Elevation: ${pt.properties.elevation_m}m MSL<br/>
        ${pt.properties.population ? `Population: ${pt.properties.population}` : `Capacity: ${pt.properties.capacity}`}
      `);

      marker.addTo(pointsLayerRef.current!);
    });
  }, [evacPoints, layerVisibility.origins, layerVisibility.destinations]);

  // Update Active Route & Limiting Segment Layer
  useEffect(() => {
    if (!routeLayerRef.current || !mapInstanceRef.current) return;
    routeLayerRef.current.clearLayers();

    if (!activeRoute) return;

    // Collect all coordinates for route
    const routeCoords: [number, number][] = [];
    activeRoute.edges.forEach((edge) => {
      const roadFeat = roads.find((r) => r.properties.id === edge.edge_id);
      if (roadFeat) {
        roadFeat.geometry.coordinates.forEach((c) => {
          routeCoords.push([c[1], c[0]]);
        });
      }
    });

    if (routeCoords.length > 0) {
      // Draw general route line
      L.polyline(routeCoords, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.9
      }).addTo(routeLayerRef.current);

      // Highlight limiting segment if present
      if (activeRoute.limiting_segment) {
        const limitId = activeRoute.limiting_segment.road_id;
        const limitRoad = roads.find((r) => r.properties.id === limitId);
        if (limitRoad) {
          const limitCoords = limitRoad.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]);
          const limitPoly = L.polyline(limitCoords, {
            color: "#dc2626",
            weight: 7,
            opacity: 1.0,
            className: "pulsing-segment"
          }).addTo(routeLayerRef.current);

          limitPoly.bindTooltip(`
            <strong style="color:#b91c1c;">LIMITING SEGMENT: ${limitId}</strong><br/>
            Flood Arrival: ${activeRoute.limiting_segment.flood_arrival_utc}<br/>
            Max Depth: ${activeRoute.limiting_segment.max_depth_m} m<br/>
            Cumulative Travel: ${activeRoute.limiting_segment.cumulative_travel_min} min<br/>
            Deadline UTC: ${activeRoute.limiting_segment.limiting_deadline_utc}
          `, { permanent: true, direction: "top" });
        }
      }
    }
  }, [activeRoute, roads]);

  // Handle Point Query Popup
  useEffect(() => {
    if (!pointQueryData || !mapInstanceRef.current) return;

    const latlng: [number, number] = [pointQueryData.latitude, pointQueryData.longitude];
    const content = `
      <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
        <div style="font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
          ${pointQueryData.nearest_feature_name}
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #64748b;">Flood Arrival:</span>
          <span style="font-weight: 700; color: #0f172a;">${pointQueryData.arrival_time_s ? `${Math.round(pointQueryData.arrival_time_s / 60)} min (${pointQueryData.arrival_time_s}s)` : 'Not Flooded'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #64748b;">Max Depth:</span>
          <span style="font-weight: 700; color: #0f172a;">${pointQueryData.max_depth_m} m</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #64748b;">Max Velocity:</span>
          <span style="font-weight: 700; color: #0f172a;">${pointQueryData.max_velocity_mps} m/s</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
          Source: ${pointQueryData.confidence_label}
        </div>
      </div>
    `;

    if (clickPopupRef.current) {
      clickPopupRef.current.remove();
    }

    clickPopupRef.current = L.popup()
      .setLatLng(latlng)
      .setContent(content)
      .openOn(mapInstanceRef.current);
  }, [pointQueryData]);

  return (
    <div style={{ flex: 1, position: "relative", height: "calc(100vh - 58px)" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
