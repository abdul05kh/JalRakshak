# GATE 5 — OFFICER DECISION WORKFLOW

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** VALIDATED  
**Date:** 2026-09-24  

---

## 1. Officer Workflow Hierarchy

The JalRakshak emergency decision interface follows a strict **Officer-First Information Hierarchy**:

```
+-------------------------------------------------------------------------+
| PRIMARY DECISION PANEL (Immediate Situational Awareness - Top Priority) |
| [STATUS: FEASIBLE]   Latest Feasible Departure: 00:44 UTC   Margin: 44m |
| Limiting Segment: R02 (Valley) | Flood Arrival: 01:00 UTC | Buffer: 3m  |
| WHY: Deterministic rule-based causal explanation                        |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| SECONDARY PANEL (Alternative Route Analysis & Contingency)              |
| [Route A: Valley Path - FEASIBLE (44 min)]                              |
| [Route B: High-Ground Ridge Bypass - FEASIBLE (Unconstrained)]          |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| TERTIARY PANEL (Evidence, Scientific Assumptions & Data Gaps)           |
| Provenance: HEC-RAS 7.0.1 (.p01.hdf) | SHA-256 Checksum Verified        |
| Limitations: Static travel times (40 km/h), 17 segment demo network     |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| GEOSPATIAL MAP (Visual Support - Subordinate to Decision)               |
| Interactive 2D Map showing flood propagation, route vectors, and status |
+-------------------------------------------------------------------------+
```

---

## 2. 30-Second Officer Decision Protocol (Reachability Test)

When an emergency breach notification triggers, the operator completes the following 4-step sequence:

1. **Step 1 (0–5s) — Read Primary Status:** Look at the top banner. Is the status `FEASIBLE`, `LOW MARGIN`, or `INFEASIBLE`?
2. **Step 2 (5–12s) — Note Departure Deadline:** Read the latest departure time (`00:44 UTC`) and remaining margin (`44.4 min`).
3. **Step 3 (12–20s) — Identify Limiting Constraint:** Identify the bottleneck segment (`R02`) and when the flood arrives (`01:00 UTC`).
4. **Step 4 (20–30s) — Review Alternative Options:** Confirm if high-ground Route B is available as a contingency if valley congestion occurs.

All four steps require **zero GIS manual query, zero formula calculation, and zero source-code inspection**.
