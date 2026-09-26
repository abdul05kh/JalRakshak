from backend.app.algorithms.courant_checker import calculate_courant_number, verify_cfl_stability

def test_courant_stable_subcritical():
    stable, cfl = verify_cfl_stability(max_velocity_ms=4.0, max_depth_m=10.0, delta_t_sec=2.0, delta_x_m=50.0)
    assert stable is True
    assert cfl < 1.0

def test_courant_unstable_supercritical():
    stable, cfl = verify_cfl_stability(max_velocity_ms=18.0, max_depth_m=25.0, delta_t_sec=10.0, delta_x_m=30.0)
    assert stable is False
    assert cfl > 1.0
