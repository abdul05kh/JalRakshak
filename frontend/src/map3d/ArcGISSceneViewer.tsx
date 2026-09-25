/**
 * ArcGISSceneViewer.tsx
 * Pure 3D Geospatial Terrain Viewport for JalRakshak
 * Hosts ArcGIS Maps SDK 5.1 SceneView + Copernicus GLO-30 DSM terrain engine.
 * Strictly guarantees idempotence, cancellation safety, and single SceneView instance.
 */

import React, { useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/dark/main.css";
import { ArcGISTerrainEngine } from "./ArcGISTerrainEngine";
import { AUTHORITATIVE_CAMERA_PRESETS } from "./ArcGISCameraController";
import type { HydraulicThematicMode } from "./ArcGISHydraulicLayer";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative } from "../types";
import { Mountain, MapPin, X, AlertTriangle } from "lucide-react";

interface ArcGISSceneViewerProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  thematicMode?: HydraulicThematicMode;
  selectedTimelineStep?: string;
  cameraPreset?: string;
  selectedEdgeId?: string;
  onSelectEdgeId?: (edgeId: string) => void;
  showTerrain?: boolean;
  showRoads?: boolean;
  onSwitchTo2D?: () => void;
}

// Global Instrumentation for Map Lifecycle Stability
if (typeof window !== "undefined") {
  (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ = (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ || 0;
}

export const ArcGISSceneViewer: React.FC<ArcGISSceneViewerProps> = ({
  inundationGeoJSON,
  roads,
  evacPoints,
  activeRoute: _activeRoute,
  thematicMode = "EXTENT",
  selectedTimelineStep = "T+60",
  cameraPreset = "VALLEY_OVERVIEW",
  selectedEdgeId,
  onSelectEdgeId,
  showTerrain = true,
  showRoads = true,
  onSwitchTo2D: _onSwitchTo2D
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ArcGISTerrainEngine | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [cursorInfo, setCursorInfo] = useState<{ lon: number; lat: number; elevation_m: number } | null>(null);
  const [pickedEntity, setPickedEntity] = useState<{
    type: string;
    title: string;
    properties: Record<string, any>;
    coordinate: { lon: number; lat: number; elev_m: number };
  } | null>(null);

  // Initialize ArcGIS 3D Scene Engine (Idempotent & StrictMode safe)
  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;

    if (typeof window !== "undefined") {
      (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ += 1;
      console.log(`[ArcGISSceneViewer] Initializing 3D SceneView. Lifecycle creation count: ${(window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__}`);
    }

    const engine = new ArcGISTerrainEngine(containerRef.current, {
      onCursorMove: (info) => {
        if (isMounted) setCursorInfo(info);
      },
      onPickEntity: (info) => {
        if (!isMounted) return;
        setPickedEntity(info);
        if (info.properties.edgeId && onSelectEdgeId) {
          onSelectEdgeId(info.properties.edgeId);
        }
      },
      onDiagnosticState: (state, details) => {
        if (!isMounted) return;
        if (state === "RENDER_FAILURE") {
          setRenderError(details?.message || String(details));
        }
      }
    });

    engineRef.current = engine;

    engine.initialize().then(() => {
      if (!isMounted) {
        engine.destroy();
        return;
      }
      engine.updateData(
        roads,
        evacPoints,
        inundationGeoJSON,
        selectedEdgeId,
        thematicMode,
        selectedTimelineStep
      );
      engine.setTerrainVisibility(showTerrain);
      engine.setRoadVisibility(showRoads);
    }).catch((err) => {
      if (isMounted) {
        setRenderError(err?.message || String(err));
      }
    });

    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Dynamically update data, timestep, and thematic mode without recreating SceneView
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

  // Handle Layer Toggles (Terrain & Roads)
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTerrainVisibility(showTerrain);
    }
  }, [showTerrain]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setRoadVisibility(showRoads);
    }
  }, [showRoads]);

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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#060913", overflow: "hidden", userSelect: "none" }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "100%" }} />

      {/* Render Error Alert Overlay */}
      {renderError && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "20px",
          color: "#ffffff",
          zIndex: 1000,
          maxWidth: "450px",
          textAlign: "center"
        }}>
          <AlertTriangle size={32} color="#ef4444" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>3D Terrain Render Alert</h3>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "12px" }}>{renderError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "6px 14px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "4px",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Retry Renderer
          </button>
        </div>
      )}

      {/* Road Segment Detail Panel */}
      {pickedEntity && pickedEntity.properties.edgeId && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "16px",
            width: "320px",
            backgroundColor: "rgba(11, 17, 32, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "14px",
            borderRadius: "6px",
            border: pickedEntity.properties.is_limiting ? "1.5px solid #ef4444" : "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
            zIndex: 850,
            fontSize: "11px",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#38bdf8" }}>ROAD SEGMENT</span>
                <span style={{ color: "#94a3b8" }}>{pickedEntity.properties.edgeId}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "2px" }}>
                {pickedEntity.properties.name || "Koteshwar Riverbank Limiting Segment"}
              </div>
            </div>
            <button
              onClick={() => setPickedEntity(null)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontFamily: "monospace", fontSize: "11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>LENGTH:</span>
              <strong style={{ color: "#ffffff" }}>{pickedEntity.properties.length_km ? `${pickedEntity.properties.length_km} km` : "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>TRAVEL TIME:</span>
              <strong style={{ color: "#fbbf24" }}>{pickedEntity.properties.travel_time || "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>FLOOD ARRIVAL:</span>
              <strong style={{ color: "#38bdf8" }}>{pickedEntity.properties.flood_arrival || "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>MARGIN:</span>
              <strong style={{ color: "#4ade80" }}>{pickedEntity.properties.margin || "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>STATUS:</span>
              <strong style={{ color: pickedEntity.properties.is_limiting ? "#ef4444" : "#38bdf8" }}>
                {pickedEntity.properties.status || "FEASIBLE"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>HYDRAULIC THRESHOLD:</span>
              <span style={{ color: "#cbd5e1" }}>h &ge; 0.30 m</span>
            </div>
          </div>
        </div>
      )}

      {/* Generic Feature Inspection Popup (Dam, Shelter, Terrain) */}
      {pickedEntity && !pickedEntity.properties.edgeId && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "16px",
            width: "300px",
            backgroundColor: "rgba(11, 17, 32, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px",
            borderRadius: "6px",
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
              <span style={{ color: "#94a3b8" }}>Location:</span>
              <span style={{ color: "#cbd5e1" }}>{pickedEntity.coordinate.lat.toFixed(4)}°N, {pickedEntity.coordinate.lon.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Left Terrain Elevation Bar */}
      {cursorInfo && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            backgroundColor: "rgba(15, 23, 42, 0.90)",
            backdropFilter: "blur(8px)",
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "10.5px",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 800,
            fontFamily: "monospace"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Mountain size={12} color="#38bdf8" />
            <span style={{ color: "#f8fafc", fontWeight: 700 }}>{cursorInfo.elevation_m} m MSL</span>
          </div>
          <div style={{ color: "#cbd5e1" }}>
            {cursorInfo.lat.toFixed(4)}°N, {cursorInfo.lon.toFixed(4)}°E
          </div>
          <div style={{ color: "#38bdf8", fontWeight: 700 }}>
            Copernicus GLO-30 DSM
          </div>
        </div>
      )}
    </div>
  );
};
