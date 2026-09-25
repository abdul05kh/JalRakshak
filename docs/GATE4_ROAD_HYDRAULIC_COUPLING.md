# GATE 4 ROAD-HYDRAULIC SPATIAL COUPLING
## Mathematical & GIS Methodology for Mapping 2D Hydrodynamic Cells to Road Networks

**Document ID:** `DOC-GATE4-ROAD-COUPLING-001`  
**Status:** APPROVED  
**Date:** 2026-09-24  
**Author:** GIS Engineer & Hydraulic Decision-Support Lead  

---

## 1. Overview & Objective

The spatial coupling engine associates 2D hydraulic computational cells (which carry time-series Water Surface Elevation, derived depth, face velocity, and arrival time) with 1D vector road network geometries (LineStrings representing transport corridors).

This mapping establishes the spatial and temporal exposure of transport links during a simulated dam-break wave propagation event.

---

## 2. Spatial Operation Pipeline

```
[ Vector Road Network (WGS 84 / EPSG:4326) ]
                    │
                    ▼
[ Coordinate Transformation -> UTM Zone 44N (EPSG:32644) in meters ]
                    │
                    ▼
[ Segment Discretization & Vertex Sampling (dx <= 100m) ]
                    │
                    ▼
[ KD-Tree Query of 2D Hydraulic Cell Centroids within Coupling Radius R ]
                    │
                    ▼
[ Conservative Hydraulic Metric Aggregation (Min Arrival, Max Depth, Max Velocity) ]
                    │
                    ▼
[ Road Exposure Output & Deterministic Status Assignment ]
```

---

## 3. Detailed Algorithmic Steps

### 3.1 Coordinate Transformation
All road geometries are stored in GeoJSON format in geographic coordinates (`EPSG:4326` WGS 84 longitude, latitude in decimal degrees). 
The HEC-RAS 2D flow mesh for the Tehri Bhagirathi reach is established in projected planar coordinates (`EPSG:32644` WGS 84 / UTM Zone 44N in meters).

**Transformation:**
$$\begin{pmatrix} X_{\text{UTM}} \\ Y_{\text{UTM}} \end{pmatrix} = \mathcal{T}_{\text{EPSG:4326} \to \text{EPSG:32644}} \begin{pmatrix} \lambda \\ \phi \end{pmatrix}$$
Using high-precision PROJ / `pyproj.Transformer(always_xy=True)`.

### 3.2 Spatial Indexing & Search Radius ($R_{\text{search}}$)
A $k$-d tree ($\mathcal{O}(N \log N)$ build, $\mathcal{O}(\log N)$ query) is constructed over all cell centroids $(x_c, y_c)$ in the HEC-RAS computational mesh:
$$\mathcal{M} = \{ (x_c, y_c) \mid c \in [0, N_{\text{cells}}-1] \}$$

- **Nominal Cell Grid Resolution:** $\Delta x = 100\text{ m}$.
- **Search Radius Parameter:** $R_{\text{search}} = 1,200\text{ m}$.
- **Rationale for $R_{\text{search}}$:** In steep Himalayan canyon topography (Bhagirathi valley), river road alignments run parallel along valley flanks within $200\text{ m} - 1,200\text{ m}$ of the central river thalweg. A $1,200\text{ m}$ radius captures valley-bottom roads while preventing high-ridge bypasses (e.g., Chamba ridge at $>1,600\text{ m}$ elevation) from false inundation.

### 3.3 Sampling Interval Along Road Segments
Road LineStrings are evaluated at every geometry vertex and interpolated points such that the maximum spacing between adjacent sample points $\Delta s \le 100\text{ m}$ (matching hydraulic cell dimension).

For each sample point $p_k \in \text{LineString}(e)$:
$$\mathcal{C}_k = \{ c \in \mathcal{M} \mid \| p_k - (x_c, y_c) \|_2 \le R_{\text{search}} \}$$

The total associated cell set for edge $e$ is:
$$\mathcal{C}(e) = \bigcup_{k} \mathcal{C}_k \cup \{ \text{argmin}_{c \in \mathcal{M}} \| p_k - (x_c, y_c) \|_2 \text{ if } \min \text{dist} \le 1.5 R_{\text{search}} \}$$

---

## 4. Conservative Metric Aggregation Rules

When multiple computational cells are coupled to a single road segment $e$, the engine applies **conservative safety principles**:

### 4.1 Flood Arrival Time Aggregation ($A_e$)
$$A_e = \begin{cases} 
\min_{c \in \mathcal{C}(e), t_{\text{arr}}(c, H) < \infty} t_{\text{arr}}(c, H) & \text{if } \exists c \in \mathcal{C}(e) \text{ where } t_{\text{arr}}(c, H) < \infty \\
\infty \text{ (or } 99999\text{ s)} & \text{if no coupled cell crosses threshold } H
\end{cases}$$
*Principle:* If any portion of a road segment is reached by water at time $t$, the segment is considered constrained at $t$.

### 4.2 Maximum Depth Aggregation ($d_{\text{max}, e}$)
$$d_{\text{max}, e} = \begin{cases}
\max_{c \in \mathcal{C}(e), t} d(c, t) & \text{if } \mathcal{C}(e) \neq \emptyset \\
0.0\text{ m} & \text{if } \mathcal{C}(e) = \emptyset
\end{cases}$$

### 4.3 Velocity Aggregation ($v_{\text{max}, e}$)
$$v_{\text{max}, e} = \begin{cases}
\max_{f \in \mathcal{F}(\mathcal{C}(e)), t} |v_{\text{face}}(f, t)| & \text{if velocity data exists} \\
0.0\text{ m/s} & \text{otherwise}
\end{cases}$$

---

## 5. Edge Cases & Missing Data Handling

1. **Road Outside Hydraulic Domain (High Ground):**
   - If $\mathcal{C}(e) = \emptyset$ (no cells within search radius):
   - $A_e = \infty$ ($99999\text{ s}$), $d_{\text{max}} = 0.0\text{ m}$, status = `OPEN` (High Ground).
2. **Missing Road Geometry:**
   - Handled as `DATA_GAP`. Edge excluded from graph; route evaluation returns `DATA_GAP`.
3. **Disconnected Mesh / Islands:**
   - Handled strictly by graph traversal. If origin and destination have no connecting path, status = `NO_FEASIBLE_ROUTE`.
