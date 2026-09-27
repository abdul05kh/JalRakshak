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
      if (arrivalMin > currentTimeMin) {
        return;
      }

      // Restrained Government Intelligence Palette (No yellow blankets, seamless terrain drape)
      let fillColor: number[]; // [r, g, b, a]
      let outlineColor: number[] = [56, 189, 248, 0.6];
      let outlineWidth: number = 1.0;

      if (mode === "EXTENT") {
        // Mode 1: FLOOD EXTENT (Binary footprint h >= 0.30m)
        fillColor = [14, 165, 233, 0.75]; // Aquatic cyan
        outlineColor = [56, 189, 248, 0.95];
        outlineWidth = 1.5;
      } else if (mode === "DEPTH") {
        // Mode 2: FLOOD DEPTH (Continuous multi-hue depth ramp)
        if (maxDepth < 0.30) {
          return;
        } else if (maxDepth < 1.0) {
          fillColor = [56, 189, 248, 0.75]; // 0.3–1m: Light cyan
          outlineColor = [125, 211, 252, 0.9];
          outlineWidth = 1.0;
        } else if (maxDepth < 3.0) {
          fillColor = [2, 132, 199, 0.80]; // 1–3m: Medium blue
          outlineColor = [56, 189, 248, 0.9];
          outlineWidth = 1.0;
        } else if (maxDepth < 6.0) {
          fillColor = [37, 99, 235, 0.85]; // 3–6m: Deep royal blue
          outlineColor = [96, 165, 250, 0.9];
          outlineWidth = 1.2;
        } else if (maxDepth < 15.0) {
          fillColor = [29, 78, 216, 0.90]; // 6–15m: Dark blue
          outlineColor = [147, 197, 253, 0.9];
          outlineWidth = 1.5;
        } else {
          fillColor = [49, 46, 129, 0.95]; // >15m: Extreme indigo
          outlineColor = [199, 210, 254, 1.0];
          outlineWidth = 1.8;
        }
      } else if (mode === "ARRIVAL") {
        // Mode 3: FLOOD ARRIVAL (Isochrone temporal bands)
        if (arrivalMin <= 30) {
          fillColor = [239, 68, 68, 0.85]; // <30 min: Critical hazard (Crimson)
          outlineColor = [254, 202, 202, 1.0];
          outlineWidth = 1.5;
        } else if (arrivalMin <= 45) {
          fillColor = [249, 115, 22, 0.80]; // 30–45 min: High hazard (Orange)
          outlineColor = [254, 215, 170, 1.0];
          outlineWidth = 1.2;
        } else if (arrivalMin <= 60) {
          fillColor = [245, 158, 11, 0.75]; // 45–60 min: Moderate hazard (Amber)
          outlineColor = [254, 240, 138, 1.0];
          outlineWidth = 1.2;
        } else if (arrivalMin <= 90) {
          fillColor = [2, 132, 199, 0.70]; // 60–90 min: Low hazard (Blue)
          outlineColor = [186, 230, 253, 1.0];
          outlineWidth = 1.0;
        } else {
          fillColor = [71, 85, 105, 0.60]; // >90 min: Minimal hazard (Slate)
          outlineColor = [203, 213, 225, 0.8];
          outlineWidth = 1.0;
        }
      } else {
        fillColor = [14, 165, 233, 0.75];
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
            color: outlineColor,
            width: outlineWidth
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
            wse_m: props.wse_m !== undefined ? props.wse_m : null,
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
              color: outlineColor,
              width: outlineWidth
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
              wse_m: props.wse_m !== undefined ? props.wse_m : null,
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
