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
      backgroundColor: "var(--jr-bg, #F4EFE6)",
      color: "var(--jr-text, #24343A)",
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
        borderBottom: "1px solid var(--jr-border, #D8D1C5)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#A97835",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            <ShieldAlert size={16} color="#A97835" />
            Smart India Hackathon (SIH 2026) — Problem Statement SIH26161
          </div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--jr-text, #24343A)",
            letterSpacing: "-0.5px",
            margin: 0
          }}>
            WHAT CHANGED AFTER OUR SIH SUBMISSION?
          </h1>
          <p style={{
            fontSize: "13px",
            color: "var(--jr-text-muted, #65747A)",
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
            color: "var(--jr-text, #24343A)",
            backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
            border: "1px solid var(--jr-border, #D8D1C5)",
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
        backgroundColor: "var(--jr-surface, #FBF8F2)",
        border: "1.5px solid var(--jr-border, #D8D1C5)",
        boxShadow: "0 4px 16px rgba(36, 52, 58, 0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#A97835",
          fontWeight: 800,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <AlertTriangle size={18} color="#A97835" />
          1. The Initial Problem Interpretation & Identified Gap
        </div>
        <p style={{
          fontSize: "16px",
          fontWeight: 800,
          color: "var(--jr-text, #24343A)",
          margin: 0
        }}>
          THE SUBMITTED PRESENTATION REPRESENTS OUR INITIAL INTERPRETATION OF SIH26161.
        </p>
        <div style={{
          fontSize: "13.5px",
          color: "var(--jr-text, #24343A)",
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
            backgroundColor: "#FFFBEB",
            border: "1px solid #A97835",
            fontSize: "12.5px",
            color: "#78350F",
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
          color: "var(--jr-text, #24343A)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Layers size={16} color="var(--jr-blue-600, #3D8EAE)" />
          2. Detailed Evolution Matrix: Submitted State vs. Current Prototype
        </h2>
        <div style={{
          overflowX: "auto",
          border: "1px solid var(--jr-border, #D8D1C5)",
          borderRadius: "12px",
          backgroundColor: "var(--jr-surface, #FBF8F2)"
        }}>
          <table style={{
            width: "100%",
            textAlign: "left",
            fontSize: "12.5px",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr style={{
                backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
                borderBottom: "1px solid var(--jr-border, #D8D1C5)",
                color: "var(--jr-text-muted, #65747A)",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                <th style={{ padding: "14px 16px" }}>Engineering Domain</th>
                <th style={{ padding: "14px 16px", width: "35%", color: "var(--jr-text-muted, #65747A)" }}>Submitted State (Initial Stage)</th>
                <th style={{ padding: "14px 16px", width: "45%", color: "var(--jr-blue-800, #24566A)" }}>Current Prototype (Post-Submission Advancement)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Waves size={16} color="var(--jr-blue-600, #3D8EAE)" /> Hydrodynamics
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Localized hydraulic/GIS visualization</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>Native HEC-RAS 2D unsteady flow HDF5 ingestion across 3 breach plans (28.5k, 65k, 115k m³/s) with cell-level depth, velocity, and arrival timestamps.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} color="#A97835" /> Evacuation Engine
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Basic route clearance concept</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>Deterministic Evacuation Window Engine (EWE) mathematically calculating D_deadline = min(A_i - T_i - B) and extracting the limiting bottleneck segment.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Map size={16} color="var(--jr-success, #3F7D62)" /> GIS & Road Coupling
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Visual road overlay</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>Projected coordinate transformation (UTM 44N to WGS84) with 150m perpendicular corridor search and line densification.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Radio size={16} color="#76B8D0" /> Satellite / GEE
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Limited/absent satellite integration</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>Multi-temporal Sentinel-1 SAR change detection research workflow. Spatial-comparison metrics (IoU, precision, recall, F1) are computed when compatible extents are supplied.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Database size={16} color="var(--jr-blue-600, #3D8EAE)" /> Multi-Model Architecture
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Single hydraulic model assumption</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>Unified HydraulicModelAdapter interface supporting HEC-RAS, Delft3D FM, and DualSPHysics SPH with normalized cross-model discrepancy comparisons.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileCheck size={16} color="var(--jr-blue-800, #24566A)" /> GIS Exports
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>No export functionality</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>OGC KML 2.2 XML and RFC 7946 GeoJSON export endpoints containing hydraulic telemetry and departure margins.</td>
              </tr>
              <tr>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--jr-text, #24343A)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="var(--jr-success, #3F7D62)" /> Provenance & Verification
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text-muted, #65747A)" }}>Early exploratory tests</td>
                <td style={{ padding: "14px 16px", color: "var(--jr-text, #24343A)" }}>220 automated Pytest test suites passing, real-time SHA-256 physical disk hashing, and formal 5-level validation ladder.</td>
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
          backgroundColor: "var(--jr-surface, #FBF8F2)",
          border: "1px solid var(--jr-border, #D8D1C5)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--jr-success, #3F7D62)",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <CheckCircle size={16} color="var(--jr-success, #3F7D62)" />
            3. Verified Technical Capabilities
          </div>
          <ul style={{
            fontSize: "12.5px",
            color: "var(--jr-text, #24343A)",
            margin: 0,
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            lineHeight: "1.5"
          }}>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Authoritative Hydraulic Ingestion:</strong> Ingests native HEC-RAS 2D HDF5 geometry, water surface elevations, and velocities without procedural fabrications.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Deterministic Bottleneck Extraction:</strong> Identifies the exact limiting road segment (argmin D_i) determining route cut-off.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Standardized GIS Exports:</strong> Exports compliant KML and GeoJSON files via REST endpoints.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Spatial Comparison Metrics:</strong> Computes IoU, precision, and recall comparing satellite water masks with simulated extents when compatible inputs are provided.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Scenario Isolation:</strong> Scenario isolation and data-driven loading were verified on independent synthetic test worlds (TEST_ALPHA, TEST_BETA).</li>
          </ul>
        </div>

        {/* Known Limitations */}
        <div style={{
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "#FFF5F5",
          border: "1px solid #A84C4C",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#A84C4C",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <AlertTriangle size={16} color="#A84C4C" />
            4. Explicit Limitations & Scientific Disclaimers
          </div>
          <ul style={{
            fontSize: "12.5px",
            color: "var(--jr-text, #24343A)",
            margin: 0,
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            lineHeight: "1.5"
          }}>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Physical Validation:</strong> NOT_ESTABLISHED for Tehri Dam due to lack of historic physical dam-break failure records.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Satellite Ground Truth:</strong> Sentinel-1 backscatter depressions are candidate flood masks, not calibrated ground truth for HEC-RAS.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>External Solvers:</strong> Delft3D and DualSPHysics are external adapter interfaces; external solver execution is not included in the current demonstration environment.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Evacuation Model:</strong> The EWE transforms hydraulic arrival information and configured route assumptions into a deterministic departure window; it is not an independent physical safety model. Dynamic traffic congestion is unmodelled.</li>
            <li><strong style={{ color: "var(--jr-text, #24343A)" }}>Event Comparability:</strong> July 2024 Balganga satellite data is an observation demo, not validation of Tehri dam-break simulations.</li>
          </ul>
        </div>
      </div>

      {/* Post-Submission Timeline */}
      <div style={{
        padding: "20px",
        borderRadius: "14px",
        backgroundColor: "var(--jr-surface, #FBF8F2)",
        border: "1px solid var(--jr-border, #D8D1C5)",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <h2 style={{
          fontSize: "12px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--jr-text, #24343A)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <GitBranch size={16} color="var(--jr-blue-600, #3D8EAE)" />
          5. Post-Submission Development & Hardening Timeline
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px"
        }}>
          <div style={{ padding: "14px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
            <span style={{ fontSize: "10px", color: "#A97835", fontWeight: 800, display: "block" }}>STAGE 1</span>
            <strong style={{ color: "var(--jr-text, #24343A)", fontSize: "12.5px" }}>Problem Reinterpretation</strong>
            <p style={{ fontSize: "11.5px", color: "var(--jr-text-muted, #65747A)", margin: "6px 0 0 0" }}>Identified broader SIH26161 expectations (GEE, multi-model, export).</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
            <span style={{ fontSize: "10px", color: "var(--jr-blue-600, #3D8EAE)", fontWeight: 800, display: "block" }}>STAGE 2</span>
            <strong style={{ color: "var(--jr-text, #24343A)", fontSize: "12.5px" }}>Hydraulic & EWE Hardening</strong>
            <p style={{ fontSize: "11.5px", color: "var(--jr-text-muted, #65747A)", margin: "6px 0 0 0" }}>Bound native HDF5 2D results and locked mathematical EWE formulation.</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
            <span style={{ fontSize: "10px", color: "var(--jr-blue-800, #24566A)", fontWeight: 800, display: "block" }}>STAGE 3</span>
            <strong style={{ color: "var(--jr-text, #24343A)", fontSize: "12.5px" }}>GEE & Remote Sensing</strong>
            <p style={{ fontSize: "11.5px", color: "var(--jr-text-muted, #65747A)", margin: "6px 0 0 0" }}>Implemented Sentinel-1 multi-temporal pipeline and spatial IoU comparator.</p>
          </div>
          <div style={{ padding: "14px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
            <span style={{ fontSize: "10px", color: "var(--jr-success, #3F7D62)", fontWeight: 800, display: "block" }}>STAGE 4</span>
            <strong style={{ color: "var(--jr-text, #24343A)", fontSize: "12.5px" }}>Generalization & Release</strong>
            <p style={{ fontSize: "11.5px", color: "var(--jr-text-muted, #65747A)", margin: "6px 0 0 0" }}>Zero-hardcoding verification, 220 passing tests, and OGC KML exports.</p>
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
        backgroundColor: "var(--jr-surface, #FBF8F2)",
        border: "1px solid var(--jr-border, #D8D1C5)",
        fontSize: "12px",
        color: "var(--jr-text-muted, #65747A)"
      }}>
        <div>
          Prototype Release: <span style={{ color: "var(--jr-text, #24343A)", fontWeight: 700 }}>JalRakshak v2.0 (Post-Submission Technical Release)</span> • Build: <code style={{ color: "var(--jr-blue-600, #3D8EAE)", fontFamily: "monospace" }}>f668c7d</code>
        </div>
        <button
          onClick={onBackToMap}
          style={{
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#ffffff",
            backgroundColor: "var(--jr-blue-600, #3D8EAE)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(61, 142, 174, 0.3)"
          }}
        >
          Return to 3D Operational Map
        </button>
      </div>
    </div>
  );
};
