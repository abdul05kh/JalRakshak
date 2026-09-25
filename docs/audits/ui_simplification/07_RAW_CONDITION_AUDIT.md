# Raw Hydraulic Condition (Condition A) Structural Audit
**Audit Date:** 2026-09-24  
**Audit Purpose:** Verify that Condition A (raw hydraulic benchmark) remains experimentally authentic, physically truthful, and uncorrupted.  

---

## 1. Objective of Condition A
Condition A represents the current operational baseline available to disaster management authorities: **raw 2D hydrodynamic simulation maps and point probing**.

The goal of the Gate 5B human study is to assess whether presenting raw hydraulic fields requires greater cognitive effort, mental arithmetic, and time compared to the JalRakshak decision-support representation.

---

## 2. Integrity Verification of Condition A

| Feature / Capability | Required State in Condition A | Observed State in Protocol | Compliance |
| :--- | :--- | :--- | :--- |
| **Hydraulic Scenario Selection** | Full access to Minimum, Central, Maximum scenarios | Available in dropdown selector | **PASS** |
| **Inundation Extent Map** | Standard 2D hydrodynamic water depth contour overlay | Visible on Leaflet map canvas | **PASS** |
| **Point Query Probe** | Allows user to click any map coordinate to retrieve arrival time ($s$), depth ($m$), and velocity ($m/s$) | Active click handler returning exact scenario values | **PASS** |
| **Road Network Overlay** | Displays road segments ($R01, R02$) with lengths and class | Visible as background GIS vector | **PASS** |
| **Origins & Shelters** | Origin and destination settlement markers visible | Clear circle markers with elevation tooltips | **PASS** |
| **No Answer Leakage** | NO EWE deadline, NO feasibility badge, NO highlighted bottleneck segment | Decision panel outputs excluded from Condition A view | **PASS** |
| **No Artificial Sabotage** | Condition A map is clear, standard GIS, not blurred or intentionally obscured | Clean OSM base tiles with standard Leaflet rendering | **PASS** |

---

## 3. Conclusion
Condition A is experimentally valid, scientifically authentic, and provides all raw data necessary for a trained engineer to calculate the answer manually without automated aid.
