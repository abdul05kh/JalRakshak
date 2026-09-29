# Scientific Boundaries & Operational Limitations

**System:** JalRakshak — Dam-Break Flood Decision Support System  
**Evaluation Standard:** Zero-Fabrication Scientific Disclosure Policy

---

## 1. Overview
This document establishes the explicit scientific boundaries, computational assumptions, and operational constraints of the JalRakshak decision-support platform.

---

## 2. Explicit Scientific Boundaries

### A. Hydrodynamic Modeling & Solver Authority
- **Primary Solver:** Native U.S. Army Corps of Engineers HEC-RAS 7.0.1 2D unsteady flow solver.
- **Physical Validation:** NOT_ESTABLISHED for Tehri Dam. In the absence of historical dam failure measurements for Tehri, the hydrodynamic outputs represent engineering design simulations based on standard breach hydrographs (Central 65k, Minimum 28.5k, Maximum 115k $\text{m}^3/\text{s}$).
- **Terrain Datum:** Copernicus GLO-30 is a Digital Surface Model (DSM) with 30m spatial resolution. It does not represent a bare-earth Digital Terrain Model (DTM).

### B. Vertical Datum Compatibility
- Vertical datum offsets between GLO-30 (EGM96 Geoid) and local riverbed cross-section datums are uncalibrated. Water depth is derived locally as $\max(0, WSE - z_{\text{cell,min}})$.

### C. Evacuation Routing & Traffic Assumptions
- **Static Evacuation Velocity:** Vehicle traversal speeds ($50\text{ km/h}$ for primary highways, $40\text{ km/h}$ for secondary roads) are configured assumptions. Dynamic macroscopic or mesoscopic traffic congestion is not currently modelled.
- **Limiting Edge Concept:** The limiting road segment is defined strictly as the mathematical bottleneck $\arg\min_i(A_i - T_i - B)$. It does not represent structural pavement failure or bridge collapse unless explicitly coupled to structural failure models.

### D. Google Earth Engine (GEE) Remote Sensing
- Remote sensing flood extent derived from Sentinel-1 SAR or Sentinel-2 MSI represents surface water detection at satellite overpass time. It provides observational discrepancy analysis (IoU, Precision, Recall, F1), not an automatic real-time recalibration of 2D shallow water equations.

### E. Structural Damage vs Physical Exposure
- Physical exposure indicates spatial intersection between flood water ($h \ge 0.30\text{ m}$) and infrastructure. Damage fractions are computed from standard empirical Depth-Damage Functions (HAZUS-MH / CWC guidelines) with $\pm 15\%$ uncertainty bounds. The system does not fabricate arbitrary monetary/rupee values without verified local economic cadastral surveys.

### F. Multi-Model Adapters (Delft3D / SPH)
- The architecture provides unified adapter abstractions for Delft3D Flexible Mesh and Smoothed Particle Hydrodynamics (SPH). External proprietary or commercial solver installations are truthfully marked `NOT_CONFIGURED` on deployments where licenses or raw NetCDF/particle outputs are absent.

### G. Digital Artifact Provenance
- SHA-256 cryptographic hashes verify digital file integrity and byte-exact reproducibility of simulation artifacts. They do not certify the physical accuracy of the underlying engineering inputs.
