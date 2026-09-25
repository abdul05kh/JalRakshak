# CesiumJS 3D Terrain Engine Architecture
**System:** JalRakshak 3D Geospatial Engine (v2 Rebuild)
**Engine Core:** `src/map3d/`

---

## 1. Architectural Component Overview

```
src/map3d/
├── CoordinateTransform.ts   # Analytical WGS84 <-> UTM Zone 44N conversions
├── TerrainLoader.ts         # Fast in-memory binary DSM elevation sampler
├── TerrainProvider.ts       # Cesium CustomHeightmapTerrainProvider (GLO-30 backed)
├── RoadLayer.ts             # Terrain-clamped road networks, R02 & R02-E07
├── RiverLayer.ts            # Bhagirathi River corridor & Tehri Reservoir water body
├── DamLayer.ts              # Tehri Dam crest (830m) & breach location (635m)
├── ShelterLayer.ts          # Chamba safe shelter (1648m) & evacuation points
├── HydraulicLayer.ts        # HEC-RAS flood extent, depth ramp, arrival isochrones & mesh
├── CameraController.ts      # 3D orbital camera, pitch, and 7 authoritative presets
├── LayerController.ts       # Independent visibility state management
├── TerrainValidator.ts      # Real-time ray-cast picking & landmark validation
├── TerrainEngine.ts         # Master coordinator managing viewer lifecycle & events
└── CesiumViewer.tsx         # High-performance React UI wrapper with inspection HUD
```

---

## 2. Key Technical Innovations

1. **Direct Float32 DSM Ingestion:** Eliminates lossy PNG 8-bit terrain encoding artifacts by streaming full 32-bit floating point elevation values.
2. **Ellipsoidal Depth Testing:** `depthTestAgainstTerrain = true` enables realistic mountain occlusions, ridge lines, and valley depth perspective.
3. **Real-time Elevation HUD:** Interactive ray casting extracts exact MSL elevations directly under the mouse pointer at 60 FPS.
4. **Clean Decoupling:** Complete separation of concerns between terrain geometry, vector infrastructure, hydraulic results, and camera controls.
