# Intelligent Routing & Decision Support Specification

**Author / Maintainer:** Mohammed Numan ([@mohammednumaan716](https://github.com/mohammednumaan716))  
**Role:** AI Engineer  
**Project:** JalRakshak — Decision Support System for Dam-Break Flood Evacuation

---

## 1. Objective
This specification outlines the algorithmic and AI/ML research foundations of the JalRakshak evacuation routing engine and deterministic decision-making rules.

---

## 2. Multi-Criteria Route Optimization Framework
The routing pipeline evaluates candidate evacuation corridors based on 4 key metrics:
1. **Dynamic Flood Inundation Margin:** $\Delta t_{\text{margin}} = t_{\text{arrival}} - t_{\text{clearance}}$
2. **Terrain Slope & Elevation Safety:** Preferential routing along ascending ridge contours away from valley floors.
3. **Road Quality & Roadway Classification:** Primary highway throughput vs. secondary mountain pass risk.
4. **Bottleneck Vulnerability:** Penalizing low-lying culverts and bridges susceptible to flash overtopping.

---

## 3. Evacuation Window Efficiency (EWE) Decision Boundary
The system classifies road segments into 3 deterministic operational states:
- **GREEN (SAFE):** $\text{EWE} \ge 1.0$ (Flood wave arrives well after total evacuation clearance).
- **AMBER (CAUTION):** $0.0 \le \text{EWE} < 1.0$ (Marginal safety buffer; active monitoring required).
- **RED (IMPASSABLE / EVACUATE NOW):** $\text{EWE} < 0.0$ or $h \ge 0.30\text{ m}$ (Wave overtopping imminent or in progress).

---

## 4. Future AI/ML Surrogate Modeling Roadmap
- Physics-informed neural operators (PINO) to accelerate 2D shallow water equation surrogate predictions during real-time telemetry streaming.
- Reinforcement learning agents for dynamic vehicle dispatch during multi-nodal mass evacuations.
