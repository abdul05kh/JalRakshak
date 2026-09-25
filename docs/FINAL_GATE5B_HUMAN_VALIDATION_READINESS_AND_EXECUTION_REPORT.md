# FINAL GATE 5B HUMAN VALIDATION READINESS AND EXECUTION REPORT

**Project:** JalRakshak Emergency Decision-Support System  
**Evaluation Standard:** Master Gate 5B Protocol & Forensic Audit Standards  
**Report Date:** 2026-09-24  
**Status:** PROTOCOL READY — AWAITING INTERNAL HUMAN PILOT  

---

## 1. CURRENT STATUS

### What Was Actually Tested
- Computational EWE calculation pipeline across MINIMUM, CENTRAL, and MAXIMUM scenarios.
- 150 m exact LineString spatial coupling with $\le 50\text{ m}$ densification.
- Decision-focused UI rendering, hero deadline display, arithmetic explainability in `[WHY?]`, and progressive disclosure drawers.
- Condition A vs Condition B isolation and answer leakage prevention.
- Session initialization, timing precision, and independent offline scoring verification.

### What Was Automatically Verified
- **136 / 136 backend regression tests pass.**
- Frontend production bundle builds cleanly via Vite in $< 600\text{ ms}$.
- Single-source ground-truth manifest integrity ($f91a5330...$) confirmed across all layers.
- Monotonicity properties ($D + T_i + B < A_i$) confirmed under mathematical stress testing.

### What Was Verified With Humans
- **NOT TESTED WITH HUMANS YET.**
- In strict adherence to scientific ethics and non-fabrication rules, zero simulated or synthetic human participant data has been generated.

### What Was Not Tested
- Real-world human cognitive performance across exploratory cohorts.
- Emergency officer operational decision speed under live stress.
- Physical field inundation accuracy against real flood gauge sensors.

### What Failed
- Initial Python 3.14 import error on Windows AppControl policy for unused FFT/random extensions in `%APPDATA%` $\rightarrow$ **Fixed with safe optional wrappers.**
- Early Gate 5B draft contained legacy 1200m spatial coupling ground-truth values $\rightarrow$ **Replaced and frozen with locked Gate 4 150m LineString corridor values.**

### What Remains Uncertain
- Whether non-technical human users will retrieve answers significantly faster in Condition B than Condition A without training.
- The degree of hesitation users experience when interpreting `FEASIBLE` in high-uncertainty boundary conditions.

---

## 2. SCIENTIFIC GROUND TRUTH

| Scenario | Discharge ($Q_p$) | Native HEC-RAS File | Corridor Arrival | Travel Time | Safety Buffer | Latest Feasible Departure | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MINIMUM** | $28,500\text{ m}^3/\text{s}$ | `tehri_15km_scenario_minimum_28500cms.hdf` | `T+95:00` | `12:39` | `03:00` | `T+79:21` | **FEASIBLE** |
| **CENTRAL** | $65,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_central_65000cms.hdf` | `T+60:00` | `12:39` | `03:00` | `T+44:21` | **FEASIBLE** |
| **MAXIMUM** | $115,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_maximum_115000cms.hdf` | `T+45:00` | `12:39` | `03:00` | `T+29:21` | **FEASIBLE** |

*Governing Equation:* $\text{LEAVE BY } T_{\text{dep}} = \min_i(A_i - T_i - B)$  
*Central Arithmetic:* $60:00 - 12:39 - 03:00 = 44:21$

---

## 3. EXPERIMENTAL INTEGRITY

- **Condition A (Raw Hydraulic Representation):** High-resolution Leaflet map displaying raw 2D depth and velocity contours with point probe tools. Stripped of all precomputed deadlines, feasibility badges, and limiting segments.
- **Condition B (JalRakshak Decision Representation):** Decision-focused console displaying departure deadline, timing triad, arithmetic explanation, and supporting spatial evidence.
- **Zero Leakage:** Complete DOM and network audit confirms zero EWE tokens leak into Condition A.

---

## 4. HUMAN PILOT RESULTS

**HUMAN VALIDATION = NOT EXECUTED**  
*(Awaiting execution of internal human pilot dry runs `DRYRUN-HUMAN-001` and `DRYRUN-HUMAN-002`).*

---

## 5. PRODUCT-VALUE DESIGN HYPOTHESIS

JalRakshak integrates native hydraulic outputs with road-network geometry, configured travel-time assumptions, and deterministic decision rules to produce a route-level evacuation-window representation via 5 computational transformations:
1. Translates continuous 2D cell depths into road corridor arrival timestamps ($A_i$).
2. Integrates network topology to compute segment cumulative travel durations ($T_i$).
3. Applies safety margins to derive latest feasible departure deadlines ($T_{\text{dep}}$).
4. Extracts and highlights the governing bottleneck edge ($R02$).
5. Presents deterministic arithmetic explainability in `[WHY?]` ($60:00 - 12:39 - 03:00 = 44:21$).

*Note: These are implemented capabilities and hypotheses about decision usefulness. They are NOT human-evidence findings until participants have completed the tasks.*

---

## 6. RESEARCHER RESCUE ANALYSIS

The 8-category intervention taxonomy (`NO_HELP`, `TASK_CLARIFICATION`, `TERMINOLOGY_CLARIFICATION`, `UI_NAVIGATION_HELP`, `TECHNICAL_HELP`, `PROTOCOL_HELP`, `ANSWER_LEAKING`, `RESEARCHER_RESCUE`) is active. Any task requiring `ANSWER_LEAKING` or `RESEARCHER_RESCUE` will be scored as 0 and excluded from independent usability metrics.

---

## 7. FAILURE FINDINGS & RESILIENCE

All failure-injection scenarios (uncoupled roads, extreme thresholds, stale scenario switching) correctly yield `DATA GAP` or bounded safe states without crashing or producing false `FEASIBLE` claims.

---

## 8. LIMITATIONS

1. **Static Travel Speed:** Uses a static 50 km/h baseline; dynamic traffic congestion, panic, and debris blockages are not modeled.
2. **Coupling Scope:** Tested on a 15 km Himalayan valley corridor (Tehri pilot).
3. **Operational Scope:** Prototype decision-support system; not certified for autonomous emergency command dispatch.

---

## 9. CLAIMS WE ARE ALLOWED TO MAKE

- **Allowed:** *"JalRakshak deterministically transforms frozen 2D HEC-RAS 7.0.1 hydraulic outputs into road-coupled evacuation departure deadlines under explicit engineering assumptions."*
- **Allowed:** *"Computational decision pipeline and spatial road coupling are 100% verified across 136 automated regression tests."*
- **Allowed:** *"The decision-focused UI is designed to expose the departure deadline and limiting segment in the primary viewport without requiring technical expertise."*
- **Allowed:** *"Gate 5B protocol, task books, blinding mechanisms, and export schemas are verified and ready for human pilot execution."*

---

## 10. CLAIMS WE ARE NOT ALLOWED TO MAKE

- **Prohibited:** *"Emergency officers prefer JalRakshak."* (Requires emergency officer cohort testing).
- **Prohibited:** *"JalRakshak is superior to HEC-RAS."* (JalRakshak is a decision-translation layer, not a replacement).
- **Prohibited:** *"JalRakshak guarantees safe evacuation."* (System computes feasibility under assumptions, not real-world safety).
- **Prohibited:** *"JalRakshak is field validated / operationally ready."* (Requires physical flood sensor benchmarking).

---

## 11. NEXT GATE

**EXECUTE GATE 5B INTERNAL HUMAN PILOT** ($N=2$ participants: `DRYRUN-HUMAN-001`, `DRYRUN-HUMAN-002`).
