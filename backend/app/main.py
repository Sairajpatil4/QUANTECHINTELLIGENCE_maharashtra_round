from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import initialize_database
from app.errors import (
    APIError,
    api_error_handler,
    http_error_handler,
    request_validation_error_handler,
    unexpected_error_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.routes.analysis import router as analysis_router
from app.routes.evidence import router as evidence_router
from app.routes.investigations import router as investigations_router
from app.services.fusion_adapter import TrustLayerFusionAdapter
from app.services.integrations import register_fusion


register_fusion(TrustLayerFusionAdapter())


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="TrustLayer API",
    description="Backend API for the TrustLayer evidence investigation system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigations_router, prefix="/api")
app.include_router(evidence_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")

app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)
app.add_exception_handler(StarletteHTTPException, http_error_handler)
app.add_exception_handler(Exception, unexpected_error_handler)


@app.get("/")
def root():
    return {
        "message": "TrustLayer API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }