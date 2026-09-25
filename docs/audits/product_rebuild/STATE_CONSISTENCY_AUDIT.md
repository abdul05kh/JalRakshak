# STATE CONSISTENCY AUDIT
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Audit Scope**: Mathematical Invariants, Single Source of Truth, Cross-Component Synchronization, and Edge-Case Robustness  
**Date**: September 25, 2026  
**Status**: COMPLETE / VERIFIED  

---

## 1. Executive Summary

State fragmentation and duplicate decision calculations have been eliminated from the JalRakshak frontend.

All components across all views consume a single, typed, immutable frontend contract: `AuthoritativeDecisionResult`, exported exclusively by `frontend/src/services/decisionStore.ts`. No view, card, header, or table performs independent arithmetic on timestamps, arrival times, travel times, or safety buffers.

---

## 2. Mathematical Decision Invariant

For every route $r$ and scenario $s$, the evacuation departure deadline $D$ is strictly governed by:

$$D = A - T - B$$

Where:
- $A$: Earliest flood arrival time at limiting segment ($h \ge 0.30\,\text{m}$)
- $T$: Cumulative route travel time from origin to high ground
- $B$: Configured evacuation safety buffer ($180\,\text{s} = 03:00$)

### Strict Negative/Error Semantics:
- **No silent zero-clamping**: `Math.max(0, ...)` is strictly prohibited.
- **Positive Sign Enforced**: If $T < 0$ or $B < 0$, the store raises an immediate assertion error rather than displaying corrupted or misleading numbers.
- **Negative Deadlines ($D < 0$)**: Mapped to `INFEASIBLE` with exact negative values displayed in audit logs.

---

## 3. Authoritative Golden Cases

The following golden cases were evaluated across all views (3D Map Overlay, Decision View, Road Impact View, Simulation View, Science View):

### Scenario 1: CENTRAL ($Q_p = 65,000\,\text{m}^3/\text{s}$, Route R02 $\rightarrow$ Chamba Shelter)
- **Arrival Time ($A$)**: $3600\,\text{seconds}$ ($T+60:00$)
- **Travel Time ($T$)**: $759\,\text{seconds}$ ($12:39$)
- **Safety Buffer ($B$)**: $180\,\text{seconds}$ ($03:00$)
- **Departure Deadline ($D$)**: $3600 - 759 - 180 = 2661\,\text{seconds}$ (**$T+44:21$**)
- **Limiting Segment**: `R02-E07`
- **Status**: `FEASIBLE`

### Scenario 2: MINIMUM ($Q_p = 28,500\,\text{m}^3/\text{s}$, Route R02 $\rightarrow$ Chamba Shelter)
- **Arrival Time ($A$)**: $5700\,\text{seconds}$ ($T+95:00$)
- **Travel Time ($T$)**: $759\,\text{seconds}$ ($12:39$)
- **Safety Buffer ($B$)**: $180\,\text{seconds}$ ($03:00$)
- **Departure Deadline ($D$)**: $5700 - 759 - 180 = 4761\,\text{seconds}$ (**$T+79:21$**)
- **Limiting Segment**: `R02-E07`
- **Status**: `FEASIBLE`

### Scenario 3: MAXIMUM ($Q_p = 115,000\,\text{m}^3/\text{s}$, Route R02 $\rightarrow$ Chamba Shelter)
- **Arrival Time ($A$)**: $2700\,\text{seconds}$ ($T+45:00$)
- **Travel Time ($T$)**: $759\,\text{seconds}$ ($12:39$)
- **Safety Buffer ($B$)**: $180\,\text{seconds}$ ($03:00$)
- **Departure Deadline ($D$)**: $2700 - 759 - 180 = 1761\,\text{seconds}$ (**$T+29:21$**)
- **Limiting Segment**: `R02-E07`
- **Status**: `FEASIBLE`

---

## 4. Cross-Page Synchronization Verification

Automated integration tests verified that navigating between all six views displays **identical decision metrics**:
1. **Header Badge**: `SCENARIO: CENTRAL`, `ROUTE: R02`, `T+60:00`
2. **Floating Decision Card**: `LEAVE BY T+44:21`, `Limiting: R02-E07`
3. **Decision Page Primary Hero**: `T+44:21`, `Arrival: T+60:00`, `Travel: 12:39`, `Buffer: 03:00`
4. **Road Impact Table**: Route R02 row shows `Limiting: R02-E07`, `Deadline: T+44:21`
5. **Science Page Chain**: Identical arithmetic formula and intermediate values rendered verbatim.

---

## 5. Audit Verdict

**STATE CONSISTENCY AUDIT STATUS: PASS**  
Zero duplicate logic, zero state divergence, zero negative sign corruption across the entire frontend application.
