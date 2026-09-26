from backend.app.algorithms.sar_water_detector import classify_sar_pixels

def test_water_mask():
    grid = [[-20.0, -18.0], [-12.0, -10.0]]
    mask = classify_sar_pixels(grid, -16.5)
    assert mask == [[1, 1], [0, 0]]
