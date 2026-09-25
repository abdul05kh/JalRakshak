# JalRakshak — Scientific Language & Terminology Audit
**Status:** COMPLETE & REMEDIATED

---

## 1. Forbidden vs. Permitted Scientific Language

| Forbidden Term / Claim | Reason for Prohibition | Approved Replacement | Action Taken |
| :--- | :--- | :--- | :--- |
| **"99% Accurate" / "100% Accurate"** | Unsubstantiated percentage claim without reference dataset or confidence interval. | "Modelled", "Source-derived", "Software-verified" | Stripped across all backend docstrings, frontend labels, and docs. |
| **"Safe Route" / "Safe Shelter"** | Hydraulics cannot guarantee absolute safety; conditions evolve dynamically. | "Feasible Route under configured scenario", "Evacuation Shelter" | Renamed UI badges and labels to "FEASIBLE" / "Evacuation Shelter". |
| **"Calibrated"** | No gauge water elevation records or discharge calibrations were fitted. | "Demonstration Scenario / Uncalibrated Simulation" | Removed "calibrated" from scenario descriptions and UI. |
| **"Sentinel-1 IoU = 0.874"** | No raw SAR raster product was processed to compute this metric. | "NOT RUN (Empirical validation not established)" | Updated validation service to explicitly report "N/A" and "NOT RUN". |
| **"SHA-256 Validated"** | Cryptographic hashing validates file integrity, not hydraulic physics. | "Artifact Integrity (SHA-256 Checksum)" | Clarified across UI drawer and API response headers. |
| **"Guaranteed Evacuation Window"** | Real evacuation depends on traffic, debris, and human behavior. | "Model-derived Evacuation Feasibility Window" | Rewritten in all decision explanations. |

---

## 2. Conclusion

All 28 documentation files, UI components, domain models, and API endpoints comply with the strict terminology standard.
