# Gate 5B Experimental Impact & Parity Audit
**Audit Date:** 2026-09-24  
**Audit Purpose:** Verify that UI simplifications maintain strict experimental parity, do not contaminate Condition A, and introduce zero answer leakage.  

---

## 1. Experimental Condition Boundaries

### Condition A: Raw Hydraulic Presentation (Baseline Benchmark)
- **Included Elements:**
  1. Hydraulic Scenario selection ($Q_p = 28.5k, 65k, 115k\text{ m}^3/\text{s}$).
  2. 2D Hydrodynamic inundation hazard map (extent, depth polygons).
  3. Interactive point probe exposing arrival time, water depth, and flow velocity.
  4. Road network graph geometry.
  5. Origin settlement and evacuation shelter markers.
- **Strictly Excluded Elements (No Answer Leakage):**
  - NO precomputed evacuation window deadlines.
  - NO route feasibility badges (`FEASIBLE` / `INFEASIBLE`).
  - NO highlighted limiting segment identification.
  - NO automated EWE arithmetic derivation.
- **Integrity Status:** Condition A remains fully functional, authentic, and experimentally fair. It is not artificially crippled or obfuscated.

### Condition B: JalRakshak Decision-Oriented Representation
- **Included Elements:**
  1. Primary Level 1 Decision View: Scenario, Status Badge, Latest Feasible Departure ($T+44:21$), Margin ($+44.4\text{ min}$).
  2. Secondary Level 2 Arithmetic Decomposition: $\text{Arrival} - \text{Travel} - \text{Buffer} = \text{Deadline}$.
  3. Limiting road segment ($R02$) visual highlight and attribute breakdown.
  4. Progressive disclosure drawers for technical provenance and model assumptions.
- **Integrity Status:** Condition B presents the deterministic output of the EWE engine and spatial road coupling without altering ground truth.

---

## 2. Parity & Counterbalancing Audit Matrix

| Experimental Variable | Condition A (Raw Hydraulic) | Condition B (JalRakshak Decision) | Parity Evaluation |
| :--- | :--- | :--- | :--- |
| **Underlying Simulation** | Frozen HEC-RAS 7.0.1 2D run ($Q_p = 65,000\text{ m}^3/\text{s}$) | Frozen HEC-RAS 7.0.1 2D run ($Q_p = 65,000\text{ m}^3/\text{s}$) | **IDENTICAL (100% PARITY)** |
| **Road Network** | 10.53 km network (R01, R02) | 10.53 km network (R01, R02) | **IDENTICAL (100% PARITY)** |
| **Origin / Destination** | Malidewal (VILL-02) → Chamba (SHELTER-01) | Malidewal (VILL-02) → Chamba (SHELTER-01) | **IDENTICAL (100% PARITY)** |
| **Information Content** | Contains raw physical parameters to deduce route usability | Contains computed route usability derived from physical parameters | **CONVERTED REPRESENTATION** |
| **Task Wording** | *"Under the displayed scenario and configured rules, is the route feasible and what is the latest departure?"* | *"Under the displayed scenario and configured rules, is the route feasible and what is the latest departure?"* | **IDENTICAL TASK QUESTION** |
| **Scoring Rules** | Objective scoring against ground truth ($T+44:21 \pm 1\text{ min}$) | Objective scoring against ground truth ($T+44:21 \pm 1\text{ min}$) | **IDENTICAL SCORING ENGINE** |

---

## 3. Conclusion
The UI refactor strictly respects experimental validity. No answer leakage was introduced into Condition A, and Condition B does not rely on subjective or non-deterministic heuristics.
