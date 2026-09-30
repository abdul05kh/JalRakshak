# JalRakshak (जल रक्षक)

> **Dam Break Inundation Modelling & Evacuation Window Decision Support System**  
> *Developed for the Smart India Hackathon 2026 — Problem Statement ID: SIH26161*  
> *Organization: National Technical Research Organisation (NTRO) / Ministry of Education's Innovation Cell (MIC)*

[![Live Web Prototype](https://img.shields.io/badge/Live%20Prototype-JalRakshak%20App-0284c7?style=for-the-badge&logo=react)](https://jalrakshak-frontend.onrender.com)
[![API Documentation](https://img.shields.io/badge/FastAPI-Swagger%20Docs-059669?style=for-the-badge&logo=fastapi)](https://jalrakshak-api.onrender.com/docs)
[![Automated Tests](https://img.shields.io/badge/Pytest-193%20Passed-38bdf8?style=for-the-badge&logo=pytest)](docs/POST_SUBMISSION_UPDATE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%200%20Errors-3178c6?style=for-the-badge&logo=typescript)](frontend/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

---

## ⚠️ Post-Submission Technical Update

> **Important clarification for reviewers & jury:**  
> The PPT and prototype submitted during the original Smart India Hackathon submission represent our **initial interpretation** of SIH26161.
>
> After submission, we performed a deeper technical analysis of the official problem statement and identified that our initial interpretation did not fully capture its breadth.
>
> **We acknowledge this gap.**
>
> Rather than leaving the prototype at the submitted state, we revisited the problem statement and substantially improved JalRakshak. The current repository therefore contains functionality, architecture, and research capabilities that were not represented in the submitted PPT.
>
> **The submitted PPT has not been retroactively changed.** This repository and its documentation record the technical development that followed.
>
> **Important: This is a post-submission technical update. It does not constitute a revised SIH submission. The submitted PPT remains unchanged; this repository documents technical development undertaken after submission.**

---

### Current Prototype Status
`DEMO-READY RESEARCH PROTOTYPE`  
*(Not a production system; not a fully physically validated operational flood-warning system)*

---

## 1. What We Initially Got Wrong

Our initial interpretation placed too much emphasis on localized dam-break hydrodynamics, 3D visualization, and evacuation decision support for a single study area.

During subsequent technical analysis, the broader scope of SIH26161 became clear:
* **Multi-Dataset Ingestion:** Ingesting global DEMs, hydrological boundary series, and multi-temporal remote sensing.
* **Satellite / Google Earth Engine (GEE):** Near-real-time satellite observation, SAR water extraction, and observational flood tracking.
* **Multi-Model Support:** Interoperability with diverse hydrodynamic formulations including 2D shallow water solvers (HEC-RAS), Flexible Mesh (Delft3D FM), and Smoothed Particle Hydrodynamics (SPH).
* **Interoperability & Generalization:** Standardized OGC KML / RFC 7946 GeoJSON GIS exports and data-driven scenario architecture.

We recognized this gap after submission. Rather than defending the original narrower interpretation, we corrected our technical direction and reworked the prototype.

---

## 2. What Changed After Submission?

| Engineering Domain | Initial Submission (Earlier Stage) | Current Prototype (Post-Submission Advancement) | Evidence & Code Reference |
| :--- | :--- | :--- | :--- |
| **Problem Scope** | Dam-break 3D visualization & routing concept | Generalized hydrodynamic & remote sensing framework | [`docs/POST_SUBMISSION_UPDATE.md`](docs/POST_SUBMISSION_UPDATE.md) |
| **Hydrodynamic Pipeline** | Procedural / localized flood propagation | Native HEC-RAS 2D unsteady flow HDF5 ingestion across 3 breach plans ($28.5\text{k}, 65\text{k}, 115\text{k m}^3/\text{s}$) | [`backend/app/domain/hecras_reader.py`](backend/app/domain/hecras_reader.py) |
| **Decision Engine** | Basic route clearance concept | Deterministic Evacuation Window Engine (EWE) solving $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ | [`backend/app/domain/decision.py`](backend/app/domain/decision.py) |
| **Road-Hydraulic Coupling** | Simple 2D point overlay | Projected coordinate transformation (UTM 44N to WGS84) + 150m corridor search + segment densification | [`backend/app/domain/gis.py`](backend/app/domain/gis.py) |
| **Satellite / GEE** | Limited / absent | Multi-temporal Sentinel-1 SAR change detection research workflow; spatial discrepancy comparator | [`backend/app/integrations/gee/`](backend/app/integrations/gee/) |
| **Multi-Model Support** | Single model assumption | Unified `HydraulicModelAdapter` interface (HEC-RAS, Delft3D FM, DualSPHysics SPH) | [`backend/app/domain/hydraulic_adapters/`](backend/app/domain/hydraulic_adapters/) |
| **GIS Interoperability** | No export capabilities | OGC KML 2.2 XML and RFC 7946 GeoJSON export endpoints with hydraulic telemetry | [`backend/app/domain/exporter.py`](backend/app/domain/exporter.py) |
| **Scenario Isolation** | Hardcoded Tehri coordinate assumptions | Scenario isolation and data-driven loading verified on independent synthetic test worlds (`TEST_ALPHA`, `TEST_BETA`) | [`backend/tests/test_scenario_generalization.py`](backend/tests/test_scenario_generalization.py) |
| **Data Lineage & Provenance** | Unverified claims | Live SHA-256 physical file hashing with deterministic verification | [`backend/app/domain/provenance.py`](backend/app/domain/provenance.py) |
| **Software Verification** | Early manual tests | 193 automated Pytest test suites passing in release environment | [`backend/tests/`](backend/tests/) |

---

## 3. Core Product Story: From Hydraulic Physics to Evacuation Decisions

When severe breach or high-volume spillway release occurs at a major dam, 2D hydrodynamic solvers compute large meshes of depths ($h$), water surface elevations ($WSE$), and velocities ($\mathbf{v}$). 

Emergency commanders and district disaster managers need direct operational clarity during a crisis:

1. **WHERE:** Which downstream communities and road corridors are in the flood wave's trajectory?
2. **WHEN:** At what exact minute does the flood wave reach each critical road segment?
3. **WHAT:** What is the absolute latest departure deadline before an evacuation corridor is cut off?
4. **WHY:** Which exact road segment is the governing bottleneck and what hydraulic conditions dictate that deadline?

> **HEC-RAS models the flood physics. JalRakshak translates that hydraulic simulation into an actionable, deterministic evacuation decision.**

---

## 4. Why JalRakshak Matters

We chose not to leave the repository aligned solely with our earlier submission presentation. The technically responsible approach is to document how our understanding of SIH26161 evolved and provide concrete software and scientific evidence of that advancement.

This repository serves both as:
1. **The current JalRakshak decision-support prototype**, and
2. **A transparent record of post-submission technical development.**

---

## 5. System Architecture

```
                       INPUTS & SENSORS
    ┌────────────────────────────────────────────────────────┐
    │  DEM / DSM  │  Hydrology Series  │  Breach Parameters  │
    │  (GLO-30)   │  (Inflow Hydrog.)  │  (Width/Time/Qp)    │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                       HYDRODYNAMIC SOLVERS
    ┌────────────────────────────────────────────────────────┐
    │  HEC-RAS 2D Unsteady      │  Delft3D Flexible Mesh     │
    │  (Native Ingestion)       │  (Adapter Interface)       │
    │                           │  DualSPHysics SPH          │
    │                           │  (Adapter Interface)       │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                       HYDRAULIC RESULTS
    ┌────────────────────────────────────────────────────────┐
    │  Water Depth (h)          │  Velocity Magnitude (v)    │
    │  Water Surface Elev (WSE) │  Wave Arrival Time (t_arr) │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                       GEOSPATIAL COUPLING
    ┌────────────────────────────────────────────────────────┐
    │  Road Network Densification (UTM 44N ↔ WGS84)          │
    │  150m Perpendicular Search Corridor                    │
    │  Per-Segment Hydraulic Arrival Extraction (A_i)        │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                   EVACUATION DECISION ENGINE
    ┌────────────────────────────────────────────────────────┐
    │  Deterministic Evacuation Window Engine (EWE)          │
    │  D_i = A_i - T_i - B                                   │
    │  D_deadline = min_i(D_i)                               │
    │  Governing Limiting Segment: argmin_i(D_i)             │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
                       OPERATIONAL OUTPUTS
    ┌────────────────────────────────────────────────────────┐
    │  3D ArcGIS SceneView  │  OGC KML 2.2 / GeoJSON Exports │
    │  Departure Timers     │  SHA-256 Provenance Audit Log  │
    └────────────────────────────────────────────────────────┘
```

---

## 6. Native HEC-RAS 2D Hydrodynamic Pipeline

JalRakshak ingests 2D unsteady shallow water equation solutions generated via **USACE HEC-RAS**:
* **Artifact Schema:** Native HDF5 plan files (`.p01.hdf`, `.p02.hdf`, `.p03.hdf`).
* **Mesh Coverage:** 740+ cell center coordinates, face point connectivity, and bathymetric bed elevations ($z_{\text{bed}}$).
* **Ingested Variables:**
  * Water Surface Elevation: $\text{WSE}(x, y, t)$
  * Water Depth: $h(x, y, t) = \max(0, \text{WSE}(x, y, t) - z_{\text{bed}})$
  * Face Velocity Magnitude: $v(x, y, t)$ (m/s)
  * Inundation Arrival Timestamp: $t_{\text{arr}} = \min \{ t \mid h(x,y,t) \ge 0.30\,\text{m} \}$
* **Breach Scenarios:**
  * `SCENARIO_CENTRAL`: $Q_p = 65,000\,\text{m}^3/\text{s}$ (Central breach baseline)
  * `SCENARIO_MINIMUM`: $Q_p = 28,500\,\text{m}^3/\text{s}$ (Lower-bound partial breach)
  * `SCENARIO_MAXIMUM`: $Q_p = 115,000\,\text{m}^3/\text{s}$ (Upper-bound extreme overtopping failure)

---

## 7. Satellite Observation / Google Earth Engine Pipeline

```
Sentinel-1 GRD (IW) ──► Radiometric Calibration ──► Lee Speckle Filter ──► Backscatter Ratio ──► Dynamic Threshold ──► Candidate Flood Mask
```

* **Observation Workflow:** Developed under `backend/app/integrations/gee/` utilizing Google Earth Engine and Sentinel-1 C-band Synthetic Aperture Radar (SAR) ground range detected (GRD) imagery.
* **Scene Indexing:** 969 Sentinel-1 scenes were indexed for the configured AOI/query (they do not all form a continuous homogeneous time series).
* **Controlled Observation Example:** Pre-event (2024-07-25 00:44 UTC) vs Post-event (2024-08-06 00:44 UTC) for the Balganga valley flood event.
* **Spatial Comparison Engine:** Spatial-comparison metrics including IoU, precision, recall, and F1 can be computed when compatible simulated and observed extents are supplied:
  $$\text{IoU} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}} \cup M_{\text{obs}}|}, \quad \text{Precision} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}}|}, \quad \text{Recall} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{obs}}|}, \quad F_1 = 2 \cdot \frac{P \cdot R}{P + R}$$
  These metrics quantify geometric agreement under the specified comparison inputs; they do not by themselves establish physical validation.

### Critical Remote Sensing Disclaimers
* Sentinel-1 SAR change detection detects surface roughness/specular reflection change.
* SAR backscatter reduction can result from open water, soil moisture, vegetation changes, or mountain radar shadows.
* **Therefore:** Satellite-derived candidate masks are **research-mode observational layers**, NOT ground truth for hydrodynamic calibration.
* Historical flood events cannot be conflated with hypothetical dam breach runs unless conditions are scientifically comparable.

---

## 8. Evacuation Window Engine (EWE) Formulation

For an evacuation route comprising ordered road segments $e_1, e_2, \dots, e_n$:

1. **Cumulative Traversal Time ($T_i$):**
   $$T_i = \sum_{k=1}^i \frac{L_k}{v_k}$$
   where $L_k$ is segment length (m) and $v_k$ is vehicle speed (default: $50\,\text{km/h} = 13.89\,\text{m/s}$).

2. **Flood Wave Arrival Time ($A_i$):**
   $$A_i = \min \{ t \mid h(e_i, t) \ge 0.30\,\text{m} \lor v(e_i, t) \ge 1.0\,\text{m/s} \}$$

3. **Latest Feasible Departure ($D_{\text{deadline}}$):**
   $$D_{\text{deadline}} = \min_{i \in \{1, \dots, n\}} (A_i - T_i - B)$$
   where $B$ is the configured safety buffer (default: $3.0\,\text{min} = 180\,\text{s}$).

4. **Governing Limiting Road Segment:**
   $$e_{\text{limiting}} = \arg\min_{i \in \{1, \dots, n\}} (A_i - T_i - B)$$

*Scientific Qualification:* The EWE transforms hydraulic arrival information and configured route assumptions into a deterministic departure window. It is not an independent physical safety model and dynamic traffic congestion is unmodelled.

### Deterministic Operational Classifications
* `FEASIBLE`: $D_{\text{deadline}} \ge 300\,\text{s}$ ($\ge 5\text{ minutes}$ margin).
* `LOW MARGIN`: $0\,\text{s} \le D_{\text{deadline}} < 300\,\text{s}$ (Immediate departure required).
* `INFEASIBLE`: $D_{\text{deadline}} < 0\,\text{s}$ (Route cut off prior to full clearance).
* `DATA GAP`: Generated strictly when hydraulic or road data is missing. Never populated with synthetic fallback numbers.

---

## 9. Projected Road-Hydraulic Coupling

* **Spatial Transformation:** Reprojects OpenStreetMap WGS84 geometries to UTM Zone 44N (EPSG:32644) for accurate metric distance calculations.
* **Line Densification:** Road polylines are densified at $50\,\text{m}$ intervals to prevent coarse segments from skipping localized flood channel crossings.
* **Corridor Search:** A $150\,\text{m}$ perpendicular corridor KD-tree search associates each road segment with the nearest hydraulic mesh cells.

---

## 10. Generalized Scenario Architecture

* Scenario isolation and data-driven loading were verified on independent synthetic test worlds (`TEST_ALPHA`, `TEST_BETA`) in automated CI suites.
* All routes, shelters, origins, and hydraulic grids are loaded dynamically through standardized scenario schemas.
* *Note:* While the architecture supports data-driven scenario ingestion, arbitrary real-time native HEC-RAS solver mesh creation on novel rivers requires external compute.

---

## 11. Software Verification vs Scientific Validation

| Verification Dimension | Scope & Methodology | Evidence & Status |
| :--- | :--- | :--- |
| **Software Verification** | Automated Pytest test suites covering domain math, API contracts, GIS projection, EWE edge cases, and CORS. | **193 Passed, 1 Skipped** in release environment. |
| **Scientific Evidence** | Verification that hydraulic depth, velocity, and arrival fields are extracted from native HEC-RAS 2D HDF5 tables. | **Verified** against USACE HEC-RAS plan artifacts. |
| **Physical Model Calibration** | Calibration of breach parameters against historical dam failure field data. | **NOT_ESTABLISHED** (Tehri Dam has no historical failure). |
| **Operational Validation** | Human-in-the-loop testing with emergency response workflows. | **Exploratory prototype validation**. |

---

## 12. Cryptographic Artifact Provenance (SHA-256)

JalRakshak verifies the physical integrity of every ingested hydraulic dataset via live SHA-256 disk hashing:
* **Integrity Guarantee:** Proves that disk artifacts have not been modified, corrupted, or procedurally faked.
* **Scientific Reality:** SHA-256 proves **data integrity**, NOT hydraulic accuracy, mesh physical realism, or solver correctness.

---

## 13. Standardized GIS Interoperability (KML & GeoJSON)

* **RFC 7946 GeoJSON:** Validated multi-layer FeatureCollections for inundation polygons, road impacts, and evacuation corridors.
* **OGC KML 2.2 XML:** Styled Keyhole Markup Language with embedded hydraulic telemetry, elevation tags, and departure margins.
* **API Endpoints:**
  * `GET /api/v1/scenarios/{id}/export?layer=inundation&format=geojson|kml`
  * `GET /api/v1/scenarios/{id}/export?layer=roads&format=geojson|kml`
  * `GET /api/v1/scenarios/{id}/verify-provenance`

---

## 14. Known Limitations & Assumptions

1. **Demonstration Study Area:** Current demonstrated scenarios are specific to Tehri Dam on the Bhagirathi River.
2. **Elevation Data:** Copernicus GLO-30 is a 30m Digital Surface Model (DSM) that includes canopy and structural heights.
3. **Vertical Datum:** Geoid-to-ellipsoid vertical datum offset is uncalibrated between GLO-30 (EGM96) and local riverbed gauge levels.
4. **Traffic Dynamics:** Static vehicle speed ($50\,\text{km/h}$) is assumed. Multi-agent congestion, road blockages, and vehicle breakdowns are unmodelled.
5. **Multi-Model Solvers:** Delft3D FM and DualSPHysics SPH are structured as adapter interfaces; external solver execution is not included in the current demonstration environment.
6. **Damage Assessment:** Exposure assessment framework identifies exposed infrastructure; damage estimation requires calibrated cadastral survey inputs.
7. **Near-Real-Time Operation:** GEE/Sentinel-1 observation is currently a research-stage workflow. Live automated acquisition and end-to-end near-real-time processing remain configuration dependent.

---

## 15. SIH26161 Requirement Coverage Matrix

| SIH26161 Requirement | Implementation Status | Current Technical State |
| :--- | :--- | :--- |
| **Dam Break / Water Release Modeling** | `IMPLEMENTED` | Native HEC-RAS 2D unsteady flow HDF5 ingestion across 3 breach plans ($28.5\text{k}, 65\text{k}, 115\text{k m}^3/\text{s}$). |
| **Downstream Inundation Estimation** | `IMPLEMENTED` | Spatiotemporal flood depths, velocities, and arrival timestamps across 740+ mesh cells. |
| **Hydrologic Data & DEM Ingestion** | `IMPLEMENTED` | Ingestion of Copernicus GLO-30 DEM and inflow hydrographs. |
| **Satellite Imagery & GEE** | `RESEARCH / PARTIAL` | Multi-temporal Sentinel-1 SAR change detection pipeline and GEE spatial discrepancy comparator. Live automated pipeline is configuration dependent. |
| **Scenario Generation & Comparison** | `IMPLEMENTED` | Central, Minimum, and Maximum breach plan comparison with cross-scenario delta analytics. |
| **Dashboard & 3D Visualization** | `IMPLEMENTED` | React + Vite + TypeScript + ArcGIS Maps SDK 3D SceneView with interactive timeline. |
| **Standard GIS Outputs (KML/GeoJSON)** | `IMPLEMENTED` | OGC KML 2.2 and RFC 7946 GeoJSON export endpoints. |
| **SPH / Delft3D Solvers** | `INTERFACE` | Unified `HydraulicModelAdapter` interface specification; external solver execution is not included in current demo environment. |
| **Near-Real-Time Flood Analysis** | `PARTIAL / RESEARCH` | Rapid EWE calculation on pre-computed scenarios; live automated solver meshing and GEE ingestion remain configuration dependent. |
| **Indian River / Dam Demonstration** | `IMPLEMENTED` | Demonstrated on Tehri Dam (Bhagirathi River, Uttarakhand). |

---

## 16. Local Installation & Quickstart

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm 9+

### Backend Setup (FastAPI)
```bash
# Clone the repository
git clone https://github.com/abdul05kh/JalRakshak.git
cd JalRakshak

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (React + Vite + TypeScript)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Run Automated Tests & Build Verification
```bash
# Backend test suite (193 tests)
python -m pytest backend/tests -v

# Frontend build verification (TypeScript strict check)
cd frontend && npm run build
```

---

## 17. Scientific & Standard References

1. **USACE (2023):** *HEC-RAS River Analysis System, 2D Hydrodynamic Modeling User's Manual*, US Army Corps of Engineers.
2. **European Space Agency (ESA):** *Sentinel-1 SAR User Guide & Radiometric Terrain Correction*.
3. **OGC (2008):** *OpenGIS KML 2.2 Encoding Standard*, Open Geospatial Consortium (OGC 07-147r2).
4. **IETF (2016):** *The GeoJSON Format*, RFC 7946.
5. **Central Water Commission (CWC):** *Guidelines for Mapping Dam Break Inundation and Emergency Action Plans*.

---

## 18. Team JalRakshak

*Developed for the Smart India Hackathon (SIH 2026)*

| Team Member | Role / Domain | GitHub Profile | Contact | Core Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Mohammad Abdul Kalam Hussain** | Team Lead / ML Engineer | [@abdul05kh](https://github.com/abdul05kh) | `abdul05kh.college@gmail.com` | System architecture, EWE mathematical formulation, HEC-RAS 2D unsteady integration, end-to-end pipeline coordination. |
| **Siri Chandana** | Hydrodynamic / GIS Specialist | [@kotagirisirichandana](https://github.com/kotagirisirichandana) | `kotagirisirichandana73@gmail.com` | Hydrodynamic boundary conditions, GLO-30 terrain conditioning, geospatial coordinate projection, inundation mesh modeling. |
| **Mohammad Zakiruddin** | Frontend Developer | [@zakirverse](https://github.com/zakirverse) | `zakirmd.1805@gmail.com` | React + Vite UI architecture, ArcGIS Maps SDK 3D SceneView integration, interactive hydraulic controllers, responsive dashboard. |
| **Mohammed Numan** | AI Engineer | [@mohammednumaan716](https://github.com/mohammednumaan716) | `mohammednumaan901@gmail.com` | Intelligent routing analysis, surrogate model research, automated parameter optimization, decision logic validation. |
| **Manivarun Chintala** | Data Infrastructure / Backend Developer | [@manivarun-05](https://github.com/manivarun-05) | `manivarunchintala2005.2728@gmail.com` | FastAPI REST endpoints, multi-scenario spatial indexing, KD-Tree road-hydraulic mapping pipeline, cloud deployment. |
| **Thaniska** | QA & Verification Lead | [@thanishkaX](https://github.com/thanishkaX) | `ramatenkithanishka@gmail.com` | Pytest test suite, mathematical edge case validation, scenario isolation verification, end-to-end acceptance testing. |

---

## 19. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
