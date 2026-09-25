# JALRAKSHAK — COUNTERBALANCING & CARRYOVER AUDIT
**Pre-Human Audit Experimental Design Verification**
**Status:** FULLY COUNTERBALANCED & CARRYOVER-CONTROLLED

---

## 1. Carryover Risk Analysis

In a within-subjects experimental design ($A \to B$ vs $B \to A$), asymmetric learning and carryover effects present a major threat to scientific validity:
- **Risk 1 (Scenario Memorization):** A participant who evaluates Route 1 under Condition A and computes that `R02` breaches at $T+60\text{ min}$ might simply remember the answer when transitioning to Condition B without reading the JalRakshak interface.
- **Risk 2 (Abstraction Insight Carryover):** A participant who sees Condition B first learns that "departure deadline = arrival - travel - buffer" and applies that newly acquired formula to Condition A, artificially inflating Condition A performance.

---

## 2. Experimental Controls Implemented

To mitigate carryover effects without completely discarding the high-power within-subjects design, the protocol implements three systematic controls:

### Control 1: Counterbalanced Order Allocation (Latin Square)
Participants are assigned in alternating order:
- **Group 1 (Odd IDs: P01, P03, P05):** Condition A (Raw Hydraulic) $\to$ Condition B (JalRakshak)
- **Group 2 (Even IDs: P02, P04):** Condition B (JalRakshak) $\to$ Condition A (Raw Hydraulic)

### Control 2: Scenario and Route Permutation Across Rounds
To prevent rote memorization of answers:
- **Round 1 (Reference Assessment):** Scenario Central ($Q_p = 65,000\text{ m}^3/\text{s}$), Route 1 (Malidewal $\to$ Koteshwar, $L=10.54\text{ km}$, limiting segment `R02`, deadline $T+44\text{ min } 21\text{ sec}$).
- **Round 2 (Dynamic Re-evaluation):** Scenario Maximum ($Q_p = 115,000\text{ m}^3/\text{s}$), Route 1 (earlier breach at $T+30\text{ min}$, limiting segment `R01`, deadline $T+14\text{ min } 21\text{ sec}$).
- **Round 3 (Alternative Route Optimization):** Scenario Central ($Q_p = 65,000\text{ m}^3/\text{s}$), Route 2 (Tehri Bypass $\to$ Koteshwar Ridge, $L=14.2\text{ km}$, limiting segment `R07`, deadline $T+92\text{ min}$).

*Result:* The participant cannot simply answer "`R02`" or "`44 min 21 sec`" in later trials; each round requires independent reasoning against distinct hydraulic timelines.

### Control 3: Mandatory 5-Minute Cognitive Washout Interval
Between Condition 1 and Condition 2, participants complete a 5-minute unrelated cognitive distractor task (mental arithmetic / spatial puzzle) to clear immediate working memory before starting the second condition.

---

## 3. Carryover Audit Verdict
- **Counterbalancing Status:** ✅ **PASS**
- **Carryover Resistance:** ✅ **HIGH**
- **Methodological Recommendation:** Maintain strict alternation of starting condition across participant IDs.
