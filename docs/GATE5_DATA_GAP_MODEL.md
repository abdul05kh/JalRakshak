# GATE 5 — DATA-GAP PROPAGATION MODEL

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** VALIDATED  
**Date:** 2026-09-24  

---

## 1. Core Principle: Unknown Must Remain Unknown

In emergency decision-support software, missing or incomplete data must never be silently converted into an affirmative safety claim. 

If hydraulic data is unavailable for a road edge, or if an origin/destination point lies outside mapped road topology, the system must report `DATA GAP` or `NO_FEASIBLE_ROUTE`. It must **never** default to `OPEN`, `FEASIBLE`, or `SAFE`.

---

## 2. Data-Gap Taxonomy & Handling Rules

| Data Element | Gap Condition | System Behavior & Status Propagation | Officer UI Representation |
|:---|:---|:---|:---|
| **Road Hydraulic Exposure** | Road segment $e_i$ lies outside 2D mesh domain or has uncomputed arrival. | Edge assigned `has_data_gap = True`, $A_i = \text{NULL}$. Route status becomes **`DATA GAP`**. Feasibility cannot be asserted. | Gray warning banner: "DATA GAP: Hydraulic exposure unmapped on segment." |
| **Road Network Coverage** | Query requests evacuation to/from location outside the 17 demonstration segments. | Snapping offset reported ($> 500\text{ m}$); if completely disconnected, returns **`NO_FEASIBLE_ROUTE`**. | "Location outside mapped demonstration network. Data gap logged." |
| **Travel Speed Telemetry** | No real-time sensor or GPS floating car data available. | System applies `STATIC_ENGINEERING_ASSUMPTION` speeds per road class ($40/30/20\text{ km/h}$) and flags `dynamic_traffic_model = NOT_IMPLEMENTED`. | Officer limitation badge: "Static Speeds (No Live Traffic)." |
| **Shelter Status** | Shelter capacity or relief supplies unverified. | Surfaced as static metadata without assuming real-time availability. | "Capacity metadata demonstration-only." |
| **Dam Inflow / Hydrograph** | Real-time inflow telemetry missing during event. | Scenario locked to pre-computed HEC-RAS breach run ($Q_{\text{peak}} = 22,500\text{ m}^3/\text{s}$). | "Scenario-conditional model; no real-time SCADA feed." |

---

## 3. Mathematical Propagation in EWE

Let route $\mathcal{P} = (e_1, e_2, \dots, e_n)$.
$$\text{If } \exists e_k \in \mathcal{P} \text{ such that } \text{Hydraulics}(e_k) = \text{MISSING} \implies \text{Status}(\mathcal{P}) = \mathbf{DATA\_GAP}$$
$$\text{Deadline}(\mathcal{P}) = \text{NULL}, \quad \text{Margin}(\mathcal{P}) = \text{NULL}$$

This guarantees that unmapped flood hazards cannot result in false-positive evacuation authorizations.
