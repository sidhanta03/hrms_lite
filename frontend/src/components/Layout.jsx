import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiCalendar } from 'react-icons/fi';

export function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'employees', label: 'Employees', icon: FiUsers },
    { id: 'attendance', label: 'Attendance', icon: FiCalendar },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`bg-blue-900 text-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center justify-between gap-3">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">HRMS</h1>
                <p className="text-xs text-blue-200">Lite v1.0</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-blue-800 p-2 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
