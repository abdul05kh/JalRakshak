# 11 — UI Value Consistency & Round-Trip Verification
**Audit Date:** 2026-09-24  
**Audit Purpose:** Verify round-trip value integrity across Database, API, State, DOM, and Map Tooltips.  

---

## 1. Round-Trip Consistency Matrix

| Parameter | Backend Value | API Serialized Value | React State Value | DOM Rendered String | Map Tooltip String | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Active Scenario** | `SCENARIO_CENTRAL` | `"SCENARIO_CENTRAL"` | `"SCENARIO_CENTRAL"` | `CENTRAL FLOOD SCENARIO` | `Tehri 15km Central` | **CONSISTENT** |
| **Peak Discharge** | $65,000.0$ | $65000.0$ | $65000$ | `65,000 m³/s` | `65,000 m³/s` | **CONSISTENT** |
| **Flood Arrival** | $3,600.0$ | `"2026-09-24T01:00:00Z"` | `3600` | `T+60:00` | `Flood Arrival: 01:00 UTC` | **CONSISTENT** |
| **Travel Time** | $759.24$ | $12.65$ | $12.65$ | `12:39` | `Travel Time: 12.6 min` | **CONSISTENT** |
| **Safety Buffer** | $180.0$ | $3.0$ | $3.0$ | `03:00` | `Safety Buffer: 3 min` | **CONSISTENT** |
| **Departure Deadline** | $2,660.76$ | `"2026-09-24T00:44:21Z"` | `2661` | `T+44:21` | `Deadline: 00:44 UTC` | **CONSISTENT** |
| **Limiting Segment** | `"R02"` | `"R02"` | `"R02"` | `R02` | `LIMITING SEGMENT: R02` | **CONSISTENT** |

---

## 2. Verdict
Zero divergence detected across the entire data lifecycle. All values rendered in the DOM reflect the single-source backend computational engine.
