# GATE 5B — EXPERIMENTAL GROUND TRUTH FREEZE

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** IMMUTABLE GROUND TRUTH FROZEN  
**Date:** 2026-09-24  

---

## 1. Ground Truth Immutability Rule

The following ground-truth benchmarks are frozen from the **Gate 5A computational validation outputs**. Under no circumstances may this ground truth be altered after observing participant responses.

---

## 2. Frozen Ground Truth Reference Table

| Task ID | Task Domain | Underlying Scenario & Path | Pre-Registered Correct Answer | Accepted Tolerance / Variations |
|:---:|:---|:---|:---|:---|
| **TASK-01** | Route Feasibility | `SCENARIO_CENTRAL` (Malidewal $\to$ Koteshwar, $T=0$) | **`FEASIBLE`** (or "FEASIBLE UNDER CONFIGURED RULES") | Strictly rejects `SAFE` or `GUARANTEED`. |
| **TASK-02** | Departure Deadline | `SCENARIO_CENTRAL` (Malidewal $\to$ Koteshwar) | **`T+44 min 21 sec`** ($44.35\text{ min}$ / $2,661\text{ s}$) | $\pm 1.5\text{ min}$ (Accepted range: `T+43:00` to `T+45:30` / $43.0$ to $45.5\text{ min}$). |
| **TASK-03** | Limiting Segment | `SCENARIO_CENTRAL` (Malidewal $\to$ Koteshwar) | **`R02`** (or "Malidewal-Koteshwar Valley Road") | Road ID `R02` or clear textual description. |
| **TASK-04** | Causal Reason | `SCENARIO_CENTRAL` (Malidewal $\to$ Koteshwar) | **Flood arrival at 60 min ($3,600\text{ s}$) minus travel time of 12.65 min ($759\text{ s}$) minus 3 min buffer ($180\text{ s}$) $= 44.35\text{ min}$.** | Must identify flood arrival, travel time, and buffer. |
| **TASK-05** | Alternative Routes | `SCENARIO_CENTRAL` (Malidewal $\to$ Chamba) | **Yes, High Ridge Bypass via `R01`** (Status: `OPEN / Below threshold`, Traversal: $9.18\text{ min}$, unconstrained by flood). | Identifies ridge road / mountain bypass. |
| **TASK-06** | Scenario Change Delta | Switch `SCENARIO_CENTRAL` ($65\text{k}$) $\to$ `SCENARIO_MAXIMUM` ($115\text{k}$) | **Departure deadline contracts significantly** (earlier flood arrival due to higher discharge; margin narrows to `LOW MARGIN` or `INFEASIBLE`). | Identifies window contraction and earlier arrival. |
| **TASK-07** | Limitation Awareness | Epistemic Limitations | **Identifies at least 1 material limitation** (e.g. static speed assumption, demonstration road scope, lack of real breach field calibration). | Any valid limitation from the ledger. |

---

## 3. Cryptographic Ground Truth Seal

```
GROUND TRUTH SHA-256: 4bf8d9a2d6d04bff1cde373d74ec18602eadb00cabafe5c1d37767ea672a7637
```
