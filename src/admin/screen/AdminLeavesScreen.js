import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InputAdornment,
  Alert,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Search,
  GetApp,
  Refresh,
  Info,
  MoreVert,
  Block,
  Event,
  Person,
  AccessTime,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import LeavesApi from "../api/LeavesApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { AdminContext } from "../context/AdminContext";
import { useTheme } from '../context/ThemeContext'; // Import theme context

// Updated TAB_CONFIG with cancelled status
const TAB_CONFIG = [
  { label: "Pending", status: "pending", color: "warning" },
  { label: "Approved", status: "approved", color: "success" },
  { label: "Rejected", status: "rejected", color: "error" },
  { label: "Cancelled", status: "cancelled", color: "default" },
];

// Enhanced leave type colors including 'earned'
const LEAVE_TYPE_COLORS = {
  sick: "#ff9800",
  vacation: "#4caf50",
  personal: "#2196f3",
  emergency: "#f44336",
  maternity: "#9c27b0",
  paternity: "#795548",
  earned: "#00bcd4", // Added earned leave type
  casual: "#ffc107",
};

export default function AdminLeavesScreen({ token }) {

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Get theme from context instead of local state
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  // LeaveScreen specific states
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeaveForMenu, setSelectedLeaveForMenu] = useState(null);

  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";
  const currentTabConfig = useMemo(() => TAB_CONFIG[tab], [tab]);

  // Utility function to format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Utility function to calculate working days between dates
  const calculateWorkingDays = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    return daysDiff;
  }, []);

  const filteredLeaves = useMemo(() => {
    if (!Array.isArray(allLeaves)) return [];

    let filtered = [...allLeaves];
    filtered = filtered.filter((leave) => leave && leave.status === currentTabConfig.status);

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((leave) => {
        if (!leave) return false;
        const employeeName = `${leave.employee?.firstName || ""} ${leave.employee?.lastName || ""}`.toLowerCase();
        const employeeEmail = leave.employee?.email?.toLowerCase() || "";
        const leaveType = leave.leaveType?.toLowerCase() || "";
        const reason = leave.reason?.toLowerCase() || "";
        return (
          employeeName.includes(searchLower) ||
          employeeEmail.includes(searchLower) ||
          leaveType.includes(searchLower) ||
          reason.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [allLeaves, currentTabConfig.status, searchTerm]);

  // Updated stats calculation
  const getStatsForTabs = useMemo(() => {
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    if (Array.isArray(allLeaves)) {
      allLeaves.forEach((leave) => {
        if (leave && leave.status && stats.hasOwnProperty(leave.status)) {
          stats[leave.status]++;
        }
      });
    }

    return stats;
  }, [allLeaves]);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchTerm("");

      const response = await LeavesApi.getAllLeaves();
      let leavesData = [];
      if (response && response.success && Array.isArray(response.leaves)) {
        leavesData = response.leaves;
      } else {
        leavesData = [];
      }

      setAllLeaves(leavesData);
      toast.success(`Loaded ${leavesData.length} leave request(s)`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch leaves";
      setError(errorMessage);
      setAllLeaves([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue);
    setSearchTerm("");
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleApprove = useCallback(
    async (id) => {
      try {
        await LeavesApi.approveLeave(id);
        toast.success("Leave approved successfully ✅");
        fetchLeaves();
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Approval failed";
        toast.error(`${errorMessage} ❌`);
      }
    },
    [fetchLeaves]
  );

  const handleRejectDialog = useCallback((leave) => {
    setSelectedLeave(leave);
    setRejectDialogOpen(true);
  }, []);

  const handleRejectSubmit = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await LeavesApi.rejectLeave(selectedLeave._id, rejectionReason);
      toast.success("Leave rejected ❌");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Rejection failed";
      toast.error(`${errorMessage} ❌`);
    }
  }, [selectedLeave, rejectionReason, fetchLeaves]);

  const handleCancelDialog = useCallback((leave) => {
    setSelectedLeave(leave);
    setCancelDialogOpen(true);
  }, []);

  const handleCancelSubmit = useCallback(async () => {
    try {
      await LeavesApi.cancelLeave(selectedLeave._id, cancellationReason);
      toast.success("Leave cancelled successfully ⚠️");
      setCancelDialogOpen(false);
      setCancellationReason("");
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Cancellation failed";
      toast.error(`${errorMessage} ❌`);
    }
  }, [selectedLeave, cancellationReason, fetchLeaves]);

  const handleMenuOpen = useCallback((event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeaveForMenu(leave);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedLeaveForMenu(null);
  }, []);

  const handleViewDetails = useCallback(
    (leave) => {
      setSelectedLeave(leave);
      setDetailDialogOpen(true);
      handleMenuClose();
    },
    [handleMenuClose]
  );

  const exportLeaves = useCallback(() => {
    if (!Array.isArray(filteredLeaves) || filteredLeaves.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const csvContent = [
        [
          "Employee Name",
          "Email",
          "Employee ID",
          "Leave Type",
          "Duration",
          "Start Date",
          "End Date",
          "Total Days",
          "Reason",
          "Status",
          "Applied On",
        ].join(","),
        ...filteredLeaves.map((leave) =>
          [
            `"${leave.employee?.fullName || `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`}"`,
            `"${leave.employee?.email || ''}"`,
            `"${leave.employee?.employeeId || ''}"`,
            `"${leave.leaveType || ''}"`,
            `"${leave.leaveDuration || 'full'}"`,
            `"${formatDate(leave.startDate)}"`,
            `"${formatDate(leave.endDate)}"`,
            leave.totalDays || 0,
            `"${leave.reason || ''}"`,
            `"${leave.status || ''}"`,
            `"${formatDate(leave.appliedOn)}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leaves_${currentTabConfig.status}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export completed successfully");
    } catch (err) {
      toast.error("Export failed");
    }
  }, [filteredLeaves, currentTabConfig.status, formatDate]);

  // Helper functions for status
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "error";
      case "cancelled": return "default";
      default: return "warning";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle />;
      case "rejected": return <Cancel />;
      case "cancelled": return <Block />;
      default: return <HourglassEmpty />;
    }
  };

  // Loading/Unauthorized state
  if (!admin) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        <div>You are not authorized to access this page.</div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
    }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode} // Pass from context
      />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: sidebarWidth,
        backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode} // Pass from context
          // Remove onThemeToggle prop since Navbar now uses context directly
          admin={admin}
        />

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '30px',
            paddingTop: '94px',
            transition: 'all 0.3s ease'
          }}
        >

          {/* Header Section */}
          <div style={{ marginBottom: "32px" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              style={{ color: themeColors.textPrimary }}
            >
              🌿 Leave Management
            </Typography>
            <Typography
              variant="body2"
              style={{ color: themeColors.textSecondary, marginTop: "8px" }}
            >
              Welcome back, {admin.fullName || admin.firstName || admin.email}
            </Typography>
          </div>

          {/* Stats Cards */}
          <Grid container spacing={2} mb={3}>
            {TAB_CONFIG.map((config) => (
              <Grid item xs={12} sm={3} key={config.status}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor:
                      config.status === "pending"
                        ? "#fff3e0"
                        : config.status === "approved"
                          ? "#e8f5e8"
                          : config.status === "rejected"
                            ? "#ffebee"
                            : "#f5f5f5",
                    border: `1px solid ${themeColors.border}`,
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setTab(TAB_CONFIG.findIndex(t => t.status === config.status))}
                >
                  <Typography variant="h4" color={config.color} fontWeight="bold">
                    {getStatsForTabs[config.status] || 0}
                  </Typography>
                  <Typography variant="body2" color={themeColors.textSecondary}>
                    {config.label} Leaves
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Search and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
              variant="outlined"
              placeholder="Search by employee, email, type, or reason..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ flex: 1, maxWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" gap={2}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchLeaves} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export current view">
                <IconButton
                  onClick={exportLeaves}
                  disabled={loading || !Array.isArray(filteredLeaves) || filteredLeaves.length === 0}
                >
                  <GetApp />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: themeColors.textPrimary,
              },
            }}
          >
            {TAB_CONFIG.map((config, index) => (
              <Tab
                key={config.status}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {config.label}
                    <Chip
                      label={getStatsForTabs[config.status] || 0}
                      size="small"
                      color={config.color}
                      variant="outlined"
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          {/* Enhanced Table */}
          <TableContainer
            component={Card}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              mb: 2,
              backgroundColor: themeColors.cardBg,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: themeColors.border }}>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                      Employee
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      Leave Type
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      <AccessTime sx={{ mr: 1, verticalAlign: "middle" }} />
                      Duration
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      <Event sx={{ mr: 1, verticalAlign: "middle" }} />
                      Dates
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      Reason
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 150 }}>
                    <Typography fontWeight={700} style={{ color: themeColors.textPrimary }}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" mt={2} style={{ color: themeColors.textPrimary }}>
                        Loading leave requests...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredLeaves) || filteredLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box textAlign="center">
                        <Typography color={themeColors.textSecondary} variant="h6">
                          {searchTerm
                            ? "No matching leaves found"
                            : `No ${currentTabConfig.label} Leaves`}
                        </Typography>
                        {searchTerm && (
                          <Typography color={themeColors.textSecondary} variant="body2" mt={1}>
                            Try adjusting your search terms
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaves.map((leave) => {
                    if (!leave || !leave._id) {
                      console.warn("Invalid leave item:", leave);
                      return null;
                    }
                    return (
                      <TableRow key={leave._id} hover sx={{ "&:hover": { backgroundColor: themeColors.border + "20" } }}>
                        {/* Employee Column */}
                        <TableCell>
                          <Box>
                            <Typography fontWeight={600} style={{ color: themeColors.textPrimary }}>
                              {leave.employee?.fullName ||
                                `${leave.employee?.firstName || "N/A"} ${leave.employee?.lastName || ""}`.trim()}
                            </Typography>
                            <Typography variant="body2" style={{ color: themeColors.textSecondary }}>
                              {leave.employee?.email || "No email provided"}
                            </Typography>
                            {leave.employee?.employeeId && (
                              <Typography variant="caption" style={{ color: themeColors.textSecondary }}>
                                ID: {leave.employee.employeeId}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Leave Type Column */}
                        <TableCell>
                          <Chip
                            label={leave.leaveType?.toUpperCase() || "UNKNOWN"}
                            size="small"
                            sx={{
                              backgroundColor: LEAVE_TYPE_COLORS[leave.leaveType?.toLowerCase()] || "#9e9e9e",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>

                        {/* Duration Column */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600} style={{ color: themeColors.textPrimary }}>
                              {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
                            </Typography>
                            <Chip
                              label={leave.leaveDuration?.toUpperCase() || "FULL"}
                              size="small"
                              color={leave.leaveDuration === "half" ? "warning" : "primary"}
                              variant="outlined"
                              sx={{ mt: 0.5, fontSize: "0.7rem" }}
                            />
                            {leave.leaveDuration === "half" && leave.halfDayType && (
                              <Typography variant="caption" display="block" style={{ color: themeColors.textSecondary }}>
                                {leave.halfDayType.replace("_", " ").toUpperCase()}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Dates Column */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600} style={{ color: themeColors.textPrimary }}>
                              {formatDate(leave.startDate)}
                            </Typography>
                            {leave.startDate !== leave.endDate && (
                              <Typography variant="body2" style={{ color: themeColors.textPrimary }}>
                                to {formatDate(leave.endDate)}
                              </Typography>
                            )}
                            <Typography variant="caption" display="block" style={{ color: themeColors.textSecondary }}>
                              Applied: {formatDate(leave.appliedOn)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Reason Column */}
                        <TableCell>
                          <Tooltip title={leave.reason || "No reason provided"}>
                            <Typography
                              variant="body2"
                              style={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: themeColors.textPrimary,
                              }}
                            >
                              {leave.reason || "No reason provided"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* Status Column */}
                        <TableCell>
                          <Chip
                            label={leave.status?.toUpperCase() || "UNKNOWN"}
                            color={getStatusColor(leave.status)}
                            icon={getStatusIcon(leave.status)}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            {leave.status === "pending" && (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={() => handleApprove(leave._id)}
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    minWidth: 80,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={() => handleRejectDialog(leave)}
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    minWidth: 70,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, leave)}>
                              <MoreVert />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => handleViewDetails(selectedLeaveForMenu)}>
              <Info sx={{ mr: 1 }} />
              View Details
            </MenuItem>
          </Menu>

          {/* Reject Dialog */}
          <Dialog
            open={rejectDialogOpen}
            onClose={() => setRejectDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" component="div" style={{ color: themeColors.textPrimary }}>
                Reject Leave Request
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" style={{ color: themeColors.textSecondary, marginBottom: "16px" }}>
                Please provide a clear reason for rejecting this leave request. This will be communicated to the employee.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Reason *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                error={!rejectionReason.trim() && rejectionReason !== ""}
                helperText={
                  !rejectionReason.trim() && rejectionReason !== ""
                    ? "Rejection reason is required"
                    : ""
                }
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                }}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                Reject Leave
              </Button>
            </DialogActions>
          </Dialog>

          {/* Cancel Dialog */}
          <Dialog
            open={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" component="div" style={{ color: themeColors.textPrimary }}>
                Cancel Leave Request
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" style={{ color: themeColors.textSecondary, marginBottom: "16px" }}>
                Are you sure you want to cancel this leave request? This action will restore the employee's leave balance if applicable.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Cancellation Reason (Optional)"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation (optional)..."
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancellationReason("");
                }}
                color="inherit"
              >
                No, Keep Leave
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleCancelSubmit}
              >
                Yes, Cancel Leave
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Detail Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5" style={{ color: themeColors.textPrimary }}>
                📋 Leave Request Details
              </Typography>
            </DialogTitle>
            <DialogContent>
              {selectedLeave && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {/* Employee Information */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        Employee Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Name:</strong> {selectedLeave.employee?.fullName || `${selectedLeave.employee?.firstName || ''} ${selectedLeave.employee?.lastName || ''}`.trim()}</Typography>
                        <Typography><strong>Email:</strong> {selectedLeave.employee?.email || "N/A"}</Typography>
                        <Typography><strong>Employee ID:</strong> {selectedLeave.employee?.employeeId || "N/A"}</Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Leave Details */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1 }} />
                        Leave Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography>
                          <strong>Type:</strong>
                          <Chip
                            label={selectedLeave.leaveType?.toUpperCase()}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: LEAVE_TYPE_COLORS[selectedLeave.leaveType?.toLowerCase()] || "#9e9e9e",
                              color: "white"
                            }}
                          />
                        </Typography>
                        <Typography><strong>Duration:</strong> {selectedLeave.leaveDuration?.toUpperCase() || "FULL"}</Typography>
                        {selectedLeave.halfDayType && (
                          <Typography><strong>Half Day Type:</strong> {selectedLeave.halfDayType.replace("_", " ").toUpperCase()}</Typography>
                        )}
                        <Typography><strong>Total Days:</strong> {selectedLeave.totalDays}</Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Dates Information */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Event sx={{ mr: 1 }} />
                        Dates
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Start Date:</strong> {formatDate(selectedLeave.startDate)}</Typography>
                        <Typography><strong>End Date:</strong> {formatDate(selectedLeave.endDate)}</Typography>
                        <Typography><strong>Applied On:</strong> {formatDate(selectedLeave.appliedOn)}</Typography>
                        <Typography><strong>Created:</strong> {formatDate(selectedLeave.createdAt)}</Typography>
                        <Typography><strong>Last Updated:</strong> {formatDate(selectedLeave.updatedAt)}</Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Status Information */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Status Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography>
                          <strong>Current Status:</strong>
                          <Chip
                            label={selectedLeave.status?.toUpperCase()}
                            color={getStatusColor(selectedLeave.status)}
                            icon={getStatusIcon(selectedLeave.status)}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {selectedLeave.approvedBy && (
                          <>
                            <Typography><strong>Approved By:</strong> {selectedLeave.approvedBy.fullName || `${selectedLeave.approvedBy.firstName} ${selectedLeave.approvedBy.lastName}`}</Typography>
                            <Typography><strong>Approved At:</strong> {formatDate(selectedLeave.approvedAt)}</Typography>
                          </>
                        )}
                        {selectedLeave.rejectedBy && (
                          <>
                            <Typography><strong>Rejected By:</strong> {selectedLeave.rejectedBy.fullName}</Typography>
                            <Typography><strong>Rejected At:</strong> {formatDate(selectedLeave.rejectedAt)}</Typography>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Reason */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Reason
                      </Typography>
                      <Typography sx={{
                        backgroundColor: themeColors.cardBg,
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${themeColors.border}`,
                        fontStyle: selectedLeave.reason ? 'normal' : 'italic'
                      }}>
                        {selectedLeave.reason || "No reason provided"}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Documents */}
                  {selectedLeave.documents && selectedLeave.documents.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Documents ({selectedLeave.documents.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLeave.documents.map((doc, index) => (
                            <Chip
                              key={index}
                              label={doc.name || `Document ${index + 1}`}
                              color="info"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  {/* Additional Notes */}
                  {(selectedLeave.rejectionReason || selectedLeave.cancellationReason) && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, backgroundColor: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Additional Notes
                        </Typography>
                        {selectedLeave.rejectionReason && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography><strong>Rejection Reason:</strong> {selectedLeave.rejectionReason}</Typography>
                          </Alert>
                        )}
                        {selectedLeave.cancellationReason && (
                          <Alert severity="warning">
                            <Typography><strong>Cancellation Reason:</strong> {selectedLeave.cancellationReason}</Typography>
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setDetailDialogOpen(false)}
                variant="contained"
                sx={{ minWidth: 100 }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
