# Safety Language Audit & Epistemic Boundary Verification
**Audit Date:** 2026-09-24  
**Audit Purpose:** Comprehensive search and eradication of misleading, absolute, or safety-guaranteeing terminology across the frontend interface.  

---

## 1. Safety Language Principles
In emergency decision-support engineering, confusing **computational feasibility** with **absolute physical safety** is a critical failure mode. The system must never lead an operator to believe that passing a hydraulic threshold guarantees survival against unmodeled debris, structural road collapse, panic, or unmodeled hydrodynamics.

### Terminology Rules
- **PROHIBITED TERMS:**
  - *"Safe Route"*
  - *"Guaranteed Safe"*
  - *"Safe Until"*
  - *"No Risk"*
  - *"Guaranteed Evacuation"*
  - *"Safe"* (used as absolute physical state)
- **APPROVED TERMINOLOGY:**
  - `FEASIBLE UNDER CURRENT SCENARIO`
  - `DECISION WINDOW`
  - `LATEST FEASIBLE DEPARTURE`
  - `DECISION MARGIN`
  - `CONDITIONAL ON MODEL ASSUMPTIONS`
  - `DATA GAP`
  - `INFEASIBLE`

---

## 2. Codebase Audit & Replacement Verification

| Search Pattern | Occurrences Found in UI | Pre-Audit Context | Post-Audit Status & Remediation |
| :--- | :--- | :--- | :--- |
| `"Safe Route"` | 0 | None found | **CLEAN (0 occurrences)** |
| `"Guaranteed Safe"` | 0 | None found | **CLEAN (0 occurrences)** |
| `"Safe Until"` | 0 | None found | **CLEAN (0 occurrences)** |
| `"No Risk"` | 0 | None found | **CLEAN (0 occurrences)** |
| `"Safe"` (in table status) | 1 (`DecisionPanel.tsx`) | Edge status column showed `"Safe"` for unbreached roads | **REPLACED** with `"Clear"` / `"PASS"` |
| `"safe travel margin"` | 1 (`DecisionPanel.tsx`) | Status summary tooltip | **REPLACED** with *"Evacuation route is feasible under current scenario and configured assumptions."* |
| Disclaimers | Generic footer | Unstructured text | **UPDATED** to: *"Operational Safety Notice: Feasible under current scenario and configured assumptions. Not a guarantee of physical safety. Results depend on hydraulic, terrain, route, travel-time, and safety-buffer assumptions."* |

---

## 3. Epistemic Boundary Confirmation
The interface explicitly communicates that feasibility is a **model-conditional calculation**, not an absolute empirical guarantee of physical survival.
