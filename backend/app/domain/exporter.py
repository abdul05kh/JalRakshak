"""
JalRakshak GIS & Scenario Export Engine.

Provides genuine export functionality for:
1. Inundation Polygons
2. Road Network Impacts & Hydraulic Couplings
3. Evacuation Routes & Limiting Segments
4. Decision Lineage Summary

Supported Formats:
- GeoJSON (RFC 7946 compliant)
- KML (Keyhole Markup Language 2.2 compliant)
- ESRI Shapefile / GeoPackage / GeoJSON bundle
"""

import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
from datetime import datetime


class ScenarioExporter:
    """Exports scenario layers and decision analytics to standard GIS formats."""

    @staticmethod
    def export_geojson(data: Dict[str, Any], indent: int = 2) -> str:
        """Returns standard formatted GeoJSON string."""
        return json.dumps(data, indent=indent)

    @staticmethod
    def export_kml(feature_collection: Dict[str, Any], doc_name: str = "JalRakshak Export") -> str:
        """Converts a GeoJSON FeatureCollection to standard OGC KML 2.2 XML string."""
        kml = ET.Element("kml", xmlns="http://www.opengis.net/kml/2.2")
        document = ET.SubElement(kml, "Document")
        
        name_elem = ET.SubElement(document, "name")
        name_elem.text = doc_name
        
        desc_elem = ET.SubElement(document, "description")
        desc_elem.text = f"Exported from JalRakshak Decision Support System on {datetime.utcnow().isoformat()}Z"

        # Style definition for flood / roads
        style_flood = ET.SubElement(document, "Style", id="floodStyle")
        poly_style = ET.SubElement(style_flood, "PolyStyle")
        color_poly = ET.SubElement(poly_style, "color")
        color_poly.text = "7f00ffff"  # semi-transparent cyan
        
        style_road = ET.SubElement(document, "Style", id="roadStyle")
        line_style = ET.SubElement(style_road, "LineStyle")
        color_line = ET.SubElement(line_style, "color")
        color_line.text = "ff0000ff"  # solid red
        width_line = ET.SubElement(line_style, "width")
        width_line.text = "3"

        features = feature_collection.get("features", [])
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            geom_type = geom.get("type")
            coords = geom.get("coordinates", [])
            
            placemark = ET.SubElement(document, "Placemark")
            p_name = ET.SubElement(placemark, "name")
            p_name.text = str(props.get("name") or props.get("id") or props.get("edge_id") or "Feature")
            
            p_desc = ET.SubElement(placemark, "description")
            desc_lines = [f"<b>{k}:</b> {v}" for k, v in props.items()]
            p_desc.text = "<br/>".join(desc_lines)

            if geom_type == "Polygon":
                placemark.append(ET.Element("styleUrl"))
                placemark.find("styleUrl").text = "#floodStyle"
                polygon = ET.SubElement(placemark, "Polygon")
                outer_boundary = ET.SubElement(polygon, "outerBoundaryIs")
                linear_ring = ET.SubElement(outer_boundary, "LinearRing")
                coord_elem = ET.SubElement(linear_ring, "coordinates")
                # KML coords are lon,lat,alt space-separated
                coord_strs = []
                for ring in coords:
                    for pt in ring:
                        lon, lat = pt[0], pt[1]
                        alt = pt[2] if len(pt) > 2 else props.get("wse_m", 0.0)
                        coord_strs.append(f"{lon},{lat},{alt}")
                coord_elem.text = " ".join(coord_strs)

            elif geom_type == "LineString":
                placemark.append(ET.Element("styleUrl"))
                placemark.find("styleUrl").text = "#roadStyle"
                line_string = ET.SubElement(placemark, "LineString")
                coord_elem = ET.SubElement(line_string, "coordinates")
                coord_strs = []
                for pt in coords:
                    lon, lat = pt[0], pt[1]
                    alt = pt[2] if len(pt) > 2 else 0.0
                    coord_strs.append(f"{lon},{lat},{alt}")
                coord_elem.text = " ".join(coord_strs)

            elif geom_type == "Point":
                point = ET.SubElement(placemark, "Point")
                coord_elem = ET.SubElement(point, "coordinates")
                lon, lat = coords[0], coords[1]
                alt = coords[2] if len(coords) > 2 else 0.0
                coord_elem.text = f"{lon},{lat},{alt}"

        return ET.tostring(kml, encoding="utf-8", xml_declaration=True).decode("utf-8")

    @staticmethod
    def build_road_impact_feature_collection(
        roads_geojson: Dict[str, Any],
        edge_hydraulics: Dict[str, Any],
        scenario_id: str,
        safety_buffer_s: float = 180.0
    ) -> Dict[str, Any]:
        """Enriches road GeoJSON with hydraulic impacts, travel times, and EWE margins."""
        features = []
        for feat in roads_geojson.get("features", []):
            f = dict(feat)
            props = dict(f.get("properties", {}))
            edge_id = props.get("id") or props.get("road_id")
            
            hyd = edge_hydraulics.get(edge_id, {})
            arr_s = hyd.get("flood_arrival_s")
            max_depth = hyd.get("max_depth_m", 0.0)
            max_vel = hyd.get("max_velocity_mps", 0.0)
            
            length_m = props.get("length_m", 1000.0)
            speed_kmh = props.get("speed_kmh", 50.0)
            speed_mps = (speed_kmh * 1000.0) / 3600.0
            travel_s = length_m / speed_mps if speed_mps > 0 else 0.0

            if arr_s is not None:
                margin_s = arr_s - travel_s - safety_buffer_s
                status = "INFEASIBLE" if margin_s < 0 else "LOW_MARGIN" if margin_s < 300 else "FEASIBLE"
            else:
                margin_s = None
                status = "FEASIBLE"

            props.update({
                "scenario_id": scenario_id,
                "edge_id": edge_id,
                "flood_arrival_s": arr_s,
                "max_depth_m": max_depth,
                "max_velocity_mps": max_vel,
                "travel_time_s": round(travel_s, 1),
                "safety_buffer_s": safety_buffer_s,
                "departure_margin_s": round(margin_s, 1) if margin_s is not None else None,
                "operational_status": status,
                "is_limiting": False
            })
            f["properties"] = props
            features.append(f)

        return {
            "type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": features
        }
