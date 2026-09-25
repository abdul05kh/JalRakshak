# JALRAKSHAK GATE 3B — INPUT AND DEPENDENCY AUDIT
## 15 KM TEHRI → KOTESHWAR HYDRAULIC PROPAGATION MODEL

**Audit Date:** 2026-09-24  
**Audit Scope:** 15 km Computational Domain (Tehri Dam → Koteshwar Reach)  
**Hydraulic Engine:** Genuine USACE HEC-RAS 7.0.1 (`RasUnsteady.exe`)  
**Standard Status:** Audited & Locked for Gate 3B Controlled Scientific Scaling  

---

### 1. Input Classification Matrix

Every model input is classified into one of six scientific categories:
- `SOURCE_DERIVED`: Directly extracted from authoritative primary/secondary institutional records.
- `MEASURED`: Directly surveyed or instrumented field measurements.
- `CALCULATED`: Mathematically/computationally derived from explicit foundational inputs.
- `ENGINEERING_ASSUMPTION`: Standard hydraulic engineering judgment adopted in the absence of primary site survey.
- `SENSITIVITY_PARAMETER`: Variable systematically perturbed across ranges to quantify uncertainty.
- `UNAVAILABLE`: Data not accessible; required for future operational hardening.

| Parameter / Input | Category | Source / Value | Dependency Status | Scientific Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Terrain Elevation (GLO-30 DSM)** | `SOURCE_DERIVED` | Copernicus GLO-30 DSM (Acq. 2011–2015, EPSG:4326 $\to$ EPSG:32644) | `BLOCKING` (Provided) | Core computational surface for 2D cell geometry and face property tables. |
| **Channel Bathymetry** | `UNAVAILABLE` | Copernicus DSM reflects radar water surface; submerged bed unknown | `NON-BLOCKING` | For dam-break propagation ($Q_p \gg Q_{\text{base}}$), flood depths ($> 20\text{ m}$) dominate over channel base incision ($2-5\text{ m}$). |
| **Vertical Datum Tie (GTS Benchmark)** | `UNAVAILABLE` | GTS benchmark tie unmeasured; native EGM2008 geoid retained | `NON-BLOCKING` | Propagation hydrodynamics depend on relative slopes ($\nabla z$), not absolute GTS geoid tie. |
| **Full Reservoir Level (FRL)** | `SOURCE_DERIVED` | THDC India Ltd / CWC Official Documentation = **830.00 m** | `NON-BLOCKING` | Official operating reservoir level for Tehri Dam. |
| **Maximum Water Level (MWL)** | `SOURCE_DERIVED` | THDC India Ltd / CWC Official Documentation = **835.00 m** | `NON-BLOCKING` | Design maximum surcharge water level. |
| **Dam Crest Elevation** | `SOURCE_DERIVED` | THDC India Ltd / CWC Official Documentation = **839.50 m** | `NON-BLOCKING` | Structural crest of Tehri rockfill dam. |
| **Gross Storage Volume** | `SOURCE_DERIVED` | THDC India Ltd / CWC Official Documentation = **3,540 MCM** | `NON-BLOCKING` | Design gross storage capacity. Stage-storage curve at chosen WSE is not established. |
| **Breach Invert Elevation** | `ENGINEERING_ASSUMPTION`| **635.00 m** | `NON-BLOCKING` | Assumed riverbed elevation at upstream dam toe. |
| **Hydraulic Head ($h_w$)** | `CALCULATED` | FRL: **195.0 m** ($830-635$), MWL: **200.0 m** ($835-635$), Crest: **204.5 m** ($839.5-635$) | `NON-BLOCKING` | Separately calculated heads corresponding to discrete pool levels. |
| **Breach Architecture** | `ENGINEERING_ASSUMPTION`| `EXTERNALLY_SPECIFIED_BREACH_HYDROGRAPH` | `BLOCKING` (Provided) | Pre-computed hydrographs prescribed at upstream boundary; native sediment erosion not claimed. |
| **Central Scenario Hydrograph ($Q_p$)** | `SECONDARY_LITERATURE` | Froehlich (2008) Piping = **65,000 m³/s** | `BLOCKING` (Provided) | Reference breach outflow scenario. |
| **Minimum Scenario Hydrograph ($Q_p$)** | `SECONDARY_LITERATURE` | Partial Breach / Overtopping = **28,500 m³/s** | `BLOCKING` (Provided) | Lower bound sensitivity scenario. |
| **Maximum Scenario Hydrograph ($Q_p$)** | `SECONDARY_LITERATURE` | Rapid Complete Breach = **115,000 m³/s** | `BLOCKING` (Provided) | Upper bound catastrophic scenario. |
| **Downstream Boundary Slope ($S_0$)** | `SENSITIVITY_PARAMETER` | Baseline $S_0 = 0.004$; Perturbation $S_0 = 0.008$ | `BLOCKING` (Provided) | Evaluated normal depth energy slope at Koteshwar tailwater. |
| **Manning's Roughness ($n$)** | `ENGINEERING_ASSUMPTION`| $n = 0.045\text{ s/m}^{1/3}$ (Mountain canyon / boulder bed) | `NON-BLOCKING` | Standard literature roughness for rugged Himalayan bedrock gorges. |
| **2D Mesh Cell Resolution** | `SENSITIVITY_PARAMETER` | $dx = 100\text{ m}, 75\text{ m}, 50\text{ m}$ | `BLOCKING` (Provided) | Systematic spatial discretization study for grid convergence. |

---

### 2. Dependency Audit Summary

1. **Blocking Dependencies (Resolved):**
   - Reprojected Copernicus GLO-30 DSM into EPSG:32644.
   - Native HEC-RAS Terrain HDF5 compiled via `RasProcess.CreateTerrainCommand`.
   - Native HEC-RAS 2D Geometry with GIS Polygon boundary clearance.
   - Genuine HEC-RAS 7.0.1 64-bit solver (`RasUnsteady.exe`).
   - Read-only forensic ingestion pipeline.

2. **Non-Blocking Assumptions (Documented & Frozen):**
   - DSM surface represents ground elevation without sub-canopy filtering.
   - Submerged channel bathymetry omitted without unverified synthetic incision.
   - External breach hydrograph prescribed at upstream inflow boundary without dynamic embankment erosion.
   - Vertical datum locked in native EGM2008 ellipsoidal/geoid space without fabricated GTS shift.

3. **Future Requirements (Post Gate 3B / Gate 4):**
   - High-resolution bathymetric LiDAR / ADCP riverbed cross-sections.
   - Survey of India GTS benchmark tie survey.
   - Dynamic 3D embankment piping erosion modeling with geotechnical core properties.
