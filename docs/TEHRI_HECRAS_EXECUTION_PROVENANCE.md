# Tehri HEC-RAS Execution Provenance Chain

## 1. Executive Summary
This document provides an end-to-end, immutable provenance chain for the **Tehri HEC-RAS 7.0.1 Construction Smoke Test** under SIH'26 JalRakshak Gate 2. Every transition state from the source Copernicus DEM to the JalRakshak read-only ingestion adapter is forensically documented with exact inputs, processes, outputs, producer binaries, timestamps, and SHA-256 hashes.

---

## 2. Complete Transition State Chain

```
Copernicus GLO-30 DEM (Original)
             ↓ [Reprojection & 25m Resampling]
Tehri Pilot DEM GeoTIFF (EPSG:32644)
             ↓ [Spatial Cropping & Window Extraction]
Tehri Smoke Test Terrain GeoTIFF (2.5 km Buffered Extent)
             ↓ [RasProcess.CreateTerrainCommand]
Native HEC-RAS Terrain HDF5 (`TehriSmokeTerrain.hdf`)
             ↓ [HEC-RAS Native Project Linkage]
Tehri Project & Geometry (`.prj`, `.g01`, `.u01`, `.p01`, `.rasmap`)
             ↓ [RasProcess.exe & RasGeomPreprocess.exe]
Native Compiled Geometry HDF5 (`TehriSmokeTest.g01.hdf`)
             ↓ [RasUnsteady.exe Solver Engine]
GENUINE NATIVE HEC-RAS RESULT HDF5 (`TehriSmokeTest.p01.hdf`)
             ↓ [Read-Only Independent Forensic Audit]
JalRakshak Ingestion Adapter (`HecRasHdfAdapter`)
             ↓ [Hydraulic Field Derivations outside HDF5]
Derived Water Depth & Configured Flood-Arrival Time Fields
```

---

## 3. Transition State Ledger

| Step | State Transition | Input Artifact & SHA-256 | Producer / Process | Output Artifact & SHA-256 | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **DEM Acquisition & Conditioning** | Copernicus GLO-30 DSM tiles | GDAL / Rasterio Warp (`EPSG:32644`, 25 m grid) | `data/tehri/derived/tehri_pilot_utm44n_25m.tif`<br>`SHA-256: 4eb747e09ef2...` | **VERIFIED** |
| **2** | **Smoke Test Domain Extraction** | `tehri_pilot_utm44n_25m.tif` | Rasterio window crop (`[256500, 259000] × [3362000, 3364500]`) | `Terrain/TehriSmokeTerrain.tif`<br>`SHA-256: 8be1eea4de46e5bb4fae0a2ca7b8ffc1ffb1574d756aeeb23f33e7ae9da2c9e7` | **VERIFIED** |
| **3** | **Native Terrain HDF Creation** | `TehriSmokeTerrain.tif` + `.prj` | `RasProcess.exe CreateTerrainCommand` (HEC-RAS 7.0.1) | `Terrain/TehriSmokeTerrain.hdf`<br>`SHA-256: f83178095b4c...` | **VERIFIED** |
| **4** | **Project & Geometry Definition** | Mesh geometry coordinates (50 m spacing, 784 interior seed points) | Native text writer | `TehriSmokeTest.prj`<br>`SHA-256: 85f9b5b1cd24b89825b4b1a4574944d18ec0646c050f2249e0c52ee16d123a35`<br>`TehriSmokeTest.g01`<br>`SHA-256: e370dbad1ee8d3ec1be40f81d1ef9b9da4e101f31f9d5c48b7a0f78b19aa15a5` | **VERIFIED** |
| **5** | **Flow & Plan Configuration** | Inflow hydrograph (100 m³/s), DS normal depth ($S=0.004$) | Native text writer | `TehriSmokeTest.u01`<br>`SHA-256: 3e4e7e612ee1dff44d0ec36f2e2978ffac4e930f3a6dfcae434f378036d0b6bc`<br>`TehriSmokeTest.p01`<br>`SHA-256: d9ad0769008064d4b1a1ddf3df4b4237eb733a1e2f3d6fe4bba02a64c483d3ff` | **VERIFIED** |
| **6** | **Native Geometric Preprocessing** | `TehriSmokeTest.g01` + `TehriSmokeTerrain.hdf` | `RasProcess.exe` + `RasGeomPreprocess.exe` | `TehriSmokeTest.g01.hdf` (1,316,099 bytes)<br>`SHA-256: 014a6e872c69...` | **VERIFIED** |
| **7** | **Native Unsteady Hydraulic Solver** | `TehriSmokeTest.g01.hdf` + `TehriSmokeTest.p01` + `TehriSmokeTest.u01` | `RasUnsteady.exe` (HEC-RAS 7.0.1 64-bit) | `TehriSmokeTest.p01.hdf` (1,729,315 bytes)<br>`SHA-256: ab3db449d852b82ea7c8130997dc032e3c28d3b79463002d6f9f89d62462b0b0` | **VERIFIED** |
| **8** | **JalRakshak Ingestion & Field Derivation** | `TehriSmokeTest.p01.hdf` (Read-only) | `backend/app/domain/hecras_adapter.py` (`HecRasHdfAdapter`) | In-memory `HydraulicScenarioData` (896 cells, 13 time states, derived depth, arrival times) | **VERIFIED** |

---

## 4. Producer Process Identity & Environment Lock

- **Host Operating System**: Windows 11 Enterprise (64-bit)
- **HEC-RAS Installation Root**: `C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\`
- **HEC-RAS 64-bit Binaries Directory**: `C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\x64\`
- **Preprocess Binary**: `C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\x64\RasGeomPreprocess.exe`
- **Solver Binary**: `C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\x64\RasUnsteady.exe`
- **COM Controller**: `RAS701.HECRASController` (`C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\Ras.exe`)
- **Working Run 1 Directory**: `C:\HEC_Work\TehriExecutionSmokeTest_Run1\`
- **Working Run 2 Directory**: `C:\HEC_Work\TehriExecutionSmokeTest_Run2\`

---

## 5. Negative Write-Path Confirmation
A rigorous search across the codebase and runtime environments confirmed:
- No Python code created or modified `TehriSmokeTest.p01.hdf`.
- The adapter strictly opens HDF5 files with `mode='r'` (read-only).
- The synthetic prototype was permanently quarantined at `artifacts/hecras/synthetic/tehri_python_hydraulic_prototype.hdf` and was not referenced or loaded.
