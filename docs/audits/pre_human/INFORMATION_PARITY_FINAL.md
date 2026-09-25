# JALRAKSHAK — INFORMATION PARITY FINAL AUDIT
**Pre-Human Audit Forensic Parity Matrix**
**Status:** FULL PARITY VERIFIED — NO CRIPPLED CONTROL

---

## 1. Scientific Principle of Information Parity

To prevent creating a "straw-man" control condition, **Condition A (Raw Hydraulic Output)** must contain all underlying physical and spatial information necessary to derive the correct answers to all tasks. 

Condition B (JalRakshak Decision Representation) must NOT succeed simply because Condition A was deliberately crippled or denied basic hydraulic information.

---

## 2. Granular Information Comparison Matrix

| Information Element | Condition A: Raw Hydraulic Representation | Condition B: JalRakshak Decision Support | Parity Classification | Parity Explanation & Derivability in Condition A |
| :--- | :--- | :--- | :--- | :--- |
| **Flood Inundation Extent** | Full 2D inundation depth contour map + station depths. | GeoJSON spatial layer overlaid with road network. | **SHARED** | Both conditions display exact spatial inundation extents. |
| **Flood Arrival Time ($A_i$)** | Displayed in station hydrographs and cell time series ($A_{\text{R02}} = T+60\text{ min}$). | Surfaced in Road Status table and EWE panel ($T+60\text{ min}$). | **SHARED** | Raw condition explicitly lists arrival times for all monitored cross-sections. |
| **Water Surface Elevation (WSE)** | $817.5\text{ m}$ to $841.2\text{ m}$ in cell profile tables. | Linked in Provenance inspect drawer. | **SHARED** | Both representations provide terrain & WSE elevations. |
| **Road Geometry & Length** | Road network polyline vector with labeled chainages ($10.54\text{ km}$). | Labeled route selection with chainage coordinates. | **SHARED** | Participant in Condition A can read route length from map scale and chainage table. |
| **Assumed Vehicle Speed** | Explicitly stated in task prompt ($50\text{ km/h}$). | Hardcoded in calculation engine ($50\text{ km/h}$). | **SHARED** | Stated directly in instructions for both conditions. |
| **Operational Safety Buffer** | Explicitly stated in task prompt ($3.0\text{ min} = 180\text{ s}$). | Embedded in calculation parameters ($3.0\text{ min}$). | **SHARED** | Stated directly in instructions for both conditions. |
| **Route Feasibility Status** | **Not pre-evaluated.** User must calculate $T_{\text{travel}} = 12.65\text{ min}$, check if $T_{\text{travel}} + 3\text{ min} \le 60\text{ min}$. | **Directly calculated:** Surfaced as `FEASIBLE`. | **DECISION ABSTRACTION** | Represents the core hypothesis: automated constraint satisfaction vs manual human calculation. |
| **Departure Deadline ($D_{\text{deadline}}$)** | **Not pre-evaluated.** Derivable as $60\text{ min} - 12.65\text{ min} - 3.0\text{ min} = 44.35\text{ min}$ ($T+44\text{ min } 21\text{ sec}$). | **Directly surfaced:** Displayed as `T+44 min 21 sec` (Margin: $+44.4\text{ min}$). | **DECISION ABSTRACTION** | Represents automated minimum deadline calculation over all vertices. |
| **Limiting Segment ($R_i$)** | **Not pre-flagged.** User compares arrival at all stations (R01: $T+90$, R02: $T+60$, R03: $T+105$) to find minimum margin. | **Directly surfaced:** Highlighted as `R02` (Bottleneck segment). | **DECISION ABSTRACTION** | Represents spatial coupling bottleneck identification. |

---

## 3. Independent Usability Test of Condition A

To confirm that Condition A is genuinely usable and fair:
1. **Mathematical Solvability:** An emergency analyst given Condition A receives:
   - Arrival time at R02: $60.0\text{ min}$ ($3,600\text{ s}$)
   - Route travel time: $10.54\text{ km} / 50\text{ km/h} = 0.2108\text{ h} = 12.65\text{ min}$ ($759\text{ s}$)
   - Buffer: $3.0\text{ min}$ ($180\text{ s}$)
   - Departure deadline = $60.0 - 12.65 - 3.0 = \mathbf{44.35\text{ min}}$ ($\mathbf{T+44\text{ min } 21\text{ sec}}$).
2. **Epistemic Distinction:** **Condition A is information-complete and mathematically solvable; empirical human usability remains untested.** The experiment measures cognitive speed, workload, and error rates in real human subjects, without claiming a human result before the trial is conducted.

---

## 4. Parity Verdict
- **Status:** ✅ **PASS**
- **Evidence:** Condition A has complete information parity; zero artificial barriers introduced; empirical human usability to be determined during experimental trials.
