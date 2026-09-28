# QA & Verification Test Plan

**Author / Maintainer:** Thaniska ([@thanishkaX](https://github.com/thanishkaX))  
**Role:** QA & Verification Lead  
**Project:** JalRakshak — Decision Support System for Dam-Break Flood Evacuation

---

## 1. Quality Assurance Objective
Ensure 100% deterministic reproducibility, scientific accuracy, and strict scenario isolation across all computational and visualization layers of the JalRakshak platform.

---

## 2. Test Suite Architecture

### Test Modules
| Test Suite | File | Scope |
|---|---|---|
| **HEC-RAS Adapter Tests** | `backend/tests/test_hecras_adapter.py` | HDF5 schema validation, boundary hydrographs, spatial coordinate parsing. |
| **EWE Boundary & Lineage** | `backend/tests/test_ewe_boundary_and_lineage.py` | Evacuation window efficiency calculations, edge cases ($t_{\text{arrival}} \le t_{\text{clearance}}$), alert transitions. |
| **Scenario Isolation Verification** | `backend/tests/test_scenario_loader.py` | Independent world verification for `TEST_ALPHA` and `TEST_BETA` without global state leakage. |
| **End-to-End API Integration** | `backend/tests/test_api_endpoints.py` | Validates `/api/v1/health`, `/api/v1/scenarios`, and `/api/v1/evacuation/plan`. |

---

## 3. Black-Box Acceptance Criteria
1. **SceneView Rendering:** 3D hydraulic mesh rendered directly on terrain with accurate depth color ramp and arrival isochrones.
2. **Timeline Scrubbing:** Unsteady wave front advances synchronously with timeline slider ($T+00 \to T+120$).
3. **Limiting Edge Highlighting:** The bottleneck road segment (lowest EWE) is immediately highlighted upon route calculation.
4. **Zero Frontend Hardcoding:** Switching between scenarios dynamically shifts camera and geographic entities.
