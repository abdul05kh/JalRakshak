# 11 — Ground Truth Integrity Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Immutable Single Source of Truth Alignment  
**Status:** PASS  

---

## 1. Authoritative Scenario Constants

| Scenario | Discharge ($Q_p$) | Native HEC-RAS Artifact | 150m Corridor Arrival | Travel Time | Safety Buffer | Resulting Departure | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MINIMUM** | $28,500\text{ m}^3/\text{s}$ | `tehri_15km_scenario_minimum_28500cms.hdf` | `T+95:00` | `12:39` | `03:00` | `T+79:21` | **FEASIBLE** |
| **CENTRAL** | $65,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_central_65000cms.hdf` | `T+60:00` | `12:39` | `03:00` | `T+44:21` | **FEASIBLE** |
| **MAXIMUM** | $115,000\text{ m}^3/\text{s}$ | `tehri_15km_scenario_maximum_115000cms.hdf` | `T+45:00` | `12:39` | `03:00` | `T+29:21` | **FEASIBLE** |

---

## 2. Integrity Verification
All values across frontend fixtures, backend models, test suites, and participant task books match the exact single-source Ground Truth manifest hash (`f91a5330...`).
