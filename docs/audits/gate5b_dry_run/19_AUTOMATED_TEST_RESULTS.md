# GATE 5B TECHNICAL DRY RUN — AUTOMATED TEST RESULTS
**Document ID:** `19_AUTOMATED_TEST_RESULTS.md`
**Timestamp:** 2026-09-24T18:42:37+05:30 (Local)
**Scope:** Full Regression & Gate 5B Specific Pytest Suite Execution

---

## 1. Test Suite Summary

- **Execution Command:** `python -m pytest backend/tests/`
- **Total Test Count:** **125 tests**
- **Passed:** **125**
- **Failed:** **0**
- **Skipped:** **0**
- **Warnings:** **0**
- **Execution Duration:** **16.03 seconds**

---

## 2. Test Module Breakdown

| Test File | Items | Status | Key Properties Verified |
| :--- | :---: | :---: | :--- |
| `backend/tests/test_api_endpoints.py` | 8 | ✅ Pass | API routing, response contracts, HTTP 200/400. |
| `backend/tests/test_arrival_time.py` | 2 | ✅ Pass | Threshold crossing extraction from depth series. |
| `backend/tests/test_ewe_boundary_and_lineage.py` | 14 | ✅ Pass | Lineage, buffer bounds, edge-level deadlines. |
| `backend/tests/test_ewe_integration.py` | 1 | ✅ Pass | Full end-to-end evacuation window integration. |
| `backend/tests/test_ewe_properties.py` | 5 | ✅ Pass | Monotonicity, non-negative margins, graph paths. |
| `backend/tests/test_gate4_ewe_properties.py` | 14 | ✅ Pass | Departure deadline minimization across all vertices. |
| `backend/tests/test_gate5_officer_decision_validation.py` | 23 | ✅ Pass | Provenance, golden cases, data-gap handling. |
| `backend/tests/test_gate5b_harness_and_protocol.py` | 14 | ✅ Pass | Harness scoring, comprehension check, 150m coupling V2. |
| `backend/tests/test_golden_scenario.py` | 1 | ✅ Pass | Baseline scenario consistency. |
| `backend/tests/test_hecras_adapter.py` | 3 | ✅ Pass | Native HEC-RAS HDF5 ingestion & read-only guarantee. |
| `backend/tests/test_provenance.py` | 2 | ✅ Pass | Cryptographic audit trail & checksum verification. |
| `backend/tests/test_real_hecras_integration.py` | 8 | ✅ Pass | Native HEC-RAS 7.0.1 HDF5 binary integration. |
| `backend/tests/test_reproducibility.py` | 1 | ✅ Pass | Bit-level deterministic replay. |
| `backend/tests/test_road_mapping.py` | 2 | ✅ Pass | Hardened spatial mapping & conservative assignment. |
| `backend/tests/test_tehri_gate3_model.py` | 7 | ✅ Pass | 15km hydraulic reach physics & mass balance. |
| `backend/tests/test_tehri_gate3b_15km.py` | 10 | ✅ Pass | Multi-scenario suite execution & HDF5 schemas. |
| `backend/tests/test_tehri_native_hecras.py` | 8 | ✅ Pass | Hydrograph fixed-width parsing & convergence. |
| `backend/tests/test_validation_metrics.py` | 2 | ✅ Pass | Metric verification against benchmarks. |

---

## 3. Epistemic Limitation
Passing 125 automated tests provides high confidence in software stability and computational determinism; it does **not** constitute empirical human validation.
