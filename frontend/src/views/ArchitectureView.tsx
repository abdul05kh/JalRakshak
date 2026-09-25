import React, { useState } from "react";
import { Cpu } from "lucide-react";

interface ArchitectureViewProps {
  onNavigateToView: (view: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigateToView }) => {
  const [activePipeline, setActivePipeline] = useState<string>("PIPE-G");

  const pipelines = [
    { id: "PIPE-A", name: "Pipeline A: Terrain Processing", desc: "Copernicus GLO-30 DSM (30m) ingested into Projected Metric UTM Zone 44N (EPSG:32644) with EGM96 vertical geoid datum.", tech: "GDAL / Rasterio / NumPy" },
    { id: "PIPE-B", name: "Pipeline B: Breach Hydrograph", desc: "Froehlich (2008) and MacDonald-Langridge-Monopolis parametric dam-breach hydrograph generator.", tech: "Python / SciPy" },
    { id: "PIPE-C", name: "Pipeline C: HEC-RAS 2D Solver", desc: "USACE HEC-RAS 7.0.1 2D Unsteady Shallow Water Equations solver with flexible subgrid bathymetry mesh.", tech: "HEC-RAS 7.0.1 / Fortran Engine" },
    { id: "PIPE-D", name: "Pipeline D: HDF5 Extraction", desc: "Native read-only HDF5 spatial-temporal extractor pulling WSE, cell depths, velocities, and face flux arrays.", tech: "h5py / Pandas" },
    { id: "PIPE-E", name: "Pipeline E: Road Ingestion", desc: "OpenStreetMap road network ingestion, topology cleaning, directed graph generation, and <=50m vertex densification.", tech: "OSMnx / NetworkX / Shapely" },
    { id: "PIPE-F", name: "Pipeline F: 150m Road Coupling", desc: "Spatial spatial-intersection engine associating road centerlines with adjacent HEC-RAS hydraulic mesh cells.", tech: "STRtree / Shapely / GeoPandas" },
    { id: "PIPE-G", name: "Pipeline G: Evacuation Window Engine", desc: "Solves D = A_i - T_i - B across all graph paths to find the single limiting road segment and departure deadline.", tech: "Custom Python EWE Solver" },
    { id: "PIPE-H", name: "Pipeline H: FastAPI REST Backend", desc: "High-performance asynchronous API endpoints delivering GeoJSON layers, route evaluations, and decision timelines.", tech: "FastAPI / Uvicorn / Pydantic" },
    { id: "PIPE-I", name: "Pipeline I: WebGL 3D Rendering", desc: "Full-bleed WebGL 3D terrain canvas with custom elevation contours, water shaders, and route highlighting.", tech: "MapLibre GL JS / WebGL 2.0" },
    { id: "PIPE-J", name: "Pipeline J: SHA-256 Provenance", desc: "Cryptographic artifact integrity verifier computing and validating SHA-256 hashes for all HDF5, GeoJSON, and code artifacts.", tech: "hashlib / JSON Schema" }
  ];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      overflowY: "auto",
      backgroundColor: "#090d16",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header Banner */}
      <div style={{
        padding: "16px 28px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "rgba(124, 58, 237, 0.2)",
            border: "1px solid rgba(124, 58, 237, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Cpu size={20} color="#a78bfa" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
              SYSTEM ARCHITECTURE & COMPUTATIONAL DATA PIPELINES
            </h1>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              End-to-End Technical Blueprint: Pipelines A through J | Verified Multi-Tier Pipeline
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToView("OPERATIONAL_MAP")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#cbd5e1",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          View on 3D Map
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1350px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        
        {/* Architecture Data Flow Diagram */}
        <div style={{
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
            End-to-End System Data Flow
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            alignItems: "center"
          }}>
            {[
              { step: "01", title: "Terrain DSM", sub: "GLO-30 (30m)", color: "#38bdf8" },
              { step: "02", title: "Breach Invert", sub: "635m Assumption", color: "#f59e0b" },
              { step: "03", title: "HEC-RAS 2D", sub: "SWE Unsteady", color: "#60a5fa" },
              { step: "04", title: "Road Graph", sub: "OSM Ingestion", color: "#34d399" },
              { step: "05", title: "150m Coupling", sub: "Spatial STRtree", color: "#a78bfa" },
              { step: "06", title: "EWE Solver", sub: "D = A - T - B", color: "#4ade80" },
              { step: "07", title: "3D Map UI", sub: "Decision Directives", color: "#f43f5e" }
            ].map((node) => (
              <div
                key={node.step}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderRadius: "8px",
                  border: `1px solid ${node.color}40`,
                  padding: "12px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "9px", fontWeight: 800, color: node.color }}>
                  STAGE {node.step}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", margin: "4px 0 2px 0" }}>
                  {node.title}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {node.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipelines A through J Interactive Explorer */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          padding: "24px"
        }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
            Data Pipelines (A through J) Detailed Specifications
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "14px"
          }}>
            {pipelines.map((p) => {
              const isSelected = activePipeline === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePipeline(p.id)}
                  style={{
                    backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(15, 23, 42, 0.6)",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: isSelected ? "#60a5fa" : "#ffffff" }}>
                      {p.name}
                    </span>
                    <span style={{
                      fontSize: "9px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "#94a3b8"
                    }}>
                      {p.id}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#cbd5e1", lineHeight: "1.5" }}>
                    {p.desc}
                  </p>

                  <div style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <strong style={{ color: "#38bdf8" }}>Technology:</strong>
                    <span>{p.tech}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div style={{
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          padding: "20px"
        }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
            Production Technology Stack Summary
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px"
          }}>
            {[
              { cat: "Hydraulic Engine", name: "HEC-RAS 7.0.1 2D Unsteady", detail: "2D Shallow Water Equations, HDF5 output format" },
              { cat: "Geospatial & Spatial Indexing", name: "Shapely 2.0 / STRtree / GeoPandas", detail: "150m spatial corridor intersection queries" },
              { cat: "Graph Routing Engine", name: "NetworkX / Custom EWE Engine", detail: "Directed graph traversal and arrival-margin evaluation" },
              { cat: "Backend Framework", name: "Python 3.14 / FastAPI / Pydantic", detail: "Asynchronous REST endpoints with typed schemas" },
              { cat: "Frontend Rendering", name: "React 19 / TypeScript / MapLibre GL", detail: "WebGL 3D terrain canvas with custom elevation contours" },
              { cat: "Artifact Verification", name: "hashlib SHA-256 / Manifest Schema", detail: "Immutable cryptographic provenance validation" }
            ].map((t) => (
              <div
                key={t.name}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  padding: "12px"
                }}
              >
                <div style={{ fontSize: "9px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                  {t.cat}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", margin: "4px 0 2px 0" }}>
                  {t.name}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {t.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
