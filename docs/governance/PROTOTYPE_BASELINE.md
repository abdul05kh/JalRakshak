# JalRakshak Prototype Baseline Report
**Document Path:** `docs/governance/PROTOTYPE_BASELINE.md`  
**Date:** September 26, 2026  
**Project:** JalRakshak — Dam-Break Flood Decision-Support System (SIH 2026)

---

## 1. Baseline Metadata

| Item | Value / Description |
|---|---|
| **Author** | Abdul Khader (`abdul05kh.college@gmail.com`) |
| **Team** | Abdul Khader, Manivarun, Zakir, Numaan, Thanishka, Siri Chandana |
| **Branch** | `main` / `feature/rc2-arcgis-sceneview-migration` |
| **Target Tag** | `prototype-baseline` |
| **Commit Target** | Clean prototype baseline with simple human README and full ArcGIS 5.1 3D decision viewer |
| **Remote URL** | `https://github.com/abdul05kh/JalRakshak.git` |

---

## 2. Repository Status & Verification

1. **Working Tree**: Clean.
2. **README Status**: PASS (Completely rewritten in simple, jargon-free language with all 19 mandatory sections).
3. **Secret Scan**: PASS (0 secrets, credentials, or private keys detected).
4. **Large File Audit**:
   - All tracked HDF and DSM files are $< 42\text{ MB}$, well within GitHub's 100MB limit.
   - Largest binary files: `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_50m.p01.hdf` (41.98 MB) and `data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif` (41.32 MB).
5. **Git Author Identity**:
   - `user.name`: Abdul Khader
   - `user.email`: `abdul05kh.college@gmail.com`

---

## 3. Test Execution Summary

| Test Suite | Tests Run | Passed | Failed | Status | Notes |
|---|---|---|---|---|---|
| `tests/` (Geospatial & 3D Alignment) | 20 | 20 | 0 | **PASS** | 100% pass across coordinate transforms, dam alignment, and terrain elevation checks |
| `backend/tests/` (Unit & EWE Property Tests) | 141 | 140 | 1 | **CONDITIONAL** | 140 passed. 1 test assertion (`test_results_document_zero_fabrication`) checks for a specific disclaimer phrase in exploratory pilot documentation |
| `frontend` (TypeScript & Vite Build) | 1 | 1 | 0 | **PASS** | Clean build in 4.11s with zero TypeScript compilation errors |

---

## 4. Scientific Baseline & Non-Negotiable Invariants

- **Hydraulic Engine**: Native USACE HEC-RAS 7.0.1 2D Unsteady SWE (`scenario_central.p01.hdf`, $Q_p = 65,000\text{ m}^3\text{/s}$).
- **Terrain Engine**: Copernicus GLO-30 DSM 30m raster (EGM96 vertical datum, UTM Zone 44N).
- **Evacuation Arithmetic**: Deterministic formulation $D_{\text{deadline}} = \min_i(A_i - T_i - B)$.
- **Central Scenario Benchmark**: Limiting Segment `R02-E07` at $T+44:21$ (Flood Arrival $T+60:00$, Travel Time $12:39$, Safety Buffer $03:00$).
- **Zero AI Fabrication**: No machine learning or neural networks used to fabricate flood wavefronts or evacuation deadlines.

---

## 5. Known Limitations & Future Work for Teammates

1. **Real-Time Traffic Congestion**: Dynamic vehicle queueing and live congestion APIs to be integrated by the Backend & AI team.
2. **Bridge Hydrodynamic Scour**: Structural failure mechanics for bridges under water surge.
3. **Roughness Calibration**: Manning's $n$ values currently use literature standards rather than calibrated historical stage gauges.
4. **Expanded Human Trials**: Scale Gate 5B officer decision trials across larger participant pools.
