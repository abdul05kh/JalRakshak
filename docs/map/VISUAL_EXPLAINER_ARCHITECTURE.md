# Visual Explainer Architecture

**Project:** JalRakshak Emergency Decision-Support System  
**Date:** 2026-09-25  

---

## 1. The 7 Interactive Scenario-Aware Explainers

| Explainer ID | Title | Visual Presentation | Data Binding |
| :--- | :--- | :--- | :--- |
| **EXP-01** | **Flood Simulation** | Dam breach $\rightarrow$ hydraulic wave propagation $\rightarrow$ WSE/depth | Active scenario $Q_p$ & duration |
| **EXP-02** | **Road Coupling** | 150m LineString corridor & $\le 50\text{ m}$ densification sampling | Road segment coordinates & buffer |
| **EXP-03** | **Evacuation Window** | Arithmetic subtraction: Arrival - Travel - Buffer = Deadline | $60:00 - 12:39 - 03:00 = 44:21$ |
| **EXP-04** | **Limiting Segment** | Multi-edge traversal chart highlighting $\arg\min$ bottleneck | Segment $R02$ contribution |
| **EXP-05** | **Scenario Comparison** | Matrix comparing MINIMUM, CENTRAL, and MAXIMUM deadlines | 28.5k, 65k, 115k m³/s parameters |
| **EXP-06** | **Validation Pipeline** | Flowchart showing Computational Passed vs Human Pending | 136/136 tests & pilot readiness |
| **EXP-07** | **Provenance Lineage** | Cryptographic hash & DEM/HEC-RAS provenance chain | HDF5 SHA-256 hash & CRS EPSG:32644 |
