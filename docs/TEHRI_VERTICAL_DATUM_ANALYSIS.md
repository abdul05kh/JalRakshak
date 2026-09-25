# TEHRI VERTICAL DATUM COMPATIBILITY ANALYSIS
**Document ID:** DOC-TEHRI-G3-02  
**Project Stage:** Gate 3 — Vertical Datum Investigation  
**Datum Status:** `VERTICAL_DATUM_STATUS = NOT_ESTABLISHED`  
**Date:** 2026-09-24  

---

## 1. Executive Summary & Gate Decision

In accordance with Section 8 of the Gate 3 Master Directive, the vertical datum relationship between local THDC structural benchmarks and the global satellite DEM has been rigorously investigated.

```
+-----------------------------------------------------------------------------------+
|  VERTICAL DATUM STATUS: NOT_ESTABLISHED                                           |
|                                                                                   |
|  RATIONALE: No empirical geodetic tie or differential GPS survey tie exists       |
|  in open public literature directly linking Survey of India GTS benchmarks at     |
|  Tehri Dam crest (EL 839.5 m) to the Copernicus EGM2008 geoid undulation model.  |
|  Arbitrary vertical shifts (e.g. historical +0.8m) are STRICTLY QUARANTINED       |
|  as unverified assumptions and excluded from the baseline hydraulic computation. |
+-----------------------------------------------------------------------------------+
```

---

## 2. Datum Reconciliation Matrix

| Entity | Vertical Reference | Elevation (m) | Source Classification | Notes & Uncertainty |
| :--- | :--- | :--- | :--- | :--- |
| **Tehri Dam Crest** | THDC / GTS Benchmarks | 839.50 m | SOURCE_DERIVED (THDC) | Local Indian Mean Sea Level (MSL) |
| **Full Reservoir Level (FRL)** | THDC / GTS Benchmarks | 830.00 m | SOURCE_DERIVED (THDC) | Operational reservoir ceiling |
| **Max Water Level (MWL)** | THDC / GTS Benchmarks | 835.00 m | SOURCE_DERIVED (THDC) | Extreme surcharge pool level |
| **Min Drawdown Level (MDDL)** | THDC / GTS Benchmarks | 740.00 m | SOURCE_DERIVED (THDC) | Bottom of live storage |
| **Copernicus DEM** | EGM2008 Geoid | 617.5 m – 1123.8 m | MEASURED (Copernicus DSM) | Global Earth Gravitational Model 2008 |
| **HEC-RAS Terrain Invert** | Project Space (Native DEM) | 617.50 m | CALCULATED (HEC-RAS) | Minimum cell face elevation |

---

## 3. Physical & Hydraulic Impact Analysis

Because the dam-break hydrograph is modeled via a dynamic boundary condition hydrograph entering the canyon at the dam cross-section rather than an internal 2D reservoir storage mesh with elevation-based weir discharge:
1. **Hydraulic Continuity:** Inundation depths, propagation velocities, and wave arrival times in the downstream canyon are computed purely in the native DEM elevation frame ($Z_{DEM}$).
2. **Relative Head:** The breach peak discharge ($Q_p = 65,000\text{ m}^3/\text{s}$) was calculated using Froehlich (2008) based on total physical head above breach invert ($h_w = 205.0\text{ m}$).
3. **No Artificial Translation:** Preserving native DEM elevations prevents spurious dry-bed anomalies, boundary instabilities, or unphysical backwater steps.

---

## 4. Scientific Limitations & Future Requirements

- For Gate 4/5 integration with physical river gauges (e.g., CWC Devprayag / Rishikesh staff gauges), a high-precision RTK GNSS benchmark survey tying GTS Benchmarks to WGS84/EGM2008 must be acquired from official CWC / Survey of India records.
- Until such empirical survey data is released, all water surface elevations are reported with an explicit $\pm 2.0\text{ m}$ global vertical datum confidence interval.
