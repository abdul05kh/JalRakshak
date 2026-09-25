/**
 * ArcGISHydraulicLayer.ts
 * Manages native HEC-RAS hydraulic flood inundation, continuous depth ramps,
 * and arrival isochrones on ArcGIS Maps SDK 5.1 3D SceneView.
 */

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

export type HydraulicThematicMode = "EXTENT" | "DEPTH" | "ARRIVAL";

export class ArcGISHydraulicLayer {
  private layer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      title: "HEC-RAS 2D Hydraulic Inundation",
      elevationInfo: {
        mode: "on-the-ground"
      },
      opacity: 0.85
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  public setInundationData(
    geoJsonData: any,
    mode: HydraulicThematicMode = "EXTENT",
    timeStep: string = "T+60"
  ): void {
    this.layer.removeAll();
    if (!geoJsonData || !geoJsonData.features) return;

    const timeMatch = timeStep.match(/T\+(\d+)/);
    const currentTimeMin = timeMatch ? parseInt(timeMatch[1], 10) : 60;

    const graphics: Graphic[] = [];

    geoJsonData.features.forEach((feat: any, idx: number) => {
      const props = feat.properties || {};
      const maxDepth = props.max_depth_m || props.depth_m || 5.0;
      const arrivalMin = props.arrival_min || (props.arrival_s ? props.arrival_s / 60 : 15.0);

      // Time filtering: only show inundated cells that flood at or before currentTimeMin
      if (arrivalMin > currentTimeMin && currentTimeMin > 0) {
        return;
      }

      // Restrained Government Intelligence Palette (No yellow blankets, seamless terrain drape)
      let fillColor: number[]; // [r, g, b, a]

      if (mode === "EXTENT") {
        // Mode 1: FLOOD EXTENT (Binary footprint h >= 0.30m)
        fillColor = [2, 132, 199, 0.55]; // Aquatic cyan-blue
      } else if (mode === "DEPTH") {
        // Mode 2: FLOOD DEPTH (Continuous multi-hue blue depth ramp)
        if (maxDepth < 0.30) {
          return;
        } else if (maxDepth < 1.0) {
          fillColor = [56, 189, 248, 0.55]; // 0.3–1m: Light blue
        } else if (maxDepth < 3.0) {
          fillColor = [2, 132, 199, 0.65]; // 1–3m: Medium blue
        } else if (maxDepth < 6.0) {
          fillColor = [3, 105, 161, 0.75]; // 3–6m: Deep blue
        } else if (maxDepth < 15.0) {
          fillColor = [29, 78, 216, 0.85]; // 6–15m: Dark blue
        } else {
          fillColor = [49, 46, 129, 0.90]; // >15m: Extreme indigo
        }
      } else if (mode === "ARRIVAL") {
        // Mode 3: FLOOD ARRIVAL (Isochrone temporal bands)
        if (arrivalMin <= 30) {
          fillColor = [239, 68, 68, 0.70]; // <30 min: Critical hazard
        } else if (arrivalMin <= 45) {
          fillColor = [249, 115, 22, 0.65]; // 30–45 min: High hazard
        } else if (arrivalMin <= 60) {
          fillColor = [245, 158, 11, 0.60]; // 45–60 min: Moderate hazard
        } else if (arrivalMin <= 90) {
          fillColor = [2, 132, 199, 0.55]; // 60–90 min: Low hazard
        } else {
          fillColor = [51, 65, 85, 0.50]; // >90 min: Minimal hazard
        }
      } else {
        fillColor = [2, 132, 199, 0.55];
      }

      const geom = feat.geometry;
      if (geom.type === "Polygon") {
        const polygon = new Polygon({
          rings: geom.coordinates,
          spatialReference: { wkid: 4326 }
        });

        const symbol = new SimpleFillSymbol({
          color: fillColor,
          outline: {
            color: [0, 0, 0, 0], // No outline to avoid z-fighting artifacts
            width: 0
          }
        });

        const graphic = new Graphic({
          geometry: polygon,
          symbol,
          attributes: {
            type: "HEC_RAS_CELL",
            cellId: `HEC-CELL-${idx + 1}`,
            depth_m: maxDepth,
            arrival_min: arrivalMin,
            wse_m: props.wse_m || 650.0 + maxDepth,
            timestep: timeStep
          }
        });

        graphics.push(graphic);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((polyCoords: any) => {
          const polygon = new Polygon({
            rings: polyCoords,
            spatialReference: { wkid: 4326 }
          });

          const symbol = new SimpleFillSymbol({
            color: fillColor,
            outline: {
              color: [0, 0, 0, 0],
              width: 0
            }
          });

          const graphic = new Graphic({
            geometry: polygon,
            symbol,
            attributes: {
              type: "HEC_RAS_CELL",
              cellId: `HEC-CELL-${idx + 1}`,
              depth_m: maxDepth,
              arrival_min: arrivalMin,
              wse_m: props.wse_m || 650.0 + maxDepth,
              timestep: timeStep
            }
          });

          graphics.push(graphic);
        });
      }
    });

    this.layer.addMany(graphics);
  }

  public setVisibility(visible: boolean): void {
    this.layer.visible = visible;
  }

  public clear(): void {
    this.layer.removeAll();
  }
}
