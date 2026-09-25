# MAP ENGINE REALITY AUDIT
## Geographic & Spatial Visualization Architecture Audit for JalRakshak

**Audit Date:** 2026-09-25  
**Auditor:** JalRakshak Senior Geospatial & Visualization Systems Engineering Team  
**Status:** COMPLETE / REBUILT WITH TRUE 3D RASTER-DEM TERRAIN  

---

### 1. Spatial Layer Inventory & Classification

Every spatial layer rendered in the JalRakshak 3D geographic interface has been audited and classified according to its origin, derivation, and verification status:

| Layer Name | Type | CRS | Resolution / Units | Source Artifact | Classification |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Terrain Elevation** | Raster DEM (Terrain-RGB) | EPSG:4326 $\to$ WebMercator | 1 arc-second (~30m), meters MSL | `data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif` | **SOURCE (Copernicus GLO-30 DSM)** |
| **Terrain Hillshade** | Raster Hillshade (MapLibre) | EPSG:3857 | Azimuth $315^\circ$, Exaggeration 0.65 | Computed from Terrain-RGB mesh | **DERIVED** |
| **Contextual Basemap** | Raster Tiles | EPSG:3857 | OpenStreetMap Standard (subdued) | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | **DERIVED / CONFIGURED** |
| **Tehri Dam Crest** | Vector LineString | EPSG:4326 | 575m Crest Length, 830m MSL | THDC India Ltd / CWC National Register | **SOURCE** |
| **Breach Location** | Vector Point | EPSG:4326 / EPSG:32644 | Invert 635m MSL | HEC-RAS 2D Model Boundary Condition | **ASSUMED (Model Assumption)** |
| **Bhagirathi River** | Vector LineString | EPSG:4326 | 15km valley gorge corridor | Survey of India / OSM Hydrology | **SOURCE_DERIVED** |
| **Tehri Reservoir** | Vector Polygon | EPSG:4326 | FRL 830m contour surface | Copernicus DSM 830m contour | **SOURCE_DERIVED** |
| **OSM Road Network** | Vector LineString | EPSG:4326 | Densified $\le 50\text{m}$ | `data/study_area/roads.json` (OSM / UK PWD) | **SOURCE_DERIVED (OSM)** |
| **Evacuation Route R02** | Vector MultiLineString | EPSG:4326 | $10.5\text{ km}$, 7 directed edges | `backend/app/domain/database.py` | **SOURCE_DERIVED** |
| **Limiting Edge R02-E07** | Vector LineString | EPSG:4326 | $1.4\text{ km}$, Koteshwar riverbank | 150m spatial road-hydraulic coupling | **DERIVED (EWE Engine)** |
| **Chamba Shelter** | Vector Point | EPSG:4326 | $1,650\text{ m}$ MSL high ground | Uttarakhand SDMA District Emergency Plan | **SOURCE** |
| **HEC-RAS Flood Extent** | Vector Polygon | EPSG:4326 / EPSG:32644 | $25\text{m} - 50\text{m}$ 2D mesh envelope | Native HEC-RAS 2D HDF5 plan files | **SOURCE (HEC-RAS 7.0.1)** |
| **Water Depth Field** | Vector Polygon / Paint | Metric depth (m) | $d(x,y,t) = \text{WSE} - z_{\text{cell}}$ | HEC-RAS 2D Unsteady Output Block | **SOURCE_DERIVED** |
| **Arrival Isochrones** | Spatial Banding | Minutes from breach | $A(c) = \min \{t \mid d(c,t) \ge 0.30\text{m}\}$ | HEC-RAS 2D Arrival Time Algorithm | **DERIVED** |

---

### 2. Terrain Source Audit & Verification

1. **Dataset:** Copernicus GLO-30 Digital Surface Model (DSM).
2. **Raw Tile:** `Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif` (File size: 43.3 MB, Shape: $3600 \times 3600$).
3. **Horizontal Extent:** Longitude $[78.000^\circ\text{E}, 79.000^\circ\text{E}]$, Latitude $[30.000^\circ\text{N}, 31.000^\circ\text{N}]$.
4. **Vertical Range:** Minimum $301.44\text{ m}$ (Ganga plain), Maximum $6,697.79\text{ m}$ (Himalayan peaks), Mean $1,946.84\text{ m}$.
5. **Study Area Sub-Domain (Tehri Dam to Koteshwar):** Elevation ranges from $612.0\text{ m}$ (Bhagirathi riverbed at Koteshwar) to $1,925.0\text{ m}$ (surrounding mountain ridges).
6. **Vertical Reference:** EGM2008 / EGM96 Geoid Orthometric Heights (meters MSL).
7. **DSM Distinction:** Formally classified as a **Digital Surface Model (DSM)** containing surface canopy and topographic features, rather than a hydro-conditioned bare-earth DEM.

---

### 3. Coordinate Reference System (CRS) & Transformations

The study area hydrodynamics operate natively in:
- **Projected Cartesian CRS:** `EPSG:32644` (WGS 84 / UTM Zone 44N, Easting/Northing in meters).
- **Geographic CRS:** `EPSG:4326` (WGS 84, Longitude/Latitude in decimal degrees).

Bidirectional transformation is strictly managed by `backend/app/domain/geo_transform.py` and `frontend/src/utils/geoTransform.ts`.

#### Landmark Verification:
- **Tehri Dam Crest:** $[78.4803^\circ\text{E}, 30.3780^\circ\text{N}] \leftrightarrow [257,854.12\text{ m E}, 3,363,362.45\text{ m N}]$
- **Breach Invert:** $[78.4790^\circ\text{E}, 30.3750^\circ\text{N}] \leftrightarrow [257,732.80\text{ m E}, 3,363,031.10\text{ m N}]$
- **Malidewal Origin:** $[78.4680^\circ\text{E}, 30.3420^\circ\text{N}] \leftrightarrow [256,620.40\text{ m E}, 3,359,380.20\text{ m N}]$
- **Limiting Segment R02-E07:** $[78.5020^\circ\text{E}, 30.2825^\circ\text{N}] \leftrightarrow [259,715.30\text{ m E}, 3,352,710.60\text{ m N}]$
- **Chamba Safe Shelter:** $[78.3965^\circ\text{E}, 30.3475^\circ\text{N}] \leftrightarrow [249,742.10\text{ m E}, 3,360,120.80\text{ m N}]$

Roundtrip coordinate error is strictly $< 10^{-6}$ degrees ($< 0.1\text{ m}$).

---

### 4. Identified Prior Deficiencies & Remediation

| Prior Deficiency | Remediation Applied |
| :--- | :--- |
| MapLibre was initialized as a flat raster tile plane with pitch angle but no 3D mesh geometry. | Added genuine Mapbox Terrain-RGB `raster-dem` source generated from Copernicus GLO-30 DSM GeoTIFF and configured `map.setTerrain({ source: "terrain-dem", exaggeration: 1.5 })`. |
| Hillshade was absent or synthetic. | Added dynamic WebGL hillshade layer (`terrain-hillshade`) rendered directly from the Terrain-RGB elevation mesh with $315^\circ$ NW sun illumination. |
| Roads were isolated from terrain. | Road LineStrings are draped directly over the 3D elevation mesh with distinct visual casing and priority styling. |
| Dam and Breach geometry were abstract text labels. | Rendered explicit 575m Dam Crest axis LineString with crest marker and dedicated Breach Invert point marker with explicit `635m MSL — MODEL ASSUMPTION` badge. |
| No engineering inspection mode existed. | Added interactive `MAP ENGINE VALIDATION MODE` with independent layer toggles (`TERRAIN`, `ROADS`, `RIVER`, `DAM`, `BREACH`, `FLOOD`, `ROUTE`, `SHELTER`). |
