import React, { useContext, useEffect, useState, useRef } from "react";
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
  alpha,
  styled
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
  Visibility,
  FileDownload,
  BarChart,
  Groups,
  ScheduleSend,
} from "@mui/icons-material";
import AttendanceApi from "../api/AttendanceApi";
import { AdminContext } from "../context/AdminContext";
import Sidebar from "../component/Sidebar";
import { useTheme } from '../context/ThemeContext';

// Enhanced Styled Components with null-safe styling
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.1)} 0%, ${alpha(theme?.palette?.secondary?.main || '#dc004e', 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.2)}`,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme?.palette?.primary?.main || '#1976d2'}, ${theme?.palette?.primary?.light || '#42a5f5'})`,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  background: `linear-gradient(145deg, ${alpha(theme?.palette?.background?.paper || '#ffffff', 0.9)} 0%, ${alpha(theme?.palette?.background?.paper || '#ffffff', 0.7)} 100%)`,
  backdropFilter: 'blur(10px)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '8px 16px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

// Safe Collapse component to prevent scrollTop errors
const SafeCollapse = ({ children, in: inProp, ...props }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Collapse in={inProp} {...props}>
      {children}
    </Collapse>
  );
};

const AttendancePage = () => {
  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  // Get theme from context
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    onTime: 0,
    avgWorkHours: 0,
    totalWorkHours: 0
  });

  // Refs for DOM elements
  const tableContainerRef = useRef(null);
  const mainContentRef = useRef(null);

  // Enhanced Theme configuration
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? "#1e293b" : "#ffffff",
    textPrimary: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    hoverBg: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
    gradient: isDarkMode
      ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
  };

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

  // Set mounted state to prevent SSR issues
  useEffect(() => {
    setMounted(true);
    // Delay animations to ensure DOM is ready
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!admin || !mounted) return;
    fetchAttendance();
  }, [admin, mounted]);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchTerm, filterTab]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await AttendanceApi.getTodayAttendance();
      if (res.success) {
        const data = res.data;
        setAttendance(data.attendance || []);

        const presentCount = data.presentCount || 0;
        const totalEmployees = data.totalEmployees || 0;
        const lateCount = (data.attendance || []).filter((a) => a.isLate).length;
        const onTimeCount = (data.attendance || []).filter((a) => a.status === "present" && !a.isLate).length;
        const totalWorkHours = (data.attendance || []).reduce((sum, a) => sum + (a.workHours || 0), 0);
        const avgWorkHours = presentCount > 0 ? totalWorkHours / presentCount : 0;

        setSummary({
          date: data.date || new Date().toISOString().split('T')[0],
          total: totalEmployees,
          present: presentCount,
          absent: totalEmployees - presentCount,
          late: lateCount,
          onTime: onTimeCount,
          avgWorkHours: avgWorkHours.toFixed(1),
          totalWorkHours: totalWorkHours.toFixed(1),
        });

        setStats({
          total: totalEmployees,
          present: presentCount,
          absent: totalEmployees - presentCount,
          late: lateCount,
          onTime: onTimeCount,
          avgWorkHours: parseFloat(avgWorkHours.toFixed(1)),
          totalWorkHours: parseFloat(totalWorkHours.toFixed(1))
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
    setTimeout(() => setRefreshing(false), 1000);
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
          a.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
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
          sx={{
            fontWeight: 600,
            borderRadius: '6px'
          }}
        />
      );
    }
    return (
      <Chip
        label="Absent"
        color="error"
        size="small"
        icon={<Cancel />}
        sx={{
          fontWeight: 600,
          borderRadius: '6px'
        }}
      />
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return { date: "-", time: "-" };
    try {
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
    } catch {
      return { date: "-", time: "-" };
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      IT: "#6366F1",
      "HUMAN RESOURCES": "#22c55e",
      ADMINISTRATION: "#f59e0b",
      FINANCE: "#ef4444",
      MARKETING: "#8b5cf6",
      SALES: "#06b6d4",
      OPERATIONS: "#84cc16",
      SUPPORT: "#f97316",
    };
    return colors[department?.toUpperCase()] || "#64748b";
  };

  const openLocationDialog = (employee) => {
    setSelectedEmployee(employee);
    setLocationDialogOpen(true);
  };

  const getGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getAttendancePercentage = (count) => {
    return summary.total > 0 ? (count / summary.total) * 100 : 0;
  };

  // Safe Fade component
  const SafeFade = ({ children, ...props }) => {
    if (!animationsReady) {
      return children;
    }
    return <Fade {...props}>{children}</Fade>;
  };

  // Safe Slide component
  const SafeSlide = ({ children, ...props }) => {
    if (!animationsReady) {
      return children;
    }
    return (
      <Box
        sx={{
          animation: 'fadeInUp 0.6s ease-out',
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {children}
      </Box>
    );
  };

  // Don't render until mounted
  if (!mounted) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: themeColors.background,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

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
    <Box sx={{
      display: "flex",
      height: "100vh",
      background: themeColors.background
    }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
        admin={admin}
      />

      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: sidebarWidth,
        background: themeColors.background,
        minWidth: 0
      }}>
        {/* Page Content - Removed paddingTop since Navbar is not here */}
        <Box
          ref={mainContentRef}
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            paddingTop: '24px',
            transition: 'all 0.3s ease'
          }}
        >

          {/* Enhanced Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChart sx={{
                fontSize: 32,
                color: themeColors.accent,
                mr: 2,
                background: `linear-gradient(135deg, ${themeColors.accent}, #8b5cf6)`,
                borderRadius: '12px',
                p: 1
              }} />
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${themeColors.textPrimary}, ${themeColors.accent})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Attendance Dashboard
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" sx={{ color: themeColors.textSecondary, fontWeight: 400 }}>
                    {new Date(summary.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                  <Chip
                    label={`Live Updates • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    icon={<CalendarToday />}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              </Box>
            </Box>

            {/* Enhanced Statistics Cards */}
            <SafeSlide>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={2.4}>
                  <GradientCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                            {stats.total}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                            Total Employees
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={100}
                            sx={{
                              mt: 1,
                              bgcolor: alpha(themeColors.accent, 0.2),
                              "& .MuiLinearProgress-bar": { bgcolor: themeColors.accent },
                              borderRadius: '4px',
                              height: '6px'
                            }}
                          />
                        </Box>
                        <AnimatedAvatar sx={{ bgcolor: themeColors.accent, width: 56, height: 56 }}>
                          <Groups fontSize="large" />
                        </AnimatedAvatar>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} lg={2.4}>
                  <GradientCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                            {stats.present}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                            Present Today
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getAttendancePercentage(stats.present)}
                            sx={{
                              mt: 1,
                              bgcolor: alpha('#22c55e', 0.2),
                              "& .MuiLinearProgress-bar": { bgcolor: '#22c55e' },
                              borderRadius: '4px',
                              height: '6px'
                            }}
                          />
                        </Box>
                        <AnimatedAvatar sx={{ bgcolor: '#22c55e', width: 56, height: 56 }}>
                          <CheckCircle fontSize="large" />
                        </AnimatedAvatar>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} lg={2.4}>
                  <GradientCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                            {stats.late}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                            Late Arrivals
                          </Typography>
                          {stats.late > 0 && (
                            <Chip
                              label={`${getAttendancePercentage(stats.late).toFixed(1)}% of total`}
                              size="small"
                              sx={{
                                mt: 1,
                                bgcolor: '#f59e0b',
                                color: "#fff",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                        <AnimatedAvatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
                          <Schedule fontSize="large" />
                        </AnimatedAvatar>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} lg={2.4}>
                  <GradientCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                            {stats.totalWorkHours}h
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                            Total Work Hours
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                            Avg: {stats.avgWorkHours}h per employee
                          </Typography>
                        </Box>
                        <AnimatedAvatar sx={{ bgcolor: '#06b6d4', width: 56, height: 56 }}>
                          <Timer fontSize="large" />
                        </AnimatedAvatar>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} lg={2.4}>
                  <GradientCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="700" sx={{ color: themeColors.textPrimary }}>
                            {stats.onTime}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                            On-Time Arrivals
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                            {stats.present > 0 ? ((stats.onTime / stats.present) * 100).toFixed(1) : 0}% punctuality
                          </Typography>
                        </Box>
                        <AnimatedAvatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                          <AccessTime fontSize="large" />
                        </AnimatedAvatar>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                </Grid>
              </Grid>
            </SafeSlide>
          </Box>
          {/* Enhanced Filters and Search */}
          <SafeFade in={animationsReady}>
            <GradientCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "center" }}>
                  <TextField
                    fullWidth
                    placeholder="Search employees by name, email, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: themeColors.textSecondary }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '8px',
                        bgcolor: themeColors.cardBg,
                        color: themeColors.textPrimary
                      }
                    }}
                    sx={{ flex: 1 }}
                  />

                  <Tabs
                    value={filterTab}
                    onChange={(e, newValue) => setFilterTab(newValue)}
                    sx={{
                      minHeight: 'auto',
                      "& .MuiTab-root": {
                        textTransform: "none",
                        minWidth: "auto",
                        px: 2,
                        py: 1,
                        color: themeColors.textSecondary,
                        fontWeight: 600,
                        borderRadius: '8px',
                        margin: '0 4px',
                        minHeight: '40px'
                      },
                      "& .Mui-selected": {
                        color: themeColors.accent,
                        bgcolor: alpha(themeColors.accent, 0.1),
                      },
                      "& .MuiTabs-indicator": {
                        display: 'none'
                      }
                    }}
                  >
                    <Tab label={`All (${attendance.length})`} value="all" />
                    <Tab
                      label={
                        <Badge badgeContent={summary.present} color="success" showZero={false}>
                          <Box sx={{ px: 1 }}>Present</Box>
                        </Badge>
                      }
                      value="present"
                    />
                    <Tab
                      label={
                        <Badge badgeContent={summary.absent} color="error" showZero={false}>
                          <Box sx={{ px: 1 }}>Absent</Box>
                        </Badge>
                      }
                      value="absent"
                    />
                    <Tab
                      label={
                        <Badge badgeContent={summary.late} color="warning" showZero={false}>
                          <Box sx={{ px: 1 }}>Late</Box>
                        </Badge>
                      }
                      value="late"
                    />
                    <Tab
                      label={
                        <Badge badgeContent={summary.onTime} color="info" showZero={false}>
                          <Box sx={{ px: 1 }}>On-Time</Box>
                        </Badge>
                      }
                      value="ontime"
                    />
                  </Tabs>
                </Stack>
              </CardContent>
            </GradientCard>
          </SafeFade>

          {/* Enhanced Attendance Table */}
          <GradientCard>
            <CardContent sx={{ p: 0 }}>
              <StyledTableContainer ref={tableContainerRef}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(themeColors.accent, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Employee Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Check-In Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Check-Out Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, py: 2 }}>Work Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttendance.map((a, index) => (
                      <React.Fragment key={a.employee?.id || index}>
                        <TableRow
                          hover
                          sx={{
                            "&:hover": { bgcolor: themeColors.hoverBg },
                            cursor: "pointer",
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => a.employee?.id && toggleRowExpansion(a.employee.id)}
                        >
                          {/* Employee Details Column */}
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  bgcolor: getDepartmentColor(a.employee?.department),
                                  width: 48,
                                  height: 48,
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(a.employee?.name)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} sx={{ color: themeColors.textPrimary }}>
                                  {a.employee?.name || 'N/A'}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <BadgeIcon fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                    {a.employee?.employeeId || 'N/A'}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Email fontSize="small" sx={{ color: themeColors.textSecondary }} />
                                  <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                    {a.employee?.email || 'N/A'}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Department Column */}
                          <TableCell>
                            <Chip
                              label={a.employee?.department || 'N/A'}
                              size="small"
                              icon={<Business />}
                              sx={{
                                bgcolor: `${getDepartmentColor(a.employee?.department)}20`,
                                color: getDepartmentColor(a.employee?.department),
                                fontWeight: 600,
                                borderRadius: '6px'
                              }}
                            />
                          </TableCell>

                          {/* Status Column */}
                          <TableCell>
                            <Stack spacing={1}>
                              {getStatusChip(a.status, a.isLate)}
                              {a.isLate && (
                                <Chip
                                  label={`${a.lateBy || 0} min late`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  icon={<Warning />}
                                  sx={{ fontWeight: 600, borderRadius: '6px' }}
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
                                {a.checkIn?.location && (
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
                              </Stack>
                            ) : (
                              <Typography sx={{ color: themeColors.textSecondary, fontStyle: "italic" }}>
                                No check-in
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
                                No check-out
                              </Typography>
                            )}
                          </TableCell>

                          {/* Work Hours Column */}
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
                                  sx={{ fontWeight: 600, borderRadius: '6px' }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>

                {filteredAttendance.length === 0 && (
                  <Box sx={{ p: 6, textAlign: "center" }}>
                    <Search sx={{ fontSize: 64, color: themeColors.textSecondary, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ color: themeColors.textSecondary, mb: 1 }}>
                      No matching records found
                    </Typography>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                      {searchTerm ? 'Try adjusting your search criteria' : 'No attendance data available for the selected filters'}
                    </Typography>
                  </Box>
                )}
              </StyledTableContainer>
            </CardContent>
          </GradientCard>

          {/* Enhanced Location Dialog */}
          <Dialog
            open={locationDialogOpen}
            onClose={() => setLocationDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: themeColors.cardBg,
              }
            }}
          >
            <DialogTitle sx={{ borderBottom: `1px solid ${themeColors.border}`, pb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn sx={{ color: themeColors.accent }} />
                <Typography variant="h6" sx={{ color: themeColors.textPrimary, fontWeight: 600 }}>
                  Check-in Location Details
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedEmployee?.checkIn?.location && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1, fontWeight: 600 }}>
                      Employee Information
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>
                      {selectedEmployee.employee?.name} ({selectedEmployee.employee?.employeeId})
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1, fontWeight: 600 }}>
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
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1, fontWeight: 600 }}>
                      Full Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>
                      {selectedEmployee.checkIn.location.address}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accent, mb: 1, fontWeight: 600 }}>
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
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${themeColors.border}` }}>
              <Button
                onClick={() => setLocationDialogOpen(false)}
                sx={{ color: themeColors.textSecondary, borderRadius: '8px' }}
              >
                Close
              </Button>
              {selectedEmployee?.checkIn?.location && (
                <ActionButton
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
                  Open in Google Maps
                </ActionButton>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default AttendancePage;