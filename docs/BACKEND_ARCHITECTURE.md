# Backend Infrastructure & REST API Architecture Specification

**Author / Maintainer:** Manivarun Chintala ([@manivarun-05](https://github.com/manivarun-05))  
**Role:** Data Infrastructure / Backend Developer  
**Project:** JalRakshak — Decision Support System for Dam-Break Flood Evacuation

---

## 1. Overview
The JalRakshak backend is built with high-performance Python 3.10+ and FastAPI, designed for sub-millisecond routing evaluations and spatial queries.

---

## 2. Core Modules & Infrastructure

### 1. `backend/app/domain/database.py` (Scenario World Isolation)
- Implements completely self-contained scenario environments (`SCENARIO_CENTRAL`, `SCENARIO_MINIMUM`, `SCENARIO_MAXIMUM`, `TEST_ALPHA`, `TEST_BETA`).
- Loads local GeoJSON datasets (`roads.json`, `evacuation_points.json`, `edge_hydraulics.json`, `inundation.geojson`) per scenario without shared global contamination.

### 2. `backend/app/domain/road_hydraulic_mapper.py` (KD-Tree Spatial Indexing)
- Employs `scipy.spatial.cKDTree` for ultra-fast spatial search of nearest hydraulic cells to road vertices ($O(\log N)$ query time).
- Transforms UTM 44N hydraulic coordinates to WGS84 GeoJSON polygons for terrain-aligned 3D SceneView consumption.

### 3. `backend/app/domain/hecras_adapter.py` (HDF5 Extraction Engine)
- Extracts 2D unsteady flow results directly from HEC-RAS plan outputs (`.p01.hdf`, `.p02.hdf`, `.p03.hdf`).
- Reads cell centers, face connectivity, maximum water surface elevation (WSE), depth time series, and wave arrival timestamps.

---

## 3. REST API Surface (`/api/v1`)
- `GET /api/v1/health`: System health and loaded scenario status.
- `GET /api/v1/scenarios`: List all active, verified scenario definitions.
- `GET /api/v1/scenarios/{id}/layers`: Scenario-scoped road, settlement, and inundation GeoJSON layers.
- `POST /api/v1/evacuation/plan`: Compute real-time evacuation routes, EWE metrics, and limiting bottleneck segments.
