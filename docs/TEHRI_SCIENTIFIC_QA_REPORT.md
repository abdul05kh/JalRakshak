# TEHRI SCIENTIFIC QA & SENSITIVITY REPORT
**Document ID:** DOC-TEHRI-G3-06 (REV-3 FINAL FORENSIC CLOSURE)  
**Project Stage:** Gate 3A Forensic Closure  
**Date:** 2026-09-24  

---

## 1. Quality Ledger & Numerical Metrics

| Parameter / Dimension | Metric / Measured Value | Status | Forensic Classification |
| :--- | :--- | :--- | :--- |
| **HEC-RAS Solver Execution** | Native `RasUnsteady.exe` 7.0.1 (x64) | **PASS** | `NATIVE_HECRAS_EXECUTION` |
| **Solver Mass Balance Residual** | Max Inner Volume Residual: $0.002456\text{ m}^3$ ($< 1.65 \times 10^{-7}\%$ of domain volume) | **PASS** | `NUMERICAL_VERIFICATION` |
| **Numerical Repeatability** | Max WSE difference: $0.000000\text{ m}$ (Run 1 vs Run 2) | **PASS** | `NUMERICAL_REPEATABILITY` |
| **Downstream Boundary Sens.** | $S_0 = 0.004 \to 0.008 \implies v_{max}: 0.99 \to 1.22\text{ m/s}$ at outlet boundary | **PASS** | `SENSITIVITY_PARAMETER` |
| **Spatial Mesh Sensitivity** | Re-meshing ($25\text{ m}, 40\text{ m}, 75\text{ m}$) requires GIS polygon buffer conditioning in RAS Mapper | **NOT_YET_CONVERGED** | `UNRESOLVED_METHODOLOGY` |
| **Reservoir Initial Condition** | FRL ($830\text{ m}, h_w=195\text{ m}$) vs Crest ($839.5\text{ m}, h_w=204.5\text{ m}$) | **NOT_SCIENTIFICALLY_LOCKED** | `ENGINEERING_ASSUMPTION` |
| **Vertical Datum** | Native EGM2008 DEM space preserved; GTS benchmark tie unmeasured | **NOT_ESTABLISHED** | `UNKNOWN_GEODETIC_TIE` |
| **Physical Validation** | Zero empirical post-failure observations exist | **NOT_ESTABLISHED** | `UNVALIDATED` |

---

## 2. Gate 3B Prerequisites (Mesh Convergence Methodology)

To achieve genuine mesh sensitivity convergence in Gate 3B:
1. **GIS Polygon Conditioning:** A buffered 2D Flow Area bounding polygon with $150\text{ m}$ internal setback from the DEM border must be imported into RAS Mapper to prevent Voronoi cell boundary face clipping.
2. **Multi-Resolution Evaluation:** $25\text{ m}$, $50\text{ m}$, and $75\text{ m}$ grids must be compiled natively in RAS Mapper and evaluated for grid convergence index (GCI).
