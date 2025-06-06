from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, assets, commands ,groups
from auth import get_current_user, custom_openapi  # import from your new auth.py
import logging

app = FastAPI()

origins = ["http://localhost:8080"]

@app.on_event("startup")
def show_routes():
    for route in app.routes:
        logging.info(f"Route: {route.methods} {route.path}")
        
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, tags=["users"])
app.include_router(assets.router, tags=["assets"])
app.include_router(commands.router, tags=["commands"])
app.include_router(groups.router, tags=["groups"])

app.openapi = lambda: custom_openapi(app)



@app.get("/")
def home():
    return {"This is linistrate": "Up and running"}
