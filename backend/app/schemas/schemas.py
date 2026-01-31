from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import date


class EmployeeBase(BaseModel):
    """Base schema for Employee"""
    employee_id: str = Field(..., min_length=1, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)

    @field_validator('employee_id')
    def validate_employee_id(cls, v):
        if not v.strip():
            raise ValueError('Employee ID cannot be empty')
        return v.strip()

    @field_validator('full_name')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip()

    @field_validator('department')
    def validate_department(cls, v):
        if not v.strip():
            raise ValueError('Department cannot be empty')
        return v.strip()


class EmployeeCreate(EmployeeBase):
    """Schema for creating an employee"""
    pass


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, min_length=1, max_length=100)


class EmployeeResponse(EmployeeBase):
    """Schema for employee response"""
    id: str = Field(alias="_id")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True


class AttendanceBase(BaseModel):
    """Base schema for Attendance"""
    employee_id: str = Field(..., min_length=1)
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")

    @field_validator('status')
    def validate_status(cls, v):
        if v not in ['Present', 'Absent']:
            raise ValueError('Status must be either Present or Absent')
        return v


class AttendanceCreate(AttendanceBase):
    """Schema for creating attendance record"""
    pass


class AttendanceUpdate(BaseModel):
    """Schema for updating attendance record"""
    status: str = Field(..., pattern="^(Present|Absent)$")

    @field_validator('status')
    def validate_status(cls, v):
        if v not in ['Present', 'Absent']:
            raise ValueError('Status must be either Present or Absent')
        return v


class AttendanceResponse(AttendanceBase):
    """Schema for attendance response"""
    id: str = Field(alias="_id")
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str
    status_code: int


class SuccessResponse(BaseModel):
    """Schema for success responses"""
    message: str
    data: Optional[dict] = None
