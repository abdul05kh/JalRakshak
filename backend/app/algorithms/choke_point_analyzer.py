from typing import List, Dict

def identify_road_choke_points(segments: List[Dict]) -> List[Dict]:
    """Identify bottleneck segments with lane reduction or high elevation vulnerability."""
    choke_points = []
    for seg in segments:
        lanes = seg.get("lanes", 2)
        inundation_time = seg.get("inundation_arrival_sec", 999999)
        slope_pct = seg.get("slope_pct", 0.0)
        is_bridge = seg.get("is_bridge", False)
        
        score = 0
        if lanes == 1:
            score += 40
        if is_bridge:
            score += 30
        if slope_pct > 12.0:
            score += 20
        if inundation_time < 3600:
            score += 50
            
        if score >= 50:
            choke_points.append({
                "segment_id": seg.get("segment_id"),
                "vulnerability_score": score,
                "is_critical": score >= 70
            })
    return choke_points
