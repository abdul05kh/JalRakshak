from backend.app.algorithms.multimodal_routing import assign_settlements_to_shelters

def test_shelter_assignment_within_capacity():
    settlements = [{"id": "SET-01", "population": 300, "risk_score": 90}]
    shelters = [{"id": "SH-01", "capacity": 500}]
    res = assign_settlements_to_shelters(settlements, shelters)
    assert res[0]["assigned_shelter_id"] == "SH-01"

def test_shelter_overflow():
    settlements = [{"id": "SET-01", "population": 800, "risk_score": 90}]
    shelters = [{"id": "SH-01", "capacity": 500}]
    res = assign_settlements_to_shelters(settlements, shelters)
    assert res[0]["assigned_shelter_id"] == "OVERFLOW_FIELD_CAMP"
