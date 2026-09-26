from typing import Dict, Any

def calculate_shelter_stockpile_duration(evacuee_count: int, water_liters: float, food_rations: int) -> Dict[str, Any]:
    if evacuee_count <= 0:
        return {"water_days": 999.0, "food_days": 999.0, "critical_resource": "NONE"}
    water_daily_demand = evacuee_count * 18.0
    food_daily_demand = evacuee_count
    
    water_days = water_liters / water_daily_demand
    food_days = food_rations / food_daily_demand
    
    critical_res = "WATER" if water_days < food_days else "FOOD"
    return {
        "water_days": round(water_days, 1),
        "food_days": round(food_days, 1),
        "min_survival_days": round(min(water_days, food_days), 1),
        "critical_resource": critical_res
    }
