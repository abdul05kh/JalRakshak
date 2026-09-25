# GATE 5 — EMERGENCY OFFICER DECISION MODEL

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** FORMALIZED & DEFENDED  
**Date:** 2026-09-24  

---

## 1. Decision Actor & Operational Context (WHO)

- **Primary Actor:** Emergency Operations Center (EOC) Watch Officer / District Disaster Management Authority (DDMA) Incident Commander.
- **Operational Setting:** Emergency Command Room evaluating evacuation feasibility during a catastrophic dam breach event (Tehri Dam $\to$ Koteshwar valley demonstration reach).
- **Time Pressure:** High urgency (minutes to hours). The operator cannot perform manual GIS overlays, query raw numerical mesh arrays, or estimate vehicle clearance times by hand.

---

## 2. The Officer Decision Problem (WHAT)

The decision-support system must answer eight explicit questions deterministically:

1. **Route Feasibility:** Is the requested evacuation route between Origin $O$ and Destination $D$ currently feasible under the selected breach scenario?
2. **Latest Feasible Departure Time:** What is the latest departure timestamp ($D_{\text{deadline}}$) before which evacuation must commence to guarantee clearance before floodwaters breach the road?
3. **Limiting Segment:** Exactly which road segment (edge $e_i$) establishes the deadline constraint?
4. **Hazard Arrival Time:** At what timestamp ($A_i$) does floodwater reaching the critical threshold ($h \ge 0.30\text{ m}$ or $v \ge 1.0\text{ m/s}$) reach that limiting segment?
5. **Alternative Routes:** Does an alternative high-ground route exist if the primary valley road is inundated or has low time margin?
6. **Scenario Sensitivity:** What happens to departure windows and route availability if breach severity increases (Central $\to$ Maximum)?
7. **Traceable Evidence & Assumptions:** What hydraulic artifact, solver version, travel speed model, and safety buffer assumptions underpin this recommendation?
8. **Data Gaps & Limitations:** What missing data or unmodeled factors (e.g., dynamic traffic congestion, debris, uncalibrated vertical datum) could invalidate the decision?

---

## 3. Raw Hydraulic Output (WHAT RAW MODELS PROVIDE)

Raw 2D hydraulic models (such as HEC-RAS 2D Unsteady) output hydrodynamic field variables:
- **Water Surface Elevation (WSE):** $z_{\text{wse}}(x, y, t)$ in meters.
- **Derived Water Depth:** $h(x, y, t) = \text{WSE}(x, y, t) - z_{\text{bed}}(x, y)$ in meters.
- **Face / Cell Velocity:** $\vec{u}(x, y, t)$ and $\vec{v}(x, y, t)$ in $\text{m/s}$.
- **Cell Arrival Timestamps:** First time cell reaches depth threshold.
- **Inundation Extent Polygon:** 2D spatial footprint of wetting front.

---

## 4. The Capability Gap (WHAT RAW HYDRAULICS DOES NOT PROVIDE)

Raw hydraulic simulation alone **does NOT provide emergency decision support**:

| Capability | Raw HEC-RAS Output | JalRakshak Decision Support |
|:---|:---|:---|
| **Road Route Feasibility** | None (no road network topology or graph traversal) | Deterministic Graph Routing with Edge-Level Feasibility |
| **Latest Feasible Departure** | None (only flood wave arrival at isolated points) | Evacuation Window Engine ($D_{\text{deadline}} = \min_i(A_i - T_i - B)$) |
| **Traversal Time Calculation**| None (does not model vehicle speeds or road class) | Static Engineering Travel-Time Model per road class |
| **Limiting Segment Pinpointing**| None (operator must manually scan thousands of cells) | Automated identification of critical bottleneck road edge |
| **Alternative Route Availability**| None (no alternative path discovery) | $k$-Shortest Alternative Path generation & EWE scoring |
| **Operational Safety Buffer**| None (pure hydrodynamic physics) | Configurable operational safety buffer ($B \ge 0$) |
| **Data-Gap Awareness** | None (silent omission outside model domain) | Explicit `DATA_GAP` status propagation |
| **Decision Traceability** | Complex numerical HDF5 tables | Immutable SHA-256 artifact hash & deterministic lineage |

---

## 5. Epistemic Classification

- **Hydraulic Prediction:** `NUMERICAL_VERIFICATION` (HEC-RAS 7.0.1 2D Unsteady Navier-Stokes numerical solution).
- **Physical Ground Truth:** `PHYSICAL_VALIDATION_NOT_ESTABLISHED` (Demonstration scenario on satellite DSM; no real dam-break event calibration).
- **Travel Time:** `STATIC_ENGINEERING_ASSUMPTION` ($40/30/20\text{ km/h}$ speeds; zero dynamic traffic or debris obstruction).
- **Safety Buffer & Low Margin:** `OPERATIONAL_CONFIGURATION` (Configured operational thresholds, not physical constants).
