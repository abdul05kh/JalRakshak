**JALRAKSHAK — REPRODUCIBILITY & PROVENANCE REPORT**
JalRakshak SIH'26 — Evidence Hub

# Objective

A reviewer should be able to identify the exact source artifact behind a displayed result, the transformations applied, and whether artifacts changed.

# Manifest fields

- Artifact ID; filename/path; type; source scenario; parent artifact.
- Solver/software version; timestamp.
- CRS; bounds; resolution; units; nodata; dimensions.
- Processing operation and script/version.
- SHA-256 checksum.
- Licence/attribution.
- Validation status.

# Repeatability

Numerical/decision repeatability is demonstrated for defined tests. Byte-identical file reproduction must not be claimed merely because hydraulic arrays repeat; metadata can change file hashes.

# Reproduction sequence

- Obtain exact source/model artifacts and licences.
- Verify checksums.
- Verify software versions.
- Load native HEC-RAS result.
- Run documented adapter.
- Apply road coupling.
- Run EWE with identical route/travel/buffer configuration.
- Compare decision output and limiting edge.
- Classify any discrepancy.
