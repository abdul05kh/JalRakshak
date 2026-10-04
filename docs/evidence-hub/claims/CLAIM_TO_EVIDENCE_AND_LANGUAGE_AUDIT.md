**JALRAKSHAK — CLAIM-TO-EVIDENCE & LANGUAGE AUDIT**
JalRakshak SIH'26 — Evidence Hub

# Claim matrix


| Claim | Evidence | Status | Safe wording |
| --- | --- | --- | --- |
| Native HEC-RAS 2D ingestion | Native HDF5 + adapter tests | GREEN | Native HEC-RAS 2D result ingestion is demonstrated. |
| Arrival extraction | Native states + documented threshold | GREEN | Arrival time is derived from the documented hydraulic threshold and states. |
| Evacuation deadline | EWE + road tests | GREEN | Deadline is deterministically computed from arrival, travel time and buffer. |
| Limiting segment | Argmin logic | GREEN | Limiting segment is the edge producing the minimum candidate deadline. |
| 3D terrain context | Real DEM + viewer | GREEN | 3D view provides sourced terrain/hydraulic context. |
| Scenario comparison | Prepared min/central/max | GREEN / scoped | Prepared hydraulic scenarios can be compared. |
| GEE observation | Sentinel-1 workflow | YELLOW | Research-oriented satellite discrepancy workflow. |
| SPH | Interface | YELLOW | External SPH integration interface exists. |
| Delft3D | Interface | YELLOW | External Delft3D integration interface exists. |
| Damage prediction | Exposure framework | ORANGE | Exposure/loss framework; validated financial damage prediction not established. |
| Tehri physical validation | No field benchmark | RED | Physical validation is not established. |
| Universal arbitrary-river support | Independent test worlds | YELLOW | Scenario isolation/data-driven loading demonstrated; universal support not established. |


# Words to ban

- 99% accurate
- 100% accurate
- fully physically validated
- calibrated Tehri model
- real-time dynamic traffic
- AI predicts the flood
- guaranteed evacuation
- safe route
- SPH/Delft3D fully implemented
- satellite ground truth
- production ready
- operationally certified

# Preferred language

- demo-ready research prototype
- conditionally validated to current scope
- software-verified
- native HEC-RAS result ingestion
- configured assumption
- research-only remote-sensing comparison
- external solver interface
- physical validation not established
- conditional evacuation timing decision
- limiting segment under the selected scenario
