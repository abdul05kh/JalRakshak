# JalRakshak — Provenance & Lineage Data Model
**Specification:** End-to-End Decision Traceability & Cryptographic Integrity

---

## 1. Lineage Chain

Every operational recommendation rendered by JalRakshak is traceable through an unbroken deterministic lineage:

```mermaid
graph TD
    A["Raw HEC-RAS Artifact (*.p01.hdf)"] -->|SHA-256 Checksum| B["Hydraulic Adapter (HecRasHdfAdapter)"]
    B -->|WSE - Z_min| C["Derived Depth Series (DERIVED_FROM_HECRAS)"]
    C -->|Threshold Crossing H >= 0.3m| D["Cell Arrival Times A(c)"]
    D -->|Spatial Buffer Intersect EPSG:32644| E["Road Exposure (A_i, h_i, v_i)"]
    E -->|EWE: D_deadline = min(A_i - T_i - B)| F["Evacuation Route Feasibility & Margin"]
    F -->|Deterministic Formatting| G["Emergency Officer Decision Display"]
```

---

## 2. Provenance Record Structure

Each decision response contains a `provenance` block:
```json
{
  "source_artifact": {
    "file_name": "tehri_dam_break.p01.hdf",
    "sha256": "3a8f...",
    "source_type": "HECRAS_REAL_RESULT",
    "solver": "HEC-RAS 2D Hydrodynamic v6.6",
    "crs": "EPSG:32644 (UTM Zone 44N)",
    "units": "meters"
  },
  "transformations": [
    {
      "step": "DEPTH_DERIVATION",
      "formula": "Depth(c,t) = max(0, WSE(c,t) - CellMinElev(c))",
      "status": "DERIVED_FROM_HECRAS"
    },
    {
      "step": "ARRIVAL_TIME",
      "method": "Threshold crossing at H_threshold = 0.3m",
      "status": "DERIVED_FROM_HECRAS"
    },
    {
      "step": "ROAD_MAPPING",
      "method": "KDTree spatial nearest-cell buffer (r=50m) in EPSG:32644",
      "status": "DERIVED"
    },
    {
      "step": "EWE_CALCULATION",
      "formula": "D_deadline = min_i(A_i - T_i - B)",
      "algorithm_version": "1.0.0",
      "safety_buffer_min": 3.0,
      "status": "SOFTWARE-VERIFIED"
    }
  ],
  "validation_status": "VALIDATION_NOT_ESTABLISHED"
}
```

> [!NOTE]
> SHA-256 guarantees artifact file integrity against corruption or tampering; it does not constitute scientific validation. Scientific validation requires field-measured hydrographs or calibrated gauge records.
