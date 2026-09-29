# Forensic Audit & Scientific Red-Team Report

**System:** JalRakshak — Dam-Break Hydrodynamic Inundation Decision Support  
**Problem Statement:** `SIH26161` (NTRO / MIC)  
**Audit Standard:** Zero-Fabrication Scientific Evidence Standard  
**Date:** September 2026

---

## 1. Executive Summary
This forensic audit examined all frontend, backend, GIS, hydraulic, remote sensing, and documentation components of the JalRakshak repository against the explicit requirements of NTRO problem statement SIH26161.

---

## 2. Requirement Matrix & Implementation Reality

| Requirement | Claimed in Prior Docs | Actual Implementation Reality | Correct Scientific Classification |
|---|---|---|---|
| **A. Hydrodynamic Dam-Break Solver** | Native HEC-RAS 2D unsteady flow simulation. | Native HEC-RAS 7.0.1 executed across 3 breach plans (Central 65k, Min 28.5k, Max 115k $\text{m}^3/\text{s}$). HDF5 plan outputs parsed directly. | `AUTHORITATIVE_INGESTED` (Physical calibration unestablished) |
| **B. Continuous Inundation & Arrival** | Continuous depth, WSE, velocity, and wave arrival per 2D cell. | 740+ flooded cells mapped to WGS84 polygon rings with $h \ge 0.30\text{ m}$ threshold. | `SOURCE_DERIVED` |
| **C. Scenario-Scoped GIS Isolation** | Agnostic scenario world architecture. | Isolated contexts (`SCENARIO_CENTRAL`, `TEST_ALPHA`, `TEST_BETA`) verified by black-box tests. | `VERIFIED_ISOLATED` |
| **D. Google Earth Engine (GEE)** | Near-real-time satellite flood detection. | GEE provider architecture, Sentinel-1 SAR query builder, and spatial comparator (IoU, precision, recall, F1) implemented. Live execution requires user GCP credentials; otherwise uses Mode B artifact ingestion. | `PARTIAL / CREDENTIAL_DEPENDENT` |
| **E. July 2024 Satellite Comparison** | July 2024 Sentinel-1 event validates Tehri model. | **RED-TEAM FINDING:** July 2024 Balganga/Budha Kedar event is geographically distinct from Tehri $\to$ Bhagirathi $\to$ Koteshwar breach corridor. Corrected to `OBSERVED FLOOD MONITORING` and `NOT_COMPARABLE` to dam-break validation. | `RESEARCH_ONLY_MONITORING` |
| **F. Delft3D / SPH Solvers** | Multi-hydrodynamic model comparisons. | `HydraulicModelAdapter` interface and normalized comparison schema implemented. Solvers truthfully marked `NOT_CONFIGURED` on deployments without commercial licenses. | `EXTERNAL_SOLVER_INTERFACE` |
| **G. Loss / Damage Analysis** | Structural damage estimation. | Exposure engine separating physical exposure ($h \ge 0.30\text{m}$) from empirical Depth-Damage Functions (HAZUS/CWC curves $\pm 15\%$). Zero fabricated rupee figures. | `EXPOSURE_FRAMEWORK (RESEARCH DDF)` |
| **H. GIS Export (KML / GeoJSON)** | Standard GIS outputs. | RFC 7946 GeoJSON and OGC KML 2.2 XML exporters with embedded hydraulic attributes and departure margins. | `IMPLEMENTED & VERIFIED` |
| **I. Evacuation Window Engine (EWE)** | Deterministic departure deadline & limiting segment. | Mathematical formulation $D = \min_i(A_i - T_i - B)$ identifying bottleneck segment. | `MATHEMATICALLY_LOCKED` |

---

## 3. Detailed Component Forensic Audit

### 3.1 GEE Integration & Precision/Recall
- **Issue:** Earlier comparator version reversed precision and recall definitions.
- **Fix:** Corrected conventional remote sensing definitions:
  $$\text{Precision} = \frac{\text{Area}(\text{Sim} \cap \text{Obs})}{\text{Area}(\text{Sim})}, \quad \text{Recall} = \frac{\text{Area}(\text{Sim} \cap \text{Obs})}{\text{Area}(\text{Obs})}$$
- **Fix:** Added multi-temporal statistical change detection methodology (`sentinel1_multitemporal.py`) utilizing Sentinel-1 Orbit 63 descending time series, Lee speckle filtering, and JRC "Historical Water Occurrence" screening.

### 3.2 Decision Engine Fallback Cleanup
- **Issue:** `endpoints.py` and `decisionStore.ts` previously returned fallback values (`T+44:21`, `R02-E07`, `99999`) when backend responses were pending or incomplete.
- **Fix:** Replaced all synthetic fallbacks with explicit `DATA GAP` / `NOT COMPUTABLE` states and structured machine-readable reason codes.

### 3.3 Security & CORS Hardening
- **Issue:** Backend allowed wildcard `allow_origins=["*"]`.
- **Fix:** Configured environment-driven `CORS_ORIGINS` with strict allowed frontend origin lists in production.

### 3.4 Generalization Verification
- **Evidence:** Added black-box automated tests (`test_scenario_generalization_blackbox.py`) proving that `TEST_ALPHA` (`X01`, `X02`, `X03`) and `TEST_BETA` (`Y01`, `Y02`, `Y03`) execute and resolve independently without referencing Tehri constants.

---

## 4. Final Scientific Release Verdict

**Verdict:** `DEMO READY / RESEARCH VALIDATED TO CURRENT SCOPE`

- **Core Capabilities:** 100% data-driven, verified against native HEC-RAS 2D unsteady flow results.
- **Decision Engine:** Deterministic EWE formulation with zero hardcoded fallbacks.
- **Provenance:** Real SHA-256 disk artifact hashing and explicit limitation disclosures.
