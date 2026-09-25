# ROAD RENDERING & SPATIAL COUPLING PIPELINE
## Vector Road Network Ingestion, Geometry Densification, and 3D Terrain Draping

**Document ID:** DOC-MAP-ENG-03  
**Date:** 2026-09-25  
**Version:** 3.0.0-PROD  

---

### 1. Road Dataset Origin & Provenance

- **Dataset:** OpenStreetMap (OSM) Road Network cross-referenced with Uttarakhand Public Works Department (PWD) State Highway records (2026-Q1).
- **Artifact Location:** `data/study_area/roads.json`
- **Total Corridors Ingested:** 16 regional road features ($R01$ through $R16$).
- **Primary Evacuation Corridor:** **Route R02** (Malidewal Village $\to$ Koteshwar Corridor $\to$ Chamba Relief Shelter).
- **Total Route Distance:** $10.5\text{ km}$ across 7 directed edge segments ($R02\text{-}E01$ through $R02\text{-}E07$).

---

### 2. Geometry Densification Methodology ($\le 50\text{m}$)

To ensure precise hydraulic coupling without missing localized low points along mountainous river bends, road LineStrings are mathematically densified:

$$\text{sample\_spacing} = 50.0\text{ m}$$
$$N_{\text{samples}} = \max\left(2, \left\lfloor \frac{L_{\text{edge}}}{50.0} \right\rfloor + 1\right)$$

At each densified vertex $v_k$, a perpendicular search cylinder of radius $R = 150.0\text{ m}$ queries the HEC-RAS 2D computational cell KDTree in `EPSG:32644` Cartesian space.

---

### 3. Visual Hierarchy & 3D Draping Architecture

MapLibre GL JS renders road vectors on top of the 3D terrain elevation mesh using an authoritative 4-tier visual hierarchy:

```
[ TIER 4: LIMITING SEGMENT ]  R02-E07 (Pulsing Crimson #ef4444, 6px width, dashed [2, 1], white glow)
             ↑
[ TIER 3: ACTIVE ROUTE ]      Route R02 (Emerald / Gold #10b981 / #f59e0b, 5px width, 8px white casing)
             ↑
[ TIER 2: ROAD NETWORK ]      All OSM roads (Slate #64748b, 2.2px width, 4px dark casing #1e293b)
             ↑
[ TIER 1: TERRAIN SURFACE ]   Copernicus GLO-30 DSM 3D Mesh with Hillshade
```

#### Layer Configuration in MapView:
- **`roads-casing`:** `line-width: 4.0px`, `line-color: #1e293b`, `line-opacity: 0.40`
- **`roads-line`:** `line-width: 2.2px`, `line-color: #64748b`, `line-opacity: 0.75`
- **`route-casing`:** `line-width: 8.0px`, `line-color: #ffffff`, `line-opacity: 0.95`
- **`route-line`:** `line-width: 5.0px`, `line-color: #10b981`, `line-opacity: 1.0`
- **`limiting-casing`:** `line-width: 10.0px`, `line-color: #fee2e2`, `line-opacity: 0.95`
- **`limiting-line`:** `line-width: 6.0px`, `line-color: #ef4444`, `line-dasharray: [2, 1]`

---

### 4. Limiting Edge R02-E07 Spatial Identification

The limiting segment $R02\text{-}E07$ is situated in the lowest elevation riverbank corridor at Koteshwar ($612.0\text{ m}$ MSL elevation).
- **Coordinates:** Starts $[78.5020^\circ\text{E}, 30.2825^\circ\text{N}]$ and extends $1.4\text{ km}$ along the valley floor.
- **Hydraulic Arrival Time:** $T+60:00$ ($3,600\text{ seconds}$).
- **Travel Time from Origin:** $12\text{ min } 39\text{ sec}$ ($759\text{ seconds}$).
- **Configured Buffer:** $03\text{ min } 00\text{ sec}$ ($180\text{ seconds}$).
- **Resulting Evacuation Deadline:** $D = 60:00 - 12:39 - 03:00 =$ **`T+44:21`**.
