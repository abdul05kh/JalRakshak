# Map Precision Contract

**Project:** JalRakshak Emergency Decision-Support System  
**Standard:** Strict Geospatial, Provenance, and Numerical Precision Rules  
**Date:** 2026-09-25  

---

## 1. Provenance Classes

Every displayed numerical and spatial entity must belong to an explicit provenance class:
- **`SOURCE`:** Raw native artifact outputs (e.g., HEC-RAS 7.0.1 2D unsteady run, Copernicus DEM 30m).
- **`DERIVED`:** Computationally derived through locked algorithms (e.g., 150m corridor road arrival $A_i$, topological travel time $T_i$, departure deadline $D$).
- **`CONFIGURED`:** Operator or protocol parameters (e.g., 3.0 min safety buffer, 0.3m depth threshold, 1.0 m/s velocity threshold).
- **`ASSUMED`:** Explicit baseline engineering assumptions (e.g., 50 km/h static travel speed).
- **`DISPLAYED`:** Formatted string representations (e.g., `T+44:21`, `✓ FEASIBLE`).
- **`TEST_FIXTURE`:** Golden scenario verification fixtures.

---

## 2. Precision & Rounding Rules
- **Timestamps:** Discretized to integer seconds in engine; displayed as `T+MM:SS` or `HH:MM UTC`.
- **Water Depth:** Calculated to 0.01 m; displayed to 2 decimal places (e.g. `0.42 m`).
- **Flow Velocity:** Calculated to 0.01 m/s; displayed to 1 decimal place (e.g. `1.8 m/s`).
- **Distance / Chainage:** Calculated in meters (EPSG:32644); displayed in kilometers to 1 decimal place (e.g. `10.5 km`).
- **Travel Time:** Calculated in fractional minutes; displayed as `MM:SS` in triad.
