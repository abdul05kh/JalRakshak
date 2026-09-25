# 10 — Experiment Parity Audit (Condition A vs Condition B)

**Project:** JalRakshak Emergency Decision-Support System  
**Gate:** Gate 5B Human Experiment Integrity  
**Status:** PASS  

---

## 1. Experimental Condition Isolation

| Condition Dimension | Condition A: Raw Hydraulic GIS Interface | Condition B: JalRakshak Decision Console |
| :--- | :--- | :--- |
| **Primary Goal** | Raw HEC-RAS 2D depth/velocity inundation maps | Zero-Cognitive-Load Decision Support System |
| **Decision Badges** | **NONE** (No `FEASIBLE`, `LOW MARGIN`, etc.) | Present (`✓ FEASIBLE`) |
| **Departure Deadline** | **NONE** (No `LEAVE BY T+44:21`) | Present (`LEAVE BY T+44:21`) |
| **Limiting Segment** | **NONE** (User must inspect road geometry) | Present (`R02` highlighted) |
| **Why Explanation** | **NONE** | Present (Arithmetic breakdown) |
| **Raw Probing** | Point probe tool (Arrival, Depth, Velocity) | Supporting Map & Technical Drawer |

---

## 2. Parity Rules Verification
- Condition A has NOT been artificially degraded or crippled; it represents a modern standard raw GIS web viewer.
- Condition B displays the automated deterministic EWE decision output.
- Both conditions draw from the exact same frozen underlying HEC-RAS 7.0.1 hydraulic run (`tehri_15km_scenario_central_65000cms.hdf`).
