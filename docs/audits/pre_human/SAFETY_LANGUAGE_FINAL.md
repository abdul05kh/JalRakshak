# JALRAKSHAK — SAFETY LANGUAGE & INTERPRETATION AUDIT
**Pre-Human Audit Terminology & Epistemic Boundary Review**
**Status:** COMPLETED — STRICT "FEASIBLE != SAFE" BOUNDARY ENFORCED

---

## 1. Epistemic Principle: Computational Feasibility vs. Real-World Safety

A critical safety finding from previous evaluations is that emergency decision-makers frequently mistake computational status labels (`FEASIBLE`) for absolute real-world safety guarantees (`SAFE`).

> **Non-Negotiable Rule:** JalRakshak does NOT determine whether an evacuation route is physically safe. It computes whether a route satisfies deterministic spatial-temporal constraint equations ($T_{\text{departure}} + T_{\text{travel}} + B \le A_{\text{arrival}}$) under a specific simulated hydraulic scenario and kinematic speed assumption.

---

## 2. Forbidden vs. Permitted Terminology Matrix

| Forbidden / Misleading Term | Risk / Cognitive Flaw | Mandatory Replacement Term | Verification Across Code & Docs |
| :--- | :--- | :--- | :--- |
| `"SAFE ROUTE"` | Implies absolute safety and immunity from landslides, mud, or traffic. | **`"COMPUTATIONALLY FEASIBLE ROUTE"`** | ✅ Verified in UI & API |
| `"GUARANTEED EVACUATION"` | Promises outcome beyond simulation fidelity. | **`"FEASIBLE DEPARTURE WINDOW UNDER SCENARIO ASSUMPTIONS"`** | ✅ Verified in UI & API |
| `"CALIBRATED FLOOD PREDICTION"` | Claims physical field calibration when using uncalibrated DEM/solver. | **`"UNSTEADY 2D HYDRAULIC SIMULATION OUTPUT"`** | ✅ Verified in UI & API |
| `"SAFE TO DEPART"` | False sense of operational security. | **`"FEASIBLE FOR DEPARTURE WITHIN MODEL TIMELINE"`** | ✅ Verified in UI & API |
| `"ZERO RISK"` | Disregards hydrodynamic and geotechnical uncertainty. | **`"NO HAZARD EXCEEDANCE DETECTED AT EVALUATION TIME"`** | ✅ Verified in UI & API |

---

## 3. Disclaimers Embedded in User Experience

1. **Header Disclaimer Banner:**
   > *"Notice: Status indicates mathematical timeline feasibility under selected scenario parameters. It does NOT guarantee physical road safety, structural bridge integrity, or absence of localized debris."*
2. **Pre-Test Briefing Rule:**
   > *"Participants are explicitly instructed during briefing: 'FEASIBLE does NOT mean SAFE. It means the vehicle mathematically transits before the modeled flood arrives.' "*
3. **Scoring Penalty:**
   > If a participant justifies an evacuation decision by asserting that *"JalRakshak proved the road is 100% safe"*, the response receives 0 points on limitation awareness in the scoring rubric.

---

## 4. Verdict
- **Safety Terminology Status:** ✅ **PASS**
- **Safety Boundary:** Fully established and documented.
