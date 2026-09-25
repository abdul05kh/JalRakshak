# GATE 5 — UNCERTAINTY & EPISTEMIC LIMITATION MODEL

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** FORMALIZED & DEFENDED  
**Date:** 2026-09-24  

---

## 1. Epistemic Classification Framework

JalRakshak explicitly rejects manufactured "99% confidence" or "zero-risk" claims. All scientific and operational inputs are categorized under explicit epistemic labels.

```
                                    EPISTEMIC STATE
                                           │
         ┌──────────────────┬──────────────┴───────────────┬──────────────────┐
         │                  │                              │                  │
         ▼                  ▼                              ▼                  ▼
NUMERICAL_VERIFICATION  OPERATIONAL_CONFIGURATION  ENGINEERING_ASSUMPTION  NOT_ESTABLISHED
 (HEC-RAS 7.0.1 2D)    (Safety Buffer, Margin)    (Static Speeds, DEM)   (Field Validation)
```

---

## 2. Categorical Evidence Ledger

| System Component | Epistemic Classification | Justification & Scientific Boundary |
|:---|:---|:---|
| **2D Unsteady Hydraulic Solver** | `NUMERICAL_VERIFICATION` | Solves full 2D Shallow Water Equations using USACE HEC-RAS 7.0.1 solver with mass conservation verified ($<0.45\%$ error). |
| **Physical Dam-Break Validation**| `PHYSICAL_VALIDATION_NOT_ESTABLISHED` | No historical Tehri breach hydrograph exists; results represent scenario-conditional numerical predictions, not calibrated physical ground truth. |
| **Topography & Vertical Datum** | `STATIC_ENGINEERING_ASSUMPTION` | Copernicus DEM 30m / Survey of India contours; zero-level datum alignment verified, but micro-topographic structures (e.g. culverts, roadside ditches) are unrepresented. |
| **Road Network Scope** | `DEMONSTRATION_DATASET` | Comprises 17 representative road segments and 11 nodes spanning the Tehri $\to$ Koteshwar valley. Not an exhaustive road GIS inventory. |
| **Vehicle Traversal Speeds** | `STATIC_ENGINEERING_ASSUMPTION` | Speeds assigned by road classification ($40/30/20\text{ km/h}$). Zero dynamic traffic congestion, panic queuing, or debris blockage modeled. |
| **Operational Safety Buffer ($B$)**| `OPERATIONAL_CONFIGURATION` | Default $3.0\text{ min}$ (or user-configured $0-20\text{ min}$). A managerial risk-tolerance setting, NOT a physical constant. |
| **Low-Margin Threshold ($M_{\text{th}}$)**| `OPERATIONAL_CONFIGURATION` | Default $5.0\text{ min}$. Configured policy boundary separating `FEASIBLE` from `LOW MARGIN`. |
| **Breach Parameter Scenarios** | `SCENARIO_CONDITIONAL` | Minimum ($25\text{ m}$), Central ($50\text{ m}$), Maximum ($100\text{ m}$) parametric breach scenarios based on Froehlich / Macdonald empirical equations. |

---

## 3. Operational Disclosure to Officers

The officer interface must display these classifications in the **Evidence & Assumptions Drawer**, ensuring that decision-makers understand exactly what is physically modeled versus what is assumed.
