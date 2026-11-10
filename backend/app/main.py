from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .database import connect_to_mongo, close_mongo_connection
from .routers import auth, notes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    description="A private notes API built for learning full-stack development.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unexpected_error_handler(request, exc):
    # Keep internal exception details out of the public API response.
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
