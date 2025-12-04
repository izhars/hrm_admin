import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import Login from './screen/Login';
import Dashboard from './screen/Dashboard';
import CreateHR from './screen/AdminCreateHR';
import CreateEmployee from './screen/HRCreateEmployee';
import DepartmentManager from './screen/DepartmentManager';
import DepartmentDetails from './screen/DepartmentDetails';
import AllEmployee from './screen/AllEmployees';
import ProtectedRoute from './component/ProtectedRoute';
import HolidayScreen from './screen/HolidayScreen';
import AdminLeavesScreen from './screen/AdminLeavesScreen';
import BadgeManagement from './screen/BadgeManagement'
import AttendancePage from './screen/AttendancePage';
import AllDayAttendance from './screen/AlldayAttendance'
import Announcements from './screen/Announcements'
import EmployeeAttendanceDetail from './screen/EmployeeAttendanceDetail'
import ChatPage from './screen/ChatPage';
import HRFeedbackSummary from "./screen/HRFeedbackSummary";
import PollsScreen from "./screen/PollsScreen";
import PollDetailPage from './screen/PollDetails';
import AwardScreen from './screen/AwardScreen';
import NotificationsPage from './screen/NotificationsPage';
import ComboOffReviewScreen from './screen/ComboOffReviewScreen';
import FaqPage from './screen/FaqPage';
import HelpPage from './screen/HelpPage';
import ForgotPassword from "./screen/ForgotPassword";
import Celebration from './screen/Celebration'; // import your celebration screen
import AboutScreen from './screen/AboutScreen'; // import your celebration screen

const AdminRoutes = () => {
  return (
    <Router>
      <ThemeProvider> {/* Wrap everything with ThemeProvider */}
        <AdminProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes - Dashboard accessible to all authenticated users */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Only superadmin and admin can create HR */}
            <Route
              path="/admin/create-hr"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <CreateHR />
                </ProtectedRoute>
              }
            />

            {/* Superadmin, admin, and hr can create employees */}
            <Route
              path="/admin/create-employee"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <CreateEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/celebrations"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <Celebration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            {/* Superadmin, admin, and hr can view all employees */}
            <Route
              path="/admin/all-employee"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <AllEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat/:employeeId"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback-summary"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <HRFeedbackSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/polls"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <PollsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/poll-results/:pollId"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <PollDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Superadmin, admin, and hr can manage departments */}
            <Route
              path="/admin/department"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <DepartmentManager />
                </ProtectedRoute>
              }
            />

            {/* Department details - fixed route parameter syntax */}
            <Route
              path="/admin/department/:id"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <DepartmentDetails />
                </ProtectedRoute>
              }
            />

            {/* Holiday management - accessible to superadmin, admin, and hr */}
            <Route
              path="/admin/holiday"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <HolidayScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaves"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <AdminLeavesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/combooff"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <ComboOffReviewScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/badges"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <BadgeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendence-today"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendence-all"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <AllDayAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-attendance/:employeeId"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <EmployeeAttendanceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/awards"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <AwardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faqs"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <FaqPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/helps"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'hr']}>
                  <HelpPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div>
                    <h2>404 - Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/about"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <AboutScreen /> {/* Make sure you have an AboutPage component */}
                </ProtectedRoute>
              }
            />
          </Routes>
        </AdminProvider>
      </ThemeProvider> {/* Close ThemeProvider */}
    </Router>
  );
};

export default AdminRoutes;