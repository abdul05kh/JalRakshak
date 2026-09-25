# JalRakshak — Comprehensive Codebase & Architecture Audit
**Audit Date:** 2026-09-24  
**Audit Scope:** Full system audit (Backend, Domain models, EWE Engine, Validation service, Data Fixtures, GIS layers, UI Hierarchy, Documentation)

---

## 1. Executive Summary & Current State

JalRakshak is designed as a decision-support and evacuation window engine (EWE) for dam-break emergency response. It transforms hydraulic model results into actionable operational deadlines:
$$\text{HEC-RAS / Hydraulic Output} \longrightarrow \text{Depth / Velocity / Arrival} \longrightarrow \text{Spatial Road Exposure} \longrightarrow \text{EWE} \longrightarrow \text{Latest Feasible Departure & Limiting Segment}$$

### What Already Works
- **Evacuation Window Engine (EWE):** Fully functioning mathematical engine implementing $D_{\text{deadline}} = \min_i(A_i - T_i - B)$. Passed all 17 boundary tests and property invariants.
- **Decision-First UI:** Right sidebar displays primary operational status (`FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`), departure deadline, safety margin, limiting road segment, and deterministic calculation explanation.
- **REST API:** FastAPI endpoints supporting scenario listing, layer query, point inspector, evacuation routing, scenario comparison, and scientific validation reports.
- **Geospatial & Study Area Data:** Clean GeoJSON schemas for Tehri Dam, evacuation points / shelters, and road network links.
- **Honest Scientific Ledger:** Automated audit manifest (`data/ewe_audit_manifest.json`) and test suite separating software verification from empirical validation.

---

## 2. Classification of System Components

| Component | Status | Classification | Details |
| :--- | :--- | :--- | :--- |
| **EWE Mathematical Engine** | Fully Working | SOFTWARE-VERIFIED | Invariant equation $D = \min(A_i - T_i - B)$ verified with 30 unit/property tests. |
| **Study Area GeoJSON** | Fully Working | SOURCE-DERIVED | OSM-derived road network topology, Survey of India / CWC Tehri Dam coordinates. |
| **Synthetic Test Scenarios** | Fully Working | SYNTHETIC TEST FIXTURE | Scenarios 001, 002, 003 are calibrated synthetic test fixtures, NOT raw HEC-RAS runs. |
| **HEC-RAS HDF5 Ingestion** | Pending Implementation | PENDING | Needs `HecRasHdfAdapter` to read native `.p##.hdf` results and derive depth/arrival. |
| **Spatial Road-Hydraulic Mapper**| Partially Implemented | DERIVED | Currently reads pre-sampled `edge_hydraulics.json`; raster sampling module needed. |
| **Ritter Analytical Benchmark** | Fully Working | SOFTWARE-VERIFIED | Analytical 1D Ritter (1892) shock profile calculated with exact math. |
| **Sentinel-1 Satellite Validation**| Honest Data Gap | VALIDATION NOT ESTABLISHED | Documented as "NOT RUN" due to absence of raw Sentinel-1 SAR products in repo. |
| **3D Terrain Visualizer** | Auxiliary Module | PENDING REFINEMENT | Visual aid; secondary to 2D operational decision interface. |

---

## 3. Known Gaps

1. **HEC-RAS Binary & Raw Run Availability:**
   - Default Windows installations do not currently bundle an active HEC-RAS `.p##.hdf` run in the repository directory.
   - The system requires a strict adapter capable of parsing native HDF5 datasets (`/Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/...`) without falling back to synthetic data silently.
2. **Dynamic Road-Hydraulic Raster Sampling:**
   - Real HEC-RAS output requires dynamic sampling of flood arrival grids against vector road geometry using `rasterio` and `shapely`.
3. **Explicit Scenario Provenance Lineage:**
   - Scenarios must be stamped with explicit tags: `SYNTHETIC_TEST_FIXTURE`, `HECRAS_REAL_RESULT`, or `DERIVED_FROM_HECRAS`.

---

## 4. Required Changes

1. **Implement `HecRasHdfAdapter`:**
   - Read-only parser for HEC-RAS 2D Unsteady Flow HDF5 results (`.p##.hdf`).
   - Extract `Water Surface`, `Cell Minimum Elevation`, and `Face Velocity`.
   - Calculate `Depth(c,t) = WSE(c,t) - CellMinElev(c)` labeled `DERIVED_FROM_HECRAS`.
   - Extract or compute threshold-crossing arrival times $A(c) = \min \{t \mid \text{Depth}(c,t) \ge H_{\text{threshold}}\}$.
2. **Implement `RoadHydraulicMapper`:**
   - Spatial intersection and buffer sampling between road linestrings and hydraulic mesh cells / rasters.
   - Assign conservative earliest flood arrival $A_i$ and maximum depth $h_i$ to each road edge $e_i$.
3. **Explicit Provenance & Data Gap Handling:**
   - If hydraulic or road data is missing or CRS is mismatched, return `DATA_GAP` with an explicit reason.
   - Never substitute zero for missing depth, velocity, or arrival time.
4. **Comprehensive Test Suite & Reports:**
   - 4-level test hierarchy: Unit tests, Property tests, Integration tests, Reproducibility tests.
   - Documentation suite: Environment Report, HDF5 Schema, Arrival Time Method, Road Mapping Method, Provenance Model, Validation Report, Limitations, Claim-to-Evidence Matrix.

---

## 5. Do-Not-Touch Components

- **Evacuation Window Engine Core Mathematics (`backend/app/domain/ewe_engine.py`):**
  - The equation $D_{\text{deadline}} = \min_i (A_i - T_i - B)$ is mathematically correct and verified. Do not alter the core logic.
- **Frontend Decision-First Layout:**
  - The emergency-first decision hierarchy (Status Banner $\to$ Departure Deadline $\to$ Margin $\to$ Limiting Segment $\to$ Calculation Why) is verified and must remain intact.
- **OSM Basemap Configuration:**
  - Standard OpenStreetMap raster tile integration is verified with zero CARTO watermarks.

---

## 6. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| HEC-RAS result HDF5 missing in runtime environment | Real scenario cannot load | Create `HecRasHdfAdapter` with clean standalone sample fixture generator and explicit schema validation; fail loudly if file is corrupt or missing. |
| Negative depths or dry-cell noise in HDF5 | Skewed arrival time | Enforce non-negative clipping $\max(0, \text{WSE} - z_{\text{min}})$ and require $H \ge H_{\text{threshold}}$ for arrival detection. |
| CRS mismatch between road vector and hydraulic grid | Geometric misalignment | Implement explicit `pyproj.Transformer` pipeline with strict bounding box overlap checks. |
