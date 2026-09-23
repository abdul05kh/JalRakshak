import React from "react";
import { ShieldCheck, GitCompare, Award, FileText, Activity } from "lucide-react";
import type { ScenarioSummary, Dam } from "../types";

interface HeaderProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  dam: Dam | null;
  onOpenCompare: () => void;
  onOpenValidation: () => void;
  onOpenProvenance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  dam,
  onOpenCompare,
  onOpenValidation,
  onOpenProvenance
}) => {
  return (
    <header style={{
      height: "58px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 1000
    }}>
      {/* Brand & Study Area Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff"
          }}>
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
              JalRakshak
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.4px" }}>
              Dam-Break Flood Decision Support
            </div>
          </div>
        </div>

        <div style={{ height: "24px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        {dam && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{dam.name}</span>
            <span style={{ color: "var(--text-muted)" }}>({dam.river_name})</span>
            <span style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "#f1f5f9",
              border: "1px solid var(--border-subtle)",
              fontWeight: 600
            }}>
              FRL: {dam.full_reservoir_level_m}m MSL
            </span>
          </div>
        )}
      </div>

      {/* Scenario Selector & Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Breach Scenario:
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "#f8fafc",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: "#dcfce7",
          border: "1px solid #86efac",
          color: "#166534",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2px"
        }}>
          <Activity size={12} />
          HYDRAULIC RUN READY
        </div>

        <div style={{ height: "20px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        {/* Action Buttons: Compare, Validation, Provenance */}
        <button
          onClick={onOpenCompare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            backgroundColor: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          <GitCompare size={13} />
          Compare Scenarios
        </button>

        <button
          onClick={onOpenValidation}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            backgroundColor: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          <Award size={13} />
          Scientific QA
        </button>

        <button
          onClick={onOpenProvenance}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #2563eb",
            backgroundColor: "#eff6ff",
            fontSize: "11px",
            fontWeight: 600,
            color: "#2563eb",
            cursor: "pointer"
          }}
        >
          <FileText size={13} />
          Provenance & Audit
        </button>
      </div>
    </header>
  );
};
