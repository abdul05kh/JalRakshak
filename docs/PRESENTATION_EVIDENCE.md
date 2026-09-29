# SIH26161 Presentation Evidence & Verification Package

**Project:** JalRakshak — Dam-Break Flood Hydrodynamic Modelling & Evacuation Decision Support  
**Problem Statement ID:** `SIH26161`  
**Problem Authority:** National Technical Research Organisation (NTRO) / Ministry of Education's Innovation Cell (MIC)  
**Standard:** Zero-Fabrication Scientific Evidence Standard

---

## 1. Requirement-to-Evidence Matrix for Evaluators

| # | PS Requirement | Implemented Technical Feature | Repository / Code Evidence Location | Verifiable Evidence & Metrics | Scientific Limitation / Disclaimer |
|:---|:---|:---|:---|:---|:---|
| **1** | **Simulation of Dam Break & Downstream Flow** | Native 2D HEC-RAS 7.0.1 unsteady flow solver execution across 3 breach plans (Central 65k, Min 28.5k, Max 115k $\text{m}^3/\text{s}$). | `backend/app/domain/hecras_adapter.py`, `data/scenarios/SCENARIO_CENTRAL/` | HDF5 plan files (`.p01.hdf`, `.p02.hdf`, `.p03.hdf`) with $\approx 740$ active 2D cells along the Bhagirathi valley. | Physical calibration of Tehri is unestablished due to absence of historic physical dam failure data. |
| **2** | **Downstream Inundation Estimation** | Derived continuous maximum water depth ($h_{\max}$), water surface elevation ($WSE$), face velocity ($v$), and wave arrival time ($t_{\text{arr}}$). | `RoadHydraulicMapper.generate_inundation_geojson()`, `ArcGISHydraulicLayer.ts` | 3D multi-color depth ramp ($0.3\text{m} \to 15\text{m+}$) and temporal isochrones ($<30\text{m} \to >90\text{m}$). | DSM (Copernicus GLO-30) includes canopy/structures; not a guaranteed bare-earth DTM. |
| **3** | **Generalized Modelling Framework** | Scenario-scoped world architecture with isolated GIS layers and execution environments. | `backend/app/domain/database.py`, `backend/tests/test_scenario_loader.py` | Complete world isolation tested via `SCENARIO_CENTRAL`, `TEST_ALPHA`, `TEST_BETA`. | New dams require local terrain conditioning and hydrograph ingestion. |
| **4** | **Multiple Input Datasets** | Ingestion pipeline for Copernicus GLO-30 DEM, HEC-RAS 2D HDF5 meshes, GeoJSON roads, and satellite raster references. | `docs/INPUT_DATASET_SPECIFICATION.md`, `backend/app/domain/models.py` | Strict provenance schema attaching CRS, acquisition dates, and SHA-256 hashes. | Vertical datum compatibility between GLO-30 (EGM96) and local riverbed datum is unverified. |
| **5** | **Scenario Generation & Comparison** | Multi-scenario hydrograph comparison matrix and cross-model comparison engine. | `backend/app/domain/hydraulic_adapters/comparison.py`, `POST /api/v1/scenarios/compare` | Automated calculation of mean absolute depth delta ($\Delta h$), arrival delta ($\Delta t_{\text{arr}}$), and spatial overlap IoU. | Cross-scenario comparison is deterministic; does not automate parameter calibration. |
| **6** | **GUI / 3D Visualization Dashboard** | WebGL 3D SceneView with dynamic elevation, unsteady temporal playback scrubber ($T+00 \to T+120$), and decision cards. | `frontend/src/views/OperationalMapView.tsx`, `ArcGISSceneViewer.tsx` | Instantaneous camera switching, terrain rendering, and interactive mesh telemetry popup inspection. | WebGL rendering depends on client GPU capability. |
| **7** | **Standard GIS Output Export (SHP / KML)** | Scenario export pipeline producing RFC 7946 GeoJSON and OGC KML 2.2 XML with full attribute tables. | `backend/app/domain/exporter.py`, `GET /api/v1/scenarios/{id}/export` | Validated XML schemas with embedded depth, velocity, arrival time, and departure margin attributes. | Direct shapefile export is served via standard GeoJSON/KML GIS converters. |
| **8** | **Near-Real-Time GEE Analysis** | Google Earth Engine provider architecture with Sentinel-1 SAR query builder and spatial comparison engine. | `backend/app/integrations/gee/`, `POST /api/v1/gee/compare` | Exact spatial IoU, Precision, Recall, and F1 calculations comparing simulated mesh with satellite flood masks. | Real live GEE execution requires user Google Cloud service account credentials. |
| **9** | **Loss / Damage & Exposure Analysis** | Exposure engine separating physical exposure (spatial intersection) from empirical Depth-Damage Functions (DDF). | `backend/app/domain/damage_model.py`, `POST /api/v1/scenarios/{id}/exposure` | Asset classification (`RESIDENTIAL`, `CRITICAL_FACILITY`, `ROAD_NETWORK`) with $\pm 15\%$ uncertainty bounds. | Does not fabricate arbitrary rupee loss figures without verified local economic cadastral surveys. |
| **10** | **SPH & Delft3D Model Comparison** | `HydraulicModelAdapter` unified interface supporting HEC-RAS, Delft3D FM, and DualSPHysics SPH. | `backend/app/domain/hydraulic_adapters/`, `GET /api/v1/models` | Clear architectural separation between `AUTHORITATIVE_INGESTED`, `TEST_FIXTURE`, and `NOT_CONFIGURED`. | Proprietary/external SPH and Delft3D solvers are truthfully marked NOT_CONFIGURED. |
| **11** | **Evacuation Route Intelligence & EWE** | Deterministic Evacuation Window Engine ($D = \min_i(A_i - T_i - B)$) identifying the exact limiting bottleneck segment. | `backend/app/domain/ewe_engine.py`, `DecisionPanel.tsx` | Mathematical argmin bottleneck extraction ($R02\text{-}E07$ cutoff at $T+60:00$, travel $12:39$, buffer $03:00 \to$ deadline $T+44:21$). | Static evacuation speed assumption ($50\text{ km/h}$); dynamic traffic congestion is unmodelled. |

---

## 2. Presentation Guidelines: What NOT to Claim
1. **DO NOT claim 100% physical accuracy:** State that hydraulic results are from HEC-RAS 2D unsteady equations on Copernicus GLO-30 DEM.
2. **DO NOT claim automated AI flood prediction:** State that decisions are derived from deterministic mathematical formulations (EWE) over physical hydrodynamic solver outputs.
3. **DO NOT claim structural road failure:** State that road segments are classified by hydraulic flood inundation thresholds ($h \ge 0.30\text{m}$, $v \ge 1.0\text{m/s}$).
4. **DO NOT claim live satellite calibration:** State that GEE integration provides observational discrepancy analysis (IoU/F1), not automatic solver recalibration.
