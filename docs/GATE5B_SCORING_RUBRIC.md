# GATE 5B — PRE-REGISTERED SCORING RUBRIC

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** PRE-REGISTERED & FROZEN  
**Date:** 2026-09-24  

---

## 1. Scoring Principles

To prevent observer bias or ad-hoc post-hoc grading:
- All scoring rules, tolerances, and point deductions are defined and frozen **before** collecting participant responses.
- Partial credit rules are strictly pre-registered.

---

## 2. Detailed Task Scoring Rubric

### TASK 01: Route Feasibility (M1)
- **Score 1 (Correct):** Selected `FEASIBLE` (or equivalent standard text).
- **Score 0 (Incorrect):** Selected `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`, or `GUARANTEED SAFE`.
- *Safety Flag:* If participant selects `GUARANTEED SAFE`, flag `misinterpreted_as_safety = True`.

### TASK 02: Latest Feasible Departure (M2)
- **Ground Truth:** `T+44 min 21 sec` ($44.35\text{ min}$ / $2,661\text{ s}$ after scenario activation).
- **Score 1 (Correct):** Any response within $\pm 1.5\text{ min}$ (e.g. `T+43:00` to `T+45:30`, $43.0 - 45.5\text{ min}$, or legacy equivalent `00:43` to `00:45`).
- **Score 0 (Incorrect):** Any value outside tolerance or unstated.

### TASK 03: Limiting Segment Identification (M3)
- **Ground Truth:** Segment `R02`.
- **Score 1 (Correct):** Explicitly states `R02`, `Segment 2`, or `Malidewal to Koteshwar Valley Road`.
- **Score 0 (Incorrect):** Mentions incorrect segment (e.g. `R01`, `R07`) or leaves blank.

### TASK 04: Causal Decision Explanation (M4)
- **Score 2 (Full Credit):** Explains that flood arrival ($60\text{ min}$) minus traversal time ($\approx 12.6\text{ min}$) minus safety buffer ($3\text{ min}$) leaves a $\approx 44\text{ min}$ window.
- **Score 1 (Partial Credit):** Identifies flood arrival or road inundation as the cause, but omits travel time or safety buffer.
- **Score 0 (No Credit):** Irrelevant, factually incorrect, or unstated justification.

### TASK 05: Alternative Route Discovery (M5)
- **Score 1 (Correct):** Identifies that an alternative high-ground route exists via the ridge (`R01 / Chamba`) that is un-inundated.
- **Score 0 (Incorrect):** Claims no alternative exists or claims all routes are flooded.

### TASK 06: Scenario Comparison Delta (M6)
- **Score 1 (Correct):** Identifies that the departure window contracts significantly due to earlier flood arrival under higher peak discharge.
- **Score 0 (Incorrect):** Claims window expands, nothing changes, or incorrect causal reasoning.

### TASK 07: Limitation Awareness & Safety Check (M7)
- **Score 1 (Aware):** Selects all 3 valid limitations (static speeds, demonstration dataset, no historical calibration) AND does NOT select `guarantees 100% risk-free evacuation`.
- **Score 0 (Unaware / Misled):** Fails to select limitations or selects `guarantees 100% risk-free evacuation`.
- *Safety Flag:* If the guarantee option is selected, flag `misinterpreted_as_safety = True`.
