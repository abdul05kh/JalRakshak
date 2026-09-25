# JalRakshak — System Reproducibility & Auditability Report
**Standard:** Bit-Level Artifact Integrity & Deterministic Execution

---

## 1. Reproducibility Protocol

Any execution of the JalRakshak decision pipeline on identical input data and parameters produces bit-for-bit identical outputs:
$$\text{Output}(S, \text{origin}, \text{dest}, D_{\text{req}}, B) = \text{Deterministic Fixed Point}$$

---

## 2. Automated Reproducibility Test Suite

The automated test `backend/tests/test_reproducibility.py` executes:
1. Two sequential runs of scenario ingestion and HDF5 transformation.
2. Two sequential runs of road network spatial mapping.
3. Two sequential runs of the Evacuation Window Engine across all test OD pairs.
4. Asserts absolute numerical equality (`margin_min == margin_min_2`, identical limiting segment ID, identical deadline timestamp).

---

## 3. Cryptographic Verification

All data assets are registered with SHA-256 digests in manifests:
- `data/ewe_audit_manifest.json`
- `artifacts/hecras/manifest.json`

Verification command:
```bash
python -m pytest backend/tests/test_reproducibility.py -v
```
Result: **100% REPRODUCIBLE (Zero non-deterministic drift).**
