**JALRAKSHAK — EVACUATION WINDOW ENGINE SPECIFICATION**
JalRakshak SIH'26 — Evidence Hub

# Core mathematics

For edge e_i: T_i = cumulative travel time; A_i = hydraulic arrival time; B = configured buffer. Candidate deadline = A_i − T_i − B. Route deadline = min_i(A_i − T_i − B).
D_deadline = min_i(A_i − T_i − B)

# Feasibility

A proposed departure D satisfies the documented timing condition when D + T_i + B < A_i for every relevant edge. This is a timing condition, not a general safety guarantee.

# Limiting segment

The limiting segment is argmin_i(A_i − T_i − B). It must emerge from backend mathematics, not a UI heuristic.

# Statuses


| Status | Meaning |
| --- | --- |
| FEASIBLE | A valid route exists under selected assumptions and evidence. |
| LOW MARGIN | Route is feasible but computed margin is small. |
| INFEASIBLE | Deadline has passed under the selected scenario/assumptions. |
| DATA GAP | Required hydraulic/route evidence is missing or invalid. |
| NO_FEASIBLE_ROUTE | No route satisfying the decision constraints is available. |


# Software properties

- Later arrival cannot reduce deadline.
- Longer travel cannot increase deadline.
- Larger buffer cannot increase deadline.
- Limiting edge equals mathematical argmin.
- Missing hydraulic evidence cannot silently produce FEASIBLE.
- Identical inputs produce deterministic outputs.

# Language rule

Do not use SAFE/UNSAFE unless an independent safety model defines those terms. FEASIBLE means the documented timing inequality holds under the selected assumptions.
