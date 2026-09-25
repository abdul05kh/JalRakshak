# GATE 5B — EXPERIMENT REPRODUCIBILITY & AUDIT GUIDE

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** REPRODUCIBLE EXPERIMENTAL ENVIRONMENT  
**Date:** 2026-09-24  

---

## 1. Reproduction Package Components

Any independent researcher can re-run the entire Gate 5B experimental suite using the following automated tools:

1. **Experiment Harness:** [`backend/app/experiments/gate5b_harness.py`](file:///d:/projects/JalRakshak/backend/app/experiments/gate5b_harness.py)
2. **Ground Truth Benchmark:** [`docs/GATE5B_GROUND_TRUTH_FREEZE.md`](file:///d:/projects/JalRakshak/docs/GATE5B_GROUND_TRUTH_FREEZE.md)
3. **Task Questionnaire:** [`docs/GATE5B_TASK_BOOK.md`](file:///d:/projects/JalRakshak/docs/GATE5B_TASK_BOOK.md)
4. **Automated Scorer & Validator:** [`backend/tests/test_gate5b_harness_and_protocol.py`](file:///d:/projects/JalRakshak/backend/tests/test_gate5b_harness_and_protocol.py)

---

## 2. Command-Line Experiment Execution

To administer a live participant trial via the command-line harness:

```powershell
# Run interactive participant session
python backend/app/experiments/gate5b_harness.py --participant-id P001 --category STUDENT_CIVIL_HYDRAULIC --group A_THEN_B
```

To run the automated verification of the experimental harness and ground truth:

```powershell
# Run test suite verifying ground truth and scoring logic
python -m pytest backend/tests/test_gate5b_harness_and_protocol.py
```

---

## 3. Configuration & State Freeze

- **Backend Version:** `1.0.0-gate5b`
- **Hydraulic Engine:** `USACE HEC-RAS 7.0.1 2D Unsteady`
- **Scenario Artifact Central:** `tehri_15km_scenario_central.p01.hdf` (`SHA-256: c0b18e04...`)
- **Spatial Corridor Width:** `150.0 m`
- **Safety Buffer Default:** `3.0 min`
- **Low-Margin Threshold Default:** `5.0 min`
