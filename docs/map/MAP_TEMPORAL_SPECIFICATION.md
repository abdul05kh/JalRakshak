# Map Temporal Specification

**Project:** JalRakshak Emergency Decision-Support System  
**Timeline Range:** $T+00\text{m}$ to $T+90\text{m}$ (Discrete 15-minute intervals)  
**Date:** 2026-09-25  

---

## 1. Discrete Timestep Schema

| Timestep | Simulation Elapsed (s) | Central Scenario Status | Affected Road Segments |
| :--- | :--- | :--- | :--- |
| **T+00** | $0\text{ s}$ | Dam intact / Breach initiated | None |
| **T+15** | $900\text{ s}$ | Flood entering upper canyon | Upstream gorge roads |
| **T+30** | $1800\text{ s}$ | Inundation propagating toward Malidewal | Near-channel roads |
| **T+45** | $2700\text{ s}$ | Flood approaching R02 corridor | Maximum scenario breached |
| **T+60** | $3600\text{ s}$ | **Flood breaches R02 corridor (Arrival)** | **R02 breached** |
| **T+75** | $4500\text{ s}$ | Downstream propagation toward Koteshwar | R02 & downstream breached |
| **T+90** | $5400\text{ s}$ | Wide valley inundation | Multiple routes inundated |
