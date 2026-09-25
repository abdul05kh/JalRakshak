# 04 — Scenario Source-of-Truth & Manifest Verification
**Audit Date:** 2026-09-24  
**Manifest Path:** `artifacts/hecras/tehri_gate3b/manifest.json`  

---

## 1. Authoritative Scenario Manifest

| Scenario Identifier | Description | Peak Discharge ($Q_p$) | HDF5 Artifact | SHA-256 Checksum | Ingestion Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCENARIO_MINIMUM`** | Partial breach / overtopping | $28,500\text{ m}^3/\text{s}$ | `tehri_15km_scenario_minimum.p01.hdf` | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772` | **VERIFIED** |
| **`SCENARIO_CENTRAL`** | Reference Froehlich piping | $65,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_central.p01.hdf` | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` | **VERIFIED** |
| **`SCENARIO_MAXIMUM`** | Worst-case rapid breach | $115,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_maximum.p01.hdf` | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a` | **VERIFIED** |

---

## 2. Integrity Confirmation
- The active scenario set is uniquely defined in `artifacts/hecras/tehri_gate3b/manifest.json`.
- All production routes and API endpoints ingest directly from this frozen manifest.
- The frontend dynamically loads scenarios from `/api/v1/scenarios` and cannot independently invent scenario parameters.
