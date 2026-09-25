# JALRAKSHAK — GATE 5B GROUND TRUTH REVALIDATION
**Pre-Human Audit Forensic Verification**
**Cryptographic & Hydraulic Linkage Freeze**

---

## 1. Ground Truth Derivation from Frozen Native HEC-RAS Runs

All ground-truth values for the Gate 5B experimental tasks are computed directly from the authoritative HEC-RAS 7.0.1 HDF5 binary artifact (`artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf`, SHA-256: `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78`).

```
Native HEC-RAS Simulation (tehri_15km_scenario_central.p01.hdf)
       ↓
KD-tree Spatial Coupling (Radius 1200m -> R02 cell centroid 520.1m)
       ↓
Arrival Time Array (A_R02 = 3600.0s = T+60 min)
       ↓
Kinematic Travel Time (T_R02 = 10.54 km / 50 km/h = 759.0s = 12.65 min)
       ↓
Operational Buffer (B = 180.0s = 3.0 min)
       ↓
Deterministic Departure Deadline: D_deadline = 3600 - 759 - 180 = 2661.0s = T+44 min 21 sec
```

---

## 2. Experimental Tasks Ground-Truth Master Table

| Task ID | Task Domain | Scenario ID | Question Summary | Authoritative Ground Truth | Tolerance / Scoring Boundary | Limiting Segment / Cause |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-01** | Route Feasibility | `SCENARIO_CENTRAL` | Under $Q_p = 65,000\text{ m}^3/\text{s}$, is Route 1 feasible for departure at $T_0$? | **`FEASIBLE`** | Exact match (`FEASIBLE`). `SAFE` is flagged as terminology error. | Segment `R02` allows transit before arrival ($A=60\text{m} > T=12.65\text{m}+3\text{m}$). |
| **TASK-02** | Departure Deadline | `SCENARIO_CENTRAL` | What is the latest feasible departure time for Route 1? | **`T+44 min 21 sec`** ($44.35\text{ min}$) | $\pm 1.5\text{ min}$ ($43.0\text{ min}$ to $45.5\text{ min}$ / `T+43:00` to `T+45:30`). | `R02` ($D = 60 - 12.65 - 3 = 44.35\text{ min}$). |
| **TASK-03** | Bottleneck Identification | `SCENARIO_CENTRAL` | Which specific road segment becomes limiting and determines the deadline? | **`R02`** (Chainage $6.50\text{ km}$) | Exact string match: `R02` / `Segment 2` / `Malidewal mid-reach`. | Earliest inundation arrival along the road corridor ($T+60\text{ min}$). |
| **TASK-04** | Causal Provenance | `SCENARIO_CENTRAL` | Why does this segment become the bottleneck? | **Inundation Arrival at T+60 min** exceeding depth threshold ($>0.30\text{ m}$). | Mentions: (1) flood arrival time, (2) travel time requirement, (3) safety buffer. | Hydraulic inundation wave reaches elevation $817.5\text{ m}$ at cell 3160. |
| **TASK-05** | Alternative Feasibility | `SCENARIO_CENTRAL` | If departure is delayed to $T+50\text{ min}$, is Route 2 feasible? | **`FEASIBLE` (Route 2)** / **`INFEASIBLE` (Route 1)** | Identifies Route 1 breached at $T+50$ ($50 > 44.35$), Route 2 clear. | Route 1 margin negative ($-5.65\text{ min}$); Route 2 unflooded. |

---

## 3. Cryptographic Ground-Truth Freeze

- **Ground Truth Manifest File:** `artifacts/gate5b/frozen_scenario_manifest.json`
- **Hydraulic Source Hash:** `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78`
- **Revalidation Status:** **100% VERIFIED & DETERMINISTICALLY LINKED**.
