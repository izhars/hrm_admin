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
  Fade,
  Zoom,
  useMediaQuery,
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
  FilterList,
  Download,
  Visibility,
  Event as EventIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from '@mui/material/styles';
import LeavesApi from "../api/LeavesApi";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { AdminContext } from "../context/AdminContext";
import { useTheme as useCustomTheme } from '../context/ThemeContext';

// Constants
const TAB_CONFIG = [
  { label: "Pending", status: "pending", color: "warning", icon: HourglassEmpty },
  { label: "Approved", status: "approved", color: "success", icon: CheckCircle },
  { label: "Rejected", status: "rejected", color: "error", icon: Cancel },
  { label: "Cancelled", status: "cancelled", color: "default", icon: Block },
];

const LEAVE_TYPE_CONFIG = {
  sick: { label: "Sick Leave", color: "#ff9800", icon: "🏥" },
  vacation: { label: "Vacation", color: "#4caf50", icon: "🏖️" },
  personal: { label: "Personal", color: "#2196f3", icon: "👤" },
  emergency: { label: "Emergency", color: "#f44336", icon: "🚨" },
  maternity: { label: "Maternity", color: "#9c27b0", icon: "🤰" },
  paternity: { label: "Paternity", color: "#795548", icon: "👨" },
  earned: { label: "Earned", color: "#00bcd4", icon: "⭐" },
  casual: { label: "Casual", color: "#ffc107", icon: "😊" },
};

// Custom hook for leave management logic
const useLeavesManager = (token) => {
  const [state, setState] = useState({
    allLeaves: [],
    loading: true,
    error: null,
    filters: {
      search: "",
      leaveType: "",
      duration: "",
    },
  });

  const fetchLeaves = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await LeavesApi.getAllLeaves();
      const leavesData = response?.success ? response.leaves : [];

      setState(prev => ({ ...prev, allLeaves: leavesData }));
      toast.success(`Loaded ${leavesData.length} leave request(s) 📊`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch leaves";
      setState(prev => ({ ...prev, error: errorMessage, allLeaves: [] }));
      toast.error(`${errorMessage} ❌`);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateFilter = useCallback((filterKey, value) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterKey]: value }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: { search: "", leaveType: "", duration: "" } }));
  }, []);

  return {
    ...state,
    fetchLeaves,
    updateFilter,
    clearFilters,
  };
};

// Main Component
export default function AdminLeavesScreen({ token }) {
  const { isDarkMode } = useCustomTheme();
  const { admin } = useContext(AdminContext) || {};
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeaveForMenu, setSelectedLeaveForMenu] = useState(null);

  // Custom hook for leaves management
  const {
    allLeaves,
    loading,
    error,
    filters,
    fetchLeaves,
    updateFilter,
    clearFilters,
  } = useLeavesManager(token);

  // Theme configuration
  const themeColors = useMemo(() => ({
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    hover: isDarkMode ? "#2d3748" : "#f1f5f9",
  }), [isDarkMode]);

  const sidebarWidth = sidebarCollapsed ? "80px" : "280px";
  const currentTabConfig = TAB_CONFIG[tab];

  // Memoized utilities
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusConfig = useCallback((status) => {
    const config = TAB_CONFIG.find(tab => tab.status === status) || TAB_CONFIG[0];
    return {
      color: config.color,
      icon: config.icon,
      label: config.label,
    };
  }, []);

  const getLeaveTypeConfig = useCallback((type) => {
    return LEAVE_TYPE_CONFIG[type?.toLowerCase()] || {
      label: type || "Unknown",
      color: "#9e9e9e",
      icon: "❓"
    };
  }, []);

  // Enhanced filtering with multiple criteria
  const filteredLeaves = useMemo(() => {
    if (!Array.isArray(allLeaves)) return [];

    return allLeaves.filter((leave) => {
      if (!leave || leave.status !== currentTabConfig.status) return false;

      const matchesSearch = !filters.search ||
        `${leave.employee?.firstName} ${leave.employee?.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        leave.employee?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        leave.leaveType?.toLowerCase().includes(filters.search.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = !filters.leaveType || leave.leaveType === filters.leaveType;
      const matchesDuration = !filters.duration || leave.leaveDuration === filters.duration;

      return matchesSearch && matchesType && matchesDuration;
    });
  }, [allLeaves, currentTabConfig.status, filters]);

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const initialStats = TAB_CONFIG.reduce((acc, tab) => {
      acc[tab.status] = 0;
      return acc;
    }, {});

    return allLeaves.reduce((acc, leave) => {
      if (leave?.status && acc.hasOwnProperty(leave.status)) {
        acc[leave.status]++;
      }
      return acc;
    }, initialStats);
  }, [allLeaves]);

  // Action handlers
  const handleApprove = useCallback(async (leave) => {
    try {
      await LeavesApi.approveLeave(leave._id);
      toast.success("Leave approved successfully ✅");
      fetchLeaves();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Approval failed";
      toast.error(`${errorMessage} ❌`);
    }
  }, [fetchLeaves]);

  const handleReject = useCallback(async () => {
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

  const handleCancel = useCallback(async () => {
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

  const handleViewDetails = useCallback((leave) => {
    setSelectedLeave(leave);
    setDetailDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const exportLeaves = useCallback(() => {
    if (filteredLeaves.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const csvContent = [
        ["Employee Name", "Email", "Employee ID", "Leave Type", "Duration", "Start Date", "End Date", "Total Days", "Reason", "Status", "Applied On"],
        ...filteredLeaves.map(leave => [
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
        ])
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leaves_${currentTabConfig.status}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredLeaves.length} records 📥`);
    } catch (err) {
      toast.error("Export failed ❌");
    }
  }, [filteredLeaves, currentTabConfig.status, formatDate]);

  // Effects
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Loading/Unauthorized state
  if (!admin) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        <Typography variant="h6">You are not authorized to access this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: themeColors.background }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        isDarkMode={isDarkMode}
      />

      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: { xs: 0, md: sidebarWidth },
        transition: "margin-left 0.3s ease"
      }}>
        <Navbar
          onMenuClick={() => setSidebarCollapsed(prev => !prev)}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        <MainContent
          themeColors={themeColors}
          isMobile={isMobile}
          admin={admin}
          stats={stats}
          tab={tab}
          onTabChange={(e, newValue) => setTab(newValue)}
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          searchTerm={filters.search}
          onSearchChange={(e) => updateFilter('search', e.target.value)}
          loading={loading}
          error={error}
          onRefresh={fetchLeaves}
          onExport={exportLeaves}
          filteredLeaves={filteredLeaves}
          currentTabConfig={currentTabConfig}
          onApprove={handleApprove}
          onRejectDialog={setSelectedLeave}
          onCancelDialog={setSelectedLeave}
          onMenuOpen={handleMenuOpen}
          onViewDetails={handleViewDetails}
          formatDate={formatDate}
          getStatusConfig={getStatusConfig}
          getLeaveTypeConfig={getLeaveTypeConfig}
          selectedLeave={selectedLeave}
          detailDialogOpen={detailDialogOpen}
          onDetailDialogClose={() => setDetailDialogOpen(false)}
          rejectDialogOpen={rejectDialogOpen}
          onRejectDialogClose={() => setRejectDialogOpen(false)}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          onRejectSubmit={handleReject}
          cancelDialogOpen={cancelDialogOpen}
          onCancelDialogClose={() => setCancelDialogOpen(false)}
          cancellationReason={cancellationReason}
          onCancellationReasonChange={setCancellationReason}
          onCancelSubmit={handleCancel}
          anchorEl={anchorEl}
          onMenuClose={handleMenuClose}
          selectedLeaveForMenu={selectedLeaveForMenu}
        />
      </Box>
    </Box>
  );
}

// Sub-components for better organization
const MainContent = React.memo(({
  themeColors,
  isMobile,
  admin,
  stats,
  tab,
  onTabChange,
  filters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchChange,
  loading,
  error,
  onRefresh,
  onExport,
  filteredLeaves,
  currentTabConfig,
  onApprove,
  onRejectDialog,
  onCancelDialog,
  onMenuOpen,
  onViewDetails,
  formatDate,
  getStatusConfig,
  getLeaveTypeConfig,
  selectedLeave,
  detailDialogOpen,
  onDetailDialogClose,
  rejectDialogOpen,
  onRejectDialogClose,
  rejectionReason,
  onRejectionReasonChange,
  onRejectSubmit,
  cancelDialogOpen,
  onCancelDialogClose,
  cancellationReason,
  onCancellationReasonChange,
  onCancelSubmit,
  anchorEl,
  onMenuClose,
  selectedLeaveForMenu,
}) => (
  <Box component="main" sx={{
    flex: 1,
    overflow: 'auto',
    p: { xs: 2, md: 3 },
    pt: { xs: 8, md: 10 }
  }}>
    {/* Header Section */}
    <HeaderSection themeColors={themeColors} admin={admin} />

    {/* Stats Cards */}
    <StatsSection stats={stats} themeColors={themeColors} onTabChange={onTabChange} />

    {/* Search and Filters */}
    <SearchAndFilters
      themeColors={themeColors}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      filters={filters}
      onFilterChange={onFilterChange}
      onClearFilters={onClearFilters}
      loading={loading}
      onRefresh={onRefresh}
      onExport={onExport}
      filteredLeaves={filteredLeaves}
    />

    {/* Error Alert */}
    {error && (
      <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
        {error}
      </Alert>
    )}

    {/* Tabs */}
    <TabsSection
      tab={tab}
      onTabChange={onTabChange}
      stats={stats}
      themeColors={themeColors}
    />

    {/* Leaves Table */}
    <LeavesTable
      themeColors={themeColors}
      loading={loading}
      filteredLeaves={filteredLeaves}
      currentTabConfig={currentTabConfig}
      searchTerm={searchTerm}
      onApprove={onApprove}
      onRejectDialog={onRejectDialog}
      onCancelDialog={onCancelDialog}
      onMenuOpen={onMenuOpen}
      onViewDetails={onViewDetails}
      formatDate={formatDate}
      getStatusConfig={getStatusConfig}
      getLeaveTypeConfig={getLeaveTypeConfig}
      isMobile={isMobile}
    />

    {/* Dialogs and Menus */}
    <ActionMenu
      anchorEl={anchorEl}
      onClose={onMenuClose}
      onViewDetails={() => onViewDetails(selectedLeaveForMenu)}
    />

    <RejectDialog
      open={rejectDialogOpen}
      onClose={onRejectDialogClose}
      rejectionReason={rejectionReason}
      onRejectionReasonChange={onRejectionReasonChange}
      onSubmit={onRejectSubmit}
      themeColors={themeColors}
    />

    <CancelDialog
      open={cancelDialogOpen}
      onClose={onCancelDialogClose}
      cancellationReason={cancellationReason}
      onCancellationReasonChange={onCancellationReasonChange}
      onSubmit={onCancelSubmit}
      themeColors={themeColors}
    />

    <DetailDialog
      open={detailDialogOpen}
      onClose={onDetailDialogClose}
      selectedLeave={selectedLeave}
      themeColors={themeColors}
      formatDate={formatDate}
      getStatusConfig={getStatusConfig}
      getLeaveTypeConfig={getLeaveTypeConfig}
    />
  </Box>
));

// Individual sub-components
const HeaderSection = React.memo(({ themeColors }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <EventIcon sx={{
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
        Leave Management
      </Typography>
      <Typography variant="h6" sx={{
        color: themeColors.textSecondary,
        fontWeight: 400
      }}>
        Leave requests made easy. Approve, track, done.
      </Typography>
    </Box>
  </Box>
));

const StatsSection = React.memo(({ stats, themeColors, onTabChange }) => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    {TAB_CONFIG.map((config, index) => (
      <Grid item xs={6} md={3} key={config.status}>
        <Fade
          in
          timeout={800}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
              color: themeColors.textPrimary,
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              },
              transition: "all 0.3s ease",
            }}
            onClick={() => onTabChange(null, index)}
          >
            <config.icon
              sx={{
                fontSize: 40,
                mb: 1,
                color: `${config.color}.main`,
                filter: "drop-shadow(0 0 6px rgba(0,0,0,0.25))",
              }}
            />

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: `${config.color}.main`,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {stats[config.status] || 0}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: themeColors.textSecondary,
                opacity: 0.9,
              }}
            >
              {config.label} Leaves
            </Typography>
          </Paper>
        </Fade>
      </Grid>
    ))}
  </Grid>
));


const SearchAndFilters = React.memo(({
  themeColors,
  searchTerm,
  onSearchChange,
  loading,
  onRefresh,
  onExport,
  filteredLeaves,
}) => (
  <Box
    sx={{
      display: "flex",
      gap: 2,
      mb: 4,
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      justifyContent: "space-between",
      p: 2,
      borderRadius: 3,
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.02)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 2px 8px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    {/* Search Input */}
    <TextField
      variant="outlined"
      placeholder="Search employees, types, or reasons..."
      value={searchTerm}
      onChange={onSearchChange}
      sx={{
        flex: 1,
        maxWidth: 520,
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          px: 1.5,
          py: 0.5,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "#fff",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 0 0 1px rgba(255,255,255,0.06)"
              : "0 0 0 1px rgba(0,0,0,0.04)",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search
              sx={{ opacity: 0.7, fontSize: 22 }}
            />
          </InputAdornment>
        ),
      }}
    />

    {/* Buttons */}
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Tooltip title="Refresh data">
        <IconButton
          onClick={onRefresh}
          disabled={loading}
          sx={{
            borderRadius: 2,
            p: 1.2,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            transition: "0.2s",
            "&:hover": {
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.08)",
            },
          }}
        >
          <Refresh sx={{ fontSize: 22 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export current view">
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={onExport}
          disabled={loading || filteredLeaves.length === 0}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 500,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.12)"
                : "#000",
            color: (theme) =>
              theme.palette.mode === "dark" ? "#fff" : "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.2)"
                  : "#111",
            },
          }}
        >
          Export ({filteredLeaves.length})
        </Button>
      </Tooltip>
    </Box>
  </Box>

));

const TabsSection = React.memo(({ tab, onTabChange, stats, themeColors }) => (
  <Tabs
    value={tab}
    onChange={onTabChange}
    sx={{
      mb: 3,
      "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
    }}
  >
    {TAB_CONFIG.map((config) => (
      <Tab
        key={config.status}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <config.icon sx={{ fontSize: 20 }} />
            {config.label}
            <Chip
              label={stats[config.status] || 0}
              size="small"
              color={config.color}
              variant="outlined"
            />
          </Box>
        }
      />
    ))}
  </Tabs>
));

const LeavesTable = React.memo(({
  themeColors,
  loading,
  filteredLeaves,
  currentTabConfig,
  searchTerm,
  onApprove,
  onRejectDialog,
  onCancelDialog,
  onMenuOpen,
  onViewDetails,
  formatDate,
  getStatusConfig,
  getLeaveTypeConfig,
  isMobile,
}) => (
  <TableContainer
    component={Card}
    sx={{
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      backgroundColor: themeColors.cardBg,
      border: `1px solid ${themeColors.border}`,
    }}
  >
    <Table stickyHeader>
      <TableHead>
        <TableRow sx={{ backgroundColor: themeColors.border }}>
          {[
            { label: "Employee", icon: Person, minWidth: 200 },
            { label: "Leave Type", minWidth: 150 },
            { label: "Duration", icon: AccessTime, minWidth: 120 },
            { label: "Dates", icon: Event, minWidth: 180 },
            { label: "Reason", minWidth: 200 },
            { label: "Status", minWidth: 120 },
            { label: "Actions", minWidth: 150, align: "center" },
          ].map((header, index) => (
            <TableCell key={index} sx={{ minWidth: header.minWidth }} align={header.align}>
              <Typography fontWeight={700} sx={{ color: themeColors.textPrimary, display: 'flex', alignItems: 'center' }}>
                {header.icon && <header.icon sx={{ mr: 1 }} />}
                {header.label}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 2, color: themeColors.textPrimary }}>
                Loading leave requests...
              </Typography>
            </TableCell>
          </TableRow>
        ) : filteredLeaves.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ color: themeColors.textSecondary }}>
                  {searchTerm ? "No matching leaves found" : `No ${currentTabConfig.label} Leaves`}
                </Typography>
                {searchTerm && (
                  <Typography variant="body2" sx={{ mt: 1, color: themeColors.textSecondary }}>
                    Try adjusting your search terms
                  </Typography>
                )}
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          filteredLeaves.map((leave, index) => (
            <TableRow
              key={leave._id}
              hover
              sx={{
                "&:hover": { backgroundColor: `${themeColors.hover} !important` },
                animation: "fadeIn 0.5s ease-in"
              }}
            >
              <EmployeeCell leave={leave} themeColors={themeColors} />
              <LeaveTypeCell leave={leave} getLeaveTypeConfig={getLeaveTypeConfig} />
              <DurationCell leave={leave} themeColors={themeColors} />
              <DatesCell leave={leave} formatDate={formatDate} themeColors={themeColors} />
              <ReasonCell leave={leave} themeColors={themeColors} />
              <StatusCell leave={leave} getStatusConfig={getStatusConfig} />
              <ActionsCell
                leave={leave}
                onApprove={onApprove}
                onRejectDialog={onRejectDialog}
                onCancelDialog={onCancelDialog}
                onMenuOpen={onMenuOpen}
                onViewDetails={onViewDetails}
                isMobile={isMobile}
              />
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
));

// Individual table cell components
const EmployeeCell = React.memo(({ leave, themeColors }) => (
  <TableCell>
    <Box>
      <Typography fontWeight={600} sx={{ color: themeColors.textPrimary }}>
        {leave.employee?.fullName || `${leave.employee?.firstName || "N/A"} ${leave.employee?.lastName || ""}`.trim()}
      </Typography>
      <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
        {leave.employee?.email || "No email"}
      </Typography>
      {leave.employee?.employeeId && (
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
          ID: {leave.employee.employeeId}
        </Typography>
      )}
    </Box>
  </TableCell>
));

const LeaveTypeCell = React.memo(({ leave, getLeaveTypeConfig }) => {
  const config = getLeaveTypeConfig(leave.leaveType);
  return (
    <TableCell>
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </Box>
        }
        size="small"
        sx={{
          backgroundColor: config.color,
          color: "white",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    </TableCell>
  );
});

const DurationCell = React.memo(({ leave, themeColors }) => (
  <TableCell>
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ color: themeColors.textPrimary }}>
        {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
      </Typography>
      <Chip
        label={leave.leaveDuration?.toUpperCase() || "FULL"}
        size="small"
        color={leave.leaveDuration === "half" ? "warning" : "primary"}
        variant="outlined"
        sx={{ mt: 0.5, fontSize: "0.7rem" }}
      />
    </Box>
  </TableCell>
));

const DatesCell = React.memo(({ leave, formatDate, themeColors }) => (
  <TableCell>
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ color: themeColors.textPrimary }}>
        {formatDate(leave.startDate)}
      </Typography>
      {leave.startDate !== leave.endDate && (
        <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
          to {formatDate(leave.endDate)}
        </Typography>
      )}
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>
        Applied: {formatDate(leave.appliedOn)}
      </Typography>
    </Box>
  </TableCell>
));

const ReasonCell = React.memo(({ leave, themeColors }) => (
  <TableCell>
    <Tooltip title={leave.reason || "No reason provided"} placement="top">
      <Typography
        variant="body2"
        sx={{
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: themeColors.textPrimary,
          cursor: "help",
        }}
      >
        {leave.reason || "No reason provided"}
      </Typography>
    </Tooltip>
  </TableCell>
));

const StatusCell = React.memo(({ leave, getStatusConfig }) => {
  const config = getStatusConfig(leave.status);
  return (
    <TableCell>
      <Chip
        label={config.label}
        color={config.color}
        icon={React.createElement(config.icon)}
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    </TableCell>
  );
});

const ActionsCell = React.memo(({
  leave,
  onApprove,
  onRejectDialog,
  onCancelDialog,
  onMenuOpen,
  onViewDetails,
  isMobile,
}) => (
  <TableCell align="center">
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
      {leave.status === "pending" && (
        <>
          <Tooltip title="Approve leave">
            <IconButton
              color="success"
              onClick={() => onApprove(leave)}
              size="small"
            >
              <CheckCircle />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject leave">
            <IconButton
              color="error"
              onClick={() => onRejectDialog(leave)}
              size="small"
            >
              <Cancel />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Tooltip title="View details">
        <IconButton
          color="info"
          onClick={() => onViewDetails(leave)}
          size="small"
        >
          <Visibility />
        </IconButton>
      </Tooltip>
      <Tooltip title="More actions">
        <IconButton size="small" onClick={(e) => onMenuOpen(e, leave)}>
          <MoreVert />
        </IconButton>
      </Tooltip>
    </Box>
  </TableCell>
));

// Dialog components
const ActionMenu = React.memo(({ anchorEl, onClose, onViewDetails }) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
    <MenuItem onClick={onViewDetails}>
      <Info sx={{ mr: 1 }} />
      View Details
    </MenuItem>
  </Menu>
));

const RejectDialog = React.memo(({ open, onClose, rejectionReason, onRejectionReasonChange, onSubmit, themeColors }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: themeColors.textPrimary }}>
      Reject Leave Request
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 2 }}>
        Please provide a clear reason for rejecting this leave request.
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Rejection Reason *"
        value={rejectionReason}
        onChange={(e) => onRejectionReasonChange(e.target.value)}
        placeholder="Enter detailed reason for rejection..."
        error={!rejectionReason.trim()}
        helperText={!rejectionReason.trim() ? "Rejection reason is required" : ""}
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onSubmit}
        disabled={!rejectionReason.trim()}
      >
        Reject Leave
      </Button>
    </DialogActions>
  </Dialog>
));

const CancelDialog = React.memo(({ open, onClose, cancellationReason, onCancellationReasonChange, onSubmit, themeColors }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: themeColors.textPrimary }}>
      Cancel Leave Request
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 2 }}>
        Are you sure you want to cancel this leave request?
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Cancellation Reason (Optional)"
        value={cancellationReason}
        onChange={(e) => onCancellationReasonChange(e.target.value)}
        placeholder="Enter reason for cancellation..."
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">
        Keep Leave
      </Button>
      <Button variant="contained" color="warning" onClick={onSubmit}>
        Cancel Leave
      </Button>
    </DialogActions>
  </Dialog>
));

const DetailDialog = React.memo(({ open, onClose, selectedLeave, themeColors, formatDate, getStatusConfig, getLeaveTypeConfig }) => {
  if (!selectedLeave) return null;

  const statusConfig = getStatusConfig(selectedLeave.status);
  const leaveTypeConfig = getLeaveTypeConfig(selectedLeave.leaveType);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ color: themeColors.textPrimary }}>
        📋 Leave Request Details
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <DetailSection title="Employee Information" icon={Person}>
            <DetailItem label="Name" value={selectedLeave.employee?.fullName || `${selectedLeave.employee?.firstName} ${selectedLeave.employee?.lastName}`} />
            <DetailItem label="Email" value={selectedLeave.employee?.email} />
            <DetailItem label="Employee ID" value={selectedLeave.employee?.employeeId} />
          </DetailSection>

          <DetailSection title="Leave Details" icon={AccessTime}>
            <DetailItem
              label="Type"
              value={
                <Chip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{leaveTypeConfig.icon}</span>
                      <span>{leaveTypeConfig.label}</span>
                    </Box>
                  }
                  size="small"
                  sx={{ backgroundColor: leaveTypeConfig.color, color: 'white' }}
                />
              }
            />
            <DetailItem label="Duration" value={selectedLeave.leaveDuration?.toUpperCase()} />
            <DetailItem label="Total Days" value={selectedLeave.totalDays} />
          </DetailSection>

          <DetailSection title="Dates" icon={Event}>
            <DetailItem label="Start Date" value={formatDate(selectedLeave.startDate)} />
            <DetailItem label="End Date" value={formatDate(selectedLeave.endDate)} />
            <DetailItem label="Applied On" value={formatDate(selectedLeave.appliedOn)} />
          </DetailSection>

          <DetailSection title="Status" icon={statusConfig.icon}>
            <DetailItem
              label="Current Status"
              value={
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  icon={React.createElement(statusConfig.icon)}
                />
              }
            />
            {selectedLeave.approvedBy && (
              <DetailItem label="Approved By" value={selectedLeave.approvedBy.fullName} />
            )}
            {selectedLeave.rejectedBy && (
              <DetailItem label="Rejected By" value={selectedLeave.rejectedBy.fullName} />
            )}
          </DetailSection>

          <DetailSection title="Reason" fullWidth>
            <Typography sx={{
              p: 2,
              borderRadius: 1,
              border: `1px solid ${themeColors.border}`,
              fontStyle: selectedLeave.reason ? 'normal' : 'italic',
              backgroundColor: themeColors.cardBg,
            }}>
              {selectedLeave.reason || "No reason provided"}
            </Typography>
          </DetailSection>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const DetailSection = React.memo(({ title, icon: Icon, children, fullWidth = false }) => (
  <Grid item xs={12} md={fullWidth ? 12 : 6}>
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon sx={{ mr: 1 }} />}
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {children}
      </Box>
    </Paper>
  </Grid>
));

const DetailItem = React.memo(({ label, value }) => (
  <Typography>
    <strong>{label}:</strong> {value || "N/A"}
  </Typography>
));