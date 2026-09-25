# JALRAKSHAK RC2 — PRODUCT & USER EXPERIENCE REBUILD AUDIT

**Software Tag:** `SIH_RC2_UI_REBUILD`  
**Date:** September 25, 2026  
**Status:** FULLY REBUILT & DIRECT BROWSER VERIFIED  
**Scientific Authority:** Native USACE HEC-RAS 7.0.1 2D Unsteady Shallow Water Equations (SWE)  
**Deterministic Decision Logic:** $D = A_i - T_i - B$ and $D_{\text{deadline}} = \min_i(A_i - T_i - B)$

---

## 1. Executive Summary & Problem Definition

The RC1 release of JalRakshak achieved computational and mathematical validation against locked native HEC-RAS 2D HDF5 datasets and Copernicus GLO-30 DSM terrain models. However, comprehensive visual inspection revealed critical user experience and product-quality deficiencies:
1. **Broken Hydraulic Depth Visualization:** Severe z-fighting raster artifacts, yellow stippled noise covering the terrain, and polygon outline interference.
2. **Contaminating Developer Artifacts & Cesium Warning Banners:** Default Cesium Ion access token prompts and an exposed `StateDebugPanel [DEV]` visible in normal operational views.
3. **Slideshow-Like Simulation:** Stepped scene transitions requiring manual "Next" clicks rather than continuous temporal evolution.
4. **Weak Road Interaction:** Generic dialogs lacking directional route traversal indications and complete edge-level telemetry.
5. **Consumer SaaS Aesthetic:** Excessive bright green badges and oversized cards obscuring the map.

RC2 is a **comprehensive product experience rebuild** that strictly preserves all scientific ground truths while delivering a disciplined government intelligence/technical decision-support interface.

---

## 2. Root Cause Analysis

| Component | RC1 Observed Failure | Root Cause | RC2 Rebuilt Solution |
| :--- | :--- | :--- | :--- |
| **Hydraulic Depth Rendering** | Yellow stippled/noisy surface covering valley terrain. | `outline: true` on terrain-classified polygons caused WebGL fragment depth z-fighting; erroneous yellow color ramp used in arrival mode. | Rebuilt `HydraulicLayer.ts` with continuous multi-hue blue colormap ($0.3\text{m} \to 15\text{m}+$ in restrained blues), `outline: false`, and clean arrival isochrones. |
| **Cesium Ion Warnings** | "Please assign Cesium.Ion.defaultAccessToken..." overlay. | Unconfigured default Ion credit container querying default imagery providers. | Injected custom unobtrusive attribution container with standard OpenStreetMap imagery provider. |
| **Simulation Playback** | Stepped 7-scene slideshow with manual "Next" buttons. | Stepped scene architecture in `FloodSimulationView.tsx`. | Continuous temporal playback player ($T+00 \dots T+120$) with PLAY/PAUSE, variable speeds ($0.5\times, 1\times, 2\times, 4\times$), scrub slider, and dynamic milestone callouts. |
| **Road Interaction** | Generic popup, no road flow traversal visualization. | Simple line rendering without edge segmentation or directional properties. | Rebuilt `RoadLayer.ts` with 7 segmented edges (`R02-E01` to `R02-E07`), directional route styling, active edge highlighting, and 11-field telemetry drawer. |
| **UI Visual Hierarchy** | Cards covering $>50\%$ of screen, SaaS green aesthetic. | 50/50 split layouts and generic SaaS card design. | Government intelligence design language: Deep navy foundation (`#060913`/`#0b1120`), restrained slate, muted cyan (`#38bdf8`), warning amber (`#f59e0b`), hazard red (`#ef4444`). Map occupies 80–90% of screen. |
| **Developer Debug UI** | `StateDebugPanel [DEV]` visible in demo mode. | Mounted unconditionally at root in `App.tsx`. | Gated behind explicit dev flag (`window.__JALRAKSHAK_ENABLE_DEV_PANEL__`). |

---

## 3. Rendering & Geospatial Architecture

```
                               ┌────────────────────────────────────────┐
                               │       Copernicus GLO-30 DSM DEM        │
                               │        (EGM2008 MSL Geoid Grid)        │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────┐            ┌──────────────────────┐            ┌─────────────────────────┐
│  HEC-RAS 2D Hydrodynamic│            │   JalRakshak 3D      │            │   OpenStreetMap Road    │
│  Unsteady Temporal Mesh ├───────────►│   CesiumJS Engine    │◄───────────┤   Network Topology      │
│  (Depth d(x,y,t), WSE)  │            │ (depthTest = true)   │            │   (7 Densified Edges)   │
└─────────────────────────┘            └──────────┬───────────┘            └─────────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │   Government Technical Decision UI     │
                               │  - 85% Dominant 3D Viewport            │
                               │  - Single Cesium Viewer Instance       │
                               │  - Instant Layer/Scenario Switching    │
                               │  - Collapsible Telemetry Drawers       │
                               └────────────────────────────────────────┘
```

---

## 4. Preserved Scientific Baseline & Invariants

The deterministic single-source decision engine is preserved without modification:

$$\text{Decision Invariant: } D_{\text{deadline}} = \min_{i \in \text{Edges}} (A_i - T_i - B)$$

### Authoritative Central Scenario Baseline (Locked):
- **Scenario:** CENTRAL (Froehlich piping baseline)
- **Peak Discharge ($Q_p$):** $65,000\,\text{m}^3/\text{s}$
- **Primary Route:** R02 (Malidewal $\to$ Koteshwar / Chamba)
- **Limiting Road Segment:** `R02-E07` (Koteshwar Riverbank Corridor)
- **Flood Arrival ($A_i$):** $\text{T+60:00}$ ($3,600\text{ s}$)
- **Travel Time to Edge ($T_i$):** $12:39$ ($759\text{ s}$)
- **Configured Buffer ($B$):** $03:00$ ($180\text{ s}$)
- **Departure Deadline ($D_{\text{deadline}}$):** **$\text{T+44:21}$** ($2,661\text{ s}$)

### Minimum & Maximum Invariant Verification:
- **MINIMUM Scenario ($Q_p = 28,500\,\text{m}^3/\text{s}$):** Arrival $\text{T+95:00}$, Travel $12:39$, Buffer $03:00$, **Deadline $\text{T+79:21}$**.
- **MAXIMUM Scenario ($Q_p = 115,000\,\text{m}^3/\text{s}$):** Arrival $\text{T+45:00}$, Travel $12:39$, Buffer $03:00$, **Deadline $\text{T+29:21}$**.

---

## 5. Automated & Unit Verification Results

- **Backend / Math Suite:** 20/20 passed in 0.77s (`pytest tests/`).
  - `tests/map3d/test_coordinate_transform.py`: PASS
  - `tests/map3d/test_dam_alignment.py`: PASS
  - `tests/map3d/test_hydraulic_alignment.py`: PASS
  - `tests/map3d/test_road_terrain_alignment.py`: PASS
  - `tests/map3d/test_shelter_alignment.py`: PASS
  - `tests/map3d/test_terrain_elevation_fidelity.py`: PASS
  - `tests/map3d/test_terrain_source_fidelity.py`: PASS (0.0m bit-for-bit identity against GLO-30 DSM)
  - `tests/map3d/test_terrain_tile_bounds.py`: PASS
  - `tests/map3d/test_terrain_tile_continuity.py`: PASS
  - `tests/map3d/test_terrain_validation_1000_points.py`: PASS (RMSE < 0.05m across 1,225 grid samples)
  - `tests/test_frontend_state_consistency.py`: PASS
- **Frontend Compilation:** `npm run build` completed with 0 errors / 0 warnings in 1.52s.

---

## 6. Known Limitations

1. **Hydraulic Temporal Frame Granularity:** HEC-RAS raw output is resolved at discrete timesteps ($T+00, T+15, \dots, T+120$). Temporal playback visualizes continuous progression between frames without altering underlying HEC-RAS numerical solutions.
2. **Road Traversal Model:** Evacuation route traversal visualization represents modeled constant-speed vehicle movement along surveyed road LineStrings; dynamic multi-agent vehicular traffic congestion is not modeled.
3. **Breach Geometry:** Breach initiation at $T+00$ uses the validated 635m invert elevation model assumption rather than a physical structural failure simulation.
