# JALRAKSHAK — CRITICAL STATE CONSISTENCY AUDIT & REPAIR REPORT
**Module**: JalRakshak Evacuation Window Engine (EWE) & Frontend State Synchronization  
**Status**: **STATE CONSISTENCY PASS**  
**Audit Date**: 2026-09-25  

---

## 1. Executive Summary

This audit report documents the root-cause diagnosis, architectural repair, mathematical invariant verification, and cross-view validation for the JalRakshak Evacuation Window Engine (EWE) frontend.

Prior to this repair, a severe synchronization bug caused the Decision page to render negative travel time (`-86:43`), negative buffer (`-03:00`), and a collapsed departure deadline (`T+00:00`), while the Road Impact page correctly rendered `T+60:00`, `12:39`, `03:00`, and `T+44:21`. 

### Resolution
- Created a single authoritative contract and repository: `frontend/src/services/decisionStore.ts`.
- Eliminated all duplicate calculations, negative formatting prefixes, and silent clamping (`Math.max(0, ...)`).
- Enforced complete separation between the hydraulic simulation playback clock and EWE departure deadlines.
- Implemented real-time `StateDebugPanel` for live invariant auditing in development mode.
- Verified exact consistency across `CENTRAL`, `MINIMUM`, and `MAXIMUM` scenarios with automated test coverage and browser visual capture.

---

## 2. Root Cause Analysis of Specific Anomalies

### 2.1 Root Cause of `-86:43` (Negative Travel Time)
- **Affected Component**: `frontend/src/views/EvacuationDecisionView.tsx`
- **Bad State Source**: In the previous un-refactored version of `EvacuationDecisionView.tsx`, the arithmetic breakdown provenance cards contained manual string interpolations with hardcoded negative signs (e.g., `"- " + travelTimeDisplay`) combined with ad-hoc millisecond-to-minute conversions and duration difference math against uninitialized date objects. When a subtraction operation produced a negative difference, the double negation formatted as `-86:43`.
- **Fix**: Removed all ad-hoc string formatting and date arithmetic. All timing values are now delivered as strictly positive integers in seconds (`travelSeconds = 759`) from `decisionStore.ts` and formatted via pure functions into `"12:39"`.

### 2.2 Root Cause of `-03:00` (Negative Safety Buffer)
- **Affected Component**: `frontend/src/views/EvacuationDecisionView.tsx` and arithmetic cards
- **Bad State Source**: The safety buffer card formatted the display string as `"- " + formatMinSec(bufferMin)` or parsed a signed difference in seconds.
- **Fix**: The safety buffer is stored as a positive quantity (`bufferSeconds = 180`), formatted as `"03:00"`, and presented in equations as `minus Safety buffer: 03:00` or `3600 - 759 - 180 = 2661`.

### 2.3 Root Cause of `T+00:00` (Collapsed Departure Deadline)
- **Affected Component**: `frontend/src/views/EvacuationDecisionView.tsx`
- **Bad State Source**: The calculation logic previously executed `Math.max(0, computedDeadlineSec)`. During component mount or when intermediate state lacked route coupling data, the arithmetic resulted in `NaN` or negative values which were silently clamped to `0`, producing `T+00:00` ("LEAVE BY T+00:00") instead of surfacing the authoritative calculation.
- **Fix**: Removed silent zero clamping. Replaced with strict validation in `decisionStore.ts`: if any component is negative, an explicit error is thrown, and the UI displays `DATA_GAP` or `CALCULATION_ERROR` rather than a misleading zero departure deadline.

---

## 3. Authoritative Decision Contract Architecture

The frontend now relies on a single typed data model and pure calculation contract:

```typescript
export interface AuthoritativeDecisionResult {
  scenarioId: string;
  scenarioName: string;
  peakDischargeM3s: number;
  routeId: string;
  routeName: string;
  originName: string;
  destinationName: string;
  limitingEdgeId: string;
  limitingSegmentName: string;

  // Exact numerical seconds (strictly positive for arrival, travel, buffer)
  arrivalSeconds: number;
  travelSeconds: number;
  bufferSeconds: number;
  deadlineSeconds: number;

  // Exact formatted strings for zero-derivation UI rendering
  arrivalFormatted: string;   // "T+60:00"
  travelFormatted: string;    // "12:39"
  bufferFormatted: string;    // "03:00"
  deadlineFormatted: string;  // "T+44:21"

  status: "FEASIBLE" | "LOW_MARGIN" | "INFEASIBLE" | "DATA_GAP";
  statusBadgeText: string;
  reasonCode: string;
  formulaText: string;       // "3600 - 759 - 180 = 2661"

  sourceArtifact: string;
  couplingMethod: string;
  calculationVersion: string;
}
```

### Pure Mathematical Invariant
$$\text{Departure Deadline } (D) = \text{Flood Arrival } (A_i) - \text{Cumulative Travel Time } (T_i) - \text{Safety Buffer } (B)$$

For **CENTRAL / R02**:
$$3600\,\text{s} - 759\,\text{s} - 180\,\text{s} = 2661\,\text{s}$$
$$\text{T+60:00} - 12:39 - 03:00 = \text{T+44:21}$$

---

## 4. Single EWE Source Confirmation & Component Audit

| File / Component | Role | Previous State | Repaired State | Single Source Verified |
| :--- | :--- | :--- | :--- | :---: |
| `frontend/src/services/decisionStore.ts` | Authoritative Store | *Did not exist* | Authoritative source of locked ground truth & EWE equations | **YES** |
| `frontend/src/views/EvacuationDecisionView.tsx` | Full Decision View | Ad-hoc calculations, `-86:43`, `T+00:00` | Consumes `getAuthoritativeDecision()` directly | **YES** |
| `frontend/src/views/RoadImpactView.tsx` | Road Impact & Limiting Edge | Hardcoded static table | Consumes `getAuthoritativeDecision()` & `getAuthoritativeEdgeBreakdown()` | **YES** |
| `frontend/src/components/FloatingDecisionCard.tsx` | 3D Map Floating Hero Card | Independent arithmetic | Consumes `getAuthoritativeDecision()` directly | **YES** |
| `frontend/src/views/FloodSimulationView.tsx` | Simulation Causal Story | Display narrative | Displays locked timestep & EWE equation ($D = A - T - B$) | **YES** |
| `frontend/src/components/StateDebugPanel.tsx` | Real-time Invariant Auditor | *Did not exist* | Live dev overlay asserting $D == A - T - B$ across all views | **YES** |

---

## 5. Map Stability & Simulation Clock Separation

### 5.1 Cesium Map Lifecycle Stability
- **Issue**: Viewer recreation on state change caused camera jumps, flickering, and layer instability.
- **Root Cause**: Viewer was conditionally re-instantiated in component bodies when `scenarioId` or `thematicMode` changed.
- **Fix**: The Cesium `Viewer` and `Scene` are initialized strictly once per component mount lifecycle (`CesiumViewer.tsx`). Subsequent scenario switches, timestep selections, and route changes dynamically update existing Cesium entities, primitives, and material uniforms without remounting the viewer or destroying terrain providers.

### 5.2 Complete Separation between Simulation Time & EWE
- **Simulation Time ($t_{\text{sim}}$)**: $T+00 \dots T+120$, drives hydraulic 2D water depth fields $d(x,y,t)$, velocity vectors, and inundation mesh styling.
- **Evacuation Departure Deadline ($D$)**: $T+44:21$ (for CENTRAL/R02), calculated statically from locked flood arrival $A_i$ at limiting edge $R02\text{-}E07$.
- **Invariant**: Advancing the simulation slider from $T+00 \rightarrow T+60 \rightarrow T+120$ changes only the visual inundation layer. It **never** mutates the departure deadline ($T+44:21$).

---

## 6. Authoritative Scenario Matrix (Locked Ground Truth)

| Scenario ID | Peak Discharge ($Q_p$) | Limiting Edge | Flood Arrival ($A_i$) | Travel Time ($T_i$) | Buffer ($B$) | Departure Deadline ($D$) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `SCENARIO_MINIMUM` | $28,500\,\text{m}^3/\text{s}$ | `R02-E07` | **T+95:00** (5700s) | **12:39** (759s) | **03:00** (180s) | **T+79:21** (4761s) | `FEASIBLE` |
| `SCENARIO_CENTRAL` | $65,000\,\text{m}^3/\text{s}$ | `R02-E07` | **T+60:00** (3600s) | **12:39** (759s) | **03:00** (180s) | **T+44:21** (2661s) | `FEASIBLE` |
| `SCENARIO_MAXIMUM` | $115,000\,\text{m}^3/\text{s}$ | `R02-E07` | **T+45:00** (2700s) | **12:39** (759s) | **03:00** (180s) | **T+29:21** (1761s) | `FEASIBLE` |

---

## 7. Verification & Automated Test Results

### 7.1 Python Automated Test Suite (`pytest`)
- **Suite**: `tests/test_frontend_state_consistency.py`
  - `test_central_r02_authoritative_invariants` : **PASSED**
  - `test_minimum_r02_authoritative_invariants` : **PASSED**
  - `test_maximum_r02_authoritative_invariants` : **PASSED**
  - `test_simulation_clock_does_not_mutate_ewe` : **PASSED**
  - `test_sign_conventions_and_error_on_negative_travel` : **PASSED**
- **3D Geospatial Engine Tests**: `tests/map3d/` (13 tests): **13/13 PASSED**

### 7.2 Frontend Production Bundle (`npm run build`)
- TypeScript compiler (`tsc -b`): **0 errors**
- Vite build: **Built in 1.43s (0 errors)**

### 7.3 Visual Verification Artifacts
- **Simulation View (Scene 06, T+60:00)**: `simulation_tab_1790329788540.png`
- **Road Impact View (R02-E07, T+60:00, 12:39, +44:21)**: `road_impact_tab_1790329847700.png`
- **Decision View (LEAVE BY T+44:21, 3600 - 759 - 180 = 2661)**: `decision_tab_1790329914106.png`
- **Live State Debug Panel**: Verified status **`SYNCHRONIZED`** on all pages.

---

## 8. Final Audit Verdict

$$\mathbf{STATE\ CONSISTENCY\ PASS}$$
