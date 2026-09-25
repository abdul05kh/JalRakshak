# 02 — Information Hierarchy Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Framework:** 5-Level Progressive Cognitive Structure  
**Status:** PASS  

---

## 1. The 5-Level Information Hierarchy

To prevent cognitive overload during emergency decision-making, information is organized into strict descending tiers:

```text
LEVEL 1 — DECISION (Primary Hero Viewport)
   ├─ Feasibility Badge: ✓ FEASIBLE
   └─ Departure Deadline: LEAVE BY T+44:21 (Hero Metric, 36px font)

LEVEL 2 — CONTEXT (Selection State)
   ├─ Flood Scenario: CENTRAL (65,000 m³/s)
   └─ Route Name: R02 — Malidewal → Koteshwar

LEVEL 3 — REASON & TIMING (Arithmetic Triad)
   ├─ Flood Arrival at Route: T+60:00
   ├─ Travel Time: 12:39
   ├─ Safety Buffer: 03:00
   └─ Limiting Part of Route: R02

LEVEL 4 — LOCATION (Spatial Supporting Evidence)
   ├─ Map View (Route corridor polyline)
   └─ Highlighted Limiting Segment (Bold Red LineString)

LEVEL 5 — EVIDENCE & PROVENANCE (Progressive Secondary Drawers)
   ├─ [WHY?]: Arithmetic equation breakdown: 60:00 - 12:39 - 03:00 = 44:21
   ├─ [ASSUMPTIONS]: 50 km/h static speed, 150m coupling corridor, <=50m densification
   ├─ [PROVENANCE]: HEC-RAS 7.0.1 2D native artifact, SHA-256 hash, mesh, CRS
   └─ [TECHNICAL DETAILS]: Per-edge cumulative hydraulic table
```

---

## 2. Inversion Protection Rules
- **Rule 1:** Level 5 (Provenance/Science) MUST NEVER appear before Level 1 (Decision).
- **Rule 2:** The Departure Deadline (`LEAVE BY T+44:21`) MUST be the largest numerical element on the screen.
- **Rule 3:** No modal, scroll, or deep-click is required to view Level 1, Level 2, and Level 3.
