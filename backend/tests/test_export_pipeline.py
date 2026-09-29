"""
Automated Test Suite for GIS Export Pipeline (GeoJSON & OGC KML 2.2).
"""

import pytest
import xml.etree.ElementTree as ET
from backend.app.domain.exporter import ScenarioExporter


def test_export_geojson_valid():
    fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [78.48, 30.38]},
                "properties": {"id": "SETTLE-01", "name": "Malidewal"}
            }
        ]
    }
    raw = ScenarioExporter.export_geojson(fc)
    assert '"FeatureCollection"' in raw
    assert '"Malidewal"' in raw


def test_export_kml_polygon_and_linestring():
    fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[78.48, 30.38, 600.0], [78.49, 30.38, 600.0], [78.49, 30.39, 600.0], [78.48, 30.38, 600.0]]]
                },
                "properties": {"id": "CELL-101", "depth_m": 4.5, "wse_m": 604.5}
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[78.48, 30.38, 600.0], [78.50, 30.40, 620.0]]
                },
                "properties": {"id": "R02-E01", "road_class": "Primary Highway"}
            }
        ]
    }
    kml_str = ScenarioExporter.export_kml(fc, doc_name="Test Export")
    assert "<kml" in kml_str
    assert "CELL-101" in kml_str
    assert "R02-E01" in kml_str
    assert "<Polygon>" in kml_str
    assert "<LineString>" in kml_str
    
    # Parse as XML to verify structural validity
    root = ET.fromstring(kml_str)
    assert root.tag.endswith("kml")


def test_build_road_impact_feature_collection():
    roads_fc = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[78.48, 30.38], [78.49, 30.39]]},
                "properties": {"id": "R01", "length_m": 2000.0, "speed_kmh": 60.0}
            }
        ]
    }
    hydraulics = {
        "R01": {"flood_arrival_s": 3600.0, "max_depth_m": 1.2, "max_velocity_mps": 2.5}
    }
    res = ScenarioExporter.build_road_impact_feature_collection(roads_fc, hydraulics, "SCENARIO_CENTRAL")
    assert len(res["features"]) == 1
    props = res["features"][0]["properties"]
    assert props["scenario_id"] == "SCENARIO_CENTRAL"
    assert props["flood_arrival_s"] == 3600.0
    assert props["operational_status"] == "FEASIBLE"
    assert props["departure_margin_s"] is not None
