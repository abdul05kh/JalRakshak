# 03 — Flagship Feature: Evacuation Window Engine (EWE)

## Core calculation
For route $R = e_1 \dots e_n$:
- $t_{\text{travel}}(e_i)$ = travel time on edge
- $T_i$ = cumulative travel time from origin to edge $i$
- $A_i$ = flood arrival time at edge $i$
- $B$ = safety buffer
- $D$ = departure time

Conservative feasibility condition:
$D + T_i + B < A_i$

Route deadline:
$D_{\text{deadline}} = \min_i (A_i - T_i - B)$

Route is FEASIBLE for departure $D$ iff $D \le D_{\text{deadline}}$ and edge depth/velocity limits are respected.
