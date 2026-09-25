# Forensic Audit of Current JalRakshak Frontend UI
**Audit Date:** 2026-09-24  
**Audit Purpose:** Comprehensive inventory and forensic classification of all visible frontend components prior to Gate 5B Internal Human Dry-Run.  
**Auditor:** Senior Emergency Decision-Support UX & Forensic Systems Reviewer  

---

## 1. Executive Summary & Inventory
The JalRakshak frontend codebase was systematically audited to identify all UI components, modals, drawers, panels, overlays, and data presentations. The primary objective is reducing cognitive load for emergency decision-makers while preserving 100% of scientific information, deterministic lineage, and hydraulic traceability through progressive disclosure.

---

## 2. Component-by-Component Classification Ledger

| Component | Element / Section | Previous State | Forensic Classification | Action Taken & Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | Dam Name & River | Visible in main top nav bar | **KEEP** | Retained with FRL metadata |
| **Header** | Scenario Selector | Displayed dropdown with generic labels | **SIMPLIFY** | Explicit peak discharge ($Q_p$) labels (e.g. `Central (65,000 m³/s)`) |
| **Header** | Source Badge | Showed "HEC-RAS 2D (REAL RESULT)" | **SIMPLIFY** | Updated to `HEC-RAS 7.0.1 2D` |
| **Header** | Modal Actions | Compare, QA, Provenance buttons | **KEEP** | Clean iconography & consistent button styling |
| **Header** | Subtitle | Generic "Dam-Break Flood Evacuation" | **SIMPLIFY** | "Evacuation Decision Support System" |
| **DecisionPanel** | Top Decision Card | Scattered metrics across grid | **SIMPLIFY** | Transformed into Level 1 Hero Decision Card |
| **DecisionPanel** | Status Badge | Green/Yellow/Red badge | **KEEP** | Strict terminology: `FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP` |
| **DecisionPanel** | Deadline Display | Generic timestamp format | **SIMPLIFY** | Prominent `T+44:21` relative format with explicit label `LATEST FEASIBLE DEPARTURE` |
| **DecisionPanel** | Decision Margin | Monospace tag | **KEEP** | Prominently displayed (`+44.4 min`) |
| **DecisionPanel** | Decision Equation | Implicit in raw text | **SIMPLIFY** | Level 2 explicit arithmetic: Arrival minus Travel minus Buffer equals Deadline |
| **DecisionPanel** | Limiting Segment | Nested box with technical labels | **SIMPLIFY** | Highlighted bottleneck `R02` with explicit arrival, depth, and constraint reasoning |
| **DecisionPanel** | Segment Breakdown | Full table open by default | **MOVE TO SECONDARY** | Collapsible progressive disclosure under `[View Route Segment Breakdown]` |
| **DecisionPanel** | Threshold Config | Always visible inputs | **MOVE TO SECONDARY** | Collapsible progressive disclosure under `[Configure Safety Buffer & Thresholds]` |
| **DecisionPanel** | Safety Disclaimer | Generic footnote | **SIMPLIFY** | Explicit conditional disclaimer: "Feasible under current scenario and configured assumptions. Not a guarantee of physical safety." |
| **MapView** | Tile Layer | OSM standard tiles | **KEEP** | Clean keyless, watermark-free basemap |
| **MapView** | Inundation Polygon | Hazard overlay | **KEEP** | Light blue translucent flood extent |
| **MapView** | Active Route | Bold Polyline | **KEEP** | High contrast bold blue `#1d4ed8` |
| **MapView** | Limiting Segment | Highlighted polyline | **KEEP** | High visibility `#dc2626` with explicit tooltip |
| **MapView** | Point Query Popup | Raw fixture metadata note | **SIMPLIFY** | Decision-oriented hydraulic parameters with clean source attribution |
| **Sidebar** | Scenario Time | `T + 00:00` reference clock | **KEEP** | Explicitly labeled as Breach Inception reference |
| **Sidebar** | Layer Toggles | 4 essential checkboxes | **KEEP** | Inundation, Road Network, Origins, Shelters |
| **Sidebar** | Map Legend | Visual swatches | **SIMPLIFY** | Removed duplicated entries; aligned with operational symbology |
| **Sidebar** | Breach Physics | Open by default with technical metrics | **MOVE TO PROVENANCE** | Collapsible progressive disclosure |
| **ProvenanceDrawer** | Provenance Ledger | Technical hashes and metadata | **MOVE TO PROVENANCE** | Level 3 progressive disclosure drawer with 150m corridor & verification boundary notice |
| **ValidationModal** | Model QA | Ritter benchmark & CFL metrics | **MOVE TO PROVENANCE** | Modal accessible via `[Model QA]` |
| **ScenarioCompareModal**| Scenario Delta | Comparative physics & route shifts | **EXPERIMENTALLY SENSITIVE**| Maintained intact for cross-scenario sensitivity analysis |

---

## 3. Conclusion
No scientific ground truth, hydraulic values, road distances, travel times, or safety buffers were altered. Information was strictly reorganized from an overloaded flat layout into a structured 3-tier progressive disclosure hierarchy.
