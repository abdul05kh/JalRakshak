# GATE 5 — 3-TO-5 MINUTE EMERGENCY OFFICER DEMO SCRIPT

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** VALIDATED  
**Date:** 2026-09-24  

---

## 1. Demo Setup & Readiness Verification

- **Prerequisites:**
  - Local backend running on `http://localhost:8000`
  - Local frontend running on `http://localhost:5173`
  - Zero external internet or third-party cloud API dependencies
  - Frozen HEC-RAS artifacts pre-loaded

---

## 2. Minute-by-Minute Scripted Demonstration Flow

### Minute 0:00 – 0:45 | Context & Scenario Selection
- **Presenter Action:** Open the dashboard. Point out the Scenario Selector in the top bar.
- **Presenter Dialogue:**
  > *"Judges, when a dam breach occurs, emergency officers do not have hours to inspect 2D hydrodynamic mesh arrays or guess vehicle speeds. They need an immediate, mathematically defensible evacuation decision.*
  > *Here, we select the **Central Scenario (50m breach at Tehri Dam)**, running from frozen USACE HEC-RAS 7.0.1 2D unsteady outputs."*

### Minute 0:45 – 1:30 | The Primary Decision
- **Presenter Action:** Select Origin: **Malidewal Lowland Village**, Destination: **Chamba Mountain Relief Shelter**. Click **Evaluate Evacuation Window**.
- **Presenter Dialogue:**
  > *"Within 50 milliseconds, JalRakshak’s Evacuation Window Engine computes the decision. Notice the top decision panel:*
  > - *Status: **FEASIBLE UNDER CONFIGURED RULES**.*
  > - *Latest Feasible Departure: **00:44 UTC** (giving an evacuation margin of **44.4 minutes**).*
  > - *Limiting Segment: **R02 (Valley Road)**.*
  > - *Flood Arrival on R02: **01:00 UTC** (60 minutes post-breach).*
  > *This transforms millions of raw hydraulic array points into a single, unambiguous deadline for the incident commander."*

### Minute 1:30 – 2:15 | Explainability (WHY) & Alternative Routes
- **Presenter Action:** Click the **WHY Explanation** card, then toggle to **Route B (High Ridge Bypass)**.
- **Presenter Dialogue:**
  > *"Look at the deterministic explanation. Every number is traceable: flood arrival at 60 min, traversal time of 12.65 min, plus a 3-minute operational safety buffer yields a 44.35-minute departure window.*
  > *Now, what if the valley road is blocked by local debris? We toggle to **Route B**. The engine automatically evaluates the high-ground mountain bypass via R01/R17. Because this ridge sits completely above flood elevations, Route B is 100% DRY and unconstrained by flood arrival."*

### Minute 2:15 – 3:15 | Scenario Stress Testing (Central vs. Maximum Breach)
- **Presenter Action:** Open the **Scenario Comparison Modal**. Compare Central (50m) vs. Catastrophic (100m).
- **Presenter Dialogue:**
  > *"In an emergency, assumptions can worsen. What if the breach expands to 100 meters?*
  > *We switch to the **Catastrophic Scenario**. Peak discharge doubles to 42,000 m³/s. Flood arrival at R02 jumps forward from 60 minutes to 30 minutes.*
  > *JalRakshak immediately re-evaluates the window: the departure deadline contracts from 00:44 to **00:14 UTC**, and the status shifts to **LOW MARGIN**."*

### Minute 3:15 – 4:00 | Provenance, Scientific QA & Epistemic Honesty
- **Presenter Action:** Open the **Provenance & Scientific QA Drawer**. Point out the SHA-256 artifact hash and epistemic disclaimers.
- **Presenter Dialogue:**
  > *"Finally, look at the evidence drawer. Every claim is cryptographically tied to the native HEC-RAS HDF5 artifact SHA-256 hash.*
  > *More importantly, we practice scientific honesty: we explicitly state that travel times use static engineering speeds, the road network is a 17-segment demonstration dataset, and physical validation against real-world dam break is not established.*
  > *JalRakshak does not build another flood map. We build and defend the decision."*
