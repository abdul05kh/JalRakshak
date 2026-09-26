from backend.app.algorithms.siren_coverage import calculate_siren_spl_at_distance, is_siren_audible

def test_siren_attenuation():
    spl = calculate_siren_spl_at_distance(135.0, 1000.0)
    assert 65.0 < spl < 80.0
    assert is_siren_audible(spl, 55.0) is True
