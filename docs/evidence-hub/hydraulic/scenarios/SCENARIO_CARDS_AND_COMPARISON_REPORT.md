**JALRAKSHAK — SCENARIO CARDS & COMPARISON REPORT**
JalRakshak SIH'26 — Evidence Hub

# Scenario comparison


| Scenario | Qp | Peak time | Arrival | Travel | Buffer | Deadline | Limiting edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MINIMUM | 28,500 | 1.5 h | T+95:00 | 12:39 | 03:00 | T+79:21 | R02-E07 |
| CENTRAL | 65,000 | 1.0 h | T+60:00 | 12:39 | 03:00 | T+44:21 | R02-E07 |
| MAXIMUM | 115,000 | 0.75 h | T+45:00 | 12:39 | 03:00 | T+29:21 | R02-E07 |


# Interpretation

The scenario family is a conditional sensitivity set, not proof that the hydrographs are exhaustive or calibrated.

# Decision sequence

- Extract scenario-specific hydraulic arrival for each route edge.
- Compute cumulative travel time.
- Subtract the configured buffer.
- Take the minimum candidate deadline.
- Return the argmin as limiting segment.
- Propagate missing evidence as DATA GAP.

# Isolation requirements

- Scenario switching must change the hydraulic evidence source.
- Frontend must consume backend-authoritative decisions.
- No scenario-specific hard-coded route status.
- Independent synthetic test worlds prove software isolation, not physical validation.
