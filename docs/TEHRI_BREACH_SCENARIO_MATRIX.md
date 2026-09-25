# TEHRI BREACH SCENARIO MATRIX & PARAMETER AUDIT
**Document ID:** DOC-TEHRI-G3-04 (REV-3 FINAL CLOSURE)  
**Project Stage:** Gate 3A — Forensic Closure  
**Breach Implementation Mode:** `EXTERNALLY_SPECIFIED_BREACH_HYDROGRAPH`  
**Date:** 2026-09-24  

---

## 1. Architectural Distinction

```
+-----------------------------------------------------------------------------------------+
| MANDATORY IMPLEMENTATION CLASSIFICATION:                                                |
|                                                                                         |
| Mode: EXTERNALLY_SPECIFIED_BREACH_HYDROGRAPH                                             |
|                                                                                         |
| The 1.5 km feasibility pilot applies pre-calculated unsteady discharge hydrographs      |
| at the upstream boundary condition line (UpstreamInflow in .u01).                       |
| It does NOT perform native HEC-RAS 2D Area Connection breach erosion mechanics.         |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Scenario Discharge Envelope

| Scenario ID | $Q_{peak}$ ($\text{m}^3/\text{s}$) | Source Classification | Description & Provenance |
| :--- | :--- | :--- | :--- |
| **`SCENARIO_MINIMUM`** | 28,500 | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` | Partial breach / regulated spillway design flood routing envelope from published literature. |
| **`SCENARIO_CENTRAL`** | 65,000 | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` | Reference progressive piping scenario from published secondary numerical studies (e.g. NIH/IIT Roorkee Tehri models). |
| **`SCENARIO_MAXIMUM`** | 115,000 | `SECONDARY_LITERATURE / ENGINEERING_ASSUMPTION` | Upper-bound emergency envelope representing catastrophic rapid breach from secondary literature. |

> [!WARNING]
> **Froehlich Attribution Hygiene:** These values ($28.5\text{k}, 65.0\text{k}, 115.0\text{k}\text{ m}^3/\text{s}$) are NOT direct evaluations of the unattenuated Froehlich (2008) peak discharge regression equation. They are progressive failure hydrograph peak assumptions sourced from secondary engineering literature.
