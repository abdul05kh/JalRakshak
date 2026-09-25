# GATE 5 — HOSTILE JUDGE Q&A DEFENSE PREPARATION

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** COMPLETE & DEFENDED  
**Date:** 2026-09-24  

---

## 1. Core Technical & Operational Defenses

### Q1: "What does HEC-RAS already give you?"
**A:** *"HEC-RAS provides raw 2D hydrodynamic variables: Water Surface Elevation (WSE), derived water depth, and face velocities across computational mesh cells at discrete simulation timesteps. It solves the Shallow Water Equations."*

### Q2: "Why isn't your system just a map on top of HEC-RAS?"
**A:** *"A flood map displays where water is. Route feasibility and departure deadlines are not directly represented as route-level evacuation decisions in the HEC-RAS output used by this implementation. JalRakshak solves an evacuation graph optimization problem: it couples road vector geometry to the 2D mesh, computes cumulative road traversal times, evaluates time-varying flood arrival thresholds, and solves for the latest feasible departure deadline $D_{\text{deadline}} = \min_i(A_i - T_i - B)$."*

### Q3: "How do you calculate evacuation time?"
**A:** *"We use a static engineering travel-time model based on road classification: Primary roads at $40\text{ km/h}$, Secondary roads at $30\text{ km/h}$, and Mountain Tracks at $20\text{ km/h}$. For edge $e_i$, $t_{\text{travel}}(e_i) = \frac{L_i}{v_{\text{class}}}$, and cumulative travel time $T_i = \sum_{k=1}^i t_{\text{travel}}(e_k)$."*

### Q4: "How do you determine the limiting road?"
**A:** *"The Evacuation Window Engine evaluates the clearance constraint for every edge $e_i$ along a path: $D_i = A_i - T_i - B$, where $A_i$ is flood arrival ($h \ge 0.30\text{ m}$), $T_i$ is cumulative travel time to that edge, and $B$ is the safety buffer. The limiting road is the segment that minimizes $D_i$."*

### Q5: "Why 150 meters corridor buffer?"
**A:** *"In our Gate 4 spatial coupling forensic audit, we found that an unconstrained 1,200m radius erroneously associated distant canyon floor cells ($>450\text{ m}$ away) with mountain ridge roads. A 150m orthogonal buffer around densified road LineStrings ($\Delta s \le 50\text{ m}$) captures the physical road right-of-way while strictly excluding non-intersecting valley depressions."*

### Q6: "Why 3 minutes safety buffer?"
**A:** *"The 3-minute safety buffer is an **OPERATIONAL CONFIGURATION**, not a physical constant. It represents a managerial clearance buffer to account for minor departure hesitations. It is fully configurable ($0–20\text{ min}$) by the incident commander."*

### Q7: "Is the road network complete?"
**A:** *"No. We explicitly classify our road network as a **DEMONSTRATION DATASET** containing 17 representative road segments and 11 key evacuation nodes. Outside this coverage, the system reports a `DATA_GAP` rather than fabricating routes."*

### Q8: "Is this real Tehri operational data?"
**A:** *"The hydraulic model is constructed from official dam geometry (260.5m height, 575m crest length, 830m FRL) and Copernicus 30m DEM terrain, simulated using genuine USACE HEC-RAS 7.0.1. However, real-time SCADA telemetry and operational reservoir control data are not connected."*

### Q9: "Is your model calibrated against real flood events?"
**A:** *"No. There has never been a dam break at Tehri Dam, so historical breach flood calibration is **NOT_ESTABLISHED**. The model is numerically verified with native HEC-RAS volume accounting error $< 0.0001\%$ ($3.23 \times 10^{-6}\%$), but physical real-world validation is explicitly disclaimed."*

### Q10: "Can you guarantee evacuation safety?"
**A:** *"No. Terms like 'GUARANTEED' and 'SAFE' are strictly prohibited in our design contract. We state: 'FEASIBLE UNDER THE SELECTED SCENARIO AND CONFIGURED RULES.' Real-world evacuation is subject to unmodeled traffic jams, panic, debris, and structural damage."*

### Q11: "Why does R02 have more depth than the dam toe?"
**A:** *"Under the selected HEC-RAS configuration, R02 has greater simulated depth ($31.70\text{ m}$) than the dam-toe cell ($27.25\text{ m}$) because its local terrain elevation is substantially lower ($z = 605.5\text{ m}$ vs $814.0\text{ m}$, a $208.5\text{ m}$ elevation drop over $15\text{ km}$) and the simulated water surface remains elevated in the narrow downstream gorge."*

### Q12: "What happens if the hydraulic data is missing?"
**A:** *"The Evacuation Window Engine enforces the rule that UNKNOWN must remain UNKNOWN. Any route with missing hydraulic exposure is assigned status `DATA GAP`, with deadlines set to `null`. It will never default to `FEASIBLE`."*

### Q13: "What happens if the primary route becomes infeasible?"
**A:** *"The engine computes $k$-shortest simple paths. If the primary valley route becomes `INFEASIBLE`, the system automatically surfaces and evaluates alternative paths (e.g. Route B high-ground ridge bypass) with their individual departure deadlines."*

### Q14: "Can your system work without AI?"
**A:** *"Yes. 100% of the core decision logic—hydraulic coupling, travel time calculation, EWE deadline optimization, status classification, and causal explanations—is purely deterministic and rule-based. AI is only used as an optional assistant for natural-language summarization."*

### Q15: "What exactly is AI contributing?"
**A:** *"AI provides conversational assistance and executive briefing generation for the operator. It operates strictly downstream of the deterministic decision object and is mathematically barred from altering any numerical deadline, margin, or route feasibility status."*
