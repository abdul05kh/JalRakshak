# GATE 5B — PARTICIPANT TASK BOOK & QUESTIONNAIRE

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** STANDARDIZED INSTRUMENT  
**Date:** 2026-09-24  

---

## 1. Task Instructions for Participants

Each participant is presented with the following standardized decision tasks in sequence:

---

### [TASK 01 — ROUTE FEASIBILITY]
**Prompt:**
> *"You are reviewing the evacuation feasibility for movement from **Malidewal Lowland Village** to **Koteshwar Settlement** under the displayed breach scenario (`SCENARIO_CENTRAL`, peak discharge $65,000\text{ m}^3/\text{s}$) at scenario activation ($T_0 = 0\text{ min}$) with a configured 3-minute safety buffer.*
> 
> *Under the displayed scenario and configured rules, what is the computational feasibility status of this route?"*

**Response Options:**
- `[ ]` FEASIBLE (Traversable before flood arrival with safety buffer)
- `[ ]` LOW MARGIN (Narrow clearance margin $\le 5\text{ min}$)
- `[ ]` INFEASIBLE (Floodwaters breach route before vehicle clearance)
- `[ ]` DATA GAP (Missing hydraulic coverage prevents determination)
- `[ ]` GUARANTEED SAFE (Completely risk-free evacuation)

---

### [TASK 02 — LATEST FEASIBLE DEPARTURE]
**Prompt:**
> *"What is the latest feasible departure time (expressed as elapsed time after breach activation, e.g. `T+MM min SS sec` or total minutes) before which departure must occur to clear all road segments prior to flood arrival?"*

**Response Field:**
- Latest Feasible Departure Time (e.g. `T+44 min 21 sec` or `44.35 min`): `[ ____________ ]`

---

### [TASK 03 — LIMITING ROAD SEGMENT]
**Prompt:**
> *"Which specific road segment establishes the critical time constraint (bottleneck) for this route?"*

**Response Field:**
- Constraining Road Segment ID / Name: `[ ____________ ]`

---

### [TASK 04 — CAUSAL DECISION EXPLANATION]
**Prompt:**
> *"Briefly explain WHY this road segment constrains the departure deadline. What factors (flood timing, travel speed, buffer) determine this window?"*

**Response Field:**
- Causal Justification: `[ ________________________________________________ ]`

---

### [TASK 05 — ALTERNATIVE ROUTE DISCOVERY]
**Prompt:**
> *"If the primary valley road between Malidewal and Koteshwar is blocked by local debris, is an alternative route available to a high-ground relief shelter (e.g. Chamba Shelter)? What is its status?"*

**Response Options:**
- `[ ]` Yes, an alternative route exists via the high-ground mountain ridge (`OPEN / Un-inundated`).
- `[ ]` No, all routes in the region are completely flooded.
- `[ ]` Cannot be determined from the available information.

---

### [TASK 06 — SCENARIO COMPARISON (CENTRAL → MAXIMUM)]
**Prompt:**
> *"After switching the scenario from `SCENARIO_CENTRAL` (65,000 m³/s peak) to `SCENARIO_MAXIMUM` (115,000 m³/s peak), what changes in the evacuation decision for the Malidewal $\to$ Koteshwar path?"*

**Response Options:**
- `[ ]` The departure window contracts significantly (flood arrives earlier; margin shrinks).
- `[ ]` The departure window expands (more time is available).
- `[ ]` Nothing changes; the decision is identical.
- `[ ]` Cannot be determined.

---

### [TASK 07 — LIMITATION & UNCERTAINTY AWARENESS]
**Prompt:**
> *"Which of the following are important scientific or operational limitations of the displayed result?"* *(Select all that apply)*
- `[ ]` Travel times use static engineering speeds and do not model live traffic jams or vehicle breakdowns.
- `[ ]` The road network is a demonstration dataset comprising 17 representative segments.
- `[ ]` Physical validation against a historical Tehri dam break is not established.
- `[ ]` The system guarantees 100% risk-free evacuation in the real world.
