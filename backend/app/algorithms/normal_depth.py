import math

def solve_normal_depth_trapezoidal(discharge_m3s: float, bottom_width_m: float, side_slope_z: float, bed_slope: float, mannings_n: float, max_iter: int = 50) -> float:
    """Solve for normal depth y_n in a trapezoidal open channel using Newton-Raphson."""
    y = 1.0
    tol = 1e-4
    
    for _ in range(max_iter):
        area = (bottom_width_m + side_slope_z * y) * y
        perimeter = bottom_width_m + 2.0 * y * math.sqrt(1.0 + side_slope_z ** 2)
        if perimeter <= 0 or area <= 0:
            break
        r_h = area / perimeter
        
        f = (1.0 / mannings_n) * area * (r_h ** (2.0 / 3.0)) * math.sqrt(bed_slope) - discharge_m3s
        if abs(f) < tol:
            return round(y, 3)
            
        dy = 1e-5
        a_plus = (bottom_width_m + side_slope_z * (y + dy)) * (y + dy)
        p_plus = bottom_width_m + 2.0 * (y + dy) * math.sqrt(1.0 + side_slope_z ** 2)
        f_plus = (1.0 / mannings_n) * a_plus * ((a_plus / p_plus) ** (2.0 / 3.0)) * math.sqrt(bed_slope) - discharge_m3s
        df = (f_plus - f) / dy
        
        y = y - f / df
        if y <= 0.01:
            y = 0.01
            
    return round(y, 3)
