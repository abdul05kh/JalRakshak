# JALRAKSHAK — GATE 3 HYDRAULIC MODEL FREEZE
## AUTHORITATIVE 15 KM TEHRI → KOTESHWAR HYDRAULIC BASELINE

**Freeze Date:** 2026-09-24  
**Classification:** `GATE 3 HYDRAULIC BASELINE FREEZE`  
**Engine:** USACE HEC-RAS Version 7.0.1 (64-bit `RasUnsteady.exe`, `RasGeomPreprocess.exe`)  
**Standard:** Numerical verification under explicitly documented engineering assumptions.  
**Physical Validation Status:** `PHYSICAL_VALIDATION = NOT_ESTABLISHED`  

---

### 1. Authoritative Input & Model Specifications

| Component | Authoritative Specification | Classification / Status | SHA-256 Hash |
| :--- | :--- | :--- | :--- |
| **Raw Terrain** | Copernicus GLO-30 Digital Surface Model (GLO-30 DSM) | `SOURCE_DERIVED` (Copernicus Open Access) | `5050f2aa7cb58bfd...` |
| **Reprojected DEM** | $25.0\text{ m} \times 25.0\text{ m}$ Bilinear Grid in EPSG:32644 (UTM 44N) | `DERIVED_INPUT` | `91bae60933c157fb8aaf127dc003d100e277a6eff08adeafbded98ae9ff5306f` |
| **HEC-RAS Terrain HDF5** | `Tehri15kmTerrain.hdf` (Compiled via `RasProcess.exe`) | `NATIVE_HECRAS` | `d1d851fe5f398791c71f4f134b518c80ff2dae7831f1df286f4e38e5e9e9d904` |
| **Geometry File (.g01)** | `Tehri15km.g01` ($X \in [255500, 260500], Y \in [3351000, 3364000]$) | `NATIVE_HECRAS` | `7232ed8433901671321dab6bf119bfc9de5a902b13ad3d24171da4dea093acb5` |
| **Geometry HDF5 (.g01.hdf)** | `Tehri15km.g01.hdf` (6,677 Voronoi cells, 12,820 faces) | `NATIVE_HECRAS` | `ad02b5c1d39881265075c657296acb6763a2da23ba6c8e25786a94b39af1df5b` |
| **Plan File (.p01)** | `Tehri15km.p01` (2.0-hour duration, 1s computation interval) | `NATIVE_HECRAS` | `17051bc6a55b6da2991359ece688952d1d4bb3001cf08765ae678e3390f0da11` |
| **Unsteady Flow File (.u01)**| `Tehri15km.u01` (15-min interval, 9-point hydrographs) | `NATIVE_HECRAS` | `ad7827cd383c22a9be8a2e314e10663e01a553dc068ac7200a4ac7f7948ac0d6` |
| **Project File (.prj)** | `Tehri15km.prj` (SI Units) | `NATIVE_HECRAS` | `7b1763b393ff6a4af4f69253929ffbe411ec6d08944c7724e7d221dd185da530` |

---

### 2. Prescribed Breach Hydrograph Envelope

| Scenario ID | Peak Flow Rate ($Q_p$) | Time to Peak ($t_p$) | Total Duration | Cumulative Inflow Volume | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCENARIO_MINIMUM** | $28,500\text{ m}^3/\text{s}$ | 1.5 h (90 min) | 2.0 h | $118.84\text{ MCM}$ | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` |
| **SCENARIO_CENTRAL** | $65,000\text{ m}^3/\text{s}$ | 1.0 h (60 min) | 2.0 h | $227.41\text{ MCM}$ | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` |
| **SCENARIO_MAXIMUM** | $115,000\text{ m}^3/\text{s}$ | 0.75 h (45 min) | 2.0 h | $366.12\text{ MCM}$ | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` |

---

### 3. Solver & Numerical Settings

- **Equation Set:** Full 2D Shallow Water Equations Eulerian-Lagrangian Method (`SWE-ELM`).
- **Matrix Solver:** Intel MKL PARDISO Direct Sparse Solver.
- **Base Timestep:** $\Delta t = 1.0\text{ s}$ (Adaptive Courant control).
- **Mapping & Instantaneous Interval:** $5\text{ min}$ (25 output time blocks across 2.0 hours).
- **Tolerances:** Water surface tolerance $\text{ZTol} = 0.02\text{ m}$, Max iterations $= 20$.
- **Manning's $n$:** $0.045\text{ s/m}^{1/3}$ uniform canyon roughness.

---

### 4. Authoritative Hydraulic Monitoring Stations

| Station ID | Location Description | Reach Chainage | Coordinates ($X, Y$) | Terrain Elevation | Peak Depth (Central) | Arrival Time ($h \ge 0.5\text{m}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STATION_1** | Tehri Dam Toe | 0.5 km | $258000.0, 3363500.0$ | $814.00\text{ m}$ | **$27.25\text{ m}$** | **$15.0\text{ min}$** |
| **STATION_2** | Mid-Reach Canyon | 6.5 km | $258000.0, 3357500.0$ | $817.54\text{ m}$ | Flood wave propagation corridor | Model-derived wave front |
| **STATION_3** | Near Koteshwar Dam | 13.0 km | $258000.0, 3351500.0$ | $759.24\text{ m}$ | Downstream hydraulic control | Model-derived wave front |

---

### 5. Authoritative Result HDF5 Artifacts & SHA-256 Ledger

All authoritative binary `.p01.hdf` result files are preserved in [`artifacts/hecras/tehri_gate3b/`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/):

| Result Artifact File | File Size (Bytes) | SHA-256 Hash |
| :--- | :--- | :--- |
| [`tehri_15km_scenario_central.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf) | 13,502,177 | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` |
| [`tehri_15km_scenario_minimum.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf) | 13,418,771 | `e3b2e7ad4d5f190e2fc10086fb40d99ef8292881179cb42db4d8ffaa5a8d4a94` |
| [`tehri_15km_scenario_maximum.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf) | 13,546,027 | `b2ca8d08cb5892557bb52ecdc8b8efc83403da9d07380cf05c6c063f6ee521ff` |
| [`tehri_15km_scenario_boundary_sensitivity.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_boundary_sensitivity.p01.hdf) | 13,501,339 | `da388a10e14bf0fe83c66f777322bf20bceebefd5218d8ff1f6d354b9f3fe2b9` |
| [`tehri_15km_scenario_repeatability_run2.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_repeatability_run2.p01.hdf) | 13,502,193 | `49da32ff986e80b2a8c3d256860fe360fe2ef11e2f3d5ee189cecb84ec0ef270` |
| [`tehri_15km_scenario_mesh_75m.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_75m.p01.hdf) | 22,565,869 | `cb4d54751475aeaf9e8ddf1fe668d2f1be0fa6f16d7d56e7aa7bc3ceb2f567fc` |
| [`tehri_15km_scenario_mesh_50m.p01.hdf`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_50m.p01.hdf) | 42,516,070 | `9a35e82eb5df308730b20110fa95d667cbe80786f059cb2ec86a1bb96752d5b6` |
| [`manifest.json`](file:///d:/projects/JalRakshak/artifacts/hecras/tehri_gate3b/manifest.json) | 40,951 | `a65a39eb858ae66795f66b6c0850fe611ff6e7bb46db9ee64b0f9f1b203c94f5` |

---

### 6. Known Uncertainties & Limitations

1. **Terrain Surface:** Copernicus GLO-30 DSM represents top-of-canopy and radar water surface; bathymetric channel incision below the radar water level is unrepresented.
2. **Vertical Datum:** `VERTICAL_DATUM = NOT_ESTABLISHED`. Native EGM2008 geoid space is preserved; Survey of India GTS benchmark tie is unmeasured.
3. **Reservoir Initial Condition:** `RESERVOIR_INITIAL_CONDITION = NOT_SCIENTIFICALLY_LOCKED`. Gross storage ($3,540\text{ MCM}$) is source-derived; stage-storage curve is unestablished.
4. **Physical Validation:** `PHYSICAL_VALIDATION = NOT_ESTABLISHED`. No empirical dam-break observational dataset exists for Tehri Dam. All results represent numerical verification under explicitly stated assumptions.
