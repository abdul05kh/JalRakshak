# Map Precision & Coordinate Systems

**Project:** JalRakshak Emergency Decision-Support System  
**CRS Standard:** UTM Zone 44N (EPSG:32644) Projected / WGS 84 (EPSG:4326) Display  
**Date:** 2026-09-25  

---

## 1. Precision Safeguards
- Metric calculations use EPSG:32644 (Cartesian coordinates in meters) to ensure exact perpendicular distance measurements.
- Web mapping uses standard EPSG:4326 / EPSG:3857 coordinates with precision preserved to 6 decimal places ($< 0.1\text{ m}$).
- No arbitrary datum offsets or unverified shifts are applied.
