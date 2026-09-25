from backend.app.domain.geo_transform import geo_transformer

def test_wgs84_utm_roundtrip():
    results = geo_transformer.validate_control_points()
    assert len(results) == 5
    for res in results:
        assert res["status"] == "PASS", f"Failed for {res['name']}"
        assert res["residual_error_deg"][0] < 1e-4
        assert res["residual_error_deg"][1] < 1e-4

def test_tehri_dam_utm_coordinates():
    east, north = geo_transformer.wgs84_to_utm(78.4803, 30.3780)
    # UTM 44N should be approximately East ~ 257850m, North ~ 3363360m
    assert 255000 < east < 260000
    assert 3360000 < north < 3365000
