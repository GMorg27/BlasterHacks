from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import assignments, users

app = FastAPI(
    title="BlasterHacks",
    summary="Using FastAPI to add a REST API to a MongoDB collection.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(assignments.router)
