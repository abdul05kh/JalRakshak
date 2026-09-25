import React, { useState } from "react";
import { Layers, Info, Sliders, Waves, Navigation, Shield, Home, Clock, ChevronDown, ChevronRight } from "lucide-react";
import type { ScenarioSummary } from "../types";

interface SidebarProps {
  scenario: ScenarioSummary | null;
  layerVisibility: {
    inundation: boolean;
    roads: boolean;
    origins: boolean;
    destinations: boolean;
  };
  onToggleLayer: (layer: keyof SidebarProps["layerVisibility"]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  scenario,
  layerVisibility,
  onToggleLayer
}) => {
  const [showBreachDetails, setShowBreachDetails] = useState<boolean>(false);

  return (
    <aside style={{
      width: "290px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 58px)",
      overflowY: "auto",
      padding: "16px",
      gap: "14px",
      boxSizing: "border-box"
    }}>
      {/* 1. Flood Scenario & Simulation Reference Time */}
      <div style={{
        backgroundColor: "#f8fafc",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
            Active Scenario
          </span>
          <span style={{
            fontSize: "9px",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: scenario?.source_type === "HECRAS_REAL_RESULT" ? "#dbeafe" : "#dcfce7",
            color: scenario?.source_type === "HECRAS_REAL_RESULT" ? "#1d4ed8" : "#166534"
          }}>
            {scenario?.source_type === "HECRAS_REAL_RESULT" ? "HEC-RAS 7.0.1" : "SYNTHETIC FIXTURE"}
          </span>
        </div>

        <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.3 }}>
          {scenario ? scenario.name : "Loading scenario..."}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
          padding: "6px 8px",
          marginTop: "2px"
        }}>
          <Clock size={14} color="#2563eb" />
          <div style={{ fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>Breach Inception: </span>
            <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>T + 00:00</strong>
          </div>
        </div>
      </div>

      {/* 2. Map Layer Controls */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Layers size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
            Essential Map Layers
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 10px",
            backgroundColor: layerVisibility.inundation ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.inundation ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Waves size={14} color="#0284c7" />
              <span>Inundation Hazard Extent</span>
            </div>
            <input
              type="checkbox"
              checked={layerVisibility.inundation}
              onChange={() => onToggleLayer("inundation")}
            />
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 10px",
            backgroundColor: layerVisibility.roads ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.roads ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Navigation size={14} color="#64748b" />
              <span>Road Network (NH / SH)</span>
            </div>
            <input
              type="checkbox"
              checked={layerVisibility.roads}
              onChange={() => onToggleLayer("roads")}
            />
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 10px",
            backgroundColor: layerVisibility.origins ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.origins ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Home size={14} color="#d97706" />
              <span>Origins (Settlements)</span>
            </div>
            <input
              type="checkbox"
              checked={layerVisibility.origins}
              onChange={() => onToggleLayer("origins")}
            />
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 10px",
            backgroundColor: layerVisibility.destinations ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.destinations ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={14} color="#15803d" />
              <span>Destinations (Shelters)</span>
            </div>
            <input
              type="checkbox"
              checked={layerVisibility.destinations}
              onChange={() => onToggleLayer("destinations")}
            />
          </label>
        </div>
      </div>

      {/* 3. Decision Map Legend */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Info size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
            Map Legend
          </span>
        </div>

        <div style={{
          backgroundColor: "#f8fafc",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "10px",
          fontSize: "11px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "14px", height: "14px", backgroundColor: "rgba(56, 189, 248, 0.4)", border: "1.5px solid #0369a1", borderRadius: "3px" }} />
            <span style={{ color: "var(--text-secondary)" }}>Flood Hazard Extent</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "18px", height: "5px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Evaluated Route</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "18px", height: "5px", backgroundColor: "#dc2626", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>Limiting Segment (Bottleneck)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: "#d97706", borderRadius: "50%" }} />
            <span style={{ color: "var(--text-secondary)" }}>Origin Settlement</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: "#15803d", borderRadius: "50%" }} />
            <span style={{ color: "var(--text-secondary)" }}>Evacuation Shelter</span>
          </div>
        </div>
      </div>

      {/* 4. Progressive Disclosure: Breach Parameters */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        overflow: "hidden"
      }}>
        <button
          onClick={() => setShowBreachDetails(!showBreachDetails)}
          style={{
            width: "100%",
            padding: "8px 10px",
            backgroundColor: "#f8fafc",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sliders size={13} />
            <span>Scenario Breach Details</span>
          </div>
          {showBreachDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {showBreachDetails && scenario && (
          <div style={{
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "11px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Peak Discharge:</span>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>{scenario.peak_discharge_m3s.toLocaleString()} m³/s</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Breach Width:</span>
              <span style={{ fontWeight: 700 }}>{scenario.breach_width_m} m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Formation Time:</span>
              <span style={{ fontWeight: 700 }}>{scenario.breach_formation_min} min</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Breach Elevation:</span>
              <span style={{ fontWeight: 600 }}>{scenario.breach_elevation_m} m MSL</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "4px", fontSize: "10px", color: "var(--text-muted)" }}>
              Hydraulic Engine: {scenario.solver}
            </div>
          </div>
        )}
      </div>

      {/* Decision-Support Scientific Notice */}
      <div style={{
        marginTop: "auto",
        padding: "8px",
        backgroundColor: "#f1f5f9",
        borderRadius: "4px",
        fontSize: "10px",
        color: "var(--text-muted)",
        lineHeight: "1.4"
      }}>
        <strong>Decision Support:</strong> Evacuation route feasibility is derived from precomputed hydraulic scenarios and graph constraints. Not an official executive evacuation order.
      </div>
    </aside>
  );
};
