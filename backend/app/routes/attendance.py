from fastapi import APIRouter, HTTPException, status
from bson.objectid import ObjectId
from datetime import datetime, date
from app.database import get_attendance_collection, get_employees_collection
from app.schemas.schemas import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
    ErrorResponse,
)

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    responses={
        404: {"model": ErrorResponse, "description": "Record not found"},
        400: {"model": ErrorResponse, "description": "Bad request"},
    },
)


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee"""
    employees = get_employees_collection()
    attendance_coll = get_attendance_collection()
    
    # Check if employee exists
    employee = employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found",
        )
    
    # Check if attendance for this date already exists
    existing = attendance_coll.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date} already marked",
        )
    
    attendance_data = attendance.model_dump()
    attendance_data["date"] = attendance.date.isoformat()
    attendance_data["created_at"] = datetime.utcnow().isoformat()
    
    result = attendance_coll.insert_one(attendance_data)
    
    created_attendance = attendance_coll.find_one({"_id": result.inserted_id})
    return {
        "_id": str(created_attendance["_id"]),
        **{k: v for k, v in created_attendance.items() if k != "_id"},
    }


@router.get("", response_model=list[AttendanceResponse])
async def get_all_attendance(
    employee_id: str = None, 
    skip: int = 0, 
    limit: int = 100
):
    """Get attendance records with optional employee filter"""
    attendance_coll = get_attendance_collection()
    
    # Validate pagination parameters
    if skip < 0:
        skip = 0
    if limit < 1:
        limit = 100
    if limit > 1000:
        limit = 1000
    
    # Build filter
    filter_query = {}
    if employee_id:
        employees = get_employees_collection()
        employee = employees.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID '{employee_id}' not found",
            )
        filter_query["employee_id"] = employee_id
    
    records = list(
        attendance_coll.find(filter_query)
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
    )
    
    return [
        {
            "_id": str(record["_id"]),
            **{k: v for k, v in record.items() if k != "_id"},
        }
        for record in records
    ]


@router.get("/employee/{employee_id}", response_model=list[AttendanceResponse])
async def get_employee_attendance(
    employee_id: str,
    skip: int = 0,
    limit: int = 100,
    start_date: str = None,
    end_date: str = None,
):
    """Get attendance records for a specific employee with optional date filter"""
    employees = get_employees_collection()
    attendance_coll = get_attendance_collection()
    
    # Check if employee exists
    employee = employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    # Validate pagination parameters
    if skip < 0:
        skip = 0
    if limit < 1:
        limit = 100
    if limit > 1000:
        limit = 1000
    
    # Build filter
    filter_query = {"employee_id": employee_id}
    
    if start_date or end_date:
        date_filter = {}
        if start_date:
            try:
                date_filter["$gte"] = start_date
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Use YYYY-MM-DD",
                )
        if end_date:
            try:
                date_filter["$lte"] = end_date
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Use YYYY-MM-DD",
                )
        if date_filter:
            filter_query["date"] = date_filter
    
    records = list(
        attendance_coll.find(filter_query)
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
    )
    
    return [
        {
            "_id": str(record["_id"]),
            **{k: v for k, v in record.items() if k != "_id"},
        }
        for record in records
    ]


@router.get("/record/{record_id}", response_model=AttendanceResponse)
async def get_attendance_record(record_id: str):
    """Get a specific attendance record"""
    attendance_coll = get_attendance_collection()
    
    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record ID format",
        )
    
    record = attendance_coll.find_one({"_id": ObjectId(record_id)})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    
    return {
        "_id": str(record["_id"]),
        **{k: v for k, v in record.items() if k != "_id"},
    }


@router.put("/record/{record_id}", response_model=AttendanceResponse)
async def update_attendance(record_id: str, attendance_update: AttendanceUpdate):
    """Update an attendance record"""
    attendance_coll = get_attendance_collection()
    
    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record ID format",
        )
    
    # Check if record exists
    record = attendance_coll.find_one({"_id": ObjectId(record_id)})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    
    update_data = attendance_update.model_dump()
    
    result = attendance_coll.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    
    updated_record = attendance_coll.find_one({"_id": ObjectId(record_id)})
    return {
        "_id": str(updated_record["_id"]),
        **{k: v for k, v in updated_record.items() if k != "_id"},
    }


@router.delete("/record/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(record_id: str):
    """Delete an attendance record"""
    attendance_coll = get_attendance_collection()
    
    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record ID format",
        )
    
    result = attendance_coll.delete_one({"_id": ObjectId(record_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    
    return None


@router.get("/summary/{employee_id}")
async def get_attendance_summary(employee_id: str):
    """Get attendance summary for an employee"""
    employees = get_employees_collection()
    attendance_coll = get_attendance_collection()
    
    # Check if employee exists
    employee = employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    
    # Get all attendance records
    records = list(attendance_coll.find({"employee_id": employee_id}))
    
    # Calculate summary
    total_records = len(records)
    present_count = len([r for r in records if r["status"] == "Present"])
    absent_count = len([r for r in records if r["status"] == "Absent"])
    
    return {
        "employee_id": employee_id,
        "total_records": total_records,
        "present_days": present_count,
        "absent_days": absent_count,
        "attendance_percentage": round((present_count / total_records * 100), 2) if total_records > 0 else 0,
    }
