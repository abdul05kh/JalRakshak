# JalRakshak (जल रक्षक)

> **Dam-Break Inundation Modelling & Evacuation Window Decision Support**  
> *Developed for the Smart India Hackathon (SIH 2026) — Problem Statement ID: SIH26161*  
> *Organization: National Technical Research Organisation (NTRO) / Ministry of Education's Innovation Cell (MIC)*

JalRakshak processes hydrodynamic flood outputs, couples them with road networks, and converts flood arrival information into route-level evacuation windows and explainable operational decisions.

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-Vercel%20App-0284c7?style=for-the-badge&logo=vercel)](https://jal-rakshak-rho.vercel.app)
[![API Documentation](https://img.shields.io/badge/FastAPI-Swagger%20Docs-059669?style=for-the-badge&logo=fastapi)](https://jalrakshak-api.onrender.com/docs)
[![Automated Tests](https://img.shields.io/badge/Pytest-220%20Passed%2C%201%20Skipped-38bdf8?style=for-the-badge&logo=pytest)](backend/tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%200%20Errors-3178c6?style=for-the-badge&logo=typescript)](frontend/)
[![Evidence Hub](https://img.shields.io/badge/Evidence%20Hub-Audited%20Registers-amber?style=for-the-badge&logo=gitbook)](docs/evidence-hub/MASTER_EVIDENCE_HUB.md)
[![License](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

---

## 1. Overview

During major dam-break disasters or catastrophic reservoir release events, emergency agencies face immense operational pressure. Numerical hydrodynamic engines such as **USACE HEC-RAS 7.0.1** compute the complex physical propagation of 2D shallow water waves, generating millions of data points across irregular computational meshes.

However, in an active emergency operations center, emergency managers do not need raw water depths or visual animations alone—they need direct, reliable, and route-level evacuation directives:
- Which specific road links will submerge?
- Exactly how much time exists before the critical road bottleneck is cut off?
- When is the absolute latest moment a convoy or civilian cohort can safely depart?

**JalRakshak** is a specialized decision-support layer built directly on top of 2D hydrodynamic simulations. It ingests verified hydraulic outputs, couples them with projected road networks, and executes an authoritative mathematical formulation—the **Evacuation Window Engine (EWE)**—to determine route feasibility, latest feasible departure times, and governing bottleneck segments under declared operational assumptions.

> **"HEC-RAS models the flood physics. JalRakshak translates that hydraulic simulation into a route-level evacuation decision."**  
> *From hydraulic evidence to operational evacuation windows.*

---

## 2. The Operational Problem

Traditional hydraulic modeling outputs are designed for engineers and hydrologists:
- Water Surface Elevation ($\text{WSE}$) arrays
- Cell-level water depth ($h$)
- Face velocity vectors ($\mathbf{v}$)
- Contour flood extent boundaries

In contrast, an incident commander managing field evacuations must answer concrete logistics questions:
1. **Route Impact:** Which evacuation corridor remains clear, and which segments are threatened?
2. **Impact Timing:** Exactly when will floodwaters reach a threshold that halts vehicular transit?
3. **Transit Feasibility:** Can a convoy traversing the corridor at a given speed clear all segments before the flood wave arrives?
4. **Governing Bottleneck:** Which exact road link limits the departure deadline, and why?
5. **Scenario Sensitivity:** How does the departure deadline shift if the dam breach mode escalates from a partial failure to an extreme overtopping event?

> **"JalRakshak does not replace the hydraulic model. It operationalizes its output."**

---

## 3. What JalRakshak Does

JalRakshak implements a deterministic, multi-stage translation chain from physical simulation to operational decision:

```text
Input Datasets (GLO-30 DSM, Hydrology, Inflow Hydrographs)
  │
  ▼
Scenario Parameterization (Froehlich Breach Invert, Reservoir FRL)
  │
  ▼
HEC-RAS 2D Unsteady Hydraulic Simulation (External Hydrodynamic Solver)
  │
  ▼
Native HDF5 Telemetry Ingestion (WSE, Depth, Velocity, Arrival Timestamps)
  │
  ▼
Projected Road Coupling (150m Perpendicular Envelope, Densified LineStrings)
  │
  ▼
Evacuation Window Engine (EWE) (Deterministic Arrival - Travel - Buffer)
  │
  ▼
Operational Decision Directives (Latest Feasible Departure, Limiting Segment, Margins)
  │
  ▼
Interactive Delivery (ArcGIS 3D SceneView, OGC KML 2.2, RFC 7946 GeoJSON, Provenance Ledger)
```

The core mathematical operational output is:
$$\text{Leave-by Time} = \text{Flood Arrival} - \text{Travel Time} - \text{Safety Buffer}$$

Along with:
- **Limiting Segment:** The exact road link with the minimum available departure margin.
- **Route Status:** Evaluated as `FEASIBLE`, `LOW_MARGIN`, or `INFEASIBLE`.
- **Cross-Scenario Comparison:** Real-time delta tracking across breach scenarios.

---

## 4. Core Features

### A. Hydraulic Evidence Ingestion
- **Native HEC-RAS 2D HDF5 Ingestion:** Directly reads unstructured mesh geometry, face connectivity, and unsteady summary outputs from USACE HEC-RAS 7.0.1 plan artifacts (`.p01.hdf`, `.p02.hdf`, `.p03.hdf`).
- **Water Depth & Velocity Derivation:** Computes cell depth $h = \max(0, \text{WSE} - z_{\text{bed}})$ and tracks face velocity magnitudes.
- **Flood Arrival Extraction:** Chronologically scans the temporal series to determine arrival timestamp $A_i$ when depth meets or exceeds the critical road hazard threshold ($h \ge 0.30\,\text{m}$).
- **Scenario Comparison:** Compares hydraulic progression across lower-bound (Minimum), baseline (Central), and extreme (Maximum) breach plans.

### B. Geospatial & Road Network Intelligence
- **Projected Coordinate Processing:** Transforms geographic OpenStreetMap (OSM) coordinates into Metric Cartesian Space (**EPSG:32644 — UTM Zone 44N**) to ensure true Euclidean distance calculations without spherical distortion.
- **Road Centerline Densification:** Densifies road polylines at $\le 50\,\text{m}$ intervals to prevent discrete segments from skipping narrow valley crossings.
- **150m Perpendicular Coupling:** Employs spatial STRtree corridor indexing to associate road segments with adjacent hydraulic mesh cells, completely eliminating the false ridgeline associations inherent in legacy KD-tree radius lookups.
- **Per-Segment Exposure:** Records maximum depth, peak velocity, and earliest flood arrival for every individual edge along the route graph.

### C. Evacuation Decision Support
- **Deterministic Evacuation Window Engine (EWE):** Calculates latest departure deadlines without probabilistic approximation or uncalibrated machine learning heuristics.
- **Configured Travel Assumptions:** Evaluates transit duration at a declared configured speed (default: $50\,\text{km/h} = 13.89\,\text{m/s}$).
- **Configurable Safety Buffer:** Applies an explicit operational safety margin (default: $3.0\,\text{min} = 180\,\text{s}$).
- **Bottleneck Identification:** Mathematically pinpoints the single limiting road segment that forces the route closure.
- **Edge-Level Margin Tracking:** Provides segment-by-segment surplus time margins ($M_i$) to explain the exact operational bottleneck to decision-makers.

### D. Visualization & Interoperability
- **3D Command Dashboard:** Full-bleed WebGL 3D terrain canvas powered by ArcGIS Maps SDK SceneView with customizable elevation contours, hydraulic net layers, and route coloring.
- **Beige + Light Blue Command Palette:** Hydrologically intuitive, calm command-center aesthetic using centralized CSS tokens (`--jr-bg: #F4EFE6`, `--jr-blue-600: #3D8EAE`).
- **Standardized GIS Exports:** Instant export of compliant OGC KML 2.2 XML and RFC 7946 GeoJSON containing embedded hydraulic telemetry and departure margins.
- **Cryptographic Provenance:** Live SHA-256 artifact verification tracking simulation file lineage from disk to UI.

---

## 5. System Architecture

```text
                       INPUTS & TERRAIN DATA
    ┌────────────────────────────────────────────────────────┐
    │  Copernicus GLO-30 DSM (30m)  │  OpenStreetMap Roads   │
    │  THDC Tehri Dam Parameters    │  Inflow Hydrograph     │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                       HYDRAULIC SIMULATION
    ┌────────────────────────────────────────────────────────┐
    │  USACE HEC-RAS 7.0.1 (2D Unsteady Flow Solver)         │
    │  *Executed externally; JalRakshak ingests artifacts*   │
    └───────────────────────────┬────────────────────────────┘
                                │ (HDF5 Output Arrays)
                                ▼
                    JALRAKSHAK BACKEND (FastAPI)
    ┌────────────────────────────────────────────────────────┐
    │  Hydraulic Field Service (WSE, Depth, Arrival A_i)     │
    │  GeoTransform Service (WGS84 ↔ UTM Zone 44N Metric)   │
    │  Road Coupling Service (150m Envelope, STRtree Index)  │
    │  Evacuation Window Engine (D_i = A_i - T_i - B)        │
    │  Scenario Registry & Provenance Ledger (SHA-256)       │
    └───────────────────────────┬────────────────────────────┘
                                │ (REST API / GeoJSON / KML)
                                ▼
                   JALRAKSHAK FRONTEND (React 19)
    ┌────────────────────────────────────────────────────────┐
    │  ArcGIS SceneView 3D WebGL Visualization               │
    │  Operational Decision Console & Limiting Edge Drawer   │
    │  Cross-Scenario Comparative Analytics Matrix           │
    │  Cryptographic Artifact & Scientific Validation Hub    │
    └────────────────────────────────────────────────────────┘
```

> **Computational Execution Note:**  
> HEC-RAS is executed externally by hydraulic engineers; JalRakshak ingests the resulting binary HDF5 hydraulic artifacts. HEC-RAS is not executed inside the web browser or dynamically synthesized on the fly.

---

## 6. Evacuation Window Engine (EWE)

The Evacuation Window Engine (EWE) is a deterministic domain engine that enforces the temporal physics of route clearance against an advancing hydrodynamic surge wave.

### Mathematical Formulation

For an evacuation route $R$ composed of ordered directed edges $e_1, e_2, \dots, e_n$:

1. **Cumulative Traversal Time ($T_i$):**
   $$T_i = \sum_{k=1}^i \frac{L_k}{v_k}$$
   where $L_k$ is the metric length of edge $k$ (meters) and $v_k$ is the declared vehicle velocity (configured assumption: $50\,\text{km/h} = 13.89\,\text{m/s}$).

2. **Flood Wave Arrival Time ($A_i$):**
   $$A_i = \min \{ t \mid h(e_i, t) \ge h_{\text{crit}} \}$$
   where $h_{\text{crit}} = 0.30\,\text{m}$ represents the critical water depth for passenger vehicle impassability.

3. **Candidate Edge Departure Deadline ($D_i$):**
   $$D_i = A_i - T_i - B$$
   where $B$ is the declared operational safety buffer ($180\,\text{s} = 3.0\,\text{min}$).

4. **Authoritative Route Departure Deadline ($D_{\text{deadline}}$):**
   $$D_{\text{deadline}} = \min_{i \in \{1, \dots, n\}} (A_i - T_i - B)$$

5. **Governing Limiting Road Segment ($e_{\text{limiting}}$):**
   $$e_{\text{limiting}} = \arg\min_{i \in \{1, \dots, n\}} (A_i - T_i - B)$$

6. **Edge Decision Surplus Margin ($M_i$):**
   For departure at time $D$, the safety margin remaining at segment $i$ upon vehicle arrival is:
   $$M_i(D) = A_i - (D + T_i + B)$$

### Deterministic Operational Statuses
- `FEASIBLE`: $D_{\text{deadline}} \ge 300\,\text{s}$ ($\ge 5\,\text{min}$ surplus margin). Route can be cleared under configured assumptions.
- `LOW_MARGIN`: $0\,\text{s} \le D_{\text{deadline}} < 300\,\text{s}$. Urgent departure required; vehicle arrival will closely precede floodwaters.
- `INFEASIBLE`: $D_{\text{deadline}} < 0\,\text{s}$. Inundation reaches at least one intermediate segment before a departing vehicle can reach it.
- `DATA_GAP`: Emitted strictly when hydraulic depth or road geometry data is missing. Fallback synthetic numbers are never substituted.
- `NO_FEASIBLE_ROUTE`: No path exists between origin and destination with positive departure margin.

> **Epistemic Discipline:**  
> The EWE is a deterministic decision transformation based on hydraulic inputs and declared parameters. It is **not** an independent physical safety model. **FEASIBLE does NOT mean GUARANTEED SAFE.** Dynamic traffic congestion, vehicle breakdowns, debris blockages, and wave-slamming forces are unmodelled.

---

## 7. Current Demonstration: Tehri Dam Study Case

The prototype's demonstrated reference implementation models the $30\,\text{km}$ downstream reach of the **Bhagirathi River canyon** below **Tehri Dam** (Uttarakhand, India) through **Koteshwar** to the **Chham** confluence.

### Prepared Breach Scenarios

| Scenario | Peak Discharge ($Q_p$) | Breach Formation Time | Limiting Segment | Flood Arrival ($A_i$) | Route Travel ($T$) | Safety Buffer ($B$) | Latest Feasible Departure ($D_{\text{deadline}}$) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MINIMUM** | $28,500\,\text{m}^3/\text{s}$ | 1.5 hours ($90\,\text{min}$) | `R02-E07` | $T+95:00$ ($5,700\,\text{s}$) | $12:39$ ($759\,\text{s}$) | $03:00$ ($180\,\text{s}$) | **$T+79:21$** ($4,761\,\text{s}$) | `FEASIBLE` |
| **CENTRAL** *(Ref)* | $65,000\,\text{m}^3/\text{s}$ | 1.0 hour ($60\,\text{min}$) | `R02-E07` | $T+60:00$ ($3,600\,\text{s}$) | $12:39$ ($759\,\text{s}$) | $03:00$ ($180\,\text{s}$) | **$T+44:21$** ($2,661\,\text{s}$) | `FEASIBLE` |
| **MAXIMUM** | $115,000\,\text{m}^3/\text{s}$ | 0.75 hours ($45\,\text{min}$) | `R02-E07` | $T+45:00$ ($2,700\,\text{s}$) | $12:39$ ($759\,\text{s}$) | $03:00$ ($180\,\text{s}$) | **$T+29:21$** ($1,761\,\text{s}$) | `FEASIBLE` |

### Documented Reference Route: Corridor R02 (Central Breach)
- **Origin:** Tehri Dam Crest Facility (`ORIG-01`)
- **Destination:** Chham High-Ground Evacuation Shelter (`SHELTER-02`)
- **Total Corridor Length:** $10.5\,\text{km}$ across 7 directed edges (`R02-E01` to `R02-E07`).
- **Limiting Segment:** **`R02-E07`** (Koteshwar Bypass Link).
- **Why R02-E07 Limits the Route:** Although water reaches upstream edges earlier, edge `R02-E07` requires $12\,\text{min}\,39\,\text{s}$ of transit to reach; water arrives at $T+60:00$, leaving the smallest surplus margin:
  $$D_{\text{deadline}} = 3600\,\text{s} - 759\,\text{s} - 180\,\text{s} = 2661\,\text{s} \equiv T+44:21$$

---

## 8. Remote Sensing & Satellite Observation

JalRakshak incorporates a **research-stage observational workflow** using Google Earth Engine (GEE) and European Space Agency (ESA) Sentinel-1 Synthetic Aperture Radar (SAR):

```text
Sentinel-1 GRD (C-Band) ──► Radiometric Calibration ──► Lee Speckle Filter ──► Backscatter Ratio ──► Dynamic Threshold ──► Candidate Water Mask
```

- **Workflow Implementation:** Located in `backend/app/integrations/gee/`.
- **Indexed Archive:** 969 Sentinel-1 SAR scenes are indexed for the study AOI (they do not form a single homogeneous time series).
- **Controlled Observation Case:** Pre-event (2024-07-25 00:44 UTC) vs Post-event (2024-08-06 00:44 UTC) for the Balganga valley cloudburst and flash flood.
- **Spatial Discrepancy Engine:** Computes geometric spatial agreement metrics (Intersection over Union, Precision, Recall, $F_1$) when compatible observed and simulated masks are provided:
  $$\text{IoU} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}} \cup M_{\text{obs}}|}, \quad F_1 = \frac{2 \cdot P \cdot R}{P + R}$$

> **Critical Remote Sensing Disclaimers:**  
> 1. Sentinel-1 SAR change detection detects reductions in surface radar backscatter caused by specular reflection.
> 2. Reductions can be triggered by open water, soil saturation, agricultural leveling, or radar terrain shadows in steep Himalayan relief.
> 3. Satellite-derived masks are **research-mode observational comparisons**, NOT calibrated ground truth for hydrodynamic solver validation.
> 4. Real-world flood events (e.g., Balganga July 2024) cannot be conflated with hypothetical structural dam failure simulations.

---

## 9. Multi-Model Extensibility

The software architecture is designed around solver independence via clean interface boundaries:

- **Currently Demonstrated & Implemented:** **USACE HEC-RAS 7.0.1 2D Unsteady**. Full end-to-end HDF5 mesh, depth, velocity, and arrival parsing.
- **Extension Interfaces Defined:**
  - **Delft3D Flexible Mesh:** `Delft3DAdapter` interface specification for netCDF-based unstructured D-Flow FM grids.
  - **DualSPHysics (SPH):** `SPHAdapter` interface specification for Smoothed Particle Hydrodynamics Lagrangian particle output.

> **Execution Boundary:**  
> The repository defines abstract adapter interfaces for additional hydrodynamic solvers; external solver execution of Delft3D or DualSPHysics is **not** part of the current demonstrated runtime workflow.

---

## 10. GIS Interoperability & Export Endpoints

JalRakshak exports all operational telemetry into industry-standard geospatial formats:

- **RFC 7946 GeoJSON:** Validated multi-layer FeatureCollections for inundation polygons, road hazard segments, and evacuation corridors.
- **OGC KML 2.2 XML:** Styled Keyhole Markup Language with embedded hydraulic telemetry, elevation tags, and departure margins.

### Active Production Endpoints
- `GET /api/v1/scenarios` — Enumerate active scenario manifests.
- `GET /api/v1/scenarios/{id}` — Retrieve hydraulic metadata, breach parameters, and peak discharges.
- `GET /api/v1/scenarios/{id}/export?layer={inundation|roads}&format={geojson|kml}` — Download standardized GIS layers.
- `GET /api/v1/scenarios/{id}/verify-provenance` — Verify SHA-256 disk hashes of ingested artifacts.
- `POST /api/v1/scenarios/import` — Ingest external prepared HEC-RAS 2D HDF5 plan files.
- `GET /api/v1/decisions/{decision_id}/provenance` — Retrieve cryptographic audit record for an evacuation decision.
- `POST /api/v1/routes/evaluate` — Authoritative EWE route evaluation and limiting segment extraction.
- `GET /health/live` & `GET /health/ready` — Production observability and liveness probes.

---

## 11. Data Sources & Specifications

| Data Layer | Source Entity | Technical Specification | Classification | Critical Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Topography / Elevation** | Copernicus DEM (GLO-30) | 30 m grid, EPSG:32644 (UTM 44N) | SOURCE-DERIVED | **Digital Surface Model (DSM)**; includes vegetation canopy and structural heights; not a bare-earth DTM. |
| **Dam & Hydrology** | THDC India / CWC NRLD | FRL 830 m, Crest 839.5 m, Gross Storage 3,540 MCM | SOURCE-DERIVED | Structural parameters documented from official records; breach invert (635 m) is an engineering assumption. |
| **Road Network** | OpenStreetMap (OSM) | Highway LineStrings densified at $\le 50\,\text{m}$ | SOURCE-DERIVED | Centerline vector geometries; sub-meter road crown elevation and bridge structural integrity are unmodeled. |
| **Hydraulic Telemetry** | USACE HEC-RAS 7.0.1 | 2D Unsteady SWE, flexible subgrid mesh | DERIVED | Numerical simulation output from uncalibrated hypothetical breach inflows. |
| **Satellite Radar** | ESA Sentinel-1 SAR | C-band GRD (10 m pixel spacing) | RESEARCH / PROXY | Surface specular reflection proxy; cloud-penetrating but subject to steep Himalayan radar terrain shadow. |

---

## 12. Verification & Validation (5-Tier Ladder)

JalRakshak maintains strict epistemic separation between software verification, analytical benchmarking, and physical validation:

```text
Level 1: Software & Numerical Reproducibility   ──► [PASS] 220 automated Pytest test suites passing
Level 2: Hydraulic Output & Mesh Consistency   ──► [PASS — SCOPED] Ritter 1D benchmark (R² = 0.994), Courant checks
Level 3: Independent Scenario Generalization    ──► [PASS — SCOPED] Scenario isolation on TEST_WORLD_ALPHA & BETA
Level 4: Observational Remote Sensing          ──► [PARTIAL / RESEARCH] Sentinel-1 SAR change detection
Level 5: Physical Field Validation             ──► [NOT ESTABLISHED] Tehri Dam has never breached in history
```

1. **Level 1 — Software Verification (`PASS`):**
   - **220 passed, 1 skipped** in release automated test suite (`pytest backend/tests`).
   - Strict unit tests for unit conversion utilities, coordinate transforms, and EWE mathematical invariants.
   - Frontend strict TypeScript compile passes with **0 errors**.
2. **Level 2 — Hydraulic Output & Mesh Consistency (`PASS — SCOPED`):**
   - Validated against the **Ritter 1D analytical dam-break benchmark** achieving $R^2 = 0.994$ against analytical water surface profiles.
   - Mesh checks enforce non-negative depths ($h \ge 0$), monotonic timesteps, and subgrid bathymetry bounds.
3. **Level 3 — Independent Scenario Generalization (`PASS — SCOPED`):**
   - Tested on synthetic test worlds (`TEST_WORLD_ALPHA`, `TEST_WORLD_BETA`) confirming zero hardcoded dependencies on Tehri coordinates.
4. **Level 4 — Remote Sensing Comparison (`PARTIAL / RESEARCH`):**
   - Multi-temporal Sentinel-1 SAR backscatter change detection evaluated on historical events.
5. **Level 5 — Physical Field Validation (`NOT ESTABLISHED`):**
   - Tehri Dam is an active, modern earth-and-rockfill dam completed in 2006. It has never experienced a breach. No empirical physical field measurements exist against which to calibrate catastrophic failure hydrodynamics. JalRakshak explicitly refuses to manufacture fake calibration data.

### Exploratory Human Pilot Testing (Gate 5B)
In preliminary exploratory testing ($N=2$), operator comprehension of evacuation windows was evaluated:
- **Decision Accuracy:** 100% (7/7 correct operational decisions per participant).
- **Time to Identify Feasibility:** Reduced from $53.4\,\text{s}$ (raw hydraulic view) to $12.7\,\text{s}$ (decision support view).
- **Time to Extract Deadline:** Reduced from $72.5\,\text{s}$ to $10.4\,\text{s}$.
- **Dangerous "FEASIBLE = SAFE" Interpretations:** 0/7 per participant.

---

## 13. Cryptographic Provenance (SHA-256)

Every operational decision generated by JalRakshak includes an immutable cryptographic record accessible via `GET /api/v1/decisions/{id}/provenance`:

```json
{
  "decision_id": "DEC-central_breach-R02-180s",
  "scenario_id": "central_breach",
  "route_id": "R02",
  "hydraulic_artifact": "Tehri_SmokeTest.p01.hdf",
  "artifact_sha256": "ab3db449d852b82ea7c8130997dc032e3c28d3b79463002d6f9f89d62462b0b0",
  "solver": "HEC-RAS 7.0.1",
  "terrain": "Copernicus GLO-30 DSM (30m)",
  "terrain_crs": "EPSG:32644",
  "vertical_datum_status": "NOT_ESTABLISHED",
  "travel_speed_assumption_kmh": 50.0,
  "safety_buffer_s": 180.0,
  "arrival_threshold_m": 0.30,
  "ewe_version": "2.0.0-hardened"
}
```

> **Cryptographic Boundary:**  
> SHA-256 hashes prove **exact bitwise file integrity** and non-tampering on disk. SHA-256 does **NOT** prove physical validity, hydrodynamic accuracy, or real-world calibration.

---

## 14. Assumptions & Known Limitations

To maintain scientific integrity, JalRakshak explicitly documents its operational boundaries:

1. **Demonstrated Study Area:** The current operational demonstration is scoped to the Bhagirathi River reach below Tehri Dam.
2. **Prepared Results Requirement:** Ingesting new rivers requires compatible pre-computed HEC-RAS 2D HDF5 plan files; arbitrary universal simulation meshing is not performed on the fly.
3. **Elevation Model Constraints:** Copernicus GLO-30 is a 30m Digital Surface Model (DSM). Forest canopy and valley structures can artificially elevate modeled ground elevations.
4. **Vertical Datum Status:** Geoid-to-ellipsoid vertical datum offset is uncalibrated between GLO-30 (EGM96) and local riverbed gauge levels (`NOT_ESTABLISHED`).
5. **Static Vehicle Velocity Assumption:** Evacuation travel times assume an unhindered configured speed ($50\,\text{km/h}$). Multi-agent traffic gridlock, panic braking, and debris blockages are unmodeled.
6. **Configured Safety Buffer:** The 3-minute buffer is an operational parameter, not an empirically validated human behavioral buffer.
7. **Hazard Criterion:** The $h \ge 0.30\,\text{m}$ hazard threshold represents passenger car stalling; it is a configurable setting, not a universal regulatory standard.
8. **Adapter Interfaces:** Delft3D FM and DualSPHysics SPH are structured as adapter interfaces; solver execution is not bundled.
9. **Exposure Framework:** Exposure calculations reflect spatial overlays of inundation with OpenStreetMap infrastructure, not structural building collapse models.
10. **Physical Field Validation:** Dam-break failure hydrodynamics for Tehri Dam remain physically uncalibrated (`NOT_ESTABLISHED`).

---

## 15. Generalization Boundary

The software architecture is scenario-driven and has been tested on independent synthetic worlds (`TEST_WORLD_ALPHA`, `TEST_WORLD_BETA`). This demonstrates **data-driven scenario isolation**, not universal arbitrary-river physical modeling.

### Supported Today
- Ingesting compatible prepared HEC-RAS 2D HDF5 simulation plan files.
- Transforming arbitrary projected road networks and executing STRtree corridor coupling.
- Computing deterministic departure deadlines, bottleneck segments, and margins via the EWE.
- Exporting standardized OGC KML and RFC 7946 GeoJSON layers.

### Not Supported / Future Work
- Automatic hydraulic model generation from raw GIS data for arbitrary rivers without external hydrologic calibration.
- Embedded runtime execution of heavy hydrodynamic solvers inside the application backend.
- Agent-based micro-traffic queue simulation.

---

## 16. Project Structure

```text
JalRakshak/
├── backend/                                   # Python 3.12 / FastAPI Backend
│   ├── app/
│   │   ├── api/                               # REST API Endpoints & Route Controllers
│   │   ├── domain/                            # Core Scientific Domain Logic
│   │   │   ├── ewe_engine.py                  # Evacuation Window Engine (EWE) Formulation
│   │   │   ├── geo_transform.py               # Metric EPSG:32644 Projections & Bounds Checking
│   │   │   ├── hydraulic_field_service.py     # HDF5 WSE, Depth & Arrival Extraction
│   │   │   ├── models.py                      # Strictly Typed Domain Enums & Schemas
│   │   │   ├── provenance_service.py          # Cryptographic SHA-256 Decision Records
│   │   │   ├── road_coupling.py               # 150m Perpendicular STRtree Spatial Coupling
│   │   │   ├── scenario_import_service.py     # Prepared HEC-RAS Ingestion Pipeline
│   │   │   └── units.py                       # Authoritative Bi-directional Unit System
│   │   └── integrations/                      # Satellite & External Adapter Boundaries
│   └── tests/                                 # 220 Automated Unit & Invariant Pytest Suites
│
├── frontend/                                  # React 19 / TypeScript / Vite Application
│   ├── src/
│   │   ├── components/                        # UI Components (Header, Decision HUD, Modals)
│   │   ├── map3d/                             # ArcGIS Maps SDK SceneView 3D WebGL Engine
│   │   ├── styles/tokens.css                  # Beige + Light Blue Command Center CSS Tokens
│   │   ├── tokens/operational_colors.ts       # Hydrological Design System Constants
│   │   └── views/                             # Primary Command Views
│   │       ├── EvacuationDecisionView.tsx     # Authoritative Decision Console & Proof Breakdown
│   │       ├── OperationalMapView.tsx         # Full-Screen 3D Command Map
│   │       ├── RoadImpactView.tsx             # Road Topology & Edge Traversal Table
│   │       ├── ScienceValidationView.tsx      # 5-Level Validation Ladder & Ritter Benchmark
│   │       ├── ProvenanceView.tsx             # Cryptographic Provenance Ledger
│   │       └── FloodSimulationView.tsx        # Isolated Presentation / Cinematic Mode
│   └── package.json
│
├── docs/                                      # Engineering & Architecture Documentation
│   ├── ARCHITECTURE_AUDIT.md                  # Comprehensive P0-P3 Architecture Audit
│   ├── FINAL_ARCHITECTURE_HARDENING_REPORT.md # 25-Question Reviewer Defense & Certification
│   └── evidence-hub/                          # Dedicated Evidence Hub Branch Structure
│       ├── MASTER_EVIDENCE_HUB.md             # Comprehensive Technical Manual
│       ├── evidence-register/                 # Source & Claim CSV Registers + Checksums
│       ├── source-data/                       # Terrain, Hydrology & Satellite Reports
│       ├── hydraulic/                         # HEC-RAS Execution Provenance & Scenario Cards
│       └── validation/                        # Multi-Level Validation Reports & Human Pilot
│
├── data/                                      # Scenario Fixtures, Road GeoJSON & Mesh Files
└── config/                                    # System & Projection Configuration
```

---

## 17. Local Installation & Quickstart

### Prerequisites
- **Python:** 3.10+ (Recommended: Python 3.12)
- **Node.js:** 18+ and npm 9+
- **Git:** 2.30+

### 1. Backend Setup (FastAPI)
```bash
# Clone the repository
git clone https://github.com/abdul05kh/JalRakshak.git
cd JalRakshak

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server (Port 8000)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite + TypeScript)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173)
npm run dev
```
Interactive Console will be live at: `http://localhost:5173`

### 3. Run Automated Tests & Production Build
```bash
# Run backend test suite (220 passed, 1 skipped)
python -m pytest backend/tests -v

# Run golden scenario regression test
python -m pytest backend/tests/test_golden_scenario.py -v

# Run frontend production build (TypeScript strict check)
cd frontend
npm run build
```

---

## 18. Live Demonstrations & Endpoints

- **Interactive 3D Web Prototype:** [jal-rakshak-rho.vercel.app](https://jal-rakshak-rho.vercel.app)
- **Production API Documentation:** [jalrakshak-api.onrender.com/docs](https://jalrakshak-api.onrender.com/docs)
- **Primary Source Code:** [github.com/abdul05kh/JalRakshak](https://github.com/abdul05kh/JalRakshak)

---

## 19. Technical Evidence Hub

A dedicated review branch and document suite provide full cryptographic and scientific traceability:

- **Branch:** [`docs/jalrakshak-evidence-hub`](https://github.com/abdul05kh/JalRakshak/tree/docs/jalrakshak-evidence-hub)
- **Master Manual:** [docs/evidence-hub/MASTER_EVIDENCE_HUB.md](docs/evidence-hub/MASTER_EVIDENCE_HUB.md)
- **Evidence Registers:** [docs/evidence-hub/evidence-register/README.md](docs/evidence-hub/evidence-register/README.md)
  - Primary Sources: [`SOURCE_REGISTER.csv`](docs/evidence-hub/evidence-register/SOURCE_REGISTER.csv)
  - Claim Rules: [`CLAIM_MATRIX.csv`](docs/evidence-hub/evidence-register/CLAIM_MATRIX.csv)
  - Checksum Manifest: [`MANIFEST_SHA256.json`](docs/evidence-hub/evidence-register/MANIFEST_SHA256.json)
- **Reviewer Defense & Attack Test:** [docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md](docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md)

---

## 20. Engineering Roadmap

### Near-Term
- **Automated Bathymetric Conditioning:** Integrating high-resolution airborne LiDAR or drone photogrammetry where local disaster management authorities provide sub-channel cross-sections.
- **Dynamic Road-Passability Curves:** Incorporating variable vehicle-height classes (emergency trucks vs ambulances vs passenger sedans) into threshold extraction.
- **Expanded Observational Matching:** Refining automated Sentinel-1 SAR change detection co-registration algorithms.

### Long-Term
- **Agent-Based Traffic Coupling:** Coupling EWE departure deadlines with micro-traffic simulation (MATSim / SUMO) to model dynamic vehicle queue buildup and road choking.
- **Embedded Solver Orchestration:** Cloud container orchestration pipelines for on-demand 2D hydrodynamic simulation runs.
- **Field Telemetry Assimilation:** Direct integration with Central Water Commission (CWC) and India Meteorological Department (IMD) automated river gauge networks.

---

## 21. Research & Operational Safety Statement

> **Notice to Emergency Management Authorities:**  
> JalRakshak is a **decision-support research prototype** developed for scenario-based flood analysis and evacuation timing support. Operational field deployment requires officially calibrated hydrodynamic models, authoritative vertical datum reconciliation, locally approved road-hazard criteria, real-time road condition verification, and appropriate command oversight from designated disaster management authorities.

---

## 22. Team JalRakshak

*Smart India Hackathon (SIH 2026)*

| Team Member | Role / Domain | GitHub Profile | Contact | Core Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Mohammad Abdul Kalam Hussain** | Team Lead / ML Engineer | [@abdul05kh](https://github.com/abdul05kh) | `abdul05kh.college@gmail.com` | System architecture, EWE mathematical formulation, HEC-RAS 2D unsteady integration, end-to-end pipeline coordination. |
| **Siri Chandana** | Hydrodynamic / GIS Specialist | [@kotagirisirichandana](https://github.com/kotagirisirichandana) | `kotagirisirichandana73@gmail.com` | Hydrodynamic boundary conditions, GLO-30 terrain conditioning, geospatial coordinate projection, inundation mesh modeling. |
| **Mohammad Zakiruddin** | Frontend Developer | [@zakirverse](https://github.com/zakirverse) | `zakirmd.1805@gmail.com` | React + Vite UI architecture, ArcGIS Maps SDK 3D SceneView integration, interactive hydraulic controllers, responsive dashboard. |
| **Mohammed Numan** | AI Engineer | [@mohammednumaan716](https://github.com/mohammednumaan716) | `mohammednumaan901@gmail.com` | Intelligent routing analysis, surrogate model research, automated parameter optimization, decision logic validation. |
| **Manivarun Chintala** | Data Infrastructure / Backend Developer | [@manivarun-05](https://github.com/manivarun-05) | `manivarunchintala2005.2728@gmail.com` | FastAPI REST endpoints, multi-scenario spatial indexing, KD-Tree road-hydraulic mapping pipeline, cloud deployment. |
| **Thaniska** | QA & Verification Lead | [@thanishkaX](https://github.com/thanishkaX) | `ramatenkithanishka@gmail.com` | Pytest test suite, mathematical edge case validation, scenario isolation verification, end-to-end acceptance testing. |

---

## 23. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
