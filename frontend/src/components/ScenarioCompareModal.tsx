import React, { useState, useEffect } from "react";
import { X, GitCompare } from "lucide-react";
import type { ScenarioSummary, ScenarioComparisonResponse } from "../types";
import { compareScenarios } from "../services/api";

interface ScenarioCompareModalProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  onClose: () => void;
}

export const ScenarioCompareModal: React.FC<ScenarioCompareModalProps> = ({
  scenarios,
  activeScenarioId,
  onClose
}) => {
  const [scenarioIdA, setScenarioIdA] = useState<string>(activeScenarioId);
  const [scenarioIdB, setScenarioIdB] = useState<string>(
    scenarios.find((s) => s.id !== activeScenarioId)?.id || scenarios[0]?.id || ""
  );
  const [comparisonData, setComparisonData] = useState<ScenarioComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runCompare = async () => {
    if (!scenarioIdA || !scenarioIdB) return;
    setLoading(true);
    try {
      const res = await compareScenarios(scenarioIdA, scenarioIdB);
      setComparisonData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCompare();
  }, [scenarioIdA, scenarioIdB]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000
    }}>
      <div style={{
        width: "780px",
        maxHeight: "85vh",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GitCompare size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
              Breach Sensitivity & Scenario Comparison
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Scenario A (Baseline):
              </label>
              <select
                value={scenarioIdA}
                onChange={(e) => setScenarioIdA(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-strong)",
                  fontSize: "12px",
                  fontWeight: 600
                }}
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Scenario B (Sensitivity Delta):
              </label>
              <select
                value={scenarioIdB}
                onChange={(e) => setScenarioIdB(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-strong)",
                  fontSize: "12px",
                  fontWeight: 600
                }}
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>Evaluating comparative sensitivities...</div>
          ) : comparisonData ? (
            <>
              {/* Physics Summary Comparison Table */}
              <div style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                overflow: "hidden"
              }}>
                <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-subtle)" }}>
                    <tr>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Parameter</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Scenario A</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Scenario B</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Physical Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>Breach Width</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_a.breach_parameters.breach_width_m} m</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_b.breach_parameters.breach_width_m} m</td>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "#2563eb" }}>{comparisonData.breach_width_diff_m > 0 ? `+${comparisonData.breach_width_diff_m}` : comparisonData.breach_width_diff_m} m</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>Peak Discharge</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_a.breach_parameters.peak_discharge_m3s.toLocaleString()} m³/s</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_b.breach_parameters.peak_discharge_m3s.toLocaleString()} m³/s</td>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "#dc2626" }}>{comparisonData.peak_discharge_diff_m3s > 0 ? `+${comparisonData.peak_discharge_diff_m3s.toLocaleString()}` : comparisonData.peak_discharge_diff_m3s.toLocaleString()} m³/s</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>Formation Time</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_a.breach_parameters.breach_formation_min} min</td>
                      <td style={{ padding: "8px 12px" }}>{comparisonData.scenario_b.breach_parameters.breach_formation_min} min</td>
                      <td style={{ padding: "8px 12px" }}>{(comparisonData.scenario_b.breach_parameters.breach_formation_min - comparisonData.scenario_a.breach_parameters.breach_formation_min)} min</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Route Status Shift Table */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Evacuation Route Feasibility & Deadline Shift
                </div>
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "6px", overflow: "hidden" }}>
                  <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-subtle)" }}>
                      <tr>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Origin → Destination Link</th>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Scenario A Status</th>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Scenario B Status</th>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Status Changed?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.route_status_comparison.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: r.status_changed ? "#fef2f2" : "#ffffff" }}>
                          <td style={{ padding: "6px 10px", fontWeight: 600 }}>{r.route_label}</td>
                          <td style={{ padding: "6px 10px" }}>{r.scenario_a_status}</td>
                          <td style={{ padding: "6px 10px", fontWeight: 700, color: r.scenario_b_status === "INFEASIBLE" ? "#b91c1c" : "#166534" }}>{r.scenario_b_status}</td>
                          <td style={{ padding: "6px 10px", fontWeight: 700, color: r.status_changed ? "#dc2626" : "#64748b" }}>
                            {r.status_changed ? "YES (Blocked earlier)" : "No change"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explanation Narrative */}
              <div style={{
                padding: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "var(--text-secondary)"
              }}>
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Decision Sensitivity Narrative:</strong>
                {comparisonData.explanation}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
