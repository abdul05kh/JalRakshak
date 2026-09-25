# JALRAKSHAK RC2 — ARCGIS MAPS SDK MIGRATION AUDIT

**Target Architecture:** ArcGIS Maps SDK for JavaScript 5.1 (`@arcgis/core` 5.1.x) with `SceneView`  
**Migration Scope:** Complete replacement of legacy CesiumJS rendering layer  
**Scientific Authority:** Native USACE HEC-RAS 7.0.1 2D Unsteady SWE, Copernicus GLO-30 DSM, deterministic EWE ($D = A_i - T_i - B$)  
**Status:** Phase 1 Complete (Full Inventory & Architectural Design)

---

## 1. Inventory of Legacy CesiumJS Implementation

| Module / File | Primary Responsibility | Cesium-Specific API / Mechanism | ArcGIS Maps SDK 5.1 Replacement Strategy |
| :--- | :--- | :--- | :--- |
| [`frontend/src/map3d/CesiumViewer.tsx`](file:///d:/projects/JalRakshak/frontend/src/map3d/CesiumViewer.tsx) | Viewport container, telemetry & cursor picking | `Cesium.Viewer`, `ScreenSpaceEventHandler` | `ArcGISSceneViewer.tsx` hosting single `SceneView` instance with `view.on("pointer-move")` and `view.hitTest()`. |
| [`frontend/src/map3d/TerrainEngine.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/TerrainEngine.ts) | 3D scene lifecycle orchestrator | `Cesium.Viewer`, `globe.depthTestAgainstTerrain` | `ArcGISTerrainEngine.ts` managing `Map`, `SceneView`, `Map.ground`, camera presets, and layer controllers. |
| [`frontend/src/map3d/TerrainProvider.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/TerrainProvider.ts) | Copernicus GLO-30 DSM terrain delivery | Custom `Cesium.TerrainProvider` sampling `tehri_valley_elevation.bin` | Custom `BaseElevationLayer` (`GLO30ElevationLayer.ts`) querying local GLO-30 binary grid with bilinear interpolation attached to `map.ground.layers`. |
| [`frontend/src/map3d/HydraulicLayer.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/HydraulicLayer.ts) | HEC-RAS 2D flood depth, extent, arrival | `Cesium.ClassificationType.TERRAIN` polygons | `ArcGISHydraulicLayer.ts` using `GeoJSONLayer` / `GraphicsLayer` with continuous thematic renderers, visual opacity, and elevationInfo `on-the-ground`. |
| [`frontend/src/map3d/RoadLayer.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/RoadLayer.ts) | 3D road network & 7-edge segmentation | `Cesium.PolylineOutlineMaterialProperty`, `clampToGround: true` | `ArcGISRoadLayer.ts` using `FeatureLayer` / `GraphicsLayer` with 3D line symbols, elevationInfo `on-the-ground`, and hit-testing. |
| [`frontend/src/map3d/CameraController.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/CameraController.ts) | Camera presets & flyTo orchestration | `viewer.camera.flyTo()`, Cartesian3 | `ArcGISCameraController.ts` using `view.goTo()` with explicit heading, tilt, target, and position. |
| [`frontend/src/map3d/DamLayer.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/DamLayer.ts) | Tehri Dam 3D structure & breach location | Point & polygon primitives | `GraphicsLayer` with 3D PointSymbol3D / PolygonSymbol3D. |
| [`frontend/src/map3d/ShelterLayer.ts`](file:///d:/projects/JalRakshak/frontend/src/map3d/ShelterLayer.ts) | Evacuation origin & shelters (Chamba) | Point entities with billboarding | `GraphicsLayer` with callout 3D point markers. |
| [`frontend/src/components/MapView.tsx`](file:///d:/projects/JalRakshak/frontend/src/components/MapView.tsx) | Map container adapter | Wraps `CesiumViewer` | Wraps `ArcGISSceneViewer` maintaining persistent lifecycle. |

---

## 2. GLO-30 DSM Terrain Delivery Design in ArcGIS 5.1

ArcGIS `SceneView` uses `Map.ground` to define 3D elevation. We implement a custom `BaseElevationLayer`:
```typescript
import BaseElevationLayer from "@arcgis/core/layers/BaseElevationLayer";

export class GLO30ElevationLayer extends BaseElevationLayer {
  // Queries validated tehri_valley_elevation.bin (1-arcsec GLO-30 DSM)
  // Computes exact bilinear elevation in meters MSL (EGM2008)
  async fetchTile(level: number, row: number, col: number, options?: any) {
    // Generate elevation tile data with width/height=256 and noDataValue=-9999
  }
}
```
This guarantees that **Copernicus GLO-30 DSM remains the sole authoritative elevation surface**, strictly adhering to Section 0, 3, and 4.

---

## 3. Road Interaction & Traversal Flow Design

1. **Exact 7-Edge Representation:** `R02-E01` through `R02-E07` with `elevationInfo: { mode: "on-the-ground" }`.
2. **Hit-Testing:** `view.hitTest(event)` identifies the clicked Graphic, extracting edge properties (`edgeId`, `length_km`, `travel_time`, `flood_arrival`, `margin`, `status`).
3. **Directional Traversal Visualization:** Animate dash/pulse along geometry from Malidewal (Origin) $\to$ Koteshwar (Shelter) without altering deterministic EWE calculation.

---

## 4. Execution Plan (Phases 2 – 16)

- **Phase 2 & 3:** Implement `GLO30ElevationLayer` and standalone prototype test component (`ArcGISSceneViewer.tsx`).
- **Phase 4 & 5:** Build road network and authoritative layers.
- **Phase 6 & 7:** Implement hydraulic rendering (continuous blue depth ramp, extent, arrival isochrones).
- **Phase 8 & 9:** Build continuous temporal simulation engine ($T+00 \dots T+120$) with smooth visual interpolation.
- **Phase 10 & 11:** Persistent SceneView lifecycle and decision synchronization ($D = \text{T+44:21}$).
- **Phase 12:** Completely remove CesiumJS packages and imports.
- **Phase 13 – 16:** Automated tests, browser verification, and release freeze (`SIH_RC2_ARCGIS_SCENEVIEW`).
