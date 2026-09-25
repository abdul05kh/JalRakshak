# GATE 5B — EXPERIMENTAL DATA SCHEMA

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** MACHINE-READABLE SCHEMA SPECIFICATION  
**Date:** 2026-09-24  

---

## 1. Schema Overview

All participant trial data is captured in structured, anonymized JSON and CSV records conforming to the following data contracts.

---

## 2. Participant Session Record (`session_<pid>.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Gate5BParticipantSession",
  "type": "object",
  "required": [
    "session_id",
    "participant_id",
    "participant_category",
    "counterbalance_group",
    "software_version_backend",
    "software_version_frontend",
    "ground_truth_hash",
    "trials",
    "qualitative_feedback"
  ],
  "properties": {
    "session_id": { "type": "string" },
    "participant_id": { "type": "string", "pattern": "^P[0-9]{3}$" },
    "participant_category": { 
      "type": "string",
      "enum": [
        "STUDENT_CIVIL_HYDRAULIC",
        "STUDENT_COMPUTER_SCIENCE",
        "GIS_DISASTER_LEARNER",
        "DOMAIN_ENGINEER_FACULTY",
        "NON_DOMAIN_GENERAL"
      ]
    },
    "counterbalance_group": { "type": "string", "enum": ["GROUP_1_A_THEN_B", "GROUP_2_B_THEN_A"] },
    "software_version_backend": { "type": "string" },
    "software_version_frontend": { "type": "string" },
    "ground_truth_hash": { "type": "string" },
    "trials": {
      "type": "array",
      "items": { "$ref": "#/definitions/TrialRecord" }
    },
    "qualitative_feedback": { "$ref": "#/definitions/QualitativeFeedback" }
  },
  "definitions": {
    "TrialRecord": {
      "type": "object",
      "required": [
        "trial_index",
        "condition",
        "task_id",
        "start_iso",
        "end_iso",
        "duration_seconds",
        "raw_response",
        "scores"
      ],
      "properties": {
        "trial_index": { "type": "integer" },
        "condition": { "type": "string", "enum": ["CONDITION_A_RAW", "CONDITION_B_JALRAKSHAK"] },
        "task_id": { "type": "string" },
        "start_iso": { "type": "string", "format": "date-time" },
        "end_iso": { "type": "string", "format": "date-time" },
        "duration_seconds": { "type": "number", "minimum": 0 },
        "raw_response": {
          "type": "object",
          "properties": {
            "status_selected": { "type": "string" },
            "deadline_entered": { "type": "string" },
            "limiting_segment_entered": { "type": "string" },
            "reason_text": { "type": "string" },
            "alternative_selected": { "type": "string" },
            "scenario_delta_selected": { "type": "string" },
            "limitations_selected": { "type": "array", "items": { "type": "string" } }
          }
        },
        "scores": {
          "type": "object",
          "properties": {
            "status_correct": { "type": "integer", "enum": [0, 1] },
            "deadline_correct": { "type": "integer", "enum": [0, 1] },
            "limiting_segment_correct": { "type": "integer", "enum": [0, 1] },
            "explanation_score": { "type": "integer", "enum": [0, 1, 2] },
            "alternative_correct": { "type": "integer", "enum": [0, 1] },
            "scenario_delta_correct": { "type": "integer", "enum": [0, 1] },
            "limitation_awareness_score": { "type": "integer", "enum": [0, 1] },
            "misinterpreted_as_safety": { "type": "boolean" }
          }
        }
      }
    },
    "QualitativeFeedback": {
      "type": "object",
      "properties": {
        "easiest_to_find": { "type": "string" },
        "hardest_to_find": { "type": "string" },
        "confusing_elements": { "type": "string" },
        "perceived_overconfidence": { "type": "string" },
        "general_comments": { "type": "string" }
      }
    }
  }
}
```

---

## 3. Flat CSV Schema (`gate5b_trials_export.csv`)

| Column Name | Type | Description |
|:---|:---|:---|
| `participant_id` | String | e.g. `P001` |
| `participant_category` | String | e.g. `STUDENT_CIVIL_HYDRAULIC` |
| `condition` | String | `CONDITION_A_RAW` or `CONDITION_B_JALRAKSHAK` |
| `task_id` | String | `TASK_01` through `TASK_07` |
| `duration_seconds` | Float | Measured task elapsed time in seconds |
| `status_correct` | Integer (0/1) | Route feasibility classification score |
| `deadline_correct` | Integer (0/1) | Departure deadline numerical score |
| `limiting_segment_correct`| Integer (0/1) | Constraining segment identification score |
| `explanation_score` | Integer (0/1/2)| Causal explanation rubric score |
| `limitation_awareness` | Integer (0/1) | Epistemic awareness score |
| `misinterpreted_as_safety`| Boolean | Critical safety check flag |
