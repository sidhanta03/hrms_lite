import { useEffect, useState } from 'react';
import { employeeAPI } from '../services/api';
import { Loading, EmptyState, Button, Card, ErrorMessage } from '../components/Common';
import { Modal, FormInput, FormSelect } from '../components/Modal';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

export function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch employees';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.employee_id.trim()) errors.employee_id = 'Employee ID is required';
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.email.includes('@')) errors.email = 'Email must be valid';
    if (!formData.department.trim()) errors.department = 'Department is required';
    return errors;
  };

  // Handle form submission
  const handleAddEmployee = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await employeeAPI.create(formData);
      toast.success('Employee added successfully!');
      setIsModalOpen(false);
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setFormErrors({});
      fetchEmployees();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to add employee';
      toast.error(errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete employee';
      toast.error(errorMsg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <FiPlus /> Add Employee
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {employees.length === 0 ? (
        <Card>
          <EmptyState
            title="No employees found"
            description="Add your first employee to get started"
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Full Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-800">{emp.employee_id}</td>
                    <td className="py-3 px-4 text-gray-800">{emp.full_name}</td>
                    <td className="py-3 px-4 text-gray-600">{emp.email}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(emp.employee_id)}
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ employee_id: '', full_name: '', email: '', department: '' });
          setFormErrors({});
        }}
        title="Add New Employee"
        onConfirm={handleAddEmployee}
        confirmText="Add Employee"
      >
        <FormInput
          label="Employee ID"
          value={formData.employee_id}
          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          placeholder="e.g., EMP001"
          required
          error={formErrors.employee_id}
        />
        <FormInput
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="John Doe"
          required
          error={formErrors.full_name}
        />
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
          error={formErrors.email}
        />
        <FormInput
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="Engineering"
          required
          error={formErrors.department}
        />
      </Modal>
    </div>
  );
}
