# JalRakshak Master Evidence Hub & Technical Manual

**System Reference:** JalRakshak v2.0-Hardened  
**Problem Statement:** SIH26161 (Smart India Hackathon 2026)  
**Primary Study Basin:** Bhagirathi River Reach Downstream of Tehri Dam, Uttarakhand  
**Document Classification:** AUTHORITATIVE EVIDENCE REGISTER  

---

## Executive Summary
JalRakshak is a scientifically disciplined, failure-safe decision-support prototype for dam-break emergency operations. It bridges the gap between numerical 2D unsteady shallow water hydraulic simulation (USACE HEC-RAS 7.0.1) and actionable evacuation timing decisions.

Rather than presenting raw inundation grids or visual animations as decision answers, JalRakshak executes a deterministic Evacuation Window Engine (EWE) that computes exact departure deadlines and extracts limiting route bottlenecks under declared operational assumptions.

---

## SIH26161 Requirement Traceability Matrix

| SIH26161 Requirement | Prototype Implementation | Status | Authoritative Reference |
| :--- | :--- | :--- | :--- |
| **Hydrodynamic River Modelling** | Native HEC-RAS 7.0.1 2D Unsteady SWE | **IMPLEMENTED** | [hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md](hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md) |
| **Inundation Extent & Arrival** | Cell-level depth derivation & $h \ge 0.30\text{m}$ arrival | **IMPLEMENTED** | [hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md](hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md) |
| **Indian Dam Demonstration** | Tehri Dam study reach (30 km canyon) | **IMPLEMENTED** | [source-data/dam-hydrology/TEHRI_SOURCE_AND_PARAMETER_CARD.md](source-data/dam-hydrology/TEHRI_SOURCE_AND_PARAMETER_CARD.md) |
| **Multi-Scenario Comparison** | Minimum, Central, Maximum breach plans | **IMPLEMENTED** | [hydraulic/scenarios/SCENARIO_CARDS_AND_COMPARISON_REPORT.md](hydraulic/scenarios/SCENARIO_CARDS_AND_COMPARISON_REPORT.md) |
| **Operational Evacuation Directives** | Evacuation Window Engine (EWE) | **IMPLEMENTED** | [evacuation-window-engine/EWE_MATHEMATICAL_DEFINITION.md](evacuation-window-engine/EWE_MATHEMATICAL_DEFINITION.md) |
| **3D Interactive Dashboard** | ArcGIS SceneView WebGL console | **IMPLEMENTED** | [resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md](resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md) |
| **Standardized GIS Export** | OGC KML 2.2 & RFC 7946 GeoJSON endpoints | **IMPLEMENTED** | [resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md](resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md) |
| **Satellite / Remote Sensing** | Sentinel-1 SAR change detection pipeline | **RESEARCH ONLY** | [source-data/satellite-gee/GEE_SENTINEL1_DATA_CARD_AND_RESEARCH_REPORT.md](source-data/satellite-gee/GEE_SENTINEL1_DATA_CARD_AND_RESEARCH_REPORT.md) |
| **Delft3D Integration** | `Delft3DAdapter` interface specification | **INTERFACE ONLY** | [resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md](resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md) |
| **DualSPHysics (SPH)** | `SPHAdapter` interface specification | **INTERFACE ONLY** | [resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md](resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md) |
| **Near-Real-Time Analysis** | Sub-second EWE recalculation on prepared grids | **PARTIAL** | [evacuation-window-engine/EWE_SPECIFICATION_AND_VALIDATION.md](evacuation-window-engine/EWE_SPECIFICATION_AND_VALIDATION.md) |
| **Exposure / Damage Assessment** | Infrastructure exposure screening framework | **FRAMEWORK ONLY** | [exposure-loss/EXPOSURE_LOSS_DAMAGE_FRAMEWORK.md](exposure-loss/EXPOSURE_LOSS_DAMAGE_FRAMEWORK.md) |

---

**JALRAKSHAK — MASTER EVIDENCE HUB MANUAL**
SIH26161 | Full evidence, provenance, validation, limitations and reviewer guidance

# Executive position

The strongest defensible differentiator is not the 3D map. It is the traceable conversion of hydraulic timing into an operational route-level decision: latest conditional departure time and limiting road segment under a selected scenario.
The strategic question is: “What does an emergency officer actually need that today's hydraulic model output does not give them?” JalRakshak's demonstrated answer is a conditional, traceable interpretation of hydraulic arrival in the context of a route.

# Reality matrix


| Capability | Status | Boundary |
| --- | --- | --- |
| HEC-RAS 2D | GREEN | Genuine native execution/result ingestion; not universal scenario generation |
| Inundation/depth/velocity/arrival | GREEN | Native/derived artifacts with documented method |
| Scenario comparison | GREEN / scoped | Prepared scenarios |
| 3D dashboard | GREEN | Visualization/context |
| Road-hydraulic coupling | GREEN | Static travel assumption |
| EWE | GREEN | Mathematically locked/tested |
| KML/GeoJSON | GREEN | Implemented |
| Generalization | YELLOW | Independent test worlds only |
| GEE | YELLOW | Research workflow |
| SPH/Delft3D | YELLOW | Interfaces only |
| Exposure/loss | ORANGE | Framework only |
| Physical Tehri validation | RED | Not established |


# Provenance chain

Native HEC-RAS HDF5 → hydraulic depth/velocity/arrival → road-hydraulic coupling → cumulative route travel time → buffer → EWE minimization → limiting edge → conditional decision output.

# Core EWE

D_deadline = min_i(A_i − T_i − B). A_i = hydraulic arrival; T_i = cumulative travel; B = configured buffer.

# Scenario example


| Scenario | Arrival | Travel | Buffer | Deadline | Limiting edge |
| --- | --- | --- | --- | --- | --- |
| MINIMUM | T+95:00 | 12:39 | 03:00 | T+79:21 | R02-E07 |
| CENTRAL | T+60:00 | 12:39 | 03:00 | T+44:21 | R02-E07 |
| MAXIMUM | T+45:00 | 12:39 | 03:00 | T+29:21 | R02-E07 |


# Validation

Latest hardening evidence reports 210 backend tests passed with 1 skipped and a clean frontend production build. Gate 5B human pilot evidence is exploratory (N=2). GEE/Sentinel-1 is research-oriented. Physical Tehri validation is not established.

# Reviewer conclusion

- The prototype is more than a flood map because it has a deterministic decision layer.
- The hydraulic authority is native HEC-RAS result data in the genuine workflow.
- The route decision is traceable.
- The team explicitly separates software validation from physical validation.
- The largest remaining scientific gap is defensible physical validation and broader generalized solver/data integration.

# Do not claim

99% accuracy; full physical validation; calibrated Tehri hydraulics; live dynamic traffic; universal arbitrary-river simulation; fully executed SPH/Delft3D; satellite ground truth; guaranteed evacuation safety; production/operational certification.

# Drive upload checklist

- Problem statement and official sources.
- Dam-source records and citation metadata.
- Terrain card, source record, checksum.
- Road card and OSM attribution.
- Native HEC-RAS artifacts where legally shareable.
- Run logs and checksums.
- Scenario manifests/cards.
- Road coupling and EWE reports.
- GEE acquisition/processing report.
- Validation ladder and pilot report.
- Limitations and claims matrix.
- Licences/attribution.
- Five-minute reviewer path.
