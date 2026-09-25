# JALRAKSHAK — GATE 5B PRE-TEST COMPREHENSION CHECK
**Pre-Task Participant Understanding Instrument**
**Purpose:** Identify baseline cognitive or conceptual misunderstandings before experimental trials.

---

## 1. Protocol Notice
This comprehension check is administered to all participants immediately after the standard 3-minute briefing and **prior to beginning Task 01**. 

> **Important Scientific Rule:** This instrument is NOT scored as a measure of JalRakshak system performance or superiority. Its sole purpose is diagnostic: to detect whether an error during the experimental tasks was caused by interface friction versus a fundamental misunderstanding of core hydraulic decision concepts.

---

## 2. Comprehension Check Instrument

### Question 1: Flood Inundation Arrival Time
**Prompt:** When the simulation indicates that flood water arrives at a road segment at $T+60\text{ min}$, what does this mean?
- [ ] **A.** The entire evacuation route is completely submerged at $T+60\text{ min}$.
- [ ] **B.** Flood depth at that specific road segment first reaches or exceeds the configured hazard threshold ($0.30\text{ m}$) at 60 minutes after scenario activation. *(Correct)*
- [ ] **C.** Evacuation vehicles will reach the emergency shelter at $T+60\text{ min}$.
- [ ] **D.** The dam breach starts at $T+60\text{ min}$.

---

### Question 2: Road Travel Time
**Prompt:** If a route is $10.54\text{ km}$ long with an assumed traversal speed of $50\text{ km/h}$, producing a travel time of $12.65\text{ min}$, what does this travel time represent?
- [ ] **A.** Real-time live GPS traffic time with road congestion sensors.
- [ ] **B.** The static calculated duration required for a vehicle to traverse the route from start to finish under baseline assumed speeds. *(Correct)*
- [ ] **C.** The maximum time flood water takes to reach the road.
- [ ] **D.** The safety buffer required by civil defense rules.

---

### Question 3: Operational Safety Buffer
**Prompt:** Why does the decision engine include an operational safety buffer (e.g., $3.0\text{ min}$)?
- [ ] **A.** To guarantee that no physical water ever touches the vehicle under any possible circumstance.
- [ ] **B.** To account for operational uncertainty, vehicle boarding delays, and reaction margins before flood arrival. *(Correct)*
- [ ] **C.** Because HEC-RAS calculations are always off by exactly 3 minutes.
- [ ] **D.** To slow down vehicle traffic during evacuation.

---

### Question 4: Feasible vs. Safe
**Prompt:** If JalRakshak or an analyst marks a route as `FEASIBLE`, does this mean the route is `GUARANTEED SAFE`?
- [ ] **A.** Yes, `FEASIBLE` is identical to `SAFE` and guarantees absolute physical safety for all citizens.
- [ ] **B.** No. `FEASIBLE` strictly means the route satisfies the computational constraints (departure time + travel time + buffer $\le$ flood arrival time) under the modeled scenario assumptions; it is not an absolute physical safety guarantee. *(Correct)*
- [ ] **C.** Yes, because the HEC-RAS model is 100% field calibrated.
- [ ] **D.** No, because all evacuation routes are dangerous.

---

## 3. Recording and Diagnostic Schema

Participant responses are recorded in the session metadata:
```json
{
  "participant_id": "P01",
  "comprehension_check": {
    "q1_arrival_time": "B",
    "q2_travel_time": "B",
    "q3_safety_buffer": "B",
    "q4_feasible_not_safe": "B",
    "all_correct": true,
    "misconceptions_flagged": []
  }
}
```

If a participant selects **Option A** for Question 4 (confusing `FEASIBLE` with `SAFE`), the study proctor immediately provides standard clarification:
> *"Notice: In this experiment, 'FEASIBLE' indicates mathematical compliance with simulated timelines, not a physical real-world safety guarantee."*
