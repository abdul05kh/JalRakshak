# Final Technical Verification & Hardening Gate Report

**Project:** JalRakshak (SIH26161)  
**Release Tag:** `v2.0-hardening-release`  
**Commit:** `33eba32` (pre-commit baseline)  
**Date:** September 30, 2026  
**System Classification:** `Demo-Ready Research Prototype`  

---

## 1. Executive Verification Summary

JalRakshak is a specialized disaster-management decision-support prototype that translates complex 2D hydrodynamic simulation outputs into actionable, explainable evacuation deadlines for emergency commanders.

This verification gate confirms:
* **All 193 automated backend tests pass** (with 1 skipped for unconfigured optional live API endpoint).
* **Vite / TypeScript production build compiles cleanly** with 0 errors and 0 warnings.
* **Formal 5-Level Validation Ladder** explicitly separates software arithmetic from physical reality.
* **Zero hardcoded coordinate dependencies** verified with independent synthetic test worlds (`TEST_ALPHA`, `TEST_BETA`).
* **All 10 mathematical and logical invariant properties** of the Evacuation Window Engine (EWE) pass under adversarial testing.
* **Every operational decision is accompanied by complete provenance metadata**, including SHA-256 artifact hashes.

---

## 2. Subsystem Verification Matrix

| Subsystem | Verified Functionality | Authority / Evidence Source | Verification Status |
| :--- | :--- | :--- | :--- |
| **Hydraulic Ingestion** | Native HEC-RAS 2D HDF5 parsing across 740+ cells; $h = \max(0, \text{WSE} - z_{\text{bed}})$, velocity magnitude $v$. | USACE HEC-RAS 7.0.1 HDF5 plan files (`.p01.hdf` - `.p03.hdf`) | `PASS (Verified)` |
| **Road Coupling** | UTM Zone 44N projection, 50m polyline densification, 150m perpendicular corridor KD-tree query. | OpenStreetMap + EPSG:32644 transform | `PASS (Verified)` |
| **Decision Engine (EWE)** | Deterministic solution of $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ and extraction of $e_{\text{limiting}}$. | Closed-form EWE mathematical formulation | `PASS (Verified)` |
| **EWE Adversarial Invariants** | 10 mathematical properties (arrival delay, travel increase, buffer monotonicity, data gap propagation). | `backend/tests/test_ewe_properties.py` | `PASS (Verified)` |
| **Validation Ladder** | 5 formal levels (Software, Mesh, Scenarios, Satellite, Field). | `backend/app/domain/validation_ladder.py` | `PASS (Verified)` |
| **Scenario Generalization** | Data-driven execution on independent synthetic topologies (`TEST_ALPHA`, `TEST_BETA`). | `backend/tests/test_scenario_generalization_blackbox.py` | `PASS (Verified)` |
| **Satellite Discrepancy** | Sentinel-1 SAR change detection and spatial IoU, Precision, Recall, $F_1$ metrics. | GEE / Sentinel-1 GRD SAR pipeline | `RESEARCH (Qualified)` |
| **Multi-Model Adapters** | Common `HydraulicModelAdapter` interface for HEC-RAS, Delft3D FM, and DualSPHysics SPH. | `backend/app/domain/hydraulic_adapters/` | `INTERFACE ONLY (Qualified)` |
| **GIS Exports** | Production RFC 7946 GeoJSON and OGC KML 2.2 export endpoints. | `backend/app/domain/exporter.py` | `PASS (Verified)` |
| **Artifact Provenance** | Real-time SHA-256 physical file hashing of all ingested HDF5 and JSON fixtures. | `backend/app/domain/provenance.py` | `PASS (Verified)` |

---

## 3. Explicit Scientific Boundaries & Claims Discipline

The system strictly enforces the following scientific guardrails:

1. **Physical Field Validation is `NOT_ESTABLISHED`:** Because Tehri Dam has never breached, no physical field survey failure data exists. The hydraulic output represents a physics-based forward numerical simulation from USACE HEC-RAS.
2. **Satellite Observations are NOT Ground Truth:** Sentinel-1 C-band SAR backscatter reduction is an observational indicator of open surface water or high soil moisture; it is not treated as uncalibrated ground truth for numerical hydrodynamic validation.
3. **External Solvers are Interfaces:** Delft3D FM and DualSPHysics SPH are structured as adapter interfaces. Where external proprietary binaries are not installed, the system outputs structured adapter errors rather than fabricated procedural data.
4. **FEASIBLE is NOT Guaranteed SAFE:** Operational feasibility indicates that the calculated departure margin is positive under declared model assumptions ($50\,\text{km/h}$ travel speed, $3\,\text{min}$ buffer). Dynamic multi-agent traffic congestion and bridge structural failures are unmodelled.
5. **Damage Assessment is an Exposure Framework:** Inundation polygons are spatially intersected with infrastructure; financial rupee losses are not claimed without calibrated local cadastral surveys.
