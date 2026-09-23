import React from "react";
import { Layers, Info, Sliders, Waves, Navigation, Shield, Home } from "lucide-react";
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
  return (
    <aside style={{
      width: "280px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 58px)",
      overflowY: "auto",
      padding: "16px",
      gap: "20px"
    }}>
      {/* Active Breach Parameters Card */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Sliders size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
            Breach Physics Parameters
          </span>
        </div>
        
        {scenario ? (
          <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Breach Width:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{scenario.breach_width_m} m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Formation Time:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{scenario.breach_formation_min} min</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Peak Discharge:</span>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>{scenario.peak_discharge_m3s.toLocaleString()} m³/s</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Breach Invert:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{scenario.breach_elevation_m} m MSL</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "6px", fontSize: "10px", color: "var(--text-muted)" }}>
              Solver: {scenario.solver}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Loading scenario...</div>
        )}
      </div>

      {/* Layer Toggles */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Layers size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
            Geospatial Layers
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            backgroundColor: layerVisibility.inundation ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.inundation ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
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
            padding: "8px 10px",
            backgroundColor: layerVisibility.roads ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.roads ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Navigation size={14} color="#64748b" />
              <span>Road Network (PWD/NH)</span>
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
            padding: "8px 10px",
            backgroundColor: layerVisibility.origins ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.origins ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Home size={14} color="#d97706" />
              <span>Vulnerable Settlements (Origins)</span>
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
            padding: "8px 10px",
            backgroundColor: layerVisibility.destinations ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${layerVisibility.destinations ? "#bfdbfe" : "var(--border-subtle)"}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={14} color="#16a34a" />
              <span>Safe High Shelters (Destinations)</span>
            </div>
            <input
              type="checkbox"
              checked={layerVisibility.destinations}
              onChange={() => onToggleLayer("destinations")}
            />
          </label>
        </div>
      </div>

      {/* Map Legend */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Info size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
            Operational Map Legend
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
            <div style={{ width: "14px", height: "14px", backgroundColor: "rgba(14, 165, 233, 0.45)", border: "1.5px solid #0284c7", borderRadius: "3px" }} />
            <span style={{ color: "var(--text-secondary)" }}>Active Floodplain Inundation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "16px", height: "4px", backgroundColor: "#2563eb", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)" }}>Feasible Evacuation Path</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "16px", height: "4px", backgroundColor: "#dc2626", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>First Limiting Road Segment</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: "#d97706", borderRadius: "50%" }} />
            <span style={{ color: "var(--text-secondary)" }}>Vulnerable Origin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: "#16a34a", borderRadius: "50%" }} />
            <span style={{ color: "var(--text-secondary)" }}>Safe Relief Shelter</span>
          </div>
        </div>
      </div>

      {/* Scientific Note */}
      <div style={{
        marginTop: "auto",
        padding: "8px",
        backgroundColor: "#f1f5f9",
        borderRadius: "4px",
        fontSize: "10px",
        color: "var(--text-muted)",
        lineHeight: "1.4"
      }}>
        <strong>Decision-Support Notice:</strong> Route feasibility is conditional on the hydraulic scenario, network data, and configured travel assumptions. Not an emergency executive order.
      </div>
    </aside>
  );
};
