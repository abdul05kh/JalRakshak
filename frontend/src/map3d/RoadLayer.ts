/**
 * RoadLayer.ts
 * Manages 3D terrain-clamped road networks, segmented route edges (R02-E01 to R02-E07),
 * directional evacuation traversal animation, and interactive road edge selection.
 */

import * as Cesium from "cesium";
import type { RoadFeature } from "../types";

export interface RoadLayerOptions {
  onSelectRoad?: (roadId: string, edgeId?: string, clickCoord?: { lon: number; lat: number; elev: number }) => void;
}

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

export class RoadLayer {
  private viewer: Cesium.Viewer;
  private roadEntities: Map<string, Cesium.Entity> = new Map();
  private edgeEntities: Map<string, Cesium.Entity> = new Map();
  private selectedEdgeId: string | null = null;

  constructor(viewer: Cesium.Viewer, _options: RoadLayerOptions = {}) {
    this.viewer = viewer;
  }

  public setRoads(roads: RoadFeature[], selectedEdgeId?: string | null): void {
    this.clear();
    this.selectedEdgeId = selectedEdgeId || null;

    // 1. Add background network roads (R01, R03, secondary corridors)
    roads.forEach((road) => {
      const roadId = road.properties.id;
      if (roadId === "R02") return; // R02 handled with high-fidelity edge segmentation

      const geomType = road.geometry.type;
      const coords = road.geometry.coordinates;

      if (geomType === "LineString") {
        const positions = (coords as [number, number][]).map(([lon, lat]) =>
          Cesium.Cartesian3.fromDegrees(lon, lat)
        );

        const entity = this.viewer.entities.add({
          name: `Road Network ${roadId}`,
          properties: new Cesium.PropertyBag({
            roadId,
            edgeId: `${roadId}-MAIN`,
            road_class: road.properties.road_class || "Secondary Corridor",
            length_m: road.properties.length_m || 8500,
            travel_time_min: road.properties.travel_time_min || "18:00",
            speed_kmh: road.properties.speed_kmh || 45,
            status: "FEASIBLE"
          }),
          polyline: {
            positions,
            clampToGround: true,
            width: 2.5,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color: Cesium.Color.fromCssColorString("#475569").withAlpha(0.60),
              outlineColor: Cesium.Color.BLACK.withAlpha(0.3),
              outlineWidth: 1.0
            })
          }
        });

        this.roadEntities.set(roadId, entity);
      }
    });

    // 2. Add Authoritative R02 Segments with Directional Flow & Edge Telemetry
    R02_SEGMENTS.forEach((seg) => {
      const positions = seg.coords.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));
      const isLimiting = seg.isLimiting;
      const isSelected = this.selectedEdgeId === seg.edgeId;

      let lineColor = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.90); // Muted steel blue
      let lineWidth = 5;

      if (isLimiting) {
        lineColor = Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.95); // Hazard red
        lineWidth = 8;
      } else if (isSelected) {
        lineColor = Cesium.Color.fromCssColorString("#38bdf8").withAlpha(1.0);
        lineWidth = 8;
      }

      const entity = this.viewer.entities.add({
        name: `Road Segment ${seg.edgeId} — ${seg.name}`,
        properties: new Cesium.PropertyBag({
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
        }),
        polyline: {
          positions,
          clampToGround: true,
          width: lineWidth,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: lineColor,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
            outlineWidth: 1.5
          })
        }
      });

      this.edgeEntities.set(seg.edgeId, entity);
    });
  }

  public setVisibility(allRoads: boolean, r02: boolean, limiting: boolean): void {
    this.roadEntities.forEach((entity) => {
      entity.show = allRoads;
    });

    this.edgeEntities.forEach((entity, edgeId) => {
      if (edgeId === "R02-E07") {
        entity.show = limiting || r02;
      } else {
        entity.show = r02;
      }
    });
  }

  public highlightEdge(edgeId: string | null): void {
    this.selectedEdgeId = edgeId;
    this.edgeEntities.forEach((entity, id) => {
      const isSelected = id === edgeId;
      const isLimiting = id === "R02-E07";

      if (entity.polyline) {
        if (isSelected) {
          entity.polyline.width = new Cesium.ConstantProperty(10);
        } else if (isLimiting) {
          entity.polyline.width = new Cesium.ConstantProperty(8);
        } else {
          entity.polyline.width = new Cesium.ConstantProperty(5);
        }
      }
    });
  }

  public clear(): void {
    this.roadEntities.forEach((entity) => this.viewer.entities.remove(entity));
    this.roadEntities.clear();
    this.edgeEntities.forEach((entity) => this.viewer.entities.remove(entity));
    this.edgeEntities.clear();
  }
}
