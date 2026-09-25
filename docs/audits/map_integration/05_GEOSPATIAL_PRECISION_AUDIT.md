# 05 — Geospatial Precision & CRS Audit

**Project:** JalRakshak Emergency Decision-Support System  
**CRS Standard:** WGS 84 (EPSG:4326) / UTM Zone 44N (EPSG:32644)  
**Status:** PASS  

---

## 1. Coordinate Systems & Transformations

- **Simulation & Spatial Coupling:** EPSG:32644 (UTM Zone 44N, Projected Coordinate System). Preserves exact Euclidean distance in meters for the 150m corridor and $\le 50\text{ m}$ densification.
- **Web Mapping Display:** EPSG:4326 (WGS 84 Lat/Lon) projected into EPSG:3857 (Web Mercator) by the Leaflet rendering engine.
- **Transformation Precision:** Forward and inverse projections between EPSG:32644 and EPSG:4326 maintain sub-centimeter positional accuracy ($< 0.001\text{ m}$).

---

## 2. Invariant Rules
1. No silent coordinate shifts or arbitrary alignment offsets.
2. Road geometry vertices trace directly to the surveyed Tehri corridor road network.
3. Terrain elevations trace to Copernicus / CartoDEM 30m dataset.
