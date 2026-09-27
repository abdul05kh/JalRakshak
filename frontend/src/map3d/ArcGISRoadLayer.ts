/**
 * ArcGISRoadLayer.ts
 * Manages 3D terrain-clamped road networks and route edges on ArcGIS Maps SDK 5.1 3D SceneView.
 * Authoritative single-source derivation via getAuthoritativeEdgeBreakdown(scenarioId).
 * ZERO hardcoded coordinates in source code.
 */

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import type { RoadFeature } from "../types";
import { getAuthoritativeEdgeBreakdown } from "../services/decisionStore";

function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/^[T+]/, "").replace(/^\+/, "").trim();
  const parts = clean.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

export class ArcGISRoadLayer {
  private networkLayer: GraphicsLayer;
  private routeLayer: GraphicsLayer;
  private selectedEdgeId: string | null = null;
  private currentScenarioId: string = "SCENARIO_CENTRAL";

  constructor() {
    this.networkLayer = new GraphicsLayer({
      title: "Road Network",
      elevationInfo: { mode: "on-the-ground" },
      opacity: 0.75
    });

    this.routeLayer = new GraphicsLayer({
      title: "Authoritative Evacuation Route",
      elevationInfo: { mode: "on-the-ground" },
      opacity: 0.95
    });
  }

  public getLayers(): GraphicsLayer[] {
    return [this.networkLayer, this.routeLayer];
  }

  public setRoads(
    roads: RoadFeature[],
    selectedEdgeId?: string | null,
    scenarioId: string = "SCENARIO_CENTRAL"
  ): void {
    this.networkLayer.removeAll();
    this.routeLayer.removeAll();
    this.selectedEdgeId = selectedEdgeId || null;
    this.currentScenarioId = scenarioId || "SCENARIO_CENTRAL";

    const edgeBreakdowns = getAuthoritativeEdgeBreakdown(this.currentScenarioId);
    const networkGraphics: Graphic[] = [];
    const routeGraphics: Graphic[] = [];

    // Fallback coordinates for dynamic segments if road features only have coarse LineString
    roads.forEach((road) => {
      const roadId = road.properties.id;
      const coords = road.geometry.coordinates;
      if (road.geometry.type !== "LineString" || !coords || coords.length < 2) return;

      // Check if this road has sub-edges in edge breakdowns (e.g. R02-E01 to R02-E07)
      const matchingEdges = edgeBreakdowns.filter((e) => e.edgeId.startsWith(roadId) || e.edgeId === roadId);

      if (matchingEdges.length > 1) {
        // Subdivide road coordinates dynamically along vertex segments
        const numEdges = matchingEdges.length;
        const totalPoints = coords.length;
        
        matchingEdges.forEach((edge, idx) => {
          // Calculate slice indices for this segment
          const startIdx = Math.floor((idx / numEdges) * (totalPoints - 1));
          const endIdx = Math.min(totalPoints - 1, Math.floor(((idx + 1) / numEdges) * (totalPoints - 1)) + 1);
          const segmentCoords = coords.slice(startIdx, Math.max(startIdx + 2, endIdx + 1));
          
          const polyline = new Polyline({
            paths: [segmentCoords as [number, number][]],
            spatialReference: { wkid: 4326 }
          });

          const isLimiting = edge.isLimiting;
          const isSelected = this.selectedEdgeId === edge.edgeId;

          let lineColor: number[] = [2, 132, 199, 0.95];
          let lineWidth = 4.0;

          if (isLimiting) {
            lineColor = [239, 68, 68, 1.0];
            lineWidth = 6.0;
          } else if (isSelected) {
            lineColor = [56, 189, 248, 1.0];
            lineWidth = 5.5;
          }

          const symbol = new SimpleLineSymbol({
            color: lineColor,
            width: lineWidth
          });

          const travelSec = parseTimeToSeconds(edge.travelToEdgeMin);
          const arrivalSec = parseTimeToSeconds(edge.floodArrivalMin);

          const graphic = new Graphic({
            geometry: polyline,
            symbol,
            attributes: {
              type: "ROAD",
              roadId,
              edgeId: edge.edgeId,
              name: edge.segmentName,
              length_km: edge.lengthKm,
              travel_time: edge.travelToEdgeMin,
              travel_sec: travelSec,
              speed_kmh: edge.speedKmh,
              flood_arrival: edge.floodArrivalMin,
              arrival_sec: arrivalSec,
              margin: edge.marginMin,
              status: isLimiting ? "LIMITING" : edge.status,
              is_limiting: isLimiting,
              hydraulic_threshold: "h >= 0.30 m",
              direction: `${road.properties.u} → ${road.properties.v}`,
              scenarioId: this.currentScenarioId
            }
          });
          routeGraphics.push(graphic);

          // Add waypoint marker
          const midPt = segmentCoords[Math.floor(segmentCoords.length / 2)];
          if (midPt) {
            routeGraphics.push(new Graphic({
              geometry: new Point({
                longitude: midPt[0],
                latitude: midPt[1],
                spatialReference: { wkid: 4326 }
              }),
              symbol: new PointSymbol3D({
                symbolLayers: [
                  new IconSymbol3DLayer({
                    size: isLimiting ? 14 : 10,
                    resource: { primitive: isLimiting ? "square" : "circle" },
                    material: { color: isLimiting ? "#ef4444" : "#38bdf8" }
                  })
                ]
              }),
              attributes: {
                type: "WAYPOINT",
                edgeId: edge.edgeId,
                label: edge.edgeId,
                cumulativeTravel: edge.travelToEdgeMin,
                flood_arrival: edge.floodArrivalMin,
                margin: edge.marginMin,
                is_limiting: isLimiting,
                scenarioId: this.currentScenarioId
              }
            }));
          }
        });
      } else {
        // Standard single road corridor in network
        const polyline = new Polyline({
          paths: [coords as [number, number][]],
          spatialReference: { wkid: 4326 }
        });

        const edge = matchingEdges[0];
        const isLimiting = edge?.isLimiting || false;
        const isSelected = this.selectedEdgeId === roadId;

        const symbol = new SimpleLineSymbol({
          color: isLimiting ? [239, 68, 68, 1.0] : isSelected ? [56, 189, 248, 1.0] : [71, 85, 105, 0.7],
          width: isLimiting ? 5.5 : isSelected ? 4.5 : 2.5
        });

        const graphic = new Graphic({
          geometry: polyline,
          symbol,
          attributes: {
            type: "ROAD",
            roadId,
            edgeId: edge?.edgeId || `${roadId}-MAIN`,
            name: `${road.properties.road_class || "Road"} (${road.properties.u} → ${road.properties.v})`,
            road_class: road.properties.road_class || "Secondary Corridor",
            length_km: roundTo((road.properties.length_m || 5000) / 1000, 2),
            travel_time: `${Math.round(road.properties.travel_time_min || 10)}:00`,
            speed_kmh: road.properties.speed_kmh || 40,
            flood_arrival: edge?.floodArrivalMin || "UNAFFECTED",
            margin: edge?.marginMin || "+99:99",
            status: isLimiting ? "LIMITING" : (edge?.status || "FEASIBLE"),
            is_limiting: isLimiting,
            scenarioId: this.currentScenarioId
          }
        });

        if (edge) {
          routeGraphics.push(graphic);
        } else {
          networkGraphics.push(graphic);
        }
      }
    });

    this.networkLayer.addMany(networkGraphics);
    this.routeLayer.addMany(routeGraphics);
  }

  public highlightEdge(edgeId: string | null): void {
    this.selectedEdgeId = edgeId;
    this.routeLayer.graphics.forEach((graphic) => {
      const gEdgeId = graphic.attributes?.edgeId;
      const isSelected = gEdgeId === edgeId;
      const isLimiting = graphic.attributes?.is_limiting;

      let color = [2, 132, 199, 0.95];
      let width = 4.0;

      if (isLimiting) {
        color = [239, 68, 68, 1.0];
        width = isSelected ? 7.0 : 6.0;
      } else if (isSelected) {
        color = [56, 189, 248, 1.0];
        width = 6.0;
      }

      if (graphic.geometry && graphic.geometry.type === "polyline") {
        graphic.symbol = new SimpleLineSymbol({
          color,
          width
        });
      }
    });
  }

  public setVisibility(allRoads: boolean, r02: boolean): void {
    this.networkLayer.visible = allRoads;
    this.routeLayer.visible = r02;
  }

  public clear(): void {
    this.networkLayer.removeAll();
    this.routeLayer.removeAll();
  }
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
