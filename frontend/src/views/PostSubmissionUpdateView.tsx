import React from "react";
import { 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Database, 
  FileCheck, 
  GitBranch, 
  Layers, 
  Map, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Waves 
} from "lucide-react";

interface PostSubmissionUpdateViewProps {
  onBackToMap: () => void;
}

export const PostSubmissionUpdateView: React.FC<PostSubmissionUpdateViewProps> = ({ onBackToMap }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            Smart India Hackathon (SIH 2026) — Problem Statement SIH26161
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            WHAT CHANGED AFTER OUR SIH SUBMISSION?
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            A comprehensive, transparent technical disclosure of the post-submission architecture evolution and scientific hardening of JalRakshak.
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to 3D Map
        </button>
      </div>

      {/* Main Narrative Card: What We Initially Got Wrong */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          1. The Initial Problem Interpretation & Identified Gap
        </div>
        <p className="text-base font-extrabold text-white">
          THE SUBMITTED PRESENTATION REPRESENTS OUR INITIAL INTERPRETATION OF SIH26161.
        </p>
        <div className="text-xs md:text-sm text-slate-300 space-y-2 leading-relaxed">
          <p>
            Our initial submission placed too much emphasis on dam-break hydrodynamics, 3D visualization, and localized evacuation decision support. 
            While these remain essential core pillars of JalRakshak, a deeper post-submission forensic deconstruction of the official NTRO/MIC problem statement revealed that the full intended solution space is significantly broader.
          </p>
          <p>
            The complete problem statement expects a <strong>generalized modelling framework</strong> incorporating multi-source hydrological datasets, 
            digital elevation models, multi-temporal satellite imagery, multi-hydrodynamic solver adapters (HEC-RAS, Delft3D, SPH), standardized GIS export pipelines (KML/GeoJSON), and near-real-time Google Earth Engine analysis.
          </p>
          <p className="text-amber-300 font-medium">
            We recognized this gap after submission. Rather than defending our original narrower interpretation, we revisited the problem statement and substantially improved the prototype, architecture, and scientific evidence base.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Table: Submitted vs Current */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          2. Detailed Evolution Matrix: Submitted State vs. Current Prototype
        </h2>
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5">Engineering Domain</th>
                <th className="p-3.5 w-1/3 text-slate-400">Submitted State (Initial Stage)</th>
                <th className="p-3.5 w-1/2 text-cyan-400">Current Prototype (Substantially Advanced)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-blue-400" /> Hydrodynamics
                </td>
                <td className="p-3.5 text-slate-400">Localized hydraulic/GIS visualization</td>
                <td className="p-3.5 text-cyan-200">Native HEC-RAS 7.0.1 2D unsteady flow HDF5 ingestion across 3 breach plans (28.5k, 65k, 115k m³/s) with cell-level depth, velocity, and arrival timestamps.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Evacuation Engine
                </td>
                <td className="p-3.5 text-slate-400">Basic route clearance concept</td>
                <td className="p-3.5 text-cyan-200">Deterministic Evacuation Window Engine (EWE) mathematically calculating D_deadline = min(A_i - T_i - B) and extracting the exact limiting bottleneck road segment.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <Map className="w-3.5 h-3.5 text-emerald-400" /> GIS & Road Coupling
                </td>
                <td className="p-3.5 text-slate-400">Visual road overlay</td>
                <td className="p-3.5 text-cyan-200">Projected coordinate transformation (UTM 44N to WGS84) with 150m perpendicular corridor search and line densification to prevent false overtopping.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-purple-400" /> Satellite / GEE
                </td>
                <td className="p-3.5 text-slate-400">Limited/absent satellite integration</td>
                <td className="p-3.5 text-cyan-200">Multi-temporal Sentinel-1 SAR change detection research workflow and GEE spatial comparator calculating exact IoU, Precision, Recall, and F1 metrics.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-indigo-400" /> Multi-Model Architecture
                </td>
                <td className="p-3.5 text-slate-400">Single hydraulic model assumption</td>
                <td className="p-3.5 text-cyan-200">Unified HydraulicModelAdapter interface supporting HEC-RAS, Delft3D FM, and DualSPHysics SPH with normalized cross-model discrepancy comparisons.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-teal-400" /> GIS Exports
                </td>
                <td className="p-3.5 text-slate-400">No export functionality</td>
                <td className="p-3.5 text-cyan-200">Production OGC KML 2.2 XML and RFC 7946 GeoJSON export endpoints containing full hydraulic telemetry and departure margins.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Provenance & Validation
                </td>
                <td className="p-3.5 text-slate-400">Early exploratory tests</td>
                <td className="p-3.5 text-cyan-200">193 automated Pytest test suites, real-time SHA-256 physical disk hashing, and strict black-box scenario generalization verification.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Scientific Boundaries & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Capabilities */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            3. Verified Technical Capabilities
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Authoritative Hydraulic Ingestion:</strong> Reads native HEC-RAS 2D HDF5 geometry, water surface elevations, and velocities without procedural fabrications.</li>
            <li><strong>Deterministic Bottleneck Extraction:</strong> Mathematically identifies the exact limiting road segment (argmin D_i) determining route cut-off.</li>
            <li><strong>Standardized GIS Interoperability:</strong> Exports compliant KML and GeoJSON files for district emergency command GIS ingestion.</li>
            <li><strong>Spatial Satellite Discrepancy:</strong> Computes true IoU, precision, and recall comparing satellite water masks with simulated flood extents.</li>
            <li><strong>Zero Hardcoding:</strong> Fully scenario-driven architecture verified across independent test worlds (TEST_ALPHA, TEST_BETA).</li>
          </ul>
        </div>

        {/* Known Limitations */}
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            4. Explicit Limitations & Scientific Disclaimers
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Physical Validation:</strong> NOT_ESTABLISHED for Tehri Dam due to lack of historic physical dam-break failure records.</li>
            <li><strong>Satellite Ground Truth:</strong> Sentinel-1 backscatter depressions are candidate flood masks, not calibrated ground truth for HEC-RAS.</li>
            <li><strong>Solvers:</strong> Delft3D and SPH are external adapter interfaces; commercial solvers are truthfully marked NOT_CONFIGURED.</li>
            <li><strong>Traffic Dynamics:</strong> Evacuation speed (50 km/h) is a static configured parameter; dynamic congestion is unmodelled.</li>
            <li><strong>Event Comparability:</strong> July 2024 Balganga satellite data is an observation demo, not validation of Tehri dam-break simulations.</li>
          </ul>
        </div>
      </div>

      {/* Post-Submission Timeline */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          5. Post-Submission Development & Hardening Timeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 font-bold block">STAGE 1</span>
            <strong>Problem Reinterpretation</strong>
            <p className="text-[11px] text-slate-400 mt-1">Identified broader SIH26161 expectations (GEE, multi-model, export).</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-bold block">STAGE 2</span>
            <strong>Hydraulic & EWE Hardening</strong>
            <p className="text-[11px] text-slate-400 mt-1">Bound native HDF5 2D results and locked mathematical EWE formulation.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-purple-400 font-bold block">STAGE 3</span>
            <strong>GEE & Remote Sensing</strong>
            <p className="text-[11px] text-slate-400 mt-1">Implemented Sentinel-1 multi-temporal pipeline and spatial IoU comparator.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 font-bold block">STAGE 4</span>
            <strong>Generalization & Release</strong>
            <p className="text-[11px] text-slate-400 mt-1">Zero-hardcoding verification, 193 passing tests, and OGC KML exports.</p>
          </div>
        </div>
      </div>

      {/* Build & Verification Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <div>
          Prototype Release: <span className="text-white font-bold">JalRakshak v2.0 (Post-Submission Technical Release)</span> • Build: <code className="text-cyan-400 font-mono">f668c7d</code>
        </div>
        <button
          onClick={onBackToMap}
          className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          Return to 3D Operational Map
        </button>
      </div>
    </div>
  );
};
