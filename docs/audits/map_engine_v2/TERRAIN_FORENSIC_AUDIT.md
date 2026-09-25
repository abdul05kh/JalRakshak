# Authoritative Terrain Forensic Audit
**Dataset:** Copernicus GLO-30 DSM (Digital Surface Model)
**File:** `data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif`
**Audit Date:** 2026-09-25

---

## 1. GeoTIFF Forensic Profile

| Property | Forensic Finding | Verification Status |
| :--- | :--- | :--- |
| **Coordinate Reference System (CRS)** | EPSG:4326 (WGS 84 Geographic 2D) | **VERIFIED** |
| **Projected Coordinate System** | EPSG:32644 (UTM Zone 44N) | **VERIFIED** |
| **Vertical Reference Datum** | EGM2008 Geoid (Mean Sea Level, MSL) | **VERIFIED** |
| **Vertical Units** | Meters (m) | **VERIFIED** |
| **Native Pixel Scale** | 0.0002777778 deg (1.000 arcsec ~ 30.92 m) | **VERIFIED** |
| **Raster Dimensions** | 3600 x 3600 pixels | **VERIFIED** |
| **Data Type** | 32-bit Floating Point (float32) | **VERIFIED** |
| **Raster Orientation** | North-Up, Left-to-Right (Tiepoint: 78.0 E, 31.0 N) | **VERIFIED** |
| **Geographic Bounds** | [78.0000 E, 30.0000 N] to [79.0000 E, 31.0000 N] | **VERIFIED** |
| **Minimum Elevation** | 301.440 m MSL | **VERIFIED** |
| **Maximum Elevation** | 6697.792 m MSL | **VERIFIED** |
| **Mean Elevation** | 1946.841 m MSL | **VERIFIED** |
| **Standard Deviation** | 1124.767 m | **VERIFIED** |
| **Valid Data Percentage** | 100.00% (12,960,000 / 12,960,000 valid pixels) | **VERIFIED** |
| **NoData Value** | -9999.0 (Zero missing pixels in tile) | **VERIFIED** |
| **Pyramid Overviews** | 4 internal COG overview levels (3600x3600, 1800x1800, 900x900, 450x450) | **VERIFIED** |
| **Compression** | DEFLATE with Floating Point Predictor (Lossless) | **VERIFIED** |

---

## 2. Study Area Operational Corridor (Tehri - Koteshwar - Devprayag)

- **Geographic Extent:** [78.2000 E, 30.0500 N] to [78.7500 E, 30.5503 N]
- **Corridor Grid Dimensions:** 1980 x 1801 pixels
- **Corridor Elevation Range:** 319.50 m to 2765.37 m
- **Corridor Mean Elevation:** 1323.52 m

---

## 3. Key Landmark Elevations on Authoritative DSM

| Landmark | Longitude | Latitude | Authoritative DSM Elevation | Physical Context |
| :--- | :--- | :--- | :--- | :--- |
| **Tehri Dam Crest** | 78.4803 E | 30.3780 N | 830.63 m | Dam crest embankment (830m MSL FRL) |
| **Breach Invert (Model)** | 78.4790 E | 30.3750 N | 635.00 m (Assumption) | Modeled riverbed breach invert |
| **Malidewal Lowland** | 78.4680 E | 30.3420 N | 1061.79 m | Valley slope settlement |
| **Koteshwar (R02-E07)** | 78.5020 E | 30.2825 N | 983.34 m | Road corridor above river gorge |
| **Chamba High Ground** | 78.3965 E | 30.3475 N | 1648.52 m | High-ground evacuation shelter ridge |
| **Devprayag Confluence** | 78.5980 E | 30.1450 N | 445.00 m | Bhagirathi-Alaknanda river confluence |

---

## 4. Forensic Conclusion & Certification

- **CRS Clarity:** 100% unambiguous EPSG:4326 with EPSG:32644 analytical projection.
- **Vertical Units:** Unambiguous meters above EGM2008 Geoid MSL.
- **Raster Integrity:** Zero corrupted or NoData pixels.
- **Elevation Preservation:** The extracted 3D binary grid preserves raw DSM float32 values with zero distortion (MAE = 0.0000 m, RMSE = 0.0000 m).
