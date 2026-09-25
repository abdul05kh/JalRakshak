# GATE 5 — RAW HYDRAULIC OUTPUT VS. JALRAKSHAK DECISION SUPPORT

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** FORENSIC CAPABILITY COMPARISON  
**Date:** 2026-09-24  

---

## 1. Objective & Hypothesis

**Hypothesis:** *"Raw hydraulic model output describes flood physics; JalRakshak transforms that output into actionable evacuation decision support."*

To test this hypothesis without fabricating human user studies, we evaluate an **Algorithmic & Task-Completeness Controlled Comparison** across two information conditions:
- **Condition A (Raw Hydraulic Simulation Output):** Native HEC-RAS 2D unsteady numerical arrays (WSE, water depth, velocity, grid cell coordinates, mesh geometry, time-series arrays).
- **Condition B (JalRakshak Decision Support):** Integrated Road Network Topology, Spatial Corridor Coupling ($150\text{ m}$), Evacuation Window Engine ($D_{\text{deadline}} = \min_i(A_i - T_i - B)$), Alternative Route Ranking, Deterministic Decision Engine, and Epistemic Uncertainty Disclosure.

---

## 2. Controlled Decision Task Matrix

An Emergency Control Room Watch Officer is presented with an imminent catastrophic breach alert at Tehri Dam and must answer seven core emergency decisions for evacuating **Malidewal Lowland Village** to **Koteshwar Settlement** (or high-ground shelter alternatives).

| Decision Query | Condition A: Raw HEC-RAS Output | Condition B: JalRakshak Decision Support | Transformation / Gap Closed |
|:---|:---|:---|:---|
| **1. Is Route A currently feasible?** | **Not directly represented as a route-level evacuation decision in the HEC-RAS output used by this implementation.** Operator sees 6,321 mesh cells with varying depths; cannot determine if vehicle path clears water in time. | **`FEASIBLE` (or `LOW MARGIN` / `INFEASIBLE`).** Explicit, deterministic status calculated from cumulative travel time vs flood arrival. | Graph topology + EWE edge clearance evaluation |
| **2. What is the latest feasible departure time?** | **Not directly represented in HEC-RAS output.** Requires manual calculation of arrival at all road vertices minus travel time and safety buffer. | **`00:44:21 UTC`** ($44.35\text{ min}$ from breach). Exact timestamp computed via $D_{\text{deadline}} = \min_i(A_i - T_i - B)$. | Automated minimum deadline evaluation |
| **3. What road segment constrains the route?** | **Not directly represented in HEC-RAS output.** Raw model has no road entity IDs or road hierarchy. | **`R02 (Tehri Dam Toe -> Malidewal / Koteshwar Valley)`**. Pinpoints exact bottleneck segment. | Road-hydraulic spatial association |
| **4. When does the flood reach that segment?** | **Manual inspection required.** Operator must locate cell 1894/1943 in table and extract arrival ($3,600\text{ s} / 60\text{ min}$). | **`01:00:00 UTC (60.0 min)`**. Directly surfaced in primary decision panel. | Automated threshold crossing extraction ($h \ge 0.30\text{ m}$) |
| **5. What is the remaining decision margin?** | **Not directly represented in HEC-RAS output.** | **`+44.4 min`** (or delta against requested departure). | $D_{\text{deadline}} - D_{\text{departure}}$ arithmetic |
| **6. Is there an alternative route if the valley is cut off?** | **Not directly represented in HEC-RAS output.** HEC-RAS contains no alternative road paths or connectivity graph. | **`Route B (High-ground ridge via R01/R17)`** — Status: `OPEN (Below hazard threshold)`, Travel time: $24.8\text{ min}$, Margin: Unconstrained. | $k$-shortest path routing with EWE scoring |
| **7. What happens under a Maximum Breach Scenario?** | **Manual dataset inspection required.** Requires manual inspection of large multidimensional hydraulic result datasets (~13.5 MB HDF5 binary arrays). | **Side-by-side comparison table:** Window contracts by $22.5\text{ min}$, status transitions to `LOW MARGIN`. | Automated multi-scenario comparative engine |

---

## 3. Algorithmic Information Completeness Summary

| Capability Metric | Condition A (Raw Hydraulics) | Condition B (JalRakshak Decision Engine) |
|:---|:---:|:---:|
| **Direct Route Feasibility Output** | ❌ 0% | ✅ 100% |
| **Departure Deadline Surfaced** | ❌ 0% | ✅ 100% |
| **Bottleneck Segment Identified** | ❌ 0% | ✅ 100% |
| **Alternative Route Suggestions** | ❌ 0% | ✅ 100% |
| **Safety Buffer Incorporation** | ❌ 0% | ✅ 100% |
| **Missing Data Awareness (Data Gap)**| ❌ 0% | ✅ 100% |
| **Cryptographic Provenance Link** | ⚠️ Partial (File metadata) | ✅ 100% (SHA-256 in decision object) |

---

## 4. Conclusion & Scientific Defense

JalRakshak is **NOT merely a flood map on top of HEC-RAS**. 

A flood map displays where water is. JalRakshak solves the coupled spatial-temporal graph optimization problem:
$$D_{\text{deadline}} = \min_{e_i \in \mathcal{P}} \left( A(e_i) - \sum_{k=1}^i \frac{L(e_k)}{v(e_k)} - B \right)$$

This mathematical transformation is what converts hydrodynamic simulation arrays into deterministic, actionable evacuation decisions for emergency managers.
