/**
 * RoadLayer.ts
 * Manages 3D terrain-clamped road networks, route alternatives (R02), and limiting segment (R02-E07).
 */

import * as Cesium from "cesium";
import type { RoadFeature } from "../types";

export interface RoadLayerOptions {
  onSelectRoad?: (roadId: string, edgeId?: string, clickCoord?: { lon: number; lat: number; elev: number }) => void;
}

export class RoadLayer {
  private viewer: Cesium.Viewer;
  private roadEntities: Map<string, Cesium.Entity> = new Map();
  private limitingSegmentEntity: Cesium.Entity | null = null;

  constructor(viewer: Cesium.Viewer, _options: RoadLayerOptions = {}) {
    this.viewer = viewer;
  }

  public setRoads(roads: RoadFeature[], _selectedEdgeId?: string | null): void {
    this.clear();

    roads.forEach((road) => {
      const roadId = road.properties.id;
      const isR02 = roadId === "R02";
      const geomType = road.geometry.type;
      const coords = road.geometry.coordinates;

      if (geomType === "LineString") {
        const positions = (coords as [number, number][]).map(([lon, lat]) =>
          Cesium.Cartesian3.fromDegrees(lon, lat)
        );

        let color = Cesium.Color.fromCssColorString("#64748b").withAlpha(0.65);
        let width = 3;

        if (isR02) {
          color = Cesium.Color.fromCssColorString("#06b6d4").withAlpha(0.95);
          width = 6;
        }

        const entity = this.viewer.entities.add({
          name: `Road ${roadId}`,
          properties: new Cesium.PropertyBag({
            roadId,
            road_class: road.properties.road_class,
            length_m: road.properties.length_m,
            travel_time_min: road.properties.travel_time_min,
            speed_kmh: road.properties.speed_kmh
          }),
          polyline: {
            positions,
            clampToGround: true,
            width,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color,
              outlineColor: Cesium.Color.BLACK.withAlpha(0.4),
              outlineWidth: 1.5
            })
          }
        });

        this.roadEntities.set(roadId, entity);
      }
    });

    // Explicit Limiting Segment R02-E07 (Koteshwar riverbank corridor)
    this.createLimitingSegment();
  }

  private createLimitingSegment(): void {
    // R02-E07 exact geographic LineString along Koteshwar corridor
    const r02E07Coords: [number, number][] = [
      [78.4985, 30.2860],
      [78.5005, 30.2840],
      [78.5020, 30.2825],
      [78.5035, 30.2805]
    ];

    const positions = r02E07Coords.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));

    this.limitingSegmentEntity = this.viewer.entities.add({
      name: "Limiting Segment R02-E07",
      properties: new Cesium.PropertyBag({
        edgeId: "R02-E07",
        roadId: "R02",
        status: "LIMITING_BOTTLENECK",
        arrival_s: 540,
        arrival_min: 9.0,
        flood_depth_m: 8.2,
        velocity_mps: 4.5,
        elevation_m: 983.34
      }),
      polyline: {
        positions,
        clampToGround: true,
        width: 10,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.35,
          color: Cesium.Color.fromCssColorString("#ef4444")
        })
      }
    });
  }

  public setVisibility(allRoads: boolean, r02: boolean, limiting: boolean): void {
    this.roadEntities.forEach((entity, id) => {
      if (id === "R02") {
        entity.show = r02;
      } else {
        entity.show = allRoads;
      }
    });

    if (this.limitingSegmentEntity) {
      this.limitingSegmentEntity.show = limiting;
    }
  }

  public highlightEdge(edgeId: string | null): void {
    if (this.limitingSegmentEntity) {
      if (edgeId === "R02-E07" || edgeId === "R02") {
        this.limitingSegmentEntity.polyline!.width = new Cesium.ConstantProperty(14);
      } else {
        this.limitingSegmentEntity.polyline!.width = new Cesium.ConstantProperty(10);
      }
    }
  }

  public clear(): void {
    this.roadEntities.forEach((entity) => this.viewer.entities.remove(entity));
    this.roadEntities.clear();
    if (this.limitingSegmentEntity) {
      this.viewer.entities.remove(this.limitingSegmentEntity);
      this.limitingSegmentEntity = null;
    }
  }
}
