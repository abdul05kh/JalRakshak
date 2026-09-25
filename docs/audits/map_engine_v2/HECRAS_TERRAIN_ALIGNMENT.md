# HEC-RAS Hydraulic & Terrain Alignment Specification
**System:** JalRakshak 3D Geospatial Engine (v2 Rebuild)
**Source Data:** HEC-RAS 2D SWE Inundation Polygons & Cell Outputs
**Coordinate System:** EPSG:4326 / EPSG:32644 (Projected UTM Zone 44N)

---

## 1. Spatial Alignment Principle

The HEC-RAS hydraulic layer is treated as an independent spatial data layer draped directly over the authoritative Copernicus GLO-30 DSM terrain.

- **Terrain Preservation:** The 3D terrain surface is **never distorted or modified** to match the flood.
- **Hydraulic Conformation:** The flood surface is draped using `Cesium.ClassificationType.TERRAIN`, projecting exact hydraulic boundaries and water depths over the underlying valley topography.

---

## 2. Inundation Extent & Valley Confinement

- **River Channel Occupancy:** The flood footprint strictly occupies the Bhagirathi River valley corridor from Tehri Dam down to Devprayag.
- **Mean Flood Elevation:** $685.4\text{ m MSL}$ (confined strictly to the lower valley floor).
- **High-Ground Integrity:** All mountain summits ($> 1500\text{ m}$) and evacuation shelters (e.g. Chamba at $1648.5\text{ m}$) remain completely dry and elevated above the inundation zone.

---

## 3. Dynamic Temporal Synchronization

- **Timestep Range:** $T+00, T+15, T+30, T+45, T+60, T+90, T+120\text{ minutes}$.
- **Dynamic Propagation:** Moving the time slider updates the inundated cell extents and depth gradients in real time according to hydraulic arrival times.
- **Independence:** The road network, dam, and 3D terrain geometry remain static while the flood wave moves downstream.
