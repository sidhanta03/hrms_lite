from fastapi import APIRouter, HTTPException, status
from bson.objectid import ObjectId
from datetime import datetime
from app.database import get_employees_collection, get_attendance_collection
from app.schemas.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    ErrorResponse,
)

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    responses={
        404: {"model": ErrorResponse, "description": "Employee not found"},
        400: {"model": ErrorResponse, "description": "Bad request"},
    },
)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Create a new employee"""
    employees = get_employees_collection()
    
    # Check if employee_id already exists
    existing = employees.find_one({"employee_id": employee.employee_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with ID '{employee.employee_id}' already exists",
        )
    
    # Check if email already exists
    existing_email = employees.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with email '{employee.email}' already exists",
        )
    
    employee_data = employee.model_dump()
    employee_data["created_at"] = datetime.utcnow().isoformat()
    employee_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = employees.insert_one(employee_data)
    
    created_employee = employees.find_one({"_id": result.inserted_id})
    return {
        "_id": str(created_employee["_id"]),
        **{k: v for k, v in created_employee.items() if k != "_id"},
    }


@router.get("", response_model=list[EmployeeResponse])
async def get_all_employees(skip: int = 0, limit: int = 100):
    """Get all employees with pagination"""
    employees = get_employees_collection()
    
    # Validate pagination parameters
    if skip < 0:
        skip = 0
    if limit < 1:
        limit = 100
    if limit > 1000:
        limit = 1000
    
    employee_list = list(
        employees.find().skip(skip).limit(limit)
    )
    
    return [
        {
            "_id": str(emp["_id"]),
            **{k: v for k, v in emp.items() if k != "_id"},
        }
        for emp in employee_list
    ]


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a specific employee by ID"""
    employees = get_employees_collection()
    
    # Try to find by MongoDB _id first
    try:
        if ObjectId.is_valid(employee_id):
            employee = employees.find_one({"_id": ObjectId(employee_id)})
            if employee:
                return {
                    "_id": str(employee["_id"]),
                    **{k: v for k, v in employee.items() if k != "_id"},
                }
    except:
        pass
    
    # Try to find by employee_id field
    employee = employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    return {
        "_id": str(employee["_id"]),
        **{k: v for k, v in employee.items() if k != "_id"},
    }


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(employee_id: str, employee_update: EmployeeUpdate):
    """Update an employee"""
    employees = get_employees_collection()
    
    # Find the employee
    employee = employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    # Prepare update data
    update_data = employee_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    
    # Check if email is being updated and if it's already taken
    if "email" in update_data:
        existing_email = employees.find_one(
            {"email": update_data["email"], "employee_id": {"$ne": employee_id}}
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{update_data['email']}' is already in use",
            )
    
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = employees.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    updated_employee = employees.find_one({"employee_id": employee_id})
    return {
        "_id": str(updated_employee["_id"]),
        **{k: v for k, v in updated_employee.items() if k != "_id"},
    }


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    """Delete an employee"""
    employees = get_employees_collection()
    attendance = get_attendance_collection()
    
    # Find and delete the employee
    result = employees.delete_one({"employee_id": employee_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    # Also delete all attendance records for this employee
    attendance.delete_many({"employee_id": employee_id})
    
    return None
