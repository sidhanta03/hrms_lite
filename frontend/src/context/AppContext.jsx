import { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <AppContext.Provider
      value={{
        employees,
        setEmployees,
        attendance,
        setAttendance,
        loading,
        setLoading,
        error,
        setError,
        selectedEmployee,
        setSelectedEmployee,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
