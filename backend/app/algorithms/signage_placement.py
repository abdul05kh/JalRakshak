from typing import List, Dict

def determine_signage_locations(junctions: List[Dict]) -> List[Dict]:
    """Identify road intersections requiring high-visibility retroreflective guidance signs."""
    placements = []
    for junc in junctions:
        branches = junc.get("branch_count", 2)
        is_evac_corridor = junc.get("is_on_route_r02", False)
        
        if branches >= 3 or is_evac_corridor:
            placements.append({
                "junction_id": junc.get("id"),
                "sign_type": "EVACUATION_DIRECTION_ARROW",
                "recommended_bearing_deg": junc.get("optimal_exit_bearing", 0.0),
                "mount_type": "HIGH_WIND_STEEL_GANTRY"
            })
    return placements
