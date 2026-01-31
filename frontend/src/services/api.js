import axios from 'axios';

// API base URL - change this when deploying to production
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const employeeAPI = {
  // Get all employees
  getAll: (skip = 0, limit = 100) => 
    api.get(`/employees?skip=${skip}&limit=${limit}`),
  
  // Get single employee
  getById: (id) => 
    api.get(`/employees/${id}`),
  
  // Create employee
  create: (data) => 
    api.post('/employees', data),
  
  // Update employee
  update: (id, data) => 
    api.put(`/employees/${id}`, data),
  
  // Delete employee
  delete: (id) => 
    api.delete(`/employees/${id}`),
};

// Attendance APIs
export const attendanceAPI = {
  // Mark attendance
  mark: (data) => 
    api.post('/attendance', data),
  
  // Get all attendance records
  getAll: (skip = 0, limit = 100) => 
    api.get(`/attendance?skip=${skip}&limit=${limit}`),
  
  // Get attendance for specific employee
  getByEmployee: (employeeId, skip = 0, limit = 100, startDate, endDate) => {
    let url = `/attendance/employee/${employeeId}?skip=${skip}&limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return api.get(url);
  },
  
  // Get attendance summary for employee
  getSummary: (employeeId) => 
    api.get(`/attendance/summary/${employeeId}`),
  
  // Update attendance record
  update: (recordId, data) => 
    api.put(`/attendance/record/${recordId}`, data),
  
  // Delete attendance record
  delete: (recordId) => 
    api.delete(`/attendance/record/${recordId}`),
  
  // Get specific record
  getRecord: (recordId) => 
    api.get(`/attendance/record/${recordId}`),
};

export default api;
