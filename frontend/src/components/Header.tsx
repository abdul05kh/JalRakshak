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
  | "ARCGIS_TERRAIN_TEST"
  | "POST_SUBMISSION_UPDATE";

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
  onOpenPostSubmissionModal?: () => void;
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
  onNavigateToView,
  onOpenPostSubmissionModal
}) => {

  const operationalNav: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: "OPERATIONAL_MAP", label: "3D MAP", icon: <Map size={12} /> },
    { id: "EVACUATION_DECISION", label: "DECISION", icon: <Clock size={12} /> },
    { id: "ROAD_IMPACT", label: "ROADS", icon: <Network size={12} /> }
  ];

  const evidenceNav: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: "FLOOD_SIMULATION", label: "SIM", icon: <Waves size={12} /> },
    { id: "SCIENCE_VALIDATION", label: "SCIENCE", icon: <Award size={12} /> },
    { id: "PROVENANCE", label: "AUDIT", icon: <FileCheck size={12} /> },
    { id: "ARCGIS_TERRAIN_TEST", label: "TEST", icon: <ShieldCheck size={12} /> }
  ];

  return (
    <header style={{
      height: "50px",
      backgroundColor: "var(--jr-surface, #FBF8F2)",
      borderBottom: "1px solid var(--jr-border, #D8D1C5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px",
      zIndex: 1000,
      userSelect: "none",
      color: "var(--jr-text, #24343A)",
      maxWidth: "100vw",
      boxSizing: "border-box",
      overflowX: "auto",
      scrollbarWidth: "none"
    }}>
      {/* Left: Brand & Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <div 
          onClick={() => onNavigateToView("OPERATIONAL_MAP")}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            backgroundColor: "var(--jr-blue-600, #3D8EAE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 6px rgba(61, 142, 174, 0.3)"
          }}>
            <ShieldCheck size={14} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 900, fontSize: "13px", letterSpacing: "-0.3px", color: "var(--jr-text, #24343A)" }}>
            JALRAKSHAK
          </span>
        </div>

        {dam && (
          <span className="mobile-hide" style={{
            fontSize: "9.5px",
            color: "var(--jr-text-muted, #65747A)",
            fontWeight: 600,
            paddingLeft: "6px",
            borderLeft: "1px solid var(--jr-border, #D8D1C5)",
            maxWidth: "110px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {dam.name}
          </span>
        )}
      </div>

      {/* Middle: Scenario & Route Selectors */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Scenario Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            SCENARIO:
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid var(--jr-border, #D8D1C5)",
              backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
              fontSize: "10.5px",
              fontWeight: 700,
              color: "var(--jr-blue-800, #24566A)",
              cursor: "pointer",
              outline: "none",
              maxWidth: "140px"
            }}
          >
            <option value="SCENARIO_CENTRAL">Central (65k m³/s)</option>
            <option value="SCENARIO_MINIMUM">Min (28.5k m³/s)</option>
            <option value="SCENARIO_MAXIMUM">Max (115k m³/s)</option>
          </select>
        </div>

        {/* Route Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ROUTE:
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => onSelectRouteId(e.target.value)}
            style={{
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid var(--jr-border, #D8D1C5)",
              backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
              fontSize: "10.5px",
              fontWeight: 700,
              color: "var(--jr-blue-800, #24566A)",
              cursor: "pointer",
              outline: "none",
              maxWidth: "135px"
            }}
          >
            <option value="R02">R02: Chamba Primary</option>
            <option value="R01">R01: High Ridge</option>
          </select>
        </div>

        {/* Timestep Badge */}
        <div style={{
          padding: "3px 7px",
          borderRadius: "4px",
          backgroundColor: "var(--jr-blue-50, #EAF6FB)",
          border: "1px solid var(--jr-blue-200, #B9DDEB)",
          color: "var(--jr-blue-800, #24566A)",
          fontSize: "10px",
          fontWeight: 800,
          fontFamily: "monospace",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          <Clock size={11} color="var(--jr-blue-600, #3D8EAE)" />
          <span>T+{activeTimestepMin.toString().padStart(2, "0")}:00</span>
        </div>
      </div>

      {/* Right: Operational & Evidence Navigation Tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {operationalNav.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToView(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: isActive ? "1px solid var(--jr-blue-600, #3D8EAE)" : "1px solid transparent",
                  backgroundColor: isActive ? "var(--jr-blue-100, #D9EEF7)" : "transparent",
                  color: isActive ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
                  fontSize: "10px",
                  fontWeight: isActive ? 800 : 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--jr-border, #D8D1C5)", margin: "0 1px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {evidenceNav.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToView(item.id)}
                title="Scientific Evidence & Audit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: isActive ? "1px solid var(--jr-blue-400, #76B8D0)" : "1px solid transparent",
                  backgroundColor: isActive ? "var(--jr-surface-alt, #EDE7DC)" : "transparent",
                  color: isActive ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
                  fontSize: "9.5px",
                  fontWeight: isActive ? 800 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--jr-border, #D8D1C5)", margin: "0 1px" }} />

        {/* Persistent Post-Submission Update Trigger */}
        <button
          onClick={() => {
            if (onOpenPostSubmissionModal) {
              onOpenPostSubmissionModal();
            } else {
              onNavigateToView("POST_SUBMISSION_UPDATE");
            }
          }}
          title="Important Post-Submission Technical Update & Disclosure"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            borderRadius: "5px",
            border: "1px solid var(--jr-warning, #A97835)",
            backgroundColor: "var(--status-lowmargin-bg, #FCF4E7)",
            color: "var(--status-lowmargin-text, #825820)",
            fontSize: "10px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(169, 120, 53, 0.15)",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--jr-warning, #A97835)" }} />
          <span>UPDATE NOTICE</span>
        </button>
      </nav>
    </header>
  );
};
