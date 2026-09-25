# TEHRI RESERVOIR ELEVATION & HYDRAULIC HEAD RECONCILIATION
**Document ID:** DOC-TEHRI-G3-07 (REV-3 FINAL FORENSIC CLOSURE)  
**Project Stage:** Gate 3A Forensic Closure  
**Status:** `RESERVOIR_INITIAL_CONDITION = NOT_SCIENTIFICALLY_LOCKED`  
**Date:** 2026-09-24  

---

## 1. Reservoir Storage & Elevation Reconciliation

```
+-----------------------------------------------------------------------------------------+
| MANDATORY SCIENTIFIC FORMULATION:                                                       |
|                                                                                         |
| "Gross storage = 3,540 MCM, source-derived from THDC. Exact stage-storage relationship  |
| at the selected initial WSE is not established."                                        |
+-----------------------------------------------------------------------------------------+
```

### Elevation Benchmarks vs Breach Invert (EL 635.0 m [ENGINEERING_ASSUMPTION]):

| Stage / Reference Level | Elevation (m) | Hydraulic Head ($h_w$) Above Invert 635 m | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Full Reservoir Level (FRL)** | 830.00 m | $\mathbf{195.00\text{ m}}$ | SOURCE_DERIVED (THDC) | Normal conservation pool level |
| **Maximum Water Level (MWL)** | 835.00 m | $\mathbf{200.00\text{ m}}$ | SOURCE_DERIVED (THDC) | Design surcharge level during PMF routing |
| **Dam Crest Elevation** | 839.50 m | $\mathbf{204.50\text{ m}}$ | SOURCE_DERIVED (THDC) | Top of rockfill embankment crown |
| **Breach Invert Level** | 635.00 m | $0.00\text{ m}$ | ENGINEERING_ASSUMPTION | Assumed breach floor above riverbed |
| **Riverbed Invert (DEM)** | 617.50 m | $-17.50\text{ m}$ | MEASURED (Copernicus DSM) | Minimum raw canyon surface elevation |
| **Dam Foundation Base** | 579.00 m | $-56.00\text{ m}$ | SOURCE_DERIVED (THDC) | $839.5\text{ m} - 260.5\text{ m}$ structural height |

> [!CRITICAL]
> **Anti-Conflation Rule:** $h_w = 205.0\text{ m}$ (or $204.5\text{ m}$) represents an **extreme dam crest overtopping scenario**, NOT normal Full Reservoir Level ($830.0\text{ m}$). For all future FRL-initiated piping simulations, $h_w = 195.0\text{ m}$ must be used strictly.

---

## 2. Unresolved Scientific Parameters (Prerequisites for Gate 3B)

1. **Benchmark Tie:** Survey of India / THDC GTS benchmark elevation (839.5 m) must be geodetically tied to EGM2008 / WGS84 vertical datum.
2. **Stage-Storage Curve:** High-resolution elevation-area-capacity table for Tehri Reservoir must be obtained or reconstructed via hydro-flattened DEM contours before dynamic reservoir volume depletion can be locked.
