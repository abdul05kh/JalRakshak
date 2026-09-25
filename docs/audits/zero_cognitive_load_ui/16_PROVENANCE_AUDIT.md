# 16 — Scientific Provenance & Model Lineage Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Full Cryptographic & Scientific Lineage Preservation  
**Status:** PASS  

---

## 1. Provenance Inventory Ledger

| Provenance Attribute | Verified Record | Stored Location / Drawer |
| :--- | :--- | :--- |
| **Hydraulic Modeling Engine** | HEC-RAS 7.0.1 2D (USACE Certified) | `[PROVENANCE]` Drawer |
| **Native Output Artifact** | `tehri_15km_scenario_central_65000cms.hdf` | `[PROVENANCE]` Drawer |
| **Artifact SHA-256 Hash** | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `[PROVENANCE]` Drawer |
| **Spatial Coupling Method** | 150 m Exact LineString Corridor with $\le 50\text{ m}$ densification | `[ASSUMPTIONS]` Drawer |
| **Terrain / DEM Source** | CartoDEM 30m / SRTM Enhanced 1-ArcSec | `[PROVENANCE]` Drawer |
| **Coordinate Reference System** | WGS 84 / UTM Zone 44N (EPSG:32644) | `[PROVENANCE]` Drawer |
| **Computational Validation** | 100% Passed (136/136 automated tests) | Validation Modal |
| **Human Decision Validation** | **NOT YET VALIDATED** (Protocol Ready, Pilot Pending) | Persistent Disclaimer |

---

## 2. Integrity Verification
All underlying hydraulic datasets and mathematical models remain intact and unmodified by the UI refactoring.
