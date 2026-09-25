/**
 * TerrainEngine.ts
 * Primary 3D Geospatial Terrain Engine for JalRakshak
 * Orchestrates CesiumJS Viewer, Copernicus GLO-30 DSM terrain provider, layers, camera, picking, and validation.
 */

import * as Cesium from "cesium";
import { JalRakshakTerrainProvider } from "./TerrainProvider";
import { TerrainLoader } from "./TerrainLoader";
import { RoadLayer } from "./RoadLayer";
import { RiverLayer } from "./RiverLayer";
import { DamLayer } from "./DamLayer";
import { ShelterLayer } from "./ShelterLayer";
import { HydraulicLayer } from "./HydraulicLayer";
import type { HydraulicThematicMode } from "./HydraulicLayer";
import { CameraController, AUTHORITATIVE_CAMERA_PRESETS } from "./CameraController";
import { DEFAULT_LAYER_STATE } from "./LayerController";
import type { Map3DLayerState } from "./LayerController";
import { TerrainValidator } from "./TerrainValidator";
import type { ValidationReport } from "./TerrainValidator";
import type { RoadFeature, EvacuationPointFeature } from "../types";

export interface TerrainEngineCallbacks {
  onCursorMove?: (info: { lon: number; lat: number; elevation_m: number }) => void;
  onPickEntity?: (info: {
    type: "TERRAIN" | "ROAD" | "DAM" | "BREACH" | "SHELTER" | "HEC_RAS_CELL";
    title: string;
    properties: Record<string, any>;
    coordinate: { lon: number; lat: number; elev_m: number };
  }) => void;
  onCameraChange?: (state: { lon: number; lat: number; height: number; pitch: number }) => void;
}

export class TerrainEngine {
  private container: HTMLDivElement;
  private viewer: Cesium.Viewer | null = null;
  private terrainProviderInstance: JalRakshakTerrainProvider | null = null;
  private terrainLoader: TerrainLoader;
  private roadLayer: RoadLayer | null = null;
  private riverLayer: RiverLayer | null = null;
  private damLayer: DamLayer | null = null;
  private shelterLayer: ShelterLayer | null = null;
  private hydraulicLayer: HydraulicLayer | null = null;
  private cameraController: CameraController | null = null;
  private validator: TerrainValidator;
  private callbacks: TerrainEngineCallbacks;
  private layerState: Map3DLayerState = { ...DEFAULT_LAYER_STATE };
  private eventHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private basemapImageryLayer: Cesium.ImageryLayer | null = null;
  private isDestroyed = false;

  constructor(container: HTMLDivElement, callbacks: TerrainEngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.terrainLoader = TerrainLoader.getInstance();
    this.validator = new TerrainValidator();
  }

  public async initialize(): Promise<void> {
    // 1. Initialize Authoritative Terrain Provider
    this.terrainProviderInstance = new JalRakshakTerrainProvider();
    const terrainProvider = await this.terrainProviderInstance.initialize();

    // 2. Create dedicated credit container to neatly host attribution without map contamination
    let creditEl = this.container.querySelector(".cesium-credit-container") as HTMLElement;
    if (!creditEl) {
      creditEl = document.createElement("div");
      creditEl.className = "cesium-credit-container";
      creditEl.style.position = "absolute";
      creditEl.style.bottom = "2px";
      creditEl.style.right = "8px";
      creditEl.style.fontSize = "9px";
      creditEl.style.opacity = "0.6";
      creditEl.style.pointerEvents = "none";
      creditEl.style.zIndex = "500";
      this.container.appendChild(creditEl);
    }

    // 3. Initialize Cesium Viewer with scientific visual settings
    this.viewer = new Cesium.Viewer(this.container, {
      terrainProvider,
      creditContainer: creditEl,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: false,
      selectionIndicator: false,
      fullscreenButton: false,
      vrButton: false,
      shouldAnimate: false,
      orderIndependentTranslucency: true
    });

    const scene = this.viewer.scene;
    const globe = scene.globe;

    // Enable Depth Test against Terrain (crucial for true 3D terrain rendering and clamping)
    globe.depthTestAgainstTerrain = true;
    globe.enableLighting = true; // Real sun lighting and mountain ridge shadows
    globe.showGroundAtmosphere = true;

    // Default natural basemap (OpenStreetMap cartography / subtle elevation cues)
    const osmProvider = new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/"
    });
    this.basemapImageryLayer = this.viewer.imageryLayers.addImageryProvider(osmProvider);
    this.basemapImageryLayer.alpha = 0.85;

    // 3. Initialize Feature Layers & Controllers
    this.roadLayer = new RoadLayer(this.viewer, {
      onSelectRoad: (roadId, edgeId, clickCoord) => {
        if (this.callbacks.onPickEntity && clickCoord) {
          this.callbacks.onPickEntity({
            type: "ROAD",
            title: `Road Network: ${roadId}`,
            properties: { roadId, edgeId, status: "Active Route Segment" },
            coordinate: { lon: clickCoord.lon, lat: clickCoord.lat, elev_m: clickCoord.elev }
          });
        }
      }
    });

    this.riverLayer = new RiverLayer(this.viewer);
    this.damLayer = new DamLayer(this.viewer);
    this.shelterLayer = new ShelterLayer(this.viewer);
    this.hydraulicLayer = new HydraulicLayer(this.viewer);
    this.cameraController = new CameraController(this.viewer);

    // 4. Setup Event Listeners (Cursor Inspection & Picking)
    this.setupInteractions();

    // 5. Initial Fly to Tehri Valley Overview
    this.cameraController.flyToPreset("VALLEY_OVERVIEW", 0.0);
    console.log("[TerrainEngine] JalRakshak 3D Terrain Engine fully operational.");
  }

  private setupInteractions(): void {
    if (!this.viewer) return;

    this.eventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Mouse Move -> Cursor Terrain Elevation Inspection
    this.eventHandler.setInputAction((movement: any) => {
      if (!this.viewer || !this.callbacks.onCursorMove) return;

      const ray = this.viewer.camera.getPickRay(movement.endPosition);
      if (!ray) return;

      const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Math.round(Cesium.Math.toDegrees(cartographic.longitude) * 1e5) / 1e5;
        const lat = Math.round(Cesium.Math.toDegrees(cartographic.latitude) * 1e5) / 1e5;

        // Sample authoritative Copernicus DSM elevation
        const elev = this.terrainLoader.getElevation(lon, lat) ?? Math.round(cartographic.height * 10) / 10;

        this.callbacks.onCursorMove({ lon, lat, elevation_m: elev });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Click -> Entity & Terrain Click Inspection
    this.eventHandler.setInputAction((click: any) => {
      if (!this.viewer || !this.callbacks.onPickEntity) return;

      const pickedObject = this.viewer.scene.pick(click.position);
      const ray = this.viewer.camera.getPickRay(click.position);
      const cartesian = ray ? this.viewer.scene.globe.pick(ray, this.viewer.scene) : null;

      let lon = 78.4803;
      let lat = 30.3780;
      let elev = 830.6;

      if (cartesian) {
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        lon = Math.round(Cesium.Math.toDegrees(carto.longitude) * 1e5) / 1e5;
        lat = Math.round(Cesium.Math.toDegrees(carto.latitude) * 1e5) / 1e5;
        elev = this.terrainLoader.getElevation(lon, lat) ?? Math.round(carto.height * 10) / 10;
      }

      if (Cesium.defined(pickedObject) && pickedObject.id instanceof Cesium.Entity) {
        const entity = pickedObject.id;
        const props = entity.properties ? entity.properties.getValue(Cesium.JulianDate.now()) : {};
        const name = entity.name || "Selected Feature";

        let type: "ROAD" | "DAM" | "BREACH" | "SHELTER" | "HEC_RAS_CELL" | "TERRAIN" = "TERRAIN";
        if (props.type === "DAM") type = "DAM";
        else if (props.type === "BREACH") type = "BREACH";
        else if (props.type === "SHELTER" || props.type === "ORIGIN") type = "SHELTER";
        else if (props.roadId || props.edgeId) type = "ROAD";
        else if (props.cellId) type = "HEC_RAS_CELL";

        this.callbacks.onPickEntity({
          type,
          title: name,
          properties: props,
          coordinate: { lon, lat, elev_m: elev }
        });
      } else if (cartesian) {
        // Clicked bare terrain
        this.callbacks.onPickEntity({
          type: "TERRAIN",
          title: `Terrain Surface (${lon.toFixed(4)}°E, ${lat.toFixed(4)}°N)`,
          properties: {
            source: "Copernicus GLO-30 DSM (1-arcsec)",
            datum: "EGM2008 MSL",
            elevation_m: elev
          },
          coordinate: { lon, lat, elev_m: elev }
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Camera movement end listener
    this.viewer.camera.moveEnd.addEventListener(() => {
      if (this.cameraController && this.callbacks.onCameraChange) {
        const state = this.cameraController.getCameraState();
        this.callbacks.onCameraChange({
          lon: state.longitude,
          lat: state.latitude,
          height: state.height,
          pitch: state.pitchDeg
        });
      }
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
    if (this.shelterLayer) {
      this.shelterLayer.setEvacuationPoints(evacPoints);
    }
    if (this.hydraulicLayer) {
      this.hydraulicLayer.setInundationData(inundationGeoJSON, thematicMode, timestep);
    }
  }

  public setLayerState(state: Partial<Map3DLayerState>): void {
    this.layerState = { ...this.layerState, ...state };
    if (!this.viewer) return;

    if (state.basemap !== undefined && this.basemapImageryLayer) {
      this.basemapImageryLayer.show = state.basemap;
    }

    if (state.lighting !== undefined) {
      this.viewer.scene.globe.enableLighting = state.lighting;
    }

    if (state.verticalExaggeration !== undefined) {
      (this.viewer.scene.globe as any).terrainExaggeration = state.verticalExaggeration;
    }

    if (this.roadLayer) {
      this.roadLayer.setVisibility(
        this.layerState.allRoads,
        this.layerState.r02Route,
        this.layerState.limitingSegment
      );
    }

    if (this.riverLayer) {
      this.riverLayer.setVisibility(this.layerState.river, this.layerState.reservoir);
    }

    if (this.damLayer) {
      this.damLayer.setVisibility(this.layerState.dam, this.layerState.breach);
    }

    if (this.shelterLayer) {
      this.shelterLayer.setVisibility(this.layerState.shelters, this.layerState.origins);
    }

    if (this.hydraulicLayer) {
      this.hydraulicLayer.setVisibility(this.layerState.floodInundation, this.layerState.hecRasMesh);
    }
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

  public runValidator(): ValidationReport {
    return this.validator.runValidation();
  }

  public getViewer(): Cesium.Viewer | null {
    return this.viewer;
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.eventHandler) {
      this.eventHandler.destroy();
      this.eventHandler = null;
    }

    if (this.roadLayer) this.roadLayer.clear();
    if (this.riverLayer) this.riverLayer.clear();
    if (this.damLayer) this.damLayer.clear();
    if (this.shelterLayer) this.shelterLayer.clear();
    if (this.hydraulicLayer) this.hydraulicLayer.clear();

    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}
