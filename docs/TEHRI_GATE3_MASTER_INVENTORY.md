# JALRAKSHAK — MASTER TEHRI ARTIFACT & PROVENANCE INVENTORY
## COMPLETE FORENSIC INVENTORY (GATE 3A & GATE 3B)

**Inventory Generated:** 2026-09-24T09:49:24.908094+00:00  
**Classification Protocol:** Native HEC-RAS vs Quarantined Synthetic Prototypes  

| Artifact Path | Classification | Role / Description | Generation Method | Size (Bytes) | SHA-256 (First 16 chars) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `data/tehri/raw/GLO30_DSM_Tehri_Region.tif` | `RAW_TERRAIN` | Copernicus GLO-30 DSM | Copernicus Open Access | MISSING | MISSING | `NOT_FOUND` |
| `data/tehri/derived/tehri_pilot_utm44n_25m.tif` | `DERIVED_TERRAIN` | 25m Bilinear Reprojected DEM | rasterio / GDAL | 1,307,958 | `25083e1dc5ad485e...` | `DERIVED_INPUT` |
| `data/tehri/derived/tehri_pilot_utm44n_25m.prj` | `PROJECTION` | WGS 84 / UTM 44N WKT | PyPRJ Generator | MISSING | MISSING | `NOT_FOUND` |
| `C:/HEC_Work/Tehri15km_Test/Terrain/Tehri15kmTerrain.hdf` | `NATIVE_TERRAIN` | HEC-RAS Native Terrain HDF5 | RasProcess.exe | 47,504 | `d1d851fe5f398791...` | `NATIVE_HECRAS` |
| `C:/HEC_Work/Tehri15km_Base/gis/perimeter.shp` | `GIS_POLYGON` | 2D Flow Area Perimeter Polygon | pure_shapefile.py | 236 | `dc303f73f4fc2e62...` | `GIS_INPUT` |
| `artifacts/hecras/tehri_pilot_gate3_central.p01.hdf` | `GATE3A_RESULT` | 1.5km Pilot Central Scenario | RasUnsteady.exe | MISSING | MISSING | `NOT_FOUND` |
| `artifacts/hecras/tehri_pilot_gate3_minimum.p01.hdf` | `GATE3A_RESULT` | 1.5km Pilot Minimum Scenario | RasUnsteady.exe | MISSING | MISSING | `NOT_FOUND` |
| `artifacts/hecras/tehri_pilot_gate3_maximum.p01.hdf` | `GATE3A_RESULT` | 1.5km Pilot Maximum Scenario | RasUnsteady.exe | MISSING | MISSING | `NOT_FOUND` |
| `artifacts/hecras/tehri_pilot_gate3_boundsens.p01.hdf` | `GATE3A_RESULT` | 1.5km Pilot Boundary Sensitivity | RasUnsteady.exe | MISSING | MISSING | `NOT_FOUND` |
| `artifacts/hecras/tehri_pilot_gate3_repeatability.p01.hdf` | `GATE3A_RESULT` | 1.5km Pilot Repeatability Run 2 | RasUnsteady.exe | MISSING | MISSING | `NOT_FOUND` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf` | `GATE3B_RESULT` | 15km Central Scenario | RasUnsteady.exe | 13,189,766 | `79dd53079bb3dde4...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf` | `GATE3B_RESULT` | 15km Minimum Scenario | RasUnsteady.exe | 13,189,960 | `f411855777e88438...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf` | `GATE3B_RESULT` | 15km Maximum Scenario | RasUnsteady.exe | 13,189,746 | `97f077553066ad0e...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_boundary_sensitivity.p01.hdf` | `GATE3B_RESULT` | 15km Boundary Sensitivity | RasUnsteady.exe | 13,190,166 | `dcd99ae42bf8cc05...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_repeatability_run2.p01.hdf` | `GATE3B_RESULT` | 15km Repeatability Run 2 | RasUnsteady.exe | 13,190,223 | `c6552d6ddd2cca48...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_75m.p01.hdf` | `GATE3B_RESULT` | 15km Mesh Sensitivity (75m) | RasUnsteady.exe | 21,827,845 | `c7be3be280776f63...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_50m.p01.hdf` | `GATE3B_RESULT` | 15km Mesh Sensitivity (50m) | RasUnsteady.exe | 42,516,070 | `c95a8e2c8d7f8fa8...` | `NATIVE_HECRAS` |
| `artifacts/hecras/tehri_gate3b/manifest.json` | `PROVENANCE_MANIFEST` | Gate 3B Provenance Manifest | execute_gate3b_master_suite.py | 32,823 | `246f87d8efb3e2ef...` | `METADATA` |
| `artifacts/hecras/tehri_pilot_dam_break.p01.hdf` | `QUARANTINED_PROTOTYPE` | Early Python Synthetic Prototype | h5py / Custom Python | MISSING | MISSING | `NOT_FOUND` |

---

### Quarantined Artifacts Rule
The artifact `artifacts/hecras/tehri_pilot_dam_break.p01.hdf` was generated during preliminary Python prototyping and is permanently classified as:
`SYNTHETIC_QUARANTINED`.
It is completely decoupled and quarantined from the JalRakshak production ingestion pipeline and is never consumed as hydraulic evidence.
All Gate 3A and Gate 3B hydraulic conclusions derive exclusively from genuine USACE HEC-RAS 7.0.1 native `.p01.hdf` files.
