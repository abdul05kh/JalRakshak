import React from "react";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle, ShieldAlert, Sparkles, X } from "lucide-react";

interface PostSubmissionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadFullUpdate: () => void;
}

export const PostSubmissionNoticeModal: React.FC<PostSubmissionNoticeModalProps> = ({
  isOpen,
  onClose,
  onReadFullUpdate
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backgroundColor: "rgba(36, 52, 58, 0.65)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)"
    }}>
      <div 
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "860px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--jr-surface, #FBF8F2)",
          border: "2px solid var(--jr-warning, #A97835)",
          borderRadius: "14px",
          boxShadow: "0 20px 40px rgba(36, 52, 58, 0.25)",
          color: "var(--jr-text, #24343A)",
          overflow: "hidden"
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Top Header Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
          borderBottom: "1px solid var(--jr-border, #D8D1C5)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "var(--status-lowmargin-bg, #FCF4E7)",
              color: "var(--status-lowmargin-text, #825820)",
              border: "1px solid var(--status-lowmargin-border, #E8C895)",
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "var(--status-lowmargin-text, #825820)", textTransform: "uppercase" }}>
                Smart India Hackathon 2026 — SIH26161
              </div>
              <h2 id="modal-headline" style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "0.2px", color: "var(--jr-text, #24343A)", margin: 0 }}>
                POST-SUBMISSION TECHNICAL UPDATE & DISCLOSURE
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              color: "var(--jr-text-muted, #65747A)",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Dismiss to Prototype"
            aria-label="Close modal"
          >
            <X size={20} color="var(--jr-text, #24343A)" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "var(--jr-text, #24343A)"
        }}>
          {/* Central Callout Banner */}
          <div style={{
            padding: "18px 20px",
            borderRadius: "10px",
            backgroundColor: "var(--status-lowmargin-bg, #FCF4E7)",
            border: "1px solid var(--status-lowmargin-border, #E8C895)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-lowmargin-text, #825820)", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <ShieldAlert size={16} />
              Important Clarification for Reviewers & Jury
            </div>
            <p style={{ fontWeight: 800, color: "var(--jr-text, #24343A)", fontSize: "15px", margin: 0 }}>
              THE SUBMITTED PRESENTATION REPRESENTS OUR INITIAL INTERPRETATION OF SIH26161.
            </p>
            <p style={{ color: "var(--jr-text, #24343A)", fontSize: "13px", margin: 0 }}>
              The submitted PPT represents our initial interpretation of SIH26161.
              After submission, we identified that our interpretation did not fully capture the breadth of the problem statement.
              We acknowledge that gap. We subsequently revisited the problem and substantially improved the prototype.
              The submitted PPT has NOT been retroactively changed. This repository documents the technical development that followed.
            </p>
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--jr-surface, #FBF8F2)",
              border: "1px solid var(--status-lowmargin-border, #E8C895)",
              fontSize: "12px",
              color: "var(--status-lowmargin-text, #825820)",
              fontWeight: 600
            }}>
              ⚠️ <strong>Important:</strong> This is a post-submission technical update. It does not constitute a revised SIH submission. The submitted PPT remains unchanged; this repository documents technical development undertaken after submission.
            </div>
          </div>

          {/* Evolution Progression: Submitted vs Current */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px"
          }}>
            <div style={{
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
              border: "1px solid var(--jr-border, #D8D1C5)"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--jr-text-muted, #65747A)" }}></span>
                Submitted State (Initial Stage)
              </div>
              <ul style={{ fontSize: "12px", color: "var(--jr-text, #24343A)", margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Narrower focus on dam-break flood visualization</li>
                <li>Single-dam hydraulic flood rendering</li>
                <li>Basic evacuation concept without deterministic route lineage</li>
                <li>Limited satellite remote sensing integration</li>
                <li>Multi-model and generalized dataset scope not yet addressed</li>
              </ul>
            </div>

            <div style={{
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "var(--jr-blue-50, #EAF6FB)",
              border: "1px solid var(--jr-blue-200, #B9DDEB)"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--jr-blue-800, #24566A)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--jr-blue-600, #3D8EAE)" />
                Current Prototype (Post-Submission Advancement)
              </div>
              <ul style={{ fontSize: "12px", color: "var(--jr-text, #24343A)", margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Native HEC-RAS 2D HDF5 hydraulic results ingestion</li>
                <li>Deterministic Evacuation Window Engine (EWE: departure deadline calculation)</li>
                <li>Scenario isolation and data-driven loading verified on synthetic test worlds</li>
                <li>Sentinel-1 SAR multi-temporal change detection research pipeline</li>
                <li>Unified HydraulicModelAdapter interface (HEC-RAS, Delft3D, DualSPHysics)</li>
                <li>OGC KML 2.2 and RFC 7946 GeoJSON export endpoints</li>
              </ul>
            </div>
          </div>

          {/* Verified Capabilities Checklist */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--jr-text, #24343A)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} color="var(--status-feasible-text, #2C634B)" />
              Verified Engineering Capabilities
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "10px",
              fontSize: "12px",
              color: "var(--jr-text, #24343A)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", padding: "12px", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
                <span style={{ color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: "var(--jr-text, #24343A)" }}>HEC-RAS 2D Ingestion:</strong> Ingests native 2D shallow water equation outputs across 740+ cells.</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", padding: "12px", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
                <span style={{ color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: "var(--jr-text, #24343A)" }}>Deterministic EWE:</strong> D = min(A_i - T_i - B) calculates exact limiting bottleneck segment.</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", padding: "12px", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
                <span style={{ color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: "var(--jr-text, #24343A)" }}>Spatial Comparator:</strong> Spatial-comparison metrics including IoU, precision, recall, and F1.</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", padding: "12px", borderRadius: "8px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
                <span style={{ color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: "var(--jr-text, #24343A)" }}>Disk SHA-256 Provenance:</strong> Live physical disk hashing guarantees artifact integrity.</span>
              </div>
            </div>
          </div>

          {/* Mandatory Scientific Limitations */}
          <div style={{
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "var(--status-infeasible-bg, #FAECEC)",
            border: "1px solid var(--status-infeasible-border, #E89E9E)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--status-infeasible-text, #873636)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} color="var(--status-infeasible-text, #873636)" />
              Explicit Limitations & Scientific Disclaimers
            </div>
            <ul style={{ fontSize: "12px", color: "var(--status-infeasible-text, #873636)", margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>Physical Validation:</strong> NOT_ESTABLISHED for Tehri Dam due to absence of historic dam failure records.</li>
              <li><strong>Satellite Observations:</strong> Sentinel-1 flood masks represent surface water backscatter change, not ground truth.</li>
              <li><strong>External Solvers:</strong> Delft3D and DualSPHysics are external solver interfaces; solver execution is not included in the current demonstration environment.</li>
              <li><strong>Evacuation Model:</strong> The EWE transforms hydraulic arrival information and configured route assumptions into a deterministic departure window; it is not an independent physical safety model. Dynamic traffic congestion is unmodelled.</li>
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "16px 24px",
          backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
          borderTop: "1px solid var(--jr-border, #D8D1C5)"
        }}>
          <div style={{ fontSize: "11px", color: "var(--jr-text-muted, #65747A)" }}>
            Build: <code style={{ color: "var(--jr-blue-800, #24566A)", fontFamily: "monospace" }}>c4b168b</code> • Status: <span style={{ color: "var(--status-lowmargin-text, #825820)", fontWeight: 700 }}>Demo-Ready Research Prototype</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => {
                onClose();
                onReadFullUpdate();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--jr-blue-800, #24566A)",
                backgroundColor: "var(--jr-surface, #FBF8F2)",
                border: "1px solid var(--jr-border, #D8D1C5)",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              <BookOpen size={14} />
              What Changed After Submission
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#ffffff",
                backgroundColor: "var(--jr-blue-600, #3D8EAE)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(61, 142, 174, 0.3)"
              }}
            >
              Explore Updated Prototype
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
