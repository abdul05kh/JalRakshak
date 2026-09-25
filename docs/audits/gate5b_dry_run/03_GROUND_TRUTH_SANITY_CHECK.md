# GATE 5B TECHNICAL DRY RUN — GROUND TRUTH SANITY CHECK
**Document ID:** `03_GROUND_TRUTH_SANITY_CHECK.md`
**Timestamp:** 2026-09-24T18:40:25+05:30 (Local)
**Scope:** Independent Mathematical Sanity Check of All Ground-Truth Formulas

---

## 1. Mathematical Ground-Truth Chain

For Route 1 (Malidewal $\to$ Koteshwar, Length $= 7,377.4\text{ m}$ for R02, $v = 35\text{ km/h}$, $T_{\text{travel}} = 12.65\text{ min} = 759\text{ s}$, Buffer $= 3.0\text{ min} = 180\text{ s}$):

### Core Equation:
$$D_{\text{deadline}} = \min_{i} \left( A_i - T_{\text{cum}, i} - B \right)$$

---

## 2. Independent Evaluation Across All Scenarios

| Scenario | Prescribed $Q_p$ | Arrival at R02 ($A_{\text{R02}}$) | Travel Time ($T_{\text{travel}}$) | Buffer ($B$) | Arithmetic Calculation ($A - T - B$) | Recomputed Result | Frozen Ground Truth | Sanity Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **`SCENARIO_MINIMUM`** | $28,500\text{ m}^3/\text{s}$ | $5,700\text{ s}$ ($95.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | $5700 - 759 - 180 = 4761\text{ s}$ | $T+79\text{ min } 21\text{ sec}$ | $T+79\text{ min } 21\text{ sec}$ | ✅ **EXACT MATCH** |
| **`SCENARIO_CENTRAL`** | $65,000\text{ m}^3/\text{s}$ | $3,600\text{ s}$ ($60.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | $3600 - 759 - 180 = 2661\text{ s}$ | $T+44\text{ min } 21\text{ sec}$ | $T+44\text{ min } 21\text{ sec}$ | ✅ **EXACT MATCH** |
| **`SCENARIO_MAXIMUM`** | $115,000\text{ m}^3/\text{s}$ | $2,700\text{ s}$ ($45.0\text{ min}$) | $759\text{ s}$ ($12.65\text{ min}$) | $180\text{ s}$ ($3.0\text{ min}$) | $2700 - 759 - 180 = 1761\text{ s}$ | $T+29\text{ min } 21\text{ sec}$ | $T+29\text{ min } 21\text{ sec}$ | ✅ **EXACT MATCH** |

---

## 3. Bottleneck Segment Sanity Verification

- Segment `R01`: High ground bypass ($A_{\text{R01}} = 99999\text{ s}$, unaffected).
- Segment `R02`: Lowland valley corridor ($A_{\text{R02}} = 3,600\text{ s}$, limiting deadline $= 2,661\text{ s}$).
- Segment `R03`: High ground ridge bypass ($A_{\text{R03}} = 99999\text{ s}$, unaffected under 150m corridor).
- **Result:** `R02` is unequivocally the earliest time-constrained segment.

---

## 4. Sanity Check Conclusion
The ground truth is mathematically verified, internally consistent, and exactly reproduces all values in the frozen manifest and test harness.
