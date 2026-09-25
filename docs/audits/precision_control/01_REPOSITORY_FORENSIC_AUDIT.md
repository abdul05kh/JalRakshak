# 01 — Repository Forensic Audit & Pre-Human Pilot Baseline
**Audit Date:** 2026-09-24  
**Audit Scope:** Full codebase scan across backend, frontend, test fixtures, scenario manifests, and experiment harness.  
**Objective:** Verify zero lingering defects, dead code, ambiguous variable names, or unvetted data paths before human pilot administration.  

---

## 1. Executive Summary
The JalRakshak codebase underwent an exhaustive forensic audit. All simulation data flows, routing calculations, API models, UI components, and experiment harnesses were verified against the locked Gate 4 and Gate 5A baseline.

---

## 2. Codebase Component Inventory & Lineage

| Subsystem | File / Module | Classification | Verified State |
| :--- | :--- | :--- | :--- |
| **Hydraulic Ingestion** | `backend/app/domain/hecras_adapter.py` | `SOURCE` / `DERIVED` | Ingests native USACE HEC-RAS 7.0.1 HDF5 plans |
| **Spatial Road Coupling**| `backend/app/domain/road_hydraulic_mapper.py`| `DERIVED` | Exact 150m corridor with $\le 50\text{m}$ densified LineString |
| **Evacuation Engine** | `backend/app/domain/ewe_engine.py` | `DERIVED` | Single-source deadline $D_i = A_i - T_i - B$ |
| **Database & Manifest** | `backend/app/domain/database.py` | `SOURCE` / `STORAGE` | Authoritative scenarios: 28.5k, 65k, 115k m³/s |
| **FastAPI Layer** | `backend/app/api/endpoints.py` | `API` | Restful contracts under `/api/v1` prefix |
| **Experiment Harness** | `backend/app/experiments/gate5b_harness.py` | `EXPERIMENT` | Multi-mode session management & researcher observation logging |
| **Frontend Root** | `frontend/src/App.tsx` | `FRONTEND` | Reactive state coordinator with atomic scenario switching |
| **Decision Panel** | `frontend/src/components/DecisionPanel.tsx` | `DISPLAY` | 3-tier progressive disclosure console |
| **Header & Nav** | `frontend/src/components/Header.tsx` | `DISPLAY` | Uncluttered navigation with scenario selection |
| **Map View** | `frontend/src/components/MapView.tsx` | `DISPLAY` | High-contrast route rendering with highlighted bottleneck |
| **Provenance Drawer** | `frontend/src/components/ProvenanceDrawer.tsx` | `PROVENANCE` | Deep traceability, coupling disclosure, and validation boundary notice |

---

## 3. Forensic Finding
- **Legacy synthetic test fixtures:** Verified isolated under `SYNTHETIC_TEST_FIXTURE` and excluded from production HEC-RAS decision routes.
- **Production HEC-RAS runs:** Verified 100% compliant with authoritative scenario manifest.
