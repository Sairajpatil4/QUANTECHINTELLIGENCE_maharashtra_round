from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class APIError(Exception):
	def __init__(self, status_code: int, error: str, message: str) -> None:
		self.status_code = status_code
		self.error = error
		self.message = message


async def api_error_handler(request: Request, exception: APIError) -> JSONResponse:
	return JSONResponse(
		status_code=exception.status_code,
		content={"error": exception.error, "message": exception.message},
	)


async def request_validation_error_handler(
	request: Request,
	exception: RequestValidationError,
) -> JSONResponse:
	return JSONResponse(
		status_code=422,
		content={
			"error": "invalid_request",
			"message": "The request is missing required fields or contains invalid values.",
		},
	)


async def http_error_handler(
	request: Request,
	exception: StarletteHTTPException,
) -> JSONResponse:
	detail = exception.detail
	if isinstance(detail, dict) and {"error", "message"} <= detail.keys():
		error = detail["error"]
		message = detail["message"]
	else:
		error = "invalid_request"
		message = "The requested resource or operation is unavailable."
	return JSONResponse(
		status_code=exception.status_code,
		content={"error": error, "message": message},
	)


async def unexpected_error_handler(request: Request, exception: Exception) -> JSONResponse:
	return JSONResponse(
		status_code=500,
		content={
			"error": "internal_error",
			"message": "The request could not be completed.",
		},
	)