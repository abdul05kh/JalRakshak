# JALRAKSHAK RC2 — ARCGIS MAPS SDK 5.1 SCENEVIEW ARCHITECTURE

**Software Version:** RC2 Architecture  
**Primary 3D Geospatial Engine:** ArcGIS Maps SDK for JavaScript 5.1 (`@arcgis/core@5.1.25`)  
**View Target:** `SceneView` (WebScene / Local Projective 3D Mode)  
**Authoritative CRS:** EPSG:32644 (UTM Zone 44N) & WGS84 (EPSG:4326) / EGM2008 MSL Geoid

---

## 1. Architectural System Overview

The JalRakshak 3D geospatial visualization engine is migrated to **ArcGIS Maps SDK for JavaScript 5.1**. This eliminates legacy CesiumJS dependency while enforcing a deterministic, single-instance 3D geospatial environment.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JALRAKSHAK APP SHELL                         │
│  (Persistent Header, Scenario Selectors, Views, Decision Synchronization)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ArcGISSceneViewer Component                          │
│     - Exactly ONE SceneView (window.__JALRAKSHAK_VIEWER_CREATED_COUNT__ = 1)│
│     - Hardware-Accelerated 3D WebGL / WebGPU Rendering Context          │
└──────────┬─────────────────────────┬──────────────────────────┬─────────┘
           │                         │                          │
           ▼                         ▼                          ▼
┌───────────────────────┐ ┌─────────────────────────┐ ┌───────────────────┐
│   GLO30ElevationLayer │ │  Authoritative Vector   │ │   Hydraulic 2D    │
│ (Custom BaseElevation │ │  - 7 R02 Segments       │ │   - Flood Extent  │
│  sampling GLO-30 DSM) │ │  - Limiting R02-E07     │ │   - Depth Ramps   │
│                       │ │  - Traversal Flow       │ │   - Isochrones    │
└───────────────────────┘ └─────────────────────────┘ └───────────────────┘
```

---

## 2. Layer & Operational State Specification

1. **`GLO30ElevationLayer` (`map.ground.layers`):**
   - Samples the validated Copernicus GLO-30 DSM 1-arcsecond elevation grid (`tehri_valley_elevation.bin`).
   - Uses exact sub-grid bilinear interpolation to guarantee identical elevations at all coordinates ($830\text{m}$ Tehri dam, $612\text{m}$ Koteshwar, $1,650\text{m}$ Chamba).
2. **`ArcGISRoadLayer` (`map.layers`):**
   - Renders the 7 authoritative road edges (`R02-E01` $\to$ `R02-E07`).
   - Clamped with `elevationInfo: { mode: "on-the-ground" }`.
   - Limiting edge `R02-E07` highlighted in high-contrast hazard styling.
   - Interactive hit-testing on click emits complete 11-field telemetry.
3. **`ArcGISHydraulicLayer` (`map.layers`):**
   - Renders native HEC-RAS 2D unsteady cell inundations.
   - Thematic modes: `EXTENT` (binary footprint $h \ge 0.30\text{m}$), `DEPTH` (continuous multi-hue blue colormap $0.3\text{m} \to 15\text{m}+$), `ARRIVAL` (temporal isochrones).
   - Zero outline z-fighting; smooth opacity draped onto 3D terrain.
4. **`ArcGISCameraController`:**
   - Centralized presets: `VALLEY_OVERVIEW`, `TEHRI_DAM`, `BREACH_LOCATION`, `R02_ROUTE`, `R02_E07_LIMITING`, `CHAMBA_SHELTER`, `DOWNSTREAM_VALLEY`.
   - Preserves camera position during layer and scenario transitions.
