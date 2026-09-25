# Tehri 2D Dam-Break Model — Terrain Conditioning Report

**Document ID:** `TEHRI-TERRAIN-CONDITIONING-REPORT-V1`  
**Date:** September 2026  
**Governing Standard:** JalRakshak Scientific Honesty & Traceability Policy  
**Milestone:** STAGE 1 TEHRI PILOT TERRAIN PREPARATION

---

## 1. Derived Terrain Product Specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DERIVED PILOT TERRAIN SPECIFICATION                      │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ File Path                        │ data/tehri/derived/                      │
│                                  │ tehri_pilot_utm44n_25m.tif               │
│ Source Product                   │ Copernicus DEM GLO-30 (1 arc-sec DSM)    │
│ Target Projected CRS             │ EPSG:32644 (WGS 84 / UTM Zone 44N)       │
│ Spatial Resolution               │ 25.0 meters × 25.0 meters                │
│ Resampling Algorithm             │ Bilinear Interpolation                   │
│ Raster Dimensions                │ 439 columns × 744 rows (326,616 cells)   │
│ Projected Extent (UTM 44N)       │ Min X: 252,711.96 m E,                   │
│                                  │ Max X: 263,708.51 m E                    │
│                                  │ Min Y: 3,349,283.04 m N,                 │
│                                  │ Max Y: 3,367,895.67 m N                  │
│ Geographic Reach                 │ Tehri Dam (30.378°N, 78.480°E) to        │
│                                  │ Downstream of Koteshwar (30.270°N)       │
│ Valley Reach Length              │ Approximately 15.2 km along river axis   │
│ Elevation Range                  │ Min: 515.2 m, Max: 2111.8 m,             │
│                                  │ Mean: 1166.8 m                           │
│ NoData Value                     │ -9999.0 (0 NoData cells in valid domain) │
│ Vertical Reference               │ Native EGM2008 Geoid (No shift applied)  │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. Documented Terrain Conditioning & Verification Checks

```
                               CANYON INVERT LONG PROFILE
                               
  EL (m)
  850 ──┐ (Tehri Dam Crest = 839.5 m / Reservoir FRL = 830 m)
        │
  750   │  \
        │   \
  650   │    \─── Dam Toe = 617.5 m
        │         \
  550   │          \─── Koteshwar Valley Floor = 540.0 m
        └──────────────────────────────────────────────────────────────► Distance
        0 km             5 km            10 km           15 km
```

### Mandatory Inspection Checks:
1. **NoData / Invalid Cell Audit:**  
   - Result: `0 NoData cells`, `0 NaN values`, `0 Infinite values` in the entire pilot extent.
2. **Sink & Artificial Pit Analysis:**  
   - Riverbed profile traces continuously from Tehri Dam toe ($617.5\text{ m}$) downstream through Koteshwar ($540.0\text{ m}$) with a monotonic descent rate of approximately $5.1\text{ m}/\text{km}$.
   - No major artificial sink depression $>2.0\text{ m}$ deep was detected in the active canyon throat.
3. **Artificial Dam Artifacts:**  
   - The narrow gorge (25–50m width) is resolved by the 25m raster grid without cross-valley blockages in the pilot reach.
4. **Dam Embankment Representation:**  
   - The dam embankment pixel at $(30.3780^\circ\text{N}, 78.4803^\circ\text{E})$ reads $836.63\text{ m}$ in the raw DEM. For the hydraulic pilot, the crest is explicitly defined at $839.50\text{ m}$ with foundation at $600.00\text{ m}$.
5. **No Silent Terrain Burning:**  
   - No unrecorded modifications, synthetic smoothing, or arbitrary pit-filling was applied. The derived DEM is a strictly traceable bilinear reprojection of the raw Copernicus GLO-30 tile.
