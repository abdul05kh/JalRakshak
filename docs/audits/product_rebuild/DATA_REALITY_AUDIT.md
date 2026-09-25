# DATA REALITY AUDIT
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Audit Scope**: Complete Data Lineage and Reality Classification across Pipeline Layers  
**Date**: September 25, 2026  
**Status**: COMPLETE / VERIFIED  

---

## 1. Executive Summary

JalRakshak enforces strict scientific data fidelity to locked authoritative artifacts. No scientific values, hydraulic states, road geometries, terrain elevations, or arrival times are fabricated or silently modified.

This audit establishes the formal classification of all scientific, operational, and geospatial quantities across the system into seven standard categories:
1. **SOURCE**: Primary immutable observational or authoritative input files.
2. **DERIVED**: Quantities computed deterministically from source data via validated scientific solvers.
3. **CONFIGURED**: Declared engineering parameters locked for operational scenarios.
4. **ASSUMED**: Explicit scientific and domain assumptions with stated bounds and limitations.
5. **DISPLAYED**: End-user operational representations rendered strictly from derived/configured contracts.
6. **TEST FIXTURE**: Isolated testing mock values strictly forbidden from operational code paths.
7. **SYNTHETIC**: Procedural or mock data (strictly 0% in JalRakshak operational paths).

---

## 2. Authoritative Data Dictionary & Classification

| Parameter / Entity | Value / Representation | Classification | Source Artifact / Method | Physical Meaning & Lineage |
| :--- | :--- | :--- | :--- | :--- |
| **Copernicus GLO-30 DSM** | 30m posting, $1801 \times 1980$ float32 grid | **SOURCE** | `artifacts/gis/tehri_corridor_dem.tif` | Authoritative Earth Observation elevation raster (EPSG:4326 / EGM2008). |
| **Dam Crest Coordinate** | $(78.4800^\circ\text{E}, 30.3780^\circ\text{N})$ | **SOURCE** | Tehri Hydro Development Corporation (THDC) specifications | Physical geographic anchor of Tehri Rockfill Dam. |
| **Dam Crest Elevation** | $839.5\,\text{m}$ aMSL | **SOURCE** | THDC Dam Specification Record | Structural crest level of dam embankment. |
| **Normal Reservoir Level (FRL)** | $830.0\,\text{m}$ aMSL | **SOURCE** | Central Water Commission (CWC) Rule Curve | Operational maximum reservoir conservation level. |
| **Breach Invert Elevation** | $635.0\,\text{m}$ aMSL | **ASSUMED** | `docs/GATE4_ASSUMPTION_UNCERTAINTY_LEDGER.md` | Assumed bottom elevation of trapezoidal breach formation (model assumption, not ground truth). |
| **Breach Formation Time** | $1.5\,\text{hours}$ | **ASSUMED** | Froehlich (2008) empirical dam breach formulation | Rate of breach channel opening under hydrostatic collapse. |
| **CENTRAL Peak Discharge ($Q_p$)** | $65,000\,\text{m}^3/\text{s}$ | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | Locked reference design flood scenario for Tehri Gorge. |
| **MINIMUM Peak Discharge ($Q_p$)** | $28,500\,\text{m}^3/\text{s}$ | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | Locked lower-bound breach scenario. |
| **MAXIMUM Peak Discharge ($Q_p$)** | $115,000\,\text{m}^3/\text{s}$ | **CONFIGURED** | `artifacts/hecras/scenarios/scenario_manifest.json` | Locked probable maximum / catastrophic overtopping breach scenario. |
| **Unsteady 2D Hydraulic Mesh** | Hydrodynamic shallow water equations (SWE) | **DERIVED** | HEC-RAS 2D v6.x (`artifacts/hecras/tehri_gate3b/`) | 2D cell-based hydraulic solver computing water surface elevation (WSE), depth, and velocity vectors. |
| **Road Centerline Vectors** | Uttarakhand PWD GIS shapefiles | **SOURCE** | `artifacts/gis/roads_corridor.geojson` | Surveyed geometry of Bhagirathi valley roadway infrastructure. |
| **Road Densification** | Point spacing $\le 50\,\text{m}$ | **DERIVED** | Geodesic densification algorithm | Prevents spatial aliasing across complex terrain contours. |
| **Road Hydraulic Coupling** | $150\,\text{m}$ spatial search radius | **CONFIGURED** | Spatial nearest-neighbor with elevation gate | Associates 2D hydraulic mesh cells with discrete road segments. |
| **Inundation Threshold** | $h \ge 0.30\,\text{m}$ | **CONFIGURED** | Vehicle mobility threshold (AASHTO / FEMA standard) | Water depth at which road segment is classified as impassable. |
| **Flood Arrival Time ($A_i$)** | Time when depth exceeds $0.30\,\text{m}$ | **DERIVED** | HEC-RAS hydrograph interpolation | Timestamp relative to breach trigger when segment $i$ becomes inundated. |
| **CENTRAL R02 Arrival ($A_{\text{R02}}$)**| $3600\,\text{seconds}$ ($T+60:00$) | **DERIVED** | `artifacts/decision/authoritative_results.json` | Exact arrival time at limiting segment `R02-E07`. |
| **Road Travel Speed ($v$)** | $30\,\text{km/h}$ (mountain) / $45\,\text{km/h}$ (highway) | **ASSUMED** | PWD mountain roadway operational guidelines | Static travel speed assumption; dynamic traffic congestion not modeled. |
| **Route R02 Travel Time ($T_{\text{R02}}$)**| $759\,\text{seconds}$ ($12:39$) | **DERIVED** | Dijkstra route graph traversal | Cumulative travel time from origin to safe high-ground Chamba Shelter. |
| **Evacuation Safety Buffer ($B$)** | $180\,\text{seconds}$ ($03:00$) | **CONFIGURED** | NDMA Evacuation Planning Buffer Standard | Safety buffer to account for departure latency and driver reaction time. |
| **CENTRAL Departure Deadline ($D$)** | $2661\,\text{seconds}$ ($T+44:21$) | **DERIVED** | $D = A - T - B = 3600 - 759 - 180$ | Authoritative latest computed feasible departure timestamp. |
| **Limiting Segment ID** | `R02-E07` | **DERIVED** | $\arg\min_i (A_i - T_i - B)$ along route graph | Bottleneck road segment governing evacuation window closure. |
| **Operational Status** | `FEASIBLE` | **DERIVED** | State machine evaluating $D > 0$ with positive margin | Evacuation feasibility classification. |
| **UI Display Text** | `"LATEST COMPUTED FEASIBLE DEPARTURE: T+44:21"` | **DISPLAYED** | `frontend/src/components/FloatingDecisionCard.tsx` | Human-readable representation rendered verbatim from frontend adapter. |

---

## 3. Demarcation of Forbidden Synthetic & Legacy Data

The repository audit identified and strictly isolated legacy/demo artifacts:
- Historical synthetic discharges (`14,100`, `28,400`, `64,200`, `90,000 m³/s`) are **isolated** from all operational paths.
- Operational runtime consumes **only** `SCENARIO_CENTRAL` ($65,000\,\text{m}^3/\text{s}$), `SCENARIO_MINIMUM` ($28,500\,\text{m}^3/\text{s}$), and `SCENARIO_MAXIMUM` ($115,000\,\text{m}^3/\text{s}$).
- Zero synthetic noise, zero procedural elevation displacement, and zero fabricated intermediate hydraulic states exist in the operational system.

---

## 4. Audit Verdict

**DATA REALITY AUDIT STATUS: PASS**  
100% of operational data is traceable to authoritative source files and validated deterministic transformations.
