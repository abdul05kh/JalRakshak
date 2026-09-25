# GATE 4 HYDRAULIC INPUT MANIFEST
## Authoritative Ingestion of Frozen Gate 3B Dam-Break Hydrodynamic Artifacts

**Document ID:** `DOC-GATE4-HYD-MANIFEST-001`  
**Status:** FROZEN DEPENDENCY AUDITED  
**Date:** 2026-09-24  
**Author:** Principal Systems Engineer, Hydraulic Decision-Support Engineer, JalRakshak  
**Governing Standard:** HEC-RAS 7.0.1 Unsteady 2D Flow Engine (`RasUnsteady.exe`) / SIH'26 Safety-Critical Decision Support  

---

## 1. Executive Summary & Freeze Declaration

Gate 4 does **not** simulate hydraulics or alter numerical mesh/boundary conditions. Gate 4 strictly consumes the frozen, authoritative HEC-RAS 7.0.1 hydraulic simulation artifacts established in Gate 3B. 

All 7 frozen HEC-RAS HDF5 output files (`*.p01.hdf`) located in `artifacts/hecras/tehri_gate3b/` have been verified using bit-exact cryptographic SHA-256 hashes prior to ingestion into the Evacuation Window Engine (EWE) pipeline.

```
+---------------------------------------------------------------------------------------------------+
|                                  AUTHORITATIVE GATE 3B FREEZE STATE                               |
|                                                                                                   |
|  PHYSICAL_VALIDATION    = NOT_ESTABLISHED (Pure numerical simulation from synthetic hydrograph)    |
|  VERTICAL_DATUM         = NOT_ESTABLISHED (DSM relative orthometric height, Copernicus GLO-30)    |
|  TERRAIN                = COPERNICUS GLO-30 DSM (30m spatial resolution, resampled/conditioned)   |
|  BREACH                 = EXTERNALLY_SPECIFIED_HYDROGRAPH (Froehlich piping / Overtopping)        |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Cryptographic Inventory of Frozen Gate 3B Artifacts

Every artifact ingested by Gate 4 is verified against its authoritative SHA-256 checksum recorded during the Gate 3B freeze:

| Scenario Identifier | File Name | File Size (Bytes) | Authoritative SHA-256 Checksum | Simulation Duration | Output Interval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCENARIO_CENTRAL`** | `tehri_15km_scenario_central.p01.hdf` | 13,502,177 | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_MINIMUM`** | `tehri_15km_scenario_minimum.p01.hdf` | 13,418,771 | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_MAXIMUM`** | `tehri_15km_scenario_maximum.p01.hdf` | 13,546,027 | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_BOUNDARY_SENSITIVITY`** | `tehri_15km_scenario_boundary_sensitivity.p01.hdf` | 13,501,339 | `57159e4df90559a40b611f876c9dfc45d0aa6fbfcc0d6df4d6b0a0719ab97725` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_REPEATABILITY_RUN2`** | `tehri_15km_scenario_repeatability_run2.p01.hdf` | 13,502,193 | `e532fa5675bc3d412c86b960cba72332513a5f1ee1b224ee9c4506d16f4f45b8` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_MESH_75M`** | `tehri_15km_scenario_mesh_75m.p01.hdf` | 22,668,301 | `4f32a0d1eb96a036bf620e2380f77b7aa61aeb6c4c5cfcb82f76fe34261db727` | 2.0 h (7200 s) | 5 min (300 s) |
| **`SCENARIO_MESH_50M`** | `tehri_15km_scenario_mesh_50m.p01.hdf` | 49,634,849 | `fce102f90a88df54881dfd306b3fa1b490f845a7c2e399580a8274737faecbb9` | 2.0 h (7200 s) | 5 min (300 s) |
| **`MANIFEST`** | `manifest.json` | 40,951 | `a65a39eb858ac9caecdd4a070191ae79ef62a945c7eb16a0da2f059cb5bfa22f` | N/A | N/A |

---

## 3. Provenance & Hydraulic Grid Specifications

### 3.1 Spatial & Vertical Reference Systems
- **Horizontal Coordinate Reference System (CRS):** `EPSG:32644` (WGS 84 / UTM Zone 44N, Projected in Meters).
- **Native Unit System:** SI Metric (`Meters`, `m3/s`).
- **Vertical Datum Status:** `VERTICAL_DATUM = NOT_ESTABLISHED`. Heights represent ellipsoidal/EGM96-derived elevations native to Copernicus GLO-30 DSM.
- **Reach Extent:** ~15.0 km Bhagirathi River reach downstream of Tehri Dam (Chainage $0.0\text{ km}$ to $15.0\text{ km}$ Koteshwar Reservoir confluence).

### 3.2 Computational Mesh Properties (Central Scenario)
- **Nominal Cell Resolution ($\Delta x$):** $100\text{ m} \times 100\text{ m}$.
- **Computational 2D Cells ($N_{\text{cells}}$):** 6,677 cells in mesh domain (6,321 active compute cells).
- **Computational Faces ($N_{\text{faces}}$):** 12,820 mesh faces.
- **Time Steps Recorded ($N_{\text{time}}$):** 25 timesteps (interval $300\text{ s}$ / $5\text{ min}$, spanning $t = 0\text{ s}$ to $t = 7,200\text{ s}$).
- **Computational Timestep ($\Delta t_{\text{comp}}$):** $1.0\text{ s}$ adaptive shallow water solver step.
- **Hydrodynamic Solver:** USACE HEC-RAS 2D Full Momentum / Diffusion Wave finite-volume scheme (`RasUnsteady.exe` 7.0.1).

---

## 4. Native vs. Derived Variable Classification

In strict compliance with scientific honesty rules, Gate 4 distinguishes native HEC-RAS simulation datasets from derived quantities:

| Variable Name | Symbol | Classification | Source Path in HDF5 | Units | Mathematical Transformation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Water Surface Elevation** | $\text{WSE}(c, t)$ | **NATIVE** | `/Results/Unsteady/.../Water Surface` | Meters ($\text{m}$) | Extracted directly from HDF5 output block. |
| **Cell Minimum Elevation** | $z_{\text{min}}(c)$ | **NATIVE** | `/Geometry/2D Flow Areas/.../Cells Minimum Elevation` | Meters ($\text{m}$) | Extracted from geometry definition. |
| **Cell Center Coordinates** | $(x_c, y_c)$ | **NATIVE** | `/Geometry/2D Flow Areas/.../Cells Center Coordinate` | Meters ($\text{m}$) | Extracted from geometry definition. |
| **Face Velocity** | $v_{\text{face}}(f, t)$ | **NATIVE** | `/Results/Unsteady/.../Face Velocity` | $\text{m/s}$ | Normal velocity across cell boundary faces. |
| **Inundation Depth** | $d(c, t)$ | **DERIVED** | Calculated | Meters ($\text{m}$) | $d(c, t) = \max(0.0, \text{WSE}(c, t) - z_{\text{min}}(c))$ |
| **Flood Arrival Time** | $t_{\text{arr}}(c, H)$ | **DERIVED** | Calculated | Seconds ($\text{s}$) | $\min \{ t \mid d(c, t) \ge H \}$, where $H \in \{0.3, 0.5, 1.0\}\text{m}$ |
| **Peak Depth** | $d_{\text{max}}(c)$ | **DERIVED** | Calculated | Meters ($\text{m}$) | $\max_t d(c, t)$ |

---

## 5. Known Gate 3 Uncertainties & Decision Boundary Rules

The following scientific constraints are permanently affixed to every Gate 4 decision:
1. **`PHYSICAL_VALIDATION = NOT_ESTABLISHED`**: The model outputs have **not** been calibrated or validated against historic flood event gauge records.
2. **`TERRAIN = COPERNICUS GLO-30 DSM`**: Digital Surface Model includes vegetation canopy and mountain slope artifacts.
3. **`BREACH = EXTERNALLY_SPECIFIED_HYDROGRAPH`**: Inflow hydrograph was generated using empirical breach parameter formulas (Froehlich 2008), not coupled dynamic erosion mechanics.
4. **Decision Boundary:** Evacuation decisions generated by Gate 4 represent scenario-conditional numerical safety windows, **not guaranteed safety** or official government evacuation orders.
