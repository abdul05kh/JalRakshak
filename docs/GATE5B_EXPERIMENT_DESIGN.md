# GATE 5B — EXPERIMENT DESIGN & PROCEDURE

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** FROZEN EXPERIMENTAL DESIGN  
**Date:** 2026-09-24  

---

## 1. Study Architecture & Counterbalancing

The experiment uses a **Within-Subjects Counterbalanced Design** across two primary information representations for a sample of $N = 3 \text{ to } 5$ participants.

```
                                  PARTICIPANT INTAKE
                                          │
                                 [Briefing & Consent]
                                          │
                                   [Practice Task]
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            GROUP 1 (A → B)                           GROUP 2 (B → A)
       ├── Round 1: Condition A                  ├── Round 1: Condition B
       └── Round 2: Condition B                  └── Round 2: Condition A
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          ▼
                               ROUND 3: SCENARIO CHANGE
                             (Central 65k → Maximum 90k)
                                          │
                               [Qualitative Interview]
                                          │
                               [Automated Scoring Log]
```

### Counterbalancing Allocation:
- **Participant P001:** Condition A (Raw) $\to$ Condition B (JalRakshak)
- **Participant P002:** Condition B (JalRakshak) $\to$ Condition A (Raw)
- **Participant P003:** Condition A (Raw) $\to$ Condition B (JalRakshak)
- **Participant P004:** Condition B (JalRakshak) $\to$ Condition A (Raw)
- **Participant P005:** Condition A (Raw) $\to$ Condition B (JalRakshak)

---

## 2. Experimental Conditions

### Condition A: Raw Hydraulic Representation
- **Information Provided:**
  - 2D Water Depth Raster & WSE Contours (discrete 5-min intervals),
  - River Stationing & Terrain Minimum Bed Elevation profile,
  - Simulation Inflow Hydrograph ($Q_{\text{peak}} = 65,000\text{ m}^3/\text{s}$),
  - Road vector alignment overlay (geometry and length).
- **Information Withheld:** No EWE departure deadlines, no limiting segment badges, no route-feasibility statuses, no automated traversal math.
- **Participant Task:** Participant must manually correlate flood arrival at road locations with travel distance and speed to infer feasibility and deadlines.

### Condition B: JalRakshak Decision Support Representation
- **Information Provided:**
  - Primary Decision Card (`FEASIBLE` / `LOW MARGIN` / `INFEASIBLE` / `DATA GAP`),
  - Latest Feasible Departure Timestamp ($D_{\text{deadline}}$),
  - Active Decision Margin (minutes),
  - Identified Limiting Bottleneck Segment ($e_{\text{limit}}$),
  - Deterministic WHY Explanation Card,
  - Alternative Routes Drawer,
  - Epistemic Limitations & Assumptions Disclosure.
- **Participant Task:** Participant directly reviews the decision-oriented cards and navigates alternatives/assumptions.

---

## 3. The 3 Experimental Rounds

### Round 1 & Round 2 (Core Decision Evaluation)
- **Scenario:** `SCENARIO_CENTRAL` (Tehri 15km reach, $Q_{\text{peak}} = 65,000\text{ m}^3/\text{s}$).
- **Origin $\to$ Destination:** `Malidewal Lowland Village` $\to$ `Koteshwar Settlement`.
- **Core Decision Question:**
  > *"Under the displayed scenario and configured rules, is the route currently FEASIBLE? What is the latest feasible departure time, and which road segment limits the decision?"*

### Round 3 (Scenario Comparison & Stress Testing)
- **Scenario Transition:** Switch from `SCENARIO_CENTRAL` to `SCENARIO_MAXIMUM` ($Q_{\text{peak}} = 90,000\text{ m}^3/\text{s}$).
- **Core Question:**
  > *"After switching to the Maximum Scenario, what changed in the evacuation decision, and why?"*

---

## 4. Practice Task

Before Round 1, each participant completes a 2-minute practice task on an unrelated synthetic demo scenario (`Practice Scenario - Sayers Dam Demo`) to familiarize themselves with UI controls (panning, zooming, clicking tabs). Practice timing is strictly isolated and discarded from evaluation logs.
