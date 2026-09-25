/**
 * CesiumViewer.tsx
 * Pure 3D Geospatial Terrain Viewport for JalRakshak
 * Hosts CesiumJS Viewer + Copernicus GLO-30 DSM terrain engine.
 */

import React, { useEffect, useRef, useState } from "react";
import { TerrainEngine } from "./TerrainEngine";
import { AUTHORITATIVE_CAMERA_PRESETS } from "./CameraController";
import { DEFAULT_LAYER_STATE } from "./LayerController";
import type { Map3DLayerState } from "./LayerController";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative } from "../types";
import { Mountain, MapPin, X } from "lucide-react";

interface CesiumViewerProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  thematicMode?: "EXTENT" | "DEPTH" | "ARRIVAL";
  selectedTimelineStep?: string;
  cameraPreset?: string;
  selectedEdgeId?: string;
  onSelectEdgeId?: (edgeId: string) => void;
  onSwitchTo2D?: () => void;
}

// Global Instrumentation for Map Lifecycle Stability
if (typeof window !== "undefined") {
  (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ = (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ || 0;
}

export const CesiumViewer: React.FC<CesiumViewerProps> = ({
  inundationGeoJSON,
  roads,
  evacPoints,
  activeRoute: _activeRoute,
  thematicMode = "EXTENT",
  selectedTimelineStep = "T+60",
  cameraPreset = "VALLEY_OVERVIEW",
  selectedEdgeId,
  onSelectEdgeId,
  onSwitchTo2D: _onSwitchTo2D
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TerrainEngine | null>(null);

  const [cursorInfo, setCursorInfo] = useState<{ lon: number; lat: number; elevation_m: number } | null>(null);
  const [layerState] = useState<Map3DLayerState>({ ...DEFAULT_LAYER_STATE });
  const [pickedEntity, setPickedEntity] = useState<{
    type: string;
    title: string;
    properties: Record<string, any>;
    coordinate: { lon: number; lat: number; elev_m: number };
  } | null>(null);

  // Initialize Cesium 3D Terrain Engine (Strictly once per lifecycle)
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof window !== "undefined") {
      (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ += 1;
      console.log(`[CesiumViewer] Authoritative 3D Viewer initialized. Lifecycle creation count: ${(window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__}`);
    }

    const engine = new TerrainEngine(containerRef.current, {
      onCursorMove: (info) => setCursorInfo(info),
      onPickEntity: (info) => {
        setPickedEntity(info);
        if (info.properties.edgeId && onSelectEdgeId) {
          onSelectEdgeId(info.properties.edgeId);
        }
      }
    });

    engine.initialize().then(() => {
      engineRef.current = engine;
      engine.updateData(
        roads,
        evacPoints,
        inundationGeoJSON,
        selectedEdgeId,
        thematicMode,
        selectedTimelineStep
      );
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Dynamically update data, timestep, and thematic mode without recreating viewer
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateData(
        roads,
        evacPoints,
        inundationGeoJSON,
        selectedEdgeId,
        thematicMode,
        selectedTimelineStep
      );
    }
  }, [roads, evacPoints, inundationGeoJSON, selectedEdgeId, thematicMode, selectedTimelineStep]);

  // Handle Camera Preset changes deterministically
  useEffect(() => {
    if (engineRef.current && cameraPreset) {
      let mapped = cameraPreset;
      if (mapped === "OVERVIEW") mapped = "VALLEY_OVERVIEW";
      else if (mapped === "DAM") mapped = "TEHRI_DAM";
      else if (mapped === "BREACH") mapped = "BREACH_LOCATION";
      else if (mapped === "DOWNSTREAM") mapped = "DOWNSTREAM_VALLEY";
      else if (mapped === "ROUTE") mapped = "R02_ROUTE";
      else if (mapped === "LIMITING") mapped = "R02_E07_LIMITING";
      else if (mapped === "SHELTER") mapped = "CHAMBA_SHELTER";

      if (mapped in AUTHORITATIVE_CAMERA_PRESETS) {
        engineRef.current.flyToPreset(mapped as any);
      }
    }
  }, [cameraPreset]);

  // Update Layer State
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setLayerState(layerState);
    }
  }, [layerState]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#090d16", overflow: "hidden", userSelect: "none" }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Feature Inspection Popup */}
      {pickedEntity && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "16px",
            width: "300px",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
            zIndex: 850,
            fontSize: "11px",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
            <span style={{ fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={13} color="#38bdf8" />
              <span>{pickedEntity.title}</span>
            </span>
            <button
              onClick={() => setPickedEntity(null)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontFamily: "monospace", fontSize: "10.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Feature Type:</span>
              <strong style={{ color: "#38bdf8" }}>{pickedEntity.type}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Elevation:</span>
              <strong style={{ color: "#fbbf24" }}>{pickedEntity.coordinate.elev_m.toFixed(2)} m MSL</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Coordinates:</span>
              <span style={{ color: "#cbd5e1" }}>{pickedEntity.coordinate.lon.toFixed(4)}°E, {pickedEntity.coordinate.lat.toFixed(4)}°N</span>
            </div>
            {Object.entries(pickedEntity.properties).map(([k, v]) => {
              if (k === "type" || typeof v === "object") return null;
              return (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{k.replace("_", " ")}:</span>
                  <span style={{ color: "#cbd5e1" }}>{String(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Cursor Terrain Inspection Bar (Top Left sub-badge) */}
      <div
        style={{
          position: "absolute",
          bottom: "4px",
          left: "14px",
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(6px)",
          padding: "3px 8px",
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "9.5px",
          color: "#94a3b8",
          fontFamily: "monospace"
        }}
      >
        <Mountain size={11} color="#38bdf8" />
        {cursorInfo ? (
          <span>
            LAT: <strong style={{ color: "#ffffff" }}>{cursorInfo.lat.toFixed(4)}°N</strong> | LON: <strong style={{ color: "#ffffff" }}>{cursorInfo.lon.toFixed(4)}°E</strong> | ELEV: <strong style={{ color: "#fbbf24" }}>{cursorInfo.elevation_m.toFixed(1)}m</strong>
          </span>
        ) : (
          <span>Copernicus GLO-30 DSM (1-arcsec)</span>
        )}
      </div>
    </div>
  );
};
