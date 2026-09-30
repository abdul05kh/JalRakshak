import pytest
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

def test_coordinate_validation():
    valid, err = geo_transformer.validate_coordinates(78.48, 30.37)
    assert valid is True
    assert err is None

    # Out of bounds lon
    valid, err = geo_transformer.validate_coordinates(200.0, 30.0)
    assert valid is False
    assert "Longitude" in err

    # Out of bounds lat
    valid, err = geo_transformer.validate_coordinates(78.0, 95.0)
    assert valid is False
    assert "Latitude" in err

    # NaN / Inf coordinates
    valid, err = geo_transformer.validate_coordinates(float("nan"), 30.0)
    assert valid is False
    assert "finite" in err

    # Exception raised on invalid wgs84_to_utm
    with pytest.raises(ValueError):
        geo_transformer.wgs84_to_utm(200.0, 30.0)

def test_linestring_validation():
    # Valid linestring
    valid, err = geo_transformer.validate_linestring_coords([[78.4, 30.3], [78.5, 30.4]])
    assert valid is True

    # Too short
    valid, err = geo_transformer.validate_linestring_coords([[78.4, 30.3]])
    assert valid is False

    # NaN inside linestring
    valid, err = geo_transformer.validate_linestring_coords([[78.4, 30.3], [float("nan"), 30.4]])
    assert valid is False
