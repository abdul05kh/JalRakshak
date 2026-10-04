# JalRakshak Evidence Hub

> **SIH Problem Statement:** SIH26161 — Dam Break Inundation Modelling Using Hydrodynamic Modelling of any River  
> **Target River & Dam:** Bhagirathi River downstream of Tehri Dam (30 km study reach)  
> **Document Purpose:** Central audit, verification, provenance, and validation registry  
> **Master Manual:** [MASTER_EVIDENCE_HUB.md](MASTER_EVIDENCE_HUB.md)

---

## 1. What JalRakshak Actually Adds
HEC-RAS describes what the water does. JalRakshak transforms raw hydraulic telemetry into an explainable operational decision layer:
$$\text{Hydraulic State} \longrightarrow A_i \text{ (Arrival)} \longrightarrow T_i \text{ (Travel)} \longrightarrow B \text{ (Buffer)} \longrightarrow D_{\text{deadline}} = \min_i(A_i - T_i - B) \longrightarrow \text{Limiting Segment} \longrightarrow \text{Provenance}$$

---

## 2. Locked Scientific Reality Matrix

| Subsystem / Capability | Reality Status | Verification Level | Authoritative Document |
| :--- | :--- | :--- | :--- |
| **HEC-RAS 7.0.1 2D Execution & HDF5 Ingestion** | **GENUINE / VERIFIED** | Level 1 & 2 PASS | [hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md](hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md) |
| **Depth / Velocity / Arrival Extraction** | **GENUINE / VERIFIED** | Level 2 PASS | [hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md](hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md) |
| **Road-Hydraulic Coupling (150m Envelope)** | **GENUINE / VERIFIED** | Level 1 & 2 PASS | [road-coupling/ROAD_HYDRAULIC_COUPLING_REPORT.md](road-coupling/ROAD_HYDRAULIC_COUPLING_REPORT.md) |
| **Evacuation Window Engine (EWE)** | **GENUINE / VERIFIED** | Level 1 & Invariant PASS | [evacuation-window-engine/EWE_MATHEMATICAL_DEFINITION.md](evacuation-window-engine/EWE_MATHEMATICAL_DEFINITION.md) |
| **Multi-Scenario Comparison** | **GENUINE / VERIFIED** | Level 1 PASS | [hydraulic/scenarios/SCENARIO_CARDS_AND_COMPARISON_REPORT.md](hydraulic/scenarios/SCENARIO_CARDS_AND_COMPARISON_REPORT.md) |
| **GEE / Sentinel-1 SAR Analysis** | **RESEARCH WORKFLOW** | Level 4 PARTIAL | [source-data/satellite-gee/GEE_SENTINEL1_DATA_CARD_AND_RESEARCH_REPORT.md](source-data/satellite-gee/GEE_SENTINEL1_DATA_CARD_AND_RESEARCH_REPORT.md) |
| **Delft3D / DualSPHysics Adapters** | **INTERFACE ONLY** | Architectural Boundary | [resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md](resources/RESOURCE_INDEX_AND_REFERENCE_MAP.md) |
| **Exposure Assessment Framework** | **FRAMEWORK ONLY** | Screening Tool | [exposure-loss/EXPOSURE_LOSS_DAMAGE_FRAMEWORK.md](exposure-loss/EXPOSURE_LOSS_DAMAGE_FRAMEWORK.md) |
| **Universal Arbitrary Scenario Ingestion** | **PREPARED ARTIFACT ONLY** | Level 1 PASS | [hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md](hydraulic/HECRAS_EXECUTION_AND_ARTIFACT_PROVENANCE.md) |
| **Tehri Dam Physical Field Validation** | **NOT ESTABLISHED** | Level 5 NOT_ESTABLISHED | [validation/PHYSICAL_VALIDATION_STATUS.md](validation/PHYSICAL_VALIDATION_STATUS.md) |

---

## 3. Directory Map

```text
docs/evidence-hub/
├── README.md                                   # This portal
├── MASTER_EVIDENCE_HUB.md                      # Comprehensive technical manual
├── evidence-register/                          # Primary source & claim CSVs
├── source-data/                                # Terrain, dam hydrology, roads, satellite
├── hydraulic/                                  # HEC-RAS execution, artifacts & scenarios
├── road-coupling/                              # 150m perpendicular spatial coupling
├── evacuation-window-engine/                   # EWE mathematical specifications
├── validation/                                 # 5-level ladder & human pilot
├── reproducibility/                            # Checksum policy & artifact manifest
├── exposure-loss/                              # Exposure & loss framework
├── limitations/                                # Red-team report & claim language
├── resources/                                  # Academic references & data index
├── claims/                                     # Claim-to-evidence matrix & findings
├── licenses/                                   # Attribution & licensing requirements
└── original-documents/                         # Preserved original DOCX & XLSX files
```

---

**JALRAKSHAK — EVIDENCE & RESOURCE HUB**
SIH26161 | Scientific traceability, reproducibility, validation and claim discipline

# Purpose

This hub is the verification layer behind the JalRakshak SIH26161 prototype. It is designed so a reviewer can trace a presentation claim to its source, hydraulic artifact, transformation, calculation, test and limitation.

# What the hub is / is not

- IS: a curated evidence repository connecting source data → HEC-RAS computation → hydraulic artifacts → GIS/road coupling → Evacuation Window Engine (EWE) → decision output.
- IS: a place to expose uncertainty and limitations.
- IS NOT: proof of physical field validation where no such evidence exists.
- IS NOT: a replacement for native HEC-RAS artifacts.
- IS NOT: a claim of universal arbitrary-river support or operational certification.

# Current reality matrix


| Capability | Status | Defensible claim | Boundary |
| --- | --- | --- | --- |
| HEC-RAS 2D | GREEN | Native HEC-RAS 7.0.1 execution/result ingestion is demonstrated. | Prepared/genuine scenarios are evidenced; arbitrary new scenario generation is not universal. |
| Depth/velocity/arrival | GREEN | Hydraulic quantities are extracted or transparently derived from native outputs. | Arrival method and threshold must be documented. |
| Scenario comparison | GREEN / scoped | Prepared minimum/central/maximum scenarios can be compared. | Do not call this arbitrary scenario synthesis. |
| 3D dashboard | GREEN | Real terrain/context can be rendered with hydraulic layers. | Renderer does not improve data accuracy. |
| Road-hydraulic coupling | GREEN | Hydraulic arrival can be coupled to road geometry. | Static travel-time assumption; no live traffic. |
| EWE deadline | GREEN | Deadline and limiting edge are deterministic outputs. | FEASIBLE is not a safety guarantee. |
| KML/GeoJSON | GREEN | KML 2.2 and RFC 7946 GeoJSON export are implemented. | Do not claim SHP unless separately implemented. |
| Generalization | YELLOW | Scenario isolation/data-driven loading verified on independent test worlds. | Universal arbitrary-river support is not established. |
| GEE/Sentinel-1 | YELLOW | Research-oriented multi-temporal observation workflow exists. | Live automation and physical validation remain limited. |
| SPH | YELLOW | External solver interface boundary exists. | No full SPH execution claim. |
| Delft3D | YELLOW | External solver interface boundary exists. | No full Delft3D execution claim. |
| Exposure/loss | ORANGE | Exposure/loss framework can structure analysis. | Not a validated damage predictor. |
| Arbitrary new HEC-RAS scenarios | RED | Prepared result ingestion is closer to genuine capability. | Not universal end-to-end creation/run. |
| Physical Tehri validation | RED | Tehri is the demonstration study area. | Physical validation is NOT_ESTABLISHED. |


# Recommended Drive hierarchy

00_README → 01_SIH_PROBLEM_STATEMENT → 02_SOURCE_DATA (terrain/dam/roads/GEE/exposure) → 03_HEC_RAS (projects/HDF5/logs/checksums) → 04_SCENARIOS → 05_GIS_ROAD_COUPLING → 06_EWE_DECISION_ENGINE → 07_GEE_SENTINEL1 → 08_EXPOSURE_LOSS_DAMAGE → 09_VALIDATION → 10_REPRODUCIBILITY → 11_RESEARCH_PAPERS → 12_TECHNICAL_DOCUMENTATION → 13_LICENSES_ATTRIBUTION → 14_DEMO → 15_CLAIMS_AND_EVIDENCE.

# Five-minute reviewer path

- Identify the exact SIH26161 requirement.
- Identify the terrain source and limitations.
- Identify HEC-RAS version and native result artifact.
- See how arrival time was extracted.
- Recompute the EWE deadline from A_i, T_i and B.
- Identify the limiting road segment.
- See what is validated and what is not.
- Separate source-derived facts, assumptions and test fixtures.

# Golden rule

PPT = “Here is what we built.” Evidence Hub = “Here is the evidence proving exactly what we claim.”
