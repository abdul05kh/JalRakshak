# TEHRI HYDRAULIC MODEL SPECIFICATION
**Document ID:** DOC-TEHRI-G3-03  
**Project Stage:** Gate 3 — Computational Domain & Native HEC-RAS Specification  
**Solver Engine:** USACE HEC-RAS 7.0.1 (RasUnsteady.exe)  
**Date:** 2026-09-24  

---

## 1. Computational Domain Definition

| Dimension / Parameter | Specification | Hydraulic Justification |
| :--- | :--- | :--- |
| **Reach Extent** | 1.5 km canyon reach directly downstream of Tehri Dam | High-energy supercritical/transcritical canyon pilot testing |
| **Bounding Coordinates** | $X: [257000, 258500]\text{ m}$, $Y: [3362500, 3364000]\text{ m}$ (UTM 44N) | Confined canyon reach with steep lateral rock walls |
| **2D Mesh Cell Resolution** | $50.0\text{ m} \times 50.0\text{ m}$ uniform orthogonal grid | Resolves valley geometry while ensuring Courant stability |
| **Total Computational Cells** | 896 cells | Verified by native HEC-RAS geometry preprocessor |
| **Terrain Vertical Relief** | $617.50\text{ m}$ to $1,123.75\text{ m}$ ($506.25\text{ m}$ total canyon depth) | Natural steep Himalayan river gorge topography |

---

## 2. Solver & Numerical Configuration

```
Solver:             HEC-RAS 2D Unsteady Solver (x64/RasUnsteady.exe)
Equation Set:       Shallow Water Equations (SWE-ELM / Diffusion Wave compatible)
Matrix Solver:      Intel MKL PARDISO Parallel Sparse Direct Solver
Computation dt:     1.0 second (Adaptive Time Step enabled)
Output Interval:    5.0 minutes (13 discrete time states per 1-hour run)
Turbulence Model:   Parabolic (Isotropic Eddy Viscosity = 0.1)
Manning Roughness:  n = 0.045 s/m^(1/3) (Mountain river channel with boulders/cobbles)
Theta Preissmann:   1.00 (Fully Implicit Stability)
```

---

## 3. Boundary & Initial Conditions

### Upstream Inflow Boundary (`UpstreamInflow`)
- **Location:** Northern edge of 2D Flow Area (`TehriCanyon`, $Y = 3,364,000\text{ m}$)
- **Condition Type:** Unsteady Flow Hydrograph ($Q(t)$)
- **Baseflow:** $180.0\text{ m}^3/\text{s}$ (Typical regulated pre-failure discharge)
- **Peak Dam-Break Inflow:** $65,000\text{ m}^3/\text{s}$ (Central Scenario)
- **Energy Slope:** $S_0 = 0.004$

### Downstream Outflow Boundary (`DSNormalDepth`)
- **Location:** Southern edge of 2D Flow Area (`TehriCanyon`, $Y = 3,362,500\text{ m}$)
- **Condition Type:** 2D Normal Depth Friction Slope
- **Baseline Friction Slope:** $S_0 = 0.004$ ($0.4\%$ valley slope towards Koteshwar)
- **Sensitivity Perturbation:** $S_0 = 0.008$ ($0.8\%$ steep slope test)

### Initial Conditions
- **Initial Dry Bed Treatment:** Small baseflow wetting ($Q_{base} = 180\text{ m}^3/\text{s}$) with Preissmann slot stabilization ($Z_{tol} = 0.02\text{ m}$).
