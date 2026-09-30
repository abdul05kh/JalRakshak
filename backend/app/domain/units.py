"""
Authoritative Unit System for JalRakshak Emergency Decision Support System.

Establishes strict conversion rules and eliminates implicit time/velocity/distance conversions.

Primary Authoritative Conventions:
- Depth: meters (m)
- Velocity: meters per second (m/s)
- Distance: meters (m)
- Time: seconds (s)
- Road Travel Speed: kilometers per hour (km/h) externally; explicitly converted to m/s during calculations.
- Safety Buffer: minutes (min) externally; converted to seconds (s) for EWE deadline computation.
"""

from typing import Tuple

def kmh_to_mps(speed_kmh: float) -> float:
    """Convert kilometers per hour to meters per second."""
    if speed_kmh < 0:
        raise ValueError(f"Speed cannot be negative: {speed_kmh}")
    return speed_kmh * (1000.0 / 3600.0)

def mps_to_kmh(speed_mps: float) -> float:
    """Convert meters per second to kilometers per hour."""
    if speed_mps < 0:
        raise ValueError(f"Speed cannot be negative: {speed_mps}")
    return speed_mps * 3.6

def minutes_to_seconds(minutes: float) -> float:
    """Convert minutes to seconds."""
    if minutes < 0:
        raise ValueError(f"Duration cannot be negative: {minutes}")
    return minutes * 60.0

def seconds_to_minutes(seconds: float) -> float:
    """Convert seconds to minutes."""
    if seconds < 0:
        raise ValueError(f"Duration cannot be negative: {seconds}")
    return seconds / 60.0

def hours_to_seconds(hours: float) -> float:
    """Convert hours to seconds."""
    if hours < 0:
        raise ValueError(f"Duration cannot be negative: {hours}")
    return hours * 3600.0

def seconds_to_hours(seconds: float) -> float:
    """Convert seconds to hours."""
    if seconds < 0:
        raise ValueError(f"Duration cannot be negative: {seconds}")
    return seconds / 3600.0

def feet_to_meters(feet: float) -> float:
    """Convert US Customary feet to SI meters."""
    return feet * 0.3048

def meters_to_feet(meters: float) -> float:
    """Convert SI meters to US Customary feet."""
    return meters / 0.3048

def seconds_to_duration(seconds: float) -> str:
    """
    Format seconds into an unambiguous human-readable string T + HH:MM:SS or MM:SS.
    Example: 2661.0 -> '00:44:21'
    """
    if seconds < 0:
        sign = "-"
        sec = abs(seconds)
    else:
        sign = ""
        sec = seconds

    total_s = int(round(sec))
    hours = total_s // 3600
    remainder = total_s % 3600
    minutes = remainder // 60
    secs = remainder % 60

    if hours > 0:
        return f"{sign}{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{sign}{minutes:02d}:{secs:02d}"

def duration_to_seconds(duration_str: str) -> float:
    """
    Parse an unambiguous duration string (HH:MM:SS or MM:SS) back to seconds.
    Example: '00:44:21' -> 2661.0, '12:39' -> 759.0
    """
    parts = duration_str.strip().split(":")
    if len(parts) == 3:
        h, m, s = map(float, parts)
        return h * 3600.0 + m * 60.0 + s
    elif len(parts) == 2:
        m, s = map(float, parts)
        return m * 60.0 + s
    elif len(parts) == 1:
        return float(parts[0])
    raise ValueError(f"Invalid duration format: '{duration_str}'. Expected 'HH:MM:SS' or 'MM:SS'.")
