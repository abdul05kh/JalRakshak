# GATE 4 ROAD STATUS RULES
## Deterministic State Classification Architecture for Road Segments

**Document ID:** `DOC-GATE4-ROAD-STATUS-RULES-001`  
**Status:** APPROVED  
**Date:** 2026-09-24  
**Author:** Safety-Critical Software Reviewer & Systems Engineer  

---

## 1. Principle of Deterministic Classification

Road status classification in JalRakshak is strictly deterministic, rule-based, and auditable. 

**Rule:** No AI/LLM model is permitted to infer, predict, modify, or override road status classifications.

---

## 2. Road Status Enum Definitions

The system uses 4 standardized states:

```
                  +-----------------------------------+
                  |             ALL ROADS             |
                  +-----------------------------------+
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
    [ DATA_GAP ]               [ INUNDATED ]             [ AT_RISK ]
Missing hydraulic or      Peak Depth >= H_closure   Peak Depth >= H_warning
road speed data           or Cutoff Violated        within simulation window
           ▲                        ▲                        ▲
           │                        │                        │
           └────────────────────────┴────────────────────────┘
                                    │ (Else)
                                    ▼
                                 [ OPEN ]
                      No threshold crossed in window
```

| Status Code | Display Label | Definition | Numerical Threshold Rule |
| :--- | :--- | :--- | :--- |
| `OPEN` | **Open / Passable** | No configured warning or closure thresholds are crossed during the scenario window. | $d_{\text{peak}} < H_{\text{warning}}$ and $A_e \ge t_{\text{sim\_end}}$ |
| `AT_RISK` | **At Risk / Warning** | Water reaches or is forecast to reach warning threshold, but remains below physical vehicle closure threshold. | $H_{\text{warning}} \le d_{\text{peak}} < H_{\text{closure}}$ |
| `INUNDATED` | **Inundated / Impassable**| Flood conditions exceed vehicle traversability limits ($H_{\text{closure}}$) or flood arrival has occurred prior to clearance. | $d_{\text{peak}} \ge H_{\text{closure}}$ or $D_{\text{edge}} < 0$ |
| `DATA_GAP` | **Data Gap** | Road segment has missing speed, missing geometry, or unmapped hydraulic state preventing verification. | $\text{IsMissing}(\text{Speed}) \lor \text{IsMissing}(\text{Hydraulics})$ |

---

## 3. Configurable Parameter Ledger

| Parameter | Symbol | Default Value | Supported Range | Units | Provenance / Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Flood Warning Threshold** | $H_{\text{warning}}$ | $0.15\text{ m}$ | $[0.05, 0.30]$ | Meters | Wetting/ponding threshold alerting officer to onset. |
| **Road Closure Threshold** | $H_{\text{closure}}$ | $0.30\text{ m}$ | $[0.20, 1.00]$ | Meters | Standard passenger vehicle / light rescue vehicle stalling depth (FEMA / UK EA guidelines). |
| **Max Traversable Velocity** | $v_{\text{closure}}$ | $1.00\text{ m/s}$ | $[0.50, 2.50]$ | $\text{m/s}$ | Hydrodynamic vehicle instability limit ($d \times v \ge 0.3\text{ m}^2/\text{s}$). |
| **Safety Buffer Window** | $B$ | $3.0\text{ min}$ (or $20\text{ min}$) | $[0.0, 60.0]$ | Minutes | Officer operational margin for vehicle delays / traffic. |

---

## 4. Prohibited Terminology

- **`SAFE` is STRICTLY PROHIBITED:** Because the underlying HEC-RAS 2D model is not field-calibrated against historical flood records (`PHYSICAL_VALIDATION = NOT_ESTABLISHED`), declaring a road "SAFE" violates scientific ethics. Roads are designated `OPEN` under the selected scenario assumptions.
- **`GUARANTEED` is STRICTLY PROHIBITED.**
