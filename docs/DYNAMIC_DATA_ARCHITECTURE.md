# JalRakshak Dynamic Data Architecture (RC3)

## 1. Executive Summary & Core Principle

JalRakshak is a dam-break flood emergency evacuation decision-support system designed to operate as a **purely data-driven, scenario-dynamic pipeline**.

### Core Architecture Flow
```
AUTHORITATIVE DATA (HEC-RAS HDF5, OSM Road Graph, GIS Evacuation Points, GLO-30 DSM)
        ↓
DATA INGESTION & NORMALIZATION (Strict Read-Only, SI Units, EPSG:32644 Projection)
        ↓
DERIVED HYDRAULIC PRODUCTS (WSE, Depth, Hydrodynamic Vector Velocity, Arrival Times)
        ↓
SPATIAL COUPLING (150m Corridor, ≤50m Densification, Peak Hazard Aggregation)
        ↓
EVACUATION WINDOW ENGINE (Generic EWE, Zero Scenario-Specific Knowledge)
        ↓
REST API & LINEAGE PROVENANCE (Standardized Contracts, Zero Hardcoded Answers)
        ↓
FRONTEND RENDERING & CINEMATIC SIMULATION (Pure Visualization Layer)
```

---

## 2. Source-of-Truth Matrix

Every operational scientific domain has exactly **ONE** authoritative source of truth. Dual-authority patterns and hardcoded frontend matrices are strictly eliminated.

| Domain | Authoritative Source of Truth | Formats / Files | Prohibited Duplicate Patterns (Eliminated) |
| :--- | :--- | :--- | :--- |
| **Hydraulics** | Native HEC-RAS 2D Unsteady HDF5 | `*.p01.hdf` | Hardcoded arrival matrices (`LOCKED_SCENARIO_DECISIONS`), static flood percentages. |
| **Road Network** | Authoritative GeoJSON / OSM Graph | `data/roads/roads.json` | Hardcoded coordinate arrays in TypeScript (`R02_BASE_GEOMETRIES`). |
| **Evacuation Points** | Authoritative Infrastructure GIS | `data/study_area/evacuation_points.json` | In-code hospital/shelter definitions (`HOSP-01..04` in `TerrainEngine.ts`). |
| **Hydraulic Velocity** | Native Face/Cell Velocities & Shallow Wave Celerity | HEC-RAS HDF / Hydrodynamics | Fixed fallback constant (`2.4 m/s` eliminated from `road_hydraulic_mapper.py`). |
| **Evacuation Window** | Pure EWE Algorithm ($D_i = A_i - T_i - B$) | `backend/app/domain/ewe_engine.py` | String-based node mapping, 6-hour magic deadlines, 99999 arrival placeholders. |
| **Operational Config**| Centralized YAML/JSON Schema | `config/operational.yaml` | Scattered magic numbers for buffer, corridor, depth, and speed thresholds. |
| **Terrain Elevation** | Copernicus GLO-30 DSM | GeoTIFF / Native DEM | Arbitrary 600m fallbacks; missing elevations report `DATA_GAP`. |

---

## 3. Data Lineage & Provenance Model

Every decision response and point query emitted by the JalRakshak API carries a complete, machine-readable derivation chain:

```json
{
  "scenario_id": "SCENARIO_CENTRAL",
  "provenance": {
    "hydraulic_solver": "HEC-RAS 2D Unsteady",
    "mesh_resolution_m": 75,
    "spatial_crs": "EPSG:32644",
    "artifact_hashes": {
      "hdf5_primary": "33b6644f849fffc1d23aa3a758782a1ee8fb11029c0b05b4ee317079d854cf53",
      "roads_network": "250493010f64c6735dbd09438093d58231c5aa811a2f6cae6fec0cbefcb97e4c"
    },
    "configuration": {
      "safety_buffer_min": 3.0,
      "depth_threshold_m": 0.3,
      "velocity_threshold_mps": 1.0,
      "corridor_radius_m": 150.0,
      "densification_step_m": 50.0
    },
    "derivation_chain": [
      "HEC-RAS HDF5 Temporal Extraction",
      "Spatial Buffer Densification & Road-Cell Coupling",
      "Dynamic Route Hydraulic Mapping",
      "Evacuation Window Engine (EWE) Clearance Calculation"
    ]
  }
}
```

---

## 4. Central Operational Configuration Model

Operational assumptions are defined in [`config/operational.yaml`](file:///d:/projects/JalRakshak/config/operational.yaml) and validated via `OperationalConfig` schema:

```yaml
version: "1.0.0"
hydraulic:
  arrival_depth_threshold_m: 0.30
  arrival_velocity_threshold_mps: 1.00
  minimum_wse_rise_m: 0.05
road_coupling:
  corridor_m: 150.0
  densification_m: 50.0
  aggregation_method: "MAX_HAZARD"
evacuation:
  safety_buffer_min: 3.0
  max_allowable_depth_m: 0.30
  max_allowable_velocity_mps: 1.00
travel_time:
  model: "DYNAMIC_EDGE_SPEED"
  default_rural_speed_kmh: 50.0
  max_search_distance_m: 2500.0
```

---

## 5. Generic Evacuation Window Engine (EWE)

The EWE is completely decoupled from any scenario name, route name, or dam name. It operates exclusively on generic topological edges:

$$\text{Deadline}_i = \text{Arrival}_i - \text{CumulativeTravel}_i - \text{Buffer}$$
$$\text{Route Deadline} = \min_{i \in \text{Route}} (\text{Deadline}_i)$$
$$\text{Limiting Edge} = \operatorname{argmin}_{i \in \text{Route}} (\text{Deadline}_i)$$

### Error & Data Gap Semantics
- **No Inundation**: If an edge is never inundated during the simulation duration, $\text{Arrival}_i = \infty$ (`null` in JSON), and the edge imposes no temporal evacuation constraint.
- **Unresolved Snap**: If a coordinate cannot be snapped to the network within `max_search_distance_m`, the API returns `UNRESOLVED_LOCATION` (`DATA_GAP`), never defaulting to an arbitrary village.
- **Missing Hydraulic Data**: If a cell is outside the model domain, it returns `DATA_GAP` without fabricating a plausible depth or velocity.
