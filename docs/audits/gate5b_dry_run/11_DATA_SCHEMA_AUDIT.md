# GATE 5B TECHNICAL DRY RUN — DATA SCHEMA AUDIT
**Document ID:** `11_DATA_SCHEMA_AUDIT.md`
**Timestamp:** 2026-09-24T18:41:35+05:30 (Local)
**Scope:** Exported JSON and CSV Schema Conformance Verification

---

## 1. Schema Conformance Verification

### Root JSON Schema (`artifacts/gate5b/dry_run/session_*.json`):
```json
{
  "session_id": "string",
  "participant_id": "string",
  "participant_category": "string",
  "counterbalance_group": "string",
  "software_version_backend": "string",
  "software_version_frontend": "string",
  "ground_truth_hash": "string (64 hex characters)",
  "comprehension_check": {
    "answers": "object",
    "all_correct": "boolean",
    "misconceptions_flagged": "array",
    "recorded_at_iso": "string (ISO-8601)"
  },
  "trials": "array of trial objects",
  "qualitative_feedback": "object"
}
```

### Trial Record Schema:
```json
{
  "trial_index": "integer (1-7)",
  "condition": "string (CONDITION_A_RAW_HYDRAULIC / CONDITION_B_JALRAKSHAK)",
  "task_id": "string (TASK_01 to TASK_07)",
  "start_iso": "string (ISO-8601 UTC)",
  "end_iso": "string (ISO-8601 UTC)",
  "duration_seconds": "float (>= 0.0)",
  "raw_response": "object",
  "scores": {
    "status_correct": "integer (optional)",
    "deadline_correct": "integer (optional)",
    "limiting_segment_correct": "integer (optional)",
    "explanation_score": "integer (optional)",
    "alternative_correct": "integer (optional)",
    "scenario_delta_correct": "integer (optional)",
    "limitation_awareness_score": "integer (optional)",
    "misinterpreted_as_safety": "boolean"
  }
}
```

---

## 2. Dry-Run Schema Validation Outcome
- Both exported session files (`session_DRYRUN-TECH-001.json` and `session_DRYRUN-TECH-002.json`) validated 100% against schema rules.
- CSV export (`dry_run_trials_summary.csv`) matches all tabular data definitions without column corruption.
- **Verdict:** **PASS**.
