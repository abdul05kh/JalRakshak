# 23 — Mathematical Invariant & Property Test Audit
**Audit Date:** 2026-09-24  
**Audited Engine:** `backend/app/domain/ewe_engine.py`  

---

## 1. Mathematical Invariant Property Matrix

| Property Invariant | Formal Definition | Tested Input Range | Observed Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Arrival Monotonicity** | $A_2 \ge A_1 \implies D(A_2) \ge D(A_1)$ | $A \in [1800, 7200]\text{ s}$ | Later flood arrival never produces an earlier deadline | **PASS** |
| **Travel Time Monotonicity** | $T_2 \ge T_1 \implies D(T_2) \le D(T_1)$ | Speed $\in [10, 80]\text{ km/h}$ | Slower travel never produces a later deadline | **PASS** |
| **Buffer Monotonicity** | $B_2 \ge B_1 \implies D(B_2) \le D(B_1)$ | Buffer $\in [0, 30]\text{ min}$ | Larger safety buffer never produces a later deadline | **PASS** |
| **Deterministic Consistency** | $f(X) == f(X)$ across runs | Repeated 100 iterations | Identical bitwise output every execution | **PASS** |
| **Data Gap Non-False Feasibility**| $A == \text{null} \implies \text{DATA GAP}$ | Omitted hydraulic cell arrivals | Never silently falls back to FEASIBLE | **PASS** |

---

## 2. Invariant Verification Verdict
All 5 decision-engine mathematical invariants are verified. The EWE calculation is strictly monotonic, deterministic, and protected against false positive classifications.
