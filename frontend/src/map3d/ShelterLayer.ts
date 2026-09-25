/**
 * ShelterLayer.ts
 * Manages evacuation destinations (Chamba Safe Shelter, Kunjapuri) and origin settlements on 3D terrain.
 */

import * as Cesium from "cesium";
import type { EvacuationPointFeature } from "../types";

export class ShelterLayer {
  private viewer: Cesium.Viewer;
  private originEntities: Cesium.Entity[] = [];
  private shelterEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  public setEvacuationPoints(points: EvacuationPointFeature[]): void {
    this.clear();

    points.forEach((pt) => {
      const { id, name, type, population, category } = pt.properties;
      const [lon, lat] = pt.geometry.coordinates;
      const isShelter = category === "DESTINATION" || type === "SHELTER" || type === "EMERGENCY_CENTER";
      const isChamba = id === "SHELTER-01";

      const position = Cesium.Cartesian3.fromDegrees(lon, lat);

      if (isShelter) {
        const entity = this.viewer.entities.add({
          name: `${name} (${isChamba ? "Primary Safe Shelter" : "Relief Shelter"})`,
          properties: new Cesium.PropertyBag({
            id,
            name,
            type: "SHELTER",
            elevation_m: pt.properties.elevation_m || (isChamba ? 1648.5 : 1200.0)
          }),
          position,
          point: {
            pixelSize: isChamba ? 14 : 10,
            color: Cesium.Color.fromCssColorString("#10b981"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: isChamba ? `SAFE SHELTER: CHAMBA (1648m)` : name,
            font: isChamba ? "bold 12px Inter, sans-serif" : "11px Inter, sans-serif",
            fillColor: isChamba ? Cesium.Color.fromCssColorString("#6ee7b7") : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -14),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        this.shelterEntities.push(entity);
      } else {
        // Origin settlement
        const entity = this.viewer.entities.add({
          name: `${name} (Origin Settlement)`,
          properties: new Cesium.PropertyBag({
            id,
            name,
            type: "ORIGIN",
            population
          }),
          position,
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString("#f97316"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: name,
            font: "10px Inter, sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#fed7aa"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2.5,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        this.originEntities.push(entity);
      }
    });
  }

  public setVisibility(shelters: boolean, origins: boolean): void {
    this.shelterEntities.forEach((e) => (e.show = shelters));
    this.originEntities.forEach((e) => (e.show = origins));
  }

  public clear(): void {
    this.shelterEntities.forEach((e) => this.viewer.entities.remove(e));
    this.shelterEntities = [];
    this.originEntities.forEach((e) => this.viewer.entities.remove(e));
    this.originEntities = [];
  }
}
