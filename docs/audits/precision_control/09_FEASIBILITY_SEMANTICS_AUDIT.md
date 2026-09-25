# 09 — Feasibility Semantics & Strict Inequality Verification
**Audit Date:** 2026-09-24  
**Audited Engine:** `backend/app/domain/ewe_engine.py`  

---

## 1. Feasibility Semantics
A route is classified as `FEASIBLE` if and only if every segment on the route satisfies the strict clearance inequality:

$$\forall i \in \text{Route}, \quad D_{\text{departure}} + T_i + B < A_i$$

where:
- $D_{\text{departure}}$: Vehicle departure time relative to breach inception ($T+00:00$).
- $T_i$: Cumulative travel time to segment $i$.
- $B$: Configured safety buffer.
- $A_i$: Flood arrival time on segment $i$.

---

## 2. Categorization Rules

| Margin Metric | Status Classification | Operational Interpretation |
| :--- | :--- | :--- |
| $\text{Margin} > 5.0\text{ min}$ | `FEASIBLE` | Route is clear with comfortable clearance buffer under current assumptions. |
| $0 \le \text{Margin} \le 5.0\text{ min}$ | `LOW MARGIN` | Route is feasible, but clearance time margin is narrow ($< 5\text{ min}$). |
| $\text{Margin} < 0$ | `INFEASIBLE` | Floodwaters breach limiting segment before vehicle clears it. |
| Missing Arrival Data | `DATA GAP` | Feasibility cannot be computed due to uncoupled / missing hydraulic data. |

---

## 3. Boundary Inequality Compliance
In `ewe_engine.py`, boundary equality ($D + T_i + B == A_i$) yields $\text{Margin} = 0$, which is correctly designated as `LOW MARGIN`, while strict deficit ($\text{Margin} < 0$) triggers `INFEASIBLE`.
