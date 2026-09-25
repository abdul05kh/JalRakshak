import React from "react";
import { 
  ShieldCheck, 
  Map, 
  Waves, 
  Clock, 
  Network, 
  Award, 
  FileCheck 
} from "lucide-react";
import type { ScenarioSummary, Dam } from "../types";

export type ViewType = 
  | "OPERATIONAL_MAP" 
  | "FLOOD_SIMULATION" 
  | "EVACUATION_DECISION" 
  | "ROAD_IMPACT" 
  | "ARCHITECTURE"
  | "FEASIBILITY"
  | "SCIENCE_VALIDATION" 
  | "PROVENANCE"
  | "ARCGIS_TERRAIN_TEST";

interface HeaderProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  dam: Dam | null;
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  activeTimestepMin?: number;
  activeView: ViewType;
  onNavigateToView: (view: ViewType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios: _scenarios,
  activeScenarioId,
  onSelectScenario,
  dam,
  selectedRouteId,
  onSelectRouteId,
  activeTimestepMin = 60,
  activeView,
  onNavigateToView
}) => {

  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: "OPERATIONAL_MAP", label: "3D MAP", icon: <Map size={13} /> },
    { id: "FLOOD_SIMULATION", label: "SIMULATION", icon: <Waves size={13} /> },
    { id: "EVACUATION_DECISION", label: "DECISION", icon: <Clock size={13} /> },
    { id: "ROAD_IMPACT", label: "ROAD IMPACT", icon: <Network size={13} /> },
    { id: "SCIENCE_VALIDATION", label: "SCIENCE", icon: <Award size={13} /> },
    { id: "PROVENANCE", label: "PROVENANCE", icon: <FileCheck size={13} /> },
    { id: "ARCGIS_TERRAIN_TEST", label: "TERRAIN TEST", icon: <ShieldCheck size={13} /> }
  ];

  return (
    <header style={{
      height: "50px",
      backgroundColor: "#0f172a",
      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      zIndex: 1000,
      userSelect: "none",
      color: "#ffffff"
    }}>
      {/* Left: Brand & Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div 
          onClick={() => onNavigateToView("OPERATIONAL_MAP")}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <div style={{
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)"
          }}>
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 900, fontSize: "14px", letterSpacing: "-0.3px", color: "#ffffff" }}>
            JALRAKSHAK
          </span>
        </div>

        {dam && (
          <span style={{
            fontSize: "10.5px",
            color: "#94a3b8",
            fontWeight: 600,
            paddingLeft: "8px",
            borderLeft: "1px solid rgba(255, 255, 255, 0.15)"
          }}>
            {dam.name} ({dam.river_name})
          </span>
        )}
      </div>

      {/* Middle: Scenario & Route Selectors */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Scenario Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            SCENARIO:
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              backgroundColor: "#0f172a",
              fontSize: "11px",
              fontWeight: 700,
              color: "#38bdf8",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="SCENARIO_CENTRAL">CENTRAL (Qp = 65,000 m³/s)</option>
            <option value="SCENARIO_MINIMUM">MINIMUM (Qp = 28,500 m³/s)</option>
            <option value="SCENARIO_MAXIMUM">MAXIMUM (Qp = 115,000 m³/s)</option>
          </select>
        </div>

        {/* Route Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ROUTE:
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => onSelectRouteId(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              backgroundColor: "#0f172a",
              fontSize: "11px",
              fontWeight: 700,
              color: "#38bdf8",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="R02">R02 — Chamba via Koteshwar (Primary)</option>
            <option value="R01">R01 — Chamba High Ridge</option>
          </select>
        </div>

        {/* Timestep Badge */}
        <div style={{
          padding: "4px 9px",
          borderRadius: "5px",
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          color: "#38bdf8",
          fontSize: "11px",
          fontWeight: 800,
          fontFamily: "monospace",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          <Clock size={12} color="#38bdf8" />
          <span>T+{activeTimestepMin.toString().padStart(2, "0")}:00</span>
        </div>
      </div>

      {/* Right: Full-Screen Navigation Tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateToView(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "5px 9px",
                borderRadius: "6px",
                border: isActive ? "1px solid #3b82f6" : "1px solid transparent",
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.25)" : "transparent",
                color: isActive ? "#93c5fd" : "#cbd5e1",
                fontSize: "11px",
                fontWeight: isActive ? 800 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
