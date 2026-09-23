# 09 — Hydraulic Integration Blueprint

- HEC-RAS 2D treated as authoritative physics solver.
- Standardized arrival time definition: first time depth crosses wetting threshold (0.05 m).
- Sensitivity matrix across Breach Scenarios A, B, and C.
- Adapter contract: `validate()`, `prepare()`, `run()`, `collect_artifacts()`, `qa()`, `register()`.
