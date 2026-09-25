# JALRAKSHAK — 15 KM TEHRI → KOTESHWAR HYDRAULIC MODEL SPECIFICATION
## PRELIMINARY 15 KM STUDY DOMAIN SPECIFICATION

**Document Version:** 1.0 (Gate 3B Baseline)  
**Date:** 2026-09-24  
**Classification:** `PRELIMINARY 15 KM STUDY DOMAIN`  
**Engine:** USACE HEC-RAS Version 7.0.1 (64-bit `RasUnsteady.exe`)  

---

### 1. Domain Geometry & Spatial Extent

- **Reach Designation:** Bhagirathi River Canyon Reach from Tehri Dam Toe to downstream of Koteshwar Dam.
- **Coordinate Reference System:** WGS 84 / UTM Zone 44N (`EPSG:32644`), Units: Meters.
- **Upstream Boundary (Tehri Dam Toe):** $X \in [255500, 260500]\text{ m}$, $Y = 3364000\text{ m}$ (Latitude $\approx 30.378^\circ\text{N}$, Longitude $\approx 78.481^\circ\text{E}$).
- **Downstream Boundary (Koteshwar Reach):** $X \in [255500, 260500]\text{ m}$, $Y = 3351000\text{ m}$ (Latitude $\approx 30.261^\circ\text{N}$, Longitude $\approx 78.481^\circ\text{E}$).
- **Lateral Extent (Canyon Corridor):** Width = 5,000 meters ($5.0\text{ km}$), $X \in [255500, 260500]\text{ m}$.
- **Longitudinal Reach Length:** $\approx 13.0 - 15.0\text{ km}$ computational thalweg distance.
- **Clearance to Terrain Bounds:** Terrain raster extends $X \in [254000, 262000]\text{ m}$ ($1,500\text{ m}$ lateral buffer) and $Y \in [3349990, 3365000]\text{ m}$ ($1,000\text{ m}$ longitudinal buffer).
  - *Justification:* Minimum 1,000 m clearance prevents boundary Voronoi cell truncation against terrain raster NoData edges.

---

### 2. Terrain & Vertical Reference

- **Source Dataset:** Copernicus GLO-30 Digital Surface Model (DSM).
- **Native Resolution:** 1 arc-second ($\approx 30\text{ m}$ at equator).
- **Reprojected Resolution:** $25.0\text{ m} \times 25.0\text{ m}$ grid cell size via Bilinear interpolation.
- **Vertical Datum:** EGM2008 Geoid (`VERTICAL_DATUM = NOT_ESTABLISHED`).
  - *Note:* Absolute Survey of India GTS benchmark tie is unmeasured; native geoid space preserved.
- **Terrain Limitations:** GLO-30 DSM captures top-of-canopy and radar water surface; bathymetric channel incision is unrepresented.

---

### 3. Computational Mesh Architecture

The 2D Flow Area (`Tehri15kmCanyon`) is discretized using orthogonal/Voronoi computational sub-grids across three sensitivity scales:

| Mesh Name | Cell Spacing ($\Delta x$) | Cell Count | Face Count | Preprocessing Time | Unsteady Runtime |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MESH_100M (Base)** | $100.0\text{ m}$ | 6,677 | 12,820 | 2.1 s | 11.6 s |
| **MESH_75M (Intermediate)**| $75.0\text{ m}$ | 11,828 | 22,942 | 3.8 s | 24.7 s |
| **MESH_50M (Fine)** | $50.0\text{ m}$ | 26,357 | 51,640 | 8.4 s | 40.4 s |

- **Subgrid Bathymetry:** HEC-RAS 2D cell hydraulic property tables (Elevation-Volume and Elevation-Area curves) precalculated by `RasGeomPreprocess.exe` from 25 m GLO-30 DSM.
- **Manning's Roughness:** Uniform $n = 0.045\text{ s/m}^{1/3}$ applied across computational domain.

---

### 4. Boundary Conditions & Numerical Solvers

- **Upstream Boundary (`UpstreamInflow`):**
  - Architecture: `EXTERNALLY_SPECIFIED_BREACH_HYDROGRAPH`.
  - Boundary Line Length: 5,000 m across upstream canyon cross-section ($Y = 3364000$).
  - Scenarios Evaluated:
    - Central: $Q_p = 65,000\text{ m}^3/\text{s}$ ($t_p = 2.4\text{ h}$, $Q_{\text{base}} = 180\text{ m}^3/\text{s}$).
    - Minimum: $Q_p = 28,500\text{ m}^3/\text{s}$ ($t_p = 3.5\text{ h}$, $Q_{\text{base}} = 180\text{ m}^3/\text{s}$).
    - Maximum: $Q_p = 115,000\text{ m}^3/\text{s}$ ($t_p = 1.5\text{ h}$, $Q_{\text{base}} = 180\text{ m}^3/\text{s}$).
- **Downstream Boundary (`DSNormalDepth`):**
  - Type: 2D Flow Area Normal Depth Boundary Condition.
  - Boundary Line Length: 5,000 m across downstream canyon cross-section ($Y = 3351000$).
  - Friction Slope ($S_0$): Baseline = $0.004000$; Perturbation = $0.008000$.
- **Hydraulic Solver:**
  - Equation Set: Full 2D Shallow Water Equations Eulerian-Lagrangian Method (`SWE-ELM`).
  - Matrix Solver: Intel MKL PARDISO Direct Sparse Solver.
  - Computation Time Step: $\Delta t = 1.0\text{ s}$.
  - Mapping / Output Interval: 5 minutes.
  - Volume Tolerance: $\text{ZTol} = 0.02\text{ m}$, Max Iterations = 20.
