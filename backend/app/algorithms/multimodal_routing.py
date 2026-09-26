from typing import List, Dict

def assign_settlements_to_shelters(settlements: List[Dict], shelters: List[Dict]) -> List[Dict]:
    """Greedy capacity-constrained nearest shelter assignment for displaced populations."""
    shelter_capacities = {s["id"]: s["capacity"] for s in shelters}
    assignments = []
    
    for setl in sorted(settlements, key=lambda x: x.get("risk_score", 0), reverse=True):
        assigned_shelter = None
        pop = setl["population"]
        
        for sh in shelters:
            sh_id = sh["id"]
            if shelter_capacities.get(sh_id, 0) >= pop:
                assigned_shelter = sh_id
                shelter_capacities[sh_id] -= pop
                break
                
        assignments.append({
            "settlement_id": setl["id"],
            "assigned_shelter_id": assigned_shelter if assigned_shelter else "OVERFLOW_FIELD_CAMP",
            "allocated_count": pop
        })
    return assignments
