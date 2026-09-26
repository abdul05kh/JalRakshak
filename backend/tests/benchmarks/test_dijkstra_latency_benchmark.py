import time
from backend.app.algorithms.choke_point_analyzer import identify_road_choke_points

def test_choke_point_analysis_performance():
    segments = [
        {"segment_id": f"SEG-{i:04d}", "lanes": 1 if i % 3 == 0 else 2, "is_bridge": (i % 7 == 0), "slope_pct": (i % 15), "inundation_arrival_sec": 3000 + i * 10}
        for i in range(500)
    ]
    t0 = time.perf_counter()
    for _ in range(100):
        identify_road_choke_points(segments)
    elapsed = time.perf_counter() - t0
    assert elapsed < 0.50, f"Analysis took {elapsed:.4f}s"
