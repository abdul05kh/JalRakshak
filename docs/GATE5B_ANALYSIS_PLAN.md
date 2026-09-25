# GATE 5B — PRE-REGISTERED ANALYSIS PLAN

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** PRE-REGISTERED ANALYSIS PLAN  
**Date:** 2026-09-24  

---

## 1. Statistical Policy for Small Sample ($N = 3 \text{ to } 5$)

Because the target exploratory cohort is $N = 3 \text{ to } 5$ technical participants:
1. **Descriptive Statistics Only:** Analysis must report medians, means, ranges, and absolute accuracy rates ($k/N$).
2. **No Null-Hypothesis Significance Testing (NHST):** No $p$-values, ANOVA tables, or parametric confidence intervals shall be computed, as they are statistically ungrounded for $N < 10$.
3. **No Generalization Claims:** Results shall strictly describe the observed performance of the tested cohort without extrapolating to all emergency personnel.

---

## 2. Primary Metrics & Aggregation Rules

### 2.1 Decision Accuracy ($Acc$)
$$Acc = \frac{\sum_{i=1}^N \text{Score}_i}{N} \times 100\%$$
Reported separately for Route Feasibility ($M_1$), Deadline Accuracy ($M_2$), and Limiting Segment Identification ($M_3$).

### 2.2 Decision Time ($t_{\text{dec}}$)
- **Primary Central Tendency:** Median completion time (seconds).
- **Dispersion:** Interquartile range (IQR) or Min–Max range.
- **Handling of Incomplete Tasks:** If a participant abandons a task or exceeds a 15-minute timeout, the task is marked `INCOMPLETE` ($Acc = 0$, duration capped at $900\text{ s}$ and flagged).

### 2.3 Causal Explanation Score ($S_{\text{exp}}$)
- Mean score across participants on a $0 - 2$ scale based on the pre-registered rubric.

### 2.4 Limitation Awareness Rate ($R_{\text{limit}}$)
- Proportion of trials in which participants correctly identify uncalibrated model boundaries.

### 2.5 Safety Misinterpretation Rate ($R_{\text{danger}}$)
- Number of instances where `FEASIBLE` is conflated with `GUARANTEED SAFE`. **Any non-zero count mandates a UI warning redesign.**

---

## 3. Pre-Registered Outcome Classifications

| Outcome Scenario | Observed Performance Pattern | Pre-Registered Scientific Interpretation |
|:---:|:---|:---|
| **OUTCOME A** | Condition B is faster ($t_B < t_A$) with equal or superior accuracy ($Acc_B \ge Acc_A$). | *"Observed reduction in information-search time with preserved decision accuracy in this exploratory cohort."* |
| **OUTCOME B** | Condition B is more accurate ($Acc_B > Acc_A$) but slower ($t_B > t_A$). | *"Improved decision correctness accompanied by increased interaction duration."* |
| **OUTCOME C** | Condition B is faster ($t_B < t_A$) but less accurate ($Acc_B < Acc_A$). | *"Speed-accuracy tradeoff; indicates potential UI over-simplification requiring investigation."* |
| **OUTCOME D** | No measurable difference ($t_B \approx t_A, Acc_B \approx Acc_A$). | *"No observed decision-support benefit over raw presentation in this task set."* |
| **OUTCOME E** | High misinterpretation ($R_{\text{danger}} > 0$). | *"Critical safety-language defect; feasibility conflated with guarantee. Fails safety audit."* |
