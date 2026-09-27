/**
 * ArcGISRoadLayer.ts
 * Manages 3D terrain-clamped road networks, segmented route edges (R02-E01 to R02-E07),
 * and limiting edge telemetry on ArcGIS Maps SDK 5.1 3D SceneView.
 * Authoritative single-source derivation via getAuthoritativeEdgeBreakdown(scenarioId).
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

// Base geometry definitions for R02 7 segments from Malidewal to Koteshwar / Chamba
const R02_BASE_GEOMETRIES: { edgeId: string; coords: [number, number][] }[] = [
  {
    edgeId: "R02-E01",
    coords: [[78.4735, 30.3650], [78.4780, 30.3540], [78.4820, 30.3450]]
  },
  {
    edgeId: "R02-E02",
    coords: [[78.4820, 30.3450], [78.4865, 30.3340], [78.4900, 30.3220]]
  },
  {
    edgeId: "R02-E03",
    coords: [[78.4900, 30.3220], [78.4930, 30.3120], [78.4955, 30.3040]]
  },
  {
    edgeId: "R02-E04",
    coords: [[78.4955, 30.3040], [78.4968, 30.2980], [78.4975, 30.2920]]
  },
  {
    edgeId: "R02-E05",
    coords: [[78.4975, 30.2920], [78.4980, 30.2890], [78.4985, 30.2860]]
  },
  {
    edgeId: "R02-E06",
    coords: [[78.4985, 30.2860], [78.4998, 30.2848], [78.5005, 30.2840]]
  },
  {
    edgeId: "R02-E07",
    coords: [
      [78.4985, 30.2860],
      [78.5005, 30.2840],
      [78.5020, 30.2825],
      [78.5035, 30.2805]
    ]
  }
];

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
      title: "Authoritative Route R02",
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

    // 1. Add background network roads (R01, R03, etc.)
    const networkGraphics: Graphic[] = [];
    roads.forEach((road) => {
      const roadId = road.properties.id;
      if (roadId === "R02") return; // Handled with high-precision edge segmentation

      const coords = road.geometry.coordinates;
      if (road.geometry.type === "LineString") {
        const polyline = new Polyline({
          paths: [coords as [number, number][]],
          spatialReference: { wkid: 4326 }
        });

        const symbol = new SimpleLineSymbol({
          color: [71, 85, 105, 0.7],
          width: 2.5
        });

        const graphic = new Graphic({
          geometry: polyline,
          symbol,
          attributes: {
            type: "ROAD",
            roadId,
            edgeId: `${roadId}-MAIN`,
            road_class: road.properties.road_class || "Secondary Corridor",
            length_m: road.properties.length_m || 8500,
            travel_time_min: road.properties.travel_time_min || "18:00",
            status: "FEASIBLE"
          }
        });

        networkGraphics.push(graphic);
      }
    });
    this.networkLayer.addMany(networkGraphics);

    // 2. Add Authoritative R02 Segments derived dynamically from backend decision store
    const edgeBreakdowns = getAuthoritativeEdgeBreakdown(this.currentScenarioId);
    const routeGraphics: Graphic[] = [];

    R02_BASE_GEOMETRIES.forEach((base) => {
      const edge = edgeBreakdowns.find((e) => e.edgeId === base.edgeId) || {
        edgeId: base.edgeId,
        segmentName: "Segment " + base.edgeId,
        lengthKm: 1.5,
        speedKmh: 50,
        travelToEdgeMin: "10:00",
        floodArrivalMin: "T+60:00",
        marginMin: "+50:00",
        status: "FEASIBLE",
        isLimiting: base.edgeId === "R02-E07"
      };

      const polyline = new Polyline({
        paths: [base.coords],
        spatialReference: { wkid: 4326 }
      });

      const isLimiting = edge.isLimiting;
      const isSelected = this.selectedEdgeId === edge.edgeId;

      let lineColor: number[] = [2, 132, 199, 0.95]; // Steel blue
      let lineWidth = 4.0;

      if (isLimiting) {
        lineColor = [239, 68, 68, 1.0]; // Hazard red
        lineWidth = 6.0;
      } else if (isSelected) {
        lineColor = [56, 189, 248, 1.0]; // Active cyan
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
          roadId: "R02",
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
          direction: "Malidewal (Origin) → Koteshwar (Shelter / Destination)",
          scenarioId: this.currentScenarioId
        }
      });

      routeGraphics.push(graphic);

      // Add directional sequence waypoint badge along road geometry
      const midIdx = Math.floor(base.coords.length / 2);
      const midCoord = base.coords[midIdx];
      const waypointGraphic = new Graphic({
        geometry: new Point({
          longitude: midCoord[0],
          latitude: midCoord[1],
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
      });
      routeGraphics.push(waypointGraphic);
    });
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

      graphic.symbol = new SimpleLineSymbol({
        color,
        width
      });
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
