from backend.app.algorithms.normal_depth import solve_normal_depth_trapezoidal

def test_normal_depth_convergence():
    yn = solve_normal_depth_trapezoidal(1000.0, 50.0, 1.5, 0.005, 0.04)
    assert 3.0 < yn < 6.0
