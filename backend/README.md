# Backend API - FastAPI + MongoDB

## 🚀 Quick Start

```bash
python run.py
```

API Documentation: `http://localhost:8000/docs`

## 📦 Tech Stack

- **Framework**: FastAPI 0.128.0
- **Server**: Uvicorn
- **Database**: MongoDB with PyMongo
- **Validation**: Pydantic

## 📋 API Endpoints

### Employees
- `POST /employees` - Create employee
- `GET /employees` - List all employees
- `GET /employees/{id}` - Get employee
- `DELETE /employees/{id}` - Delete employee

### Attendance
- `POST /attendance` - Mark attendance
- `GET /attendance` - List all records
- `GET /attendance/employee/{employee_id}` - Get employee attendance
- `GET /attendance/summary/{employee_id}` - Get attendance summary
- `DELETE /attendance/record/{record_id}` - Delete record

## ⚙️ Environment Setup

Create `.env` file:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hrms_lite
API_TITLE=HRMS Lite API
API_VERSION=1.0.0
```

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── database.py       # MongoDB config
│   ├── routes/           # API endpoints
│   └── schemas/          # Pydantic models
├── .env                  # Environment variables
└── run.py               # Entry point
```

## 🔧 Dependencies

See `requirements.txt` for full list. Install with:
```bash
pip install -r requirements.txt
```
