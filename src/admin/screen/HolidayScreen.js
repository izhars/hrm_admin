// src/admin/component/HolidayScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Paper,
  useMediaQuery,
  Pagination as MuiPagination,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore } from 'date-fns';
import { styled, alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useContext } from 'react';
import holidayApi from '../api/HolidayApi';
import { useTheme } from '../context/ThemeContext';

// Enhanced Styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
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

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].light, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  },
}));

const HolidayScreen = () => {
  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get theme from context
  const { isDarkMode } = useTheme();
  const { admin, loading: adminLoading } = useContext(AdminContext) || {};

  const [openImportModal, setOpenImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  // HolidayScreen specific states
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: '',
    type: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: null,
    description: '',
    type: 'Festival'
  });
  const [actionType, setActionType] = useState('create');
  const [openModal, setOpenModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0
  });

  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery('(max-width:768px)');

  const holidayTypes = ['National', 'Festival', 'Regional', 'Religious'];

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

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const result = await holidayApi.getHolidays(filters);
      if (result.success) {
        setHolidays(result.holidays || []);
        setPagination(result.pagination || {});
        
        // Calculate statistics
        const now = new Date();
        const upcoming = result.holidays.filter(h => isAfter(new Date(h.date), now)).length;
        const past = result.holidays.filter(h => isBefore(new Date(h.date), now)).length;
        
        setStats({
          total: result.holidays.length,
          upcoming,
          past
        });
      } else {
        enqueueSnackbar(result.message || 'Failed to fetch holidays', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Your existing handlers (keep the same functionality)
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const applyFilters = () => {
    fetchHolidays();
  };

  const resetFilters = () => {
    const currentYear = new Date().getFullYear();
    setFilters({
      year: currentYear,
      month: '',
      type: '',
      search: '',
      page: 1,
      limit: 10
    });
    fetchHolidays();
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData, date: dateValue };
      let result;
      if (actionType === 'create') {
        result = await holidayApi.createHoliday(submitData);
      } else {
        result = await holidayApi.updateHoliday(selectedHoliday._id, submitData);
      }

      if (result.success) {
        enqueueSnackbar(
          `Holiday ${actionType === 'create' ? 'created' : 'updated'} successfully`,
          { variant: 'success' }
        );
        setOpenModal(false);
        fetchHolidays();
        setFormData({ name: '', date: null, description: '', type: 'Festival' });
        setDateValue(null);
        setSelectedHoliday(null);
        setActionType('create');
      } else {
        enqueueSnackbar(result.message || 'Failed to save holiday', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const openCreateModal = () => {
    setActionType('create');
    setFormData({ name: '', date: null, description: '', type: 'Festival' });
    setDateValue(null);
    setSelectedHoliday(null);
    setOpenModal(true);
  };

  const openEditModal = (holiday) => {
    setActionType('update');
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || '',
      type: holiday.type
    });
    setDateValue(new Date(holiday.date));
    setSelectedHoliday(holiday);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await holidayApi.deleteHoliday(id);
      if (result.success) {
        enqueueSnackbar('Holiday deleted successfully', { variant: 'success' });
        setOpenConfirm(false);
        fetchHolidays();
      } else {
        enqueueSnackbar(result.message || 'Failed to delete holiday', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getTypeColor = (type) => {
    const colors = {
      National: 'primary',
      Festival: 'warning',
      Regional: 'success',
      Religious: 'secondary'
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (date) => {
    const today = new Date();
    const holidayDate = new Date(date);
    
    if (isAfter(holidayDate, today)) {
      return 'info';
    } else {
      return 'default';
    }
  };

  // Loading state
  if (!admin) {
    return (
      <div
        style={{
          padding: '50px',
          textAlign: 'center',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: themeColors.gradient,
          color: themeColors.textPrimary
        }}
      >
        <div>You are not authorized to access this page.</div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{
        display: "flex",
        height: "100vh",
        background: themeColors.gradient
      }}>
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleMenuToggle}
          isDarkMode={isDarkMode}
        />

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: sidebarWidth,
          background: themeColors.gradient
        }}>
          <Navbar
            onMenuClick={handleMenuToggle}
            isCollapsed={sidebarCollapsed}
            isDarkMode={isDarkMode}
            admin={admin}
          />

          {/* Main content */}
          <main
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px',
              paddingTop: '94px',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Enhanced Header */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 4 }}>
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
                      Holiday Management
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: themeColors.textSecondary,
                      fontWeight: 400
                    }}>
                      Manage company holidays and observances
                    </Typography>
                  </Box>
                </Box>

                {/* Statistics Cards */}
                <Slide in timeout={1000} direction="up">
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                      <StatCard color="primary">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                              {stats.total}
                            </Typography>
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                              Total Holidays
                            </Typography>
                          </Box>
                          <CalendarIcon sx={{ 
                            fontSize: 40, 
                            color: 'primary.main',
                            opacity: 0.8
                          }} />
                        </Box>
                      </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StatCard color="success">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                              {stats.upcoming}
                            </Typography>
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                              Upcoming
                            </Typography>
                          </Box>
                          <EventIcon sx={{ 
                            fontSize: 40, 
                            color: 'success.main',
                            opacity: 0.8
                          }} />
                        </Box>
                      </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StatCard color="info">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                              {stats.past}
                            </Typography>
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                              Past Holidays
                            </Typography>
                          </Box>
                          <DownloadIcon sx={{ 
                            fontSize: 40, 
                            color: 'info.main',
                            opacity: 0.8
                          }} />
                        </Box>
                      </StatCard>
                    </Grid>
                  </Grid>
                </Slide>
              </Box>
            </Fade>

            {/* Action Buttons Section */}
            <GradientCard sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: themeColors.textPrimary,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FilterIcon sx={{ mr: 1 }} />
                    Quick Actions
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <ActionButton
                      variant="contained"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={openCreateModal}
                    >
                      Add Holiday
                    </ActionButton>
                    
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      startIcon={<UploadIcon />}
                      onClick={() => setOpenImportModal(true)}
                    >
                      Import Holidays
                    </ActionButton>
                    
                    <ActionButton
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={resetFilters}
                    >
                      Refresh
                    </ActionButton>
                  </Stack>
                </Box>
              </CardContent>
            </GradientCard>

            {/* Enhanced Filters */}
            <GradientCard sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: themeColors.textPrimary,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Filter Holidays
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: themeColors.textSecondary }}>Year</InputLabel>
                      <Select
                        value={filters.year}
                        label="Year"
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        sx={{
                          color: themeColors.textPrimary,
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeColors.border,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeColors.accent,
                          },
                        }}
                      >
                        {Array.from({ length: 31 }, (_, i) => 2000 + i).map(year => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: themeColors.textSecondary }}>Month</InputLabel>
                      <Select
                        value={filters.month}
                        label="Month"
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        sx={{
                          color: themeColors.textPrimary,
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeColors.border,
                          },
                        }}
                      >
                        <MenuItem value="">All Months</MenuItem>
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: themeColors.textSecondary }}>Type</InputLabel>
                      <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        sx={{
                          color: themeColors.textPrimary,
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeColors.border,
                          },
                        }}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {holidayTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search holidays..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: themeColors.textSecondary }} />,
                        sx: { borderRadius: '8px' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: themeColors.textPrimary,
                          '& fieldset': { borderColor: themeColors.border },
                          '&:hover fieldset': { borderColor: themeColors.accent },
                          '&.Mui-focused fieldset': { borderColor: themeColors.accent },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <ActionButton
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={applyFilters}
                        size="small"
                      >
                        Apply Filters
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={resetFilters}
                        size="small"
                      >
                        Reset
                      </ActionButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </GradientCard>

            {/* Import Modal */}
            <Dialog 
              open={openImportModal} 
              onClose={() => setOpenImportModal(false)} 
              maxWidth="sm" 
              fullWidth
              TransitionComponent={Zoom}
            >
              <DialogTitle sx={{ 
                fontWeight: 700,
                textAlign: 'center',
                borderBottom: `1px solid ${themeColors.border}`,
                pb: 2
              }}>
                📁 Bulk Import Holidays
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Holiday CSV File
                  </Typography>
                </Box>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: `2px dashed ${themeColors.border}`,
                    borderRadius: '8px',
                    margin: '16px 0'
                  }}
                />
                
                <Alert severity="info" sx={{ borderRadius: '8px', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    CSV Format Requirements:
                  </Typography>
                  <Typography variant="body2">
                    Required columns: <strong>name, date (YYYY-MM-DD), type</strong><br />
                    Optional columns: <strong>description</strong><br />
                    Supported types: National, Festival, Regional, Religious
                  </Typography>
                </Alert>

                <Box sx={{ 
                  p: 2, 
                  backgroundColor: themeColors.hoverBg, 
                  borderRadius: '8px',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    name,date,type,description<br />
                    "New Year","2024-01-01","National","Celebration of new year"<br />
                    "Diwali","2024-11-12","Festival","Festival of lights"
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: `1px solid ${themeColors.border}` }}>
                <Button
                  onClick={() => {
                    setOpenImportModal(false);
                    setImportFile(null);
                  }}
                  sx={{ 
                    color: themeColors.textSecondary,
                    borderRadius: '8px',
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <ActionButton
                  disabled={!importFile || importLoading}
                  onClick={async () => {
                    setImportLoading(true);
                    try {
                      const response = await holidayApi.bulkImportHolidays(importFile);
                      if (response.success) {
                        enqueueSnackbar(
                          `Successfully imported ${response.imported} holidays${response.errors > 0 ? ` with ${response.errors} errors` : ''}`, 
                          { variant: 'success' }
                        );
                        fetchHolidays();
                        setOpenImportModal(false);
                        setImportFile(null);
                      } else {
                        enqueueSnackbar(response.message || 'Import failed', { variant: 'error' });
                      }
                    } catch (error) {
                      enqueueSnackbar(error.message, { variant: 'error' });
                    } finally {
                      setImportLoading(false);
                    }
                  }}
                  variant="contained"
                  startIcon={importLoading ? <CircularProgress size={16} /> : <UploadIcon />}
                >
                  {importLoading ? 'Importing...' : 'Import Holidays'}
                </ActionButton>
              </DialogActions>
            </Dialog>

            {/* Enhanced Holidays Table */}
            <GradientCard>
              <CardContent>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <>
                    {holidays.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: '12px' }}>
                        No holidays found matching your criteria.
                      </Alert>
                    ) : (
                      <>
                        <StyledTableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Holiday Name</TableCell>
                                <TableCell sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Date</TableCell>
                                <TableCell sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Type</TableCell>
                                <TableCell sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Description</TableCell>
                                <TableCell sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Status</TableCell>
                                <TableCell align="right" sx={{ 
                                  color: themeColors.textPrimary, 
                                  fontWeight: 'bold',
                                  fontSize: '0.95rem',
                                  py: 2
                                }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {holidays.map((holiday, index) => (
                                <Fade in timeout={500} key={holiday._id}>
                                  <TableRow
                                    hover
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: themeColors.hoverBg,
                                        transform: 'scale(1.01)',
                                        transition: 'all 0.2s ease-in-out'
                                      },
                                      '& td': {
                                        py: 2,
                                        borderBottom: `1px solid ${themeColors.border}`,
                                      }
                                    }}
                                  >
                                    <TableCell sx={{ 
                                      color: themeColors.textPrimary,
                                      fontWeight: 500
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EventIcon sx={{ 
                                          mr: 1, 
                                          fontSize: 20,
                                          color: themeColors.accent
                                        }} />
                                        {holiday.name}
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: themeColors.textPrimary }}>
                                      <Chip
                                        icon={<CalendarIcon />}
                                        label={formatDate(holiday.date)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderRadius: '6px' }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={holiday.type}
                                        color={getTypeColor(holiday.type)}
                                        size="small"
                                        sx={{ 
                                          borderRadius: '6px',
                                          fontWeight: 600
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ color: themeColors.textPrimary }}>
                                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                        {holiday.description || '-'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={getStatusColor(holiday.date) === 'info' ? 'Upcoming' : 'Past'}
                                        color={getStatusColor(holiday.date)}
                                        size="small"
                                        sx={{ 
                                          borderRadius: '6px',
                                          fontWeight: 600
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <IconButton
                                          color="primary"
                                          onClick={() => openEditModal(holiday)}
                                          size="small"
                                          sx={{
                                            background: alpha('#1976d2', 0.1),
                                            '&:hover': {
                                              background: alpha('#1976d2', 0.2),
                                            }
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          color="error"
                                          onClick={() => {
                                            setSelectedHoliday(holiday);
                                            setOpenConfirm(true);
                                          }}
                                          size="small"
                                          sx={{
                                            background: alpha('#d32f2f', 0.1),
                                            '&:hover': {
                                              background: alpha('#d32f2f', 0.2),
                                            }
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                </Fade>
                              ))}
                            </TableBody>
                          </Table>
                        </StyledTableContainer>

                        {pagination.pages > 1 && (
                          <Box display="flex" justifyContent="center" mt={3}>
                            <MuiPagination
                              count={pagination.pages}
                              page={pagination.current}
                              onChange={handlePageChange}
                              color="primary"
                              shape="rounded"
                              sx={{
                                '& .MuiPaginationItem-root': {
                                  color: themeColors.textPrimary,
                                  borderColor: themeColors.border,
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                },
                                '& .MuiPaginationItem-root.Mui-selected': {
                                  background: `linear-gradient(135deg, ${themeColors.accent}, #8b5cf6)`,
                                  color: 'white',
                                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                },
                                '& .MuiPaginationItem-root:hover': {
                                  backgroundColor: themeColors.hoverBg,
                                },
                              }}
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </GradientCard>

            {/* Enhanced Modals */}
            <Dialog
              open={openModal}
              onClose={() => setOpenModal(false)}
              maxWidth="sm"
              fullWidth
              TransitionComponent={Slide}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  background: themeColors.cardBg,
                  backgroundImage: 'none',
                }
              }}
            >
              <DialogTitle sx={{ 
                color: themeColors.textPrimary,
                fontWeight: 700,
                fontSize: '1.25rem',
                borderBottom: `1px solid ${themeColors.border}`,
                pb: 2
              }}>
                {actionType === 'create' ? '🎉 Add New Holiday' : '✏️ Edit Holiday'}
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Holiday Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        color: themeColors.textPrimary,
                        '& fieldset': { borderColor: themeColors.border },
                        '&:hover fieldset': { borderColor: themeColors.accent },
                        '&.Mui-focused fieldset': { borderColor: themeColors.accent },
                      },
                      '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                    }}
                  />

                  <DatePicker
                    label="Holiday Date"
                    value={dateValue}
                    onChange={(newValue) => {
                      setDateValue(newValue);
                      setFormData({ ...formData, date: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            color: themeColors.textPrimary,
                            '& fieldset': { borderColor: themeColors.border },
                            '&:hover fieldset': { borderColor: themeColors.accent },
                            '&.Mui-focused fieldset': { borderColor: themeColors.accent },
                          },
                          '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                        }}
                      />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: themeColors.textSecondary }}>Holiday Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Holiday Type"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      sx={{
                        borderRadius: '8px',
                        color: themeColors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.accent },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.accent },
                      }}
                    >
                      {holidayTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        color: themeColors.textPrimary,
                        '& fieldset': { borderColor: themeColors.border },
                        '&:hover fieldset': { borderColor: themeColors.accent },
                        '&.Mui-focused fieldset': { borderColor: themeColors.accent },
                      },
                      '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                    }}
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: `1px solid ${themeColors.border}` }}>
                <Button
                  onClick={() => setOpenModal(false)}
                  sx={{ 
                    color: themeColors.textSecondary,
                    borderRadius: '8px',
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <ActionButton onClick={handleSubmit} variant="contained">
                  {actionType === 'create' ? 'Create Holiday' : 'Update Holiday'}
                </ActionButton>
              </DialogActions>
            </Dialog>

            {/* Enhanced Delete Confirmation Modal */}
            <Dialog
              open={openConfirm}
              onClose={() => setOpenConfirm(false)}
              maxWidth="sm"
              TransitionComponent={Zoom}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  background: themeColors.cardBg,
                  backgroundImage: 'none',
                }
              }}
            >
              <DialogTitle sx={{ 
                color: themeColors.textPrimary,
                fontWeight: 700,
                textAlign: 'center'
              }}>
                🗑️ Confirm Delete
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ 
                  color: themeColors.textSecondary,
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  Are you sure you want to delete 
                  <strong style={{ color: themeColors.textPrimary, display: 'block', margin: '8px 0' }}>
                    "{selectedHoliday?.name}"
                  </strong>
                  This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  onClick={() => setOpenConfirm(false)}
                  sx={{ 
                    color: themeColors.textSecondary,
                    borderRadius: '8px',
                    px: 4
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleDelete(selectedHoliday?._id)} 
                  color="error" 
                  variant="contained"
                  sx={{ borderRadius: '8px', px: 4 }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </main>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default HolidayScreen;