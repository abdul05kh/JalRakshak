# JalRakshak — System & Geospatial Environment Report
**Report Date:** 2026-09-24  
**Audit Target:** Host Operating System, Hardware, Python Geospatial Stack, and HEC-RAS Availability

---

## 1. Host System & Hardware Audit

| Parameter | Discovered Value | Verification Status |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 Home Single Language (64-bit, AMD64) | PROVEN (`platform.uname()`) |
| **CPU Architecture** | 13th Gen Intel(R) Core(TM) i7-13700HX (16 Cores, 24 Logical Processors) | PROVEN |
| **Total Physical RAM**| 16.0 GB (15.7 GB usable) | PROVEN (`psutil` / OS SystemInfo) |
| **Primary Storage (C:)**| NVMe SSD, ~545 GB Free | PROVEN |
| **Project Storage (D:)**| Local Volume, Active Workspace `d:\projects\JalRakshak` | PROVEN |
| **GPU / Acceleration**| Intel(R) UHD Graphics (Integrated) | PROVEN |

---

## 2. Python & Geospatial Software Stack

Environment virtual environment located at `d:\projects\JalRakshak\.venv`:

| Package | Installed Version | Purpose & Verification |
| :--- | :--- | :--- |
| **Python** | 3.12.10 (64-bit) | Runtime environment |
| **h5py** | 3.16.0 | Read-only HDF5 ingestion for HEC-RAS `.p##.hdf` output |
| **rasterio** | 1.5.1 (GDAL 3.10.2) | Geospatial raster reading, windowed sampling, CRS handling |
| **geopandas** | 1.1.4 | Vector spatial operations and GeoJSON parsing |
| **shapely** | 2.1.2 | Geometric operations (LineString, Polygon, buffer intersections) |
| **pyproj** | 3.8.0 | Coordinate Reference System (CRS) transformations |
| **networkx** | 3.7 | Graph traversal and route candidate generation |
| **numpy** | 2.2.6 | Numerical grid and matrix operations |
| **scipy** | 1.15.3 | Spatial indexing (KDTree, spatial interpolation) |
| **fastapi** | 0.141.1 | REST API framework for decision support |
| **uvicorn** | 0.53.0 | ASGI web server |
| **pytest** | 9.1.1 | Automated testing and verification framework |

---

## 3. HEC-RAS & RAS Mapper Status

- **HEC-RAS Binary Search:** Comprehensive search across `C:\Program Files\HEC`, `C:\Program Files (x86)\HEC`, `C:\HEC`, and system registry completed. No local HEC-RAS binary installation detected in standard system directories.
- **Artifact Search:** Full scan of workspace `D:\projects\JalRakshak` and user download directories completed. No pre-existing `.p01.hdf` dam-breach run was bundled with the repository.
- **Hydraulic Engine Policy:** In accordance with **RULE 1 (NEVER FABRICATE)** and **RULE 4 (SEPARATION OF FIXTURES)**, the system implements a strict, standard-compliant `HecRasHdfAdapter` that consumes authentic HEC-RAS 2D HDF5 file schemas and flags missing datasets loudly as `DATA_GAP`.

---

## 4. Summary & Readiness

All required geospatial libraries (`h5py`, `rasterio`, `shapely`, `geopandas`, `pyproj`, `networkx`, `numpy`, `scipy`) are fully installed, tested, and operational in the virtual environment.
