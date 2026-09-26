def classify_start_triage(can_walk: bool, breathing: bool, respiratory_rate: int, capillary_refill_sec: float, can_follow_commands: bool) -> str:
    """Implement Simple Triage and Rapid Treatment (START) algorithm."""
    if can_walk:
        return "GREEN"
    if not breathing:
        return "BLACK"
    if respiratory_rate > 30 or respiratory_rate < 10:
        return "RED"
    if capillary_refill_sec > 2.0:
        return "RED"
    if not can_follow_commands:
        return "RED"
    return "YELLOW"
