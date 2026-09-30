import React from "react";
import { 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Database, 
  FileCheck, 
  GitBranch, 
  Layers, 
  Map, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Waves 
} from "lucide-react";

interface PostSubmissionUpdateViewProps {
  onBackToMap: () => void;
}

export const PostSubmissionUpdateView: React.FC<PostSubmissionUpdateViewProps> = ({ onBackToMap }) => {
  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      backgroundColor: "#020617",
      color: "#f8fafc",
      padding: "24px 32px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "inherit"
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        paddingBottom: "20px",
        borderBottom: "1px solid #1e293b"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#fbbf24",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            <ShieldAlert size={16} color="#fbbf24" />
            Smart India Hackathon (SIH 2026) — Problem Statement SIH26161
          </div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.5px",
            margin: 0
          }}>
            WHAT CHANGED AFTER OUR SIH SUBMISSION?
          </h1>
          <p style={{
            fontSize: "13px",
            color: "#94a3b8",
            margin: 0
          }}>
            A comprehensive, transparent technical disclosure of the post-submission architecture evolution and scientific hardening of JalRakshak.
          </p>
        </div>
        <button
          onClick={onBackToMap}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#f8fafc",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
          Back to 3D Map
        </button>
      </div>

      {/* Main Narrative Card: What We Initially Got Wrong */}
      <div style={{
        padding: "24px",
        borderRadius: "14px",
        backgroundColor: "#0f172a",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#fbbf24",
          fontWeight: 800,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <AlertTriangle size={18} color="#fbbf24" />
          1. The Initial Problem Interpretation & Identified Gap
        </div>
        <p style={{
          fontSize: "16px",
          fontWeight: 800,
          color: "#ffffff",
          margin: 0
        }}>
          THE SUBMITTED PRESENTATION REPRESENTS OUR INITIAL INTERPRETATION OF SIH26161.
        </p>
        <div style={{
          fontSize: "13.5px",
          color: "#cbd5e1",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          lineHeight: "1.6"
        }}>
          <p style={{ margin: 0 }}>
            The submitted PPT represents our initial interpretation of SIH26161.
            After submission, we identified that our initial interpretation placed too much emphasis on localized dam-break hydrodynamics, 3D visualization, and evacuation routing, and did not fully capture the broader generalized modelling, multi-dataset, and remote-sensing scope of SIH26161.
          </p>
          <p style={{ margin: 0 }}>
            We acknowledge this gap. Rather than defending our original narrower interpretation, we revisited the problem statement, reworked the architecture, and advanced the prototype.
          </p>
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            fontSize: "12.5px",
            color: "#fde68a",
            fontWeight: 600
          }}>
            ⚠️ <strong>Important:</strong> This is a post-submission technical update. It does not constitute a revised SIH submission. The submitted PPT remains unchanged; this repository documents technical development undertaken after submission.
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table: Submitted vs Current */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{
          fontSize: "13px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "#cbd5e1",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Layers size={16} color="#38bdf8" />
          2. Detailed Evolution Matrix: Submitted State vs. Current Prototype
        </h2>
        <div style={{
          overflowX: "auto",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          backgroundColor: "#0f172a"
        }}>
          <table style={{
            width: "100%",
            textAlign: "left",
            fontSize: "12.5px",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr style={{
                backgroundColor: "#1e293b",
                borderBottom: "1px solid #334155",
                color: "#94a3b8",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                <th style={{ padding: "14px 16px" }}>Engineering Domain</th>
                <th style={{ padding: "14px 16px", width: "35%", color: "#94a3b8" }}>Submitted State (Initial Stage)</th>
                <th style={{ padding: "14px 16px", width: "45%", color: "#38bdf8" }}>Current Prototype (Post-Submission Advancement)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Waves size={16} color="#60a5fa" /> Hydrodynamics
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Localized hydraulic/GIS visualization</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>Native HEC-RAS 2D unsteady flow HDF5 ingestion across 3 breach plans (28.5k, 65k, 115k m³/s) with cell-level depth, velocity, and arrival timestamps.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} color="#fbbf24" /> Evacuation Engine
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Basic route clearance concept</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>Deterministic Evacuation Window Engine (EWE) mathematically calculating D_deadline = min(A_i - T_i - B) and extracting the limiting bottleneck segment.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Map size={16} color="#34d399" /> GIS & Road Coupling
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Visual road overlay</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>Projected coordinate transformation (UTM 44N to WGS84) with 150m perpendicular corridor search and line densification.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Radio size={16} color="#c084fc" /> Satellite / GEE
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Limited/absent satellite integration</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>Multi-temporal Sentinel-1 SAR change detection research workflow. Spatial-comparison metrics (IoU, precision, recall, F1) are computed when compatible extents are supplied.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Database size={16} color="#818cf8" /> Multi-Model Architecture
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Single hydraulic model assumption</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>Unified HydraulicModelAdapter interface supporting HEC-RAS, Delft3D FM, and DualSPHysics SPH with normalized cross-model discrepancy comparisons.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileCheck size={16} color="#2dd4bf" /> GIS Exports
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>No export functionality</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>OGC KML 2.2 XML and RFC 7946 GeoJSON export endpoints containing hydraulic telemetry and departure margins.</td>
              </tr>
              <tr>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="#4ade80" /> Provenance & Verification
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>Early exploratory tests</td>
                <td style={{ padding: "14px 16px", color: "#bae6fd" }}>210 automated Pytest test suites passing, real-time SHA-256 physical disk hashing, and formal 5-level validation ladder.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Boundaries & Explicit Limitations */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px"
      }}>
        {/* Verified Capabilities */}
        <div style={{
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "#0f172a",
          border: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#34d399",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <CheckCircle size={16} color="#34d399" />
            3. Verified Technical Capabilities
          </div>
          <ul style={{
            fontSize: "12.5px",
            color: "#cbd5e1",
            margin: 0,
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            lineHeight: "1.5"
          }}>
            <li><strong style={{ color: "#ffffff" }}>Authoritative Hydraulic Ingestion:</strong> Ingests native HEC-RAS 2D HDF5 geometry, water surface elevations, and velocities without procedural fabrications.</li>
            <li><strong style={{ color: "#ffffff" }}>Deterministic Bottleneck Extraction:</strong> Identifies the exact limiting road segment (argmin D_i) determining route cut-off.</li>
            <li><strong style={{ color: "#ffffff" }}>Standardized GIS Exports:</strong> Exports compliant KML and GeoJSON files via REST endpoints.</li>
            <li><strong style={{ color: "#ffffff" }}>Spatial Comparison Metrics:</strong> Computes IoU, precision, and recall comparing satellite water masks with simulated extents when compatible inputs are provided.</li>
            <li><strong style={{ color: "#ffffff" }}>Scenario Isolation:</strong> Scenario isolation and data-driven loading were verified on independent synthetic test worlds (TEST_ALPHA, TEST_BETA).</li>
          </ul>
        </div>

        {/* Known Limitations */}
        <div style={{
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "rgba(225, 29, 72, 0.08)",
          border: "1px solid rgba(244, 63, 94, 0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#fb7185",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <AlertTriangle size={16} color="#fb7185" />
            4. Explicit Limitations & Scientific Disclaimers
          </div>
          <ul style={{
            fontSize: "12.5px",
            color: "#fecdd3",
            margin: 0,
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            lineHeight: "1.5"
          }}>
            <li><strong style={{ color: "#ffffff" }}>Physical Validation:</strong> NOT_ESTABLISHED for Tehri Dam due to lack of historic physical dam-break failure records.</li>
            <li><strong style={{ color: "#ffffff" }}>Satellite Ground Truth:</strong> Sentinel-1 backscatter depressions are candidate flood masks, not calibrated ground truth for HEC-RAS.</li>
            <li><strong style={{ color: "#ffffff" }}>External Solvers:</strong> Delft3D and DualSPHysics are external adapter interfaces; external solver execution is not included in the current demonstration environment.</li>
            <li><strong style={{ color: "#ffffff" }}>Evacuation Model:</strong> The EWE transforms hydraulic arrival information and configured route assumptions into a deterministic departure window; it is not an independent physical safety model. Dynamic traffic congestion is unmodelled.</li>
            <li><strong style={{ color: "#ffffff" }}>Event Comparability:</strong> July 2024 Balganga satellite data is an observation demo, not validation of Tehri dam-break simulations.</li>
          </ul>
        </div>
      </div>

      {/* Post-Submission Timeline */}
      <div style={{
        padding: "20px",
        borderRadius: "14px",
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <h2 style={{
          fontSize: "12px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "#cbd5e1",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <GitBranch size={16} color="#38bdf8" />
          5. Post-Submission Development & Hardening Timeline
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px"
        }}>
          <div style={{ padding: "14px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: 800, display: "block" }}>STAGE 1</span>
            <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>Problem Reinterpretation</strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "6px 0 0 0" }}>Identified broader SIH26161 expectations (GEE, multi-model, export).</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 800, display: "block" }}>STAGE 2</span>
            <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>Hydraulic & EWE Hardening</strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "6px 0 0 0" }}>Bound native HDF5 2D results and locked mathematical EWE formulation.</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "10px", color: "#c084fc", fontWeight: 800, display: "block" }}>STAGE 3</span>
            <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>GEE & Remote Sensing</strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "6px 0 0 0" }}>Implemented Sentinel-1 multi-temporal pipeline and spatial IoU comparator.</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "10px", color: "#34d399", fontWeight: 800, display: "block" }}>STAGE 4</span>
            <strong style={{ color: "#ffffff", fontSize: "12.5px" }}>Generalization & Release</strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "6px 0 0 0" }}>Zero-hardcoding verification, 210 passing tests, and OGC KML exports.</p>
          </div>
        </div>
      </div>

      {/* Build & Verification Footer */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px 20px",
        borderRadius: "12px",
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        fontSize: "12px",
        color: "#94a3b8"
      }}>
        <div>
          Prototype Release: <span style={{ color: "#ffffff", fontWeight: 700 }}>JalRakshak v2.0 (Post-Submission Technical Release)</span> • Build: <code style={{ color: "#38bdf8", fontFamily: "monospace" }}>f668c7d</code>
        </div>
        <button
          onClick={onBackToMap}
          style={{
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#0f172a",
            backgroundColor: "#f59e0b",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
          }}
        >
          Return to 3D Operational Map
        </button>
      </div>
    </div>
  );
};
