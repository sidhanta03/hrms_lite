# HRMS Lite - Human Resource Management System

A full-stack HR management application with FastAPI backend and React frontend.

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
source venv/Scripts/activate  # Windows
python run.py
```
API available at: `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend available at: `http://localhost:5173`

## 📁 Project Structure

```
HRMS_lite/
├── backend/          # FastAPI REST API
├── frontend/         # React + Vite + Tailwind
└── venv/            # Python virtual environment
```

## 🛠️ Tech Stack

**Backend**: FastAPI, MongoDB, Pydantic
**Frontend**: React 19, Vite, Tailwind CSS, Axios

## 📚 Documentation

- [Backend README](./backend/README.md) - API setup and endpoints
- [Frontend README](./frontend/README.md) - Frontend development guide

## ⚙️ Environment Setup

Backend `.env` file required:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hrms_lite
```

See individual README files for detailed configuration.
