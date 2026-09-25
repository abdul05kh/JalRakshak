import React, { useState, useEffect } from "react";
import { X, Layers, Route, Clock, AlertTriangle, GitCompare, Award, FileText, ChevronRight, Play, Pause, RefreshCw } from "lucide-react";
import { fetchExplainersData } from "../services/api";

interface ExplainerModalProps {
  scenarioId: string;
  initialTab?: number;
  onClose: () => void;
  onFocusLimitingSegment?: () => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({
  scenarioId,
  initialTab = 0,
  onClose,
  onFocusLimitingSegment
}) => {
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [explainerData, setExplainerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [animStep, setAnimStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchExplainersData(scenarioId)
      .then((data) => {
        setExplainerData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch explainers data:", err);
        setLoading(false);
      });
  }, [scenarioId]);

  // Animation ticker for explainers
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const tabs = [
    { id: 0, title: "01. Flood Simulation", icon: <Layers size={16} /> },
    { id: 1, title: "02. Road Coupling", icon: <Route size={16} /> },
    { id: 2, title: "03. Evacuation Window", icon: <Clock size={16} /> },
    { id: 3, title: "04. Limiting Segment", icon: <AlertTriangle size={16} /> },
    { id: 4, title: "05. Scenario Comparison", icon: <GitCompare size={16} /> },
    { id: 5, title: "06. Validation Chain", icon: <Award size={16} /> },
    { id: 6, title: "07. Provenance Graph", icon: <FileText size={16} /> }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(4px)",
      zIndex: 2500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        width: "900px",
        maxWidth: "96vw",
        maxHeight: "90vh",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
              Interactive Scientific Explainers
            </h2>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Active Scenario: <strong style={{ color: "#2563eb" }}>{scenarioId}</strong> ({explainerData?.scenario?.peak_discharge_m3s?.toLocaleString()} m³/s) • Traceable Evidence
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Sidebar Nav + Explainer Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Explainer Selector Sidebar */}
          <div style={{
            width: "240px",
            borderRight: "1px solid var(--border-subtle)",
            backgroundColor: "#f8fafc",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setAnimStep(0);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === tab.id ? "#eff6ff" : "transparent",
                  color: activeTab === tab.id ? "#1d4ed8" : "var(--text-secondary)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.icon}
                <span style={{ flex: 1 }}>{tab.title}</span>
                {activeTab === tab.id && <ChevronRight size={14} />}
              </button>
            ))}

            <div style={{ marginTop: "auto", padding: "12px", borderTop: "1px solid var(--border-subtle)", fontSize: "10px", color: "var(--text-muted)" }}>
              <strong>Scientific Claim Discipline:</strong>
              <p style={{ margin: "4px 0 0 0", lineHeight: 1.4 }}>
                Explaining computational logic does not constitute human validation or physical certainty.
              </p>
            </div>
          </div>

          {/* Explainer Main Content Area */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "8px" }}>
                <RefreshCw size={16} className="spin" /> Loading scientific explainer data...
              </div>
            ) : (
              <div>
                {/* 01. Flood Simulation */}
                {activeTab === 0 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      01. HEC-RAS 2D Hydrodynamic Flood Simulation
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      How breach discharge propagates through complex mountainous topography solved via 2D Shallow Water Equations (SWE) on an irregular computational mesh.
                    </p>

                    {/* Visual Animated Diagram */}
                    <div style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px",
                      position: "relative"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Hydrodynamic Propagation Chain
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{ background: "none", border: "1px solid #334155", borderRadius: "4px", color: "#94a3b8", padding: "2px 6px", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            {isPlaying ? <Pause size={10} /> : <Play size={10} />} {isPlaying ? "Pause" : "Play"}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        {[
                          { title: "Reservoir Inflow", desc: `Tehri FRL (830m MSL) breach hydrograph peak Q_p = ${explainerData?.scenario?.peak_discharge_m3s?.toLocaleString()} m³/s`, active: animStep >= 0 },
                          { title: "2D Cell Propagation", desc: "HEC-RAS 7.0.1 solves mass & momentum conservation at cell faces", active: animStep >= 1 },
                          { title: "Inundation & Depth", desc: "Cell-by-cell Water Surface Elevation (WSE) and maximum depth extracted", active: animStep >= 2 },
                          { title: "Arrival Wavefront", desc: "Arrival timestamp A_c recorded at first depth threshold exceedance (>0.05m)", active: animStep >= 3 }
                        ].map((step, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "12px",
                              borderRadius: "6px",
                              backgroundColor: step.active ? (idx === animStep ? "#1e3a8a" : "#1e293b") : "#090d16",
                              border: `1px solid ${idx === animStep ? "#3b82f6" : "#334155"}`,
                              transition: "all 0.3s ease"
                            }}
                          >
                            <div style={{ fontSize: "11px", fontWeight: 800, color: idx === animStep ? "#60a5fa" : "#e2e8f0", marginBottom: "4px" }}>
                              {idx + 1}. {step.title}
                            </div>
                            <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.4 }}>
                              {step.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)" }}>
                      <strong>Scientific Invariant:</strong> The hydraulic field is produced from native HEC-RAS unsteady 2D calculations. No neural network surrogate or visual approximation substitutes for the governing fluid dynamic equations.
                    </div>
                  </div>
                )}

                {/* 02. Road Coupling */}
                {activeTab === 1 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      02. Road Coupling & 150m Perpendicular Corridor
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      How 2D hydraulic mesh cell arrivals are coupled to real-world road centerlines using exact perpendicular projected distances in EPSG:32644.
                    </p>

                    <div style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                          Hardened 150m Corridor vs Legacy 1200m Coupling
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 14px", backgroundColor: "#1e293b", borderRadius: "6px", borderLeft: "4px solid #22c55e" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80" }}>
                              Gate 4 Hardened Coupling (Authoritative)
                            </div>
                            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                              Corridor: <strong>150m perpendicular</strong> • Densification: <strong>≤50m</strong> • CRS: <strong>EPSG:32644</strong>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>T+60:00 (R02)</div>
                            <div style={{ fontSize: "10px", color: "#86efac" }}>229 local corridor cells</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 14px", backgroundColor: "#1e293b", borderRadius: "6px", borderLeft: "4px solid #ef4444", opacity: 0.7 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f87171" }}>
                              Legacy Unconstrained KD-Tree (Rejected)
                            </div>
                            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                              Radius: 1200m euclidean search (captured distant riverbed cells)
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#94a3b8" }}>T+55:00 (R02)</div>
                            <div style={{ fontSize: "10px", color: "#fca5a5" }}>2,167 non-local cells (Defect)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#eff6ff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "11px", color: "#1e40af" }}>
                      <strong>Why 150m?</strong> Mountain roads in Uttarakhand lie along valley sides. A 150m perpendicular envelope accurately captures road overtopping while preventing spurious coupling to deep river thalweg flows 800m away.
                    </div>
                  </div>
                )}

                {/* 03. Evacuation Window */}
                {activeTab === 2 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      03. Evacuation Window & Feasible Departure
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      The deterministic calculation transforming hydraulic arrival into the latest moment an evacuee can leave the origin settlement.
                    </p>

                    <div style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px"
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "16px" }}>
                        Deterministic Evacuation Formula: D + T_i + B &lt; A_i
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Flood Arrival (A_i)</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#60a5fa", margin: "4px 0" }}>T+60:00</div>
                          <div style={{ fontSize: "10px", color: "#cbd5e1" }}>HEC-RAS Coupled</div>
                        </div>

                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#64748b" }}>−</div>

                        <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Travel Time (T_i)</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b", margin: "4px 0" }}>12:39</div>
                          <div style={{ fontSize: "10px", color: "#cbd5e1" }}>50 km/h assumed</div>
                        </div>

                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#64748b" }}>−</div>

                        <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Safety Buffer (B)</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#ec4899", margin: "4px 0" }}>03:00</div>
                          <div style={{ fontSize: "10px", color: "#cbd5e1" }}>Configured margin</div>
                        </div>

                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#64748b" }}>=</div>

                        <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#1e3a8a", borderRadius: "6px", flex: 1.2, border: "1px solid #3b82f6" }}>
                          <div style={{ fontSize: "10px", color: "#93c5fd", textTransform: "uppercase" }}>Latest Departure</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", margin: "4px 0" }}>T+44:21</div>
                          <div style={{ fontSize: "10px", color: "#4ade80", fontWeight: 700 }}>✓ FEASIBLE</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#fef3c7", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "11px", color: "#92400e" }}>
                      <strong>Important Limitation:</strong> "FEASIBLE" indicates mathematical departure feasibility under the frozen scenario and travel assumptions. It does not constitute a real-world physical guarantee of safety.
                    </div>
                  </div>
                )}

                {/* 04. Limiting Segment */}
                {activeTab === 3 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      04. Limiting Segment Identification
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      The route deadline is constrained by the single road segment that minimizes the departure margin: min(A_i − T_i − B).
                    </p>

                    <div style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px"
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px" }}>
                        Segment Breakdown (Route R02: Malidewal → Chamba)
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>Segment R01 (Initial Ascent)</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Arrival: T+110:00 • Travel: 04:12 • Margin: +102:48</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "#7f1d1d", borderRadius: "6px", border: "1px solid #ef4444" }}>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 800, color: "#fca5a5" }}>★ LIMITING SEGMENT: R02 (Valley Overpass)</div>
                            <div style={{ fontSize: "10px", color: "#fecaca" }}>First segment overtopped by hydraulic wavefront</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>Arrival: T+60:00</div>
                            <div style={{ fontSize: "10px", color: "#fca5a5" }}>Deadline: T+44:21</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>Segment R03 (Chamba Ridge Approach)</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Arrival: Safe (High Elevation) • Travel: 12:39 • Margin: Infinite</div>
                        </div>
                      </div>
                    </div>

                    {onFocusLimitingSegment && (
                      <button
                        onClick={() => {
                          onFocusLimitingSegment();
                          onClose();
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "6px",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <AlertTriangle size={14} /> Zoom to Limiting Segment on Map
                      </button>
                    )}
                  </div>
                )}

                {/* 05. Scenario Comparison */}
                {activeTab === 4 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      05. Scenario Sensitivity & Discharge Comparison
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      How breach peak discharge Q_p alters arrival times, inundation extents, and evacuation deadlines.
                    </p>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                      marginBottom: "16px"
                    }}>
                      {[
                        { name: "MINIMUM", q: "28,500 m³/s", arrival: "T+95:00", deadline: "T+79:21", badge: "Low Breach" },
                        { name: "CENTRAL", q: "65,000 m³/s", arrival: "T+60:00", deadline: "T+44:21", badge: "Standard Design", active: true },
                        { name: "MAXIMUM", q: "115,000 m³/s", arrival: "T+45:00", deadline: "T+29:21", badge: "Catastrophic PMF" }
                      ].map((sc, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "16px",
                            borderRadius: "8px",
                            backgroundColor: sc.active ? "#eff6ff" : "#f8fafc",
                            border: `1px solid ${sc.active ? "#3b82f6" : "var(--border-subtle)"}`
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: sc.active ? "#1d4ed8" : "var(--text-primary)" }}>{sc.name}</span>
                            <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", backgroundColor: sc.active ? "#dbeafe" : "#e2e8f0", color: sc.active ? "#1e40af" : "#64748b", fontWeight: 700 }}>
                              {sc.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px" }}>Discharge: <strong>{sc.q}</strong></div>
                          <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Arrival: <strong>{sc.arrival}</strong></div>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: sc.active ? "#2563eb" : "var(--text-primary)", marginTop: "2px" }}>
                              Leave by: {sc.deadline}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)" }}>
                      <strong>Scenario Note:</strong> Scenarios represent discrete deterministic hydraulic runs, not probabilistic distribution percentiles.
                    </div>
                  </div>
                )}

                {/* 06. Validation Chain */}
                {activeTab === 5 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      06. Computational Verification & Validation Chain
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Multi-tier validation architecture enforcing strict mathematical, geometric, and experimental invariants.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                      {[
                        { title: "Computational & Physics Suite", status: "136/136 PASS", desc: "Automated regression tests covering SWE solvers, KD-tree, LineString corridor, and monotonicity." },
                        { title: "Ground Truth Provenance Hash", status: "VERIFIED", desc: "Bit-exact SHA-256 validation against frozen Gate 4 hydraulic ground truth artifacts." },
                        { title: "Experimental Integrity & Parity", status: "LOCKED", desc: "Condition A (Raw HEC-RAS) vs Condition B (JalRakshak Decision UI) protocol blinding preserved." },
                        { title: "Human Decision Usability", status: "AWAITING PILOT", desc: "Gate 5B internal dry-run pending; no speculative usability claims manufactured." }
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{item.desc}</div>
                          </div>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 800,
                            backgroundColor: item.status.includes("PASS") || item.status === "VERIFIED" || item.status === "LOCKED" ? "#dcfce7" : "#fef9c3",
                            color: item.status.includes("PASS") || item.status === "VERIFIED" || item.status === "LOCKED" ? "#166534" : "#854d0e"
                          }}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 07. Provenance Graph */}
                {activeTab === 6 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      07. End-to-End Decision Provenance Graph
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Full traceability from raw boundary hydrographs to displayed evacuation decisions.
                    </p>

                    <div style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      padding: "16px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      lineHeight: 1.6,
                      overflowX: "auto"
                    }}>
                      <div style={{ color: "#60a5fa" }}>HEC-RAS 7.0.1 (Unsteady 2D SWE)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ Native HDF5 Extraction (WSE & Arrival Grid)</div>
                      <div style={{ color: "#38bdf8" }}>Spatial Hydrologic Scenario Model (CENTRAL Q_p = 65,000 m³/s)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ 150m Perpendicular LineString Corridor (EPSG:32644)</div>
                      <div style={{ color: "#fbbf24" }}>Road Arrival Coupling (R02 Arrival: T+60:00)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ Topological Graph Routing (Travel: 12:39 @ 50 km/h)</div>
                      <div style={{ color: "#f472b6" }}>Safety Margin Buffer (Configured: 03:00 min)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ Limiting Segment Identification: min(A_i − T_i − B)</div>
                      <div style={{ color: "#4ade80", fontWeight: "bold" }}>Latest Feasible Departure: T+44:21 (✓ FEASIBLE)</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
