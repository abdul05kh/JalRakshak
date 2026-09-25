# 05 — Language Simplification Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Plain Language & Emergency Jargon Elimination  
**Status:** PASS  

---

## 1. Terminology Substitution Ledger

| Technical / Engineering Term | Replaced With (Primary UI) | Secondary Detailed Term (Drawers) | Reason for Simplification |
| :--- | :--- | :--- | :--- |
| *Road-Coupled Hydraulic Inundation Arrival Time ($T_{\text{arr}}$)* | **"Flood reaches route"** | Hydraulic arrival time ($h > 0.3\text{ m}$) | Eliminates numerical modeling jargon |
| *Latest Feasible Evacuation Departure Time ($T_{\text{dep}}$)* | **"LEAVE BY"** | Latest feasible departure under model rules | Direct operational instruction verb |
| *Critical Bottleneck Road Edge* | **"Limiting part of route"** | LineString Corridor Limiting Segment | Plain English phrasing |
| *Cumulative Network Edge Traversal Duration* | **"Travel time"** | Segment cumulative travel time | Clear, non-academic wording |
| *Configured Evacuation Contingency Delta* | **"Safety buffer"** | Configured safety buffer | Direct operational understanding |

---

## 2. Scientific Precision Preservation
All rigorous scientific definitions are retained in the `[PROVENANCE]` and `[ASSUMPTIONS]` drawers so that technical reviewers and engineers can audit the exact mathematical formulation.
