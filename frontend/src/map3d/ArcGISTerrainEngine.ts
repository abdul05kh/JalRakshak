/**
 * ArcGISTerrainEngine.ts
 * Core 3D Geospatial Engine for JalRakshak using ArcGIS Maps SDK for JavaScript 5.1
 * Orchestrates Map, SceneView, Copernicus GLO-30 DSM BaseElevationLayer, camera, layers, and hit-testing.
 * Strictly guarantees a single, cancel-safe, observable SceneView lifecycle.
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
import { updateDiagnostics } from "./Diagnostics";
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
  private resizeObserver: ResizeObserver | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(container: HTMLDivElement, callbacks: TerrainEngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (this.isDestroyed) return;

      const w = this.container.clientWidth || this.container.offsetWidth;
      const h = this.container.clientHeight || this.container.offsetHeight;

      updateDiagnostics((d) => {
        d.container.width = w;
        d.container.height = h;
        d.container.clientWidth = this.container.clientWidth;
        d.container.clientHeight = this.container.clientHeight;
        d.container.devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;
      });

      console.log(`[ArcGISTerrainEngine] Initializing SceneView on container (${w}x${h}px, DPR: ${window.devicePixelRatio})`);

      try {
        // 1. Authoritative Copernicus GLO-30 DSM Ground Elevation
        this.elevationLayer = new GLO30ElevationLayer();
        await this.elevationLayer.load();

        if (this.isDestroyed) {
          this.destroy();
          return;
        }

        this.callbacks.onDiagnosticState?.("ELEVATION_LAYER_ATTACHED");

        // 2. Initialize ArcGIS Map with dark-gray-vector basemap and custom Ground
        this.map = new Map({
          basemap: "dark-gray-vector",
          ground: {
            layers: [this.elevationLayer]
          }
        });

        updateDiagnostics((d) => {
          d.map.created = true;
          d.map.loaded = true;
          d.map.basemapStatus = "INITIALIZED";
          d.ground.created = true;
          d.ground.visible = true;
        });

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

        if (this.isDestroyed) {
          this.destroy();
          return;
        }

        // 4. Initialize SceneView
        this.view = new SceneView({
          container: this.container,
          map: this.map,
          qualityProfile: "high",
          environment: {
            background: {
              type: "color",
              color: [15, 23, 42, 1]
            },
            starsEnabled: false,
            atmosphereEnabled: true,
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

        updateDiagnostics((d) => {
          d.sceneView.created = true;
          d.sceneView.width = this.view?.width || w;
          d.sceneView.height = this.view?.height || h;
        });

        this.cameraController = new ArcGISCameraController(this.view);

        // 5. Setup Interactions
        this.setupInteractions();

        // 6. Setup ResizeObserver for responsive canvas updates
        this.resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const nw = entry.contentRect.width;
            const nh = entry.contentRect.height;
            updateDiagnostics((d) => {
              d.container.width = nw;
              d.container.height = nh;
              d.container.clientWidth = this.container.clientWidth;
              d.container.clientHeight = this.container.clientHeight;
            });
          }
        });
        this.resizeObserver.observe(this.container);

        // Wait for SceneView readiness
        await this.view.when();

        if (this.isDestroyed) {
          this.destroy();
          return;
        }

        updateDiagnostics((d) => {
          d.sceneView.ready = true;
          d.sceneView.fatalError = null;
        });

        this.callbacks.onDiagnosticState?.("SCENEVIEW_READY");
        console.log("[ArcGISTerrainEngine] 3D SceneView ready and rendering GLO-30 DSM terrain.");
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error("[ArcGISTerrainEngine] Fatal Map Render Failure:", err);
        updateDiagnostics((d) => {
          d.sceneView.fatalError = msg;
        });
        this.callbacks.onDiagnosticState?.("RENDER_FAILURE", err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  private setupInteractions(): void {
    if (!this.view) return;

    // Pointer move -> Live cursor terrain elevation query
    this.view.on("pointer-move", (event) => {
      if (this.isDestroyed || !this.view) return;
      const pt = this.view.toMap({ x: event.x, y: event.y });
      if (pt && pt.longitude != null && pt.latitude != null && this.callbacks.onCursorMove) {
        const elev = this.elevationLayer?.getElevationAt?.(pt.longitude, pt.latitude) ?? pt.z ?? 0;
        this.callbacks.onCursorMove({
          lon: Math.round(pt.longitude * 100000) / 100000,
          lat: Math.round(pt.latitude * 100000) / 100000,
          elevation_m: Math.round(elev * 10) / 10
        });
      }
    });

    // Click -> Hit-test vector layers (Roads, Infrastructure, Hydraulic cells)
    this.view.on("click", async (event) => {
      if (this.isDestroyed || !this.view) return;

      try {
        const response = await this.view.hitTest(event, {
          include: [
            ...(this.roadLayer?.getLayers() || []),
            this.infrastructureLayer,
            this.hydraulicLayer?.getLayer()
          ].filter(Boolean) as any[]
        });

        if (response.results.length > 0) {
          const hit = response.results[0] as any;
          const graphic: Graphic = hit.graphic;
          const attrs = graphic.attributes || {};

          if (attrs.edgeId && this.callbacks.onPickEntity) {
            this.callbacks.onPickEntity({
              type: "ROAD",
              title: `Road Segment ${attrs.edgeId}`,
              properties: attrs,
              coordinate: {
                lon: hit.mapPoint?.longitude ?? 78.48,
                lat: hit.mapPoint?.latitude ?? 30.38,
                elev_m: hit.mapPoint?.z ?? 600
              }
            });
            return;
          }

          if (attrs.type && this.callbacks.onPickEntity) {
            this.callbacks.onPickEntity({
              type: attrs.type,
              title: attrs.name || attrs.type,
              properties: attrs,
              coordinate: {
                lon: hit.mapPoint?.longitude ?? 78.48,
                lat: hit.mapPoint?.latitude ?? 30.38,
                elev_m: hit.mapPoint?.z ?? 600
              }
            });
            return;
          }
        }

        // If no vector hit, query terrain point
        const mapPt = this.view.toMap({ x: event.x, y: event.y });
        if (mapPt && mapPt.longitude != null && mapPt.latitude != null && this.callbacks.onPickEntity) {
          const elev = this.elevationLayer?.getElevationAt?.(mapPt.longitude, mapPt.latitude) ?? mapPt.z ?? 0;
          this.callbacks.onPickEntity({
            type: "TERRAIN",
            title: "Himalayan Terrain Point",
            properties: {
              source: "Copernicus GLO-30 DSM",
              datum: "EGM96 / EGM2008 MSL"
            },
            coordinate: {
              lon: Math.round(mapPt.longitude * 100000) / 100000,
              lat: Math.round(mapPt.latitude * 100000) / 100000,
              elev_m: Math.round(elev * 10) / 10
            }
          });
        }
      } catch (err) {
        console.warn("[ArcGISTerrainEngine] Hit test query error:", err);
      }
    });
  }

  public updateData(
    roads: RoadFeature[],
    evacPoints: EvacuationPointFeature[],
    inundationGeoJSON: any,
    selectedEdgeId?: string,
    thematicMode: HydraulicThematicMode = "EXTENT",
    selectedTimelineStep: string = "T+60"
  ): void {
    if (this.isDestroyed) return;

    if (this.roadLayer) {
      this.roadLayer.setRoads(roads, selectedEdgeId);
      updateDiagnostics((d) => {
        d.roads.sourceLoaded = true;
        d.roads.featureCount = roads.length;
        d.roads.renderedFeatureCount = roads.length;
      });
    }

    if (this.hydraulicLayer && inundationGeoJSON) {
      this.hydraulicLayer.setInundationData(inundationGeoJSON, thematicMode, selectedTimelineStep);
      updateDiagnostics((d) => {
        d.hydraulics.sourceLoaded = true;
        d.hydraulics.featureCount = inundationGeoJSON.features?.length || 0;
        d.hydraulics.visibleFeatureCount = inundationGeoJSON.features?.length || 0;
      });
    }

    this.renderInfrastructure(evacPoints);
  }

  public setTerrainVisibility(visible: boolean): void {
    if (this.isDestroyed || !this.map) return;
    this.map.ground.opacity = visible ? 1 : 0;
    if (this.elevationLayer) {
      this.elevationLayer.visible = visible;
    }
    updateDiagnostics((d) => {
      d.ground.visible = visible;
    });
  }

  public setRoadVisibility(visible: boolean): void {
    if (this.isDestroyed || !this.roadLayer) return;
    this.roadLayer.getLayers().forEach((l) => {
      l.visible = visible;
    });
  }

  private renderInfrastructure(evacPoints: EvacuationPointFeature[]): void {
    if (!this.infrastructureLayer || this.isDestroyed) return;
    this.infrastructureLayer.removeAll();

    const damGraphic = new Graphic({
      geometry: new Point({
        longitude: 78.4808,
        latitude: 30.3789,
        spatialReference: { wkid: 4326 }
      }),
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            size: 16,
            resource: { primitive: "cross" },
            material: { color: "#38bdf8" }
          })
        ]
      }),
      attributes: {
        type: "DAM",
        name: "Tehri Dam Crest (840m MSL)",
        crest_elev_m: 840.0,
        height_m: 260.5
      }
    });

    const breachGraphic = new Graphic({
      geometry: new Point({
        longitude: 78.4812,
        latitude: 30.3780,
        spatialReference: { wkid: 4326 }
      }),
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            size: 18,
            resource: { primitive: "x" },
            material: { color: "#ef4444" }
          })
        ]
      }),
      attributes: {
        type: "BREACH",
        name: "Breach Invert (635m MSL)",
        invert_elev_m: 635.0,
        model: "Deterministic Parametric Piping (Qp = 65,000 m³/s)"
      }
    });

    this.infrastructureLayer.addMany([damGraphic, breachGraphic]);

    evacPoints.forEach((ep) => {
      const isShelter = ep.properties.type === "SHELTER";
      const g = new Graphic({
        geometry: new Point({
          longitude: ep.geometry.coordinates[0],
          latitude: ep.geometry.coordinates[1],
          spatialReference: { wkid: 4326 }
        }),
        symbol: new PointSymbol3D({
          symbolLayers: [
            new IconSymbol3DLayer({
              size: isShelter ? 14 : 10,
              resource: { primitive: isShelter ? "kite" : "circle" },
              material: { color: isShelter ? "#4ade80" : "#fbbf24" }
            })
          ]
        }),
        attributes: {
          type: isShelter ? "SHELTER" : "ORIGIN",
          name: ep.properties.name,
          capacity: ep.properties.capacity || 0,
          id: ep.properties.id
        }
      });
      this.infrastructureLayer!.add(g);
    });

    updateDiagnostics((d) => {
      d.infrastructure.renderedFeatureCount = this.infrastructureLayer?.graphics.length || 0;
    });
  }

  public flyToPreset(presetKey: keyof typeof AUTHORITATIVE_CAMERA_PRESETS): void {
    if (this.cameraController && !this.isDestroyed) {
      this.cameraController.flyToPreset(presetKey);
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.view) {
      try {
        this.view.destroy();
      } catch (e) {
        console.warn("[ArcGISTerrainEngine] Error during view destroy:", e);
      }
      this.view = null;
    }
    if (this.map) {
      try {
        this.map.destroy();
      } catch (e) {
        console.warn("[ArcGISTerrainEngine] Error during map destroy:", e);
      }
      this.map = null;
    }

    updateDiagnostics((d) => {
      d.sceneView.destroyed = true;
      d.sceneView.ready = false;
    });

    console.log("[ArcGISTerrainEngine] Destroyed 3D Scene engine.");
  }
}
