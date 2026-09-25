/**
 * HydraulicLayer.ts
 * Manages dynamic HEC-RAS hydraulic flood inundation, continuous depth ramps,
 * arrival isochrones, and computational 2D flow area on 3D terrain.
 */

import * as Cesium from "cesium";

export type HydraulicThematicMode = "EXTENT" | "DEPTH" | "ARRIVAL" | "MESH";

export class HydraulicLayer {
  private viewer: Cesium.Viewer;
  private inundationEntities: Cesium.Entity[] = [];
  private meshEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  public setInundationData(
    geoJsonData: any,
    mode: HydraulicThematicMode = "EXTENT",
    timeStep: string = "T+60"
  ): void {
    this.clearInundation();

    if (!geoJsonData || !geoJsonData.features) return;

    // Parse time in minutes from timeStep string (e.g. "T+45" -> 45)
    const timeMatch = timeStep.match(/T\+(\d+)/);
    const currentTimeMin = timeMatch ? parseInt(timeMatch[1], 10) : 60;

    geoJsonData.features.forEach((feat: any, idx: number) => {
      const props = feat.properties || {};
      const maxDepth = props.max_depth_m || props.depth_m || 5.0;
      const arrivalMin = props.arrival_min || (props.arrival_s ? props.arrival_s / 60 : 15.0);

      // Filter feature based on arrival time relative to current simulation timestep
      if (arrivalMin > currentTimeMin && currentTimeMin > 0) {
        return;
      }

      // Restrained Government Intelligence Colormap (No yellow blankets, seamless terrain drape)
      let color: Cesium.Color;

      if (mode === "EXTENT") {
        // Mode 1: FLOOD EXTENT (Binary modeled footprint h >= 0.30m)
        color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.55);
      } else if (mode === "DEPTH") {
        // Mode 2: FLOOD DEPTH (Continuous multi-hue hydraulic blue ramp)
        if (maxDepth < 0.30) {
          return; // Sub-threshold (<0.30m transparent)
        } else if (maxDepth < 1.0) {
          // 0.30 - 1.0m: Light hydraulic blue
          color = Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.55);
        } else if (maxDepth < 3.0) {
          // 1.0 - 3.0m: Medium cyan-blue
          color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.65);
        } else if (maxDepth < 6.0) {
          // 3.0 - 6.0m: Deeper blue
          color = Cesium.Color.fromCssColorString("#0369a1").withAlpha(0.75);
        } else if (maxDepth < 15.0) {
          // 6.0 - 15.0m: Dark high-depth blue
          color = Cesium.Color.fromCssColorString("#1d4ed8").withAlpha(0.85);
        } else {
          // > 15.0m: Extreme depth indigo
          color = Cesium.Color.fromCssColorString("#312e81").withAlpha(0.90);
        }
      } else if (mode === "ARRIVAL") {
        // Mode 3: FLOOD ARRIVAL (Isochrone temporal bands)
        if (arrivalMin <= 30) {
          color = Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.70); // <30 min: Critical
        } else if (arrivalMin <= 45) {
          color = Cesium.Color.fromCssColorString("#f97316").withAlpha(0.65); // 30-45 min: High
        } else if (arrivalMin <= 60) {
          color = Cesium.Color.fromCssColorString("#f59e0b").withAlpha(0.60); // 45-60 min: Moderate
        } else if (arrivalMin <= 90) {
          color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.55); // 60-90 min: Low
        } else {
          color = Cesium.Color.fromCssColorString("#334155").withAlpha(0.50); // >90 min: Minimal
        }
      } else {
        color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.55);
      }

      const geom = feat.geometry;
      if (geom.type === "Polygon") {
        const ring = geom.coordinates[0];
        const positions = ring.map(([lon, lat]: [number, number]) => Cesium.Cartesian3.fromDegrees(lon, lat));

        const entity = this.viewer.entities.add({
          name: `HEC-RAS Inundation Cell ${idx + 1}`,
          properties: new Cesium.PropertyBag({
            cellId: `HEC-CELL-${idx + 1}`,
            depth_m: maxDepth,
            arrival_min: arrivalMin,
            wse_m: props.wse_m || 650.0 + maxDepth,
            timestep: timeStep
          }),
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            classificationType: Cesium.ClassificationType.TERRAIN,
            material: color,
            outline: false // Explicitly disable outline to eliminate z-fighting raster artifacts
          }
        });
        this.inundationEntities.push(entity);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((poly: any) => {
          const ring = poly[0];
          const positions = ring.map(([lon, lat]: [number, number]) => Cesium.Cartesian3.fromDegrees(lon, lat));

          const entity = this.viewer.entities.add({
            name: `HEC-RAS Inundation Cell ${idx + 1}`,
            properties: new Cesium.PropertyBag({
              cellId: `HEC-CELL-${idx + 1}`,
              depth_m: maxDepth,
              arrival_min: arrivalMin,
              wse_m: props.wse_m || 650.0 + maxDepth,
              timestep: timeStep
            }),
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy(positions),
              classificationType: Cesium.ClassificationType.TERRAIN,
              material: color,
              outline: false
            }
          });
          this.inundationEntities.push(entity);
        });
      }
    });
  }

  public setVisibility(flood: boolean, mesh: boolean): void {
    this.inundationEntities.forEach((e) => (e.show = flood));
    this.meshEntities.forEach((e) => (e.show = mesh));
  }

  public clearInundation(): void {
    this.inundationEntities.forEach((e) => this.viewer.entities.remove(e));
    this.inundationEntities = [];
  }

  public clearMesh(): void {
    this.meshEntities.forEach((e) => this.viewer.entities.remove(e));
    this.meshEntities = [];
  }

  public clear(): void {
    this.clearInundation();
    this.clearMesh();
  }
}
