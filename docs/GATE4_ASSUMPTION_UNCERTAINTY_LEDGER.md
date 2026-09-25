# GATE 4 ASSUMPTION & UNCERTAINTY LEDGER
## Rigorous Accounting of Inputs, Parameters, and Classification Lineage

**Document ID:** `DOC-GATE4-LEDGER-001`  
**Status:** AUDITED & APPROVED  
**Date:** 2026-09-24  
**Author:** Safety-Critical Software Reviewer & Systems Engineer  

---

## 1. Classification Categories

Every numerical parameter and dataset consumed or produced by Gate 4 is classified into one of six categories:

1. **`SOURCE_DERIVED`**: Directly obtained from official records, maps, or governmental databases.
2. **`MEASURED`**: Directly measured by calibrated field instruments (currently none available in hydraulic model).
3. **`CALCULATED`**: Exact mathematical derivation from other defined variables.
4. **`ENGINEERING_ASSUMPTION`**: Established technical parameter based on engineering standards without local calibration.
5. **`SENSITIVITY_PARAMETER`**: User-configurable sensitivity variable tested across a range.
6. **`UNAVAILABLE`**: Missing data identified and flagged as `DATA_GAP`.

---

## 2. Gate 4 Parameter Ledger

| Parameter / Input | Category | Value / Source | Provenance / Justification |
| :--- | :--- | :--- | :--- |
| **HEC-RAS 2D Simulation Mesh** | `SOURCE_DERIVED` | $100\text{ m}$ Grid, Copernicus GLO-30 DSM | Gate 3B Frozen Model (`tehri_15km_scenario_central.p01.hdf`) |
| **Dam Crest / FRL Elevations** | `SOURCE_DERIVED` | FRL $830\text{ m}$, Crest $839.5\text{ m}$ | THDC India Ltd. Project Specifications |
| **Dam Breach Invert** | `ENGINEERING_ASSUMPTION` | $635.0\text{ m}$ | Assumed foundation level above original riverbed |
| **Breach Inflow Hydrograph** | `ENGINEERING_ASSUMPTION` | Froehlich (2008) Peak $65,000\text{ m}^3/\text{s}$ | Parametric dam-break empirical formula |
| **Water Surface Elevation (WSE)** | `SOURCE_DERIVED` | HEC-RAS 2D Output Dataset | Direct numerical solution from `RasUnsteady.exe` 7.0.1 |
| **Inundation Depth** | `CALCULATED` | $\max(0, \text{WSE} - z_{\text{min}})$ | Derived cell-by-cell per timestep |
| **Flood Arrival Threshold** | `SENSITIVITY_PARAMETER` | $H \in \{0.30\text{ m}, 0.50\text{ m}, 1.00\text{ m}\}$ | Configurable emergency threshold |
| **Road Centerlines** | `SOURCE_DERIVED` | OpenStreetMap / Uttarakhand PWD | Vector LineStrings in `roads.json` |
| **Road Base Traversal Speed** | `ENGINEERING_ASSUMPTION` | $20 - 45\text{ km/h}$ by road class | Standard mountain driving speeds |
| **Road Safety Buffer ($B$)** | `SENSITIVITY_PARAMETER` | Default $3.0\text{ min}$ (or $20\text{ min}$) | Configured buffer for emergency decision officer |
| **Road Closure Threshold ($H_{\text{closure}}$)** | `ENGINEERING_ASSUMPTION` | $0.30\text{ m}$ | Light vehicle stalling limit (FEMA P-259) |
| **Spatial Coupling Radius** | `ENGINEERING_ASSUMPTION` | $1,200\text{ m}$ search radius | Valley floor road coupling window |
| **Shelter Capacity** | `SOURCE_DERIVED` | $2,000 - 6,000$ persons | District Disaster Management Authority (DDMA) plans |
| **Real-time Traffic Telemetry** | `UNAVAILABLE` | N/A | Flagged as static assumption, not measured |
| **Hydraulic Field Validation** | `UNAVAILABLE` | `PHYSICAL_VALIDATION = NOT_ESTABLISHED` | No historic gauge data for high-flow calibration |

---

## 3. Decision Boundary Guarantee

- No `ENGINEERING_ASSUMPTION` is labeled as `MEASURED`.
- No `SENSITIVITY_PARAMETER` is hidden or hardcoded.
- Every decision response from JalRakshak includes this ledger in its provenance payload.
