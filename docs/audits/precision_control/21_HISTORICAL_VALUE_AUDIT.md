# 21 — Historical Deprecated Value Classification Audit
**Audit Date:** 2026-09-24  
**Audit Purpose:** Comprehensive repository search and classification of historical and deprecated scenario values (`15000`, `28400`, `64200`, `14100`, `90000`).  

---

## 1. Classification Ledger

| Value Searched | Location Found | Forensic Classification | Risk Assessment | Mitigation / Status |
| :--- | :--- | :--- | :--- | :--- |
| **`15000`** | `scratch/` & early docs | `HISTORICAL` | ZERO (Scratch files only) | Excluded from active imports |
| **`28400`** | `data/scenarios/scen-tehri-001/` | `TEST FIXTURE` | LOW (Legacy test fixture) | Tagged as `SYNTHETIC_TEST_FIXTURE` |
| **`64200`** | `data/scenarios/scen-tehri-002/` | `TEST FIXTURE` | LOW (Legacy test fixture) | Tagged as `SYNTHETIC_TEST_FIXTURE` |
| **`14100`** | `data/scenarios/scen-tehri-003/` | `TEST FIXTURE` | LOW (Legacy test fixture) | Tagged as `SYNTHETIC_TEST_FIXTURE` |
| **`90000`** | Early markdown drafts | `HISTORICAL` | ZERO (Documentation only) | Replaced with authoritative $115,000\text{ m}^3/\text{s}$ |

---

## 2. Production Safety Confirmation
- **Authoritative active scenarios:** Strictly use $28,500\text{ m}^3/\text{s}$ (Minimum), $65,000\text{ m}^3/\text{s}$ (Central), and $115,000\text{ m}^3/\text{s}$ (Maximum).
- **Dangerous production use:** **0 occurrences**. No deprecated values reach active decision-making pathways.
