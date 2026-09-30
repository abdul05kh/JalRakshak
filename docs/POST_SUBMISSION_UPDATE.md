# Post-Submission Technical Update & Engineering Evolution

**Project:** JalRakshak  
**SIH Problem Statement:** SIH26161 — *"Dam Break Inundation Modelling Using Hydrodynamic Modelling of any River"*  
**Organization:** National Technical Research Organisation (NTRO) / Ministry of Education's Innovation Cell (MIC)  
**Theme:** Disaster Management  
**Category:** Software  
**Release Tag:** `v2.0-post-submission`  
**Current Build Commit:** `a9496f1`  
**Current Prototype Status:** `Demo-Ready Research Prototype` (Not an operational production system)

---

## ⚠️ Important Post-Submission Notice

> **Important: This is a post-submission technical update. It does not constitute a revised SIH submission. The submitted PPT remains unchanged; this repository documents technical development undertaken after submission.**

---

## 1. Executive Context: An Honest, Evidence-Based Disclosure

Our Smart India Hackathon solution has **already been submitted**. 

The submitted PPT and early prototype represented our **initial interpretation** of SIH26161. Following our initial submission, our technical analysis of the official NTRO problem statement revealed that our initial interpretation did not fully capture its breadth:

* Our initial prototype focused primarily on:
  * Dam-break hydrodynamic simulation
  * 3D hydraulic flood visualization
  * Localized GIS mapping
  * Basic evacuation route clearance concepts

* The broader scope of SIH26161 includes:
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

| Engineering Area | Submitted State (Initial Stage) | Current Prototype (Post-Submission Advancement) | Evidence & Code Reference |
| :--- | :--- | :--- | :--- |
| **Problem Scope** | Localized dam-break flood visualizer | Generalized hydrodynamic & remote sensing framework | [`docs/POST_SUBMISSION_UPDATE.md`](docs/POST_SUBMISSION_UPDATE.md) |
| **Hydrodynamic Modeling** | Procedural / localized flood propagation | Native HEC-RAS 2D unsteady flow HDF5 ingestion (740+ cells, 3 breach plans) | [`backend/app/domain/hecras_reader.py`](backend/app/domain/hecras_reader.py) |
| **Decision Engine** | Basic route clearance concept | Deterministic Evacuation Window Engine (EWE) solving $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ | [`backend/app/domain/decision.py`](backend/app/domain/decision.py) |
| **Road-Hydraulic Coupling** | Simple 2D point overlay | Projected coordinate transformation (UTM 44N to WGS84) + 150m corridor search + segment densification | [`backend/app/domain/gis.py`](backend/app/domain/gis.py) |
| **Satellite / GEE** | Limited / absent | Multi-temporal Sentinel-1 SAR change detection research workflow; spatial discrepancy comparator | [`backend/app/integrations/gee/`](backend/app/integrations/gee/) |
| **Multi-Model Support** | Single model assumption | Unified `HydraulicModelAdapter` interface (HEC-RAS, Delft3D FM, DualSPHysics SPH) | [`backend/app/domain/hydraulic_adapters/`](backend/app/domain/hydraulic_adapters/) |
| **GIS Interoperability** | No export capabilities | OGC KML 2.2 XML and RFC 7946 GeoJSON export endpoints with hydraulic telemetry | [`backend/app/domain/exporter.py`](backend/app/domain/exporter.py) |
| **Scenario Isolation** | Hardcoded Tehri coordinate assumptions | Scenario isolation and data-driven loading verified on independent synthetic test worlds (`TEST_ALPHA`, `TEST_BETA`) | [`backend/tests/test_scenario_generalization.py`](backend/tests/test_scenario_generalization.py) |
| **Data Lineage & Provenance** | Unverified claims | Live SHA-256 physical disk hashing with deterministic verification | [`backend/app/domain/provenance.py`](backend/app/domain/provenance.py) |
| **Software Verification** | Early manual tests | 193 automated Pytest test suites passing in release environment | [`backend/tests/`](backend/tests/) |

---

## 3. Mathematical Formulation of the Evacuation Window Engine (EWE)

A core focus in JalRakshak's post-submission development is translating raw hydrodynamic outputs ($h, \mathbf{v}, t_{\text{arrival}}$) into actionable, deterministic evacuation deadlines.

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

*Scientific Qualification:* The EWE transforms hydraulic arrival information and configured route assumptions into a deterministic departure window. It is not an independent physical safety model and does not replace physical traffic management models or human behavioral evacuation dynamics.

---

## 4. Google Earth Engine & Sentinel-1 SAR Pipeline

### Architecture
$$\text{Sentinel-1 GRD (IW)} \longrightarrow \text{Radiometric Calibration} \longrightarrow \text{Lee Speckle Filter} \longrightarrow \text{Backscatter Ratio} \longrightarrow \text{Dynamic Threshold} \longrightarrow \text{Candidate Flood Mask}$$

### Discrepancy Matrix Formulation
Spatial-comparison metrics including IoU, precision, recall, and F1 can be computed when compatible simulated and observed extents are supplied:
* **Intersection over Union (IoU / Jaccard Index):**
  $$\text{IoU} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}} \cup M_{\text{obs}}|}$$
* **Precision (User's Accuracy):**
  $$\text{Precision} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{sim}}|}$$
* **Recall (Producer's Accuracy):**
  $$\text{Recall} = \frac{|M_{\text{sim}} \cap M_{\text{obs}}|}{|M_{\text{obs}}|}$$
* **$F_1$ Score:**
  $$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

These metrics quantify geometric agreement under the specified comparison inputs; they do not by themselves establish physical validation.

### Scientific Ground Truth Disclaimer
* Sentinel-1 Synthetic Aperture Radar (SAR) backscatter decreases over smooth open water due to specular reflection.
* However, backscatter drop can also result from high soil moisture, agricultural flooding, shadows in steep mountain terrain, or wet snow.
* **Therefore:** Satellite-derived water extent candidates are treated as **observational research masks**, NOT uncalibrated ground truth for numerical hydrodynamic validation.
* 969 Sentinel-1 scenes were indexed for the configured AOI/query (they do not all form a continuous homogeneous time series).
* Unrelated historical weather events (e.g., July 2024 Balganga flash flood) cannot be conflated with hypothetical Tehri Dam overtopping breaches.

---

## 5. Explicit Limitations & Scientific Disclaimers

In adherence to scientific integrity, the following limitations are explicitly documented:

1. **Physical Validation of Tehri Dam Break:** `NOT_ESTABLISHED`. No physical historical failure of Tehri Dam exists. Model outputs represent numerical simulation based on configured breach hydrographs ($Q_p \in [28500, 115000]\,\text{m}^3/\text{s}$).
2. **External Solvers:** Delft3D Flexible Mesh and DualSPHysics SPH are structured as `HydraulicModelAdapter` interface specifications. External solver execution is not included in the current demonstration environment.
3. **Traffic Dynamics:** Vehicle evacuation speed is configured at a constant $50\,\text{km/h}$. Dynamic multi-agent traffic congestion, vehicle stalling, and panic dynamics are unmodelled.
4. **Digital Elevation Model:** DEM data is derived from Copernicus GLO-30 DSM (Digital Surface Model). DSM elevations include canopy and structures.
5. **Near-Real-Time Operation:** GEE/Sentinel-1 observation is currently a research-stage workflow. Live automated acquisition and end-to-end near-real-time processing remain configuration dependent.
6. **Damage Assessment:** Exposure assessment framework identifies exposed infrastructure; damage estimation requires calibrated cadastral survey inputs.

---

## 6. Verification and Audit Trail

* **Pytest Test Suites:** 193 passing automated tests across unit, domain, GIS, EWE, GEE, and scenario generalization suites.
* **Integrity Guarantee:** Physical disk SHA-256 verification on all scenario HDF5/JSON artifacts.
* **Frontend Verification:** Production build verified with Vite 5.4.19 and TypeScript 5.5.3 (0 errors).
