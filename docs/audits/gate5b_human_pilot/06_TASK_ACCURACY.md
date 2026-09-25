# 06 — Task Accuracy & Ground-Truth Scoring Ledger

**Project:** JalRakshak Emergency Decision-Support System  
**Task Battery:** Frozen 7-Task Protocol  
**Scoring Engine:** Deterministic Independent Offline Scoring Script  
**Status:** **AWAITING LIVE HUMAN TESTING**  

---

## 1. Frozen Ground-Truth & Tolerance Criteria

| Task ID | Question Concept | Frozen Ground Truth (Central R02) | Correctness Criteria |
| :--- | :--- | :--- | :--- |
| **TASK_01** | Feasibility Assessment | `FEASIBLE` | Exact match (`FEASIBLE`). |
| **TASK_02** | Latest Feasible Departure | `T+44:21` (2661s) | Exact match or $\pm 30\text{ s}$ tolerance. |
| **TASK_03** | Limiting Segment Identification | `R02` | Exact match (`R02`). |
| **TASK_04** | Causal Explanation (Why) | Arrival $60\text{m} - \text{Travel } 12.65\text{m} - \text{Buffer } 3\text{m}$ | Correct identification of triad. |
| **TASK_05** | Severity Impact Reasoning | More severe $\rightarrow$ Earlier arrival & earlier departure | Correct qualitative direction. |
| **TASK_06** | Scenario Change (Maximum) | `T+29:21` (1761s) | Exact match or $\pm 30\text{ s}$ tolerance. |
| **TASK_07** | Limitation Awareness | Static 50km/h, 150m corridor, no dynamic traffic | Identifies $\ge 2$ valid limitations. |

---

## 2. Empirical Accuracy Results
*Pending execution with live participants.*
