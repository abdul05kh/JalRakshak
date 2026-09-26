from backend.app.algorithms.choke_point_analyzer import identify_road_choke_points

def test_choke_point_detection():
    segments = [
        {"segment_id": "R02-E01", "lanes": 2, "is_bridge": False, "slope_pct": 3.0, "inundation_arrival_sec": 7200},
        {"segment_id": "R02-E07", "lanes": 1, "is_bridge": True, "slope_pct": 14.0, "inundation_arrival_sec": 3600}
    ]
    results = identify_road_choke_points(segments)
    assert len(results) == 1
    assert results[0]["segment_id"] == "R02-E07"
    assert results[0]["is_critical"] is True
