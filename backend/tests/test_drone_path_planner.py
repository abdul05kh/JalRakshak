from backend.app.algorithms.drone_path_planner import plan_uav_recon_waypoints

def test_uav_tour():
    targets = [(30.34, 78.47), (30.32, 78.46)]
    tour = plan_uav_recon_waypoints(30.37, 78.48, targets)
    assert len(tour) == 4
    assert tour[0] == tour[-1]
