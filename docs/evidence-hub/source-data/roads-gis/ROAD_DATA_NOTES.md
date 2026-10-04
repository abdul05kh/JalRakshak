# Road Network GIS Data & Ingestion Notes

## 1. Source & Licensing
- **Source:** OpenStreetMap (OSM) highway network for Tehri Garhwal district.
- **Licence:** Open Database License (ODbL) 1.0.
- **Attribution:** © OpenStreetMap contributors.

## 2. Geospatial Transformation Pipeline
1. Geographic coordinates (`EPSG:4326` WGS84) extracted via Overpass API / OSMnx.
2. Projected to Metric Cartesian Coordinate System: **EPSG:32644 (UTM Zone 44N)**.
3. Road centerlines densified at $\le 50\,\text{m}$ intervals to capture high-curvature canyon topology.
4. Topologically verified: 7 road links spanning the $10.5\,\text{km}$ Bhagirathi valley corridor (`R02-E01` through `R02-E07`).

## 3. Rejection of Old 1200m KD-Tree Nearest-Neighbor Method
In early exploratory prototypes, a 1200m KD-tree spatial search was tested. Forensic audits revealed that this approach caused false distant-cell associations across canyon walls. The current production prototype uses a strict **150m perpendicular corridor envelope** via Shapely STRtree, ensuring roads are only coupled with water physically occupying the road corridor.
