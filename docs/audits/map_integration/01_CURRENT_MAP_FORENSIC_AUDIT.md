# 01 — Current Map Implementation Forensic Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Evaluation:** Current Geospatial & Hydraulic Mapping Subsystem  
**Date:** 2026-09-25  
**Status:** AUDITED & BASELINE ESTABLISHED  

---

## 1. Executive Summary & Existing State

The current map implementation is built upon **Leaflet (`leaflet` v1.9.4)** within `frontend/src/components/MapView.tsx`. It provides standard 2D web mapping layers over OpenStreetMap tiles, including:
1. Inundation extent GeoJSON polygon overlay.
2. Background road network polylines with hover tooltips.
3. Origin settlements (amber circle markers) and destination shelters (green circle markers).
4. Active route polyline (bold blue) and limiting segment highlight (bold red).
5. Point query popups for nearest feature, arrival time, depth, and velocity.

---

## 2. Forensic Gap Analysis

| Capability / Dimension | Current State | Required Target State | Refactoring Plan |
| :--- | :--- | :--- | :--- |
| **Visual Prominence** | Centered but squeezed by permanent 240px sidebar + 420px panel | **Map-First Dominance** (Full-bleed workspace with floating decision overlay) | Convert to full-width/full-height canvas with docked, calm decision cards |
| **Terrain Visualization** | Flat 2D standard cartographic tiles | **3D / 2.5D Terrain Context** (Topographic elevation awareness along Himalayan valley) | Add elevation profile and 2.5D terrain relief view with tilt/orbit controls |
| **Temporal Control** | Static snapshot per scenario | **Primary Flood Timeline Slider** ($T+00 \rightarrow T+15 \dots \rightarrow T+90$) | Implement discrete native timestep slider controlling flood propagation |
| **Limiting Segment** | Static red polyline | **Interactive Focus & Explainer Bridge** | Clicking zooms to segment and opens causal arithmetic explanation |
| **Visual Explainers** | Separate modal dialogs | **Integrated Explainer System (01 to 07)** | Interactive scenario-aware step-through animations |
| **Science Mode** | Separate basic modal | **Dual Mode: Operational vs Science/Audit** | Clean toggle revealing complete HEC-RAS parameters, CRS, and mesh |

---

## 3. Immutability Constraints
- Scientific ground truth ($60:00 - 12:39 - 03:00 = 44:21$) must remain authoritative.
- Spatial road coupling (150m strict corridor, LineString densification $\le 50\text{ m}$, EPSG:32644) must not be modified.
