from backend.app.algorithms.stochastic_departure import generate_rayleigh_departure_curve

def test_departure_sum():
    pop = 1000
    curve = generate_rayleigh_departure_curve(pop, 15.0, 20)
    assert sum(curve) > 850.0
