# GATE 5 — FINAL SCIENTIFIC & OPERATIONAL ACCEPTANCE REPORT
## COMPUTATIONAL DECISION CLOSURE & HUMAN VALIDATION PROTOCOL

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** 
- **Gate 5A (Computational Decision Validation):** **PASSED**
- **Gate 5B (Human Decision Usefulness):** **NOT YET TESTED (Protocol Established)**  
**Date:** 2026-09-24  

---

## 1. Executive Summary & Epistemic Partitioning

To maintain strict scientific integrity and avoid overstated claims, Gate 5 is explicitly divided into two distinct validation layers:

### Layer 1: Gate 5A — Computational Decision Validation (PASSED)
Proves with reproducible, deterministic evidence that JalRakshak transforms frozen 2D hydrodynamic simulation arrays (USACE HEC-RAS 7.0.1) into a structured evacuation decision object containing:
- Route feasibility state (`FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`, `NO_FEASIBLE_ROUTE`),
- Latest feasible departure deadline ($D_{\text{deadline}} = \min_i(A_i - T_i - B)$),
- Critical bottleneck segment identification ($e_{\text{limit}}$),
- Alternative route scoring,
- Causal explanation,
- Cryptographic provenance (SHA-256 artifact hashes).

### Layer 2: Gate 5B — Human Decision Usefulness (NOT YET TESTED)
Establishes whether human incident commanders/operators make faster, more accurate evacuation decisions using JalRakshak compared to raw hydraulic tables/maps. **This has NOT yet been subjected to controlled human-subject testing and is explicitly labelled as NOT YET TESTED.**

---

## 2. Reconciled Technical Claims & Forensic Corrections

| Item / Claim | Previous Phrasing (Refined) | Refined Defensible Standard | Forensic Basis & Evidence Reference |
|:---|:---|:---|:---|
| **Test Classification** | "30-Second Officer Usability Test" | **"30-Second Automated Decision Reachability Test"** | Evaluates software payload availability, NOT human cognition or real officer field performance. |
| **Capability Gap Description** | "HEC-RAS cannot provide this" | **"Not directly represented as a route-level evacuation decision in the HEC-RAS output used by this implementation"** | HEC-RAS produces hydrodynamics; JalRakshak adds graph traversal, speed models, and EWE optimization. |
| **Artifact File Sizes** | "Massive 1.2 GB HDF5 files" | **"Multidimensional hydraulic result datasets (~13.5 MB HDF5 binary arrays)"** | Exact file size in `manifest.json`: `13,502,177 bytes` for `tehri_15km_scenario_central.p01.hdf`. |
| **R02 Depth Lineage** | "Physical consequence of ponding" | **"Under the selected HEC-RAS configuration, R02 has greater simulated depth than the dam-toe cell because local terrain is substantially lower ($z = 605.5\text{ m}$ vs $814.0\text{ m}$) and simulated WSE remains elevated"** | Terrain bed drop of $208.5\text{ m}$ across reach; numerical result under frozen HEC-RAS setup. |
| **Scenario Variables** | "Breach Width $\Delta: +50\text{ m}$" | **"Prescribed Inflow Hydrographs ($Q_{\text{peak}} = 15,000 / 65,000 / 90,000\text{ m}^3/\text{s}$)"** | Real 15km HEC-RAS scenarios use prescribed hydrographs; synthetic fixtures used parametric width. |
| **Mass Conservation** | "<0.45% mass balance error" | **"Native HEC-RAS volume accounting error $= 3.23 \times 10^{-6}\%$ ($0.0073 \times 10^3\text{ m}^3$ error on $227,413.6 \times 10^3\text{ m}^3$ inflow)"** | Exact volume accounting extraction from `artifacts/hecras/tehri_gate3b/manifest.json`. |
| **Repeatability Claim** | "Bit-Exact System Repeatability" | **"Deterministic decision-output repeatability verified for identical frozen inputs and configuration"** | Proves software decision calculation determinism given immutable HDF5 inputs. |
| **Alternative Route Vocabulary**| "Route B is DRY" | **"Route B status is `OPEN` (Un-inundated / Below Hazard Threshold)"** | Unified vocabulary: `OPEN`, `AT_RISK`, `INUNDATED`, `DATA_GAP`. |

---

## 3. Gate 5A Computational Acceptance Matrix

| Criterion | Evidence Artifact / Implementation | Test Suite Reference | Result |
|:---|:---|:---|:---:|
| **Officer Decision Model** | `docs/GATE5_OFFICER_DECISION_MODEL.md` | `test_automated_30s_decision_reachability` | **PASS** |
| **Hydraulic-to-Decision Lineage** | `docs/GATE5_GATE4_LINEAGE_RECONCILIATION.md` | `test_decision_completeness_schema` | **PASS** |
| **Road Spatial Coupling** | `backend/app/domain/road_hydraulic_mapper.py` ($150\text{ m}$ corridor) | `test_golden_h_r02_spatial_coupling_regression` | **PASS** |
| **R02 Forensic Closure** | Reconciled $31.70\text{ m}$ depth / $3,600\text{ s}$ arrival vs obsolete $37.37\text{ m}$ | `test_golden_a_feasible`, `test_golden_h` | **PASS** |
| **EWE Mathematics** | $D_{\text{deadline}} = \min_i(A_i - T_i - B)$, $\text{Margin} = D_{\text{deadline}} - D_{\text{dep}}$ | `test_ewe_monotonicity_properties` | **PASS** |
| **Safety Buffer Sensitivity** | Exact linear deadline response: $\Delta D = -\Delta B$ across $0, 3, 5, 10, 15, 20\text{ min}$ | `test_safety_buffer_sensitivity_linearity` | **PASS** |
| **Low-Margin Logic** | Threshold $M_{\text{th}} = 5.0\text{ min}$ transitions status deterministically | `test_low_margin_threshold_sensitivity` | **PASS** |
| **Alternative Routing** | $k$-shortest path generation with independent EWE evaluation | `test_golden_g_alternative_routes` | **PASS** |
| **No-Feasible-Route Handling** | Disconnected / fully blocked routes return `NO_FEASIBLE_ROUTE` | `test_golden_e_no_feasible_route` | **PASS** |
| **Data-Gap Propagation** | Unknown hydraulic exposure propagates to `DATA GAP` | `test_golden_d_data_gap` | **PASS** |
| **Scenario Comparison** | Central ($65\text{k}$) vs Maximum ($90\text{k}$) breach delta evaluation | `test_golden_f_scenario_comparison` | **PASS** |
| **Deterministic Explanation** | Template-interpolated causal explanations (No LLM in decision loop) | `test_decision_repeatability` | **PASS** |
| **Provenance** | `docs/GATE5_PROVENANCE.md` (SHA-256 hash in decision object) | `test_decision_completeness_schema` | **PASS** |
| **Uncertainty Disclosure** | `docs/GATE5_UNCERTAINTY_MODEL.md` (Categorical epistemic tags) | `test_prohibited_language_audit_in_responses`| **PASS** |
| **Repeatability** | Identical inputs generate bit-exact decision responses | `test_decision_repeatability` | **PASS** |
| **Golden Tests** | Golden fixtures A through H passing within documented tolerances | `test_golden_a` through `test_golden_h` | **PASS** |
| **Negative Tests** | Fault injection (missing HDF, invalid parameters, negative margins) | `test_negative_*` | **PASS** |
| **Frontend Decision Visibility** | Officer-First UI (`DecisionPanel.tsx`, `ProvenanceDrawer.tsx`) | `frontend` production build verification | **PASS** |
| **Demo Reproducibility** | `docs/GATE5_DEMO_SCRIPT.md` (Zero external network dependencies) | Standalone local backend + frontend stack | **PASS** |

---

## 4. Gate 5B Human Decision Validation Protocol (Roadmap)

To validate the human decision usefulness of JalRakshak without fabricating results, the following controlled protocol is established for execution with independent technical participants (3–5 testers):

### Experimental Protocol
1. **Condition A (Raw Hydraulic Presentation):**
   - Participant is presented with HEC-RAS 2D water depth raster, terrain contours, and time-series hydrographs.
   - Asked: *(1) Can the Malidewal $\to$ Koteshwar route be used? (2) What is the latest departure time? (3) Which segment limits clearance?*
   - Measure: Time to answer ($t_A$) and response accuracy ($Acc_A$).
2. **Condition B (JalRakshak Presentation):**
   - Participant is presented with the JalRakshak Officer Decision Panel.
   - Asked the identical 3 questions.
   - Measure: Time to answer ($t_B$) and response accuracy ($Acc_B$).
3. **Evaluation Metric:**
   $$\Delta t = t_A - t_B, \quad \Delta Acc = Acc_B - Acc_A$$

Until this protocol is executed with real human subjects, Gate 5B remains **NOT YET TESTED**.

---

## 5. What Gate 5 Does NOT Prove

In strict adherence to zero-fabrication and scientific honesty, Gate 5 does **NOT** prove:
- Real-world human evacuation compliance or panic queuing behavior.
- Real-time dynamic traffic sensor telemetry or flood-induced vehicle breakdown.
- Physical validation of Tehri dam break (no historical failure event exists for empirical calibration).
- Exhaustive road network coverage beyond the 17 demonstration segments.
- Vertical datum and bathymetry perfection beyond satellite DSM resampled conditioning.
- Human officer cognitive superiority in live emergencies.

Gate 5 proves that given a frozen, numerically verified HEC-RAS 2D hydraulic model and configured operational rules, the software pipeline deterministically, safely, and traceably computes evacuation decisions.

---

## 6. Final Status

```
================================================================================
GATE 5 STATUS BREAKDOWN
================================================================================

GATE 5A — COMPUTATIONAL DECISION PIPELINE    [ PASS ]
GATE 5B — HUMAN DECISION USEFULNESS          [ NOT YET TESTED (Protocol Set) ]

--------------------------------------------------------------------------------

OVERALL GATE 5 VERDICT:
[ GATE 5A: PASSED / GATE 5B: PENDING HUMAN EVALUATION ]

--------------------------------------------------------------------------------

CORE PRODUCT VALUE STATEMENT:

"JalRakshak transforms multidimensional hydraulic simulation arrays (WSE, depth)
into a deterministic, explainable, and uncertainty-aware evacuation departure
deadline, limiting bottleneck identification, and alternative route comparison
for emergency decision-makers."
================================================================================
```
