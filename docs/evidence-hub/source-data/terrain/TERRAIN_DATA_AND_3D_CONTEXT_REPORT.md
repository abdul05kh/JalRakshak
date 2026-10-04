**JALRAKSHAK — TERRAIN DATA & 3D CONTEXT REPORT**
JalRakshak SIH'26 — Evidence Hub

# Terrain source

The documented terrain pipeline uses Copernicus DEM GLO-30. It is a Digital Surface Model (DSM), not a bare-earth DTM. Buildings, vegetation and infrastructure may influence elevation.

# Required metadata

- Dataset ID / tile or product identifier.
- Release/acquisition information.
- Download date.
- CRS and transformation.
- Horizontal and vertical units.
- Resolution.
- Bounds and dimensions.
- Nodata value/count.
- Checksum.
- Licence and attribution.
- All clipping, reprojection, resampling and conditioning operations.

# QA checklist

- Confirm CRS.
- Confirm units.
- Check nodata.
- Inspect vertical range.
- Inspect dam and river corridor.
- Inspect gross artifacts.
- Document terrain conditioning; never silently alter the terrain.

# Critical limitation

Do not call GLO-30 “99% accurate.” Its DSM nature and any unresolved vertical-datum compatibility must be exposed. If vertical-datum compatibility is not established for the hydraulic setup, mark it NOT_ESTABLISHED.

# 3D visualization requirements

- Use real elevation.
- Use actual HEC-RAS hydraulic flood extent/depth where shown as hydraulic evidence.
- Display dam, river, roads and route from sourced geometry.
- Show data-source attribution and resolution/date.
- Display vertical exaggeration if used.
- Treat 3D as context/evidence, not proof of hydraulic accuracy.

## Epistemic Status & Limitations
- **Classification:** SOURCE-DERIVED
- **Sensor:** Copernicus GLO-30 DSM (Digital Surface Model, not bare-earth DTM)
- **Vertical Datum Status:** `NOT_ESTABLISHED` (EGM96 geoid reference with uncalibrated riverbed bathymetry)
- **Rule:** Never describe GLO-30 as 'ground truth' or 'bare earth'.
