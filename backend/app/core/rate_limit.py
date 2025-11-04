"""
Lightweight in-memory IP-based rate limiting utilities.
Note: Suitable for single-process dev; for production, use Redis.
"""
import time
from typing import Dict, Tuple


_ip_failures: Dict[str, Tuple[int, float]] = {}


def should_throttle(ip: str, max_attempts: int = 5, window_seconds: int = 60) -> bool:
    now = time.time()
    attempts, reset = _ip_failures.get(ip, (0, now + window_seconds))
    # Reset window if expired
    if now > reset:
        attempts = 0
        reset = now + window_seconds
    return attempts >= max_attempts


def record_failure(ip: str, window_seconds: int = 60) -> None:
    now = time.time()
    attempts, reset = _ip_failures.get(ip, (0, now + window_seconds))
    if now > reset:
        attempts = 0
        reset = now + window_seconds
    _ip_failures[ip] = (attempts + 1, reset)


def reset_counter(ip: str) -> None:
    _ip_failures.pop(ip, None)


