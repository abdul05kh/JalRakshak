# 05 — Task Comprehension Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Standardized 7-Task Battery Specification  
**Status:** PASS  

---

## 1. Frozen 7-Task Battery Specification

| Task ID | Task Question | Evaluation Criterion | Allowed Tolerance |
| :--- | :--- | :--- | :--- |
| **TASK_01** | "Under the selected flood scenario, can this route be used under the configured assumptions?" | Participant identifies `FEASIBLE` status. | Exact match (`FEASIBLE`). |
| **TASK_02** | "What is the latest feasible time to leave?" | Participant identifies departure deadline (`T+44:21`). | $\pm 30\text{ s}$ or exact match. |
| **TASK_03** | "Which segment of the route controls the departure deadline?" | Participant identifies limiting segment `R02`. | Exact match (`R02`). |
| **TASK_04** | "Why is that segment limiting?" | Participant identifies arithmetic breakdown: Arrival $60\text{m} - \text{Travel } 12.65\text{m} - \text{Buffer } 3\text{m}$. | Logical identification of triad components. |
| **TASK_05** | "What changes if the flood scenario becomes more severe?" | Participant identifies earlier flood arrival and earlier departure deadline. | Correct direction of change. |
| **TASK_06** | "Switch scenario to MAXIMUM. What is the updated departure deadline?" | Participant switches to MAXIMUM and extracts `T+29:21`. | $\pm 30\text{ s}$ or exact match. |
| **TASK_07** | "What assumptions or limitations should you consider before acting on this result?" | Participant discovers static 50 km/h speed, no dynamic traffic modeling, 150m corridor. | Identifies $\ge 2$ valid limitations. |
