# 20 — UI & Protocol Version Freeze Audit
**Audit Date:** 2026-09-24  
**Audit Purpose:** Establish version lock across protocol, scoring, UI, scenario manifests, and baseline ground truth prior to human dry-run administration.  

---

## 1. Version Identifiers & Cryptographic Hashes

| Subsystem / Artifact | Version Tag | Cryptographic Digest (SHA-256) | Status |
| :--- | :--- | :--- | :--- |
| **Experimental Protocol** | `2.1.0-gate5b-precision` | Pre-registered in `gate5b_harness.py` | **FROZEN** |
| **Scoring Engine** | `2.1.0-gate5b-precision` | Pre-registered in `Gate5BScorer` | **FROZEN** |
| **Frontend UI Build** | `2.1.0-gate5b-precision` | Compiled Vite bundle in `frontend/dist/` | **FROZEN** |
| **Ground Truth Constants** | `GATE_5A_LOCKED` | `d7e163471df7318ff2473ff4d209cba152636e7681...` | **FROZEN** |
| **Central Scenario HDF5** | `HECRAS_7.0.1_2D` | `c0b18e0416697757e4733bae120217e5222aed7268...` | **FROZEN** |
| **Minimum Scenario HDF5** | `HECRAS_7.0.1_2D` | `a2d2a712bb25fe45ee2e58ac1e0fdfd03bc2b38c11...` | **FROZEN** |
| **Maximum Scenario HDF5** | `HECRAS_7.0.1_2D` | `ec55249275044a1f04cd9c4ccc9a934b9fa58d8e68...` | **FROZEN** |

---

## 2. Freeze Policy
No code, scoring rules, task wording, or hydraulic artifacts may be modified during pilot data collection without updating the protocol version tag and generating a superseding audit ledger.
