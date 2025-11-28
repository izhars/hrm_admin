// src/api/index.js - Main API index file
import AuthApi from './AuthApi';
import EmployeesApi from './EmployeesApi';
import DashboardApi from './DashboardApi';
import DepartmentsApi from './DepartmentsApi';
import AttendanceApi from './AttendanceApi';
import LeavesApi from './LeavesApi';

export {
  AuthApi,
  EmployeesApi,
  DashboardApi,
  DepartmentsApi,
  AttendanceApi,
  LeavesApi
};

// Default export for backward compatibility
export default {
  AuthApi,
  EmployeesApi,
  DashboardApi,
  DepartmentsApi,
  AttendanceApi,
  LeavesApi
};