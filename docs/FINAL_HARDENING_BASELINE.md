# Final Hardening & Scientific Validation Baseline

**Project:** JalRakshak (SIH26161)  
**Baseline Commit:** `33eba32`  
**Date:** September 30, 2026  
**Status:** Demo-Ready Research Prototype  

---

## 1. Baseline Verification Metrics
* **Backend Test Suite (Pytest):** 193 passed, 1 skipped in 55.75s
* **Frontend Production Build:** Vite 5.4.19 / TypeScript 5.5.3 (0 errors, 0 warnings)
* **Codebase Verification Status:** 100% test passing baseline established prior to hardening pass.

---

## 2. Authoritative Data Sources & Lineage
* **Hydraulic Engine:** USACE HEC-RAS 2D unsteady flow simulation outputs ingested via native HDF5 tables (`.p01.hdf`, `.p02.hdf`, `.p03.hdf`).
* **Digital Elevation Model:** Copernicus GLO-30 30m Global DEM (DSM).
* **Road Geometries:** OpenStreetMap road network projected to UTM Zone 44N (EPSG:32644).
* **Remote Sensing:** Sentinel-1 C-band SAR GRD imagery indexed for the Bhagirathi river basin AOI (Orbit 63 Descending, Orbit 129 Ascending).

---

## 3. Explicit Scientific Boundaries & Known Limitations
1. **Physical Validation:** `NOT_ESTABLISHED` for Tehri Dam break failure due to absence of historical failure records.
2. **Satellite Observations:** Sentinel-1 flood masks represent surface water backscatter change, not calibrated ground truth for HEC-RAS.
3. **External Solvers:** Delft3D FM and DualSPHysics SPH are structured as adapter interfaces; solver execution is not included in the demo environment.
4. **Evacuation Dynamics:** The Evacuation Window Engine (EWE) is a deterministic transformation of hydraulic arrival times under configured route speed (50 km/h) and safety buffer (3 min) assumptions; dynamic traffic congestion is unmodelled.
5. **Damage Assessment:** Exposure framework maps structural intersection; financial loss prediction is not computed without calibrated cadastral data.

---

## 4. Implementation Plan for Final Hardening Pass
* **Feature 1:** Formal Physical/Observational Validation Ladder (`backend/validation/` and `test_validation_ladder.py`).
* **Feature 2:** Data-Driven Scenario Generalization with 2 structurally independent synthetic test worlds (`TEST_ALPHA`, `TEST_BETA`).
* **Feature 3:** Operational Emergency-Officer Decision Workspace & UI enhancements.
* **Feature 4:** EWE Adversarial / Property-Based Verification (`backend/tests/test_ewe_properties.py` with golden cases A-E).
* **Feature 5:** Scenario Comparison with traceable Decision Deltas.
* **Feature 6:** Complete Provenance & Evidence Traceability Panel.
* **Feature 7:** Evidence-Centered Visualization Modes (Operational / Scientific / Cinematic).
* **Feature 8:** Exposure Framework Qualification.
* **Feature 9:** GEE/Sentinel-1 Boundary Guardrails.
* **Feature 10:** Scientific Claim Hygiene Scan.
* **Feature 11:** Test & Regression Gate (`docs/FINAL_TECHNICAL_VERIFICATION.md`).
* **Feature 12:** Reviewer Attack Test (`docs/REVIEWER_ATTACK_TEST.md`).
