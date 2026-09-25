# JalRakshak — Road-Hydraulic Spatial Mapping Pipeline
**Pipeline Specification:** Vector Road LineString to 2D Hydraulic Cell Mapping  
**CRS Pipeline:** WGS84 (`EPSG:4326`) $\longleftrightarrow$ UTM Zone 44N (`EPSG:32644`)

---

## 1. Objective

To determine the hydraulic exposure $(A_i, h_i, v_i)$ for each road network segment $e_i = (u, v)$ from the underlying HEC-RAS 2D hydraulic simulation grid or raster.

---

## 2. Spatial Mapping Methodology

1. **CRS Transformation:**
   - Road vector geometries are stored in WGS84 Geographic coordinates (`EPSG:4326`).
   - Hydraulic cell centers $(X, Y)$ and HEC-RAS 2D flow areas are defined in UTM Zone 44N (`EPSG:32644`).
   - All road geometries are projected into `EPSG:32644` using `pyproj.Transformer` with `always_xy=True`.
2. **Buffer & Spatial Sampling:**
   - For road segment $e_i$, a buffer polygon $B(e_i, r)$ is generated around the projected LineString with search radius $r = 50.0\text{ m}$ (spanning the road width and adjacent flood channel).
   - All hydraulic cells whose centroid $(x_c, y_c)$ falls within $B(e_i, r)$ (or nearest $k$-neighbors via `scipy.spatial.KDTree` within $r$) are sampled.
3. **Conservative Exposure Assignment:**
   - **Flood Arrival Time $A_i$:**
     $$A_i = \min_{c \in B(e_i, r)} A(c)$$
     The road segment is deemed cut off as soon as floodwaters breach any part of the segment.
   - **Maximum Flood Depth $h_i$:**
     $$h_i = \max_{c \in B(e_i, r)} h(c)$$
   - **Maximum Velocity $v_i$:**
     $$v_i = \max_{c \in B(e_i, r)} v(c)$$
4. **Data Gap Handling:**
   - If no hydraulic cells overlap segment $e_i$ and the segment lies outside the simulated floodplain domain, it is marked as `HIGH_GROUND_UNAFFECTED` ($A_i = \infty$).
   - If the segment lies within the domain boundary but cell values are null/unreadable, the segment is marked as `DATA_GAP`.
