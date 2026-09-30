import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink
} from "lucide-react";
import type { RouteAlternative } from "../types";
import { getAuthoritativeDecision } from "../services/decisionStore";

interface FloatingDecisionCardProps {
  currentRoute?: RouteAlternative | null;
  routeId?: string;
  scenarioName?: string;
  safetyBufferMin?: number;
  onOpenDecisionView?: () => void;
  onOpenScienceView?: () => void;
  onFocusLimitingSegment?: () => void;
}

export const FloatingDecisionCard: React.FC<FloatingDecisionCardProps> = ({
  routeId = "R02",
  scenarioName = "SCENARIO_CENTRAL",
  safetyBufferMin = 3.0,
  onOpenDecisionView,
  onOpenScienceView,
  onFocusLimitingSegment
}) => {
  const [showWhy, setShowWhy] = useState<boolean>(false);

  // Single Authoritative Decision Source
  const decision = getAuthoritativeDecision(scenarioName, routeId, safetyBufferMin);

  const getStatusPresentation = (status: string) => {
    switch (status) {
      case "FEASIBLE":
        return {
          bg: "var(--status-feasible-bg, #E8F4EE)",
          border: "var(--status-feasible-border, #A3CFB8)",
          text: "var(--status-feasible-text, #2C634B)",
          tagBg: "var(--status-feasible-bg, #E8F4EE)",
          badgeText: "FEASIBLE",
          icon: <CheckCircle2 size={15} strokeWidth={2.5} color="var(--status-feasible-text, #2C634B)" />
        };
      case "LOW_MARGIN":
      case "LOW MARGIN":
        return {
          bg: "var(--status-lowmargin-bg, #FCF4E7)",
          border: "var(--status-lowmargin-border, #E8C895)",
          text: "var(--status-lowmargin-text, #825820)",
          tagBg: "var(--status-lowmargin-bg, #FCF4E7)",
          badgeText: "LOW MARGIN",
          icon: <AlertTriangle size={15} strokeWidth={2.5} color="var(--status-lowmargin-text, #825820)" />
        };
      case "INFEASIBLE":
        return {
          bg: "var(--status-infeasible-bg, #FAECEC)",
          border: "var(--status-infeasible-border, #E89E9E)",
          text: "var(--status-infeasible-text, #873636)",
          tagBg: "var(--status-infeasible-bg, #FAECEC)",
          badgeText: "INFEASIBLE",
          icon: <XCircle size={15} strokeWidth={2.5} color="var(--status-infeasible-text, #873636)" />
        };
      default:
        return {
          bg: "var(--status-datagap-bg, #EDE7DC)",
          border: "var(--status-datagap-border, #D8D1C5)",
          text: "var(--status-datagap-text, #65747A)",
          tagBg: "var(--status-datagap-bg, #EDE7DC)",
          badgeText: "DATA GAP",
          icon: <HelpCircle size={16} strokeWidth={2.5} color="var(--status-datagap-text, #65747A)" />
        };
    }
  };

  const pres = getStatusPresentation(decision.status);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        zIndex: 900,
        width: "min(320px, 92vw)",
        backgroundColor: "rgba(251, 248, 242, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1.5px solid ${pres.border}`,
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(36, 52, 58, 0.15)",
        padding: "12px 14px",
        color: "var(--jr-text, #24343A)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Header Context */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--jr-border, #D8D1C5)", paddingBottom: "6px" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--jr-text, #24343A)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--jr-blue-800, #24566A)" }}>ROUTE {decision.routeId}</span>
            <span style={{ color: "var(--jr-text-muted, #65747A)" }}>•</span>
            <span style={{ color: "var(--jr-text-muted, #65747A)", fontSize: "11px", fontWeight: 600 }}>Chamba Shelter</span>
          </div>
          <div style={{ fontSize: "9.5px", color: "var(--jr-text-muted, #65747A)", marginTop: "1px" }}>
            Scenario: <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>{decision.scenarioId.replace("SCENARIO_", "")}</strong> ({decision.peakDischargeM3s.toLocaleString()} m³/s)
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: pres.tagBg,
          border: `1px solid ${pres.border}`,
          color: pres.text,
          fontSize: "10px",
          fontWeight: 900
        }}>
          {pres.icon}
          <span>{pres.badgeText}</span>
        </div>
      </div>

      {/* Hero Metric: LEAVE BY (Latest Feasible Departure) */}
      <div
        style={{
          backgroundColor: pres.bg,
          border: `1px solid ${pres.border}`,
          borderRadius: "6px",
          padding: "8px 10px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--jr-text-muted, #65747A)", letterSpacing: "0.8px" }}>
          LATEST FEASIBLE DEPARTURE
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: 900,
            fontFamily: "monospace",
            letterSpacing: "-0.5px",
            color: decision.status === "INFEASIBLE" ? "var(--jr-danger, #A84C4C)" : "var(--jr-blue-800, #24566A)",
            margin: "2px 0"
          }}
        >
          LEAVE BY {decision.deadlineFormatted}
        </div>
      </div>

      {/* Limiting Segment Tag */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px" }}>
        <span style={{ color: "var(--jr-text-muted, #65747A)" }}>Limiting Segment:</span>
        <button
          onClick={onFocusLimitingSegment}
          title="Zoom to Limiting Segment"
          style={{
            background: "none",
            border: "none",
            color: "var(--jr-danger, #A84C4C)",
            fontWeight: 800,
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: 0
          }}
        >
          <MapPin size={11} color="var(--jr-danger, #A84C4C)" />
          <span>{decision.limitingEdgeId}</span>
        </button>
      </div>

      {/* Action: Level 2 WHY Expandable Drawer */}
      <div style={{ borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)", paddingTop: "6px" }}>
        <button
          onClick={() => setShowWhy(!showWhy)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "var(--jr-blue-800, #24566A)",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: "2px 0"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Info size={11} color="var(--jr-blue-600, #3D8EAE)" />
            <span>Why this departure time?</span>
          </div>
          {showWhy ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showWhy && (
          <div style={{
            marginTop: "6px",
            padding: "8px",
            backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
            borderRadius: "6px",
            border: "1px solid var(--jr-border, #D8D1C5)",
            fontSize: "9.5px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 800, color: "var(--jr-text, #24343A)" }}>
              Governing Equation: D = min(A_i - T_i - B)
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--jr-text-muted, #65747A)" }}>
              <span>• Flood arrival at {decision.limitingEdgeId}:</span>
              <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>{decision.arrivalFormatted}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--jr-text-muted, #65747A)" }}>
              <span>• Travel time to {decision.limitingEdgeId}:</span>
              <strong style={{ color: "var(--status-lowmargin-text, #825820)" }}>- {decision.travelFormatted}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--jr-text-muted, #65747A)" }}>
              <span>• Configured safety buffer:</span>
              <strong style={{ color: "var(--status-infeasible-text, #873636)" }}>- {decision.bufferFormatted}</strong>
            </div>
            <div style={{
              borderTop: "1px solid var(--jr-border, #D8D1C5)",
              paddingTop: "4px",
              marginTop: "2px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              color: "var(--jr-text, #24343A)"
            }}>
              <span>= Latest departure:</span>
              <span style={{ color: "var(--jr-blue-800, #24566A)", fontFamily: "monospace" }}>{decision.deadlineFormatted}</span>
            </div>
            <div style={{ fontSize: "8.5px", color: "var(--jr-text-muted, #65747A)", marginTop: "2px", fontStyle: "italic" }}>
              Assumes 50 km/h baseline speed. No dynamic congestion modeled.
            </div>
          </div>
        )}
      </div>

      {/* Console Navigation Links */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px",
        borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)",
        paddingTop: "6px"
      }}>
        {onOpenDecisionView && (
          <button
            onClick={onOpenDecisionView}
            style={{
              padding: "5px 6px",
              borderRadius: "4px",
              border: "1px solid var(--jr-blue-600, #3D8EAE)",
              backgroundColor: "var(--jr-blue-50, #EAF6FB)",
              color: "var(--jr-blue-800, #24566A)",
              fontSize: "9.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px"
            }}
          >
            <span>Decision Console</span>
            <ExternalLink size={10} />
          </button>
        )}

        {onOpenScienceView && (
          <button
            onClick={onOpenScienceView}
            style={{
              padding: "5px 6px",
              borderRadius: "4px",
              border: "1px solid var(--jr-border, #D8D1C5)",
              backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
              color: "var(--jr-text, #24343A)",
              fontSize: "9.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px"
            }}
          >
            <span>Science Ladder</span>
            <ExternalLink size={10} />
          </button>
        )}
      </div>
    </div>
  );
};
