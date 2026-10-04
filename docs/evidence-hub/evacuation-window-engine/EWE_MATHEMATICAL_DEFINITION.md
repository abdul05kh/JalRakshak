# Evacuation Window Engine (EWE): Mathematical Formulation

## 1. Primary Formulation
For route $R$ composed of directed edges $e_1, e_2, \dots, e_N$:

- $A_i$: Flood arrival timestamp at edge $e_i$ ($h \ge 0.30\,\text{m}$).
- $T_i$: Cumulative travel time from origin to edge $e_i$ at static speed $v_0 = 50\,\text{km/h}$ ($13.89\,\text{m/s}$).
- $B$: Configured safety buffer (default $180\,\text{s} = 3.0\,\text{min}$).

Candidate departure deadline for edge $e_i$:
$$D_i = A_i - T_i - B$$

Authoritative route departure deadline:
$$D_{\text{deadline}} = \min_{i \in R} (A_i - T_i - B)$$

Limiting road segment (bottleneck):
$$e_{\text{limiting}} = \arg\min_{i \in R} (A_i - T_i - B)$$

Edge-level departure margin for departure at time $D$:
$$M_i(D) = A_i - (D + T_i + B)$$

## 2. Decision Status Rules
- **FEASIBLE:** $D_{\text{deadline}} > 0$ and $M_i(D) \ge 0 \quad \forall i \in R$.
- **LOW_MARGIN:** $0 < D_{\text{deadline}} < B$.
- **INFEASIBLE:** $D_{\text{deadline}} \le 0$.
- **DATA_GAP:** Missing hydraulic field, uncoupled road geometry, or CRS transform error.
- **NO_FEASIBLE_ROUTE:** All candidate routes cut off prior to required travel duration.

*CRITICAL RULE: Status 'SAFE' does not exist in the domain model. FEASIBLE does NOT imply guaranteed physical safety.*
