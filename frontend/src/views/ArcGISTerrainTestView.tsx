/**
 * ArcGISTerrainTestView.tsx
 * Standalone Prototype Verification View for ArcGIS Maps SDK 5.1 SceneView + Copernicus GLO-30 DSM
 * Validates 3D relief, road network, Tehri Dam, and Route R02 before full operational routing.
 */

import React, { useState, useEffect } from "react";
import { ArcGISSceneViewer } from "../map3d/ArcGISSceneViewer";
import type { RoadFeature, EvacuationPointFeature } from "../types";
import { CheckCircle2, Video, ArrowLeft, Mountain } from "lucide-react";
import { fetchScenarioLayers } from "../services/api";

export interface ArcGISTerrainTestViewProps {
  roads?: RoadFeature[];
  evacPoints?: EvacuationPointFeature[];
  inundationGeoJSON?: any;
  onBackToApp?: () => void;
  onNavigateToView?: (view: any) => void;
}

export const ArcGISTerrainTestView: React.FC<ArcGISTerrainTestViewProps> = ({
  roads: initialRoads,
  evacPoints: initialEvacPoints,
  inundationGeoJSON: initialInundation,
  onBackToApp,
  onNavigateToView
}) => {
  const [cameraPreset, setCameraPreset] = useState<string>("VALLEY_OVERVIEW");
  const [thematicMode, setThematicMode] = useState<"EXTENT" | "DEPTH" | "ARRIVAL">("DEPTH");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>("R02-E07");

  const [roads, setRoads] = useState<RoadFeature[]>(initialRoads || []);
  const [evacPoints, setEvacPoints] = useState<EvacuationPointFeature[]>(initialEvacPoints || []);
  const [inundationGeoJSON, setInundationGeoJSON] = useState<any>(initialInundation || null);

  useEffect(() => {
    if (roads.length === 0 || !inundationGeoJSON) {
      fetchScenarioLayers("SCENARIO_CENTRAL")
        .then((layers) => {
          setInundationGeoJSON(layers.inundation_geojson);
          setRoads(layers.roads_geojson?.features || []);
          setEvacPoints(layers.evacuation_points_geojson?.features || []);
        })
        .catch((err) => console.error("Failed to load scenario layers for terrain test:", err));
    }
  }, [roads.length, inundationGeoJSON]);

  const presets = [
    { id: "VALLEY_OVERVIEW", label: "OVERVIEW" },
    { id: "TEHRI_DAM", label: "TEHRI DAM" },
    { id: "BREACH_LOCATION", label: "BREACH" },
    { id: "DOWNSTREAM_VALLEY", label: "DOWNSTREAM" },
    { id: "R02_ROUTE", label: "ROUTE R02" },
    { id: "R02_E07_LIMITING", label: "LIMITING R02-E07" },
    { id: "CHAMBA_SHELTER", label: "CHAMBA SHELTER" }
  ];

  const handleReturn = () => {
    if (onBackToApp) {
      onBackToApp();
    } else if (onNavigateToView) {
      onNavigateToView("OPERATIONAL_MAP");
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#060913", overflow: "hidden" }}>
      {/* Primary 3D SceneView */}
      <ArcGISSceneViewer
        inundationGeoJSON={inundationGeoJSON}
        roads={roads}
        evacPoints={evacPoints}
        activeRoute={null}
        thematicMode={thematicMode}
        selectedTimelineStep="T+60"
        cameraPreset={cameraPreset}
        selectedEdgeId={selectedEdgeId}
        onSelectEdgeId={(id) => setSelectedEdgeId(id)}
      />

      {/* Top Banner Verification Overlay */}
      <div style={{
        position: "absolute",
        top: "14px",
        left: "14px",
        zIndex: 900,
        backgroundColor: "rgba(11, 17, 32, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(56, 189, 248, 0.4)",
        borderRadius: "6px",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        maxWidth: "380px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.6)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Mountain size={16} color="#38bdf8" />
            <span style={{ fontSize: "12px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.2px" }}>
              ARCGIS 5.1 GLO-30 DSM PROTOTYPE
            </span>
          </div>
          <span style={{
            fontSize: "9px",
            fontWeight: 800,
            padding: "2px 6px",
            borderRadius: "3px",
            backgroundColor: "rgba(56, 189, 248, 0.2)",
            color: "#38bdf8",
            border: "1px solid #38bdf8"
          }}>
            STANDALONE TEST
          </span>
        </div>

        <div style={{ fontSize: "10.5px", color: "#cbd5e1", lineHeight: "1.4" }}>
          Validating Copernicus GLO-30 DSM terrain integration, 3D road clamping, and continuous HEC-RAS depth in ArcGIS SceneView.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#38bdf8", fontWeight: 700 }}>
          <CheckCircle2 size={12} color="#38bdf8" />
          <span>Zero Cesium dependencies active</span>
        </div>

        <button
          onClick={handleReturn}
          style={{
            marginTop: "4px",
            padding: "5px 10px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#cbd5e1",
            fontSize: "10.5px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px"
          }}
        >
          <ArrowLeft size={12} />
          <span>Return to Operational Console</span>
        </button>
      </div>

      {/* Top-Center Camera Toolbar */}
      <div style={{
        position: "absolute",
        top: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 900,
        backgroundColor: "rgba(11, 17, 32, 0.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "6px",
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 6px", borderRight: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", fontSize: "10px", fontWeight: 800 }}>
          <Video size={12} color="#38bdf8" />
          <span>CAMERA:</span>
        </div>
        {presets.map((btn) => {
          const isActive = cameraPreset === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setCameraPreset(btn.id)}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                backgroundColor: isActive ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: isActive ? "#ffffff" : "#cbd5e1",
                fontSize: "10px",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer"
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Top-Right Mode Selector */}
      <div style={{
        position: "absolute",
        top: "14px",
        right: "14px",
        zIndex: 900,
        backgroundColor: "rgba(11, 17, 32, 0.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "6px",
        padding: "6px 8px",
        display: "flex",
        gap: "3px"
      }}>
        {(["DEPTH", "EXTENT", "ARRIVAL"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setThematicMode(m)}
            style={{
              padding: "3px 7px",
              borderRadius: "3px",
              border: thematicMode === m ? "1px solid #38bdf8" : "1px solid transparent",
              backgroundColor: thematicMode === m ? "rgba(56, 189, 248, 0.25)" : "transparent",
              color: thematicMode === m ? "#ffffff" : "#94a3b8",
              fontSize: "9.5px",
              fontWeight: thematicMode === m ? 800 : 600,
              cursor: "pointer"
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};
