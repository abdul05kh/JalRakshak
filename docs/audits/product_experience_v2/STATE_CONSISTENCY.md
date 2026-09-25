# STATE CONSISTENCY AUDIT (GATES H & M)
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Document**: Gates H & M — Mathematical Invariants and Single Authoritative Contract  
**Date**: September 25, 2026  
**Status**: COMPLETE / ACCEPTED (GATES H & M PASS)  

---

## 1. Executive Summary

Duplicate decision arithmetic, negative travel/buffer corruption, and silent zero-clamping (`Math.max(0, ...)`) have been completely eliminated from the frontend codebase.

All views consume the single immutable contract `AuthoritativeDecisionResult` exported exclusively from `frontend/src/services/decisionStore.ts`.

---

## 2. Authoritative Golden Case Multi-Scenario Verification

$$\text{Evacuation Decision Formula: } D = A - T - B$$

| Metric | SCENARIO_CENTRAL ($Q_p = 65,000\,\text{m}^3/\text{s}$) | SCENARIO_MINIMUM ($Q_p = 28,500\,\text{m}^3/\text{s}$) | SCENARIO_MAXIMUM ($Q_p = 115,000\,\text{m}^3/\text{s}$) | Status across All Views |
| :--- | :--- | :--- | :--- | :--- |
| **Active Route** | `R02` (Malidewal $\rightarrow$ Chamba) | `R02` (Malidewal $\rightarrow$ Chamba) | `R02` (Malidewal $\rightarrow$ Chamba) | **CONSISTENT** |
| **Limiting Segment** | `R02-E07` | `R02-E07` | `R02-E07` | **CONSISTENT** |
| **Flood Arrival ($A$)**| $3600\,\text{s}$ (**$T+60:00$**) | $5700\,\text{s}$ (**$T+95:00$**) | $2700\,\text{s}$ (**$T+45:00$**) | **CONSISTENT** |
| **Travel Duration ($T$)**| $759\,\text{s}$ (**$12:39$**) | $759\,\text{s}$ (**$12:39$**) | $759\,\text{s}$ (**$12:39$**) | **CONSISTENT** |
| **Safety Buffer ($B$)**| $180\,\text{s}$ (**$03:00$**) | $180\,\text{s}$ (**$03:00$**) | $180\,\text{s}$ (**$03:00$**) | **CONSISTENT** |
| **Departure Deadline ($D$)**| $2661\,\text{s}$ (**$T+44:21$**) | $4761\,\text{s}$ (**$T+79:21$**) | $1761\,\text{s}$ (**$T+29:21$**) | **CONSISTENT** |
| **Feasibility Status** | **`FEASIBLE`** | **`FEASIBLE`** | **`FEASIBLE`** | **CONSISTENT** |

---

## 3. Strict Boundary & Sign Rules

- **Zero Tolerance on Negative Travel/Buffer**: If $T \le 0$ or $B \le 0$, the engine raises an assertion error.
- **Negative Deadlines ($D < 0$)**: Mapped strictly to `INFEASIBLE` with the exact negative time preserved in audit records (no silent clamping to $T+00:00$).
- **Atomic Route Switches**: Selecting R01 or R03 immediately updates the destination, cumulative travel time, limiting edge, and deadline without displaying stale R02 numbers.

---

## 4. Gates H & M Verdict

**GATES H & M STATUS: PASS**  
100% mathematical consistency and complete multi-scenario agreement across all application pages.
