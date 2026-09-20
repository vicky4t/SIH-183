from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.case import Case
from app.api.cases import router as cases_router
from app.api.analysis import router as analysis_router
from app.api import reports

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SIH26183 Crypto Fraud Attribution API",
    description="Real-Time Cryptocurrency Fraud Investigation System",
    version="1.0.0"
)


# ==============================
# CORS - Frontend Access
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# Routers
# ==============================

app.include_router(cases_router)
app.include_router(analysis_router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "project": "SIH26183",
        "system": "Crypto Fraud Attribution System",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
