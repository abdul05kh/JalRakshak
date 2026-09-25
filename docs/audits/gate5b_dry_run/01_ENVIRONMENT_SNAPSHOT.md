# GATE 5B TECHNICAL DRY RUN — ENVIRONMENT & CODEBASE SNAPSHOT
**Document ID:** `01_ENVIRONMENT_SNAPSHOT.md`
**Timestamp:** 2026-09-24T18:40:00+05:30 (Local) / 2026-09-24T13:10:00Z (UTC)
**Execution Mode:** TECHNICAL DRY RUN INSTRUMENTATION TEST (NOT HUMAN DATA)

---

## 1. System & Runtime Environment

| Parameter | Observed Value | Verification Source |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 Enterprise (x86_64) | Host system runtime |
| **Git Commit Hash** | `309e250413c8d10a86037a2ea53779e3225e8378` | `git rev-parse HEAD` |
| **Working Tree Status** | Active working directory with Gate 3/4/5 artifacts | `git status` |
| **Python Version** | `Python 3.14.2` | `python --version` |
| **Node.js Version** | `v24.13.0` | `node --version` |
| **Vite Version** | `v8.3.0` | `frontend/package.json` |
| **Pytest Version** | `pytest 9.1.1` | `pytest --version` |
| **HEC-RAS Hydraulic Engine**| USACE HEC-RAS 7.0.1 (`RasUnsteady.exe`) | `artifacts/hecras/tehri_gate3b/manifest.json` |

---

## 2. Gate 5B Core Codebase & Artifact Registry

| Component | Path | SHA-256 Checksum |
| :--- | :--- | :--- |
| **Central Hydraulic HDF5** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf` | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` |
| **Minimum Hydraulic HDF5** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf` | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772` |
| **Maximum Hydraulic HDF5** | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf` | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a` |
| **Frozen Scenario Manifest** | `artifacts/gate5b/frozen_scenario_manifest.json` | `880234de59c16270d71d605edf6d62b559eaca663c3312e7e4d26b129eefc7cb` |
| **Spatial Coupling Engine** | `backend/app/domain/road_hydraulic_mapper.py` | `07d2ff6ec89a9f2dfd08c5825ee0c463289069d2d0b5fbef21cb1216a9a081a2` |
| **Evacuation Window Engine** | `backend/app/domain/ewe_engine.py` | `f31faef635677c3e53655325ff2a3df2b3a16584c3ea8a8fc4847e92828b8b80` |
| **Experiment Harness** | `backend/app/experiments/gate5b_harness.py` | `15e8f1766a50ee7b3558d4a942bc02bbd0ceca9f22036c05007b864a781b0f51` |
| **Ground Truth Sealed Hash** | Sealed in `gate5b_harness.py` | `4bf8d9a2d6d04bff1cde373d74ec18602eadb00cabafe5c1d37767ea672a7637` |

---

## 3. Snapshot Integrity Certification
- All tools and execution paths are locked and reproducible.
- Zero external dependencies introduced.
