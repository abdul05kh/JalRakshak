# JALRAKSHAK — FORENSIC REPOSITORY AUDIT

**Audit Date:** September 28, 2026  
**Repository:** [https://github.com/abdul05kh/JalRakshak](https://github.com/abdul05kh/JalRakshak)  
**Release Target:** Smart India Hackathon (SIH 2026) Problem Statement SIH26161  
**Status:** COMPLETE AUDIT

---

## 1. Executive Summary

This forensic repository audit catalogs and classifies every directory, file category, dataset, and artifact in the JalRakshak repository prior to the SIH 2026 release.

| Category | Total Tracked Items | Policy / Action | Rationale |
|---|---|---|---|
| **Backend Core & Domain** | 22 Python modules | **KEEP** | Core FastAPI service, EWE engine, HEC-RAS HDF5 adapter, spatial coupling |
| **Frontend Web Application** | 35 TypeScript/CSS/Vite files | **KEEP** | React 18, ArcGIS SceneView 3D map, temporal slider, decision panels |
| **Authoritative HEC-RAS Datasets** | 8 HDF5 / Mesh files | **KEEP** | Gate 3B frozen 15km Tehri hydrodynamic simulation results (SHA-256 verified) |
| **Study Area GIS & Scenarios** | 2 Baseline GIS + 5 Scenario dirs | **KEEP** | Study area roads/settlements, scenario manifests, and isolated test worlds |
| **Automated Test Suite** | 24 Pytest / Integration suites | **KEEP** | 215 automated tests covering EWE mathematics, GIS isolation, and concurrency |
| **Visual Documentation & Evidence** | 12 Screenshots & SVGs | **KEEP / ORGANIZE** | `docs/images/` architecture diagrams, real UI screenshots, and demo thumbnail |
| **Operational & Scientific Docs** | 78 Markdown documents | **KEEP** | Complete Gate 1–5B verification lineage, data contracts, and audit trails |
| **Deployment Configuration** | `render.yaml`, `Dockerfile` | **KEEP** | Multi-service Render deployment specification and container configuration |
| **Scratch Scripts / Execution Logs** | `scratch/` directory | **KEEP / ISOLATE** | Historical Gate 3 COM automation scripts and verification logs |
| **Local Machine Secrets & Env** | `.env*` | **REMOVE / EXCLUDE** | `.gitignore` enforces exclusion of local machine envs; `.env.example` provided |

---

## 2. Granular Inventory & Classification

### A. Backend Source (`backend/`)
| Path | Category | Action | Reason |
|---|---|---|---|
| `backend/app/main.py` | API Entrypoint | **KEEP** | FastAPI application setup, CORS configuration, `/health/live`, `/health/ready` |
| `backend/app/api/endpoints.py` | REST API | **KEEP** | Scenario layers, route analysis, point query, timeline, and comparison endpoints |
| `backend/app/domain/database.py` | Data Registry | **KEEP** | In-memory dataset registry, scenario context loader, study area baseline |
| `backend/app/domain/scenario_context.py` | Data Isolation | **KEEP** | Immutable request-scoped `ScenarioContext`, safe relative path resolution |
| `backend/app/domain/ewe_engine.py` | Algorithm Core | **KEEP** | Evacuation Window Engine ($D_i = A_i - T_i - B$, governing bottleneck calculation) |
| `backend/app/domain/hecras_adapter.py` | Hydrodynamic Adapter | **KEEP** | Native HEC-RAS 2D HDF5 geometry, water surface, velocity, and arrival parsing |
| `backend/app/domain/road_hydraulic_mapper.py` | Spatial Coupling | **KEEP** | KD-Tree search corridor mapping road coordinates to hydrodynamic cells |
| `backend/app/domain/validation_service.py` | QA & Benchmark | **KEEP** | Ritter analytical benchmark, satellite validation, and solver verification |
| `backend/requirements.txt` | Dependencies | **KEEP** | Production Python dependencies for Render/container deployment |

### B. Frontend Source (`frontend/`)
| Path | Category | Action | Reason |
|---|---|---|---|
| `frontend/src/App.tsx` | UI Shell | **KEEP** | Root application shell, header, scenario switcher, active view state |
| `frontend/src/services/api.ts` | API Client | **KEEP** | Clean `VITE_API_BASE_URL` resolution with production error handling |
| `frontend/src/map3d/ArcGISSceneViewer.tsx` | 3D Scene | **KEEP** | ArcGIS Maps SDK 3D SceneView, camera animation, layer rendering |
| `frontend/src/map3d/ArcGISRoadLayer.ts` | Geospatial Layer | **KEEP** | Dynamic road network rendering, flood status symbology, limiting edge highlight |
| `frontend/src/map3d/ArcGISHydraulicLayer.ts` | Geospatial Layer | **KEEP** | Dynamic flood polygon rendering, depth coloration |
| `frontend/src/components/DecisionPanel.tsx` | UI Component | **KEEP** | Operational evacuation decision display, departure deadline, route alternatives |
| `frontend/src/components/TemporalSlider.tsx` | UI Component | **KEEP** | Time scrubber consuming authoritative scenario timesteps |
| `frontend/public/simulation/` | Media Asset | **KEEP** | Prototype cinematic simulation MP4 video asset |
| `frontend/public/terrain/` | Terrain Elevation | **KEEP** | Copernicus GLO-30 DEM elevation binary tiles for 3D terrain clamping |

### C. Scenario & Study Area Data (`data/`)
| Path | Category | Action | Reason |
|---|---|---|---|
| `data/study_area/dam.json` | Baseline GIS | **KEEP** | Global baseline dam structure geometry |
| `data/study_area/roads.json` | Baseline GIS | **KEEP** | Tehri valley road network baseline (R01–R17) |
| `data/study_area/evacuation_points.json` | Baseline GIS | **KEEP** | Tehri valley settlements (VILL-01..04) and safe shelters (HOSP-01..04) |
| `data/scenarios/SCENARIO_CENTRAL/` | Authoritative Scenario | **KEEP** | Baseline 15km Tehri flood breach scenario manifest |
| `data/scenarios/SCENARIO_MINIMUM/` | Authoritative Scenario | **KEEP** | Minimum breach sensitivity scenario manifest |
| `data/scenarios/SCENARIO_MAXIMUM/` | Authoritative Scenario | **KEEP** | Maximum breach catastrophe scenario manifest |
| `data/scenarios/TEST_ALPHA/` | Synthetic Fixture | **KEEP** | RC3.2 autonomous synthetic test world (X01–X03, Settlement Alpha/Beta) |
| `data/scenarios/TEST_BETA/` | Synthetic Fixture | **KEEP** | RC3.2 autonomous synthetic test world (Y01–Y03, Settlement Gamma/Delta) |

### D. Verification Tests (`tests/` & `backend/tests/`)
| Path | Category | Action | Reason |
|---|---|---|---|
| `tests/test_scenario_scoped_gis.py` | RC3.2 Test Suite | **KEEP** | Multi-world GIS isolation, concurrency safety, no-fallback invariant |
| `tests/test_data_driven_architecture.py` | Data-Driven Audit | **KEEP** | Anti-hardcode scanner, parameter sensitivity, mutation validation |
| `tests/test_frontend_state_consistency.py` | Frontend Invariants | **KEEP** | Authoritative mathematical invariants and timeline integrity |
| `backend/tests/test_ewe_integration.py` | Algorithm Verification | **KEEP** | End-to-end EWE route evaluation and bottleneck testing |
| `backend/tests/test_tehri_native_hecras.py` | Hydrodynamic Tests | **KEEP** | HEC-RAS HDF5 schema conformity, arrival threshold monotonicity |

### E. Documentation & Visual Assets (`docs/`)
| Path | Category | Action | Reason |
|---|---|---|---|
| `docs/images/architecture/` | Diagrams | **KEEP** | Clean SVG system architecture and EWE formula diagrams |
| `docs/images/screenshots/` | UI Evidence | **KEEP** | Real browser screenshots (overview, simulation, road impact, decision) |
| `docs/images/demo/` | Demo Assets | **KEEP** | Demo video thumbnail linked to demo player |
| `docs/REPOSITORY_AUDIT.md` | Release Governance | **KEEP** | This comprehensive repository audit |
| `docs/RELEASE_READINESS.md` | Verification Matrix | **KEEP** | Verification scorecard and deployment status |
| `docs/DYNAMIC_DATA_ARCHITECTURE.md` | Architecture Spec | **KEEP** | Scenario context and data isolation architecture specification |

### F. Deployment & Environment Configuration
| Path | Category | Action | Reason |
|---|---|---|---|
| `render.yaml` | Multi-service Spec | **KEEP** | FastAPI backend + Vite static frontend Render blueprint |
| `Dockerfile` | Container Spec | **KEEP** | Standalone production containerization |
| `.env.example` | Environment Template | **KEEP** | Safe template for backend environment variables |
| `frontend/.env.example` | Environment Template | **KEEP** | Safe template for frontend `VITE_API_BASE_URL` |
| `.gitignore` | Version Control | **KEEP** | Excludes `.venv`, `node_modules`, `dist`, `.env*`, and cache directories |

---

## 3. Secret & Path Sanitization Checklist

- [x] No plaintext API keys, passwords, or cloud credentials in tracked files.
- [x] No hardcoded machine paths (`C:\`, `D:\`, `file:///`, `/home/`, `/Users/`) in production source files.
- [x] Frontend API URL dynamically configured via `VITE_API_BASE_URL`.
- [x] Backend CORS dynamically configured via `CORS_ORIGINS`.
- [x] Health endpoints (`/health/live`, `/health/ready`) sanitized of environment secrets.
