"""
Structured logging utilities and middleware with correlation IDs.
"""
import logging
import sys
import time
import uuid
from typing import Callable
from fastapi import Request


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        base = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "time": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
        }
        # Attach extra fields if present
        for key in ("request_id", "path", "method", "status_code", "duration_ms", "client_ip"):
            if hasattr(record, key):
                base[key] = getattr(record, key)
        return json_dumps(base)


def json_dumps(data: dict) -> str:
    # Lightweight JSON to avoid extra dependency
    import json
    return json.dumps(data, separators=(",", ":"), ensure_ascii=False)


def setup_json_logging() -> None:
    root = logging.getLogger()
    if root.handlers:
        return
    root.setLevel(logging.INFO)
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)


async def request_logging_middleware(request: Request, call_next: Callable):
    """Middleware that injects a correlation ID and logs request/response."""
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id

    logger = logging.getLogger("uvicorn.access")
    start = time.perf_counter()
    try:
        response = await call_next(request)
        status_code = getattr(response, "status_code", 0)
    except Exception:
        # Log exception here; global handlers will format response
        logger.exception(
            "request_error",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "client_ip": request.client.host if request.client else None,
            },
        )
        raise
    finally:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "request_complete",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "status_code": locals().get("status_code", 0),
                "duration_ms": duration_ms,
                "client_ip": request.client.host if request.client else None,
            },
        )

    # Echo request id back
    response.headers["X-Request-ID"] = request_id
    return response


