# JalRakshak — Antigravity Engineering Pack
## SIH26161 / Dam-break flood decision support

### What this pack is
This is the build contract for the JalRakshak prototype. It is intentionally stricter than a normal hackathon PRD because the product sits between hydraulic simulation and emergency decision support.

**Flagship workflow:** `Scenario → Hydraulic result → Flood arrival clock → Evacuation route deadline → Explainable decision`.

The product is **not** a replacement for HEC-RAS or another hydraulic solver. The hydraulic solver remains the physics engine. JalRakshak is the orchestration, interpretation, validation, GIS integration, route-feasibility and decision-support layer around it.

### Non-negotiable product truth
Do not demo a pretty flood map and call it innovation. A judge can get a flood map from established hydraulic/GIS software. The product must visibly answer:

> **Where is water going, when does it arrive, which routes remain usable, and when does each route stop being safe under this scenario?**

### Prototype priority
1. **P0 — Evacuation Window Engine (EWE):** flagship.
2. **P0 — real hydraulic result ingestion:** required so EWE is physics-grounded.
3. **P0 — arrival-time surface:** required input to EWE.
4. **P1 — scenario comparison:** breach sensitivity.
5. **P1 — exposed assets/population:** consequence context.
6. **P1 — validation report:** scientific trust.
7. **P2 — notifications, accounts, multi-dam scale, live feeds:** blueprint only.

### Repository document map
| File | Purpose |
|---|---|
| 01 | Product strategy and scope |
| 02 | Enterprise PRD |
| 03 | Flagship Evacuation Window Engine |
| 04 | System architecture |
| 05 | Database and ER design |
| 06 | API contracts |
| 07 | Frontend design system |
| 08 | Backend engineering |
| 09 | Hydraulic solver integration |
| 10 | GIS/data pipeline |
| 11 | Scientific validation and QA |
| 12 | Security |
| 13 | Test plan |
| 14 | Implementation plan |
| 15 | Git strategy |
| 16 | Demo strategy |
| 17 | Judge Q&A |
| 18 | Deployment |
| 19 | README |
| 20 | Developer handbook |
| 21 | Mermaid diagrams |
| 22 | Claim/evidence ledger |
| 23 | Acceptance tests |
| 24 | Data dictionary |
| 25 | Antigravity master prompt |
| 26 | UI copy specification |
| 27 | Implementation task board |
| 28 | Six-slide pitch blueprint |

### Definition of prototype done
A reviewer can:
1. select the prepared Indian dam study area;
2. choose a documented breach scenario;
3. see the hydraulic scenario provenance;
4. view inundation/depth/velocity/arrival time;
5. select an origin and evacuation destination;
6. receive route feasibility and a route deadline;
7. see why a route was rejected;
8. compare at least two breach scenarios;
9. open a validation/provenance panel;
10. reproduce the displayed result from the scenario ID and stored artifacts.
