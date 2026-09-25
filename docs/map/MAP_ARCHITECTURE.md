# Map Architecture Specification

**Project:** JalRakshak Emergency Decision-Support System  
**Component:** Geospatial Mapping Subsystem  
**Date:** 2026-09-25  

---

## 1. System Architecture

The JalRakshak map architecture is built on a high-performance vector and raster rendering pipeline:
1. **Base Layer:** Standard OpenStreetMap cartographic tiles and topographic hillshade relief context for the Himalayan Tehri-Koteshwar valley.
2. **Hydraulic Inundation Layer:** GeoJSON temporal wavefront boundaries extracted from native HEC-RAS 2D unsteady flow simulations.
3. **Road Network Layer:** Topological graph edges projected in EPSG:32644 with 150m LineString corridor buffer representations.
4. **Operational Route Layer:** Bold directional polyline with high-contrast limiting segment highlight and destination shelter pins.
5. **Interactive Overlay Layer:** Discrete temporal timeline slider, floating decision cards, and point query inspection probes.
