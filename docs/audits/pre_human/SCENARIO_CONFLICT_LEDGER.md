# JALRAKSHAK — SCENARIO CONFLICT LEDGER & FORENSIC RECONCILIATION
**Pre-Human Audit Forensic Evidence**
**Status:** FULLY RECONCILED & PROVEN BY ARTIFACTS

---

## 1. Executive Forensic Summary

A complete repository-wide forensic scan was performed across all code, HEC-RAS input/output files, manifests, JSON schemas, documentation, and test suites to resolve any conflicting scenario discharge definitions.

### Finding:
- **Authoritative Executable Suite:** The native USACE HEC-RAS 7.0.1 2D unsteady flow simulations that were executed by `RasUnsteady.exe`, frozen in `artifacts/hecras/tehri_gate3b/`, and consumed by Gate 4/5 spatial coupling are uniquely and unambiguously:
  - **`SCENARIO_MINIMUM`:** $Q_{\text{peak}} = \mathbf{28,500.0\text{ m}^3/\text{s}}$ ($t_{\text{peak}} = 1.5\text{ h}$, $V_{\text{in}} = 95,140.859 \times 10^3\text{ m}^3$)
  - **`SCENARIO_CENTRAL`:** $Q_{\text{peak}} = \mathbf{65,000.0\text{ m}^3/\text{s}}$ ($t_{\text{peak}} = 1.0\text{ h}$, $V_{\text{in}} = 227,413.625 \times 10^3\text{ m}^3$)
  - **`SCENARIO_MAXIMUM`:** $Q_{\text{peak}} = \mathbf{115,000.0\text{ m}^3/\text{s}}$ ($t_{\text{peak}} = 0.75\text{ h}$, $V_{\text{in}} = 374,147.844 \times 10^3\text{ m}^3$)

- **Origin of 15,000:** The number `15000` appears in `data/tehri/run_tehri_pilot_simulation.py` exclusively as the physical reach length in meters ($15,000\text{ m} = 15\text{ km}$) for the river gradient formula `(d_val / 15000.0)`. It was never a discharge parameter.
- **Origin of 90,000:** Mentioned only in informal discussion notes; zero occurrences exist in any HEC-RAS input file, manifest, script, or test in the entire repository.
- **Precomputed Mock Fixtures:** Early web UI mock scenarios (`scen-tehri-001` with $28,400\text{ m}^3/\text{s}$, `scen-tehri-002` with $64,200\text{ m}^3/\text{s}$, `scen-tehri-003` with $14,100\text{ m}^3/\text{s}$) are explicitly marked `"PRECOMPUTED DEMO FIXTURE"` and are not native HEC-RAS runs.

---

## 2. Forensic Occurrence Ledger

| ID | Location | Value Found | Context / Variable | Artifact Classification | Provenance & Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCL-01** | `artifacts/hecras/tehri_gate3b/manifest.json#L9,L11` | `65000.0` | `SCENARIO_CENTRAL.parameters.q_peak_m3s` | **AUTHORITATIVE** | Executed in HEC-RAS 7.0.1; SHA-256: `c0b18e0416697757e4733bae120217e5222aed726841d4f8ab26bd093445fc78`. |
| **SCL-02** | `artifacts/hecras/tehri_gate3b/manifest.json#L175,L177` | `28500.0` | `SCENARIO_MINIMUM.parameters.q_peak_m3s` | **AUTHORITATIVE** | Executed in HEC-RAS 7.0.1; SHA-256: `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c1154be8e9f48b8b901eba772`. |
| **SCL-03** | `artifacts/hecras/tehri_gate3b/manifest.json#L341,L343` | `115000.0` | `SCENARIO_MAXIMUM.parameters.q_peak_m3s` | **AUTHORITATIVE** | Executed in HEC-RAS 7.0.1; SHA-256: `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e680d1f64385e5046d35d179a`. |
| **SCL-04** | `artifacts/gate4/manifest.json#L18` | `28500.0` | `gate3b_source.scenarios.MINIMUM.q_peak_m3s` | **DERIVED** | Gate 4 spatial coupling ingestion of native HEC-RAS run. |
| **SCL-05** | `artifacts/gate4/manifest.json#L13` | `65000.0` | `gate3b_source.scenarios.CENTRAL.q_peak_m3s` | **DERIVED** | Gate 4 spatial coupling ingestion of native HEC-RAS run. |
| **SCL-06** | `artifacts/gate4/manifest.json#L23` | `115000.0` | `gate3b_source.scenarios.MAXIMUM.q_peak_m3s` | **DERIVED** | Gate 4 spatial coupling ingestion of native HEC-RAS run. |
| **SCL-07** | `scratch/execute_gate3b_clean_scenarios.py#L48` | `28500.0` | `generate_breach_hydrograph(scenario_type="MINIMUM")` | **AUTHORITATIVE** | Python script generating fixed-width 8-column `.u01` input to HEC-RAS. |
| **SCL-08** | `scratch/execute_gate3b_clean_scenarios.py#L60` | `65000.0` | `generate_breach_hydrograph(scenario_type="CENTRAL")` | **AUTHORITATIVE** | Python script generating fixed-width 8-column `.u01` input to HEC-RAS. |
| **SCL-09** | `scratch/execute_gate3b_clean_scenarios.py#L54` | `115000.0` | `generate_breach_hydrograph(scenario_type="MAXIMUM")` | **AUTHORITATIVE** | Python script generating fixed-width 8-column `.u01` input to HEC-RAS. |
| **SCL-10** | `data/tehri/run_tehri_pilot_simulation.py#L185,L196` | `15000.0` | `valley_invert = 617.5 - (d_val / 15000.0) * ...` | **OBSOLETE / GEOMETRIC ONLY** | Represents 15,000 meters reach length, NOT discharge. |
| **SCL-11** | `data/scenarios/scen-tehri-001-baseline/manifest.json#L11` | `28400.0` | `breach_parameters.peak_discharge_m3s` | **HISTORICAL DEMO FIXTURE** | Early UI mock fixture (precomputed synthetic GeoJSON). |
| **SCL-12** | `data/scenarios/scen-tehri-002-catastrophic/manifest.json#L11` | `64200.0` | `breach_parameters.peak_discharge_m3s` | **HISTORICAL DEMO FIXTURE** | Early UI mock fixture (precomputed synthetic GeoJSON). |
| **SCL-13** | `data/scenarios/scen-tehri-003-piping/manifest.json#L11` | `14100.0` | `breach_parameters.peak_discharge_m3s` | **HISTORICAL DEMO FIXTURE** | Early UI mock fixture (precomputed synthetic GeoJSON). |

---

## 3. Physical Inflow Volume Integration Audit

Using the trapezoidal rule $V = \sum \frac{Q_i + Q_{i+1}}{2} \Delta t$ over the 2-hour duration ($\Delta t = 900\text{ s}$):

| Scenario | Peak Flow ($Q_p$) | Peak Time ($T_p$) | Trapezoidal Inflow Volume ($10^3\text{ m}^3$) | HEC-RAS Reported Inflow ($10^3\text{ m}^3$) | Error (%) | Mass Balance Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MINIMUM** | $28,500.0\text{ m}^3/\text{s}$ | $1.5\text{ h}$ | $95,134.37$ | $95,140.86$ | $0.0068\%$ | ✅ **VERIFIED** |
| **CENTRAL** | $65,000.0\text{ m}^3/\text{s}$ | $1.0\text{ h}$ | $227,405.56$ | $227,413.63$ | $0.0035\%$ | ✅ **VERIFIED** |
| **MAXIMUM** | $115,000.0\text{ m}^3/\text{s}$ | $0.75\text{ h}$ | $374,137.24$ | $374,147.84$ | $0.0028\%$ | ✅ **VERIFIED** |

---

## 4. Final Verdict

The hydraulic scenario source-of-truth discrepancy is **100% conclusively RESOLVED**:
- **Authoritative Triad:** `28,500 / 65,000 / 115,000 m3/s`
- **Reconciliation Status:** Fully backed by native HEC-RAS 7.0.1 HDF5 binary outputs, SHA-256 signatures, and mathematical trapezoidal inflow volume integration.
- **No Ambiguity Remains.**
