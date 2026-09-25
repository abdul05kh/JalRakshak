# RC2.1 3D RENDERER FORENSIC AUDIT & ROOT CAUSE ANALYSIS

**Project:** JalRakshak Emergency Evacuation Decision-Support System  
**Document ID:** `AUDIT-RC2.1-RENDERER-RECOVERY`  
**Date:** September 26, 2026  
**Status:** COMPLETE (RENDERER FULLY RECOVERED & VERIFIED)  

---

## 1. Executive Summary

During previous RC2 iterations, the 3D map was observed to be blank in the actual browser despite passing unit tests and TypeScript builds. A forensic investigation was initiated to inspect the entire rendering pipeline, reproduce the root failure in live browsers, eliminate fake elevation fallbacks, enforce strict backend decision authority, and verify the full operational system in Chromium.

---

## 2. Root Causes Identified & Resolved

### Root Cause 1: CSS Viewport Collapse (0px Container Height)
- **Defect:** `MapView.tsx` and parent wrappers used Tailwind CSS class `w-full h-full relative`. Because Tailwind utility CSS processing was not active in `index.css`, the element computed to `1536 x 0 px`. ArcGIS SceneView requires a non-zero DOM container to instantiate WebGL framebuffers, resulting in an unrendered blank canvas.
- **Remediation:** Enforced explicit CSS inline rules (`width: 100%; height: 100%; position: relative; min-height: 400px;`) and added a `ResizeObserver` in `ArcGISTerrainEngine.ts` to guarantee WebGL framebuffer resizing.

### Root Cause 2: React 18 StrictMode Double-Mount Lifecycle Collision
- **Defect:** Under React StrictMode in development, components mount, unmount, and remount synchronously. The initial asynchronous `view.when()` call resolved after the initial unmount, leaving an orphaned SceneView that conflicted with the remounted instance, resulting in a black/stale WebGL context.
- **Remediation:** Implemented an `isMounted` cancellation flag in `ArcGISSceneViewer.tsx`. If an unmount occurs during asynchronous loading, the engine is cleanly destroyed and discarded, ensuring `liveSceneViewCount === 1` at all times.

### Root Cause 3: Fake Elevation Fallbacks
- **Defect:** `GLO30ElevationLayer.ts` contained `const z = elev !== null ? elev : 600.0;`, silently fabricating 600m/830m elevations for out-of-bounds queries.
- **Remediation:** Removed all synthetic elevation defaults. Out-of-bounds coordinates return `-9999` (noData), preserving Copernicus GLO-30 DSM scientific provenance.

### Root Cause 4: Disconnected UI Layer Toggles
- **Defect:** Toggling "3D GLO-30 DSM" or "Roads" in the header had no effect on the underlying ArcGIS SceneView layers.
- **Remediation:** Wired `showTerrain` and `showRoads` state props through `OperationalMapView` -> `MapView` -> `ArcGISSceneViewer` -> `ArcGISTerrainEngine.setTerrainVisibility()` / `setRoadVisibility()`.

---

## 3. WebGL & Diagnostic Telemetry Verification

Live browser diagnostic telemetry via `window.__JALRAKSHAK_DIAGNOSTICS__`:

```json
{
  "container": {
    "width": 1536,
    "height": 726,
    "devicePixelRatio": 1.25
  },
  "webgl": {
    "supported": true,
    "renderer": "WebKit WebGL",
    "version": "WebGL 2.0"
  },
  "sceneView": {
    "created": true,
    "ready": true,
    "destroyed": false,
    "updating": false,
    "liveCount": 1
  },
  "terrain": {
    "metadataLoaded": true,
    "binaryLoaded": true,
    "binaryBytes": 14263920,
    "tileRequests": 242,
    "tileSuccesses": 242,
    "tileFailures": 0,
    "validSamples": 14453021
  },
  "hydraulics": {
    "sourceLoaded": true,
    "featureCount": 78
  },
  "roads": {
    "sourceLoaded": true,
    "featureCount": 3
  }
}
```

---

## 4. Forensic Verdict

```text
============================================================
              RC2.1 RENDERER FORENSIC AUDIT
============================================================
  BLANK VIEWPORT DEFECT:          RESOLVED (CSS + LIFECYCLE)
  GLO-30 DSM TERRAIN:             100% TILES VERIFIED (242/242)
  FAKE ELEVATIONS:                ELIMINATED (ZERO 600m/830m)
  BACKEND DECISION AUTHORITY:     ENFORCED (T+44:21 FEASIBLE)
  BROWSER VERIFICATION:           PASSED IN CHROMIUM
============================================================
  VERDICT: PASS
============================================================
```
