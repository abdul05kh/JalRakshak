# 06 — Single-Source Deadline Engine & Invariant Audit
**Audit Date:** 2026-09-24  
**Audited Module:** `backend/app/domain/ewe_engine.py`  

---

## 1. Single-Source Mathematical Definition
The evacuation departure deadline is computed exclusively by the backend Evacuation Window Engine (EWE) using the canonical formula:

$$D_{\text{deadline}} = \min_{i \in \text{Route}} \left( A_i - T_i - B \right)$$

where:
- $A_i$: Road-coupled hydraulic arrival time at segment $i$ (seconds since breach inception).
- $T_i$: Cumulative traversal time from route origin to the exit of segment $i$ (seconds).
- $B$: Configured emergency safety buffer (seconds).

---

## 2. Invariant Verification

Mathematical property tests enforce the following invariant monotonicity rules:
1. **Arrival Monotonicity:** $\forall A_2 \ge A_1 \implies D(A_2) \ge D(A_1)$
2. **Travel Time Monotonicity:** $\forall T_2 \ge T_1 \implies D(T_2) \le D(T_1)$
3. **Safety Buffer Monotonicity:** $\forall B_2 \ge B_1 \implies D(B_2) \le D(B_1)$
4. **Deterministic Identity:** Identical inputs $(A, T, B)$ yield strictly identical deadlines across all runs.

All 4 invariants are verified continuously in `backend/tests/test_gate5b_ui_simplification.py` and `run_gate5b_preflight.py`.
