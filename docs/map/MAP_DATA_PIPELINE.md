# Map Data Pipeline Specification

**Project:** JalRakshak Emergency Decision-Support System  
**Pipeline:** Native HEC-RAS 2D HDF $\rightarrow$ Server-Side Extraction $\rightarrow$ JSON/GeoJSON Client Streaming  
**Date:** 2026-09-25  

---

## 1. Pipeline Stages

```text
[1. Simulation Run]
   HEC-RAS 7.0.1 2D Unsteady Simulation (.hdf)
        ↓
[2. Spatial Extraction]
   RoadHydraulicMapper extracts road corridor cell depths, velocities, and onset times
        ↓
[3. Decision Optimization]
   EvacuationWindowEngine solves EWE: min_i(A_i - T_i - B)
        ↓
[4. API Serialization]
   FastAPI endpoints emit structured GeoJSON layers, route telemetry, and discrete timeline states
        ↓
[5. Client Rendering]
   React MapView renders dynamic layers with WebGL/Canvas/SVG optimizations
```
