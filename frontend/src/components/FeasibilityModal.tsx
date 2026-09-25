import React from "react";
import { X, Code2, ShieldAlert } from "lucide-react";

interface FeasibilityModalProps {
  onClose: () => void;
}

export const FeasibilityModal: React.FC<FeasibilityModalProps> = ({ onClose }) => {
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
        width: "900px",
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
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
              FEASIBILITY & VERIFIED TECHNOLOGY STACK
            </h2>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Operational Transformation • Verified Technologies • System Limitations
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
              color: "var(--text-muted)"
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section 1: The Transformation */}
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
              1. What Changes With JalRakshak?
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Raw Hydraulic Simulation Output
                </div>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "10.5px", color: "#64748b", lineHeight: 1.5 }}>
                  <li>433 raw HDF5 mesh timesteps</li>
                  <li>Spatial 2D cell water surface elevations (WSE)</li>
                  <li>Maximum velocity & depth fields</li>
                  <li>Requires specialist hydraulic interpretation</li>
                </ul>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e40af", marginBottom: "4px" }}>
                  JalRakshak Decision-Support Output
                </div>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "10.5px", color: "#1d4ed8", lineHeight: 1.5 }}>
                  <li>Road-coupled flood arrival times ($T+60:00$)</li>
                  <li>Deterministic latest feasible departure ($T+44:21$)</li>
                  <li>Constraining limiting segment identification (R02)</li>
                  <li>Plain-language explainable decision triad</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Verified Technology Stack */}
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <Code2 size={16} color="#2563eb" /> 2. Verified Production Technology Stack
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Hydraulics & Solvers</div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>USACE HEC-RAS 7.0.1 2D SWE Unsteady Solver (HDF5 Extraction)</div>
              </div>
              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Backend & Computational</div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>FastAPI, Python, NumPy, SciPy, Shapely, NetworkX</div>
              </div>
              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>Frontend & WebGL 3D</div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>React 19, TypeScript, MapLibre GL JS, Vite</div>
              </div>
            </div>
          </div>

          {/* Section 3: Limitations & Operational Notice */}
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldAlert size={16} color="#d97706" /> 3. Documented Limitations & Operational Scope
            </h3>
            <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "10.5px", color: "#92400e", lineHeight: 1.45 }}>
              • <strong>Static Speed Assumption:</strong> Baseline travel speed is configured at 35–50 km/h; dynamic traffic congestion and panic-induced bottlenecks are not modeled.<br />
              • <strong>Hydrodynamic Scope:</strong> Flood extents reflect bare-earth 2D hydrodynamic flow; culvert blockages and structural bridge failures are not modeled.<br />
              • <strong>Human Validation:</strong> Decision usefulness is currently under evaluation (Gate 5B internal pilot pending); operational readiness is not yet established.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
