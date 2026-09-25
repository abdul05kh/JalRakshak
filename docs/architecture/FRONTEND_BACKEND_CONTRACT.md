# FRONTEND / BACKEND API CONTRACT

**Document:** Frontend-Backend Interface Contract  
**Version:** RC2.1  
**Status:** ACTIVE  

---

## 1. REST Endpoints

### A. `GET /api/v1/scenarios`
Returns authoritative scenario metadata (`SCENARIO_CENTRAL`, `SCENARIO_MINIMUM`, `SCENARIO_MAXIMUM`).

### B. `GET /api/v1/scenarios/{scenario_id}/layers`
Returns hydraulic inundation polygon GeoJSON, project road network GeoJSON, and evacuation point shelters.

### C. `POST /api/v1/routes/analyze`
**Request Payload:**
```json
{
  "scenario_id": "SCENARIO_CENTRAL",
  "route_id": "R02",
  "buffer_min": 3.0
}
```

**Authoritative Response Schema:**
```json
{
  "scenario_id": "SCENARIO_CENTRAL",
  "route_id": "R02",
  "status": "FEASIBLE",
  "latest_departure_time": "T+44:21",
  "flood_arrival_time": "T+60:00",
  "travel_time": "12:39",
  "safety_buffer": "03:00",
  "limiting_edge_id": "R02-E07",
  "limiting_edge_arrival": "T+60:00",
  "limiting_edge_travel": "02:39"
}
```

---

## 2. Invariant Rules
- The frontend must never fall back to cached or default departure deadlines on API failure.
- If `/routes/analyze` fails or times out, the UI must render `DECISION UNAVAILABLE` with an explicit diagnostic alert banner.
