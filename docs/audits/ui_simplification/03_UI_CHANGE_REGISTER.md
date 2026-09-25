# UI Change Register — Gate 5B UI Simplification & Hardening
**Audit Date:** 2026-09-24  
**Audit Purpose:** Forensic register of every frontend UI modification, rationale, and experimental impact.  

---

## 1. Complete Change Register

| Component | Before Refactor | After Refactor | Rationale | Experiment Impact |
| :--- | :--- | :--- | :--- | :--- |
| `DecisionPanel.tsx` | Top header showed raw "EWE Engine v1.0" with cluttered subtitle | Replaced with clear Scenario Name and OD route label (`Malidewal → Chamba`) | Contextualize scenario and route immediately for user | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Status card had mixed font sizes and vague subtitle | Hero status badge with explicit conditional subtitle: *"Conditional on model assumptions"* | Enforce `FEASIBLE != SAFE` cognitive boundary | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Deadline was displayed in UTC clock string inside small grid box | Prominent Hero metric box: `LATEST FEASIBLE DEPARTURE` with `T+44:21` relative format | Clarifies decision deadline in < 5 seconds without mental timezone conversion | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Equation was embedded in long unstructured text | Structured Level 2 Arithmetic Card: $T+60:00 - 12:39 - 03:00 = T+44:21$ | Allows instant reconstruction of decision derivation | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Limiting segment card had dense text | Structured card highlighting segment ID ($R02$), arrival, travel time, and max depth | Quick identification of physical bottleneck | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Segment breakdown table was open by default | Collapsed behind `[View Route Segment Breakdown]` toggle | Eliminates table clutter from primary viewport | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Edge table status displayed word "Safe" for unbreached edges | Replaced with "Clear" / "PASS" | Eliminate ambiguous "Safe" language from UI | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Threshold inputs occupied 30% of vertical panel height | Collapsed under `[Configure Safety Buffer & Thresholds]` accordion | Prevents configuration inputs from distracting from the operational decision | DOES NOT AFFECT EXPERIMENT |
| `DecisionPanel.tsx` | Simple generic text footer | Explicit operational safety notice emphasizing conditional assumptions | Prevents over-reliance or unwarranted assumption of physical safety | DOES NOT AFFECT EXPERIMENT |
| `Header.tsx` | Generic scenario select dropdown | Enhanced select with peak discharge ($Q_p$) annotations | Unambiguous hydraulic scenario selection | DOES NOT AFFECT EXPERIMENT |
| `Header.tsx` | Badge showed "HEC-RAS 2D (REAL RESULT)" | Updated to "HEC-RAS 7.0.1 2D" | Accurate technical attribution | DOES NOT AFFECT EXPERIMENT |
| `Sidebar.tsx` | Dense layer labels and duplicated map legend | Clean essential layers (4 items) and streamlined legend | Reduces GIS visual clutter | DOES NOT AFFECT EXPERIMENT |
| `Sidebar.tsx` | Breach physics parameters open by default | Progressive disclosure accordion `[Scenario Breach Details]` | Separates physical genesis from route operations | DOES NOT AFFECT EXPERIMENT |
| `ProvenanceDrawer.tsx`| Raw JSON hashes and minimal explanation | Structured ledger detailing 150m corridor coupling, static travel speed, and validation boundary notice | Complete transparency without cluttering primary view | DOES NOT AFFECT EXPERIMENT |
| `MapView.tsx` | Point query popup displayed "Demonstration Fixture" | Updated to "HEC-RAS 7.0.1 / Hydrologic Scenario Model" | Professional attribution matching scenario provenance | DOES NOT AFFECT EXPERIMENT |

---

## 2. Integrity Verification
- **Hydraulics Changed:** 0
- **Scenarios Modified:** 0
- **Scoring Logic Altered:** 0
- **Answer Leakage Introduced to Condition A:** NONE
