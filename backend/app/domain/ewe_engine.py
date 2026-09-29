import math
import networkx as nx
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone

EWE_ALGORITHM_VERSION = "1.0.0"

class EvacuationWindowEngine:
    def __init__(self, roads_dict: Dict[str, Any], evac_points_dict: Dict[str, Any]):
        self.roads = roads_dict
        self.evac_points = evac_points_dict
        self.graph = nx.Graph()
        self._build_graph()

    def _build_graph(self):
        self.node_coords: Dict[str, Tuple[float, float]] = {}
        for road_id, feat in self.roads.items():
            props = feat["properties"]
            u = props["u"]
            v = props["v"]
            length_m = props.get("length_m", 1000.0)
            speed_kmh = props.get("speed_kmh", 50.0)
            travel_time_min = props.get("travel_time_min")
            if travel_time_min is None:
                speed_mpm = (speed_kmh * 1000.0) / 60.0
                travel_time_min = round(length_m / speed_mpm, 2) if speed_mpm > 0 else 1.0
            
            road_class = props.get("road_class", "Primary")
            coords = feat.get("geometry", {}).get("coordinates", [])
            
            # Store node geographic coordinates (lon, lat)
            if coords and len(coords) >= 2:
                self.node_coords[u] = (float(coords[0][0]), float(coords[0][1]))
                self.node_coords[v] = (float(coords[-1][0]), float(coords[-1][1]))
            
            self.graph.add_edge(
                u, v,
                id=road_id,
                length_m=length_m,
                travel_time_min=travel_time_min,
                road_class=road_class,
                speed_kmh=speed_kmh,
                coords=coords
            )

        # Also register any evacuation point coordinates
        for pt_id, pt in self.evac_points.items():
            c = pt["geometry"]["coordinates"]
            node_key = pt["properties"].get("node_id") or pt["properties"].get("id") or pt_id
            if node_key not in self.node_coords:
                self.node_coords[node_key] = (float(c[0]), float(c[1]))

    def snap_to_node(self, lat: float, lon: float, max_search_radius_m: float = 25000.0) -> Tuple[str, float]:
        """Snap arbitrary coordinate to nearest road graph node by geometric distance. Return (node_id, snap_distance_m)."""
        best_node = None
        min_dist = float("inf")

        # 1. Search across all graph node coordinates
        for node_id, (n_lon, n_lat) in self.node_coords.items():
            dist = self._haversine_m(lon, lat, n_lon, n_lat)
            if dist < min_dist:
                min_dist = dist
                best_node = node_id

        if best_node is None or min_dist > max_search_radius_m:
            return "UNRESOLVED_LOCATION", float("inf")

        return best_node, round(min_dist, 1)

    def _haversine_m(self, lon1, lat1, lon2, lat2):
        R = 6371000.0
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def evaluate_route(
        self,
        path_nodes: List[str],
        edge_hydraulics: Dict[str, Any],
        departure_dt: datetime,
        safety_buffer_min: float = 3.0,
        depth_limit_m: float = 0.3,
        velocity_limit_mps: float = 1.0,
        scenario_start_dt: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a sequence of nodes under the Evacuation Window Engine contract.
        D_deadline = min_i (A_i - T_i - B)
        Margin = D_deadline - D_departure
        """
        edges_detail = []
        cumulative_travel_s = 0.0
        min_deadline_s = float("inf")
        limiting_edge_info = None
        route_distance_m = 0.0
        is_route_feasible = True
        has_data_gap = False

        buffer_s = safety_buffer_min * 60.0

        # Establish scenario start datetime reference (defaults to departure_dt if not explicitly provided)
        if scenario_start_dt is None:
            scenario_start_dt = departure_dt
        
        # Departure time relative to scenario start in seconds
        dep_rel_s = (departure_dt - scenario_start_dt).total_seconds()

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i+1]
            edge_data = self.graph.get_edge_data(u, v)
            if not edge_data:
                continue

            edge_id = edge_data["id"]
            length_m = edge_data["length_m"]
            travel_min = edge_data["travel_time_min"]
            travel_s = travel_min * 60.0
            
            cumulative_travel_s += travel_s
            route_distance_m += length_m

            # Query hydraulic values for this edge
            hyd = edge_hydraulics.get(edge_id)
            if not hyd:
                has_data_gap = True
                arrival_s = None
                max_depth = 0.0
                max_vel = 0.0
                inundated = False
            else:
                arr_val = hyd.get("arrival_s") if "arrival_s" in hyd else hyd.get("flood_arrival_s")
                arrival_s = arr_val if (arr_val is not None and arr_val < 99999) else None
                max_depth = float(hyd.get("max_depth_m", 0.0))
                max_vel = float(hyd.get("max_vel_mps") if "max_vel_mps" in hyd else hyd.get("max_velocity_mps", 0.0))
                inundated = hyd.get("inundated", max_depth >= depth_limit_m)

            # Edge-level deadline calculation in simulation seconds: D_i = A_i - T_i - B
            if arrival_s is None:
                edge_deadline_s = float("inf")
                edge_deadline_utc = None
                edge_feasible = True
                failure_reason = None
            else:
                edge_deadline_s = arrival_s - cumulative_travel_s - buffer_s
                edge_deadline_dt = scenario_start_dt + timedelta(seconds=max(0, edge_deadline_s))
                edge_deadline_utc = edge_deadline_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                edge_margin_s = edge_deadline_s - dep_rel_s

                # Feasibility check for this edge:
                # Does vehicle departure satisfy D_dep <= D_deadline_i?
                if (max_depth >= depth_limit_m or max_vel >= velocity_limit_mps) and edge_margin_s < 0:
                    edge_feasible = False
                    is_route_feasible = False
                    failure_reason = (
                        f"Inundation depth ({max_depth}m >= {depth_limit_m}m threshold) reaches segment "
                        f"at {arrival_s//60} min before vehicle clearance with configured safety buffer."
                    )
                else:
                    edge_feasible = True
                    failure_reason = None

                if edge_deadline_s < min_deadline_s:
                    min_deadline_s = edge_deadline_s
                    limiting_edge_info = {
                        "road_id": edge_id,
                        "road_class": edge_data["road_class"],
                        "length_m": length_m,
                        "cumulative_travel_min": round(cumulative_travel_s / 60.0, 2),
                        "flood_arrival_s": arrival_s,
                        "flood_arrival_utc": (scenario_start_dt + timedelta(seconds=arrival_s)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "max_depth_m": max_depth,
                        "max_velocity_mps": max_vel,
                        "limiting_deadline_utc": edge_deadline_utc,
                        "margin_min": round(edge_margin_s / 60.0, 1),
                        "failure_reason": failure_reason or "Earliest time-constrained road segment on route."
                    }

            arrival_utc = (scenario_start_dt + timedelta(seconds=arrival_s)).strftime("%Y-%m-%dT%H:%M:%SZ") if arrival_s is not None else None

            edges_detail.append({
                "edge_id": edge_id,
                "u": u,
                "v": v,
                "road_class": edge_data["road_class"],
                "speed_kmh": edge_data["speed_kmh"],
                "length_m": round(length_m, 1),
                "travel_time_min": round(travel_min, 2),
                "cumulative_travel_min": round(cumulative_travel_s / 60.0, 2),
                "flood_arrival_s": arrival_s,
                "flood_arrival_utc": arrival_utc,
                "max_depth_m": max_depth,
                "max_velocity_mps": max_vel,
                "edge_deadline_s": edge_deadline_s if edge_deadline_s != float("inf") else None,
                "edge_deadline_utc": edge_deadline_utc,
                "edge_feasible": edge_feasible,
                "failure_reason": failure_reason
            })

        total_travel_min = round(cumulative_travel_s / 60.0, 2)
        
        # Calculate overall deadline and status
        if has_data_gap:
            status = "DATA GAP"
            deadline_utc = None
            margin_min = None
            explanation = "Cannot determine route feasibility: flood arrival data is unavailable on one or more route segments."
        elif min_deadline_s == float("inf"):
            status = "FEASIBLE"
            deadline_utc = None
            margin_min = float("inf")
            explanation = (
                f"Route is fully FEASIBLE. All segments traverse high ground above modelled flood elevations. "
                f"Total route travel time: {total_travel_min} min."
            )
        else:
            deadline_dt = scenario_start_dt + timedelta(seconds=max(0, min_deadline_s))
            deadline_utc = deadline_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            margin_s = min_deadline_s - dep_rel_s
            margin_min = round(margin_s / 60.0, 1)

            if margin_s < 0 or not is_route_feasible:
                status = "INFEASIBLE"
                explanation = (
                    f"Route is INFEASIBLE under this scenario. Limiting segment {limiting_edge_info['road_id']} "
                    f"({limiting_edge_info['road_class']}) is projected to experience flood depth of {limiting_edge_info['max_depth_m']}m "
                    f"at {limiting_edge_info['flood_arrival_utc']}, which occurs before the vehicle can clear it "
                    f"(cumulative travel: {limiting_edge_info['cumulative_travel_min']} min + {safety_buffer_min} min buffer)."
                )
            elif margin_min <= 5.0:
                status = "LOW MARGIN"
                explanation = (
                    f"Route is FEASIBLE WITH LOW TIME MARGIN ({margin_min} min). "
                    f"Model-derived departure deadline is {deadline_utc}. "
                    f"Limiting segment {limiting_edge_info['road_id']} requires clearing before flood arrival at {limiting_edge_info['flood_arrival_utc']}."
                )
            else:
                status = "FEASIBLE"
                explanation = (
                    f"Route is FEASIBLE under this scenario and configured safety buffer ({safety_buffer_min} min). "
                    f"Model-derived departure deadline: {deadline_utc} (Safety Margin: {margin_min} min). "
                    f"First limiting segment: {limiting_edge_info['road_id']}."
                )

        return {
            "status": status,
            "total_distance_m": round(route_distance_m, 1),
            "total_travel_time_min": total_travel_min,
            "deadline_utc": deadline_utc,
            "margin_min": margin_min,
            "limiting_segment": limiting_edge_info,
            "edges": edges_detail,
            "explanation": explanation
        }

    def analyze_evacuation(
        self,
        origin_node: str,
        dest_node: str,
        edge_hydraulics: Dict[str, Any],
        departure_dt: datetime,
        safety_buffer_min: float = 3.0,
        depth_limit_m: float = 0.3,
        velocity_limit_mps: float = 1.0,
        k_routes: int = 3,
        scenario_start_dt: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Compute k-shortest path alternatives and evaluate each with EWE."""
        if (
            not self.graph.has_node(origin_node)
            or not self.graph.has_node(dest_node)
            or not nx.has_path(self.graph, origin_node, dest_node)
        ):
            return []

        # Find simple paths sorted by travel time
        all_paths = list(nx.all_simple_paths(self.graph, origin_node, dest_node, cutoff=7))
        all_paths.sort(key=lambda p: sum(
            self.graph[p[i]][p[i+1]]["travel_time_min"] for i in range(len(p)-1)
        ))

        candidate_paths = all_paths[:k_routes]
        results = []

        for idx, path in enumerate(candidate_paths):
            route_res = self.evaluate_route(
                path_nodes=path,
                edge_hydraulics=edge_hydraulics,
                departure_dt=departure_dt,
                safety_buffer_min=safety_buffer_min,
                depth_limit_m=depth_limit_m,
                velocity_limit_mps=velocity_limit_mps,
                scenario_start_dt=scenario_start_dt
            )
            route_res["route_index"] = idx + 1
            route_res["name"] = f"Route {'A' if idx==0 else 'B' if idx==1 else 'C'} ({' -> '.join(path)})"
            results.append(route_res)

        return results
