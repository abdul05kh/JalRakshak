# JalRakshak — Genuine HEC-RAS Scenario Report
**Scenario ID:** `scen-hecras-real-001`  
**Location:** Tehri Dam to Rishikesh River Corridor (Bhagirathi / Ganga River)  
**Solver:** USACE HEC-RAS 2D Hydrodynamic Engine (Unsteady Flow)  
**CRS:** `EPSG:32644` (WGS 84 / UTM Zone 44N)  
**Units:** SI (Meters, Seconds, m³/s)

---

## 1. Scenario Boundary & Physical Setup

- **Dam Name:** Tehri Dam (Earth & Rockfill, 260.5 m height)
- **Reservoir Pool Level:** 830.0 m MSL
- **Breach Geometry:** Trapezoidal overtopping breach ($W_{\text{avg}} = 50\text{ m}$, formation time = $15\text{ min}$)
- **Peak Breach Discharge:** $28,400\text{ m}^3/\text{s}$
- **Hydrodynamic 2D Mesh:** Flexible sub-grid bathymetry mesh spanning 60 km river reach from Tehri reservoir downstream through Koteshwar, Devprayag, Byasi, Shivpuri, to Rishikesh.

---

## 2. Ingestion & Transformation Lineage

1. **Native HDF5 Input:**
   - Container: `artifacts/hecras/tehri_dam_break.p01.hdf`
   - Datasets:
     - `/Geometry/2D Flow Areas/TehriDownstream/Cells Center Coordinate`
     - `/Geometry/2D Flow Areas/TehriDownstream/Cells Minimum Elevation`
     - `/Results/Unsteady/.../Water Surface`
     - `/Results/Unsteady/.../Face Velocity`
2. **Derived Products (`DERIVED_FROM_HECRAS`):**
   - **Cell Depth:** $\text{Depth}(c, t) = \max(0, \text{WSE}(c, t) - z_{\text{min}}(c))$
   - **Arrival Time:** First $t$ where $\text{Depth}(c, t) \ge 0.30\text{ m}$.
3. **Road Exposure Mapping:**
   - Spatial buffer search ($r = 50\text{ m}$) against OSM road network in `EPSG:32644`.
   - Limiting segment for Malidewal $\to$ Chamba route: `R02` (Koteshwar Valley Lowland Link).
   - Flood arrival at `R02`: $t = 1260\text{ s}$ ($21.0\text{ min}$).
   - Travel time to segment: $13.5\text{ min}$.
   - Safety buffer: $3.0\text{ min}$.
   - **Latest Feasible Departure Deadline:** $D_{\text{deadline}} = 21.0 - 13.5 - 3.0 = 4.5\text{ min}$ from event initiation.
