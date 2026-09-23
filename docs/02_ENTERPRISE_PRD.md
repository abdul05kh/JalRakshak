# 02 — Enterprise PRD

## 1. Functional requirements
- **FR-001 Scenario creation:** Dam ID, breach width (m), formation time (min), breach elevation (m), simulation horizon, terrain dataset ID.
- **FR-002 Scenario validation:** Reject negative breach width, zero duration, or missing CRS.
- **FR-003 Hydraulic artifact registration:** Immutable artifacts (depth, velocity, arrival time, inundation, solver log, checksums).
- **FR-004 Map:** Base map, inundation extent, depth, velocity, arrival time, critical assets, roads, evacuation routes.
- **FR-005 Arrival query:** Point query for arrival time, max depth, max velocity.
- **FR-006 / FR-007 Origin & Destination:** Village settlement, hospital, school, shelter selection.
- **FR-008 / FR-009 EWE Route calculation & feasibility:** $D_{\text{deadline}} = \min_i(A_i - T_i - B)$.
- **FR-010 Scenario comparison:** Compare depth, arrival time, route status between scenarios.
- **FR-011 Provenance:** Full source manifests, solver version, artifact SHA-256 hashes.
- **FR-012 Validation:** Analytical benchmark, satellite extent IoU metrics, QA status.
