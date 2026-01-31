import { useEffect, useState } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import { Card, Loading } from '../components/Common';
import { FiUsers, FiCalendar, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    avgAttendance: 0,
    presentToday: 0,
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const empResponse = await employeeAPI.getAll();
      const attResponse = await attendanceAPI.getAll(0, 1000);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecords = attResponse.data.filter(a => a.date === today);
      const presentToday = todayRecords.filter(a => a.status === 'Present').length;

      const totalAttendance = attResponse.data.length;
      const presentCount = attResponse.data.filter((a) => a.status === 'Present').length;
      const avgAttendance =
        totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      setStats({
        totalEmployees: empResponse.data.length,
        totalAttendance: totalAttendance,
        avgAttendance: avgAttendance,
        presentToday: presentToday,
        recentAttendance: attResponse.data.slice(0, 8),
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <Icon size={32} className={`${color} opacity-20`} />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your HR system overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          label="Total Employees"
          value={stats.totalEmployees}
          color="text-blue-600"
        />
        <StatCard
          icon={FiCalendar}
          label="Attendance Records"
          value={stats.totalAttendance}
          color="text-green-600"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Present Today"
          value={stats.presentToday}
          color="text-purple-600"
        />
        <StatCard
          icon={FiBarChart2}
          label="Avg. Attendance %"
          value={`${stats.avgAttendance}%`}
          color="text-orange-600"
        />
      </div>

      {/* Recent Records */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance Records</h2>
        {stats.recentAttendance.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No attendance records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAttendance.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{record.employee_id}</td>
                    <td className="py-3 px-4 text-gray-600">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
