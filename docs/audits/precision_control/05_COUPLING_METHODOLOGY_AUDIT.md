# 05 — Spatial Road Coupling Methodology & Corridor Audit
**Audit Date:** 2026-09-24  
**Audited Module:** `backend/app/domain/road_hydraulic_mapper.py`  

---

## 1. Locked Methodology Specifications

The approved, scientifically locked spatial coupling methodology replaces legacy unconstrained KD-tree nearest centroid searches with a mathematically rigorous perpendicular corridor algorithm:

1. **Projected Coordinate Reference:** Road geometries and hydraulic cells projected to `EPSG:32644` (UTM Zone 44N).
2. **LineString Densification:** Road LineStrings densified at sampling intervals $\le 50.0\text{ m}$.
3. **Exact Perpendicular Buffering:** Strict Euclidean perpendicular distance threshold:
   $$\text{dist}(\text{cell\_centroid}, \text{LineString}) \le 150.0\text{ m} \quad (1.5 \times \Delta x)$$
4. **Conservative Hydraulic Assignment:**
   $$A_i = \min_{c \in \text{corridor}} A(c), \quad h_i = \max_{c \in \text{corridor}} h(c), \quad v_i = \max_{c \in \text{corridor}} v(c)$$

---

## 2. Comparison: Locked vs Deprecated Coupling

| Parameter | Deprecated Legacy Method | Locked Gate 4 / Gate 5 Method | Forensic Impact |
| :--- | :--- | :--- | :--- |
| **Search Geometry** | KD-tree centroid radius $1,200\text{ m}$ | Densified LineString corridor $150\text{ m}$ | **Eliminated spurious distant riverbed coupling** |
| **Sample Spacing** | Raw vertex only ($> 500\text{ m}$) | Uniform $\le 50.0\text{ m}$ densification | **Continuous road coverage** |
| **R02 Coupled Cells**| $2,167\text{ cells}$ | $229\text{ cells}$ | **10x cleaner spatial association** |
| **R02 Flood Arrival**| $T+55:00$ ($3,300\text{ s}$) | $T+60:00$ ($3,600\text{ s}$) | **Physically faithful road crest arrival** |
| **Computed Deadline**| $T+39:21$ ($2,361\text{ s}$) | $T+44:21$ ($2,661\text{ s}$) | **Accurate single-source ground truth** |

---

## 3. Codebase Cleanliness Verdict
A full repository scan confirmed that **zero** active production code paths utilize the deprecated $1,200\text{ m}$ KD-tree search. All road-hydraulic mapping strictly executes via `RoadHydraulicMapper(search_radius_m=150.0)`.
