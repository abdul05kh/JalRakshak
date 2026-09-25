# 12 — Raw Hydraulic Condition Parity & Usability Audit
**Audit Date:** 2026-09-24  
**Audit Scope:** Verification of experimental parity between Condition A (Raw Hydraulic baseline) and Condition B (Decision-support representation).  

---

## 1. Experimental Parity Rules
Condition A provides genuine, complete hydraulic simulation data (2D inundation depth/extent map, interactive point interrogation probe, road vectors, and origin/destination markers). It does not contain pre-computed departure deadlines, feasibility badges, or highlighted limiting bottlenecks.

---

## 2. Information Parity Ledger

| Information Component | Condition A (Raw Hydraulic) | Condition B (JalRakshak Decision) | Parity Assessment |
| :--- | :--- | :--- | :--- |
| **Hydraulic Inundation** | 2D hydrodynamic extent layer | 2D hydrodynamic extent layer | **IDENTICAL** |
| **Point Probe** | Click-to-query arrival time, depth, velocity | Click-to-query arrival time, depth, velocity | **IDENTICAL** |
| **Road Network** | 10.53 km graph vectors | 10.53 km graph vectors | **IDENTICAL** |
| **Origins & Shelters** | Settlement and shelter markers | Settlement and shelter markers | **IDENTICAL** |
| **Feasibility Assessment**| User must manually evaluate | Computed automatically by EWE | **EXPERIMENT MANIPULATION** |
| **Departure Deadline** | User must calculate manually | Displayed prominently as $T+44:21$ | **EXPERIMENT MANIPULATION** |
| **Limiting Segment** | User must deduce from spatial intersection | Displayed and highlighted as $R02$ | **EXPERIMENT MANIPULATION** |

---

## 3. Parity Verdict
Condition A is experimentally fair, scientifically authentic, and provides all necessary data for manual calculation without artificial sabotage.
