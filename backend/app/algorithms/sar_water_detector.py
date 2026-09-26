from typing import List

def classify_sar_pixels(backscatter_db_grid: List[List[float]], water_threshold_db: float = -16.5) -> List[List[int]]:
    """Classify 2D radar SAR backscatter values into open water (1) and dry land (0)."""
    result = []
    for row in backscatter_db_grid:
        result_row = [1 if val <= water_threshold_db else 0 for val in row]
        result.append(result_row)
    return result
