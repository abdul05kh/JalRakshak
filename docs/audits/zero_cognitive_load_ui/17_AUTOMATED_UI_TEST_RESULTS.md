# 17 — Automated UI & Decision Engine Test Results

**Project:** JalRakshak Emergency Decision-Support System  
**Test Suite:** Pytest + TypeScript Typecheck + Vite Production Build  
**Execution Timestamp:** 2026-09-24T20:03:00Z  
**Status:** 100% PASS (136/136 backend tests, 0 build errors)  

---

## 1. Test Suite Summary

```text
============================= test session starts =============================
platform win32 -- Python 3.14.2, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\projects\JalRakshak
configfile: pytest.ini
testpaths: backend/tests
plugins: anyio-4.12.1
collected 136 items

backend\tests\test_api_endpoints.py ........                             [  5%]
backend\tests\test_arrival_time.py ..                                    [  7%]
backend\tests\test_ewe_boundary_and_lineage.py ..............            [ 17%]
backend\tests\test_ewe_integration.py .                                  [ 18%]
backend\tests\test_ewe_properties.py .....                               [ 22%]
backend\tests\test_gate4_ewe_properties.py ..............                [ 32%]
backend\tests\test_gate5_officer_decision_validation.py ................ [ 44%]
.......                                                                  [ 49%]
backend\tests\test_gate5b_harness_and_protocol.py ..............         [ 59%]
backend\tests\test_gate5b_ui_simplification.py ...........               [ 67%]
backend\tests\test_golden_scenario.py .                                  [ 68%]
backend\tests\test_hecras_adapter.py ...                                 [ 70%]
backend\tests\test_provenance.py ..                                      [ 72%]
backend\tests\test_real_hecras_integration.py ........                   [ 77%]
backend\tests\test_reproducibility.py .                                  [ 78%]
backend\tests\test_road_mapping.py ..                                    [ 80%]
backend\tests\test_tehri_gate3_model.py .......                          [ 85%]
backend\tests\test_tehri_gate3b_15km.py ..........                       [ 92%]
backend\tests\test_tehri_native_hecras.py ........                       [ 98%]
backend\tests\test_validation_metrics.py ..                              [100%]

============================ 136 passed in 51.61s =============================
```

---

## 2. Frontend Production Build

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 1887 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-DCZlzI8B.css   16.66 kB │ gzip:   6.94 kB
dist/assets/index-CqfavMBf.js   437.13 kB │ gzip: 127.53 kB

✓ built in 570ms
```

---

## 3. Key Assertion Matrix
1. Central scenario route R02 yields `FEASIBLE` $\rightarrow$ **PASS**
2. Flood arrival displays `T+60:00` $\rightarrow$ **PASS**
3. Travel time displays `12:39` $\rightarrow$ **PASS**
4. Safety buffer displays `03:00` $\rightarrow$ **PASS**
5. Departure deadline displays `LEAVE BY T+44:21` $\rightarrow$ **PASS**
6. Limiting segment displays `R02` $\rightarrow$ **PASS**
7. `FEASIBLE` never replaced by `SAFE` $\rightarrow$ **PASS**
8. Data gaps render `DATA GAP` state $\rightarrow$ **PASS**
9. Provenance drawer accurately reflects native HEC-RAS 7.0.1 lineage $\rightarrow$ **PASS**
