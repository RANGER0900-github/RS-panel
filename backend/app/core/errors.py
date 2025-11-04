"""
Global error handlers producing consistent JSON with request IDs.
"""
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "type": "http_error",
                "detail": exc.detail,
            },
            "request_id": request_id,
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": 422,
                "type": "validation_error",
                "detail": exc.errors(),
            },
            "request_id": request_id,
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "type": "internal_error",
                "detail": "An unexpected error occurred",
            },
            "request_id": request_id,
        },
    )


