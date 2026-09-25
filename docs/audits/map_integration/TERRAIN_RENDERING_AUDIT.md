# JALRAKSHAK — TERRAIN RENDERING AUDIT
**Standard:** Geospatial Rigor & Scientific Claims Discipline  
**Author:** Senior Engineering Team (SIH'26 JalRakshak)  
**Date:** 2026-09-25  

---

## 1. Terrain Provenance & Coordinates

| Parameter | Specification | Verification Status |
| :--- | :--- | :--- |
| **Primary Hydraulic Terrain** | Copernicus GLO-30 DSM (30m, hydrologically conditioned) | **VERIFIED** |
| **Computational Coordinate System** | EPSG:32644 (UTM Zone 44N, WGS84 Datum) | **VERIFIED** |
| **Display Coordinate System** | EPSG:4326 (WGS84 Lat/Lon Geographic) | **VERIFIED** |
| **Vertical Reference** | EGM96 Geoid / Orthometric Height (m MSL) | **VERIFIED** |
| **Tehri Dam Crest Elevation** | 830.0 m MSL (FRL: 830.0 m MSL, MWL: 835.0 m MSL) | **VERIFIED** |
| **Breach Invert Elevation** | 635.0 m MSL | **VERIFIED** |
| **Rendering Engine** | MapLibre GL JS (WebGL-accelerated Vector & 3D Terrain) | **VERIFIED** |

---

## 2. 3D Terrain Perspective Architecture

- **Perspective Angle (Pitch):** $58^\circ$ (Operational 3D Hero Mode) / $0^\circ$ (Operational 2D Top-Down Mode).
- **Azimuth Bearing:** $32^\circ$ (Aligned with Bhagirathi River Gorge downstream orientation).
- **Center Focus:** $[78.455^\circ\text{E}, 30.330^\circ\text{N}]$ (Frames Dam Crest $\to$ Downstream Inundation Corridor $\to$ Malidewal $\to$ Limiting Segment $R02$ $\to$ Chamba Shelter).
- **Coordinate Transformations:** Explicit forward and inverse transformations executed via `pyproj` in backend and standard spherical Mercator in WebGL viewport. Zero manual layer nudging or arbitrary vertical datum offsets.
