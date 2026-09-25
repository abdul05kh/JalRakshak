/**
 * RiverLayer.ts
 * Renders the Bhagirathi River corridor and Tehri Reservoir water surface in 3D terrain.
 */

import * as Cesium from "cesium";

export class RiverLayer {
  private viewer: Cesium.Viewer;
  private riverEntities: Cesium.Entity[] = [];
  private reservoirEntity: Cesium.Entity | null = null;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initializeRiverAndReservoir();
  }

  private initializeRiverAndReservoir(): void {
    // Authoritative Bhagirathi River centerline coordinates from Tehri Dam to Devprayag
    const riverCoords: [number, number][] = [
      [78.4750, 30.3950],
      [78.4780, 30.3850],
      [78.4803, 30.3780], // Tehri Dam
      [78.4830, 30.3700],
      [78.4770, 30.3550],
      [78.4680, 30.3400], // Malidewal bend
      [78.4750, 30.3200],
      [78.4890, 30.3000],
      [78.4970, 30.2800], // Koteshwar Dam
      [78.5150, 30.2600],
      [78.5350, 30.2350],
      [78.5600, 30.1900],
      [78.5800, 30.1650],
      [78.5980, 30.1450]  // Devprayag Confluence
    ];

    const riverPositions = riverCoords.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));

    // River centerline polyline
    const riverEntity = this.viewer.entities.add({
      name: "Bhagirathi River Corridor",
      properties: new Cesium.PropertyBag({
        type: "RIVER",
        name: "Bhagirathi River",
        length_km: 38.5,
        flow_direction: "Downstream (North to South-East)"
      }),
      polyline: {
        positions: riverPositions,
        clampToGround: true,
        width: 8,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.85)
        })
      }
    });
    this.riverEntities.push(riverEntity);

    // Tehri Reservoir (Swami Ram Tirtha Sagar) water surface polygon upstream of dam (830m FRL)
    const reservoirCoords = [
      [78.4550, 30.4000],
      [78.4650, 30.4150],
      [78.4800, 30.4100],
      [78.4850, 30.3950],
      [78.4810, 30.3790],
      [78.4780, 30.3795],
      [78.4650, 30.3880],
      [78.4550, 30.4000]
    ];

    const resPositions = reservoirCoords.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat, 825.0));

    this.reservoirEntity = this.viewer.entities.add({
      name: "Tehri Reservoir (Swami Ram Tirtha Sagar)",
      properties: new Cesium.PropertyBag({
        type: "RESERVOIR",
        name: "Tehri Reservoir",
        full_reservoir_level_m: 830.0,
        gross_storage_mcm: 3540.0
      }),
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(resPositions),
        height: 825.0,
        material: Cesium.Color.fromCssColorString("#0369a1").withAlpha(0.65),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.8)
      }
    });
  }

  public setVisibility(river: boolean, reservoir: boolean): void {
    this.riverEntities.forEach((entity) => {
      entity.show = river;
    });
    if (this.reservoirEntity) {
      this.reservoirEntity.show = reservoir;
    }
  }

  public clear(): void {
    this.riverEntities.forEach((e) => this.viewer.entities.remove(e));
    this.riverEntities = [];
    if (this.reservoirEntity) {
      this.viewer.entities.remove(this.reservoirEntity);
      this.reservoirEntity = null;
    }
  }
}
