"""
Test script to verify HRMS Lite API is working correctly
Run this after starting the server: python test_api.py
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def print_response(method, endpoint, status, data):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{method:6} {endpoint}")
    print(f"Status: {status}")
    print(f"Response: {json.dumps(data, indent=2)}")
    print(f"{'='*60}")


def test_api():
    """Test all major API endpoints"""
    
    print("\n" + "="*60)
    print("HRMS LITE API TEST SUITE")
    print("="*60)
    
    # Test 1: Health Check
    print("\n[1/10] Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response("GET", "/health", response.status_code, response.json())
    except Exception as e:
        print(f"ERROR: Cannot connect to server. Make sure it's running at {BASE_URL}")
        print(f"Error: {e}")
        return
    
    # Test 2: Root Endpoint
    print("\n[2/10] Testing Root Endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print_response("GET", "/", response.status_code, response.json())
    
    # Test 3: Create Employee 1
    print("\n[3/10] Creating Employee 1...")
    emp1_data = {
        "employee_id": "EMP001",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "department": "Engineering"
    }
    response = requests.post(f"{BASE_URL}/employees", json=emp1_data)
    print_response("POST", "/employees", response.status_code, response.json())
    emp1_id = response.json().get("id") if response.status_code == 201 else None
    
    # Test 4: Create Employee 2
    print("\n[4/10] Creating Employee 2...")
    emp2_data = {
        "employee_id": "EMP002",
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "department": "HR"
    }
    response = requests.post(f"{BASE_URL}/employees", json=emp2_data)
    print_response("POST", "/employees", response.status_code, response.json())
    
    # Test 5: Get All Employees
    print("\n[5/10] Fetching All Employees...")
    response = requests.get(f"{BASE_URL}/employees")
    print_response("GET", "/employees", response.status_code, response.json())
    
    # Test 6: Get Specific Employee
    print("\n[6/10] Getting Specific Employee...")
    response = requests.get(f"{BASE_URL}/employees/EMP001")
    print_response("GET", "/employees/EMP001", response.status_code, response.json())
    
    # Test 7: Mark Attendance
    print("\n[7/10] Marking Attendance...")
    today = datetime.now().date()
    attendance_data = {
        "employee_id": "EMP001",
        "date": str(today),
        "status": "Present"
    }
    response = requests.post(f"{BASE_URL}/attendance", json=attendance_data)
    print_response("POST", "/attendance", response.status_code, response.json())
    
    # Test 8: Get Employee Attendance
    print("\n[8/10] Getting Employee Attendance...")
    response = requests.get(f"{BASE_URL}/attendance/employee/EMP001")
    print_response("GET", "/attendance/employee/EMP001", response.status_code, response.json())
    
    # Test 9: Get Attendance Summary
    print("\n[9/10] Getting Attendance Summary...")
    response = requests.get(f"{BASE_URL}/attendance/summary/EMP001")
    print_response("GET", "/attendance/summary/EMP001", response.status_code, response.json())
    
    # Test 10: Duplicate Employee (Should fail)
    print("\n[10/10] Testing Duplicate Employee (Should Fail)...")
    response = requests.post(f"{BASE_URL}/employees", json=emp1_data)
    print_response("POST", "/employees (DUPLICATE)", response.status_code, response.json())
    
    print("\n" + "="*60)
    print("API TEST SUITE COMPLETED")
    print("="*60)
    print("\n✓ All tests completed!")
    print("\nNext Steps:")
    print("1. Check the Swagger UI: http://localhost:8000/docs")
    print("2. Create your frontend application")
    print("3. Configure environment variables for production")
    print("\n")


if __name__ == "__main__":
    test_api()
