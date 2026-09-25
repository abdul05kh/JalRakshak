# RC2 Hydraulic Rendering Architecture & Specification
## JalRakshak Emergency Decision-Support System

### 1. Hydraulic Rendering Objective
The RC2 hydraulic rendering engine replaces the legacy Cesium point cloud / billboard approach with a clean, continuous, terrain-draped vector geometry pipeline powered by **ArcGIS Maps SDK for JavaScript 5.1** (`@arcgis/core@5.1.25` / `SceneView`).

The engine translates native USACE HEC-RAS 2D unsteady shallow water equation outputs into three distinct, unambiguous operational visual modes:
1. **Continuous Flood Depth (`DEPTH`)**: Multi-hue blues showing water depth in meters with physical depth-based opacity scaling.
2. **Binary Flood Inundation Footprint (`EXTENT`)**: Unambiguous wet/dry boundary polygon with high-contrast emergency cyan styling.
3. **Flood Arrival Isochrones (`ARRIVAL`)**: Chronological 15-minute isochrone bands mapping hydrodynamic wavefront arrival times from $T+00$ to $T+120$.

---

### 2. Layer Modes & Color Mapping

#### A. Depth Mode (`DEPTH`)
- **Physics Coupling**: Cell water depth $h = WSE - z_{\text{bed}}$ (meters).
- **Colormap**:
  - $0.0\text{m} \le h < 0.5\text{m}$: Low Hazard / Shallow Fringe — `rgba(186, 230, 253, 0.55)` (`#bae6fd`)
  - $0.5\text{m} \le h < 1.5\text{m}$: Moderate Hazard — `rgba(56, 189, 248, 0.70)` (`#38bdf8`)
  - $1.5\text{m} \le h < 3.0\text{m}$: Significant Inundation — `rgba(2, 132, 199, 0.82)` (`#0284c7`)
  - $3.0\text{m} \le h < 5.0\text{m}$: High Velocity / Deep Channel — `rgba(3, 105, 161, 0.88)` (`#0369a1`)
  - $h \ge 5.0\text{m}$: Extreme Hydraulic Hazard — `rgba(30, 58, 138, 0.95)` (`#1e3a8a`)
- **Draping**: `elevationInfo: { mode: "on-the-ground" }` ensuring zero z-fighting and conformal adherence to the GLO-30 DSM terrain surface.

#### B. Extent Mode (`EXTENT`)
- **Geometry**: Polygons encompassing all inundated grid cells ($h > 0.05\text{m}$).
- **Styling**: `rgba(14, 165, 233, 0.65)` fill with a distinct `rgba(56, 189, 248, 0.95)` 1.5px boundary contour.

#### C. Arrival Isochrone Mode (`ARRIVAL`)
- **Isochrone Intervals**:
  - $< 15\text{ min}$: Rapid Surge (`#ef4444`, 85% opacity)
  - $15 - 30\text{ min}$: Immediate Danger (`#f97316`, 80% opacity)
  - $30 - 45\text{ min}$: Approaching Front (`#eab308`, 75% opacity)
  - $45 - 60\text{ min}$: Intermediate Front (`#22c55e`, 70% opacity) — *Encompasses Limiting Edge R02-E07 Arrival at T+60:00*
  - $60 - 90\text{ min}$: Extended Valley Surge (`#06b6d4`, 65% opacity)
  - $> 90\text{ min}$: Distal Flood Plain (`#3b82f6`, 60% opacity)

---

### 3. Rendering Invariants
1. **Zero Fake Shaders**: All polygon colors and opacities represent real HEC-RAS hydraulic cells or derived depth contours.
2. **Single Graphic Collection**: Timestep updates modify existing graphic attributes in-place or rebuild the lightweight collection in $< 12\text{ms}$ without frame drops or GC spikes.
3. **No Cesium Artifacts**: 100% migrated to ArcGIS GraphicsLayer.
