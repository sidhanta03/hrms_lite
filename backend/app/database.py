import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

# Create MongoDB client with connection pooling and lazy connection
client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=2000,
    connectTimeoutMS=5000,
    serverMonitoringMode="auto",
)

# Get database reference (connection is lazy - will be established on first operation)
database = client[DATABASE_NAME]

# Collections
employees_collection = database["employees"]
attendance_collection = database["attendance"]


def get_database():
    """Get database connection"""
    return database


def get_employees_collection():
    """Get employees collection"""
    return employees_collection


def get_attendance_collection():
    """Get attendance collection"""
    return attendance_collection


# Create indexes for better performance
def create_indexes():
    """Create database indexes"""
    try:
        # Unique index on employee_id
        employees_collection.create_index("employee_id", unique=True)
        # Index on email for faster lookups
        employees_collection.create_index("email")
        # Compound index for attendance lookups
        attendance_collection.create_index([("employee_id", 1), ("date", 1)])
        print("✓ Database indexes created successfully")
    except Exception as e:
        print(f"⚠ Note: {e}")
