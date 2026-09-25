# GATE 5B — SAFETY & RISK INTERPRETATION AUDIT

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** SAFETY AUDIT COMPLETE  
**Date:** 2026-09-24  

---

## 1. The Core Hazard: Conflating "FEASIBLE" with "SAFE"

In emergency evacuation decision support, the most dangerous failure mode is **unwarranted overconfidence**. 

If an incident commander interprets `FEASIBLE UNDER MODEL ASSUMPTIONS` as an ironclad guarantee of physical safety, lives may be endangered by real-world unmodeled hazards (debris, dynamic traffic gridlock, panicked human behavior, vehicle breakdowns, or uncalibrated bathymetry).

```
                      EPISTEMIC RISK BOUNDARY
  ─────────────────────────────────────────────────────────────
  [ DANGEROUS OVERCONFIDENCE ]      [ SCIENTIFIC GROUNDING ]
  "Evacuation is guaranteed safe"   "Route is FEASIBLE under the
  "Zero risk"                       selected scenario and
  "You have exactly 44 minutes"     configured rules"
  ─────────────────────────────────────────────────────────────
```

---

## 2. Safety Audit Checklist for Gate 5B

| Safety Inspection Item | Evaluation Criteria | Enforcement Mechanism in JalRakshak | Pass/Fail |
|:---|:---|:---|:---:|
| **No "SAFE" Status Badges** | The word `SAFE` must never appear as an affirmative status badge. | Status vocabulary strictly limited to `FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`, `NO_FEASIBLE_ROUTE`. | **PASS** |
| **No "GUARANTEED" Claims** | Output must never promise guaranteed evacuation success. | Disclaimers explicitly state: "Model-derived numerical departure window; zero real-world guarantee." | **PASS** |
| **Visibility of Assumptions** | Static speed and unmodeled traffic limitations must be accessible within 1 click. | Epistemic Assumptions Drawer exposed directly below the primary decision badge. | **PASS** |
| **Safety Buffer Transparency** | The safety buffer ($B$) must be visibly labeled as a manager configuration, not a physical law. | Displayed explicitly: "Configured Safety Buffer: 3.0 min (Operational Setting)". | **PASS** |
| **Participant Misinterpretation Detection** | Participant task rubric specifically penalizes and flags any selection of `GUARANTEED SAFE`. | Scored as $0$ and triggers `misinterpreted_as_safety = True` flag. | **PASS** |

---

## 3. Human Audit Conclusion

The interface and experimental protocol have been audited against misleading overclaims. All affirmative claims remain strictly bounded by scenario-conditional numerical rules.
