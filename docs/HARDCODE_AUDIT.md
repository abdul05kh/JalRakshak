# JalRakshak Hardcoded Data Elimination Audit (RC3)

## 1. Audit Scope & Methodology

A complete forensic scan was conducted across all `.py`, `.ts`, `.tsx`, `.json`, and `.yaml` files in the repository. All hardcoded constants and duplicate truth stores were categorized into the taxonomy defined below:

- **[A] SCIENTIFIC CONSTANT**: Physical laws ($g = 9.81$, density of water).
- **[B] ENGINEERING CONFIGURATION**: Operational parameters (Buffer = 3 min, Threshold = 0.3m).
- **[C] UI/PRESENTATION CONSTANT**: Color codes, camera presets, CSS layout.
- **[D] AUTHORITATIVE DATA**: Datasets from HEC-RAS, OSM, GeoJSON.
- **[E] DERIVED DATA**: Data computed live via algorithm pipelines.
- **[F] TEST FIXTURE**: Isolated unit test data and sealed assertions.
- **[G] SYNTHETIC DEMONSTRATION DATA**: Mock data labeled `SYNTHETIC_TEST_FIXTURE`.
- **[H] INVALID/FABRICATED FALLBACK**: In-code hardcoding masquerading as authoritative truth.

---

## 2. Hardcoded Item Remediation Matrix

| File Path | Original Pattern / Value | Class | Action Taken | Current Data-Driven Replacement |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/src/services/decisionStore.ts` | `LOCKED_SCENARIO_DECISIONS` matrix | [H] | **DELETED** | Dynamically subscribes to backend `RouteAnalyzeResponse`. |
| `frontend/src/map3d/ArcGISRoadLayer.ts` | `R02_BASE_GEOMETRIES` hardcoded coords | [H] | **DELETED** | Renders route directly from authoritative `roads.json` and backend route geometry. |
| `backend/app/domain/road_hydraulic_mapper.py` | `max_vel_val = 2.4` constant velocity | [H] | **DELETED** | Uses HEC-RAS face velocity or shallow celerity $v \approx \sqrt{g \cdot h}$ from mesh. |
| `backend/app/domain/ewe_engine.py` | Fallback `best_node = "N-MALIDEWAL"` | [H] | **DELETED** | Real haversine node distance scan; returns `None` / `DATA_GAP` if unresolved. |
| `backend/app/domain/ewe_engine.py` | Magic `99999` & `6 hour` deadline fallback | [H] | **DELETED** | Replaced with `float('inf')` and `None` (unaffected edge imposes no deadline constraint). |
| `backend/app/api/endpoints.py` | `node_name_map` hardcoded village coords | [H] | **DELETED** | Queries graph nodes and GeoJSON evacuation points dynamically. |
| `backend/app/api/endpoints.py` | Hardcoded explainers based on `q_peak` | [H] | **DELETED** | Explanations generated dynamically from actual EWE limiting edge and margin. |
| `backend/app/api/endpoints.py` | Static `timesteps = [0, 15, 30...]` | [H] | **DELETED** | Generated from scenario duration and native HEC-RAS time step parameters. |
| `frontend/src/map3d/ArcGISTerrainEngine.ts` | Hardcoded `HOSP-01..04` infrastructure | [H] | **DELETED** | Ingests GeoJSON features dynamically from `evacuation_points.json`. |
| `scripts/render_cinematic_simulation.py` | Hardcoded arrival times and decisions | [H] | **DELETED** | Parameterized CLI arguments accept scenario manifest and EWE decisions. |
| `frontend/src/views/FloodSimulationView.tsx` | Fixed JSX strings ("T+44:21", "R02-E07") | [H] | **DELETED** | Bound directly to `decision.deadlineFormatted` and `decision.limitingEdgeId`. |
| `backend/app/core/operational_config.py` | Scattered thresholds (0.3m, 3.0min) | [B] | **CENTRALIZED** | Loaded from `config/operational.yaml` via pydantic configuration schema. |

---

## 3. Automated Static Anti-Hardcode Invariant Guard

To prevent future regression, an automated static AST/token scan test has been added to the test suite:
- **Test**: [`tests/test_data_driven_architecture.py::test_static_codebase_anti_hardcode_scan`](file:///d:/projects/JalRakshak/tests/test_data_driven_architecture.py)
- **Status**: **PASS** (Zero prohibited locked decision matrices, duplicate geometries, or 2.4 m/s constants in production files).
