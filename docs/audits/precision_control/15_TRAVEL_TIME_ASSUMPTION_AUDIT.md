# 15 — Travel-Time Assumption Disclosure & Boundary Audit
**Audit Date:** 2026-09-24  
**Assumed Value:** Static $50.0\text{ km/h}$ engineering baseline speed  

---

## 1. Travel-Time Model Classification
The travel-time model in JalRakshak is classified strictly as an **`ASSUMED`** engineering parameter, not an empirical traffic simulation:
- **Vehicle Speed:** $50\text{ km/h}$ ($13.89\text{ m/s}$)
- **Route Traversal Calculation:**
  $$T_i = \sum_{e \in \text{edges to } i} \frac{\text{length}_e}{\text{speed}_e}$$
  $$\text{Route 1 (10,527 m)} \implies T = \frac{10527}{13.889} = 759.24\text{ s } (12\text{ min } 39\text{ s})$$

---

## 2. Progressive Disclosure of Limitations
The system explicitly discloses in the Provenance Drawer:
1. **Static Speed Baseline:** Dynamic traffic congestion, vehicle mix, road capacity breakdown, and panic bottlenecks are NOT modeled in the baseline prototype.
2. **Operational Impact:** If actual evacuation traffic moves at $25\text{ km/h}$ instead of $50\text{ km/h}$, travel time doubles ($25\text{ min } 18\text{ s}$), contracting the departure deadline accordingly.
3. **Epistemic Classification:** Disclosed as a controlled experimental parameter, preventing operators from assuming real-world traffic clearance.
