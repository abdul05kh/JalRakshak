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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/40 text-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                Smart India Hackathon 2026 — SIH26161
              </div>
              <h2 id="modal-headline" className="text-sm md:text-base font-black tracking-wide text-white">
                POST-SUBMISSION TECHNICAL UPDATE & DISCLOSURE
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss to Prototype"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs md:text-sm leading-relaxed">
          {/* Central Callout Banner */}
          <div className="p-4 md:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Important Clarification for Reviewers & Jury
            </div>
            <p className="font-extrabold text-white text-base md:text-lg tracking-tight">
              THE SUBMITTED PRESENTATION REPRESENTS OUR INITIAL INTERPRETATION OF THE PROBLEM.
            </p>
            <p className="text-slate-300 text-xs md:text-sm">
              Our submitted PPT reflects our initial interpretation of SIH26161. During subsequent technical analysis, 
              we identified that our interpretation did not fully capture the breadth of the problem statement. 
              We acknowledge this gap. Rather than leaving the prototype at the submitted state, we revisited the actual problem 
              statement, reworked the architecture, strengthened the scientific pipeline, and substantially advanced the prototype.
            </p>
            <p className="text-[11px] text-amber-300/80 italic pt-1">
              * The submitted PPT has not been retroactively changed. This repository documents the subsequent development.
            </p>
          </div>

          {/* Evolution Progression: Submitted vs Current */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Submitted PPT State (Earlier Stage)
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Narrower focus primarily on dam-break visualization</li>
                <li>Single-dam hydraulic flood rendering</li>
                <li>Basic evacuation concept without full edge lineage</li>
                <li>Limited satellite remote sensing integration</li>
                <li>Generalization and multi-model scope not yet addressed</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Current Prototype (Post-Submission Advancement)
              </div>
              <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                <li>Native HEC-RAS 2D HDF5 hydraulic results ingestion</li>
                <li>Deterministic Evacuation Window Engine (EWE: min departure deadline)</li>
                <li>Scenario-scoped GIS world isolation without hardcoding</li>
                <li>Sentinel-1 SAR multi-temporal change detection pipeline</li>
                <li>Multi-model adapter interface (HEC-RAS, Delft3D, DualSPHysics)</li>
                <li>Standardized OGC KML 2.2 and GeoJSON GIS export engine</li>
              </ul>
            </div>
          </div>

          {/* Verified Capabilities Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Verified Current Engineering Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>HEC-RAS 2D Ingestion:</strong> Ingests 740+ cells with continuous depth, velocity, and wave arrival.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Deterministic EWE:</strong> D = min(A_i - T_i - B) calculates exact limiting bottleneck segment.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>GEE Spatial Comparator:</strong> Precision, Recall, IoU, and F1 calculations comparing satellite masks.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Real SHA-256 Provenance:</strong> Live physical disk hashing guarantees artifact reproducibility.</span>
              </div>
            </div>
          </div>

          {/* Mandatory Scientific Limitations */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-slate-300 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Mandatory Scientific Disclaimers & Known Limitations
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We deliberately distinguish implemented functionality from research interfaces and future work:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Physical Validation:</strong> NOT_ESTABLISHED for Tehri Dam due to absence of historic dam failure records.</li>
              <li><strong>Satellite Observations:</strong> Sentinel-1 flood masks represent surface water backscatter change, not ground truth.</li>
              <li><strong>External Solvers:</strong> Delft3D and SPH are external solver interfaces, truthfully marked NOT_CONFIGURED.</li>
              <li><strong>Traffic:</strong> Static 50 km/h speed assumption; dynamic traffic congestion is not currently modelled.</li>
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Build: <code className="text-cyan-400 font-mono">f668c7d</code> • Status: <span className="text-amber-400 font-semibold">Demo-Ready Research Prototype</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onClose();
                onReadFullUpdate();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 rounded-xl transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              What Changed After Submission
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Explore Updated Prototype
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
