# JALRAKSHAK — DATA REALITY LOCK & PROVENANCE INVENTORY
**Gate:** `GATE A — DATA REALITY LOCK`  
**Evaluation Standard:** Forensic Verification & Scientific Claims Discipline  
**Author:** Senior Engineering Team (SIH'26 JalRakshak)  
**Date:** 2026-09-25  

---

## 1. Data Classification Schema

Every scientific, hydraulic, geometric, and operational value used in the JalRakshak system is classified into one of the following authoritative tiers:

| Classification | Definition | Application Rule |
| :--- | :--- | :--- |
| **`SOURCE`** | Directly extracted from primary raw source files (e.g. HEC-RAS HDF5, DEM GeoTIFF, raw OSM vector). | Verifiable by bit-level inspection and file hash. |
| **`DERIVED`** | Mathematically computed from `SOURCE` data through an explicit, documented transformation function. | Deterministic, reproducible, zero human interpolation. |
| **`CONFIGURED`** | User-adjustable or operational policy parameter (e.g. travel speed baseline, safety buffer). | Explicitly labeled as a configured parameter; never presented as physical ground truth. |
| **`ASSUMED`** | Theoretical or hydrologic scenario modeling assumption (e.g. breach invert elevation, breach formation time). | Explicitly labeled as a model assumption; never presented as surveyed physical fact. |
| **`DEMONSTRATION`** | Synthetic test fixtures preserved for software regression testing. | Isolated from authoritative operational modes; never presented as genuine real-world hydraulics. |
| **`UNKNOWN`** | Value without traceable primary documentation. | **STRICTLY PROHIBITED** from appearing in the user interface. |

---

## 2. Comprehensive Inventory of System Data Values

| # | Value / Parameter | Quantitative Value | Classification | Source Artifact / Method | Coordinate System / Datum | Known Limitations & Operational Qualification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Terrain Source** | Copernicus GLO-30 DSM | `SOURCE` | `data/terrain/copernicus_glo30_tehri.tif` | EPSG:4326 / Orthometric (EGM96) | 30m spatial resolution; bare-earth elevation hydrologically conditioned for river thalweg. |
| **2** | **Model Projection** | UTM Zone 44N | `SOURCE` | HEC-RAS 2D Geometry (`Tehri15km.g01`) | **EPSG:32644** | Planar metric coordinate system required for exact Euclidean and perpendicular distance calculations. |
| **3** | **Tehri Dam Location** | $30.3780^\circ\text{N}, 78.4803^\circ\text{E}$ | `SOURCE` | Survey of India / THDC Public Record | EPSG:4326 | Coordinates represent the central dam crest axis. |
| **4** | **Tehri Full Reservoir Level** | 830.0 m MSL | `SOURCE` | THDC Central Water Commission Schedule | EGM96 Orthometric | Standard full reservoir design operating level. |
| **5** | **Breach Invert Elevation** | 635.0 m MSL | **`ASSUMED`** | Froehlich Breach Model Assumption | EPSG:32644 | **Model assumption — not a surveyed physical breach elevation.** |
| **6** | **Breach Location** | $30.3750^\circ\text{N}, 78.4790^\circ\text{E}$ | **`ASSUMED`** | Hydraulic model inflow boundary condition | EPSG:4326 | Model boundary cell placement for dam-break hydrograph injection. |
| **7** | **Central Scenario Peak Q** | $65,000\text{ m}^3/\text{s}$ | **`ASSUMED`** | HEC-RAS Gate 3B (`SCENARIO_CENTRAL`) | N/A (Discharge) | Reference Froehlich piping hydrograph; deterministic design breach scenario. |
| **8** | **Minimum Scenario Peak Q** | $28,500\text{ m}^3/\text{s}$ | **`ASSUMED`** | HEC-RAS Gate 3B (`SCENARIO_MINIMUM`) | N/A (Discharge) | Partial breach / overtopping scenario; deterministic lower-bound simulation. |
| **9** | **Maximum Scenario Peak Q** | $115,000\text{ m}^3/\text{s}$ | **`ASSUMED`** | HEC-RAS Gate 3B (`SCENARIO_MAXIMUM`) | N/A (Discharge) | Worst-case rapid breach scenario; deterministic upper-bound simulation. |
| **10** | **Simulation Duration** | 120 minutes (2.0 hours) | `SOURCE` | `tehri_15km_scenario_central.p01.hdf` | N/A (Time) | HEC-RAS native run covers $T+00:00$ to $T+120:00$ @ 5-min base output intervals (25 timesteps). |
| **11** | **Road Network Geometry** | 18 LineString Edges | `SOURCE` | `data/study_area/roads.json` | EPSG:4326 / Projected EPSG:32644 | **OpenStreetMap-derived road network** with road classes; not official surveyed PWD engineering CAD. |
| **12** | **Road Densification** | $\le 50\text{ m}$ interval | `DERIVED` | Gate 4 Road Densifier (`Shapely`) | EPSG:32644 | Densified to resolve hairpin turns and valley switchbacks in mountainous terrain. |
| **13** | **Road Coupling Corridor** | 150.0 m perpendicular | **`CONFIGURED`** | Gate 4 Hardened Corridor Mapper | EPSG:32644 | Enforces exact perpendicular search distance; legacy unconstrained 1200m KD-tree rejected. |
| **14** | **Inundation Threshold** | Depth $\ge 0.30\text{ m}$ | **`CONFIGURED`** | SDMA Vehicle Inundation Standard | Metric | Threshold depth at which vehicular passage is assumed compromised by floodwaters. |
| **15** | **R02 Flood Arrival (Central)**| $T+60:00$ (3600 s) | `DERIVED` | HEC-RAS Cell Coupling (`SCENARIO_CENTRAL`) | Simulation Time | First cell within 150m corridor exceeding 0.30m depth threshold. |
| **16** | **R02 Travel Time** | 12:39 (759 s, 7.38 km) | `DERIVED` | Topological Graph Length $\div$ Speed | Metric | Calculated from network geometry: $7377.4\text{ m} \div 35\text{ km/h} \approx 12.65\text{ min} = 12:39$. |
| **17** | **Baseline Travel Speed** | 35–50 km/h by road class | **`CONFIGURED`** | `roads.json` speed attributes | Metric | **Configured baseline travel-speed assumption; dynamic congestion is not modeled.** |
| **18** | **Safety Buffer** | 03:00 (180 s) | **`CONFIGURED`** | Decision Engine Parameter | Metric | Configured emergency margin; user-adjustable in configuration panel. |
| **19** | **R02 Latest Departure (Central)**| **$T+44:21$** (2661 s) | `DERIVED` | Deterministic EWE Formula: $A_i - T_i - B$ | Simulation Time | $3600\text{ s} - 759\text{ s} - 180\text{ s} = 2661\text{ s} \implies T+44:21$. |
| **20** | **Limiting Road Segment** | Segment `R02` (Overpass) | `DERIVED` | $\arg\min_i (A_i - T_i - B)$ | Graph Topology | Constrains entire route deadline because it minimizes feasible departure margin. |
| **21** | **Malidewal Origin Elevation** | 645.0 m MSL | `DERIVED` | Copernicus GLO-30 DSM point sampling | EGM96 Orthometric | **Terrain-derived elevation; not a ground-surveyed benchmarks.** |
| **22** | **Chamba Shelter Elevation** | 1600.0 m MSL | `DERIVED` | Copernicus GLO-30 DSM point sampling | EGM96 Orthometric | **Terrain-derived elevation; not a ground-surveyed benchmarks.** |
| **23** | **Baseline Synthetic Scenario**| $28,400\text{ m}^3/\text{s}$ | **`DEMONSTRATION`** | `data/scenarios/scen-tehri-001-baseline/` | Demonstration | **Synthetic test fixture**; isolated from authoritative operational mode. |

---

## 3. Scientific Terminology Enforcements & Guardrails

The following terminology rules are locked for all UI components, tooltips, explainers, and documentation:

1. **Artifact Integrity:** Replace all occurrences of `"bit-exact"` with `"artifact integrity / provenance verified"`. (SHA-256 verifies byte-level file identity, not physical model perfection).
2. **Breach Invert:** Display as `"635m breach invert — model assumption"`. Never present as a surveyed datum.
3. **Travel Speed:** Display as `"Configured baseline travel-speed assumption: 50 km/h (actual traffic conditions may vary; congestion not modeled)"`.
4. **Road Flood Impact:** Display as `"road flood-impact / inundation status"`. Never claim structural road collapse unless modeled by structural mechanics.
5. **Flood Visualization:** Display as `"Flood propagation visualized from native HEC-RAS temporal states"`. Never describe as a separate fluid simulation engine.
6. **Feasibility Language:** Always include the limitation: `"Feasible under selected flood scenario and configured assumptions. Not a physical guarantee of safety."` Never display `SAFE` or `UNSAFE`.
7. **Elevation Attribution:** Display settlement/shelter elevations as `"Terrain-derived elevation (Copernicus GLO-30 DSM)"`.
8. **Road Network Attribution:** Display roads as `"OpenStreetMap-derived road network"`.

---

## 4. Operational Gate Sequence

The implementation proceeds strictly through the following sequential gates:

- [x] **GATE A — DATA REALITY LOCK** *(Completed & Locked)*
- [ ] **GATE B — 3D TERRAIN + HYDRAULIC MAP** *(Operational 3D Hero + Extent/Depth/Arrival Modes)*
- [ ] **GATE C — REAL ROAD INTEGRATION & COUPLING** *(150m Corridor + Directional Route + Red Limiting Segment)*
- [ ] **GATE D — TEMPORAL FLOOD SIMULATION** *(Native 5-min states T+00 … T+120 + Play/Pause/Scrub)*
- [ ] **GATE E — VISUAL EXPLAINERS** *(11 Interactive Chapters bound to active scenario data)*
- [ ] **GATE F — ARCHITECTURE & FEASIBILITY** *(Technical pipeline diagrams A–J + Tech Stack)*
- [ ] **GATE G — RENDERED VALIDATION & SCREENSHOT AUDIT** *(Browser execution across all 12 key viewports)*
- [ ] **GATE H — HUMAN PILOT** *(Internal dry-run under Gate 5B blinding protocol)*

---

## 5. Gate A Acceptance Statement

`DATA_REALITY_LOCK.md` is complete, verified against repository artifacts, and authoritative. All data values have explicit provenance classifications, coordinate reference systems, and operational limitations. Gate A is hereby marked **PASSED**.
