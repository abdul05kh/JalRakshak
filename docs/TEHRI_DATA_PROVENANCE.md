# Tehri 2D Dam-Break Model — Data Provenance Register

**Document ID:** `TEHRI-DATA-PROVENANCE-V1`  
**Date:** September 2026  
**Governing Standard:** JalRakshak Scientific Honesty & Traceability Policy  
**Milestone:** STAGE 1 TEHRI PILOT DATA ACQUISITION

---

## 1. Raw Elevation Data Acquisition Record

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RAW DEM DATASET SPECIFICATION                         │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ Exact Product Name               │ Copernicus DEM Global 30m (GLO-30)       │
│ Release Version / Date           │ 2021 Release (Issue 5.0)                 │
│ Tile ID                          │ Copernicus_DSM_COG_10_N30_00_E078_00_DEM │
│ Local File Path                  │ data/tehri/raw/                          │
│                                  │ Copernicus_DSM_COG_10_N30_00_E078_00_DEM │
│                                  │ .tif                                     │
│ File Size                        │ 43,323,128 bytes (41.31 MB)              │
│ Download URL                     │ https://copernicus-dem-30m.s3.amazonaws  │
│                                  │ .com/Copernicus_DSM_COG_10_N30_00_E078_00│
│                                  │ _DEM/Copernicus_DSM_COG_10_N30_00_E078_00│
│                                  │ _DEM.tif                                 │
│ Acquisition Timestamp (UTC)      │ 2026-09-24T02:34:20Z                     │
│ Horizontal Coordinate System     │ EPSG:4326 (Geographic WGS 84, Lat/Lon)   │
│ Horizontal Datum                 │ WGS 84 (World Geodetic System 1984)      │
│ Vertical Reference               │ Earth Gravitational Model 2008 (EGM2008) │
│ Vertical Unit                    │ Meters (Orthometric Elevation)           │
│ Spatial Resolution               │ 1.0 Arc-Second (~30 meters)              │
│ Raster Dimensions                │ 3600 columns × 3600 rows (1 band, Float32)│
│ Bounding Extent                  │ West: 78.0000° E, East: 79.0000° E,      │
│                                  │ South: 30.0000° N, North: 31.0000° N     │
│ Surface Classification           │ Digital Surface Model (DSM)              │
│ SHA-256 Checksum                 │ 1666bc434ca738c188149bc244614491bd0e94e1 │
│                                  │ 6018cfbeeea789231f8ba0c7                 │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. Source Integrity & Immutability Rules

1. **Immutability Guarantee:** The raw source file `data/tehri/raw/Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif` is strictly read-only and will never be overwritten, cropped in place, or altered.
2. **Derivation Separation:** All reprojections, clipping, and conditioning operations are performed into separate files under `data/tehri/derived/`.
3. **Reproducibility:** Anyone with the download URL can independently verify the downloaded artifact against the SHA-256 checksum recorded above.
