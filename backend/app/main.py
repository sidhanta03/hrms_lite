from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from app.routes import employees, attendance

# Create FastAPI app
app = FastAPI(
    title=os.getenv("API_TITLE", "HRMS Lite API"),
    description="A lightweight Human Resource Management System API",
    version=os.getenv("API_VERSION", "1.0.0"),
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "*",  # Allow all origins for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def read_root():
    """Root endpoint - API is running"""
    return {
        "message": "Welcome to HRMS Lite API",
        "version": os.getenv("API_VERSION", "1.0.0"),
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HRMS Lite API",
    }


# Include routes
app.include_router(employees.router)
app.include_router(attendance.router)


@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions"""
    return {
        "detail": str(exc),
        "status_code": 400,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
