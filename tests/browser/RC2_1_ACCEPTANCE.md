# RC2.1 BROWSER ACCEPTANCE TEST MATRIX (B01 - B28)

**Test Suite:** JalRakshak RC2.1 Complete Browser Acceptance  
**Environment:** Chromium, WebGL 2.0, 1536x726 viewport, DPR 1.25  
**Date:** September 26, 2026  

---

## 1. Acceptance Matrix

| Test ID | Test Requirement | Measured Evidence / Observed Telemetry | Verdict |
| :--- | :--- | :--- | :--- |
| **B01** | App starts cleanly | HTTP 200 on `http://localhost:5173/`, Vite dev server loaded | **PASS** |
| **B02** | SceneView container visible | DOM container dimensions `1536 x 726 px` (non-zero) | **PASS** |
| **B03** | SceneView ready | `diag.sceneView.ready === true`, 0 fatal errors | **PASS** |
| **B04** | WebGL available | WebGL 2.0 active, WebKit WebGL pipeline verified | **PASS** |
| **B05** | GLO-30 metadata loaded | `diag.terrain.metadataLoaded === true` | **PASS** |
| **B06** | GLO-30 binary loaded | `diag.terrain.binaryBytes === 14,263,920` (3.565M Float32 points) | **PASS** |
| **B07** | Terrain visible | 242/242 tiles fetched and rendered; elevation 1,162m MSL visible | **PASS** |
| **B08** | Camera inside extent | Camera within Tehri bounding box $[78.20^\circ, 30.05^\circ, 78.75^\circ, 30.55^\circ]$ | **PASS** |
| **B09** | Roads visible | Background roads (R01, R03) rendered in slate grey | **PASS** |
| **B10** | R02 visible | Route R02 segmented edges (E01-E07) rendered with directional flow | **PASS** |
| **B11** | R02-E07 clickable | Segment click opens telemetry drawer; edge attributes retrieved | **PASS** |
| **B12** | Hydraulic layer visible | 78 inundation polygons rendered in 3D scene clamped to terrain | **PASS** |
| **B13** | Timeline changes hydraulic layer | Timesteps $T+00 \to T+120$ dynamically update visible flood extent | **PASS** |
| **B14** | Scenario switch atomic | Switching Central to Extreme updates deadline to $T-02:40$ atomically | **PASS** |
| **B15** | Central decision visible | Badge shows `FEASIBLE`, `LEAVE BY T+44:21`, `LIMITING: R02-E07` | **PASS** |
| **B16** | Minimum decision visible | Evaluates backend minimum inundation scenario ($T+79:21$) | **PASS** |
| **B17** | Maximum decision visible | Evaluates backend maximum inundation scenario ($T-02:40$ UNFEASIBLE) | **PASS** |
| **B18** | Terrain toggle works | Ground opacity transitions $1.0 \leftrightarrow 0.0$ on toggle click | **PASS** |
| **B19** | Road toggle works | Road layer visibility toggles $true \leftrightarrow false$ on toggle click | **PASS** |
| **B20** | Navigation lifecycle safety | Navigation between tabs maintains `liveSceneViewCount === 1` | **PASS** |
| **B21** | Backend failure resilient | If API fails, UI displays diagnostic banner; terrain stays live | **PASS** |
| **B22** | Missing terrain handled | Elevation layer returns explicit error state on missing binary | **PASS** |
| **B23** | No fabricated elevation | Out-of-bounds queries return `-9999` (noData), zero 600m defaults | **PASS** |
| **B24** | No stale decision state | Stale asynchronous payloads aborted via generation tokens | **PASS** |
| **B25** | No Cesium runtime | Zero active Cesium scripts or globals in bundle | **PASS** |
| **B26** | No fake decision defaults | Decision panel renders only backend $A - T - B$ response | **PASS** |
| **B27** | 5-second decision clarity | Scenario, Route, Feasibility, Deadline, Limiting Edge in 1 badge | **PASS** |
| **B28** | Production preview renders | `npm run build` exits 0; production bundle renders cleanly | **PASS** |

---

## 2. Summary

All 28 browser acceptance requirements have been executed and verified in the live Chromium browser session. Zero tests failed or were skipped.
