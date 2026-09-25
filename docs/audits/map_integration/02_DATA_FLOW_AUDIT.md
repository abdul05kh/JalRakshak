# 02 — Data Flow & Architecture Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** End-to-End Traceability from HEC-RAS HDF to Frontend Visuals  
**Status:** PASS  

---

## 1. End-to-End Data Pipeline

```text
[SOURCE] Native HEC-RAS 7.0.1 Result Artifact (.hdf)
   │  (e.g., tehri_15km_scenario_central_65000cms.hdf)
   │  Contains: Unsteady 2D Water Surface Elevation, Cell Depth, Velocity Arrays
   ▼
[DOMAIN] Spatial Road-Hydraulic Coupling (road_hydraulic_mapper.py)
   │  - Projected CRS: EPSG:32644 (UTM Zone 44N)
   │  - LineString densification: <= 50m spacing
   │  - Corridor search radius: Strict 150m perpendicular envelope
   │  - Thresholds: Depth >= 0.3m, Velocity >= 1.0m/s
   ▼
[DOMAIN] Evacuation Window Engine (ewe_engine.py)
   │  - Evaluates topological route paths (Origin -> Shelter)
   │  - Calculates segment arrival $A_i$, cumulative travel $T_i$, buffer $B$
   │  - Solves: Deadline $D = \min_i(A_i - T_i - B)$
   │  - Identifies Limiting Road Edge ($\arg\min$)
   ▼
[API] FastAPI Endpoints (endpoints.py)
   │  - GET /scenarios, GET /scenarios/{id}/layers, GET /scenarios/{id}/timeline
   │  - POST /routes/analyze (Returns RouteAnalyzeResponse)
   │  - GET /scenarios/{id}/point-query
   │  - GET /scenarios/{id}/provenance
   ▼
[FRONTEND] Map-First Operational Console (MapView.tsx + App.tsx)
   │  - Primary Map Canvas: Terrain, Inundation, Route, Limiting Segment, Shelters
   │  - Temporal Slider: $T+00 \dots T+90$
   │  - Docked Decision Hero: LEAVE BY T+44:21, Triad, [WHY?], [EXPLAINERS]
```

---

## 2. Integrity Verification
The frontend never calculates decisions independently; all decision tokens are authoritative outputs of the backend decision engine.
