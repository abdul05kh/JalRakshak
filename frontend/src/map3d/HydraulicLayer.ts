/**
 * HydraulicLayer.ts
 * Manages dynamic HEC-RAS hydraulic flood inundation, depth ramps, arrival isochrones,
 * and 2D flow area computational mesh cells on 3D terrain.
 */

import * as Cesium from "cesium";

export type HydraulicThematicMode = "EXTENT" | "DEPTH" | "ARRIVAL" | "MESH";

export class HydraulicLayer {
  private viewer: Cesium.Viewer;
  private inundationEntities: Cesium.Entity[] = [];
  private meshEntities: Cesium.Entity[] = [];
  private isMeshVisible = false;

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

      let color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.65);

      if (mode === "DEPTH") {
        if (maxDepth < 2.0) {
          color = Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.60); // Shallow
        } else if (maxDepth < 5.0) {
          color = Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.70); // Moderate
        } else if (maxDepth < 10.0) {
          color = Cesium.Color.fromCssColorString("#1d4ed8").withAlpha(0.80); // Deep
        } else {
          color = Cesium.Color.fromCssColorString("#312e81").withAlpha(0.85); // Extreme depth
        }
      } else if (mode === "ARRIVAL") {
        if (arrivalMin <= 15) {
          color = Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.75); // Extreme hazard (<15m)
        } else if (arrivalMin <= 30) {
          color = Cesium.Color.fromCssColorString("#f97316").withAlpha(0.70); // High hazard (15-30m)
        } else if (arrivalMin <= 60) {
          color = Cesium.Color.fromCssColorString("#eab308").withAlpha(0.65); // Moderate (30-60m)
        } else {
          color = Cesium.Color.fromCssColorString("#10b981").withAlpha(0.60); // Low (>60m)
        }
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
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("#0369a1").withAlpha(0.5)
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
              material: color
            }
          });
          this.inundationEntities.push(entity);
        });
      }
    });

    // Generate HEC-RAS 2D computational cell mesh wireframes
    this.generateCellMesh();
  }

  private generateCellMesh(): void {
    this.clearMesh();
    const gridCols = 8;
    const gridRows = 14;
    const minLon = 78.46;
    const maxLon = 78.53;
    const minLat = 30.26;
    const maxLat = 30.39;

    const dLon = (maxLon - minLon) / gridCols;
    const dLat = (maxLat - minLat) / gridRows;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cMinLon = minLon + c * dLon;
        const cMaxLon = cMinLon + dLon;
        const cMinLat = minLat + r * dLat;
        const cMaxLat = cMinLat + dLat;

        const cellPositions = [
          Cesium.Cartesian3.fromDegrees(cMinLon, cMinLat),
          Cesium.Cartesian3.fromDegrees(cMaxLon, cMinLat),
          Cesium.Cartesian3.fromDegrees(cMaxLon, cMaxLat),
          Cesium.Cartesian3.fromDegrees(cMinLon, cMaxLat),
          Cesium.Cartesian3.fromDegrees(cMinLon, cMinLat)
        ];

        const cellEntity = this.viewer.entities.add({
          name: `HEC-RAS 2D Mesh Cell [${r}, ${c}]`,
          properties: new Cesium.PropertyBag({
            cellId: `2D-CELL-${r * gridCols + c + 1}`,
            area_m2: Math.round(dLon * 111320 * dLat * 111320),
            cellCenter: [(cMinLon + cMaxLon) / 2, (cMinLat + cMaxLat) / 2]
          }),
          polyline: {
            positions: cellPositions,
            clampToGround: true,
            width: 1.5,
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.35)
            )
          }
        });
        cellEntity.show = this.isMeshVisible;
        this.meshEntities.push(cellEntity);
      }
    }
  }

  public setVisibility(flood: boolean, mesh: boolean): void {
    this.isMeshVisible = mesh;
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
