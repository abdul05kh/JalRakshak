# System Component Architecture & Operational Boundaries

## 1. Operational Decision Engine (`/map`, `/decision`)
- **Authority**: Primary source of truth for disaster response officers.
- **Engine**: Dynamic Dijkstra with exact arrival timestamps ($A_i$), traversal times ($T_i$), and safety buffer ($B=180\text{s}$).
- **Immutable Result**: Route R02 is uniquely safe; departure deadline is strictly **T+44:21**; limiting edge is **R02-E07**.

## 2. Cinematic Simulation Mode (`/simulation`)
- **Role**: Presentation and narrative visualization tool for training, public briefing, and post-event analysis.
- **Media**: Full HD ($1920 \times 1080$ @ 24fps) pre-rendered H.264 video synchronized with HUD clock.
- **Boundary**: Simulation interactions (scrubbing, pause, 2x speed) do **NOT** modify or recompute operational decision parameters.
