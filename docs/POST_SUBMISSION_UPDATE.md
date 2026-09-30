# Post-Submission Technical Update & Engineering Evolution

**Project:** JalRakshak  
**SIH Problem Statement:** SIH26161 — *"Dam Break Inundation Modelling Using Hydrodynamic Modelling of any River"*  
**Organization:** National Technical Research Organisation (NTRO) / Ministry of Education's Innovation Cell (MIC)  
**Theme:** Disaster Management  
**Category:** Software  
**Release Tag:** `v2.0-post-submission`  
**Current Build Commit:** `f668c7d`  
**Current Prototype Status:** `Demo-Ready Research Prototype` (Not an operational production system)

---

## 1. Executive Context: An Honest, Evidence-Based Disclosure

Our Smart India Hackathon solution has **already been submitted**. 

The submitted PPT and early prototype represented our **initial interpretation** of SIH26161. Following our initial submission, our engineering and scientific team conducted an in-depth, forensic deconstruction of the official NTRO problem statement and identified a **significant interpretation gap**:

* Our initial prototype focused too narrowly on:
  * Dam-break hydrodynamic simulation
  * 3D hydraulic flood visualization
  * Localized GIS mapping
  * Basic evacuation route clearance concepts

* The full SIH26161 problem statement actually expects a **generalized modelling framework** encompassing:
  * Ingestion and fusion of hydrologic data, Digital Elevation Models (DEM), and satellite imagery.
  * Near-real-time satellite observation and change detection (Google Earth Engine / Sentinel-1).
  * Multi-hydrodynamic solver adapters (HEC-RAS 2D, Delft3D Flexible Mesh, DualSPHysics SPH).
  * Automated scenario generation and comparative cross-model discrepancy analysis.
  * Standardized GIS export formats (OGC KML 2.2 XML and RFC 7946 GeoJSON) for district disaster management systems.
  * Demonstration on high-risk Indian river/dam basins (Tehri Dam on the Bhagirathi River).

### Core Principle of This Disclosure
> **The submitted PPT has not been retroactively changed.** This document and the updated codebase record the technical evolution, scientific hardening, and architectural generalization that followed our problem reinterpretation.

---

## 2. Side-by-Side Evolution Matrix

| Engineering Area | Submitted State (Initial Interpretation) | Current Prototype (Substantially Advanced) | Evidence & Code Reference |
| :--- | :--- | :--- | :--- |
| **Problem Scope** | Localized dam-break flood visualizer | Generalized hydrodynamic & remote sensing framework | [`docs/POST_SUBMISSION_UPDATE.md`](file:///d:/projects/JalRakshak/docs/POST_SUBMISSION_UPDATE.md) |
| **Hydrodynamic Modeling** | Procedural / localized flood propagation | Native HEC-RAS 2D unsteady flow HDF5 ingestion (740+ cells, 3 breach plans) | [`backend/app/domain/hecras_reader.py`](file:///d:/projects/JalRakshak/backend/app/domain/hecras_reader.py) |
| **Decision Engine** | Qualitative route inspection | Deterministic Evacuation Window Engine (EWE) solving $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ | [`backend/app/domain/decision.py`](file:///d:/projects/JalRakshak/backend/app/domain/decision.py) |
| **Road-Hydraulic Coupling** | Simple 2D point distance checks | Projected coordinate transformation (UTM 44N to WGS84) + 150m corridor search + segment densification | [`backend/app/domain/gis.py`](file:///d:/projects/JalRakshak/backend/app/domain/gis.py) |
| **Satellite / GEE** | Conceptual / absent | Multi-temporal Sentinel-1 SAR change detection pipeline + GEE spatial discrepancy comparator | [`backend/app/integrations/gee/`](file:///d:/projects/JalRakshak/backend/app/integrations/gee/) |
| **Multi-Model Support** | Single model assumption | Unified `HydraulicModelAdapter` interface (HEC-RAS, Delft3D FM, DualSPHysics SPH) | [`backend/app/domain/hydraulic_adapters/`](file:///d:/projects/JalRakshak/backend/app/domain/hydraulic_adapters/) |
| **GIS Interoperability** | No export capabilities | RFC 7946 GeoJSON and OGC KML 2.2 export with full hydraulic telemetry | [`backend/app/domain/exporter.py`](file:///d:/projects/JalRakshak/backend/app/domain/exporter.py) |
| **Scenario Isolation** | Hardcoded Tehri coordinate assumptions | Clean scenario world isolation tested with black-box synthetic worlds (`TEST_ALPHA`, `TEST_BETA`) | [`backend/tests/test_scenario_generalization.py`](file:///d:/projects/JalRakshak/backend/tests/test_scenario_generalization.py) |
| **Data Lineage & Provenance** | Unverified claims | Live SHA-256 physical file hashing with deterministic verification | [`backend/app/domain/provenance.py`](file:///d:/projects/JalRakshak/backend/app/domain/provenance.py) |
| **Software Verification** | Early manual tests | 193 automated Pytest test suites passing in release CI environment | [`backend/tests/`](file:///d:/projects/JalRakshak/backend/tests/) |

---

## 3. Mathematical Formulation of the Evacuation Window Engine (EWE)

A core innovation in JalRakshak's post-submission development is translating raw hydrodynamic outputs ($h, \mathbf{v}, t_{\text{arrival}}$) into actionable, deterministic evacuation deadlines.

For an evacuation route comprising road segments $e_1, e_2, \dots, e_n$:
1. **Feasibility Condition:** A departure at time $D$ from the origin is safe if and only if every road segment $e_i$ is cleared before the flood wave arrives:
   $$D + T_i + B < A_i \quad \forall i \in \{1, \dots, n\}$$
   where:
   * $D$ = Departure timestamp (UTC / minutes from breach trigger)
   * $T_i = \sum_{j=1}^i \frac{L_j}{v_j}$ = Cumulative travel time to reach and traverse segment $e_i$
   * $B$ = Configured safety buffer (default: 3.0 minutes)
   * $A_i$ = Earliest flood arrival time at segment $e_i$ (where depth exceeds depth threshold $h_{\text{crit}} = 0.3\,\text{m}$ or velocity exceeds $v_{\text{crit}} = 1.0\,\text{m/s}$)

2. **Latest Feasible Departure ($D_{\text{deadline}}$):**
   $$D_{\text{deadline}} = \min_{i=1}^n \left( A_i - T_i - B \right)$$

3. **Limiting Road Segment:**
   $$e_{\text{limiting}} = \arg\min_{i=1}^n \left( A_i - T_i - B \right)$$
   The limiting segment is the critical bottleneck along the evacuation corridor that dictates the entire route's latest safe departure deadline.

*Scientific Qualification:* The EWE is a **software-verified deterministic decision transformation** of hydrodynamic model outputs. It does not replace physical traffic management models or human behavioral evacuation modeling.

---

## 4. Google Earth Engine & Sentinel-1 SAR Pipeline

### Architecture
$$\text{Sentinel-1 GRD (IW)} \longrightarrow \text{Radiometric Calibration} \longrightarrow \text{Lee Speckle Filter} \longrightarrow \text{Backscatter Ratio} \longrightarrow \text{Otsu / Dynamic Threshold} \longrightarrow \text{Candidate Flood Mask}$$

### Discrepancy Matrix Formulation
To objectively evaluate simulated inundation against satellite-observed water masks, JalRakshak implements standard geospatial discrepancy metrics:
* **Intersection over Union (IoU / Jaccard Index):**
  $$\text{IoU} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}} \cup M_{\text{obs}}|}$$
* **Precision (User's Accuracy):**
  $$\text{Precision} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}}|}$$
* **Recall (Producer's Accuracy):**
  $$\text{Recall} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{obs}}|}$$
* **$F_1$ Score:**
  $$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

### Scientific Ground Truth Disclaimer
* Sentinel-1 Synthetic Aperture Radar (SAR) backscatter decreases over smooth open water due to specular reflection.
* However, backscatter drop can also result from high soil moisture, agricultural flooding, shadows in steep mountain terrain, or wet snow.
* **Therefore:** Satellite-derived water extent candidates are treated as **observational research masks**, NOT uncalibrated ground truth for numerical hydrodynamic validation.
* Unrelated historical weather events (e.g., July 2024 Balganga flash flood) cannot be conflated with hypothetical Tehri Dam overtopping breaches.

---

## 5. Explicit Limitations & Scientific Disclaimers

In adherence to scientific integrity, the following limitations are explicitly documented:

1. **Physical Validation of Tehri Dam Break:** `NOT_ESTABLISHED`. No physical historical failure of Tehri Dam exists. Model outputs represent numerical simulation based on configured breach hydrographs ($Q_p \in [28500, 115000]\,\text{m}^3/\text{s}$).
2. **External Solvers:** Delft3D Flexible Mesh and DualSPHysics SPH are structured as `HydraulicModelAdapter` interface specifications. Where external proprietary binaries are not configured in the host environment, the system outputs structured adapter errors rather than procedurally faking results.
3. **Traffic Dynamics:** Vehicle evacuation speed is configured at a constant $50\,\text{km/h}$. Dynamic multi-agent traffic congestion, vehicle stalling, and panics are unmodelled.
4. **Digital Elevation Model:** DEM data is derived from Copernicus GLO-30 DSM (Digital Surface Model). DSM elevations include canopy and structures.
5. **Real-Time Execution:** Hydrodynamic simulations are pre-computed 2D unsteady flow solutions ingested via native HDF5 tables. On-the-fly execution of arbitrary new river meshes requires external high-performance computing cluster resources.

---

## 6. Verification and Audit Trail

* **Pytest Test Suites:** 193 passing automated tests across unit, domain, GIS, EWE, GEE, and scenario generalization suites.
* **Integrity Guarantee:** Physical disk SHA-256 verification on all scenario HDF5/JSON artifacts.
* **Frontend Verification:** Production build verified with Vite 5.4.19 and TypeScript 5.5.3 (0 errors).
