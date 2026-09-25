# JalRakshak — Claim-to-Evidence Matrix
**Standard:** Strict Scientific Defensibility & Traceability

| # | System Claim | Scientific Evidence | Source / Method | Test File | Classification | Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | HEC-RAS 2D generates water surface elevation | Native HDF5 dataset `/Results/Unsteady/.../Water Surface` | USACE HEC-RAS solver output file | `test_hecras_adapter.py` | SOURCE-DERIVED | Dependent on model grid resolution and terrain accuracy. |
| **2** | Depth is derived from WSE and Cell Ground Elevation | $\text{Depth} = \max(0, \text{WSE} - z_{\text{min}})$ | Explicit mathematical subtraction | `test_hecras_adapter.py` | DERIVED_FROM_HECRAS | Assumes flat water surface inside computational cell. |
| **3** | Arrival time is deterministic | Leading edge time $t$ where $\text{Depth}(t) \ge H_{\text{threshold}}$ | First index crossing threshold | `test_arrival_time.py` | DERIVED_FROM_HECRAS | Resolution limited by HEC-RAS output mapping interval. |
| **4** | Evacuation deadline satisfies $D = \min(A_i - T_i - B)$ | Deterministic minimization over road graph edges | Closed-form EWE formula | `test_ewe_boundary_and_lineage.py` | SOFTWARE-VERIFIED | Requires accurate vehicle travel speeds and buffer. |
| **5** | Monotonicity of Safety Buffer & Travel Time | Mathematical proof and property-based test assertions | Invariant property assertions | `test_ewe_properties.py` | SOFTWARE-VERIFIED | Verified as mathematical software behavior. |
| **6** | Ritter Analytical Benchmark Agreement | Closed-form Ritter (1892) 1D shock wave solution | Classical hydrodynamic equations | `test_validation_metrics.py` | SOFTWARE-VERIFIED | 1D ideal frictionless benchmark; not a 2D river calibration. |
| **7** | Satellite Flood Inundation Validation | SAR flood extent comparison | Sentinel-1 SAR imagery | N/A | VALIDATION NOT ESTABLISHED | Not executed; raw SAR product not bundled in prototype. |
| **8** | File Integrity | Cryptographic hash match | SHA-256 digest calculation | `test_provenance.py` | VERIFIED | Proves bit-level file integrity, not physics accuracy. |
