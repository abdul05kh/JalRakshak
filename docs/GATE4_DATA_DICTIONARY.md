# GATE 4 DATA DICTIONARY
## Formal Dictionary of Domain Terms, Identifiers, and Variable Structures

**Document ID:** `DOC-GATE4-DATA-DICT-001`  
**Status:** APPROVED  
**Date:** 2026-09-24  

---

### Core Entities & Concepts

1. **`WSE` (Water Surface Elevation):** Native stage height ($z$ elevation) of water surface above reference datum in meters.
2. **`z_min` (Cell Minimum Elevation):** Native lowest bed elevation within a 2D computational cell in meters.
3. **`d` (Derived Inundation Depth):** Vertical water column thickness above cell minimum bed elevation: $d = \max(0, \text{WSE} - z_{\text{min}})$.
4. **`v_face` (Face Velocity):** Component of flow velocity normal to the boundary face between two adjacent 2D computational cells in $\text{m/s}$.
5. **`H_arr` (Flood Arrival Threshold):** Configured water depth threshold ($0.30\text{ m}, 0.50\text{ m}, 1.00\text{ m}$) determining the exact instant of hazardous inundation arrival.
6. **`t_arr` (Arrival Time):** The earliest simulation elapsed time $t$ at which $d(c, t) \ge H_{\text{arr}}$. Expressed in seconds from start ($t=0$). If depth never exceeds $H_{\text{arr}}$, $t_{\text{arr}} = \text{NULL}$ (`NOT_REACHED` / $\infty$).
7. **`T_i` (Cumulative Traversal Time):** Total time in seconds/minutes required for an evacuation vehicle to traverse from route origin to the completion of edge $e_i$.
8. **`B` (Safety Buffer):** User-configured time buffer in minutes/seconds added to account for vehicle startup, boarding, and traffic congestion.
9. **`D_deadline` (Latest Feasible Departure):** The latest departure time from origin ensuring vehicle clears all downstream road segments before flood arrival with configured safety buffer:
$$D_{\text{deadline}} = \min_{i} (A_i - T_i - B)$$
10. **`Limiting Segment`:** The specific road segment $e_k$ that yields the minimum departure deadline: $k = \text{argmin}_i (A_i - T_i - B)$.
11. **`Margin`:** The remaining operational evacuation window between current decision time and departure deadline: $M = D_{\text{deadline}} - D_{\text{decision}}$.
12. **`FEASIBLE`:** A route where $D_{\text{decision}} \le D_{\text{deadline}}$ with margin $> 5\text{ min}$.
13. **`LOW_MARGIN`:** A route where $0 \le M \le 5\text{ min}$.
14. **`INFEASIBLE`:** A route where $D_{\text{decision}} > D_{\text{deadline}}$ ($M < 0$).
15. **`DATA_GAP`:** A state where missing road geometry, speed, or hydraulic arrival values prevent reliable safety determination.
16. **`NO_FEASIBLE_ROUTE`:** A state where no connected path satisfies constraints under the active scenario.
