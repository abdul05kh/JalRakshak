from backend.app.algorithms.shelter_logistics import calculate_shelter_stockpile_duration

def test_shelter_stockpile():
    res = calculate_shelter_stockpile_duration(100, 3600.0, 500)
    assert res["water_days"] == 2.0
    assert res["food_days"] == 5.0
    assert res["critical_resource"] == "WATER"
