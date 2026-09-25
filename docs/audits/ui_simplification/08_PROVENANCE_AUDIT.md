# Provenance & Progressive Disclosure Audit
**Audit Date:** 2026-09-24  
**Audit Purpose:** Verify that technical provenance, scientific methodology, and computational boundaries are completely preserved behind accessible progressive disclosure.  

---

## 1. Provenance Drawer Architecture
Technical and scientific metadata have been moved from cluttered primary cards into the dedicated `ProvenanceDrawer` component. This ensures that deep scientific traceability is accessible on demand without overwhelming an emergency operator during critical seconds.

---

## 2. Provenance Audit Matrix

| Provenance Attribute | Content Verified | Location in UI | Traceability Status |
| :--- | :--- | :--- | :--- |
| **Hydraulic Solver** | USACE HEC-RAS 7.0.1 (2D SWE) | Provenance Drawer / Model QA | **VERIFIED** |
| **Scenario Identifier** | `tehri_15km_scenario_central` / `SCENARIO_CENTRAL` | Header & Provenance Drawer | **VERIFIED** |
| **Spatial Road Coupling** | 150 m perpendicular corridor, $\le 50\text{ m}$ densified LineString | Provenance Drawer | **VERIFIED** |
| **Travel Time Model** | Static $50\text{ km/h}$ engineering assumption across road graph edges | Provenance Drawer / Assumptions | **VERIFIED** |
| **Safety Buffer Rule** | $3.0\text{ minutes}$ configurable clearance buffer | Provenance Drawer & Decision Card | **VERIFIED** |
| **Coordinate Reference** | EPSG:32644 (WGS 84 / UTM Zone 44N) | Provenance Drawer | **VERIFIED** |
| **Bitwise Reproducibility** | Cryptographic SHA-256 hashes of all simulation HDF5 & GeoJSON artifacts | Provenance Drawer Checksum Table | **VERIFIED** |
| **Validation Boundary Notice** | *"Computational validation complete (16/16 tests passed). Human decision usefulness not yet validated."* | Provenance Drawer Status Section | **VERIFIED** |

---

## 3. Epistemic Disclosure Compliance
The interface prominently acknowledges its current validation stage: computational validation is complete, while human decision usefulness is subject to the upcoming Gate 5B pilot study.
