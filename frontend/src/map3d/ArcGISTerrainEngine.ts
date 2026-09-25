/**
 * ArcGISTerrainEngine.ts
 * Core 3D Geospatial Engine for JalRakshak using ArcGIS Maps SDK for JavaScript 5.1
 * Orchestrates Map, SceneView, Copernicus GLO-30 DSM BaseElevationLayer, camera, layers, and hit-testing.
 */

import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import { GLO30ElevationLayer } from "./GLO30ElevationLayer";
import { ArcGISHydraulicLayer, type HydraulicThematicMode } from "./ArcGISHydraulicLayer";
import { ArcGISRoadLayer } from "./ArcGISRoadLayer";
import { ArcGISCameraController, type AUTHORITATIVE_CAMERA_PRESETS } from "./ArcGISCameraController";
import type { RoadFeature, EvacuationPointFeature } from "../types";

export interface TerrainEngineCallbacks {
  onCursorMove?: (info: { lon: number; lat: number; elevation_m: number }) => void;
  onPickEntity?: (info: {
    type: "TERRAIN" | "ROAD" | "DAM" | "BREACH" | "SHELTER" | "HEC_RAS_CELL";
    title: string;
    properties: Record<string, any>;
    coordinate: { lon: number; lat: number; elev_m: number };
  }) => void;
  onDiagnosticState?: (state: string, details?: any) => void;
}

export class ArcGISTerrainEngine {
  private container: HTMLDivElement;
  private map: Map | null = null;
  private view: SceneView | null = null;
  private elevationLayer: any = null;
  private hydraulicLayer: ArcGISHydraulicLayer | null = null;
  private roadLayer: ArcGISRoadLayer | null = null;
  private infrastructureLayer: GraphicsLayer | null = null;
  private cameraController: ArcGISCameraController | null = null;
  private callbacks: TerrainEngineCallbacks;
  private isDestroyed = false;

  constructor(container: HTMLDivElement, callbacks: TerrainEngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async initialize(): Promise<void> {
    const w = this.container.clientWidth || this.container.offsetWidth;
    const h = this.container.clientHeight || this.container.offsetHeight;
    console.log(`[ArcGISTerrainEngine] Container dimensions: ${w}x${h}, DPR: ${window.devicePixelRatio}`);

    if (w <= 0 || h <= 0) {
      console.warn(`[ArcGISTerrainEngine] Warning: Container dimensions are 0 (${w}x${h}). Check DOM CSS mounting.`);
    }

    try {
      // 1. Authoritative Copernicus GLO-30 DSM Ground Elevation
      this.elevationLayer = new GLO30ElevationLayer();
      await this.elevationLayer.load();
      this.callbacks.onDiagnosticState?.("ELEVATION_LAYER_ATTACHED");
      console.log("[ArcGISTerrainEngine] DIAGNOSTIC: ELEVATION_LAYER_ATTACHED");

      // 2. Initialize ArcGIS Map with dark-gray-vector basemap and custom Ground
      this.map = new Map({
        basemap: "dark-gray-vector",
        ground: {
          layers: [this.elevationLayer]
        }
      });
      this.callbacks.onDiagnosticState?.("GROUND_CREATED");
      this.callbacks.onDiagnosticState?.("BASEMAP_READY");
      console.log("[ArcGISTerrainEngine] DIAGNOSTIC: GROUND_CREATED & BASEMAP_READY");

      // 3. Initialize Feature & Hydraulic Layers
      this.hydraulicLayer = new ArcGISHydraulicLayer();
      this.roadLayer = new ArcGISRoadLayer();
      this.infrastructureLayer = new GraphicsLayer({
        title: "Critical Infrastructure (Dam, Breach, Shelters)",
        elevationInfo: { mode: "relative-to-ground", offset: 10 }
      });

      this.map.add(this.hydraulicLayer.getLayer());
      this.roadLayer.getLayers().forEach((l) => this.map!.add(l));
      this.map.add(this.infrastructureLayer);

      this.callbacks.onDiagnosticState?.("ROAD_LAYER_READY");
      this.callbacks.onDiagnosticState?.("HYDRAULIC_LAYER_READY");
      console.log("[ArcGISTerrainEngine] DIAGNOSTIC: ROAD_LAYER_READY & HYDRAULIC_LAYER_READY");

      // 4. Initialize SceneView (Projected 3D Local / Global Viewport)
      this.view = new SceneView({
        container: this.container,
        map: this.map,
        qualityProfile: "high",
        environment: {
          lighting: {
            directShadowsEnabled: true,
            date: new Date("2026-06-21T12:00:00Z")
          }
        },
        ui: {
          components: []
        },
        camera: {
          position: {
            longitude: 78.445,
            latitude: 30.230,
            z: 3200
          },
          heading: 32,
          tilt: 58
        }
      });

      this.callbacks.onDiagnosticState?.("SCENEVIEW_CREATED");
      console.log("[ArcGISTerrainEngine] DIAGNOSTIC: SCENEVIEW_CREATED");

      this.cameraController = new ArcGISCameraController(this.view);

      // 5. Setup Interactions (Hit-testing & Cursor Elevation Sampling)
      this.setupInteractions();

      // Wait for Viewport readiness
      await this.view.when();
      this.callbacks.onDiagnosticState?.("SCENEVIEW_READY");
      this.callbacks.onDiagnosticState?.("CAMERA_READY");
      console.log("[ArcGISTerrainEngine] DIAGNOSTIC: SCENEVIEW_READY & CAMERA_READY. 3D SceneView fully initialized.");
    } catch (err) {
      console.error("[ArcGISTerrainEngine] Fatal Map Render Failure:", err);
      this.callbacks.onDiagnosticState?.("RENDER_FAILURE", err);
      throw err;
    }
  }

  private setupInteractions(): void {
    if (!this.view) return;

    // Pointer move -> Live cursor terrain elevation query
    this.view.on("pointer-move", (event) => {
      if (!this.view || !this.callbacks.onCursorMove || !this.elevationLayer) return;

      const mapPoint = this.view.toMap({ x: event.x, y: event.y });
      if (mapPoint && mapPoint.longitude != null && mapPoint.latitude != null) {
        const lon = Math.round(mapPoint.longitude * 10000) / 10000;
        const lat = Math.round(mapPoint.latitude * 10000) / 10000;
        const elev = this.elevationLayer.getElevationAt(lon, lat) ?? (mapPoint.z ? Math.round(mapPoint.z * 10) / 10 : 830.0);

        this.callbacks.onCursorMove({
          lon,
          lat,
          elevation_m: elev
        });
      }
    });

    // Click -> Hit-test for Road, Limiting Edge, Hydraulic Cell, Dam, Shelter
    this.view.on("click", async (event) => {
      if (!this.view || !this.callbacks.onPickEntity) return;

      const response = await this.view.hitTest(event);
      const mapPoint = this.view.toMap({ x: event.x, y: event.y });
      const lon = mapPoint && mapPoint.longitude != null ? Math.round(mapPoint.longitude * 10000) / 10000 : 78.4803;
      const lat = mapPoint && mapPoint.latitude != null ? Math.round(mapPoint.latitude * 10000) / 10000 : 30.3780;
      const elev = this.elevationLayer ? (this.elevationLayer.getElevationAt(lon, lat) ?? 830.6) : 830.6;

      if (response.results.length > 0) {
        const topResult = response.results.find((r) => r.type === "graphic") as any;
        if (topResult && topResult.graphic) {
          const g = topResult.graphic as Graphic;
          const attrs = g.attributes || {};

          let type: "ROAD" | "DAM" | "BREACH" | "SHELTER" | "HEC_RAS_CELL" | "TERRAIN" = "TERRAIN";
          let title = "Selected Feature";

          if (attrs.type === "ROAD") {
            type = "ROAD";
            title = attrs.name || `Road Segment ${attrs.edgeId || attrs.roadId}`;
          } else if (attrs.type === "HEC_RAS_CELL") {
            type = "HEC_RAS_CELL";
            title = `HEC-RAS Inundation Cell (${attrs.depth_m}m depth)`;
          } else if (attrs.type === "DAM") {
            type = "DAM";
            title = "Tehri Dam Structure (830m Crest)";
          } else if (attrs.type === "BREACH") {
            type = "BREACH";
            title = "Breach Invert Location (635m Model Assumption)";
          } else if (attrs.type === "SHELTER") {
            type = "SHELTER";
            title = attrs.name || "Designated Shelter";
          }

          this.callbacks.onPickEntity({
            type,
            title,
            properties: attrs,
            coordinate: { lon, lat, elev_m: elev }
          });
          return;
        }
      }

      // Bare terrain clicked
      this.callbacks.onPickEntity({
        type: "TERRAIN",
        title: `Copernicus GLO-30 DSM Surface (${lon.toFixed(4)}°E, ${lat.toFixed(4)}°N)`,
        properties: {
          source: "Copernicus GLO-30 DSM (1-arcsec)",
          datum: "EGM2008 MSL",
          elevation_m: elev
        },
        coordinate: { lon, lat, elev_m: elev }
      });
    });
  }

  public updateData(
    roads: RoadFeature[],
    evacPoints: EvacuationPointFeature[],
    inundationGeoJSON: any,
    selectedEdgeId?: string | null,
    thematicMode: HydraulicThematicMode = "EXTENT",
    timestep: string = "T+60"
  ): void {
    if (this.roadLayer) {
      this.roadLayer.setRoads(roads, selectedEdgeId);
    }
    if (this.hydraulicLayer) {
      this.hydraulicLayer.setInundationData(inundationGeoJSON, thematicMode, timestep);
    }
    this.updateInfrastructure(evacPoints);
  }

  private updateInfrastructure(evacPoints: EvacuationPointFeature[]): void {
    if (!this.infrastructureLayer) return;
    this.infrastructureLayer.removeAll();

    const graphics: Graphic[] = [];

    // Tehri Dam Crest Marker
    graphics.push(new Graphic({
      geometry: new Point({ longitude: 78.4803, latitude: 30.3780, z: 830.0 }),
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            size: 16,
            resource: { primitive: "square" },
            material: { color: [56, 189, 248, 1.0] }
          })
        ]
      }),
      attributes: {
        type: "DAM",
        name: "Tehri Dam (260.5m Earth & Rockfill, 830m Crest MSL)",
        crest_elevation_m: 830.0
      }
    }));

    // Breach Location Marker
    graphics.push(new Graphic({
      geometry: new Point({ longitude: 78.4790, latitude: 30.3750, z: 635.0 }),
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            size: 14,
            resource: { primitive: "cross" },
            material: { color: [239, 68, 68, 1.0] }
          })
        ]
      }),
      attributes: {
        type: "BREACH",
        name: "Modeled Breach Invert (635m Model Assumption)",
        invert_elevation_m: 635.0
      }
    }));

    // Shelters & Origins
    evacPoints.forEach((pt) => {
      const isShelter = pt.properties.type === "SHELTER" || pt.properties.category === "DESTINATION";
      graphics.push(new Graphic({
        geometry: new Point({
          longitude: pt.geometry.coordinates[0],
          latitude: pt.geometry.coordinates[1],
          z: pt.properties.elevation_m || 1000.0
        }),
        symbol: new PointSymbol3D({
          symbolLayers: [
            new IconSymbol3DLayer({
              size: 12,
              resource: { primitive: "circle" },
              material: { color: isShelter ? [56, 189, 248, 1.0] : [245, 158, 11, 1.0] }
            })
          ]
        }),
        attributes: {
          type: "SHELTER",
          name: pt.properties.name,
          capacity: pt.properties.capacity,
          elevation_m: pt.properties.elevation_m
        }
      }));
    });

    this.infrastructureLayer.addMany(graphics);
  }

  public flyToPreset(presetKey: keyof typeof AUTHORITATIVE_CAMERA_PRESETS): void {
    if (this.cameraController) {
      this.cameraController.flyToPreset(presetKey);
    }
  }

  public highlightEdge(edgeId: string | null): void {
    if (this.roadLayer) {
      this.roadLayer.highlightEdge(edgeId);
    }
  }

  public getView(): SceneView | null {
    return this.view;
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.hydraulicLayer) this.hydraulicLayer.clear();
    if (this.roadLayer) this.roadLayer.clear();
    if (this.infrastructureLayer) this.infrastructureLayer.removeAll();

    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }
}
