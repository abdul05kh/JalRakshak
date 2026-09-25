# TERRAIN RENDERING ARCHITECTURE (COPERNICUS GLO-30 DSM)

**Document:** Terrain Rendering Architecture  
**Version:** RC2.1  
**Status:** ACTIVE  

---

## 1. Ground Elevation Authority

JalRakshak utilizes the **Copernicus GLO-30 Digital Surface Model (DSM)** covering the Tehri Dam and Bhagirathi/Bhilangana valley study area.
- **Bounding Box (WGS84):** $\text{Lon } [78.20^\circ, 78.75^\circ]$, $\text{Lat } [30.05^\circ, 30.550278^\circ]$
- **Bounding Box (Web Mercator / EPSG:3857):** $[8705175.76, 3510444.60, 8766399.78, 3574744.15]\text{ m}$
- **Grid Resolution:** $1,100 \times 1,000$ cells ($3.565\text{M}$ Float32 samples, $14.26\text{ MB}$)
- **Vertical Datum:** EGM96 / EGM2008 MSL (Mean Sea Level)

---

## 2. Dynamic Tile Generation (`GLO30ElevationLayer.ts`)

ArcGIS SceneView requests elevation in Web Mercator tiles ($256 \times 256$ grids of Float32 elevations). `GLO30ElevationLayer` extends `BaseElevationLayer` and performs:
1. **Bounding Box Overlap Filtering:** If tile extent is entirely outside the Tehri extent, returns `-9999` (noData) without processing.
2. **Coordinate Un-projection:** Converts Web Mercator coordinates $(x, y)$ to WGS84 $(\lambda, \phi)$.
3. **Bilinear Interpolation:** Interpolates elevation from the $1,100 \times 1,000$ source raster.
4. **Tile Caching:** Caches generated tile buffers by tile key `z/x/y` to minimize main-thread computation during camera pans.

---

## 3. Zero-Fabrication Rule

All synthetic elevation defaults ($600.0\text{m}$, $830.0\text{m}$) have been permanently removed. Out-of-bounds coordinates evaluate strictly to `noDataValue: -9999`, preventing scientific data corruption.
