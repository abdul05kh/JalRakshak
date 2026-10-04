# Cross-Repository Claim Audit Findings

**Audit Scope:** Full codebase scan across all backend Python scripts, frontend TypeScript components, and documentation.  
**Total Target Keyword Matches Analyzed:** 493

---

## 1. Audit Summary & Classification Criteria
1. **VALID_DISCLAIMER:** The keyword is part of an explicit scientific limitation, epistemic disclaimer, or negative boundary.
2. **VALID_SCOPED:** The keyword refers to verified numerical or software-level verification within declared bounds.
3. **TEST_DEMO:** The occurrence is restricted to mock data, test fixtures, or test assertions.
4. **HISTORICAL_OR_GATE_RECORD:** Recorded in historical gate reports; superseded by the authoritative Evidence Hub.
5. **UNSUPPORTED:** Requires terminology correction in presentation copy.

---

## 2. Representative Audit Ledger

| # | File & Line | Target Phrase | Classification | Recommended Action |
| --- | --- | --- | --- | --- |
| 1 | `README.md:34` | `physically validated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 2 | `README.md:44` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 3 | `README.md:179` | `ground truth` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 4 | `README.md:214` | `accurate` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 5 | `README.md:224` | `real-time` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 6 | `README.md:262` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 7 | `README.md:265` | `calibrated` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 8 | `README.md:266` | `real-time` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 9 | `README.md:282` | `real-time` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 10 | `run_gate5b_preflight.py:39` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 11 | `run_gate5b_preflight.py:40` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 12 | `run_gate5b_preflight.py:47` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 13 | `run_gate5b_preflight.py:50` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 14 | `run_gate5b_preflight.py:176` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 15 | `artifacts/gate5b/dry_run/session_DRYRUN-TECH-002.json:31` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 16 | `artifacts/gate5b/dry_run/session_DRYRUN-TECH-002.json:123` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 17 | `artifacts/gate5b/pilot/session_PILOT-HUMAN-002.json:131` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 18 | `backend/app/domain/damage_model.py:8` | `calibrated` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 19 | `backend/app/domain/damage_model.py:214` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 20 | `backend/app/domain/provenance_service.py:8` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 21 | `backend/app/domain/validation_ladder.py:144` | `calibrated` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 22 | `backend/app/experiments/gate5b_harness.py:24` | `safe route` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 23 | `backend/app/experiments/gate5b_harness.py:188` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 24 | `backend/app/integrations/gee/sentinel1_multitemporal.py:80` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 25 | `backend/tests/test_gate5b_harness_and_protocol.py:15` | `ground truth` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 26 | `backend/tests/test_gate5b_harness_and_protocol.py:19` | `ground truth` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 27 | `backend/tests/test_gate5b_harness_and_protocol.py:43` | `guaranteed` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 28 | `backend/tests/test_gate5b_harness_and_protocol.py:45` | `guaranteed` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 29 | `backend/tests/test_gate5b_harness_and_protocol.py:104` | `100%` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 30 | `backend/tests/test_gate5b_ui_simplification.py:120` | `safe route` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 31 | `backend/tests/test_gate5b_ui_simplification.py:121` | `guaranteed` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 32 | `backend/tests/test_gate5_officer_decision_validation.py:434` | `100%` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 33 | `backend/tests/test_gate5_officer_decision_validation.py:435` | `guaranteed` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 34 | `backend/tests/test_gate5_officer_decision_validation.py:436` | `guaranteed` | **TEST_DEMO** | Scoped to unit test or mock fixture. |
| 35 | `data/calibration/mannings_roughness_table.json:2` | `calibrated` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 36 | `data/tehri/run_tehri_pilot_simulation.py:13` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 37 | `docs/AI_ROUTING_AND_DECISION_SPEC.md:32` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 38 | `docs/ANTIGRAVITY_AUDIT.md:27` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 39 | `docs/ARCHITECTURE_AUDIT.md:210` | `guaranteed` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 40 | `docs/ARRIVAL_TIME_METHOD.md:3` | `99%` | **UNSUPPORTED** | Replace with "FEASIBLE under configured assumptions" or "software verified". |
| 41 | `docs/BACKEND_ARCHITECTURE.md:34` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 42 | `docs/CLAIM_TO_EVIDENCE.md:9` | `accurate` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 43 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:63` | `live traffic` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 44 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:156` | `live traffic` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 45 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:158` | `live traffic` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 46 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:160` | `physically validated` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 47 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:173` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 48 | `docs/FINAL_ARCHITECTURE_HARDENING_REPORT.md:198` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 49 | `docs/FINAL_GATE5B_HUMAN_VALIDATION_READINESS_AND_EXECUTION_REPORT.md:44` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 50 | `docs/FINAL_GATE5B_HUMAN_VALIDATION_READINESS_AND_EXECUTION_REPORT.md:108` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 51 | `docs/FINAL_HARDENING_BASELINE.md:13` | `100%` | **UNSUPPORTED** | Replace with "FEASIBLE under configured assumptions" or "software verified". |
| 52 | `docs/FINAL_HARDENING_BASELINE.md:27` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 53 | `docs/FINAL_HARDENING_BASELINE.md:30` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 54 | `docs/FINAL_PRE_HUMAN_FORENSIC_STATUS.md:14` | `ground truth` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 55 | `docs/FINAL_PRE_HUMAN_FORENSIC_STATUS.md:28` | `100%` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 56 | `docs/FINAL_SIH26161_GAP_REPORT.md:6` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 57 | `docs/FINAL_SIH26161_GAP_REPORT.md:73` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 58 | `docs/FINAL_TECHNICAL_VERIFICATION.md:38` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 59 | `docs/FINAL_TECHNICAL_VERIFICATION.md:47` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 60 | `docs/FINAL_TECHNICAL_VERIFICATION.md:49` | `guaranteed` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 61 | `docs/FINAL_TECHNICAL_VERIFICATION.md:50` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 62 | `docs/FORENSIC_AUDIT_REPORT.md:22` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 63 | `docs/FORENSIC_AUDIT_REPORT.md:56` | `100%` | **UNSUPPORTED** | Replace with "FEASIBLE under configured assumptions" or "software verified". |
| 64 | `docs/FRONTEND_3D_SCENEVIEW.md:27` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 65 | `docs/FRONTEND_3D_SCENEVIEW.md:34` | `real-time` | **VALID_SCOPED** | Use scoped scientific terminology. |
| 66 | `docs/GATE3_FULL_SCIENTIFIC_CLOSURE.md:6` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 67 | `docs/GATE4_ASSUMPTION_UNCERTAINTY_LEDGER.md:16` | `calibrated` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 68 | `docs/GATE4_ASSUMPTION_UNCERTAINTY_LEDGER.md:41` | `real-time` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 69 | `docs/GATE4_EXECUTIVE_SUMMARY.md:45` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 70 | `docs/GATE4_EXECUTIVE_SUMMARY.md:58` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 71 | `docs/GATE4_EXECUTIVE_SUMMARY.md:63` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 72 | `docs/GATE4_FINAL_SCIENTIFIC_ACCEPTANCE.md:66` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 73 | `docs/GATE4_HYDRAULIC_INPUT_MANIFEST.md:85` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 74 | `docs/GATE4_HYDRAULIC_INPUT_MANIFEST.md:88` | `guaranteed` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 75 | `docs/GATE4_REPRODUCIBILITY.md:23` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 76 | `docs/GATE4_REPRODUCIBILITY.md:47` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 77 | `docs/GATE4_ROAD_STATUS_RULES.md:64` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 78 | `docs/GATE4_ROAD_STATUS_RULES.md:65` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 79 | `docs/GATE4_SCIENTIFIC_QA.md:50` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 80 | `docs/GATE4_SCIENTIFIC_QA.md:75` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 81 | `docs/GATE4_SCIENTIFIC_QA.md:210` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 82 | `docs/GATE4_SCIENTIFIC_QA.md:221` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 83 | `docs/GATE4_SPATIAL_COUPLING_FORENSIC.md:57` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 84 | `docs/GATE4_TRAVEL_TIME_MODEL.md:28` | `real-time` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 85 | `docs/GATE5B_ANALYSIS_PLAN.md:34` | `calibrated` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 86 | `docs/GATE5B_ANALYSIS_PLAN.md:37` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 87 | `docs/GATE5B_ANALYSIS_PLAN.md:46` | `accurate` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 88 | `docs/GATE5B_ANALYSIS_PLAN.md:47` | `accurate` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 89 | `docs/GATE5B_COMPREHENSION_CHECK.md:27` | `real-time` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 90 | `docs/GATE5B_COMPREHENSION_CHECK.md:44` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 91 | `docs/GATE5B_COMPREHENSION_CHECK.md:47` | `100%` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 92 | `docs/GATE5B_CONDITION_FAIRNESS_AUDIT.md:29` | `live traffic` | **VALID_DISCLAIMER** | Maintain clear epistemic disclaimer. |
| 93 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:1` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 94 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:5` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 95 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:10` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 96 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:12` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 97 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:16` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 98 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:20` | `guaranteed` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 99 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:30` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
| 100 | `docs/GATE5B_GROUND_TRUTH_FREEZE.md:33` | `ground truth` | **HISTORICAL_OR_GATE_RECORD** | Preserve as historical engineering record; use Evidence Hub for authoritative interpretation. |
