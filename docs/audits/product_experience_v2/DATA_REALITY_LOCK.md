# DATA REALITY LOCK & CLASSIFICATION AUDIT
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Document**: Gate A — Complete Data Reality Lock  
**Date**: September 25, 2026  
**Status**: COMPLETE / ACCEPTED (GATE A PASS)  

---

## 1. Executive Summary

In strict accordance with the non-negotiable scientific accuracy rules of JalRakshak, this document locks every dataset, coordinate system, vertical reference, and numerical parameter across the entire computational pipeline.

No scientific values, hydraulic states, road vectors, terrain elevations, or evacuation arrival times are fabricated, silently clamped, or approximated.

---

## 2. Authoritative Data Classification Matrix

Every value and artifact in the JalRakshak production environment is classified under one of the 8 canonical categories:
`SOURCE`, `DERIVED`, `CONFIGURED`, `ASSUMED`, `DISPLAYED`, `TEST_FIXTURE`, `SYNTHETIC`, or `NOT_AVAILABLE`.

| Entity / Dataset | Classification | File / Source Path | Value / Format | Coordinate / Datum Reference | Physical Meaning & Scientific Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Copernicus GLO-30 DSM** | **SOURCE** | `artifacts/gis/tehri_corridor_dem.tif` | GeoTIFF ($1801 \times 1980$ float32, $30\text{m}$ posting) | EPSG:4326 / EGM2008 Geoid | Primary topographic surface of Tehri Dam and Bhagirathi valley. |
| **Dam Structural Embankment** | **SOURCE** | THDC Engineering Specifications | Crest: $839.5\,\text{m}$ aMSL, Toe: $638.0\,\text{m}$ aMSL | $(78.4800^\circ\text{E}, 30.3780^\circ\text{N})$ | Physical rockfill dam geometry spanning canyon. |
| **Normal Full Reservoir Level (FRL)**| **SOURCE** | CWC Operating Rule Curve | $830.0\,\text{m}$ aMSL | Upstream Bhagirathi reservoir basin | Maximum active conservation storage level. |
| **Breach Bottom Invert** | **ASSUMED** | `docs/GATE4_ASSUMPTION_UNCERTAINTY_LEDGER.md` | $635.0\,\text{m}$ aMSL | Model assumption | Modeled bottom elevation of trapezoidal breach formation; not measured. |
| **Breach Formation Time** | **ASSUMED** | Froehlich (2008) formulation | $1.5\,\text{hours}$ ($5400\,\text{s}$) | Hydrodynamic trigger | Empirical breach rate parameter. |
| **HEC-RAS 2D Hydrodynamic Results**| **DERIVED** | `artifacts/hecras/tehri_gate3b/` | HDF5 (`.p01.hdf`) unsteady 2D SWE | EPSG:32644 (UTM 44N) $\rightarrow$ EPSG:4326 | High-resolution 2D water surface elevation, depth, and velocity vector fields. |
| **SCENARIO_CENTRAL $Q_p$** | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | $65,000\,\text{m}^3/\text{s}$ | Reference flood scenario | Design breach peak outflow hydrograph. |
| **SCENARIO_MINIMUM $Q_p$** | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | $28,500\,\text{m}^3/\text{s}$ | Lower-bound flood scenario | Minimum modeled breach scenario. |
| **SCENARIO_MAXIMUM $Q_p$** | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | $115,000\,\text{m}^3/\text{s}$ | Catastrophic overtopping scenario | Maximum modeled breach scenario. |
| **Road Network Centerlines** | **SOURCE** | `artifacts/gis/roads_corridor.geojson` | GeoJSON LineStrings | EPSG:4326 (OpenStreetMap-derived) | Vector roads along Bhagirathi corridor. |
| **Road Densification** | **DERIVED** | Geodesic point sampling algorithm | Node interval $\le 50\,\text{m}$ | EPSG:4326 | Prevents contour aliasing across steep valley terrain. |
| **Road Hydraulic Coupling Envelope**| **CONFIGURED**| Spatial Nearest Neighbor Filter | Search radius: $150\,\text{m}$ | Planar Euclidean in UTM 44N | Correlates 2D hydraulic grid cells with discrete road segments. |
| **Inundation Impassability Threshold**| **CONFIGURED**| AASHTO / FEMA Emergency Vehicle Standard| Depth $h \ge 0.30\,\text{m}$ | Vertical water depth | Depth at which road segment is classified as impassable. |
| **Flood Arrival Time ($A_i$)** | **DERIVED** | HEC-RAS temporal interpolation | $A_{\text{R02-E07}} = 3600\,\text{s}$ ($T+60:00$) | Seconds from breach trigger | Time when depth at bottleneck segment reaches $0.30\,\text{m}$. |
| **Baseline Travel Speed ($v$)** | **ASSUMED** | PWD Himalayan Road Operational Standard | $30\,\text{km/h}$ (mountain) / $45\,\text{km/h}$ (highway) | Static road traversal | Assumes static vehicular velocity; dynamic traffic congestion not modeled. |
| **Evacuation Travel Duration ($T_i$)**| **DERIVED** | Dijkstra Shortest Path on Route Graph | $T_{\text{R02}} = 759\,\text{s}$ ($12:39$) | Cumulative travel from origin | Travel duration from Malidewal origin to Chamba Shelter. |
| **NDMA Safety Clearance Buffer ($B$)**| **CONFIGURED**| NDMA Disaster Management SOP | $180\,\text{s}$ ($03:00$) | Static margin | Staging, warning dissemination, and driver reaction buffer. |
| **Latest Feasible Departure ($D$)**| **DERIVED** | $D = A - T - B = 3600 - 759 - 180$ | $2661\,\text{s}$ (**$T+44:21$**) | Exact difference | Authoritative evacuation deadline relative to breach trigger. |
| **Limiting Segment** | **DERIVED** | $\arg\min_i (A_i - T_i - B)$ | `R02-E07` (Koteshwar riverbank reach) | Route graph edge | The critical spatial bottleneck governing route closure. |
| **Hospital Damage / Vulnerability** | **NOT_AVAILABLE**| N/A | None | N/A | Hospital structural collapse is NOT modeled. Visualized as inundation exposure only. |
| **Real-time Live Telemetry** | **NOT_AVAILABLE**| N/A | None | N/A | Live IoT water level sensor feeds are not connected. Labeled strictly as MODELED SCENARIO. |
| **Historical Test Discharges** | **TEST_FIXTURE**| `tests/fixtures/legacy_scenarios.json` | $14,100, 28,400, 64,200, 90,000\,\text{m}^3/\text{s}$ | Isolated testing environment | Historical demo mock data; strictly isolated from operational runtime. |

---

## 3. Data Invariant Rules

1. **No Silent Approximations**: The frontend adapter must consume `AuthoritativeDecisionResult` exported from `decisionStore.ts`. No view may recompute $D = A - T - B$ or override limiting edges.
2. **Strict Sign Enforcement**: If $T \le 0$ or $B \le 0$, the system must raise an error rather than silently clamping.
3. **No Negative Zero Clamping**: If $D < 0$, the system outputs `INFEASIBLE` with the exact negative deadline, never hiding reality via `Math.max(0, ...)`.

---

## 4. Gate A Verdict

**GATE A STATUS: PASS**  
100% of data fields, lineages, coordinate frameworks, and assumptions are locked and documented.
