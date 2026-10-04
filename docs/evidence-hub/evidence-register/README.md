# JalRakshak Evidence Register & Claim Matrix

**Location:** `docs/evidence-hub/evidence-register/`  
**Purpose:** Cryptographic and tabular registry mapping every primary dataset, institutional source, and public claim to authoritative evidence.

---

## 1. Primary Source Register (`SOURCE_REGISTER.csv`)

The table below catalogs the 10 foundational sources underlying the JalRakshak prototype:

| ID | Domain | Source/Asset | Type | Classification | Status | Identifier | Scope/Value | Metadata required | Evidence to attach | Licence/Attribution | Limitation |
| SRC-001 | SIH | SIH26161 problem statement | Official PS | SOURCE-DERIVED | VERIFIED | Full Actual Problem Statement 161.pdf | Generalized dam-break/river-blockage; SPH/Delft3D; GEE; dashboard; GIS export | Document/page/date | PDF + page references | SIH source terms | Primary requirement |
| SRC-002 | Dam | THDC Tehri official material | Institutional | SOURCE-DERIVED | VERIFIED | THDC India | Dam context: 260.5 m height; 575 m crest; FRL 830 m; gross storage 3540 MCM | URL/page/date | Saved citation record | Source terms | Not breach calibration |
| SRC-003 | Terrain | Copernicus DEM GLO-30 | DSM | SOURCE-DERIVED | VERIFIED | Copernicus DEM | 30 m-class global DSM | Tile/release/CRS/units/date/hash | Original or lawful retrieval record | Copernicus licence | DSM, not bare-earth DTM |
| SRC-004 | Roads | OpenStreetMap road geometry | Vector | SOURCE-DERIVED | VERIFIED/SCOPE | roads.json | Real road geometry used in coupling | Extract date/bbox/CRS | GeoJSON + attribution | ODbL | Not live traffic |
| SRC-005 | Hydraulic | HEC-RAS 7.0.1 native HDF5 | Native result | NATIVE/DERIVED | VERIFIED | Bald Eagle + Tehri smoke-test records | WSE/velocity/coords/elev/time | Path/hash/version/plan | HDF5 + log + checksum | HEC terms | Bald Eagle is execution evidence, not Tehri physical validation |
| SRC-006 | Scenario | Minimum/central/maximum prescribed hydrographs | Scenario config | CONFIGURED/ASSUMPTION | DEMO | Project manifests | Qp 28,500/65,000/115,000 | Manifest + parameter role | Scenario cards | Project-controlled | Not calibrated |
| SRC-007 | Remote sensing | Sentinel-1 GRD via GEE | SAR | SOURCE/RESEARCH | PARTIAL | Configured AOI/query | 969 indexed scenes in audit; Orbit 63/129 examples | Scene IDs/orbit/pass/date | Catalogue + process report | ESA/Copernicus/GEE | Not ground truth |
| SRC-008 | Remote sensing | JRC Global Surface Water | Historical water | SOURCE/RESEARCH | VERIFIED AS INPUT | GEE collection | Historical occurrence screening | Version/date/threshold | Process report | Dataset terms | Not contemporaneous ground truth |
| SRC-009 | Decision | EWE | Software logic | DERIVED/SOFTWARE-VERIFIED | VERIFIED | Backend EWE | D=min(A-T-B) | Formula/tests/config | Spec + tests | Project code | FEASIBLE ≠ SAFE |
| SRC-010 | Validation | Gate 5B pilot | Human evaluation | DERIVED | CONDITIONAL | Protocol 2.1.0; N=2 | Decision-time/accuracy evidence | Protocol/raw results/hash | Pilot report | Internal evidence | Exploratory only |

---

## 2. Claim Matrix (`CLAIM_MATRIX.csv`)

The matrix below governs permissible claim language, evidence references, and forbidden phrasing across the project:

| Claim ID | Claim | Evidence | Status | Safe wording | Forbidden wording | Gap/next action |
| CLM-001 | Native HEC-RAS 2D result ingestion | Native HDF5 + adapter tests | GREEN | Native HEC-RAS 2D result ingestion is demonstrated. | Fully validated hydraulic model | Attach exact artifact/hash for each showcased case. |
| CLM-002 | Evacuation deadline | EWE + property tests | GREEN | Deadline is deterministically calculated from arrival, travel time and buffer. | Guaranteed safe evacuation | Keep backend authoritative. |
| CLM-003 | GEE observation comparison | Sentinel-1 workflow | YELLOW | Research-oriented observational discrepancy comparison. | Satellite validates Tehri | Use event-matched acquisitions when available. |
| CLM-004 | SPH/Delft3D | Interfaces | YELLOW | External solver interface boundary exists. | Fully implemented | Only claim execution with real solver artifacts. |
| CLM-005 | Tehri physical validation | No field benchmark | RED | Physical validation is not established. | Calibrated/validated Tehri model | Acquire defensible benchmark data. |
| CLM-006 | Operational travel time | Static 50 km/h assumption | ORANGE | Configured travel-time assumption. | Live traffic-aware prediction | Add validated dynamic model/data if needed. |

---

## 3. Cryptographic Manifest (`MANIFEST_SHA256.json`)

All documents and source artifacts within the Evidence Hub suite are indexed with SHA-256 integrity hashes in [MANIFEST_SHA256.json](MANIFEST_SHA256.json).
*Note: SHA-256 strictly guarantees artifact integrity and non-tampering on disk; it does not constitute physical field validation.*
