import pytest
from backend.app.domain.units import (
    kmh_to_mps,
    mps_to_kmh,
    minutes_to_seconds,
    seconds_to_minutes,
    hours_to_seconds,
    seconds_to_hours,
    feet_to_meters,
    meters_to_feet,
    seconds_to_duration,
    duration_to_seconds,
)

def test_speed_conversions():
    # 50 km/h = 13.888... m/s
    mps = kmh_to_mps(50.0)
    assert round(mps, 3) == 13.889
    assert round(mps_to_kmh(mps), 2) == 50.0
    
    # 0 km/h
    assert kmh_to_mps(0.0) == 0.0
    assert mps_to_kmh(0.0) == 0.0

    # Negative speed raises ValueError
    with pytest.raises(ValueError):
        kmh_to_mps(-10.0)
    with pytest.raises(ValueError):
        mps_to_kmh(-5.0)

def test_time_conversions():
    assert minutes_to_seconds(3.0) == 180.0
    assert seconds_to_minutes(180.0) == 3.0
    assert hours_to_seconds(2.0) == 7200.0
    assert seconds_to_hours(7200.0) == 2.0

    with pytest.raises(ValueError):
        minutes_to_seconds(-1.0)
    with pytest.raises(ValueError):
        seconds_to_minutes(-1.0)
    with pytest.raises(ValueError):
        hours_to_seconds(-1.0)

def test_length_conversions():
    assert round(feet_to_meters(100.0), 4) == 30.48
    assert round(meters_to_feet(30.48), 2) == 100.0

def test_duration_formatting_and_parsing():
    # 44 min 21 sec = 2661 sec
    s = 2661.0
    dur = seconds_to_duration(s)
    assert dur == "44:21"
    assert duration_to_seconds(dur) == 2661.0

    # > 1 hour
    s_hour = 3600.0 + 12.0 * 60.0 + 39.0
    dur_hour = seconds_to_duration(s_hour)
    assert dur_hour == "01:12:39"
    assert duration_to_seconds(dur_hour) == s_hour

    # Round trip
    assert duration_to_seconds("12:39") == 759.0
    assert duration_to_seconds("03:00") == 180.0

    with pytest.raises(ValueError):
        duration_to_seconds("invalid:format:with:too:many:parts")
