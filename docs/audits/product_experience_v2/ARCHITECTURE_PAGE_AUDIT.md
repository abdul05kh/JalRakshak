# ARCHITECTURE & PIPELINE AUDIT (GATE K)
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Document**: Gate K — End-to-End System Architecture and Data Transformation Pipeline  
**Date**: September 25, 2026  
**Status**: COMPLETE / ACCEPTED (GATE K PASS)  

---

## 1. Executive Summary

The **Architecture View** ([ArchitectureView.tsx](file:///d:/projects/JalRakshak/frontend/src/views/ArchitectureView.tsx)) provides a clear, layered visualization of the 8-stage transformation pipeline from raw hydraulic physics to the emergency operator console.

---

## 2. End-to-End Architectural Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE DATA (Copernicus GLO-30 DSM, PWD Road Vectors)     │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. HYDRODYNAMIC SOLVER (HEC-RAS 2D Unsteady SWE)            │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. HYDRAULIC RESULTS (WSE, Depth, Velocity HDF5 Fields)     │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GIS SPATIAL COUPLING (150m Envelope, <=50m Densification)│
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ROUTE GRAPH ENGINE (Dijkstra Shortest Path, Travel Times)│
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. EWE DECISION ENGINE (D = A - T - B, Limiting Segment ID) │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. FASTAPI BACKEND (Immutable Authoritative JSON Contracts) │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. OPERATIONAL UI & 3D CESIUM RENDERER (Operator Console)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Product Differentiation: Raw Hydraulics vs. JalRakshak

| Dimension | Raw HEC-RAS 2D Output | JalRakshak Decision Support |
| :--- | :--- | :--- |
| **Primary Output** | Continuous water depth and velocity mesh. | Route-level latest feasible departure deadline ($T_{\text{dep}}$). |
| **Spatial Reference** | Grid cell centroids ($25\text{m} - 50\text{m}$). | Road network line segments and highway junctions. |
| **Temporal Interpretation**| Physical time since simulation start ($t$). | Evacuation departure window ($D = A_i - T_i - B$). |
| **Cognitive Requirement** | Expert hydraulic engineer required to interpret. | Actionable operational directive for incident commanders. |
| **Bottleneck Extraction** | Manual visual inspection of depth contours. | Automated deterministic identification of limiting segment (`R02-E07`). |

---

## 4. Gate K Verdict

**GATE K STATUS: PASS**  
The architecture makes the transformation from raw hydraulics to decision support fully transparent and explainable.
