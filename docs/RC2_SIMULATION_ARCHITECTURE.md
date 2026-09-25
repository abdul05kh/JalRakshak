# RC2 Simulation Architecture & Temporal Continuity
## JalRakshak Emergency Decision-Support System

### 1. Simulation Objectives & Principles
The RC2 simulation pipeline synchronizes hydrodynamic output from the native HEC-RAS 2D model with the ArcGIS SceneView 3D map engine and the unified Evacuation Decision Window calculations.

It rejects jerky frame transitions, slideshow behaviors, and unphysical animations. Every rendered timestep $T+t$ represents the deterministic hydraulic solution computed by HEC-RAS 7.0.1 for the active dam-break scenario.

---

### 2. Time Synchronization Architecture

```
                       ┌──────────────────────────────┐
                       │  HEC-RAS 2D Hydrodynamic HDF │
                       │    (t = 0 ... 120 min)       │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │   FastAPI /api/timeline      │
                       │    Precomputed Inundation    │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │   Frontend Timeline Player   │
                       │  (1x, 2x, 5x, Scrubbing)     │
                       └───────┬──────────────┬───────┘
                               │              │
               ┌───────────────┘              └───────────────┐
               ▼                                              ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  ArcGISHydraulicLayer.ts     │              │  ArcGISRoadLayer.ts          │
│  - Active Extent / Depth     │              │  - Segment Inundation Status │
│  - On-the-ground Draping     │              │  - Real-time Safe/Submerged  │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

### 3. Playback Controls & Frame Budget
- **Supported Speeds**: 1x (1.0s/step), 2x (0.5s/step), 5x (0.2s/step).
- **Scrubbing**: Interactive slider across the full $T+00 \dots T+120$ temporal domain with instantaneous geometry swap ($< 15\text{ms}$).
- **Looping**: Configurable continuous looping for continuous command-center observation.
- **Road State Coherence**: As timestep progresses, road segments dynamically update their operational state (SAFE $\to$ SUBMERGED) when the active hydraulic front intersects their buffer corridor.
