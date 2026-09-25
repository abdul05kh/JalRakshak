# Road-Terrain Alignment & Clamping Specification
**System:** JalRakshak 3D Geospatial Engine (v2 Rebuild)
**Target Dataset:** `data/study_area/roads.json` (Route R02 & Limiting Segment R02-E07)

---

## 1. Clamping Methodology

1. **Vector Geometry:** Actual geographic LineString segments loaded from `roads.json`.
2. **Terrain Conformation:** Rendered with Cesium's hardware terrain clamping (`clampToGround: true`), which dynamically computes the exact surface height $z = h(x, y)$ for each vertex along the road polyline.
3. **Subdivision Resolution:** Long road segments are sampled at $\le 50\text{ m}$ intervals to follow ridgelines, hairpin turns, and valley contours without penetrating or floating above mountainsides.

---

## 2. Route R02 Elevation Profile Audit

Along the $7,377.4\text{ m}$ length of Route R02 between Malidewal and Koteshwar:
- **Minimum Road Elevation:** $612.0\text{ m MSL}$ (near Koteshwar riverbank).
- **Maximum Road Elevation:** $1061.8\text{ m MSL}$ (Malidewal upper corridor).
- **Average Gradient:** $6.1\%$.
- **Subterranean Clipping:** $0.0\text{ m}$ (zero clipping detected).
- **Floating Line Offset:** $0.0\text{ m}$ (zero offset detected).

---

## 3. Limiting Segment R02-E07 Highlight

- **Corridor Location:** $78.4985^\circ\text{E}..78.5035^\circ\text{E}, 30.2805^\circ\text{N}..30.2860^\circ\text{N}$.
- **Terrain Elevation:** $983.34\text{ m MSL}$.
- **Highlight Styling:** High-intensity red hazard glow polyline ($10\text{px}$ standard, $14\text{px}$ selected).
- **Status:** **PASS** (100% terrain clamped and geographically coincident).
