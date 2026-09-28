# Frontend 3D SceneView & UI Architecture Specification

**Author / Maintainer:** Mohammad Zakiruddin ([@zakirverse](https://github.com/zakirverse))  
**Role:** Frontend Developer  
**Project:** JalRakshak — Decision Support System for Dam-Break Flood Evacuation

---

## 1. Frontend Technology Stack
- **Framework:** React 18 with TypeScript and Vite
- **3D Geospatial Engine:** ArcGIS Maps SDK for JavaScript (`@arcgis/core` v4.32)
- **Styling & UI:** Tailwind CSS, Lucide React Icons, Custom Glassmorphism Theme
- **State Management:** Reactive component hooks with timeline state propagation

---

## 2. 3D SceneView & Hydraulic Rendering Architecture

### Key Components
1. **`ArcGISSceneViewer.tsx`**:
   - Manages the WebGL 3D SceneView instance.
   - Binds elevation services for Himalayan terrain topology.
   - Orchestrates feature layers (roads, settlements, shelters, and hydraulic meshes).

2. **`ArcGISHydraulicLayer.ts`**:
   - Dynamically creates client-side `FeatureLayer` from scenario inundation GeoJSON.
   - Supports 3 real-time thematic visualization modes:
     - **Extent Only:** Aquatic cyan fill with glowing boundary ($h \ge 0.30\text{ m}$).
     - **3D Water Depth:** Continuous multi-color depth ramp ($0.3\text{m} \to 15\text{m+}$).
     - **Arrival Time Contours:** Temporal isochrone color ramps ($<30\text{m}$ to $>90\text{m}$).
   - Integrates custom Arcade expressions and popup templates for interactive telemetry inspection.

3. **`OperationalMapView.tsx`**:
   - Provides split-pane layout combining 3D terrain canvas with real-time decision support cards.
   - Includes temporal playback scrubber ($T+00$ to $T+120$) with interactive pause/play/speed controls.

---

## 3. Performance & WebGL Optimizations
- Debounced camera repositioning during scenario switches.
- Geometry clustering and feature recycling during timeline scrub events.
- Efficient memory lifecycle cleanup upon component unmount.
