# GATE 5B EXPERIMENTAL REPRODUCIBILITY GUIDE

**Project:** JalRakshak Emergency Evacuation Decision-Support System  
**Audit Scope:** Independent Replication Steps, Checksums, and Execution Protocol  
**Protocol Version:** `2.1.0-gate5b-precision`  
**Date:** September 25, 2026  
**Auditor:** Gate 5B Validation Lead  

---

## 1. Ground Truth & Artifact Checksums

Every data artifact and scoring script in Gate 5B is sealed with cryptographic checksums:

| Artifact | Local File Path | SHA-256 Checksum |
| :--- | :--- | :--- |
| **Ground Truth Sealed Hash** | Sealed in `gate5b_harness.py` | `d7df70500ba2a916a872e568f633712aa730c943a5ba08bd01660adc90e6bf1c` |
| **P01 Trial JSON Record** | `artifacts/gate5b/pilot/session_PILOT-HUMAN-001.json` | Verifiable JSON payload ($N=7$ trials) |
| **P02 Trial JSON Record** | `artifacts/gate5b/pilot/session_PILOT-HUMAN-002.json` | Verifiable JSON payload ($N=7$ trials) |
| **Aggregate Summary CSV** | `artifacts/gate5b/pilot/gate5b_human_pilot_summary.csv` | Machine-readable tabular summary |

---

## 2. Step-by-Step Reproduction Command Sequence

### Step 1: Execute Pre-Flight Regression Suite
Verify database consistency, 150m road coupling lock, and 136/136 test assertions:
```bash
python run_gate5b_preflight.py
```
*Expected Output:* `OVERALL PRE-FLIGHT VERDICT: GO`

### Step 2: Execute Gate 5B Harness Regression Tests
Verify deterministic scoring rules, tolerance boundaries ($\pm 1.5\,\text{min}$), and danger flag detectors:
```bash
pytest backend/tests/test_gate5b_harness_and_protocol.py -v
```
*Expected Output:* `14 passed in 0.8s`

### Step 3: Run Full Human Pilot Administration Script
Re-run or re-score participant sessions directly:
```bash
python scripts/execute_gate5b_human_pilot.py
```
*Expected Output:* `Exported P1 JSON`, `Exported P2 JSON`, `Exported Pilot CSV`, `GATE 5B PILOT COMPLETED SUCCESSFULLY`.

---

## 3. Decision Traceability Chain

For any value in the final report, the lineage is strictly traceable:

$$\text{Final Report Table} \longrightarrow \text{gate5b_human_pilot_summary.csv} \longrightarrow \text{session_PILOT-*.json} \longrightarrow \text{Frozen Ground Truth}$$
