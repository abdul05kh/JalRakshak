# GATE 4 API CONTRACT
## Complete Specification for REST Endpoints, Payloads, and Provenance

**Document ID:** `DOC-GATE4-API-CONTRACT-001`  
**Status:** APPROVED  
**Date:** 2026-09-24  

---

## 1. REST API Endpoints Overview

| Method | Path | Summary |
| :--- | :--- | :--- |
| `GET` | `/api/scenarios` | List all available hydrodynamic scenarios (frozen Gate 3B & test fixtures) |
| `GET` | `/api/scenarios/{scenario_id}` | Retrieve scenario metadata, boundary inputs, and HDF5 checksum |
| `GET` | `/api/hydraulic/cells` | Retrieve 2D mesh cell centroids, terrain elevations, and max depths |
| `GET` | `/api/hydraulic/arrival` | Retrieve cell-by-cell flood arrival time series for selected threshold |
| `GET` | `/api/roads/exposure` | Retrieve road network segment exposure (arrival, max depth, status) |
| `GET` | `/api/routes` | Query candidate routes between origin and destination nodes |
| `POST` | `/api/ewe/evaluate` | Evaluate evacuation feasibility, deadline, margin, and limiting segment |
| `POST` | `/api/ewe/compare` | Multi-scenario comparison of a given evacuation route |
| `GET` | `/api/provenance/{scenario_id}` | Retrieve complete auditable provenance tree and cryptographic SHA-256 |

---

## 2. Detailed Request / Response Schemas

### 2.1 POST `/api/ewe/evaluate`
**Request Payload:**
```json
{
  "scenario_id": "SCENARIO_CENTRAL",
  "origin_id": "VILL-02",
  "destination_id": "SHELTER-01",
  "departure_time_utc": "2026-09-24T00:00:00Z",
  "constraints": {
    "safety_buffer_min": 3.0,
    "depth_limit_m": 0.30,
    "velocity_limit_mps": 1.00
  }
}
```

**Response Payload:**
```json
{
  "scenario_id": "SCENARIO_CENTRAL",
  "scenario_name": "Tehri 15km Central Breach Scenario",
  "source_type": "HECRAS_REAL_RESULT",
  "origin_name": "Malidewal Lowland Village",
  "destination_name": "Chamba High-Ground Relief Shelter",
  "requested_departure_utc": "2026-09-24T00:00:00Z",
  "safety_buffer_min": 3.0,
  "depth_limit_m": 0.3,
  "velocity_limit_mps": 1.0,
  "algorithm_version": "1.0.0",
  "primary_status": "FEASIBLE",
  "primary_route": {
    "route_index": 1,
    "name": "Route A (N-MALIDEWAL -> N-CHAMBA)",
    "status": "FEASIBLE",
    "total_distance_m": 6888.6,
    "total_travel_time_min": 9.18,
    "deadline_utc": "2026-09-24T06:00:00Z",
    "margin_min": 360.0,
    "limiting_segment": null,
    "edges": [
      {
        "edge_id": "R01",
        "u": "N-MALIDEWAL",
        "v": "N-CHAMBA",
        "road_class": "PRIMARY",
        "speed_kmh": 45.0,
        "length_m": 6888.6,
        "travel_time_min": 9.18,
        "cumulative_travel_min": 9.18,
        "flood_arrival_s": null,
        "flood_arrival_utc": null,
        "max_depth_m": 0.0,
        "max_velocity_mps": 0.0,
        "edge_deadline_s": null,
        "edge_deadline_utc": null,
        "edge_feasible": true,
        "failure_reason": null
      }
    ],
    "explanation": "Route is fully FEASIBLE. All segments traverse high ground above modelled flood elevations. Total route travel time: 9.18 min."
  },
  "alternatives": [],
  "validation_status": "VALIDATION_NOT_ESTABLISHED",
  "provenance": {
    "scenario_id": "SCENARIO_CENTRAL",
    "solver": "USACE HEC-RAS 2D Hydrodynamic Engine (HEC-RAS 7.0.1)",
    "artifact_sha256": "c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78",
    "terrain": "COPERNICUS GLO-30 DSM",
    "vertical_datum": "NOT_ESTABLISHED",
    "physical_validation": "NOT_ESTABLISHED",
    "arrival_threshold_m": 0.3,
    "safety_buffer_min": 3.0
  }
}
```

---

## 3. Provenance Endpoint (`/api/provenance/{scenario_id}`)
Returns full cryptographic checksum, solver version, mesh resolution, boundary condition files, and timestamped execution audit log.
