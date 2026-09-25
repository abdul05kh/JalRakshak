# JalRakshak — System Assumptions, Uncertainties & Limitations
**Document Purpose:** Transparent documentation of physical, numerical, and operational limits.

---

## 1. Hydraulic Modeling Limitations
1. **Uncalibrated Friction Parameters:** Manning's roughness coefficients ($n = 0.035$ channel, $n = 0.055$ floodplain) are engineering estimates rather than field-calibrated values against observed flood marks.
2. **2D Cell Averaging:** Water surface elevation within each 2D cell is modeled as planar across the cell geometry. Sub-grid topographic features smaller than cell dimensions are not resolved.
3. **Breach Geometry Parameterization:** Breach formation relies on parametric equations (Froehlich / MacDonald & Langridge-Monopolis) rather than geotechnical slope-stability breach mechanics.

---

## 2. Road Network & Routing Assumptions
1. **Static Travel Speeds:** Edge travel times assume free-flow travel speeds based on road classification. Emergency evacuation traffic congestion or road bottlenecks are not dynamically simulated.
2. **Bridge & Culvert Failure:** Road segments crossing rivers are assumed overtopped when water surface elevation exceeds road surface elevation; structural hydrodynamic scour is not modeled.
3. **Uniform Safety Buffer:** The safety buffer $B$ (default: 3 minutes) is a global operational parameter applied uniformly across all route segments.

---

## 3. Data Gaps
1. **Incomplete Mesh Overlap:** Road segments extending beyond the 2D computational mesh boundary receive an explicit `DATA_GAP` status if near river corridors or are classified as high ground if confirmed by DEM.
2. **Velocity Thresholds:** Where cell face velocities cannot be reliably mapped to road centerlines, velocity-based hazard criteria are flagged with uncertainty.
