# GATE 5B — INFORMATION PARITY & FAIRNESS AUDIT

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** AUDITED & VERIFIED  
**Date:** 2026-09-24  

---

## 1. Information Parity Principle

To ensure the experiment is scientifically rigorous and unbiased:
1. **Underlying Physics Parity:** Both Condition A (Raw) and Condition B (JalRakshak) are generated from the **identical frozen HEC-RAS 2D simulation HDF5 dataset** (`tehri_15km_scenario_central.p01.hdf`).
2. **Derivability Parity:** Every fact required to answer the task must be mathematically derivable from Condition A. Condition A must not be intentionally crippled or starved of data.
3. **Representation Parity:** Condition B presents the computed transformations (graph routing, speed models, EWE deadline minimization), while Condition A presents the raw hydrodynamic arrays.

---

## 2. Information Parity Mapping Table

| Task Information Element | Source in Condition A (Raw Output) | Derivation in Condition B (JalRakshak) | Parity Status | Required Cognitive Transformation in Condition A |
|:---|:---|:---|:---:|:---|
| **Flood Depth along Road** | Cell WSE minus cell minimum bed elevation ($h = \text{WSE} - z_{\text{bed}}$). | Automated spatial intersection along road corridor ($150\text{ m}$). | ✅ **FAIR** | Participant must mentally locate road on depth raster. |
| **Flood Arrival Timestamp ($A_i$)** | Discrete 5-min output timesteps ($t = 0, 5, 10, \dots, 60\text{ min}$) where depth $\ge 0.30\text{ m}$. | Automated threshold crossing extraction: $A_{\text{R02}} = 3,600\text{ s}$ ($60.0\text{ min}$). | ✅ **FAIR** | Participant must inspect time-series slider to find wetting front. |
| **Road Length & Speed Class** | Road vector table: $L_{\text{R02}} = 7,377.4\text{ m}$, Secondary Road ($35\text{ km/h}$). | Traversal time pre-computed: $T_{\text{R02}} = 12.65\text{ min}$. | ✅ **FAIR** | Participant must calculate $T = \frac{L}{v} = \frac{7.38}{35} \times 60 \approx 12.65\text{ min}$. |
| **Operational Safety Buffer** | Explicitly stated in task briefing ($B = 3.0\text{ min}$). | Applied linearly in EWE engine: $B = 3.0\text{ min}$. | ✅ **FAIR** | Participant must include $-3.0\text{ min}$ in mental arithmetic. |
| **Latest Feasible Departure ($D_{\text{deadline}}$)** | Not directly surfaced. Derivable as $60\text{ min} - 12.65\text{ min} - 3\text{ min} = 44.35\text{ min}$. | Directly computed and displayed as `T+44 min 21 sec (Margin: +44.4 min)`. | ✅ **FAIR** | Core hypothesis test: automated minimization vs manual calculation. |
| **Limiting Segment Identification** | Not directly surfaced. Participant must evaluate all segments on path. | Automatically pinpointed as `R02 (Valley Road)`. | ✅ **FAIR** | Tests spatial bottleneck search burden. |
| **Alternative High-Ground Path** | Road vector network geometry displayed on map. | $k$-shortest paths evaluated with status `OPEN / Below threshold`. | ✅ **FAIR** | Participant must visually trace alternative road connections. |
| **Scenario Sensitivity ($\Delta Q$)** | Inflow hydrograph curves for Central ($65\text{k}$) vs Maximum ($115\text{k}$). | Automated scenario delta summary table. | ✅ **FAIR** | Participant must compare two hydrographs/rasters. |
| **Scientific Limitations** | Disclosed in standard metadata panel. | Disclosed in Epistemic Assumptions Drawer. | ✅ **FAIR** | Both interfaces present limitation disclosures. |

---

## 3. Fairness Certification

- **Condition A Usability:** A competent engineer or GIS analyst with a pocket calculator can correctly compute the $T+44\text{ min } 21\text{ sec}$ ($44.35\text{ min}$) departure deadline from Condition A.
- **Condition B Completeness:** No information in Condition B requires opening source code or querying hidden APIs.
- **Conclusion:** The comparison strictly isolates the **information representation and search burden**, satisfying experimental fairness.
