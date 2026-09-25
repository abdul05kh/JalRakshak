# JALRAKSHAK — PRE-HUMAN AUDIT SNAPSHOT
**Gate 5B Precondition Forensic Freeze**
**Timestamp:** 2026-09-24T18:06:00+05:30 (Local) / 2026-09-24T12:36:00Z (UTC)
**Audit Lead:** Antigravity Forensic Scientific Audit Team
**Repository:** `d:\projects\JalRakshak`
**Status:** IN PROGRESS (Forensic Pre-Human Precondition)

---

## 1. Environment and Version Matrix

| Component | Detected Version / Value | Verification Source |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 Enterprise (x86_64) | System runtime |
| **Git Commit Hash** | `309e250413c8d10a86037a2ea53779e3225e8378` | `git rev-parse HEAD` |
| **Working Tree Status**| Modified tracked files + Untracked Gate 3/4/5 artifacts | `git status` |
| **Python Version** | `Python 3.14.2` | `python --version` |
| **Node.js Version** | `v24.13.0` | `node --version` |
| **HEC-RAS Hydraulic Engine**| USACE HEC-RAS Version `7.0.1` (`RasUnsteady.exe`) | `artifacts/hecras/tehri_gate3b/manifest.json` |
| **Pytest Test Baseline** | **122 passed in 16.19s** (0 failed, 0 warnings) | `pytest backend/tests/` |
| **Frontend Production Build** | **Built successfully in 222ms** (0 errors) | `npm run build` |

---

## 2. Cryptographic Artifact Hashes (Authoritative Frozen Runs)

| Scenario / Artifact | File Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| **Scenario Central (Reference)** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf` | 13,502,177 | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` |
| **Scenario Minimum (Partial Breach)** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf` | 13,418,771 | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772` |
| **Scenario Maximum (Rapid Breach)** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf` | 13,546,027 | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a` |
| **Gate 3B Hydraulic Manifest** | `artifacts/hecras/tehri_gate3b/manifest.json` | 40,951 | `0b7e28989675276ae68e895e7c8ee52db9aee50bb86ca1b369c766fffa8d1017` |
| **Gate 4 Spatial Coupling Manifest**| `artifacts/gate4/manifest.json` | 1,514 | `1f46da64b5840b15e47855b7ca0612988cb666e8550d53c7a9161726ca2b8c9d` |

---

## 3. Current Gate Status Summary

| Gate | Status | Scientific Verification Summary |
| :--- | :--- | :--- |
| **Gate 1** | ✅ **PASSED** | Hydraulic baseline and 1D/2D conceptualization. |
| **Gate 2** | ✅ **PASSED** | Terrain conditioning (Copernicus 30m WGS84 UTM 44N) and mesh geometry. |
| **Gate 3** | ✅ **PASSED** | Native HEC-RAS 7.0.1 2D unsteady simulation freeze across 15 km reach. |
| **Gate 4** | ✅ **PASSED** | Hardened KD-tree spatial coupling and deterministic EWE calculation. |
| **Gate 5A** | ✅ **PASSED** | Computational decision pipeline, provenance, and data-gap resilience. |
| **Gate 5B** | 🟡 **PRE-HUMAN AUDIT** | Protocol and machinery built; **pre-human audit executing before participant recruitment**. |
