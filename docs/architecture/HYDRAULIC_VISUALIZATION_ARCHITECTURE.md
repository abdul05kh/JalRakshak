# HYDRAULIC VISUALIZATION ARCHITECTURE

**Document:** Hydraulic Visualization Architecture  
**Version:** RC2.1  
**Status:** ACTIVE  

---

## 1. Native HEC-RAS 2D Pipeline

Flood propagation data is computed by HEC-RAS 2D unsteady flow equations across the Bhagirathi river channel down to Devprayag.
```text
Native HEC-RAS HDF5 Plan Output
         ↓ (hecras_adapter.py)
Derived Inundation GeoJSON (max_depth, arrival_min, wse_m)
         ↓ (FastAPI /api/v1/scenarios/{id}/layers)
Frontend ArcGISHydraulicLayer.ts
         ↓ (GraphicsLayer clamped on-the-ground)
Human-Visible 3D Flood Wave
```

---

## 2. Elevation Clamping & Z-Fighting Mitigation

Inundation polygons use ArcGIS `elevationInfo: { mode: "on-the-ground" }`. This clamps the flood polygon directly onto the Copernicus GLO-30 DSM ground surface without requiring artificial vertical offsets that would distort physical geometry.

---

## 3. Thematic Modes

1. **DEPTH:** Continuous blue-to-indigo gradient calibrated for flood hazard depths ($0.3\text{m}$ to $>15.0\text{m}$).
2. **EXTENT:** High-clarity aquatic cyan footprint ($h \ge 0.30\text{m}$).
3. **ARRIVAL:** Temporal isochrone ramp ($T+15\text{m}$ to $T+120\text{m}$).
