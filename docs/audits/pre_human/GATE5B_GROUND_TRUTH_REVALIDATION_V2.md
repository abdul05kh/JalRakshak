# JALRAKSHAK — GATE 5B GROUND TRUTH REVALIDATION (V2)
**Pre-Human Audit Forensic Verification — Hardened Gate 4 Spatial Coupling**
**Status:** REGENERATED & CRYPTOGRAPHICALLY LOCKED UNDER 150m CORRIDOR

---

## 1. Executive Reconciliation & Methodology Correction

In the initial pre-human audit document (`GATE5B_GROUND_TRUTH_REVALIDATION.md`), an erroneous historical annotation referenced "Radius 1200m KD-tree". 

Gate 4 forensic hardening (`GATE4_ROAD_HYDRAULIC_COUPLING.md`, `GATE4_SPATIAL_COUPLING_FORENSIC.md`) formally rejected the 1200m unconstrained centroid search due to severe spatial false-positives (which captured hydraulic cells up to 1.2 km away across mountain ridges and in distant river thalwegs).

This document (`V2`) records the authoritative ground truth regenerated **strictly using the locked Gate 4 spatial coupling methodology**:
- **Projection:** EPSG:32644 (UTM Zone 44N)
- **Geometry Representation:** Projected Road LineString
- **LineString Densification:** $\le 50.0\text{ m}$ sample spacing
- **Coupling Corridor:** Exact perpendicular distance $\le 150.0\text{ m}$ ($1.5 \times \Delta x_{\text{mesh}}$)
- **Arrival Threshold:** Water depth $h \ge 0.30\text{ m}$

---

## 2. Side-by-Side Coupling Comparison: Old 1200m vs. New 150m Hardened

### Segment R02 (Malidewal $\to$ Koteshwar Valley Road):
| Metric / Parameter | Old Unhardened 1200m Search | New Hardened 150m Corridor | Physical / Methodological Impact |
| :--- | :--- | :--- | :--- |
| **Coupled Hydraulic Cells** | 2,167 cells | **229 cells** | Eliminates 1,938 spurious cells located up to 1.2 km outside the road right-of-way. |
| **Minimum Perpendicular Distance**| $0.0\text{ m}$ (Centroid dist up to $1,198\text{ m}$) | $\mathbf{\le 150.0\text{ m}}$ | Strictly limits coupling to cells intersecting or bordering the road corridor. |
| **Maximum Water Depth ($h_{\max}$)**| $39.19\text{ m}$ | **$31.70\text{ m}$** | Removes false association with extreme deep-channel riverbed cells. |
| **Flood Arrival Time ($A_{\text{R02}}$)**| $3,300\text{ s}$ ($55.0\text{ min}$) | $\mathbf{3,600\text{ s}}$ ($\mathbf{60.0\text{ min}}$) | Reflects the true arrival of the $0.30\text{ m}$ inundation wave along the road surface. |
| **Cumulative Travel Time ($T_{\text{R02}}$)**| $759\text{ s}$ ($12.65\text{ min}$) | $\mathbf{759\text{ s}}$ ($\mathbf{12.65\text{ min}}$) | Constant kinematic travel time ($10.54\text{ km} / 50\text{ km/h}$). |
| **Configured Safety Buffer ($B$)** | $180\text{ s}$ ($3.0\text{ min}$) | $\mathbf{180\text{ s}}$ ($\mathbf{3.0\text{ min}}$) | Operational margin requirement. |
| **Departure Deadline ($D_{\text{deadline}}$)**| $2,361\text{ s}$ ($T+39\text{ min } 21\text{ sec}$) | $\mathbf{2,661\text{ s}}$ ($\mathbf{T+44\text{ min } 21\text{ sec}}$) | $3600\text{ s} - 759\text{ s} - 180\text{ s} = 2661\text{ s}$ ($44.35\text{ min}$). |
| **Limiting Segment** | `R02` | **`R02`** | `R02` remains the critical bottleneck segment under both methods. |

### Elimination of Regional False Positives:
- **Segment R03 (High Ground Bypass):** Under 1200m, falsely coupled 499 cells ($A=3900\text{ s}$, $h=28.42\text{ m}$). Under 150m hardened coupling: **0 cells inundated (status: `HIGH_GROUND_UNAFFECTED`)**.
- **Segment R17 (Ridge Route):** Under 1200m, falsely coupled 729 cells ($A=4200\text{ s}$, $h=24.94\text{ m}$). Under 150m hardened coupling: **0 cells inundated (status: `HIGH_GROUND_UNAFFECTED`)**.

---

## 3. Authoritative Multi-Scenario Ground Truth (Hardened 150m Coupling)

Coupled against the native HEC-RAS 7.0.1 HDF5 simulation suite in `artifacts/hecras/tehri_gate3b/`:

| Scenario ID | Native Artifact Checksum | Arrival at R02 ($A_{\text{R02}}$) | Travel Time ($T_i$) | Buffer ($B$) | Latest Feasible Departure ($D_{\text{deadline}}$) | Departure Margin | Limiting Segment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCENARIO_MINIMUM`** ($28.5\text{k}$) | `a2d2a712...` | $5,700\text{ s}$ ($95.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | **$T+79\text{ min } 21\text{ sec}$** ($79.35\text{ min}$) | $+79.4\text{ min}$ | `R02` |
| **`SCENARIO_CENTRAL`** ($65.0\text{k}$) | `c0b18e04...` | $3,600\text{ s}$ ($60.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | **$T+44\text{ min } 21\text{ sec}$** ($44.35\text{ min}$) | $+44.4\text{ min}$ | `R02` |
| **`SCENARIO_MAXIMUM`** ($115\text{k}$) | `ec552492...` | $2,700\text{ s}$ ($45.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | **$T+29\text{ min } 21\text{ sec}$** ($29.35\text{ min}$) | $+29.4\text{ min}$ | `R02` |

---

## 4. Revalidation of Gate 5B Experimental Tasks

| Task ID | Domain | Scenario | Authoritative Ground Truth (150m Coupling) | Scoring Rule / Tolerance |
| :--- | :--- | :--- | :--- | :--- |
| **TASK-01** | Route Feasibility | `SCENARIO_CENTRAL` | **`FEASIBLE`** (under configured scenario & rules) | Exact match. `SAFE` flagged as danger/misconception. |
| **TASK-02** | Departure Deadline | `SCENARIO_CENTRAL` | **`T+44 min 21 sec`** ($44.35\text{ min}$ / $2,661\text{ s}$) | $\pm 1.5\text{ min}$ ($43.0\text{ min}$ to $45.5\text{ min}$). |
| **TASK-03** | Limiting Segment | `SCENARIO_CENTRAL` | **`R02`** (Chainage $6.50\text{ km}$, Malidewal-Koteshwar valley road) | Exact match: `R02` / `Segment 2`. |
| **TASK-04** | Causal Reason | `SCENARIO_CENTRAL` | **Inundation arrival at 60 min ($3,600\text{ s}$) minus travel time ($12.65\text{ min}$) minus buffer ($3\text{ min}$) $= 44.35\text{ min}$.** | Requires flood arrival, travel time, and safety buffer. |
| **TASK-05** | Alternative Route | `SCENARIO_CENTRAL` | **`FEASIBLE` via High Ridge `R01` / Chamba Bypass** (Status: `OPEN`, Traversal: $9.18\text{ min}$, unflooded). | Identifies mountain ridge bypass. |
| **TASK-06** | Scenario Change Delta | Central ($65\text{k}$) $\to$ Maximum ($115\text{k}$) | **Departure window contracts by 15.0 min** (from $T+44:21$ down to $T+29:21$). | Identifies window contraction / earlier arrival. |
| **TASK-07** | Limitation Awareness | System Limitations | **Identifies static speeds, demo dataset, uncalibrated field status**; rejects `100% risk-free guarantee`. | Any valid limitation; guarantee triggers danger flag. |

---

## 5. Cryptographic Seal
- **Ground Truth Hash:** `4bf8d9a2d6d04bff1cde373d74ec18602eadb00cabafe5c1d37767ea672a7637`
- **Hydraulic Central Artifact:** `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf`
- **Hydraulic SHA-256:** `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78`
- **Coupling Engine:** `backend/app/domain/road_hydraulic_mapper.py` (`search_radius_m = 150.0`, `sample_spacing_m = 50.0`)
- **Status:** **REGENERATED, VERIFIED, & FULLY LOCKED**.
