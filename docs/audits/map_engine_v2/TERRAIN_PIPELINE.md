# Terrain Pipeline Architecture & Transformation Specification
**System:** JalRakshak 3D Geospatial Engine (v2 Rebuild)
**Pipeline Module:** `scripts/build_3d_terrain_pipeline.py` & `src/map3d/TerrainProvider.ts`
**Authoritative Dataset:** Copernicus GLO-30 DSM (1-arcsec / ~30.92m resolution)

---

## 1. End-to-End Pipeline Workflow

```
[ Copernicus GLO-30 DSM GeoTIFF (EPSG:4326 / EGM2008) ]
                          ↓
[ GeoTIFF Header & Forensic Validation (tifffile + float32) ]
                          ↓
[ Operational Study Area Spatial Extraction (78.20°E..78.75°E, 30.05°N..30.55°N) ]
                          ↓
[ Binary Grid Compilation (tehri_valley_elevation.bin + terrain_meta.json) ]
                          ↓
[ Cesium CustomHeightmapTerrainProvider (GeographicTilingScheme + Bilinear Sampling) ]
                          ↓
[ WebGL Hardware Ellipsoid Triangulation & Seamless Skirt Generation ]
                          ↓
[ Real 3D Physical Mountain Relief, Riverbed Valleys, and Ridge Topography ]
```

---

## 2. Technical Transformation Details

### A. Horizontal Coordinate Systems
- **Authoritative Geographic Reference:** WGS84 (`EPSG:4326`).
- **Projected Analytical Grid:** UTM Zone 44N (`EPSG:32644`), Central Meridian $81.0^\circ\text{E}$, False Easting $500,000\text{ m}$.
- **Ellipsoid Parameters:** Semi-major axis $a = 6,378,137.0\text{ m}$, Flattening $f = 1 / 298.257223563$.

### B. Vertical Reference & Heights
- **Vertical Reference:** EGM2008 Geoid (Mean Sea Level, MSL).
- **Vertical Units:** Meters ($m$).
- **Ellipsoidal Interaction:** Cesium natively positions vertices relative to the WGS84 reference ellipsoid with exact orthometric height offsets ($h = H + N$), guaranteeing true 3D spatial alignment.
- **Vertical Exaggeration:** Default $1.0\times$ (strictly unscaled, physical terrain). Optional $1.5\times$ visual enhancement mode isolated strictly to rendering pipeline without altering any underlying numerical calculations.

---

## 3. Tile Refinement & Multi-Resolution LOD
- **Tiling Scheme:** Cesium `GeographicTilingScheme` (Level 0 through Level 16).
- **Sampling Matrix:** $65 \times 65$ vertex grid per tile.
- **Boundary Continuity:** Tile skirts constructed down to minimum tile elevation, preventing visual gaps or cracks across LOD transitions.
- **Refinement Strategy:** Screen-space error (SSE) driven dynamic level-of-detail.
