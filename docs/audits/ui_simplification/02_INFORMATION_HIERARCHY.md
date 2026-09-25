# JalRakshak Information Hierarchy Architecture (3-Tier Model)
**Audit Date:** 2026-09-24  
**Framework:** Emergency Decision Support Cognitive Engineering Standard  

---

## 1. Hierarchy Objectives
The interface transforms raw 2D hydraulic flood propagation fields into a deterministic, high-clarity emergency evacuation decision. The visual design enforces a 3-tier hierarchy to enable sub-5-second comprehension for emergency officers under severe time pressure.

```
+-------------------------------------------------------------------------+
| LEVEL 1: IMMEDIATE DECISION (< 5 SECONDS COMPREHENSION)                |
| - Scenario Name (e.g. CENTRAL FLOOD SCENARIO)                           |
| - Route Origin -> Destination (e.g. Malidewal -> Chamba)                |
| - Operational Status: [ FEASIBLE ]                                      |
| - LATEST FEASIBLE DEPARTURE: T+44:21 (Large Monospace Hero Metric)      |
| - Decision Margin: +44.4 min                                            |
| - Limiting Segment: R02                                                 |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| LEVEL 2: RECONSTRUCTIBLE WHY / ARITHMETIC EQUATION (< 30 SECONDS)       |
| - Flood reaches route:       T+60:00 (3,600 s)                          |
| - minus Travel time:       - 12:39   (759.2 s)                          |
| - minus Safety buffer:     - 03:00   (180.0 s)                          |
| ----------------------------------------------------------------------- |
| - equals Latest Departure: = T+44:21 (2,660.8 s)                        |
| - Bottleneck details: Segment R02, Arrival 60m, Depth 0.3m              |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| LEVEL 3: EVIDENCE & SCIENTIFIC PROVENANCE (PROGRESSIVE DISCLOSURE)      |
| - Hydraulic Engine: USACE HEC-RAS 7.0.1 2D SWE                          |
| - Spatial Coupling: 150 m corridor, <= 50 m densification               |
| - Travel Model: Static 50 km/h traversal on road graph edges            |
| - Boundary Disclosure: Computational validation complete; Human         |
|   decision usefulness not yet validated                                |
| - Bitwise Reproducibility: SHA-256 artifact cryptographic digests       |
+-------------------------------------------------------------------------+
```

---

## 2. Detailed Tier Specifications

### Level 1: Immediate Decision
- **Audience:** Emergency Incident Commander, Evacuation Coordinator.
- **Visual Weight:** Highest contrast, largest font sizes (22px status, 28px monospace deadline).
- **Key Fields:** Active scenario name, Origin/Destination label, Decision Status Badge (`FEASIBLE` / `LOW MARGIN` / `INFEASIBLE` / `DATA GAP`), Latest Feasible Departure (`T+44:21`), Margin (`+44.4 min`), Limiting Segment (`R02`).
- **Excluded Content:** No solver hashes, no mesh configurations, no database IDs, no raw coordinates.

### Level 2: Reconstructible Why (Arithmetic Explanation)
- **Audience:** Planning Officer, Operations Technical Advisor.
- **Visual Weight:** Structured card with clear mathematical subtraction layout.
- **Arithmetic Identity:**
  $$\text{Deadline} = \text{Flood Arrival at Limiting Segment} - \text{Cumulative Travel Time} - \text{Configured Safety Buffer}$$
  $$\text{Deadline} = 3600\text{ s } (T+60:00) - 759.24\text{ s } (12:39) - 180\text{ s } (03:00) = 2660.76\text{ s } (T+44:21)$$
- **Limiting Segment Inspector:** Exposes why $R02$ is the critical bottleneck, showing flood arrival, water depth, and travel time.

### Level 3: Evidence & Scientific Provenance (Progressive Disclosure)
- **Audience:** Forensic Auditor, SIH Scientific Evaluator, Hydrologist.
- **Location:** Slide-out Provenance Drawer & Model QA Modal.
- **Contents:**
  - HEC-RAS 7.0.1 solver metadata and mesh type.
  - DEM source reference (CartoDEM 10m / FABDEM 30m hydro-enforced).
  - Exact 150m spatial road coupling corridor specification.
  - Static engineering travel-time assumptions ($50\text{ km/h}$).
  - Cryptographic SHA-256 hashes verifying artifact integrity.
  - Scientific validation boundaries: explicitly stating computational validation is complete while human usability validation is pending.
