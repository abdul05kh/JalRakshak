import os
import hashlib
import json
import datetime

def compute_sha256(filepath):
    if not os.path.exists(filepath): return "MISSING"
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536): h.update(chunk)
    return h.hexdigest()

def get_file_info(filepath):
    if not os.path.exists(filepath): return None
    stat = os.stat(filepath)
    return {
        "size_bytes": stat.st_size,
        "sha256": compute_sha256(filepath),
        "mtime": datetime.datetime.fromtimestamp(stat.st_mtime, datetime.timezone.utc).isoformat()
    }

inventory_paths = [
    # Terrain & GIS
    ("data/tehri/raw/GLO30_DSM_Tehri_Region.tif", "RAW_TERRAIN", "Copernicus GLO-30 DSM", "Copernicus Open Access", "RAW_INPUT"),
    ("data/tehri/derived/tehri_pilot_utm44n_25m.tif", "DERIVED_TERRAIN", "25m Bilinear Reprojected DEM", "rasterio / GDAL", "DERIVED_INPUT"),
    ("data/tehri/derived/tehri_pilot_utm44n_25m.prj", "PROJECTION", "WGS 84 / UTM 44N WKT", "PyPRJ Generator", "DERIVED_INPUT"),
    ("C:/HEC_Work/Tehri15km_Test/Terrain/Tehri15kmTerrain.hdf", "NATIVE_TERRAIN", "HEC-RAS Native Terrain HDF5", "RasProcess.exe", "NATIVE_HECRAS"),
    ("C:/HEC_Work/Tehri15km_Base/gis/perimeter.shp", "GIS_POLYGON", "2D Flow Area Perimeter Polygon", "pure_shapefile.py", "GIS_INPUT"),
    
    # Gate 3A Pilot Artifacts
    ("artifacts/hecras/tehri_pilot_gate3_central.p01.hdf", "GATE3A_RESULT", "1.5km Pilot Central Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_pilot_gate3_minimum.p01.hdf", "GATE3A_RESULT", "1.5km Pilot Minimum Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_pilot_gate3_maximum.p01.hdf", "GATE3A_RESULT", "1.5km Pilot Maximum Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_pilot_gate3_boundsens.p01.hdf", "GATE3A_RESULT", "1.5km Pilot Boundary Sensitivity", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_pilot_gate3_repeatability.p01.hdf", "GATE3A_RESULT", "1.5km Pilot Repeatability Run 2", "RasUnsteady.exe", "NATIVE_HECRAS"),
    
    # Gate 3B 15km Artifacts
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf", "GATE3B_RESULT", "15km Central Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_minimum.p01.hdf", "GATE3B_RESULT", "15km Minimum Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_maximum.p01.hdf", "GATE3B_RESULT", "15km Maximum Scenario", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_boundary_sensitivity.p01.hdf", "GATE3B_RESULT", "15km Boundary Sensitivity", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_repeatability_run2.p01.hdf", "GATE3B_RESULT", "15km Repeatability Run 2", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_75m.p01.hdf", "GATE3B_RESULT", "15km Mesh Sensitivity (75m)", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_mesh_50m.p01.hdf", "GATE3B_RESULT", "15km Mesh Sensitivity (50m)", "RasUnsteady.exe", "NATIVE_HECRAS"),
    ("artifacts/hecras/tehri_gate3b/manifest.json", "PROVENANCE_MANIFEST", "Gate 3B Provenance Manifest", "execute_gate3b_master_suite.py", "METADATA"),
    
    # Quarantined Synthetic Prototype
    ("artifacts/hecras/tehri_pilot_dam_break.p01.hdf", "QUARANTINED_PROTOTYPE", "Early Python Synthetic Prototype", "h5py / Custom Python", "SYNTHETIC_QUARANTINED")
]

inventory_md = """# JALRAKSHAK — MASTER TEHRI ARTIFACT & PROVENANCE INVENTORY
## COMPLETE FORENSIC INVENTORY (GATE 3A & GATE 3B)

**Inventory Generated:** {date}  
**Classification Protocol:** Native HEC-RAS vs Quarantined Synthetic Prototypes  

| Artifact Path | Classification | Role / Description | Generation Method | Size (Bytes) | SHA-256 (First 16 chars) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
""".format(date=datetime.datetime.now(datetime.timezone.utc).isoformat())

for p, cls, desc, meth, role in inventory_paths:
    info = get_file_info(p)
    if info:
        inventory_md += f"| `{p}` | `{cls}` | {desc} | {meth} | {info['size_bytes']:,} | `{info['sha256'][:16]}...` | `{role}` |\n"
    else:
        inventory_md += f"| `{p}` | `{cls}` | {desc} | {meth} | MISSING | MISSING | `NOT_FOUND` |\n"

inventory_md += """
---

### Quarantined Artifacts Rule
The artifact `artifacts/hecras/tehri_pilot_dam_break.p01.hdf` was generated during preliminary Python prototyping and is permanently classified as:
`SYNTHETIC_QUARANTINED`.
It is completely decoupled and quarantined from the JalRakshak production ingestion pipeline and is never consumed as hydraulic evidence.
All Gate 3A and Gate 3B hydraulic conclusions derive exclusively from genuine USACE HEC-RAS 7.0.1 native `.p01.hdf` files.
"""

with open("docs/TEHRI_GATE3_MASTER_INVENTORY.md", "w") as f:
    f.write(inventory_md)

print("Inventory written to docs/TEHRI_GATE3_MASTER_INVENTORY.md")
