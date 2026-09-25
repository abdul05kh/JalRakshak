# GATE 4 SAFETY BUFFER & LOW-MARGIN SENSITIVITY REPORT
## Numerical Response to Operational Parameter Variations

**Document ID:** `DOC-GATE4-BUFFER-SENSITIVITY-001`  
**Status:** AUDITED & APPROVED  
**Date:** 2026-09-24  
**Author:** Safety-Critical Software Reviewer & Systems Engineer  

---

## 1. Classification & Scientific Status

```
+---------------------------------------------------------------------------------------------------+
|                           PARAMETER CLASSIFICATION IN GATE 4 LEDGER                               |
|                                                                                                   |
|  SAFETY_BUFFER_MIN (B)      = ENGINEERING_ASSUMPTION / OPERATIONAL_CONFIGURATION                  |
|  LOW_MARGIN_THRESHOLD (M_th)= OPERATIONAL_CONFIGURATION                                           |
+---------------------------------------------------------------------------------------------------+
```

- **Safety Buffer ($B$):** An operational safety factor configured by emergency response protocols to accommodate vehicle startup, boarding delays, and local congestion. It is **not** an inherent hydraulic constant.
- **Low-Margin Threshold ($M_{\text{th}}$):** A threshold separating ample evacuation feasibility from near-deadline urgent conditions. Default is $5.0\text{ min}$.

---

## 2. Safety Buffer Sensitivity Ledger (Central Scenario)

**Evaluated Route:** Malidewal Lowland Village (`N-MALIDEWAL`) $\to$ Koteshwar (`N-KOTESHWAR`) via `R02`  
**Hydraulic Scenario:** `SCENARIO_CENTRAL` (Froehlich piping $Q_p = 65,000\text{ m}^3/\text{s}$)  
**Flood Arrival on R02:** $t_{\text{arr}} = 3,600\text{ s}$ ($60.0\text{ min}$ from start)  
**Road Traversal Time ($T_i$):** $12.65\text{ min}$ ($759.0\text{ s}$)  
**Baseline Decision Time:** $2026-09-24\text{T}00:00:00\text{Z}$  

| Configured Safety Buffer ($B$) | Traversal + Buffer Req. ($T_i + B$) | Departure Deadline ($D_{\text{deadline}}$) | Remaining Margin ($M$) | Limiting Road Segment | Feasibility Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **$0.0\text{ min}$ ($0\text{ s}$)** | $12.65\text{ min}$ | `2026-09-24T00:47:21Z` | $47.4\text{ min}$ | `R02` | `FEASIBLE` |
| **$3.0\text{ min}$ ($180\text{ s}$, Default)**| $15.65\text{ min}$ | `2026-09-24T00:44:21Z` | $44.4\text{ min}$ | `R02` | `FEASIBLE` |
| **$5.0\text{ min}$ ($300\text{ s}$)** | $17.65\text{ min}$ | `2026-09-24T00:42:21Z` | $42.4\text{ min}$ | `R02` | `FEASIBLE` |
| **$10.0\text{ min}$ ($600\text{ s}$)** | $22.65\text{ min}$ | `2026-09-24T00:37:21Z` | $37.4\text{ min}$ | `R02` | `FEASIBLE` |
| **$15.0\text{ min}$ ($900\text{ s}$)** | $27.65\text{ min}$ | `2026-09-24T00:32:21Z` | $32.4\text{ min}$ | `R02` | `FEASIBLE` |
| **$20.0\text{ min}$ ($1200\text{ s}$)**| $32.65\text{ min}$ | `2026-09-24T00:27:21Z` | $27.4\text{ min}$ | `R02` | `FEASIBLE` |

### Sensitivity Equation:
$$\frac{\partial D_{\text{deadline}}}{\partial B} = -1.0 \quad \left(\text{Strictly linear } 1:1 \text{ contraction of departure deadline}\right)$$

---

## 3. Departure Near Cutoff Sensitivity ($D_{\text{dep}} = 00:40:00\text{ UTC}$)

To demonstrate how the safety buffer impacts emergency officer decisions when departure occurs $40\text{ min}$ after scenario alert:

| Configured Buffer ($B$) | Departure Time | Deadline ($D_{\text{deadline}}$) | Margin ($M = D_{\text{deadline}} - D_{\text{dep}}$) | Resulting Officer Status |
| :--- | :--- | :--- | :--- | :--- |
| **$0.0\text{ min}$** | $00:40:00\text{ UTC}$ | $00:47:21\text{ UTC}$ | $+7.4\text{ min}$ | `FEASIBLE` (Clear) |
| **$3.0\text{ min}$** | $00:40:00\text{ UTC}$ | $00:44:21\text{ UTC}$ | $+4.4\text{ min}$ | `LOW MARGIN` (Caution) |
| **$5.0\text{ min}$** | $00:40:00\text{ UTC}$ | $00:42:21\text{ UTC}$ | $+2.4\text{ min}$ | `LOW MARGIN` (Urgent) |
| **$10.0\text{ min}$**| $00:40:00\text{ UTC}$ | $00:37:21\text{ UTC}$ | $-2.6\text{ min}$ | `INFEASIBLE` (Closed) |

---

## 4. Low-Margin Threshold Sensitivity ($M_{\text{threshold}}$)

The boundary separating `FEASIBLE` from `LOW MARGIN` is an operational configuration:

| Tested Threshold | Rule Definition | Operational Behavior | Recommendation |
| :--- | :--- | :--- | :--- |
| **$2.0\text{ min}$** | Alert when margin $\le 2\text{ min}$ | High operational tolerance; minimal warning before cutoff. | High-risk urban convoy setting |
| **$5.0\text{ min}$ (Default)**| Alert when margin $\le 5\text{ min}$ | Standard balanced alert window for vehicle dispatch. | **Recommended Baseline** |
| **$10.0\text{ min}$**| Alert when margin $\le 10\text{ min}$ | Conservative safety policy for mountainous terrain. | Heavy equipment / bus evacuation |
