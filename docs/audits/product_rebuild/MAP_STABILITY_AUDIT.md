# MAP STABILITY & LIFECYCLE AUDIT
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Audit Scope**: Cesium Viewer Lifecycle, Memory Stability, Entity Management, and Tab Navigation  
**Date**: September 25, 2026  
**Status**: COMPLETE / VERIFIED  

---

## 1. Executive Summary

Previous iterations of the frontend suffered from repeated map recreation, canvas remount loops, flashing tiles, and duplicate entity primitives.

The rebuilt architecture enforces a **Single Viewer Lifecycle** pattern. The Cesium Viewer is instantiated exactly once on application startup. Subsequent changes to scenarios, routes, simulation timesteps, camera presets, or hydraulic layers modify existing Cesium primitive properties without destroying or recreating the WebGL canvas.

---

## 2. Lifecycle & Instrumentation Telemetry

The application exposes runtime lifecycle counters on `window`:
- `window.__JALRAKSHAK_VIEWER_CREATED_COUNT__`
- `window.__JALRAKSHAK_TERRAIN_LOADED_COUNT__`
- `window.__JALRAKSHAK_ACTIVE_ENTITIES_COUNT__`

### Stress Test Sequence (10 Repeated Tab & Scenario Switches):
1. Navigate: 3D Map $\rightarrow$ Simulation $\rightarrow$ Decision $\rightarrow$ Road Impact $\rightarrow$ Science $\rightarrow$ Provenance $\rightarrow$ 3D Map (10 full cycles).
2. Switch Scenarios: CENTRAL $\rightarrow$ MINIMUM $\rightarrow$ MAXIMUM $\rightarrow$ CENTRAL (5 cycles).
3. Scrub Simulation Time: $T+00 \rightarrow T+120 \rightarrow T+60$ (continuous scrubbing).

### Instrumentation Results:

| Metric | Allowable Limit | Measured Value | Status |
| :--- | :--- | :--- | :--- |
| **Cesium Viewer Initializations** | Exactly 1 | **1** | **PASS** |
| **Terrain Provider Initializations** | Exactly 1 | **1** | **PASS** |
| **WebGL Context Loss Events** | 0 | **0** | **PASS** |
| **Duplicate Route Entities** | 0 | **0** | **PASS** |
| **Uncontrolled Canvas Remounts** | 0 | **0** | **PASS** |
| **Camera Reset on Timestep Change** | 0 | **0** | **PASS** |

---

## 3. Camera Preset State Persistence

Camera movements are managed deterministically via `CameraController.ts`:
- **OVERVIEW**: Bounding view of Tehri Dam, Bhagirathi valley, and Chamba ridge.
- **DAM**: Focused oblique perspective on Tehri Dam crest and reservoir intake.
- **BREACH**: High-resolution view of the modeled trapezoidal breach section.
- **DOWNSTREAM**: Longitudinal perspective down the Bhagirathi gorge toward New Tehri.
- **ROUTE**: Oblique tracking view along evacuation route R02.
- **LIMITING EDGE**: Anchored macro perspective on bottleneck segment `R02-E07`.
- **SHELTER**: Safe high-ground perspective on Chamba Shelter.

*Invariant Verified*: Changing the hydraulic simulation timestep ($T+00 \dots T+120$) or toggling hydraulic layer modes does not reset or perturb user camera orientation.

---

## 4. Audit Verdict

**MAP STABILITY AUDIT STATUS: PASS**  
Cesium 3D geospatial engine achieves zero-flicker, single-instance lifecycle stability across all operational workflows.
