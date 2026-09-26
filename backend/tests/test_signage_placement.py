from backend.app.algorithms.signage_placement import determine_signage_locations

def test_signage_junctions():
    junctions = [
        {"id": "J-01", "branch_count": 4, "is_on_route_r02": True, "optimal_exit_bearing": 45.0},
        {"id": "J-02", "branch_count": 2, "is_on_route_r02": False}
    ]
    res = determine_signage_locations(junctions)
    assert len(res) == 1
    assert res[0]["junction_id"] == "J-01"
