import math

def calculate_siren_spl_at_distance(source_spl_db_at_1m: float, distance_m: float, atmospheric_attenuation_db_per_km: float = 5.0) -> float:
    """Calculate sound pressure level (SPL) at distance d considering geometric spreading and atmospheric absorption."""
    if distance_m <= 1.0:
        return source_spl_db_at_1m
    geometric_loss = 20.0 * math.log10(distance_m)
    atmospheric_loss = (distance_m / 1000.0) * atmospheric_attenuation_db_per_km
    return round(source_spl_db_at_1m - geometric_loss - atmospheric_loss, 1)

def is_siren_audible(spl_db: float, ambient_noise_db: float = 55.0) -> bool:
    """Audibility requires SPL to exceed ambient background noise by at least 10 dB."""
    return spl_db >= (ambient_noise_db + 10.0)
