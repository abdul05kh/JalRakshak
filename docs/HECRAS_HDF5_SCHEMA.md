# JalRakshak — USACE HEC-RAS 2D HDF5 Output Schema Reference
**Document Version:** 1.0.0  
**Specification:** HEC-RAS 2D Unsteady Flow Computation Output Schema (HEC-RAS 6.x / 7.x)

---

## 1. Overview & Group Structure

HEC-RAS outputs 2D unsteady hydrodynamic simulation results into an HDF5 container (`*.p##.hdf`). JalRakshak accesses this file exclusively in read-only mode (`mode='r'`).

The standard HDF5 group hierarchy used for 2D flow areas is:

```text
<root>
├── Geometry
│   └── 2D Flow Areas
│       ├── Attributes (CRS, Projection, Cell Count)
│       └── <2D Area Name>
│           ├── Cells Center Coordinate   [N_cells, 2] (float64) [X, Y]
│           ├── Cells Minimum Elevation   [N_cells]    (float64) [m / ft]
│           ├── Cells Surface Area        [N_cells]    (float64)
│           ├── Face Points Coordinate    [N_points, 2](float64)
│           └── FacePoints Face Info      [...]
└── Results
    └── Unsteady
        └── Output
            └── Output Blocks
                └── Base Output
                    ├── Summary Results
                    └── Unsteady Time Series
                        ├── Time                   [N_timesteps] (float64, fractional days)
                        ├── Time Date Stamp        [N_timesteps] (bytes / ASCII, "DDMonYYYY HH:MM:SS")
                        └── 2D Flow Areas
                            └── <2D Area Name>
                                ├── Water Surface  [N_timesteps, N_cells] (float32/float64)
                                ├── Face Velocity  [N_timesteps, N_faces] (float32/float64)
                                └── Cell Hydraulic Tables (optional)
```

---

## 2. Dataset Reference Catalog

| Dataset Path | Shape | Data Type | Units | Source | Derivation Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/Geometry/2D Flow Areas/<Area>/Cells Center Coordinate` | `(N, 2)` | `float64` | Projected (m) | HEC-RAS Geometry | NATIVE | Planimetric center coordinates $(X, Y)$ in projected CRS (e.g. UTM 44N). |
| `/Geometry/2D Flow Areas/<Area>/Cells Minimum Elevation` | `(N,)` | `float64` | Elevation (m) | HEC-RAS Mesh/DEM | NATIVE | Lowest ground elevation in 2D cell $z_{\text{min}}$. |
| `/Results/Unsteady/.../Time Date Stamp` | `(T,)` | `|S20` | Datetime string | HEC-RAS Solver | NATIVE | Simulation timestamps (e.g., `"24Sep2026 06:00:00"`). |
| `/Results/Unsteady/.../Water Surface` | `(T, N)` | `float32` | Elevation (m) | HEC-RAS Solver | NATIVE | Stage / Water Surface Elevation (WSE) at each timestep. |
| `/Results/Unsteady/.../Face Velocity` | `(T, F)` | `float32` | Velocity (m/s) | HEC-RAS Solver | NATIVE | Normal velocity across 2D cell faces (NOT cell center velocity). |
| **Cell Depth (Computed)** | `(T, N)` | `float32` | Depth (m) | Derived | DERIVED_FROM_HECRAS | $\text{Depth}(c, t) = \max(0, \text{WSE}(c, t) - z_{\text{min}}(c))$. |
| **Arrival Time (Computed)** | `(N,)` | `float64` | Seconds (s) | Derived | DERIVED_FROM_HECRAS | First $t$ where $\text{Depth}(c, t) \ge H_{\text{threshold}}$. |

---

## 3. Scientific Integrity & Limitations

1. **Cell Depth is Not Native in HDF5:**
   HEC-RAS records stage (Water Surface Elevation) and cell ground elevation. Cell depth is derived as $\text{Depth} = \text{WSE} - z_{\text{min}}$ and is strictly tagged as `DERIVED_FROM_HECRAS`.
2. **Face Velocity vs. Cell Velocity:**
   The HDF5 unsteady results contain `Face Velocity` (velocity normal to each face). Unless cell-centered velocity vectors are explicitly computed via finite-volume face reconstruction, face velocities are treated as face-normal bounds.
3. **Dry Cell Sentinel Values:**
   Dry cells in HEC-RAS may contain sentinel values (e.g. $-9999.0$, NaN, or values below $z_{\text{min}}$). The adapter filters these values and clamps water depth to $0.0$.
