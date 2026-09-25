# JALRAKSHAK — PRE-HUMAN FORENSIC AUDIT & SCENARIO RECONCILIATION FINAL REPORT
**Gate 5B Precondition Scientific Closure**
**Date:** 2026-09-24
**Verdict:** **`GO`** (Cleared for Participant Recruitment; Human Usefulness Experimentally Unvalidated)

---

## 1. Executive Summary

Prior to recruiting or exposing any human emergency decision-makers to the Gate 5B evaluation protocol, a rigorous, forensic audit of the entire JalRakshak codebase, hydraulic artifact repository, experimental harness, task design, time terminology, and safety boundaries was conducted.

The audit achieved the following milestones:
1. **Conclusively Resolved Scenario Discrepancy:** The conflicting scenario discharge definitions were traced through native HEC-RAS inputs, volume accounting, and HDF5 binaries. The authoritative frozen suite is proven to be **`28,500 / 65,000 / 115,000 m³/s`**. The number `15,000` was proven to be a reach length in meters ($15\text{ km}$), and `90,000` was an informal placeholder.
2. **Fixed Time Terminology:** Standardized all flood decision deadlines from ambiguous UTC wall-clock stamps (`00:44 UTC`) to relative elapsed scenario time (**`T+44 min 21 sec`** / **`44.35 min post-breach`**).
3. **Certified Information Parity & Prevented Leakage:** Verified that Condition A is genuinely usable with complete information parity, and certified zero answer leakage in the user interface and DOM.
4. **Introduced Pre-Test Comprehension Instrument:** Added a 4-item diagnostic check (`docs/GATE5B_COMPREHENSION_CHECK.md`) to detect conceptual misunderstandings before trials.
5. **Enforced Safety Epistemic Boundaries:** Strict enforcement of `FEASIBLE != SAFE` across all materials and disclaimers.
6. **Zero Fabrication Maintained:** Retained `GATE5B_RESULTS.md` in its honest state: computational machinery ready, empirical human data not yet collected.

---

## 2. Repository & Environment State

- **Git Commit:** `309e250413c8d10a86037a2ea53779e3225e8378`
- **Environment:** Windows 11, Python 3.14.2, Node v24.13.0, USACE HEC-RAS 7.0.1
- **Backend Tests:** **123 passed in 16.30s** (0 failed, 0 warnings)
- **Frontend Build:** **Vite production build passed in 222ms**

---

## 3. Scenario Conflict Discovery & Authoritative Evidence

| Scenario Identifier | Peak Flow ($Q_p$) | Peak Time ($T_p$) | Trapezoidal Volume ($10^3\text{ m}^3$) | HEC-RAS Inflow Volume ($10^3\text{ m}^3$) | Native Artifact Path | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCENARIO_MINIMUM`** | $28,500.0\text{ m}^3/\text{s}$ | $1.5\text{ h}$ | $95,134.37$ | $95,140.86$ | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf` | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772` |
| **`SCENARIO_CENTRAL`** | $65,000.0\text{ m}^3/\text{s}$ | $1.0\text{ h}$ | $227,405.56$ | $227,413.63$ | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf` | `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78` |
| **`SCENARIO_MAXIMUM`** | $115,000.0\text{ m}^3/\text{s}$ | $0.75\text{ h}$ | $374,137.24$ | $374,147.84$ | `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf` | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a` |

- **Frozen Scenario Manifest:** Created in `artifacts/gate5b/frozen_scenario_manifest.json`.

---

## 4. Reconciled Ground Truth Summary

For Route 1 (Malidewal $\to$ Koteshwar, $10.54\text{ km}$, $50\text{ km/h}$, $T_{\text{travel}} = 12.65\text{ min}$, Buffer $= 3.0\text{ min}$):
- **Limiting Road Segment:** `R02` (Chainage $6.50\text{ km}$)
- **Earliest Hydraulic Inundation Arrival:** $T+60.00\text{ min}$ ($3,600\text{ s}$)
- **Latest Feasible Departure:**
  $$D_{\text{deadline}} = 60.00\text{ min} - 12.65\text{ min} - 3.00\text{ min} = \mathbf{T+44\text{ min } 21\text{ sec}}\ (44.35\text{ min})$$
- **Cryptographic Ground Truth Hash:** `4bf8d9a2d6d04bff1cde373d74ec18602eadb00cabafe5c1d37767ea672a7637`

---

## 5. Experimental Validity Audits Summary

| Evaluation Dimension | Forensic Audit Document | Verdict | Key Finding / Safeguard |
| :--- | :--- | :---: | :--- |
| **Information Parity** | `docs/audits/pre_human/INFORMATION_PARITY_FINAL.md` | ✅ **PASS** | Condition A contains complete arrival & travel data; no artificial barrier introduced. |
| **Answer Leakage** | `docs/audits/pre_human/ANSWER_LEAKAGE_AUDIT.md` | ✅ **PASS** | Initial state unselected; DOM free of answer attributes; zero console logs. |
| **Time Terminology** | `docs/audits/pre_human/TIME_TERMINOLOGY_AUDIT.md` | ✅ **PASS** | Wall-clock UTC references replaced with relative scenario elapsed time (`T+44 min 21 sec`). |
| **Carryover Control** | `docs/audits/pre_human/CARRYOVER_AUDIT.md` | ✅ **PASS** | Counterbalanced $A \to B$ / $B \to A$ with scenario permutations across rounds. |
| **Comprehension Check** | `docs/GATE5B_COMPREHENSION_CHECK.md` | ✅ **PASS** | 4-item diagnostic check separates interface friction from conceptual misunderstanding. |
| **Safety Language** | `docs/audits/pre_human/SAFETY_LANGUAGE_FINAL.md` | ✅ **PASS** | Strict `FEASIBLE != SAFE` distinction; disclaimers active across UI and briefs. |
| **Travel-Time Model** | `docs/audits/pre_human/TRAVEL_TIME_ASSUMPTION_AUDIT.md` | ✅ **PASS** | Constant kinematic velocity model ($50\text{ km/h}$) explicitly disclosed. |

---

## 6. Pre-Human Recruitment Conditions

Participant recruitment and testing may begin subject to the following operating conditions:
1. **Internal Pilots:** Execute 1–2 dry-run pilot sessions to test protocol timing and interface clarity.
2. **Pre-Test Check Administration:** Administer `GATE5B_COMPREHENSION_CHECK.md` to every participant before Task 01.
3. **Alternating Order:** Strictly assign odd participant IDs to $A \to B$ and even IDs to $B \to A$.
4. **Zero Fabrication in Reporting:** Log all raw data in JSON/CSV format. Never report aggregate percentages as proof of effectiveness without presenting qualitative friction points.

---

## 7. Forensic Pre-Human Gate Verdict

**FINAL VERDICT: `GO`**

*Gate 5B human participant recruitment may begin.*
