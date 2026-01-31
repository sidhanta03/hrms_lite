# Frontend - React + Vite + Tailwind CSS

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

## 📦 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with Vite plugin)
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API integration
│   ├── App.jsx         # Main app
│   └── index.css       # Tailwind import
├── vite.config.js      # Vite config
└── package.json        # Dependencies
```

## 🎨 Styling

All styling done with **Tailwind CSS only**. No custom CSS files.

## 📋 Pages

- **Dashboard** - Overview and statistics
- **Employees** - Employee management
- **Attendance** - Attendance tracking

## ⚙️ Configuration

Backend API URL in `.env`:
```env
VITE_API_URL=http://localhost:8000
```

## 🔧 Build

```bash
npm run build      # Production build
npm run preview    # Preview production build
```
