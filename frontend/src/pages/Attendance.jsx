import { useEffect, useState } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import { Loading, EmptyState, Button, Card, Badge, ErrorMessage } from '../components/Common';
import { Modal, FormInput, FormSelect } from '../components/Modal';
import { FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    status: 'Present',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch employees and attendance
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch summary when employee changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchSummary(selectedEmployeeId);
      fetchAttendanceForEmployee(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const empResponse = await employeeAPI.getAll();
      setEmployees(empResponse.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForEmployee = async (empId) => {
    try {
      const response = await attendanceAPI.getByEmployee(empId);
      setAttendance(response.data);
    } catch (err) {
      setAttendance([]);
    }
  };

  const fetchSummary = async (empId) => {
    try {
      const response = await attendanceAPI.getSummary(empId);
      setSummary(response.data);
    } catch (err) {
      setSummary(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.employee_id) errors.employee_id = 'Employee is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.status) errors.status = 'Status is required';
    return errors;
  };

  // Handle mark attendance
  const handleMarkAttendance = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await attendanceAPI.mark(formData);
      toast.success('Attendance marked successfully!');
      setIsModalOpen(false);
      setFormData({ employee_id: '', date: '', status: 'Present' });
      setFormErrors({});
      if (selectedEmployeeId) {
        fetchAttendanceForEmployee(selectedEmployeeId);
        fetchSummary(selectedEmployeeId);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to mark attendance';
      toast.error(errorMsg);
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await attendanceAPI.delete(recordId);
      toast.success('Record deleted successfully!');
      if (selectedEmployeeId) {
        fetchAttendanceForEmployee(selectedEmployeeId);
        fetchSummary(selectedEmployeeId);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete record';
      toast.error(errorMsg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track employee attendance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <FiPlus /> Mark Attendance
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Employee Selection and Summary */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose an employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {summary && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.total_records}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{summary.present_days}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{summary.absent_days}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.attendance_percentage}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Attendance Records */}
      {selectedEmployeeId ? (
        attendance.length === 0 ? (
          <Card>
            <EmptyState
              title="No attendance records found"
              description="Mark attendance to see records here"
            />
          </Card>
        ) : (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-800">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          status={record.status}
                          variant={record.status === 'Present' ? 'present' : 'absent'}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteAttendance(record._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <Card>
          <EmptyState
            title="Select an employee"
            description="Choose an employee to view their attendance records"
          />
        </Card>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ employee_id: '', date: '', status: 'Present' });
          setFormErrors({});
        }}
        title="Mark Attendance"
        onConfirm={handleMarkAttendance}
        confirmText="Mark Attendance"
      >
        <FormSelect
          label="Employee"
          value={formData.employee_id}
          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          options={employees.map((emp) => ({
            value: emp.employee_id,
            label: `${emp.full_name} (${emp.employee_id})`,
          }))}
          required
          error={formErrors.employee_id}
        />
        <FormInput
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          error={formErrors.date}
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'Present', label: 'Present' },
            { value: 'Absent', label: 'Absent' },
          ]}
          required
          error={formErrors.status}
        />
      </Modal>
    </div>
  );
}
