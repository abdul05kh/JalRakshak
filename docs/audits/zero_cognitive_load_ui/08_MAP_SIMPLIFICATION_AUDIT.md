# 08 — Map Simplification Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Minimal Supporting Evidence Map Configuration  
**Status:** PASS  

---

## 1. Map Layer Simplification

The map exists as **supporting spatial evidence**, not an overwhelming GIS dashboard.

### A. Default Visible Elements
1. **Selected Route Path:** Bold blue line (`#1d4ed8`, weight 5.5).
2. **Limiting Segment:** High-contrast red highlight (`#dc2626`, weight 7.5).
3. **Inundation Envelope:** Subtle semi-transparent blue overlay (`#38bdf8`, opacity 0.4).
4. **Origin Settlement Marker:** Amber badge (`#d97706`).
5. **Destination Shelter Marker:** Green shelter icon (`#15803d`).

### B. Suppressed by Default (Hidden Noise)
- Technical grid coordinates and cell boundaries.
- Non-critical tertiary road networks and dense label clutter.
- Elevation contour line overlays and raw raster metadata.
- HDF5 mesh indexing polygons.

---

## 2. Interactive Behavior
- Clicking on the Limiting Segment displays:
  - Limiting Road ID: `R02`
  - Flood Arrival: `T+60:00`
  - Cumulative Travel Time: `12.39 min`
  - Max Depth: `0.42 m`
- Map interaction reinforces the decision without forcing the operator to navigate map menus.
