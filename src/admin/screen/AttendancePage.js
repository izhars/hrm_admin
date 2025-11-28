import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Stack,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  LinearProgress,
  Divider,
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import {
  AccessTime,
  LocationOn,
  People,
  Search,
  Refresh,
  Download,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  Email,
  Badge as BadgeIcon,
  Business,
  Login,
  Logout,
  Timer,
  Warning,
  Map,
  Assignment,
  CalendarToday,
  QueryBuilder,
  DevicesOther,
} from "@mui/icons-material";
import AttendanceApi from "../api/AttendanceApi";
import { AdminContext } from "../context/AdminContext";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useTheme } from '../context/ThemeContext'; // Import theme context

const AttendancePage = () => {

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// Get theme from context instead of local state
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};


  // Attendance data states
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  // Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  useEffect(() => {
    if (!admin) return;
    fetchAttendance();
  }, [admin]);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchTerm, filterTab]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await AttendanceApi.getTodayAttendance();
      if (res.success) {
        const data = res.data;
        setAttendance(data.attendance);
        setSummary({
          date: data.date,
          total: data.totalEmployees,
          present: data.presentCount,
          absent: data.totalEmployees - data.presentCount,
          late: data.attendance.filter((a) => a.isLate).length,
          onTime: data.attendance.filter((a) => a.status === "present" && !a.isLate).length,
          avgWorkHours: (
            data.attendance.reduce((sum, a) => sum + (a.workHours || 0), 0) /
            (data.attendance.filter((a) => a.status === "present").length || 1)
          ).toFixed(1),
          totalWorkHours: data.attendance
            .reduce((sum, a) => sum + (a.workHours || 0), 0)
            .toFixed(1),
        });
      } else {
        console.error(res.message);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const filterAttendance = () => {
    let filtered = attendance;

    if (filterTab === "present") {
      filtered = filtered.filter((a) => a.status === "present");
    } else if (filterTab === "absent") {
      filtered = filtered.filter((a) => a.status === "absent");
    } else if (filterTab === "late") {
      filtered = filtered.filter((a) => a.isLate);
    } else if (filterTab === "ontime") {
      filtered = filtered.filter((a) => a.status === "present" && !a.isLate);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAttendance(filtered);
  };

  const toggleRowExpansion = (employeeId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(employeeId)) {
      newExpandedRows.delete(employeeId);
    } else {
      newExpandedRows.add(employeeId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusChip = (status, isLate) => {
    if (status === "present") {
      return (
        <Chip
          label={isLate ? "Late" : "Present"}
          color={isLate ? "warning" : "success"}
          size="small"
          icon={isLate ? <Schedule /> : <CheckCircle />}
          variant="filled"
          sx={{ bgcolor: isLate ? "#fef3c7" : "#dcfce7", color: isDarkMode ? "#e2e8f0" : "#1e293b" }}
        />
      );
    }
    return (
      <Chip
        label="Absent"
        color="error"
        size="small"
        icon={<Cancel />}
        variant="filled"
        sx={{ bgcolor: "#fee2e2", color: isDarkMode ? "#e2e8f0" : "#1e293b" }}
      />
    );
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getDepartmentColor = (department) => {
    const colors = {
      IT: "#6366F1",
      "HUMAN RESOURCES": "#22c55e",
      ADMINISTRATION: "#f59e0b",
      FINANCE: "#ef4444",
    };
    return colors[department] || "#64748b";
  };

  const openLocationDialog = (employee) => {
    setSelectedEmployee(employee);
    setLocationDialogOpen(true);
  };

  const getGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Loading or unauthorized state
  if (adminLoading || loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: themeColors.background }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: themeColors.textSecondary }}>
          Loading attendance data...
        </Typography>
      </Box>
    );
  }

  if (!admin) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: themeColors.background }}
      >
        <Typography variant="h6" sx={{ color: themeColors.textPrimary }}>
          You are not authorized to access this page.
        </Typography>
      </Box>
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

        {/* Page Content */}
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
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{ color: themeColors.textPrimary, mb: 1 }}
              >
                Attendance Dashboard
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body1" sx={{ color: themeColors.textSecondary }}>
                  {new Date(summary.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Chip
                  label={`Report Date: ${summary.date}`}
                  size="small"
                  color="info"
                  variant="outlined"
                  icon={<CalendarToday />}
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ textTransform: "none", color: themeColors.textPrimary, borderColor: themeColors.border }}
              >
                Export Report
              </Button>
              <Button
                variant="contained"
                startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ textTransform: "none", bgcolor: themeColors.accent, color: "#fff" }}
              >
                Refresh Data
              </Button>
            </Stack>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={2.4}>
              <Card
                sx={{
                  bgcolor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                        {summary.total}
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                        Total Employees
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                      <People fontSize="large" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={2.4}>
              <Card
                sx={{
                  bgcolor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                        {summary.present}
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                        Present Today
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(summary.present / summary.total) * 100}
                        sx={{
                          mt: 1,
                          bgcolor: themeColors.border,
                          "& .MuiLinearProgress-bar": { bgcolor: themeColors.accent },
                        }}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                      <CheckCircle fontSize="large" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={2.4}>
              <Card
                sx={{
                  bgcolor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                        {summary.late}
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                        Late Arrivals
                      </Typography>
                      {summary.late > 0 && (
                        <Chip
                          label="Needs Attention"
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: themeColors.accent,
                            color: "#fff",
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Box>
                    <Avatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                      <Schedule fontSize="large" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={2.4}>
              <Card
                sx={{
                  bgcolor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                        {summary.totalWorkHours}h
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                        Total Work Hours
                      </Typography>
                      <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                        Avg: {summary.avgWorkHours}h per employee
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                      <Timer fontSize="large" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={2.4}>
              <Card
                sx={{
                  bgcolor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                        {summary.onTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                        On-Time Arrivals
                      </Typography>
                      <Typography variant="caption" sx={{ color: themeColors.accent }}>
                        {summary.present > 0 ? ((summary.onTime / summary.present) * 100).toFixed(1) : 0}% punctuality
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                      <AccessTime fontSize="large" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Search */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              bgcolor: themeColors.cardBg,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                  placeholder="Search by name, email, employee ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: themeColors.textSecondary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, "& .MuiInputBase-root": { bgcolor: themeColors.cardBg } }}
                />
                <Tabs
                  value={filterTab}
                  onChange={(e, newValue) => setFilterTab(newValue)}
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      minWidth: "auto",
                      px: 2,
                      color: themeColors.textSecondary,
                    },
                    "& .Mui-selected": { color: themeColors.accent },
                  }}
                >
                  <Tab label={`All (${attendance.length})`} value="all" />
                  <Tab
                    label={<Badge badgeContent={summary.present} color="success" showZero={false}>Present</Badge>}
                    value="present"
                  />
                  <Tab
                    label={<Badge badgeContent={summary.absent} color="error" showZero={false}>Absent</Badge>}
                    value="absent"
                  />
                  <Tab
                    label={<Badge badgeContent={summary.late} color="warning" showZero={false}>Late</Badge>}
                    value="late"
                  />
                  <Tab
                    label={<Badge badgeContent={summary.onTime} color="info" showZero={false}>On-Time</Badge>}
                    value="ontime"
                  />
                </Tabs>
              </Stack>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              bgcolor: themeColors.cardBg,
            }}
          >
            <TableContainer component={Paper} sx={{ borderRadius: 3, bgcolor: themeColors.cardBg }}>
              <Table>
                <TableHead sx={{ bgcolor: themeColors.background }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Employee Details</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Check-In Details</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Check-Out Details</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Work Hours & Late Info</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendance.map((a) => (
                    <React.Fragment key={a.employee.id}>
                      <TableRow
                        hover
                        sx={{
                          "&:hover": { bgcolor: isDarkMode ? "#334155" : "#f8fafc" },
                          cursor: "pointer",
                        }}
                        onClick={() => toggleRowExpansion(a.employee.id)}
                      >
                        {/* Employee Details Column */}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                bgcolor: getDepartmentColor(a.employee.department),
                                width: 48,
                                height: 48,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(a.employee.name)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} sx={{ color: themeColors.textPrimary }}>
                                {a.employee.name}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <BadgeIcon fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                  {a.employee.employeeId}
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Email fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                  {a.employee.email}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Department Column */}
                        <TableCell>
                          <Chip
                            label={a.employee.department}
                            size="small"
                            icon={<Business />}
                            sx={{
                              bgcolor: `${getDepartmentColor(a.employee.department)}20`,
                              color: getDepartmentColor(a.employee.department),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>

                        {/* Status Column */}
                        <TableCell>
                          <Stack spacing={1}>
                            {getStatusChip(a.status, a.isLate)}
                            {a.isLate && (
                              <Chip
                                label={`${a.lateBy} min late`}
                                size="small"
                                color="warning"
                                variant="outlined"
                                icon={<Warning />}
                                sx={{ color: themeColors.textPrimary, borderColor: themeColors.border }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Check-In Details Column */}
                        <TableCell>
                          {a.checkIn?.time ? (
                            <Stack spacing={0.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Login fontSize="small" color="success" />
                                <Typography variant="body2" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                  {formatTime(a.checkIn.time)}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                {formatDateTime(a.checkIn.time).date}
                              </Typography>
                              {a.checkIn.location && (
                                <Button
                                  size="small"
                                  startIcon={<LocationOn />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLocationDialog(a);
                                  }}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    p: 0.5,
                                    minWidth: "auto",
                                    color: themeColors.accent,
                                  }}
                                >
                                  View Location
                                </Button>
                              )}
                              {a.checkIn.deviceInfo && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <DevicesOther fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                  <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                    {a.checkIn.deviceInfo}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          ) : (
                            <Typography sx={{ color: themeColors.textSecondary, fontStyle: "italic" }}>
                              No check-in recorded
                            </Typography>
                          )}
                        </TableCell>

                        {/* Check-Out Details Column */}
                        <TableCell>
                          {a.checkOut?.time ? (
                            <Stack spacing={0.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Logout fontSize="small" color="error" />
                                <Typography variant="body2" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                  {formatTime(a.checkOut.time)}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                {formatDateTime(a.checkOut.time).date}
                              </Typography>
                            </Stack>
                          ) : a.status === "present" ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <QueryBuilder fontSize="small" sx={{ color: themeColors.accent }} />
                              <Typography variant="body2" sx={{ color: themeColors.accent, fontWeight: 500 }}>
                                Still Working
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography sx={{ color: themeColors.textSecondary, fontStyle: "italic" }}>
                              No check-out recorded
                            </Typography>
                          )}
                        </TableCell>

                        {/* Work Hours & Late Info Column */}
                        <TableCell>
                          <Stack spacing={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Timer fontSize="small" sx={{ color: themeColors.textSecondary }} />
                              <Typography fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                {a.workHours > 0 ? `${a.workHours}h` : "0h"}
                              </Typography>
                            </Stack>
                            {a.workHours > 8 && (
                              <Chip
                                label="Overtime"
                                size="small"
                                color="info"
                                variant="outlined"
                                icon={<TrendingUp />}
                                sx={{ color: themeColors.textPrimary, borderColor: themeColors.border }}
                              />
                            )}
                            {a.isLate && (
                              <Alert
                                severity="warning"
                                sx={{ py: 0, fontSize: "0.75rem", bgcolor: themeColors.cardBg, color: themeColors.textPrimary }}
                              >
                                Late by {a.lateBy} minutes
                              </Alert>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell>
                          <IconButton size="small" sx={{ color: themeColors.textPrimary }}>
                            {expandedRows.has(a.employee.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Row Details */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in={expandedRows.has(a.employee.id)} timeout="auto">
                            <Box sx={{ py: 3, px: 4, bgcolor: themeColors.cardBg, borderRadius: 2, m: 2 }}>
                              <Typography variant="h6" sx={{ color: themeColors.accent, mb: 3 }}>
                                Detailed Employee Information
                              </Typography>
                              <Grid container spacing={4}>
                                {/* Employee Information */}
                                <Grid item xs={12} md={6}>
                                  <Card
                                    variant="outlined"
                                    sx={{ p: 2, height: "100%", bgcolor: themeColors.cardBg, borderColor: themeColors.border }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ color: themeColors.accent, mb: 2, fontWeight: 600 }}
                                    >
                                      <Assignment sx={{ mr: 1, verticalAlign: "middle" }} />
                                      Employee Information
                                    </Typography>
                                    <Stack spacing={1.5}>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Employee ID:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                          {a.employee.employeeId}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Full Name:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                          {a.employee.name}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Email Address:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                          {a.employee.email}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Department:
                                        </Typography>
                                        <Chip
                                          label={a.employee.department}
                                          size="small"
                                          sx={{
                                            bgcolor: `${getDepartmentColor(a.employee.department)}20`,
                                            color: getDepartmentColor(a.employee.department),
                                            fontWeight: 600,
                                          }}
                                        />
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Internal ID:
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          fontWeight={500}
                                          sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: themeColors.textPrimary }}
                                        >
                                          {a.employee.id}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Card>
                                </Grid>

                                {/* Attendance Summary */}
                                <Grid item xs={12} md={6}>
                                  <Card
                                    variant="outlined"
                                    sx={{ p: 2, height: "100%", bgcolor: themeColors.cardBg, borderColor: themeColors.border }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ color: themeColors.accent, mb: 2, fontWeight: 600 }}
                                    >
                                      <QueryBuilder sx={{ mr: 1, verticalAlign: "middle" }} />
                                      Today's Attendance Summary
                                    </Typography>
                                    <Stack spacing={1.5}>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Attendance Status:
                                        </Typography>
                                        {getStatusChip(a.status, a.isLate)}
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Total Work Hours:
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          fontWeight={600}
                                          sx={{
                                            color: a.workHours >= 8 ? themeColors.accent : themeColors.textPrimary,
                                          }}
                                        >
                                          {a.workHours}h
                                          {a.workHours >= 8 && (
                                            <Chip
                                              label="Full Day"
                                              size="small"
                                              color="success"
                                              sx={{ ml: 1 }}
                                            />
                                          )}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                          Punctuality Status:
                                        </Typography>
                                        {a.isLate ? (
                                          <Chip
                                            label={`Late by ${a.lateBy} minutes`}
                                            color="warning"
                                            size="small"
                                            icon={<Warning />}
                                          />
                                        ) : a.status === "present" ? (
                                          <Chip
                                            label="On Time"
                                            color="success"
                                            size="small"
                                            icon={<CheckCircle />}
                                          />
                                        ) : (
                                          <Chip
                                            label="Not Applicable"
                                            color="default"
                                            size="small"
                                          />
                                        )}
                                      </Box>
                                    </Stack>
                                  </Card>
                                </Grid>

                                {/* Check-in Details */}
                                {a.checkIn?.time && (
                                  <Grid item xs={12} md={6}>
                                    <Card
                                      variant="outlined"
                                      sx={{ p: 2, height: "100%", bgcolor: themeColors.cardBg, borderColor: themeColors.border }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{ color: themeColors.accent, mb: 2, fontWeight: 600 }}
                                      >
                                        <Login sx={{ mr: 1, verticalAlign: "middle" }} />
                                        Check-In Details
                                      </Typography>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                            Check-In Time:
                                          </Typography>
                                          <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                            {formatDateTime(a.checkIn.time).date} at {formatDateTime(a.checkIn.time).time}
                                          </Typography>
                                        </Box>
                                        {a.checkIn.deviceInfo && (
                                          <Box>
                                            <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                              Device Information:
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                              <DevicesOther fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                              <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                                {a.checkIn.deviceInfo}
                                              </Typography>
                                            </Stack>
                                          </Box>
                                        )}
                                        {a.checkIn.location && (
                                          <Box>
                                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 1 }}>
                                              Location Details:
                                            </Typography>
                                            <Stack spacing={1}>
                                              <Typography variant="body2" sx={{ fontWeight: 500, color: themeColors.textPrimary }}>
                                                Coordinates: {a.checkIn.location.latitude}, {a.checkIn.location.longitude}
                                              </Typography>
                                              <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                                {a.checkIn.location.address}
                                              </Typography>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Map />}
                                                component={Link}
                                                href={getGoogleMapsUrl(a.checkIn.location.latitude, a.checkIn.location.longitude)}
                                                target="_blank"
                                                sx={{
                                                  alignSelf: "flex-start",
                                                  textTransform: "none",
                                                  color: themeColors.accent,
                                                  borderColor: themeColors.border,
                                                }}
                                              >
                                                View on Google Maps
                                              </Button>
                                            </Stack>
                                          </Box>
                                        )}
                                      </Stack>
                                    </Card>
                                  </Grid>
                                )}

                                {/* Check-out Details */}
                                <Grid item xs={12} md={6}>
                                  <Card
                                    variant="outlined"
                                    sx={{ p: 2, height: "100%", bgcolor: themeColors.cardBg, borderColor: themeColors.border }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ color: themeColors.accent, mb: 2, fontWeight: 600 }}
                                    >
                                      <Logout sx={{ mr: 1, verticalAlign: "middle" }} />
                                      Check-Out Details
                                    </Typography>
                                    <Stack spacing={1.5}>
                                      {a.checkOut?.time ? (
                                        <Box>
                                          <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                            Check-Out Time:
                                          </Typography>
                                          <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                                            {formatDateTime(a.checkOut.time).date} at {formatDateTime(a.checkOut.time).time}
                                          </Typography>
                                        </Box>
                                      ) : a.status === "present" ? (
                                        <Alert
                                          severity="info"
                                          sx={{ fontSize: "0.875rem", bgcolor: themeColors.cardBg, color: themeColors.textPrimary }}
                                        >
                                          Employee is currently working. Check-out time will be recorded when they leave.
                                        </Alert>
                                      ) : (
                                        <Alert
                                          severity="warning"
                                          sx={{ fontSize: "0.875rem", bgcolor: themeColors.cardBg, color: themeColors.textPrimary }}
                                        >
                                          No check-out recorded for this employee today.
                                        </Alert>
                                      )}
                                    </Stack>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              {filteredAttendance.length === 0 && (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: themeColors.textSecondary }}>
                    No employees found
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: themeColors.textSecondary }}>
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              )}
            </TableContainer>
          </Card>

          {/* Location Dialog */}
          <Dialog
            open={locationDialogOpen}
            onClose={() => setLocationDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn sx={{ color: themeColors.accent }} />
                <Typography variant="h6" sx={{ color: themeColors.textPrimary }}>
                  Check-in Location Details
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedEmployee?.checkIn?.location && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1 }}>
                      Employee Information
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ color: themeColors.textPrimary }}>
                      {selectedEmployee.employee.name} ({selectedEmployee.employee.employeeId})
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1 }}>
                      Location Coordinates
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: "monospace", color: themeColors.textPrimary }}>
                      Latitude: {selectedEmployee.checkIn.location.latitude}
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: "monospace", color: themeColors.textPrimary }}>
                      Longitude: {selectedEmployee.checkIn.location.longitude}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1 }}>
                      Full Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>
                      {selectedEmployee.checkIn.location.address}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1 }}>
                      Check-in Time
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>
                      {formatDateTime(selectedEmployee.checkIn.time).date} at{" "}
                      {formatDateTime(selectedEmployee.checkIn.time).time}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setLocationDialogOpen(false)}
                sx={{ color: themeColors.textPrimary }}
              >
                Close
              </Button>
              {selectedEmployee?.checkIn?.location && (
                <Button
                  variant="contained"
                  startIcon={<Map />}
                  component={Link}
                  href={getGoogleMapsUrl(
                    selectedEmployee.checkIn.location.latitude,
                    selectedEmployee.checkIn.location.longitude
                  )}
                  target="_blank"
                  sx={{ bgcolor: themeColors.accent, color: "#fff" }}
                >
                  Open in Maps
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AttendancePage;