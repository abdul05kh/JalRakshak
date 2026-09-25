import React, { useState } from "react";
import { X, Cpu, GitBranch, Database, Shield, Layers, Box, Terminal, Server } from "lucide-react";

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const [activePipeline, setActivePipeline] = useState<number>(0);

  const pipelines = [
    { id: 0, title: "Pipeline A: System Architecture", icon: <Cpu size={15} /> },
    { id: 1, title: "Pipeline B: HEC-RAS Extraction", icon: <Database size={15} /> },
    { id: 2, title: "Pipeline C: Terrain Processing", icon: <Layers size={15} /> },
    { id: 3, title: "Pipeline D: Road Network Graph", icon: <GitBranch size={15} /> },
    { id: 4, title: "Pipeline E: 150m Corridor Coupling", icon: <Box size={15} /> },
    { id: 5, title: "Pipeline F: EWE Decision Solver", icon: <Terminal size={15} /> },
    { id: 6, title: "Pipeline G: WebGL 3D Visualization", icon: <Layers size={15} /> },
    { id: 7, title: "Pipeline H: Automated Validation", icon: <Shield size={15} /> },
    { id: 8, title: "Pipeline I: Artifact Provenance", icon: <Server size={15} /> },
    { id: 9, title: "Pipeline J: Multi-Scenario Sensitivity", icon: <GitBranch size={15} /> }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.70)",
      backdropFilter: "blur(5px)",
      zIndex: 2500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        width: "980px",
        maxWidth: "96vw",
        maxHeight: "92vh",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              HOW JALRAKSHAK IS BUILT — TECHNICAL PIPELINES & ARCHITECTURE
            </h2>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Architectural Specifications • Data Flow Pipelines A through J
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{
            width: "250px",
            borderRight: "1px solid var(--border-subtle)",
            backgroundColor: "#f8fafc",
            padding: "10px 6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            overflowY: "auto"
          }}>
            {pipelines.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePipeline(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activePipeline === p.id ? "#eff6ff" : "transparent",
                  color: activePipeline === p.id ? "#1d4ed8" : "var(--text-secondary)",
                  fontWeight: activePipeline === p.id ? 800 : 500,
                  fontSize: "11px",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                {p.icon}
                <span style={{ flex: 1 }}>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Main Diagram Area */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            {activePipeline === 0 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Pipeline A: End-to-End System Architecture
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569", lineHeight: 1.45 }}>
                  The complete processing pipeline transforming native HEC-RAS 2D unsteady fluid mechanics into deterministic, human-readable evacuation window deadlines.
                </p>

                <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "11px", lineHeight: 1.6, overflowX: "auto" }}>
                  <div style={{ color: "#38bdf8" }}>[ RAW BOUNDARY HYDROGRAPH ] (Q_p = 65,000 m³/s, 635m breach invert assumption)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div style={{ color: "#60a5fa" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ HEC-RAS 7.0.1 2D SWE ENGINE ] (Unsteady mesh solver in EPSG:32644)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│ (HDF5 Output: 120-min duration, 5-min intervals)</div>
                  <div style={{ color: "#818cf8" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ HYDRAULIC ADAPTER & EXTRACTOR ] (WSE, Depth, Cell Arrival Array)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div style={{ color: "#fbbf24" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ 150m LINESTRING CORRIDOR COUPLING ] (≤50m densification search)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div style={{ color: "#f472b6" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ EVACUATION WINDOW ENGINE (EWE) ] (D + T_i + B &lt; A_i Solver)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div style={{ color: "#4ade80" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ FASTAPI BACKEND API ] (REST Endpoints: /routes/analyze, /timeline)</div>
                  <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                  <div style={{ color: "#34d399", fontWeight: "bold" }}>&nbsp;&nbsp;&nbsp;&nbsp;▼ [ MAPLIBRE GL 3D CONSOLE ] (Map-First Operational Interface)</div>
                </div>
              </div>
            )}

            {activePipeline === 1 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Pipeline B: HEC-RAS 7.0.1 2D Hydraulic Extraction Pipeline
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569" }}>
                  Extracts spatial mesh geometries, cell centers, water surface elevation (WSE) time series, and maximum velocity fields from native HDF5 plans.
                </p>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}>
                  <strong>Input:</strong> `tehri_15km_scenario_central.p01.hdf` (13.5 MB, SHA-256 verified).<br />
                  <strong>Extracted Arrays:</strong> `depth_series_m` (25 timesteps × 6,321 cells), `cell_coords` (UTM 44N), `cell_arrival_times_sec`.<br />
                  <strong>Threshold Rule:</strong> First timestep where depth ≥ 0.30 m.
                </div>
              </div>
            )}

            {activePipeline === 2 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Pipeline C: Copernicus GLO-30 DSM Topographic Conditioning Pipeline
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569" }}>
                  Processes 30-meter DSM elevation tiles, reprojects to EPSG:32644, and conditions the Bhagirathi river thalweg for 2D hydraulic routing.
                </p>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}>
                  <strong>Source:</strong> Copernicus GLO-30 Global Digital Surface Model.<br />
                  <strong>Vertical Reference:</strong> EGM96 Geoid / Orthometric Height (m MSL).<br />
                  <strong>Dam Axis Crest:</strong> 830.0m MSL (design FRL).
                </div>
              </div>
            )}

            {activePipeline === 3 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Pipeline D: OpenStreetMap Road Network Graph Pipeline
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569" }}>
                  Builds a directed NetworkX topological graph from OpenStreetMap road vectors, assigning baseline speeds and edge lengths.
                </p>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}>
                  <strong>Source:</strong> OpenStreetMap-derived road network vectors.<br />
                  <strong>Speed Baseline:</strong> 35–50 km/h configured baseline travel speed assumption.<br />
                  <strong>Route Travel Time:</strong> Evaluated topologically from edge lengths divided by speeds.
                </div>
              </div>
            )}

            {activePipeline === 4 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  Pipeline E: Projected LineString 150m Corridor Road-Hydraulic Coupling
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569" }}>
                  The Gate 4 hardened coupling methodology projecting road centerlines into EPSG:32644, densifying at ≤ 50 m, and sampling cells within a 150m perpendicular envelope.
                </p>
                <div style={{ padding: "12px", backgroundColor: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "11px", color: "#1e40af" }}>
                  <strong>Why 150m?</strong> Eliminates spurious associations with deep river thalweg flows 800m away, capturing 229 local corridor cells for R02.
                </div>
              </div>
            )}

            {activePipeline >= 5 && (
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                  {pipelines[activePipeline].title}
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "11.5px", color: "#475569" }}>
                  Deterministic, fully traceable computational module maintaining strict separation between mathematical verification and human decision usability.
                </p>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}>
                  <strong>Compliance:</strong> Zero neural network approximation; 100% deterministic arithmetic.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
