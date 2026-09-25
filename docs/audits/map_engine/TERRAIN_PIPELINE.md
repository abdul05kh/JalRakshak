# TERRAIN PROCESSING & RENDERING PIPELINE
## End-to-End Elevation Extraction, Tile Encoding, and MapLibre 3D Terrain Integration

**Document ID:** DOC-MAP-ENG-02  
**Date:** 2026-09-25  
**Version:** 3.0.0-PROD  

---

### 1. Authoritative Terrain Pipeline Architecture

```mermaid
flowchart TD
    A["Copernicus GLO-30 DSM GeoTIFF (EPSG:4326, 30m, EGM96/EGM2008)"] -->|scripts/generate_terrain_rgb_tiles.py| B["Tile Window Resampling & Elevation Extraction"]
    B -->|Mapbox Terrain-RGB Formula| C["PNG Tile Hierarchy (frontend/public/terrain-tiles/z/x/y.png)"]
    C -->|HTTP / Slippy Map Tiles (Zooms 10-14)| D["MapLibre GL JS raster-dem Source"]
    D -->|map.setTerrain(exaggeration: 1.5)| E["3D WebGL Terrain Mesh Geometry"]
    D -->|map.addLayer(type: hillshade)| F["Dynamic 3D Topographic Hillshade (Azimuth 315°)"]
```

---

### 2. Terrain-RGB Mathematical Specification

MapLibre GL JS decodes elevation from RGB color channels using the Mapbox Terrain-RGB encoding specification:

$$\text{Elevation } h \text{ (meters MSL)} = -10000 + (R \times 65536 + G \times 256 + B) \times 0.1$$

#### Forward Encoding Algorithm (Python / Rasterio / Pillow):
For any elevation sample $h \in [-500.0, 9000.0]$:
$$\text{val} = \text{round}\left((h + 10000.0) \times 10\right)$$
$$R = \left\lfloor \frac{\text{val}}{65536} \right\rfloor \pmod{256}$$
$$G = \left\lfloor \frac{\text{val}}{256} \right\rfloor \pmod{256}$$
$$B = \text{val} \pmod{256}$$

#### Precision & Error Bound:
The quantization step $\Delta h = 0.1\text{ m}$ ensures elevation is preserved with a maximum truncation error $\le \pm 0.05\text{ m}$, which is well below the vertical uncertainty of the Copernicus GLO-30 DSM ($\approx 1.5\text{ m}$).

---

### 3. Tile Generation Parameters & Artifacts

- **Script:** `scripts/generate_terrain_rgb_tiles.py`
- **Source GeoTIFF:** `data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif` (SHA-256: `1666bc434ca738c188149bc244614491bd0e94e16018cfbeeea789231f8ba0c7`)
- **Output Directory:** `frontend/public/terrain-tiles/`
- **Total Tiles Generated:** 736 PNG tiles
- **Tile Coverage:**
  - Zoom 10: 6 tiles ($X \in [734..735], Y \in [420..422]$)
  - Zoom 11: 16 tiles ($X \in [1468..1471], Y \in [841..844]$)
  - Zoom 12: 42 tiles ($X \in [2937..2943], Y \in [1683..1688]$)
  - Zoom 13: 144 tiles ($X \in [5875..5886], Y \in [3366..3377]$)
  - Zoom 14: 528 tiles ($X \in [11750..11773], Y \in [6733..6754]$)

---

### 4. Vertical Exaggeration Policy

To ensure evaluator visual comprehension of steep Himalayan slopes without distorting hydraulic calculations:
1. **Rendering Exaggeration:** Set to **`1.5×`** in WebGL canvas:
   ```typescript
   map.setTerrain({
     source: "terrain-dem",
     exaggeration: 1.5
   });
   ```
2. **Scientific Separation:** All HEC-RAS hydraulic computations, water depths ($d = \text{WSE} - z_{\text{cell}}$), and road-coupling distances operate strictly on **unscaled metric coordinates** ($1.0\times$).
3. **HUD Transparency:** The operational map explicitly renders the callout badge:
   `3D TERRAIN: 1.5× VERTICAL EXAGGERATION | Source: Copernicus GLO-30 DSM (EGM96 Geoid)`
