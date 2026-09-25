# Map Interaction Specification

**Project:** JalRakshak Emergency Decision-Support System  
**Date:** 2026-09-25  

---

## 1. Primary Interactions

1. **Scenario Selection:** Switching scenario reloads the flood extent, updates departure deadlines atomically, and refreshes the timeline.
2. **Route Selection:** Clicking an alternate path or changing dropdown zooms to the corridor and highlights its limiting segment.
3. **Timeline Slider:** Scrubbing or stepping through $T+00 \dots T+90$ dynamically renders flood propagation without page reloads.
4. **Limiting Segment Click:** Clicking on the limiting segment (or the card indicator) zooms into the segment and opens the causal explanation.
5. **Point Inspection:** Clicking anywhere on the inundated zone opens a popup with exact arrival time, depth, and velocity.
