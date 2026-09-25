# Operational UI Specification

**Project:** JalRakshak Emergency Decision-Support System  
**Date:** 2026-09-25  

---

## 1. Operational Mode vs Science Mode

### Operational View (Default):
- Dominated by full-screen primary map canvas.
- Calm, docked decision hero card: `✓ FEASIBLE`, `LEAVE BY T+44:21`, timing triad, limiting segment.
- Integrated temporal flood slider ($T+00 \dots T+90$).
- Clean top bar with Scenario and Route selectors.

### Science / Audit View:
- Accessible via top bar mode toggle.
- Comprehensive provenance drawer with HEC-RAS solver version, 2D mesh details, Cartesian CRS (EPSG:32644), DEM lineage, and artifact SHA-256 hashes.
