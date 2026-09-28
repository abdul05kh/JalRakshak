# Geospatial Terrain Conditioning & Hydrodynamic Boundary Specification

**Author / Maintainer:** Siri Chandana ([@kotagirisirichandana](https://github.com/kotagirisirichandana))  
**Role:** Hydrodynamic / GIS Specialist  
**Project:** JalRakshak — Decision Support System for Dam-Break Flood Evacuation

---

## 1. Overview
This document specifies the geospatial terrain conditioning pipeline and hydrodynamic boundary modeling applied to the Tehri Dam reservoir and Bhagirathi downstream riverbed.

---

## 2. Terrain Data Sources & Coordinate System
- **Elevation Model:** Copernicus GLO-30 Digital Elevation Model (30m spatial resolution).
- **Coordinate Reference System (CRS):**
  - Simulation Mesh: `EPSG:32644` (WGS 84 / UTM Zone 44N) in meters.
  - Visualization Layer: `EPSG:4326` (WGS 84 geographic latitude/longitude).
- **Bounding Box (Tehri Study Area):**
  - West: `78.40°E`
  - East: `78.60°E`
  - South: `30.30°N`
  - North: `30.45°N`

---

## 3. Hydrodynamic Mesh & Inundation Cell Mapping
- **2D Hydraulic Cells:** 740 active flooded computational cells along the Bhagirathi canyon.
- **Cell Size:** Nominal $75\text{m} \times 75\text{m}$ orthogonal grid.
- **Interpolation Method:** Bilinear interpolation from HEC-RAS 2D unsteady flow HDF5 computation engine to road network vertices.

---

## 4. Terrain Conditioning Protocol
1. **Hydraulic Burning:** Deep canyon thalweg burn-in to preserve river conveyance in steep Himalayan valleys.
2. **Road Vertex Snapping:** Snap road centerlines to terrain elevation surface to prevent false road overtopping.
3. **Boundary Hydrograph Ingestion:** High-discharge breach wave boundary injection at Tehri Dam outflow node.
