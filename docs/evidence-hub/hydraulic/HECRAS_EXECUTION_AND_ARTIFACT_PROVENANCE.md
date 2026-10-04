**JALRAKSHAK — HEC-RAS EXECUTION & ARTIFACT PROVENANCE**
JalRakshak SIH'26 — Evidence Hub

# Genuine execution evidence recorded


| Item | Record |
| --- | --- |
| Solver | HEC-RAS 7.0.1 |
| Bald Eagle native HDF5 | BaldEagleDamBrk.p05.hdf |
| Bald Eagle SHA-256 | 43aeff5843b74607514dc61e202bae05c23c5dc431070a5d3761330f00b056ec |
| Tehri smoke-test HDF5 | TehriSmokeTest.p01.hdf |
| Tehri smoke-test SHA-256 | ab3db449d852b82ea7c8130997dc032e3c28d3b79463002d6f9f89d62462b0b0 |
| Execution evidence | Native HEC-RAS / COM workflow recorded in project evidence |
| Smoke-test | Finished Unsteady Flow Simulation; exit 0; volume accounting recorded |


# Native result information used

- WSE / water-surface elevation.
- Velocity information.
- Coordinates.
- Cell minimum elevation.
- Time/state information.

# Depth and arrival derivation

Where WSE and cell minimum elevation exist, depth can be derived as WSE minus cell minimum elevation. Arrival time is the first recorded state reaching the documented depth threshold. Preserve threshold, time reference, output interval and nodata semantics.

# Integrity versus validation

SHA-256 demonstrates artifact integrity relative to the recorded digest. It does not prove physical correctness, calibration or real-world representativeness.

# Artifact rule

Never discard native HEC-RAS artifacts in favor of synthetic JSON approximations. Derived outputs must point back to the native source.

## Verified Artifact Hashes
| Artifact | Type | Solver | SHA-256 Hash | Integrity Status |
| --- | --- | --- | --- | --- |
| Bald Eagle Benchmark | Native HDF5 | HEC-RAS 7.0.1 | `43aeff5843b74607514dc61e202bae05c23c5dc431070a5d3761330f00b056ec` | VERIFIED ARTIFACT INTEGRITY |
| Tehri Smoke-Test | Native HDF5 | HEC-RAS 7.0.1 | `ab3db449d852b82ea7c8130997dc032e3c28d3b79463002d6f9f89d62462b0b0` | VERIFIED ARTIFACT INTEGRITY |

*Important: SHA-256 proves artifact integrity on disk, not physical validation or predictive accuracy.*
