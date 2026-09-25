# 19 — Experimental Data Export & Provenance Logging Audit
**Audit Date:** 2026-09-24  
**Audited Engine:** `backend/app/experiments/gate5b_harness.py`  

---

## 1. Export Formats & Schema Compliance
Every experimental session exports immutable JSON and CSV records containing:
- `session_id`, `participant_id`, `participant_category`, `counterbalance_group`
- `experiment_mode` (`TECHNICAL_DRY_RUN`, `INTERNAL_HUMAN_PILOT`, `FORMAL_HUMAN_STUDY`)
- `protocol_version`, `ui_version`, `scoring_version`, `ground_truth_hash`
- `comprehension_check` diagnostic responses and flagged misconceptions
- `trials` (task ID, condition, start/end ISO timestamps, duration, scores, safety misinterpretation flags)
- `researcher_observations` (intervention type, hesitation seconds, researcher notes)

---

## 2. Reproducibility & Bitwise Integrity
All exported session records embed the SHA-256 ground truth cryptographic hash (`GROUND_TRUTH_HASH`), guaranteeing that exported scores correspond to the exact pre-registered rubrics.
