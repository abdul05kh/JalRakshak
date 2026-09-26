from backend.app.algorithms.vehicle_thresholds import check_vehicle_passability

def test_car_fail_depth():
    assert check_vehicle_passability("passenger_car", 0.45, 0.2) is False

def test_bus_pass_moderate():
    assert check_vehicle_passability("heavy_bus", 0.60, 1.0) is True
