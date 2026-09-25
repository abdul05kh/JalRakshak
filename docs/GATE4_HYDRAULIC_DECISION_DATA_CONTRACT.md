# GATE 4 HYDRAULIC DECISION DATA CONTRACT
## Scientific Specification of the Hydraulic-to-Decision Interface

**Document ID:** `DOC-GATE4-DATA-CONTRACT-001`  
**Status:** APPROVED & LOCKED  
**Date:** 2026-09-24  
**Author:** Hydraulic Decision-Support Engineer & Backend Architect  

---

## 1. Scope and Objective

This data contract defines the unambiguous, type-safe, and scientifically validated schema connecting raw/derived hydrodynamic simulation outputs to downstream evacuation routing algorithms within the JalRakshak Evacuation Window Engine (EWE).

Every downstream module (spatial mapping, road exposure calculation, route feasibility, and provenance generation) must adhere to these schemas without exception.

---

## 2. Cell-Level Hydraulic State Schema

This schema defines the spatio-temporal state of individual 2D computational cells across the simulation domain.

| Field Name | Type | Units | CRS | Source | Native / Derived | Transformation / Definition | Missing-Value Behavior | Validation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scenario_id` | `string` | N/A | N/A | Manifest | Native Config | Unique identifier (`SCENARIO_CENTRAL`, etc.) | Error (Reject) | Non-empty, alphanumeric + underscores |
| `timestamp_s` | `float64` | Seconds ($\text{s}$) | N/A | HDF5 Output | Native | Relative seconds from simulation start ($t = 0\text{ s}$) | Error (Reject) | $\ge 0.0$ and monotonically increasing |
| `time_date_stamp` | `string` | UTC / Text | N/A | HDF5 Output | Native | HEC-RAS format (`DDMonYYYY HH:MM:SS`) | Nullable | Valid HEC-RAS timestamp string |
| `cell_id` | `int64` | Index | N/A | HDF5 Geometry | Native | 0-indexed cell identifier ($0 \le c < N_{\text{cells}}$) | Error (Reject) | $0 \le c < N_{\text{cells}}$ |
| `x` | `float64` | Meters ($\text{m}$) | `EPSG:32644` | HDF5 Geometry | Native | Cell centroid Easting | Error (Reject) | UTM Zone 44N valid range ($200,000 \le x \le 300,000$) |
| `y` | `float64` | Meters ($\text{m}$) | `EPSG:32644` | HDF5 Geometry | Native | Cell centroid Northing | Error (Reject) | UTM Zone 44N valid range ($3,300,000 \le y \le 3,400,000$) |
| `terrain_elevation` | `float32` | Meters ($\text{m}$) | `EPSG:32644` | HDF5 Geometry | Native | Minimum bed/cell elevation $z_{\text{min}}(c)$ | Error (Reject) | Finite real number, $500\text{ m} \le z \le 2000\text{ m}$ for reach |
| `water_surface_elevation` | `float32` | Meters ($\text{m}$) | `EPSG:32644` | HDF5 Results | Native | Water Surface Elevation $\text{WSE}(c, t)$ | Dry / NaN handled | $\text{WSE} \ge z_{\text{min}}(c)$ or flagged as dry |
| `depth` | `float32` | Meters ($\text{m}$) | N/A | Derived | Derived | $d(c, t) = \max(0.0, \text{WSE}(c, t) - z_{\text{min}}(c))$ | $0.0\text{ m}$ if dry | $d \ge 0.0\text{ m}$, finite real number |
| `face_velocity` | `float32` | $\text{m/s}$ | N/A | HDF5 Results | Native (Face-Normal) | Face-normal velocity component on cell faces | Nullable / $0.0$ | Finite real number |
| `arrival_time_s` | `float64` | Seconds ($\text{s}$) | N/A | Derived | Derived | $\min \{ t \mid d(c, t) \ge H \}$, where $H$ is threshold | `null` / `inf` (`NOT_REACHED`) | $t \ge 0.0$ or `null` if unflooded |

---

## 3. Road Segment Exposure Schema

This schema defines the mapped hydraulic hazard aggregated onto vector road network segments.

| Field Name | Type | Units | CRS | Source | Native / Derived | Transformation / Definition | Missing-Value Behavior | Validation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `road_id` | `string` | N/A | N/A | Road Network | Native Config | Unique road identifier (`R01`, `R02`, etc.) | Error (Reject) | Must match road database key |
| `u` | `string` | Node ID | N/A | Road Network | Native Graph | Origin junction node ID | Error (Reject) | Must exist in topology graph |
| `v` | `string` | Node ID | N/A | Road Network | Native Graph | Destination junction node ID | Error (Reject) | Must exist in topology graph |
| `road_class` | `string` | N/A | N/A | Road Network | Native Config | Road hierarchy (`PRIMARY`, `SECONDARY`, `TERTIARY`, `LOCAL`) | `SECONDARY` default | Standard enum value |
| `length_m` | `float64` | Meters ($\text{m}$) | `EPSG:32644` | GIS Calculation | Calculated | Geodesic / projected LineString length | Error (Reject) | $> 0.0\text{ m}$ (zero-length rejected) |
| `speed_kmh` | `float64` | $\text{km/h}$ | N/A | Assumption | `ENGINEERING_ASSUMPTION` | Base operational vehicle speed | `DATA_GAP` / Error | $10 \le \text{speed} \le 100\text{ km/h}$ |
| `travel_time_min` | `float64` | Minutes | N/A | Calculation | Derived | $(\text{length\_m} / (\text{speed\_kmh} \times 1000 / 60))$ | Error (Reject) | $> 0.0\text{ min}$ |
| `first_flood_arrival_s` | `float64` | Seconds ($\text{s}$) | N/A | Spatial Engine | Derived | $\min_{c \in \mathcal{C}_{\text{road}}} t_{\text{arr}}(c, H)$ | `null` (`99999` / Unaffected) | $\ge 0.0\text{ s}$ or `null` |
| `peak_depth_m` | `float32` | Meters ($\text{m}$) | N/A | Spatial Engine | Derived | $\max_{c \in \mathcal{C}_{\text{road}}, t} d(c, t)$ | $0.0\text{ m}$ | $\ge 0.0\text{ m}$ |
| `peak_face_velocity_mps` | `float32` | $\text{m/s}$ | N/A | Spatial Engine | Derived | Max cell face velocity in coupling buffer | $0.0\text{ m/s}$ | $\ge 0.0\text{ m/s}$ |
| `status` | `string` | Enum | N/A | Rules Engine | Derived | `OPEN`, `AT_RISK`, `INUNDATED`, `DATA_GAP` | `DATA_GAP` | Must be one of 4 strict statuses |

---

## 4. Route Evaluation & EWE Decision Contract

This schema defines the response structure for a multi-edge evacuation route evaluated by the Evacuation Window Engine.

| Field Name | Type | Units | Description | Missing-Value Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `route_id` | `string` | N/A | Identifier of evaluated route option | Reject |
| `status` | `string` | Enum | Feasibility: `FEASIBLE`, `LOW_MARGIN`, `INFEASIBLE`, `DATA_GAP`, `NO_FEASIBLE_ROUTE` | `DATA_GAP` |
| `latest_feasible_departure_utc`| `string` | ISO 8601 | $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ mapped to UTC clock time | `null` if infeasible or data gap |
| `margin_min` | `float64` | Minutes | $M = D_{\text{deadline}} - D_{\text{decision}}$ | `null` if infeasible or data gap |
| `limiting_segment` | `object` | Limiting Edge Schema | Exact edge $i$ producing minimum evacuation window | `null` if high-ground or data gap |
| `travel_time_min` | `float64` | Minutes | Total route traversal time | Reject |
| `safety_buffer_min` | `float64` | Minutes | Configured safety buffer parameter $B$ | Mandatory |
| `scenario_id` | `string` | Enum | Hydrodynamic scenario identifier (`SCENARIO_CENTRAL`, etc.) | Mandatory |
| `assumptions` | `object` | Ledger Schema | Active parameter ledger (`ENGINEERING_ASSUMPTION`, etc.) | Mandatory |
| `provenance` | `object` | Provenance Schema | Cryptographic SHA-256 and HEC-RAS execution lineage | Mandatory |
| `reason` | `string` | Text | Deterministic rule-based causal explanation | Non-empty structured string |

---

## 5. Critical Scientific Disclaimers in Contract

1. **Depth is Derived:** `depth` is calculated from $\max(0, \text{WSE} - z_{\text{min}})$. It is **never** represented as a native HEC-RAS output.
2. **Velocity is Face-Normal:** `face_velocity` represents the normal component across cell boundary faces and is distinct from cell-averaged velocity magnitude.
3. **No "SAFE" Status:** Roads and routes that remain unflooded are classified as `OPEN` or `FEASIBLE`, **never** `SAFE`, reflecting the lack of physical field calibration.
