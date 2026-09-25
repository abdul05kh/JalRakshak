# RC2.1 REPOSITORY FORENSIC INVENTORY

**Project:** JalRakshak Emergency Decision Support System  
**Audit Stage:** RC2.1 Forensic Recovery & Stabilization  
**Date:** September 26, 2026  
**Auditor:** Principal Frontend & Geospatial Visualization Lead  

---

## 1. Inventory Matrix

| Path / Component | Purpose | Dependencies | Data Authority | Rendering Responsibility | Known Risks / Mitigations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend/src/map3d/ArcGISSceneViewer.tsx` | Primary React 3D Scene View wrapper | `@arcgis/core`, `React` | None (Presentation) | Mounts SceneView container, handles UI lifecycle | StrictMode unmount race resolved with cancellation token & isMounted flag. |
| `frontend/src/map3d/ArcGISTerrainEngine.ts` | 3D Engine orchestrator | `@arcgis/core/views/SceneView`, `Map` | None (Engine) | Configures camera, basemap, ground elevation, interaction events | Sizing zero-height container bug resolved; ResizeObserver active. |
| `frontend/src/map3d/GLO30ElevationLayer.ts` | Custom Copernicus GLO-30 DSM elevation layer | `@arcgis/core/layers/BaseElevationLayer` | Copernicus GLO-30 DSM Binary (3.56M pts) | Generates 256x256 Web Mercator elevation tiles via bilinear interpolation | Hard-coded 600m/830m fake fallbacks eliminated; returns `-9999` (noData). Tile cache active. |
| `frontend/src/map3d/ArcGISHydraulicLayer.ts` | 2D Inundation vector layer | `@arcgis/core/layers/GraphicsLayer` | Native HEC-RAS 2D Simulation (Derived GeoJSON) | Renders depth ramps, binary extent, arrival isochrones clamped on ground | Elevation mode set to `on-the-ground` to eliminate z-fighting. |
| `frontend/src/map3d/ArcGISRoadLayer.ts` | Road network & R02 segmented edges | `@arcgis/core/layers/GraphicsLayer` | Backend Road Graph & Segment Telemetry | Renders background roads and 7 authoritative R02 segments | Limiting edge `R02-E07` dynamically highlighted in crimson red. |
| `frontend/src/map3d/ArcGISCameraPresets.ts` | Spatial camera angles | `@arcgis/core/Camera` | Project geographic bounds | Controls camera viewpoint for DAM, BREACH, ROUTE, LIMITING, OVERVIEW | Presets restricted strictly within study extent. |
| `frontend/src/map3d/Diagnostics.ts` | Live render diagnostic telemetry | Typed diagnostic model | Browser WebGL / Engine state | Exposes `window.__JALRAKSHAK_DIAGNOSTICS__` | Provides full observability into container, WebGL, tile fetches, and features. |
| `frontend/src/services/api.ts` | Backend REST Client | `fetch`, `VITE_API_BASE_URL` | Backend FastAPI service | Data ingestion, scenario switching, departure deadline requests | Hard-coded localhost URLs replaced with configurable env; error propagation active. |
| `backend/app/main.py` | FastAPI decision server | `fastapi`, `h5py`, `pydantic` | HEC-RAS HDF5, EWE engine | Serves layers, timeline, and decision calculations | Sole authority for $A - T - B = D$ departure deadline calculation. |
| `backend/app/services/ewe_engine.py` | Evacuation Window Estimation Engine | Python math/GIS | Native HEC-RAS hydraulic models | Computes limiting edges, arrival times, travel times, departure deadlines | Strict invariant: $D_{deadline} = \min_i(A_i - T_i - B)$. |

---

## 2. Global Search & Quarantine Findings

1. **CesiumJS Quarantine:** Zero active Cesium imports or runtimes in operational build.
2. **Fake Elevation Quarantine:** Fake `600m` and `830m` elevation fallbacks removed from `GLO30ElevationLayer.ts`.
3. **Hard-coded Decision Quarantine:** Decision values in UI are populated dynamically from backend `analysisResult` payloads ($T+44:21$ for Central, $T-02:40$ for Extreme).
