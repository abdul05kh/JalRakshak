/**
 * DamLayer.ts
 * Manages Tehri Dam structure, crest alignment, and breach location in 3D terrain.
 */

import * as Cesium from "cesium";

export class DamLayer {
  private viewer: Cesium.Viewer;
  private damEntities: Cesium.Entity[] = [];
  private breachEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initializeDamAndBreach();
  }

  private initializeDamAndBreach(): void {
    // 1. Tehri Dam Crest (830.63m MSL, 575m Crest Length across the gorge)
    const crestLeftAbutment = [78.4775, 30.3785];
    const crestRightAbutment = [78.4830, 30.3775];
    const crestCenter = [78.4803, 30.3780];

    const crestPositions = [
      Cesium.Cartesian3.fromDegrees(crestLeftAbutment[0], crestLeftAbutment[1]),
      Cesium.Cartesian3.fromDegrees(crestCenter[0], crestCenter[1]),
      Cesium.Cartesian3.fromDegrees(crestRightAbutment[0], crestRightAbutment[1])
    ];

    // Crest Polyline
    const damCrest = this.viewer.entities.add({
      name: "Tehri Dam Crest (830.63m MSL)",
      properties: new Cesium.PropertyBag({
        type: "DAM",
        name: "Tehri Dam",
        height_m: 260.5,
        crest_length_m: 575.0,
        full_reservoir_level_m: 830.0,
        dam_type: "Earth and rock-fill embankment"
      }),
      polyline: {
        positions: crestPositions,
        clampToGround: true,
        width: 12,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.fromCssColorString("#f59e0b"),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2
        })
      }
    });
    this.damEntities.push(damCrest);

    // Dam Point Marker
    const damMarker = this.viewer.entities.add({
      name: "Tehri Dam",
      position: Cesium.Cartesian3.fromDegrees(crestCenter[0], crestCenter[1]),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString("#f59e0b"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: "TEHRI DAM (830m)",
        font: "bold 12px Inter, sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    this.damEntities.push(damMarker);

    // 2. Modeled Breach Location (635m MSL Invert Assumption)
    const breachLon = 78.4790;
    const breachLat = 30.3750;

    const breachMarker = this.viewer.entities.add({
      name: "Breach Invert (635m — Model Assumption)",
      properties: new Cesium.PropertyBag({
        type: "BREACH",
        name: "Modeled Dam Breach",
        invert_elevation_m: 635.0,
        note: "Hydraulic Model Assumption (Not Surveyed)"
      }),
      position: Cesium.Cartesian3.fromDegrees(breachLon, breachLat),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#dc2626"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: "BREACH INVERT (635m Model Assumption)",
        font: "bold 11px Inter, sans-serif",
        fillColor: Cesium.Color.fromCssColorString("#fca5a5"),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    this.breachEntities.push(breachMarker);
  }

  public setVisibility(dam: boolean, breach: boolean): void {
    this.damEntities.forEach((e) => (e.show = dam));
    this.breachEntities.forEach((e) => (e.show = breach));
  }

  public clear(): void {
    this.damEntities.forEach((e) => this.viewer.entities.remove(e));
    this.damEntities = [];
    this.breachEntities.forEach((e) => this.viewer.entities.remove(e));
    this.breachEntities = [];
  }
}
