/**
 * ArcGISRoadLayer.ts
 * Manages 3D terrain-clamped road networks, segmented route edges (R02-E01 to R02-E07),
 * and limiting edge telemetry on ArcGIS Maps SDK 5.1 3D SceneView.
 */

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import type { RoadFeature } from "../types";

// Authoritative R02 Segment Coordinates (7 Edges from Malidewal to Koteshwar / Chamba)
const R02_SEGMENTS: {
  edgeId: string;
  name: string;
  coords: [number, number][];
  lengthKm: number;
  travelTimeMin: string;
  travelSec: number;
  speedKmh: number;
  floodArrivalMin: string;
  arrivalSec: number;
  marginMin: string;
  isLimiting: boolean;
}[] = [
  {
    edgeId: "R02-E01",
    name: "Malidewal Village Exit",
    coords: [[78.4735, 30.3650], [78.4780, 30.3540], [78.4820, 30.3450]],
    lengthKm: 0.8,
    travelTimeMin: "01:12",
    travelSec: 72,
    speedKmh: 40,
    floodArrivalMin: "T+90:00",
    arrivalSec: 5400,
    marginMin: "+85:48",
    isLimiting: false
  },
  {
    edgeId: "R02-E02",
    name: "Bhagirathi Valley Upper Link",
    coords: [[78.4820, 30.3450], [78.4865, 30.3340], [78.4900, 30.3220]],
    lengthKm: 1.4,
    travelTimeMin: "02:52",
    travelSec: 172,
    speedKmh: 50,
    floodArrivalMin: "T+80:00",
    arrivalSec: 4800,
    marginMin: "+74:08",
    isLimiting: false
  },
  {
    edgeId: "R02-E03",
    name: "Jakhnidhar Junction",
    coords: [[78.4900, 30.3220], [78.4930, 30.3120], [78.4955, 30.3040]],
    lengthKm: 1.9,
    travelTimeMin: "05:08",
    travelSec: 308,
    speedKmh: 50,
    floodArrivalMin: "T+75:00",
    arrivalSec: 4500,
    marginMin: "+66:52",
    isLimiting: false
  },
  {
    edgeId: "R02-E04",
    name: "Tipri Lowland Bypass",
    coords: [[78.4955, 30.3040], [78.4968, 30.2980], [78.4975, 30.2920]],
    lengthKm: 1.2,
    travelTimeMin: "06:44",
    travelSec: 404,
    speedKmh: 45,
    floodArrivalMin: "T+70:00",
    arrivalSec: 4200,
    marginMin: "+60:16",
    isLimiting: false
  },
  {
    edgeId: "R02-E05",
    name: "Koteshwar North Terrace",
    coords: [[78.4975, 30.2920], [78.4980, 30.2890], [78.4985, 30.2860]],
    lengthKm: 1.6,
    travelTimeMin: "08:39",
    travelSec: 519,
    speedKmh: 50,
    floodArrivalMin: "T+68:00",
    arrivalSec: 4080,
    marginMin: "+56:21",
    isLimiting: false
  },
  {
    edgeId: "R02-E06",
    name: "Lower Canyon Bridge Approach",
    coords: [[78.4985, 30.2860], [78.4998, 30.2848], [78.5005, 30.2840]],
    lengthKm: 1.5,
    travelTimeMin: "10:39",
    travelSec: 639,
    speedKmh: 45,
    floodArrivalMin: "T+64:00",
    arrivalSec: 3840,
    marginMin: "+50:21",
    isLimiting: false
  },
  {
    edgeId: "R02-E07",
    name: "Koteshwar Riverbank Limiting Segment",
    coords: [
      [78.4985, 30.2860],
      [78.5005, 30.2840],
      [78.5020, 30.2825],
      [78.5035, 30.2805]
    ],
    lengthKm: 2.1,
    travelTimeMin: "12:39",
    travelSec: 759,
    speedKmh: 50,
    floodArrivalMin: "T+60:00",
    arrivalSec: 3600,
    marginMin: "+44:21",
    isLimiting: true
  }
];

export class ArcGISRoadLayer {
  private networkLayer: GraphicsLayer;
  private routeLayer: GraphicsLayer;
  private selectedEdgeId: string | null = null;

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

  public setRoads(roads: RoadFeature[], selectedEdgeId?: string | null): void {
    this.networkLayer.removeAll();
    this.routeLayer.removeAll();
    this.selectedEdgeId = selectedEdgeId || null;

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

    // 2. Add Authoritative R02 Segments with Directional Flow & Edge Telemetry
    const routeGraphics: Graphic[] = [];
    R02_SEGMENTS.forEach((seg) => {
      const polyline = new Polyline({
        paths: [seg.coords],
        spatialReference: { wkid: 4326 }
      });

      const isLimiting = seg.isLimiting;
      const isSelected = this.selectedEdgeId === seg.edgeId;

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

      const graphic = new Graphic({
        geometry: polyline,
        symbol,
        attributes: {
          type: "ROAD",
          roadId: "R02",
          edgeId: seg.edgeId,
          name: seg.name,
          length_km: seg.lengthKm,
          travel_time: seg.travelTimeMin,
          travel_sec: seg.travelSec,
          speed_kmh: seg.speedKmh,
          flood_arrival: seg.floodArrivalMin,
          arrival_sec: seg.arrivalSec,
          margin: seg.marginMin,
          status: isLimiting ? "LIMITING" : "FEASIBLE",
          is_limiting: isLimiting,
          hydraulic_threshold: "h >= 0.30 m",
          direction: "Malidewal (Origin) → Koteshwar (Shelter / Destination)"
        }
      });

      routeGraphics.push(graphic);

      // Add directional sequence waypoint badge along road geometry
      const midIdx = Math.floor(seg.coords.length / 2);
      const midCoord = seg.coords[midIdx];
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
          edgeId: seg.edgeId,
          label: seg.edgeId,
          cumulativeTravel: seg.travelTimeMin,
          is_limiting: isLimiting
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
