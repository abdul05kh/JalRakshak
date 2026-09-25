# GATE 5 — GOLDEN DECISION CASES & REGRESSION MATRIX

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** VALIDATED  
**Date:** 2026-09-24  

---

## 1. Golden Fixtures Overview

Golden decision fixtures provide immutable regression benchmarks. Any future code change must reproduce these results within documented numerical tolerances ($\pm 0.1\text{ min}$ for time, $\pm 0.05\text{ m}$ for depth).

---

## 2. Golden Cases Ledger

### 2.1 GOLDEN_A: FEASIBLE (Standard Central Evacuation)
- **Input:** Origin: `VILL-02` (Malidewal Lowland Village), Destination: `VILL-01` (Koteshwar Settlement), Scenario: `SCENARIO_CENTRAL` (Prescribed piping breach hydrograph $Q_{\text{peak}} = 65,000\text{ m}^3/\text{s}$), Departure Time: $00:00\text{ UTC}$, Safety Buffer: $3.0\text{ min}$.
- **Expected Output:**
  - Status: `FEASIBLE`
  - Limiting Segment: `R02`
  - Limiting Flood Arrival: $3,600\text{ s}$ ($01:00\text{ UTC}$)
  - Route Traversal Time: $12.65\text{ min}$
  - Latest Feasible Departure: $\approx 00:44:21\text{ UTC}$ ($44.35\text{ min}$ from $T_0$)
  - Margin: $\approx +44.4\text{ min}$ ($> 5.0\text{ min}$)
- **Pass/Fail:** **PASS**

### 2.2 GOLDEN_B: LOW_MARGIN (Tight Window Evacuation)
- **Input:** Same OD as GOLDEN_A, but Requested Departure Time delayed to $00:41\text{ UTC}$ ($41.0\text{ min}$ post-breach), Safety Buffer: $3.0\text{ min}$.
- **Expected Output:**
  - Status: `LOW MARGIN`
  - Latest Feasible Departure: $\approx 00:44:21\text{ UTC}$
  - Margin: $\approx +3.35\text{ min}$ ($0 < \text{Margin} \le 5.0\text{ min}$)
  - Explanation: Surfaces narrow clearance warning (< 5 min) without declaring `SAFE`.
- **Pass/Fail:** **PASS**

### 2.3 GOLDEN_C: INFEASIBLE (Overtaken by Flood Wave)
- **Input:** Same OD as GOLDEN_A, but Requested Departure Time delayed to $00:50\text{ UTC}$ ($50.0\text{ min}$ post-breach), Safety Buffer: $3.0\text{ min}$.
- **Expected Output:**
  - Status: `INFEASIBLE`
  - Latest Feasible Departure: $\approx 00:44:21\text{ UTC}$
  - Margin: $\approx -5.65\text{ min}$ ($< 0$)
  - Limiting Segment: `R02`
  - Explanation: Causal explanation that route completion exceeds flood arrival.
- **Pass/Fail:** **PASS**

### 2.4 GOLDEN_D: DATA_GAP (Missing Hydraulic Data Propagation)
- **Input:** Evaluation where segment `R02` has missing hydraulic coverage (`arrival_s = NULL / UNMAPPED`).
- **Expected Output:**
  - Status: `DATA GAP`
  - Latest Feasible Departure: `null`
  - Margin: `null`
  - Explanation: "Cannot determine route feasibility: flood arrival data is unavailable on one or more route segments."
  - Never falls back to `FEASIBLE` or `SAFE`.
- **Pass/Fail:** **PASS**

### 2.5 GOLDEN_E: NO_FEASIBLE_ROUTE (Completely Severed Connectivity)
- **Input:** Disconnected graph query (e.g. isolated or severed node pair where all simple paths are blocked or non-existent).
- **Expected Output:**
  - Status: `NO_FEASIBLE_ROUTE`
  - Primary Route: `null`
  - Alternatives: `[]`
  - Explanation: Explicit causal failure explanation rather than an uncaught exception.
- **Pass/Fail:** **PASS**

### 2.6 GOLDEN_F: SCENARIO_COMPARISON (Central vs. Maximum Inflow Breach)
- **Input:** Compare `SCENARIO_CENTRAL` (Prescribed $Q_{\text{peak}} = 65,000\text{ m}^3/\text{s}$) vs. `SCENARIO_MAXIMUM` (Worst-case prescribed $Q_{\text{peak}} = 90,000\text{ m}^3/\text{s}$).
- **Expected Output:**
  - Peak Inflow Delta: $+25,000\text{ m}^3/\text{s}$
  - Flood Arrival Delta on R02: Evaluated deterministically across simulation timesteps.
  - Departure Window Contraction: Quantified and explained via deterministic template.
  - Route Status Evolution: Tracked deterministically.
- **Pass/Fail:** **PASS**

### 2.7 GOLDEN_G: ALTERNATIVE_ROUTE (High-Ground Mountain Bypass)
- **Input:** Query from `N-MALIDEWAL` to `N-CHAMBA` with request for $k=3$ alternative routes.
- **Expected Output:**
  - Returns Route A (High Ridge Bypass via R01, $9.18\text{ min}$, Status: `OPEN / Un-inundated`, $D_{\text{deadline}} = \text{Unconstrained}$).
  - Secondary path options evaluated with individual traversal times and margins.
  - Deterministic ranking without invented "safety scores."
- **Pass/Fail:** **PASS**

### 2.8 GOLDEN_H: R02_SPATIAL_COUPLING (Corridor Hardening Verification)
- **Input:** Spatial mapping of `R02` with hardened $150\text{ m}$ buffer vs obsolete $1,200\text{ m}$ buffer.
- **Expected Output:**
  - Hardened $150\text{ m}$: Max depth $= 31.70\text{ m}$, arrival $= 3,600\text{ s}$, Candidate cells $= 230$.
  - Obsolete $1,200\text{ m}$ ($37.37\text{ m}$ peak depth) is rejected by production engine.
- **Pass/Fail:** **PASS**
