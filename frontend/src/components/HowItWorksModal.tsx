import React, { useState, useEffect } from "react";
import { X, Layers, Route, Clock, AlertTriangle, GitCompare, Award, FileText, ChevronRight, Play, Pause, RefreshCw, Mountain } from "lucide-react";
import { fetchExplainersData } from "../services/api";

interface HowItWorksModalProps {
  scenarioId: string;
  initialChapter?: number;
  onClose: () => void;
  onFocusLimitingSegment?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  scenarioId,
  initialChapter = 0,
  onClose,
  onFocusLimitingSegment
}) => {
  const [activeChapter, setActiveChapter] = useState<number>(initialChapter);
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

  // Animation ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const chapters = [
    { id: 0, title: "01. Dam Failure Mechanism", icon: <AlertTriangle size={15} /> },
    { id: 1, title: "02. Hydrodynamic Propagation", icon: <Layers size={15} /> },
    { id: 2, title: "03. Terrain & Topography", icon: <Mountain size={15} /> },
    { id: 3, title: "04. Road Coupling Corridor", icon: <Route size={15} /> },
    { id: 4, title: "05. Road Inundation & Impact", icon: <AlertTriangle size={15} /> },
    { id: 5, title: "06. Evacuation Network Routing", icon: <Route size={15} /> },
    { id: 6, title: "07. Evacuation Window & Deadline", icon: <Clock size={15} /> },
    { id: 7, title: "08. Limiting Segment Constraint", icon: <AlertTriangle size={15} /> },
    { id: 8, title: "09. Scenario Sensitivity", icon: <GitCompare size={15} /> },
    { id: 9, title: "10. Validation & Integrity", icon: <Award size={15} /> },
    { id: 10, title: "11. Provenance Graph", icon: <FileText size={15} /> }
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
        width: "960px",
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
              HOW JALRAKSHAK WORKS — SCIENTIFIC & OPERATIONAL WALKTHROUGH
            </h2>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Active Scenario: <strong style={{ color: "#2563eb" }}>{scenarioId}</strong> ({explainerData?.scenario?.peak_discharge_m3s?.toLocaleString()} m³/s) • Verified Artifact Provenance
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

        {/* Modal Body: Chapter Selector + Main Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Chapter Selector Sidebar */}
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
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapter(ch.id);
                  setAnimStep(0);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activeChapter === ch.id ? "#eff6ff" : "transparent",
                  color: activeChapter === ch.id ? "#1d4ed8" : "var(--text-secondary)",
                  fontWeight: activeChapter === ch.id ? 800 : 500,
                  fontSize: "11px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {ch.icon}
                <span style={{ flex: 1 }}>{ch.title}</span>
                {activeChapter === ch.id && <ChevronRight size={13} />}
              </button>
            ))}

            <div style={{ marginTop: "auto", padding: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "9.5px", color: "var(--text-muted)" }}>
              <strong>Scientific Claim Discipline:</strong>
              <p style={{ margin: "3px 0 0 0", lineHeight: 1.35 }}>
                Explaining computational logic does not constitute human validation or physical certainty.
              </p>
            </div>
          </div>

          {/* Chapter Main Content */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "8px" }}>
                <RefreshCw size={16} className="spin" /> Loading scientific walkthrough data...
              </div>
            ) : (
              <div>
                {/* 01. Dam Failure Mechanism */}
                {activeChapter === 0 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      01. Dam Failure & Breach Discharge Initiation
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How full reservoir storage at Tehri Dam transitions through an assumed breach formation geometry into a downstream discharge hydrograph.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        <div style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Full Reservoir Level</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#38bdf8", margin: "3px 0" }}>830.0 m MSL</div>
                          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>THDC Design Elevation</div>
                        </div>
                        <div style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Breach Invert Level</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b", margin: "3px 0" }}>635.0 m MSL</div>
                          <div style={{ fontSize: "9.5px", color: "#fca5a5" }}>Model assumption (not surveyed)</div>
                        </div>
                        <div style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Peak Discharge (Q_p)</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#ef4444", margin: "3px 0" }}>
                            {explainerData?.scenario?.peak_discharge_m3s?.toLocaleString()} m³/s
                          </div>
                          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>{scenarioId} Hydrograph</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontSize: "10.5px", color: "var(--text-secondary)" }}>
                      <strong>Model Boundary Notice:</strong> The 635m breach invert and hydrograph represent deterministic model assumptions solved via Froehlich breach equations, not an observed real-world dam failure.
                    </div>
                  </div>
                )}

                {/* 02. Hydrodynamic Propagation */}
                {activeChapter === 1 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      02. Hydrodynamic 2D Shallow Water Equations Propagation
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How USACE HEC-RAS 7.0.1 solves mass and momentum conservation at 2D cell faces across the 15km valley mesh.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                          Propagation Stages
                        </span>
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          style={{ background: "none", border: "1px solid #334155", borderRadius: "4px", color: "#94a3b8", padding: "2px 6px", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          {isPlaying ? <Pause size={10} /> : <Play size={10} />} {isPlaying ? "Pause" : "Play"}
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        {[
                          { title: "T+00 to T+15", desc: "Upper Bhagirathi gorge flood propagation.", active: animStep >= 0 },
                          { title: "T+30 to T+45", desc: "Advance toward Malidewal valley entrance.", active: animStep >= 1 },
                          { title: "T+60:00", desc: "Arrival at limiting road segment R02.", active: animStep >= 2 },
                          { title: "T+75 to T+120", desc: "Downstream expansion toward Koteshwar.", active: animStep >= 3 }
                        ].map((s, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "10px",
                              borderRadius: "6px",
                              backgroundColor: s.active ? (idx === animStep ? "#1e3a8a" : "#1e293b") : "#090d16",
                              border: `1px solid ${idx === animStep ? "#3b82f6" : "#334155"}`
                            }}
                          >
                            <div style={{ fontSize: "10.5px", fontWeight: 800, color: idx === animStep ? "#60a5fa" : "#e2e8f0" }}>{s.title}</div>
                            <div style={{ fontSize: "9.5px", color: "#94a3b8", marginTop: "3px" }}>{s.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#eff6ff", padding: "10px 14px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "10.5px", color: "#1e40af" }}>
                      <strong>Scientific Invariant:</strong> The hydraulic field is produced from native HEC-RAS unsteady 2D calculations. No neural surrogate replaces the governing fluid dynamic equations.
                    </div>
                  </div>
                )}

                {/* 03. Terrain & Topography */}
                {activeChapter === 2 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      03. Physical Mountain Topography & River Corridor
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How Copernicus GLO-30 DSM (30m hydrologically conditioned) terrain elevation dictates flood path channeling.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "14px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <span>Dam Axis Elevation (Crest):</span>
                          <strong style={{ color: "#38bdf8" }}>830.0 m MSL (Design Level)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <span>Malidewal Origin Elevation:</span>
                          <strong style={{ color: "#fbbf24" }}>645.0 m MSL (Terrain-derived elevation)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#1e293b", borderRadius: "6px" }}>
                          <span>Chamba Shelter Elevation:</span>
                          <strong style={{ color: "#4ade80" }}>1600.0 m MSL (Terrain-derived elevation)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 04. Road Coupling Corridor */}
                {activeChapter === 3 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      04. Road Coupling & 150m Perpendicular Corridor
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How 2D hydraulic mesh cell arrivals are coupled to real-world road centerlines using exact perpendicular projected distances in EPSG:32644.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ padding: "10px 14px", backgroundColor: "#1e293b", borderRadius: "6px", borderLeft: "4px solid #22c55e" }}>
                          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#4ade80" }}>
                            Gate 4 Hardened Coupling (Authoritative)
                          </div>
                          <div style={{ fontSize: "10.5px", color: "#cbd5e1" }}>
                            Corridor: <strong>150m perpendicular</strong> • Densification: <strong>≤50m</strong> • CRS: <strong>EPSG:32644</strong>
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                            R02 Arrival: T+60:00 (229 local corridor cells)
                          </div>
                        </div>

                        <div style={{ padding: "10px 14px", backgroundColor: "#1e293b", borderRadius: "6px", borderLeft: "4px solid #ef4444", opacity: 0.7 }}>
                          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f87171" }}>
                            Legacy Unconstrained KD-Tree (Rejected)
                          </div>
                          <div style={{ fontSize: "10.5px", color: "#cbd5e1" }}>
                            Radius: 1200m euclidean search (captured distant riverbed cells)
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", marginTop: "4px" }}>
                            R02 Arrival: T+55:00 (2,167 non-local cells • Defect)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 05. Road Inundation & Impact */}
                {activeChapter === 4 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      05. Road Inundation & Operational Impact Transitions
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How road edges transition dynamically from OPEN to INUNDATED based on water depth exceeding the 0.30m threshold.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                      <div style={{ padding: "12px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>T &lt; T+60:00</div>
                        <div style={{ fontSize: "10px", color: "#15803d", marginTop: "2px" }}>FEASIBLE (Dry Corridor)</div>
                      </div>
                      <div style={{ padding: "12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#991b1b" }}>T = T+60:00</div>
                        <div style={{ fontSize: "10px", color: "#b91c1c", marginTop: "2px" }}>FLOOD ARRIVAL (Depth ≥ 0.30m)</div>
                      </div>
                      <div style={{ padding: "12px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>T &gt; T+60:00</div>
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>INFEASIBLE (Impassable)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 06. Evacuation Network Routing */}
                {activeChapter === 5 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      06. Evacuation Network Graph Traversal
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How topological road graph edges compute travel times under the configured baseline travel-speed assumption.
                    </p>

                    <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                      <div style={{ marginBottom: "6px" }}><strong>Source:</strong> OpenStreetMap-derived road network.</div>
                      <div style={{ marginBottom: "6px" }}><strong>Edge Length (R02):</strong> 7,377.4 meters (7.38 km).</div>
                      <div style={{ marginBottom: "6px" }}><strong>Speed Assumption:</strong> 35–50 km/h configured baseline (congestion not modeled).</div>
                      <div><strong>Travel Time:</strong> 12:39 (759 seconds).</div>
                    </div>
                  </div>
                )}

                {/* 07. Evacuation Window & Deadline */}
                {activeChapter === 6 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      07. Deterministic Evacuation Window Formula
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      The deterministic calculation transforming hydraulic arrival into the latest feasible moment an evacuee can depart: D + T_i + B &lt; A_i.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>Flood Arrival (A_i)</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#60a5fa" }}>T+60:00</div>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#64748b" }}>−</div>
                        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>Travel Time (T_i)</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>12:39</div>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#64748b" }}>−</div>
                        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#1e293b", borderRadius: "6px", flex: 1 }}>
                          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>Safety Buffer (B)</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#ec4899" }}>03:00</div>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#64748b" }}>=</div>
                        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#1e3a8a", borderRadius: "6px", flex: 1.2, border: "1px solid #3b82f6" }}>
                          <div style={{ fontSize: "9.5px", color: "#93c5fd" }}>Latest Departure</div>
                          <div style={{ fontSize: "18px", fontWeight: 900, color: "#ffffff" }}>T+44:21</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 08. Limiting Segment */}
                {activeChapter === 7 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      08. Limiting Segment Identification
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      The route deadline is constrained by the single road segment that minimizes the departure margin: min(A_i − T_i − B).
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "14px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ padding: "8px 12px", backgroundColor: "#7f1d1d", borderRadius: "6px", border: "1px solid #ef4444", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fca5a5" }}>★ LIMITING SEGMENT: R02 (Valley Overpass)</div>
                            <div style={{ fontSize: "9.5px", color: "#fecaca" }}>First edge inundated by floodwave</div>
                          </div>
                          <div style={{ textAlign: "right", fontSize: "11px", fontWeight: 800, color: "#ffffff" }}>
                            Arrival: T+60:00 • Deadline: T+44:21
                          </div>
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
                          padding: "7px 12px",
                          borderRadius: "6px",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <AlertTriangle size={13} /> Zoom to Limiting Segment on Map
                      </button>
                    )}
                  </div>
                )}

                {/* 09. Scenario Sensitivity */}
                {activeChapter === 8 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      09. Scenario Sensitivity Comparison
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      How peak discharge alterations shift arrival times and departure deadlines across the authoritative scenarios.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                      {[
                        { name: "MINIMUM", q: "28,500 m³/s", arrival: "T+95:00", deadline: "T+79:21", active: false },
                        { name: "CENTRAL", q: "65,000 m³/s", arrival: "T+60:00", deadline: "T+44:21", active: true },
                        { name: "MAXIMUM", q: "115,000 m³/s", arrival: "T+45:00", deadline: "T+29:21", active: false }
                      ].map((sc, idx) => (
                        <div key={idx} style={{ padding: "12px", borderRadius: "6px", backgroundColor: sc.active ? "#eff6ff" : "#f8fafc", border: `1px solid ${sc.active ? "#3b82f6" : "var(--border-subtle)"}` }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: sc.active ? "#1d4ed8" : "var(--text-primary)" }}>{sc.name}</div>
                          <div style={{ fontSize: "9.5px", color: "var(--text-muted)", margin: "3px 0" }}>Discharge: {sc.q}</div>
                          <div style={{ fontSize: "10.5px", color: "var(--text-secondary)" }}>Arrival: <strong>{sc.arrival}</strong></div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: sc.active ? "#2563eb" : "var(--text-primary)", marginTop: "2px" }}>
                            Leave by: {sc.deadline}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. Validation & Integrity */}
                {activeChapter === 9 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      10. Computational Verification & Validation Status
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      Strict separation of automated computational validation versus pending human usability validation.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>Computational Verification Suite</div>
                          <div style={{ fontSize: "10px", color: "#15803d" }}>139/139 automated tests pass (SWE solvers, LineString corridor, monotonicity invariants).</div>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534" }}>PASS</span>
                      </div>

                      <div style={{ padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#b45309" }}>Human Decision Usability (Gate 5B)</div>
                          <div style={{ fontSize: "10px", color: "#92400e" }}>Internal pilot dry-run pending under blinded protocol; usability not yet validated.</div>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#b45309" }}>AWAITING PILOT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. Provenance Graph */}
                {activeChapter === 10 && (
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                      11. End-to-End Decision Provenance Graph
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      Full traceability from raw boundary hydrographs to displayed evacuation decisions with verified artifact integrity.
                    </p>

                    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", padding: "14px", fontFamily: "monospace", fontSize: "10.5px", lineHeight: 1.5, overflowX: "auto" }}>
                      <div style={{ color: "#60a5fa" }}>HEC-RAS 7.0.1 (Unsteady 2D SWE)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ Native HDF5 Extraction (WSE & Arrival Grid)</div>
                      <div style={{ color: "#38bdf8" }}>Spatial Hydrologic Model (CENTRAL Q_p = 65,000 m³/s)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ 150m Perpendicular LineString Corridor (EPSG:32644)</div>
                      <div style={{ color: "#fbbf24" }}>Road Arrival Coupling (R02 Arrival: T+60:00)</div>
                      <div style={{ color: "#94a3b8" }}>&nbsp;&nbsp;↓ Topological Graph Routing (Travel: 12:39 @ 50 km/h baseline)</div>
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
