# GATE 5B TECHNICAL DRY RUN — INFORMATION PARITY AUDIT
**Document ID:** `07_INFORMATION_PARITY_AUDIT.md`
**Timestamp:** 2026-09-24T18:41:00+05:30 (Local)
**Epistemic Rule:** "Condition A is information-complete and mathematically solvable; empirical human usability remains untested."

---

## 1. Condition A vs. Condition B Feature Matrix

| Information Element | Condition A (Raw Hydraulic Output) | Condition B (JalRakshak Decision Output) | Parity Status | Derivation Complexity in Condition A |
| :--- | :--- | :--- | :---: | :--- |
| **Flood Inundation Depth Map** | 2D raster depth colormap with station cross-sections. | Vector road layer overlaid with inundation polygons. | ✅ **SHARED** | Visual map inspection. |
| **Arrival Times ($A_i$)** | Station hydrographs ($T+60\text{ min}$ at R02). | Direct table value ($T+60\text{ min}$). | ✅ **SHARED** | Direct hydrograph inspection. |
| **Road Length & Speed** | Labeled polyline ($7.38\text{ km}$, $35\text{ km/h}$). | Pre-computed traversal ($12.65\text{ min}$). | ✅ **SHARED** | Arithmetic: $7.38 / 35 \times 60 = 12.65\text{ min}$. |
| **Safety Buffer** | Stated in task prompt ($3.0\text{ min}$). | Embedded in decision engine ($3.0\text{ min}$). | ✅ **SHARED** | Arithmetic subtraction. |
| **Departure Deadline** | **Hidden.** User calculates $60 - 12.65 - 3 = 44.35\text{ min}$. | **Directly displayed:** `T+44 min 21 sec`. | ✅ **DECISION ABSTRACTION** | Automated constraint satisfaction vs manual arithmetic. |
| **Bottleneck Road** | **Hidden.** User inspects all segment arrival margins. | **Highlighted:** `R02 (Valley Road)`. | ✅ **DECISION ABSTRACTION** | Spatial coupling search vs automated highlighting. |
| **Limitation Disclosures** | Disclosed in standard metadata tab. | Disclosed in Epistemic Assumptions drawer. | ✅ **SHARED** | Tab navigation. |

---

## 2. Dry-Run Parity Findings
1. **No Artificial Obstacles:** Condition A was not intentionally obstructed; all numbers necessary to solve the tasks are accessible in the UI.
2. **Cognitive Load Isolation:** The difference between Condition A and Condition B isolates automated mathematical minimization and spatial coupling from manual mental arithmetic.
3. **Epistemic Statement:** Condition A is information-complete and mathematically solvable; empirical human usability will be measured during actual participant trials.
