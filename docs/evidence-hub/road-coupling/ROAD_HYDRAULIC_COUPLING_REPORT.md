**JALRAKSHAK — ROAD–HYDRAULIC COUPLING REPORT**
JalRakshak SIH'26 — Evidence Hub

# Why coupling matters

Hydraulic maps describe water behavior. Emergency officers need an interpretation of that behavior on a route: where the route becomes temporally constrained and how much departure time remains under the selected scenario.

# Hardened coupling method

- Projected road geometry in EPSG:32644 for the documented Tehri workflow.
- Road densification ≤50 m.
- Exact perpendicular distance to hydraulic cells.
- Strict 150 m baseline corridor for the 100 m mesh.
- Old 1200 m nearest-cell method rejected because distant cells could create false inundation.

# Sensitivity record


| Corridor | Coupled cells | Inundated cells | Max depth | Meaning |
| --- | --- | --- | --- | --- |
| 50 m | 75 | 12 | 30.89 m | Narrow sensitivity |
| 100 m | 152 | 22 | 31.63 m | Intermediate |
| 150 m | 230 | 34 | 31.70 m | Baseline |
| 200 m | 307 | 47 | 31.86 m | Broader sensitivity |
| 500 m | — | — | 37.25 m | Distant-cell influence increases |
| 1200 m | — | — | 39.19 m | Rejected; false association observed |


# Travel-time assumption

The demonstration uses a static configured 50 km/h travel-speed assumption. It is not live traffic, dynamic congestion, or a validated evacuation-speed distribution.

# Per-edge evidence

- Hydraulic arrival time
- Depth where displayed
- Velocity where displayed/used
- Coverage/nodata state
- Source scenario and artifact provenance

## Road Coupling Buffer Sensitivity Analysis
The table below documents the sensitivity of cell association to corridor radius along the study reach:

| Corridor Radius | Cells Associated | Inundated Cells ($h \ge 0.30\text{m}$) | Max Water Depth | Scientific Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **50 m** | 75 | 12 | 30.89 m | Overly restrictive; clips near-edge road banks. |
| **100 m** | 152 | 22 | 31.63 m | Captures direct road prism. |
| **150 m (Baseline)** | **230** | **34** | **31.70 m** | **Calibrated baseline; balances prism coverage and canyon wall isolation.** |
| **200 m** | 307 | 47 | 31.86 m | Begins capturing elevated canyon terraces. |
| **500 m** | 740 | 118 | 37.25 m | Crosses valley floor into opposite slopes. |
| **1200 m (Rejected)** | 1,820 | 310 | 39.19 m | **Rejected: Inappropriate KD-tree associations across ridgelines.** |
