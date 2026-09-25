# 03 — Information Condition Parity Matrix

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Verify Data Element Allocation Between Condition A and Condition B  
**Status:** PASS  

---

## Information Element Parity Ledger

| Information Element | Condition A (Raw Hydraulic GIS) | Condition B (JalRakshak Decision Console) | Purpose | Participant Visible | Allowed in Condition A? | Leakage Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Inundation Spatial Map** | YES (2D contours) | YES (2D overlay) | Spatial awareness | YES | YES | None |
| **Point Depth & Velocity Probe** | YES (On-click popup) | YES (Supporting map popup) | Local hydraulic inspection | YES | YES | None |
| **Settlement & Shelter Markers** | YES (Icons & names) | YES (Icons & names) | Route endpoints | YES | YES | None |
| **Road Network Geometry** | YES (Polyline network) | YES (Polyline network) | Route geography | YES | YES | None |
| **Feasibility Status Badge** | **NO** (Suppressed) | YES (`✓ FEASIBLE`) | Operational decision | NO in A, YES in B | **NO** | Zero in DOM |
| **Departure Deadline (EWE)** | **NO** (Suppressed) | YES (`LEAVE BY T+44:21`) | Evacuation timing | NO in A, YES in B | **NO** | Zero in DOM |
| **Limiting Segment Highlight** | **NO** (Suppressed) | YES (`R02` red highlight) | Bottleneck identification | NO in A, YES in B | **NO** | Zero in DOM |
| **Arithmetic Explanation** | **NO** (Suppressed) | YES (`[WHY?]` panel) | Decision explainability | NO in A, YES in B | **NO** | Zero in DOM |
| **Assumptions & Lineage** | NO (Implicit) | YES (`[PROVENANCE]` drawer) | Traceability & limits | NO in A, YES in B | **NO** | Zero in DOM |

---

## Parity Verification Outcome
- Condition A has access to all raw hydraulic telemetry necessary to perform manual calculations.
- Condition B provides the automated decision transformations.
- DOM inspection confirms **zero answer leakage** in Condition A.
