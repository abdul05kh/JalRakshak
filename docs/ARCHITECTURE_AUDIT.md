# JALRAKSHAK ARCHITECTURE FORENSIC AUDIT
**SIH Problem Statement:** SIH26161 — Dam Break Inundation Modelling Using Hydrodynamic Modelling of any River  
**System Status:** Post-Submission Hardening & Modernization Pass  
**Authoritative Reference:** JalRakshak Core Engineering Team  
**Evaluation Baseline Commit:** `c4b168b` (Branch: `main`)

---

## EXECUTIVE SUMMARY

This forensic audit evaluates the JalRakshak codebase across all software layers: backend domain services, hydraulic artifact adapters, spatial and road-coupling pipelines, evacuation decision engines (EWE), database and scenario state management, API routes, security surfaces, and frontend visualization.

The primary architectural mandate of JalRakshak is:
> **"HEC-RAS describes what the water does. JalRakshak transforms hydraulic output into an explainable operational decision layer:**
> $\text{hydraulic state} \rightarrow \text{flood arrival } (A_i) \rightarrow \text{road impact} \rightarrow \text{route} \rightarrow \text{travel-time assumption } (T_i) \rightarrow \text{safety buffer } (B) \rightarrow \text{latest feasible departure } (D) \rightarrow \text{limiting segment } (e^*) \rightarrow \text{explanation} \rightarrow \text{provenance} \rightarrow \text{scenario comparison}$."

The system must not drift into being merely a 3D visualization. All decision mathematics must remain backend-authoritative, deterministic, unit-disciplined, CRS-explicit, and provenance-traceable.

---

## SECTION A: CURRENT ARCHITECTURE

The repository is structured into two primary application packages and support directories:

```
JalRakshak/
├── backend/
│   ├── app/
│   │   ├── algorithms/          # Specific auxiliary hydraulic routines (courant, froude, etc.)
│   │   ├── api/endpoints.py     # FastAPI monolithic endpoint router (28 routes)
│   │   ├── core/                # Operational configuration (operational.yaml loading)
│   │   ├── domain/              # Core business logic: database, ewe_engine, hecras_adapter,
│   │   │                        # geo_transform, road_hydraulic_mapper, validation_ladder
│   │   ├── integrations/        # GEE satellite query builder and comparator
│   │   ├── schemas/             # Auxiliary Pydantic models (decision_matrix, hydrograph)
│   │   └── telemetry/           # Logging and telemetry primitives
│   └── tests/                   # 52 test files (210 passing automated tests)
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # App routing shell & post-submission disclosure modal trigger
│   │   ├── components/          # DecisionPanel, Header, Sidebar, TemporalSlider, Modals
│   │   ├── map3d/               # ArcGIS SceneView 3D map implementation and layer drivers
│   │   ├── services/            # Frontend API client and ArcGIS layer factories
│   │   ├── tokens/              # Elevation and operational color definitions
│   │   └── views/               # OperationalMapView, EvacuationDecisionView, ScienceValidationView,
│   │                            # ProvenanceView, PostSubmissionUpdateView
├── data/
│   ├── scenarios/               # Static synthetic scenarios (baseline, catastrophic, piping, TEST_ALPHA, TEST_BETA)
│   └── study_area/              # Tehri dam manifest, road network GeoJSON, evacuation points GeoJSON
└── artifacts/
    └── hecras/tehri_gate3b/     # Genuine HEC-RAS 2D HDF5 output artifacts (Central, Minimum, Maximum)
```

---

## SECTION B: DEPENDENCY GRAPH

```
[FastAPI Endpoints (endpoints.py)]
     │
     ├──> [Database (database.py)] <────> [Static Files: data/ & artifacts/]
     │          │
     │          ├──> [HecRasHdfAdapter (hecras_adapter.py)] ──> h5py / numpy
     │          │
     │          └──> [RoadHydraulicMapper (road_hydraulic_mapper.py)] ──> scipy.spatial.KDTree, shapely
     │                    │
     │                    └──> [GeoTransformer (geo_transform.py)]
     │
     ├──> [EvacuationWindowEngine (ewe_engine.py)] ──> networkx, datetime
     │
     ├──> [ScientificValidationService (validation_service.py)] ──> validation_ladder.py
     │
     └──> [ExposureAndDamageEngine (damage_model.py)]
```

---

## SECTION C: DATA FLOW

1. **Hydraulic Ingestion:**
   `artifacts/hecras/tehri_gate3b/*.hdf` $\rightarrow$ `HecRasHdfAdapter.load_scenario()` $\rightarrow$ Read cell coordinates, cell minimum elevation $Z_{min}$, unsteady WSE time series $WSE(c,t)$, face velocities $\rightarrow$ Compute cell depths $h(c,t) = \max(0, WSE(c,t) - Z_{min}(c))$ $\rightarrow$ Calculate arrival times $A(c) = \min \{t \mid h(c,t) \ge h_{thresh}\}$ $\rightarrow$ Return in-memory `HydraulicScenarioData`.

2. **Road-Hydraulic Spatial Coupling:**
   Vector road segments in EPSG:4326 $\rightarrow$ Project to UTM Zone 44N (EPSG:32644) via `GeoTransformer` $\rightarrow$ Densify LineString every 50m $\rightarrow$ Buffer search radius (150m) against `KDTree(cell_coords)` $\rightarrow$ Filter candidate cells by perpendicular Euclidean distance to LineString $\rightarrow$ Extract road arrival $A_i = \min_{c \in C_i} A(c)$, maximum depth $h_i = \max_{c \in C_i} h(c)$, and maximum velocity $v_i$.

3. **Evacuation Decision (EWE):**
   Origin and destination nodes $\rightarrow$ NetworkX shortest paths $\rightarrow$ For each edge $i$: $D_{deadline, i} = A_i - T_i - B$ $\rightarrow$ Route deadline $D_{deadline} = \min_i(A_i - T_i - B)$ $\rightarrow$ Limiting segment $e^* = \arg\min_i(A_i - T_i - B)$ $\rightarrow$ Operational status (FEASIBLE / LOW MARGIN / INFEASIBLE / DATA GAP) $\rightarrow$ Full provenance attached.

---

## SECTION D: API FLOW

| Endpoint | Method | Authoritative Source | Primary Function |
| :--- | :--- | :--- | :--- |
| `/api/v1/scenarios` | GET | `Database.list_scenarios` | Enumerate available scenarios (Authoritative, Research, Demonstration) |
| `/api/v1/scenarios/{id}/hydraulics` | GET | `Database.get_scenario` | Inundation mesh GeoJSON with cell depths and arrivals |
| `/api/v1/routes/analyze` | POST | `EvacuationWindowEngine` | Authoritative EWE evaluation of candidate evacuation routes |
| `/api/v1/scenarios/compare` | GET | `Database` + `EvacuationWindowEngine` | Cross-scenario delta evaluation on common route |
| `/api/v1/validation/ladder` | GET | `validation_ladder.py` | 5-level scientific verification and validation ladder |
| `/api/v1/scenarios/{id}/provenance` | GET | Scenario Manifest + HDF5 SHA-256 | Artifact integrity and parameter provenance |
| `/health/live`, `/health/ready` | GET | Process / In-Memory State | Process liveness and dependency readiness checks |

---

## SECTION E: HYDRAULIC PIPELINE AUDIT

- **Positive Findings:**
  - HDF5 files are accessed strictly in read-only mode (`h5py.File(..., 'r')`).
  - Depths are explicitly derived from $WSE - Z_{min}$, never fabricated.
  - SHA-256 checksums are calculated in 8MB chunks without loading entire files into memory.
  - Native unit detection supports US Customary feet-to-meter conversion ($0.3048$).
- **Deficiencies Identified:**
  - `POST /scenarios` contained a legacy heuristic scaling equation multiplying baseline arrivals by breach ratio, rather than consuming pre-computed or imported HEC-RAS artifacts.
  - Threshold extraction parameter is hardcoded to 0.30m in several places without exposing an authoritative configuration schema.

---

## SECTION F: SCENARIO PIPELINE AUDIT

- **Positive Findings:**
  - Scenarios support scoped GIS datasets via `ScenarioContext` (e.g., Bald Eagle Creek does not inherit Tehri roads).
  - Standard scenarios include MINIMUM, CENTRAL, MAXIMUM, plus synthetic regression worlds `TEST_ALPHA` and `TEST_BETA`.
- **Deficiencies Identified:**
  - Dynamic importation of new prepared HEC-RAS HDF5 files lacked a dedicated validation endpoint (`POST /scenarios/import`) with strict schema inspection.

---

## SECTION G: ROAD-COUPLING PIPELINE AUDIT

- **Positive Findings:**
  - Coupling uses projected planar coordinates (EPSG:32644) and KD-Tree spatial indexing.
  - LineStrings are densified at $\le 50$m intervals, and cell centers are filtered by perpendicular distance to avoid corner-skipping.
- **Deficiencies Identified:**
  - If a road segment falls outside the hydraulic mesh, it is marked `HIGH_GROUND_UNAFFECTED` with arrival 99999. While practical, this needs explicit semantic tagging to distinguish true high ground from spatial boundary cutoff.

---

## SECTION H: EWE PIPELINE AUDIT

- **Positive Findings:**
  - EWE implements the exact formula $D_{deadline} = \min_i (A_i - T_i - B)$.
  - Limiting segment $e^*$ is strictly identified as $\arg\min_i (A_i - T_i - B)$.
  - Feasibility status respects configured safety buffer ($B$) and vehicle thresholds ($h \ge 0.3$m, $v \ge 1.0$m/s).
- **Deficiencies Identified:**
  - Status strings in some schemas used `"DATA GAP"` with a space or `"LOW MARGIN"` without a strict Enum, allowing potential typing drift between frontend and backend.
  - Decision margin $M = D_{deadline} - D_{departure}$ was not always exposed as an explicit route-edge array for micro-explanation.

---

## SECTION I: FRONTEND STATE ARCHITECTURE

- **Positive Findings:**
  - Frontend views do NOT independently recalculate arrival, deadline, or limiting segment. All decision metrics are received from `/api/v1/routes/analyze`.
  - 3D SceneView renders realistic terrain, dam crest, and hydraulic mesh layers with elevation offsets.
- **Deficiencies Identified:**
  - Visual styling was heavily dependent on dark slate / charcoal palettes (`#0f172a`, `#1e293b`), whereas the operational mandate requires a calm, hydrological **Beige + Light Blue** command-center system.
  - Tokens were fragmented across individual CSS files and inline style literals rather than centralized in `tokens.css`.

---

## SECTION J: PERSISTENCE LAYER

- **Finding:** The prototype uses an in-memory repository (`Database` class) populated at startup from deterministic JSON manifests and HDF5 files.
- **Evaluation:** For an emergency decision-support research prototype where hydraulic runs are frozen artifacts, in-memory caching with filesystem backing is scientifically appropriate and avoids database state drift. However, mutable custom scenario dictionaries in memory must be protected against cross-request pollution.

---

## SECTION K: PROVENANCE LAYER

- **Positive Findings:**
  - Artifact SHA-256 hashes are computed directly from raw files.
  - Manifests track solver versions, terrain sources, and breach configurations.
- **Deficiencies Identified:**
  - Provenance was scattered across scenario endpoints and route responses. A dedicated `/api/v1/decisions/{id}/provenance` route was needed to answer "Why this decision?" with complete derivation parameters.

---

## SECTION L: VALIDATION LAYER

- **Positive Findings:**
  - 5-level validation ladder is implemented and preserved:
    - Level 1: Numerical reproducibility (deterministic float check).
    - Level 2: Hydraulic mesh and mass conservation check.
    - Level 3: Synthetic scenario testing (Ritter analytical & test worlds).
    - Level 4: Observational remote-sensing comparison (GEE Sentinel-1 SAR workflow).
    - Level 5: Physical field validation (explicitly tagged NOT_ESTABLISHED).
- **Deficiencies Identified:**
  - Clear separation between computational verification (Levels 1–3) and physical validation (Levels 4–5) must be strictly enforced in the UI.

---

## SECTION M: KNOWN TECHNICAL DEBT

1. Monolithic `backend/app/api/endpoints.py` (over 1000 lines) contains route definitions mixed with procedural formatting.
2. Inconsistent unit conversions scattered across route evaluations.
3. Scattered color hex codes in frontend components.

---

## SECTION N: SECURITY RISKS

1. File path traversal risk in custom artifact resolution (mitigated via `resolve_safe_path`, but requires strict allowlisting).
2. Missing file-size and MIME-type validation on arbitrary file ingestion.
3. CORS configuration must restrict origins in production deployments.

---

## SECTION O: SCIENTIFIC RISKS

1. **Uncertainty Confusion:** Users could mistake FEASIBLE for "GUARANTEED SAFE" without prominent disclaimers.
2. **Static Speed Assumption:** 50 km/h constant speed must be visibly qualified as a configured baseline assumption with no dynamic congestion model.
3. **Vertical Datum Status:** Tehri Copernicus DEM vertical datum is not field-survey referenced, and must remain explicitly marked `NOT_ESTABLISHED`.

---

## SECTION P: PERFORMANCE RISKS

1. Parsing multi-megabyte HDF5 files synchronously during startup adds 2–4 seconds of boot latency.
2. Spatial query on large road networks without bounding-box pre-filtering can scale quadratically with edge count.

---

## RANKED FINDINGS MATRIX

| ID | Priority | Subsystem | Finding | Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **F-01** | **P0** | Domain / Models | Enums not strictly enforced across domain boundaries; potential `"SAFE"` drift | Define strict `DecisionStatus`, `ValidationStatus`, `DataQualityStatus` enums in `models.py` |
| **F-02** | **P0** | Hydraulics / Ingestion | `POST /scenarios` used synthetic scaling instead of genuine artifact validation | Implement `POST /scenarios/import` with HDF5 structural inspection and fail-closed `DATA_GAP` |
| **F-03** | **P0** | Units | Unit conversions scattered across functions without dedicated utility | Create `backend/app/domain/units.py` with rigorous conversion functions and test suite |
| **F-04** | **P1** | Provenance | Missing dedicated `/api/v1/decisions/{id}/provenance` route | Implement `ProvenanceService` and dedicated endpoint linking decision to artifact hash |
| **F-05** | **P1** | Frontend / UI | Dark slate theme violates Beige + Light Blue design mandate | Create `tokens.css` with authoritative tokens; refactor shell, headers, panels, modals |
| **F-06** | **P1** | Decision UI | Limiting segment explanation lacked explicit margin calculation per edge | Expose edge-level margins and narrative explanation in decision response and UI |
| **F-07** | **P2** | GIS / CRS | CRS transform lacked bounds validation for invalid coordinates | Add coordinate bounds and geometry validity checks in `geo_transform.py` |
| **F-08** | **P2** | Architecture | Endpoint file excessively coupled to formatting logic | Extract domain services (`ProvenanceService`, `ScenarioImportService`, `HydraulicFieldService`) |
| **F-09** | **P3** | Telemetry | Missing structured log correlation IDs on decision requests | Add correlation ID tracking in request context |
