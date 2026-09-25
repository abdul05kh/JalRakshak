# 02 — Value-Provenance Graph & End-to-End Decision Trace
**Audit Date:** 2026-09-24  
**Audit Purpose:** Comprehensive traceability mapping every decision-critical value from origin simulation cell to final UI display and experimental scoring.  

---

## 1. Value Provenance Graph Architecture

```
+-----------------------------------------------------------------------------------------+
| SOURCE: USACE HEC-RAS 7.0.1 2D SWE Simulation Plan (tehri_15km_scenario_central.p01.hdf) |
| - Peak Discharge (Qp): 65,000 m3/s                                                      |
| - Cell Water Surface Elevation (WSE) & Arrival Times A(c)                               |
| - Bitwise Checksum: SHA-256 c0b18e0416697757e4733bae120217e5222aed726841d4f8ab...        |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [Spatial Road Coupling]
+-----------------------------------------------------------------------------------------+
| TRANSFORMATION: RoadHydraulicMapper (EPSG:32644, 150m Perpendicular Corridor, <=50m pts) |
| - Road Segment R02 LineString (length = 6,327 m)                                        |
| - Coupled Cells: 229 cells within exact 150m corridor                                   |
| - Road Flood Arrival Time (Ai): min_{c in corridor} A(c) = 3,600 s (T+60:00)            |
| - Classification: DERIVED                                                               |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [Graph Travel Time & Buffer]
+-----------------------------------------------------------------------------------------+
| CONFIGURATION & ASSUMPTION: Evacuation Graph & Safety Parameters                        |
| - Traversal Speed: Static 50 km/h (ASSUMED)                                             |
| - Cumulative Travel Time (Ti): 10,527 m @ 50 km/h = 759.24 s (12:39 min) (DERIVED)      |
| - Safety Buffer (B): 3.0 minutes = 180.0 s (CONFIGURED)                                 |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [Evacuation Window Engine]
+-----------------------------------------------------------------------------------------+
| TRANSFORMATION: Single-Source EWE Engine (D_i = A_i - T_i - B)                          |
| - Segment R02 Deadline: 3600.0 - 759.24 - 180.0 = 2660.76 s (T+44:21)                  |
| - Limiting Segment: argmin(D_i) = R02 (DERIVED)                                         |
| - Primary Route Status: FEASIBLE (Margin = +44.35 min) (DERIVED)                        |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [REST API Contract]
+-----------------------------------------------------------------------------------------+
| API STORAGE & SERIALIZATION: /api/v1/routes/analyze                                     |
| - primary_status: "FEASIBLE"                                                            |
| - latest_feasible_departure: "2026-09-24T00:44:21Z"                                     |
| - limiting_segment: "R02"                                                               |
| - limiting_segment_arrival: "2026-09-24T01:00:00Z"                                      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [Frontend Presentation]
+-----------------------------------------------------------------------------------------+
| FRONTEND & UI DISPLAY: DecisionPanel.tsx (3-Tier Hierarchy)                             |
| - Level 1 Hero: [ FEASIBLE ] | Latest Feasible Departure: T+44:21                       |
| - Level 2 Equation: Flood reaches route T+60:00 - Travel 12:39 - Buffer 03:00 = T+44:21 |
| - Level 3 Drawer: Technical metadata, HEC-RAS 7.0.1, 150m corridor, SHA-256 digest      |
| - Classification: DISPLAYED                                                             |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  [Objective Experiment Scoring]
+-----------------------------------------------------------------------------------------+
| EXPERIMENTAL SCORING ENGINE: Gate5BScorer (gate5b_harness.py)                           |
| - Task 01 Ground Truth: FEASIBLE (Score = 1)                                            |
| - Task 02 Ground Truth: T+44:21 / 44.35 min (+/- 1.5 min tolerance) (Score = 1)         |
| - Task 03 Ground Truth: R02 (Score = 1)                                                 |
| - Ground Truth Cryptographic Digest: d7e163471df7318ff2473ff4d209cba152636e7681...      |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Provenance Class Audit Summary

| Decision Metric | Provenance Class | Authoritative Source / Transformation | Precision Format |
| :--- | :--- | :--- | :--- |
| **Peak Discharge ($Q_p$)** | `SOURCE` | HEC-RAS Flow Hydrograph / Manifest | $65,000.0\text{ m}^3/\text{s}$ |
| **Cell Inundation Arrival** | `SOURCE` | Native HEC-RAS 2D unsteady HDF5 layer | $3,600.0\text{ s}$ (Timestep 12) |
| **Road Coupling Buffer** | `CONFIGURED` | Locked Gate 4 Spatial Corridor Specification | $150.0\text{ m}$ perpendicular |
| **Road Flood Arrival** | `DERIVED` | Minimum arrival over 229 corridor cells | $3,600.0\text{ s}$ ($T+60:00$) |
| **Travel Speed** | `ASSUMED` | Static engineering baseline parameter | $50.0\text{ km/h}$ |
| **Cumulative Travel Time** | `DERIVED` | Road graph traversal $10,527\text{ m} / (50/3.6)$ | $759.24\text{ s}$ ($12:39$) |
| **Safety Clearance Buffer** | `CONFIGURED` | Officer-configured emergency clearance buffer | $180.0\text{ s}$ ($03:00$) |
| **Evacuation Deadline** | `DERIVED` | Single-Source EWE: $3600.0 - 759.24 - 180.0$ | $2,660.76\text{ s}$ ($T+44:21$) |
| **Limiting Segment** | `DERIVED` | Critical path bottleneck: $\arg\min(D_i)$ | `R02` |
| **UI Hero Deadline** | `DISPLAYED` | Relative scenario clock formatter | `T+44:21` |
| **Ground Truth Hash** | `TEST FIXTURE` | Cryptographic SHA-256 digest of scoring rubrics | `64-character SHA-256` |
