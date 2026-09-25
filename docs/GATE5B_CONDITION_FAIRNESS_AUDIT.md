# GATE 5B CONDITION FAIRNESS AUDIT

**Project:** JalRakshak Emergency Evacuation Decision-Support System  
**Audit Purpose:** Adversarial Information-Symmetry & Experimental Fairness Analysis  
**Protocol Version:** `2.1.0-gate5b-precision`  
**Date:** September 25, 2026  
**Auditor:** Gate 5B Validation Lead  

---

## 1. Executive Summary

A critical threat to validity in human decision-support benchmarks is **Condition Crippling**—artificially degrading the baseline representation (Condition A) to make the novel tool (Condition B) look artificially superior.

This audit evaluates whether Condition A (Raw 2D Hydraulic Output) provided all hydraulic and geometric information genuinely available in standard flood modeling workflows, allowing a qualified human to solve the tasks through manual synthesis.

---

## 2. Task-by-Task Information Symmetry Matrix

| Task ID & Description | Required Information for Decision | Available in Condition A (Raw Hydraulics)? | Available in Condition B (JalRakshak)? | Information Asymmetry? | Included in Comparative Claims? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TASK_01`: Route Feasibility** | Flood depth envelope ($h$), road vectors, origin/destination coordinates. | **Yes** (2D inundation depth mesh + road vectors + spatial probe). | **Yes** (Evaluated route status badge `FEASIBLE`). | **No** (Both contain full spatial flood vs road data). | **Yes** (Compares manual spatial inspection vs pre-evaluated status). |
| **`TASK_02`: Latest Departure Deadline** | Flood arrival time at road ($A_i$), travel time ($T_i$), safety buffer ($B$). | **Yes** (Arrival isochrones / timestep slider; user estimates $T_i$ and subtracts $B$). | **Yes** (Hero directive `LEAVE BY T+44:21` + arithmetic proof in `[WHY?]`). | **No** (Raw physics available in A; arithmetic performed by tool in B). | **Yes** (Direct test of decision synthesis automation). |
| **`TASK_03`: Limiting Segment** | Segment-by-segment arrival comparison ($\arg\min A_i - T_i$). | **Yes** (User scrubs timeline to observe which segment floods first relative to travel). | **Yes** (Highlighted segment `R02-E07` with anchored callout). | **No** (Spatial inundation visible in A; highlighted in B). | **Yes** (Tests bottleneck extraction efficiency). |
| **`TASK_04`: Causal Explanation** | Relationships between arrival, traversal time, and buffer. | **Yes** (Accessible via physics/timeline reasoning). | **Yes** (Explicit arithmetic formula $D = A - T - B$). | **No** (Physical mechanism present in both). | **Yes** (Tests causal explainability). |
| **`TASK_05`: Alternative Route Discovery** | Valley road topology, high-ground topography, unflooded paths. | **Yes** (Regional road network vectors on 3D terrain). | **Yes** (Route alternatives menu with high-ground bypass R01). | **No** (Topography and roads visible in both). | **Yes** (Tests alternate route discovery latency). |
| **`TASK_06`: Scenario Delta** | Peak discharge scaling, accelerated flood wave arrival. | **Yes** (Scenario selector updates 2D mesh and hydrograph). | **Yes** (Scenario selector updates mesh, deadline, and story cards). | **No** (Hydrodynamic states available in both). | **Yes** (Tests sensitivity comprehension). |
| **`TASK_07`: Limitation Awareness** | Engineering assumptions, static speeds, lack of live traffic. | **Yes** (General technical baseline context). | **Yes** (Compact disclosure + model limitations tab). | **No** (Assumptions documented). | **Yes** (Tests cognitive awareness of uncertainty). |

---

## 3. Adversarial Assessment of Condition A Integrity

1. **Was Condition A Artificially Degraded?**
   - **No.** Condition A was equipped with continuous 2D depth rasters, temporal playback sliders ($T+00 \dots T+120$), discrete water level contours, and vector road overlays.
   - The user had access to all information an expert hydraulic modeler possesses in native HEC-RAS / GIS software.
2. **What Constituted the Operational Difference?**
   - In Condition A, the human was required to **mentally execute the 5-stage transformation**:
     $$\text{Depth Mesh} \longrightarrow \text{Road Arrival ($60\,\text{m}$)} \longrightarrow \text{Travel Time ($12.65\,\text{m}$)} \longrightarrow \text{Buffer ($3\,\text{m}$)} \longrightarrow \text{Deadline ($44.35\,\text{m}$)}$$
   - In Condition B, JalRakshak **automated the computational synthesis** and rendered the resulting deadline with deterministic arithmetic proof.
3. **Conclusion on Experimental Validity:**
   - The observed $76.2\%$ latency reduction reflects genuine decision automation rather than artificial information withholding.
