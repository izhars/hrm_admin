// src/components/Departments/DepartmentManager.js
import React, { useState, useEffect, useContext } from 'react';
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
  Card,
  CardContent,
  Paper,
  Fade,
  Slide,
  Zoom,
  alpha,
  styled,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Groups as GroupsIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { DepartmentsApi } from '../api';
import { useTheme } from '../context/ThemeContext';

// Enhanced Styled Components with null-safe styling
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.1)} 0%, ${alpha(theme?.palette?.secondary?.main || '#dc004e', 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.2)}`,
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
  marginBottom: theme?.spacing?.(3) || '24px',
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

const StatCard = styled(Card)(({ theme, color = 'primary' }) => {
  const colorTheme = theme?.palette?.[color] || { main: '#1976d2', light: '#42a5f5' };
  
  return {
    padding: theme?.spacing?.(2.5) || '20px',
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${alpha(colorTheme.main, 0.15)} 0%, ${alpha(colorTheme.light, 0.1)} 100%)`,
    border: `1px solid ${alpha(colorTheme.main, 0.2)}`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${colorTheme.main}, ${colorTheme.light})`,
    },
  };
});

const DepartmentManager = () => {
  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Get theme from context with safe defaults
  const { isDarkMode = false } = useTheme() || {};
  const { admin, loading: adminLoading = false } = useContext(AdminContext) || {};

  // Department states
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Enhanced Theme configuration with safe defaults
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
  }, []);

  // Fetch all departments
  const fetchDepartments = async () => {
    if (!admin) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await DepartmentsApi.getAll(true);
      const depts = response?.departments || [];
      setDepartments(depts);
      
      // Calculate statistics
      const active = depts.filter(dept => dept.isActive).length;
      const inactive = depts.filter(dept => !dept.isActive).length;
      
      setStats({
        total: depts.length,
        active,
        inactive
      });
    } catch (err) {
      setError(err?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for department head assignment
  const fetchEmployees = async () => {
    try {
      // You'll need to implement this API endpoint
      // const response = await EmployeesApi.getAll();
      // setEmployees(response.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // Create new department
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await DepartmentsApi.create(formData);

      // Access nested department data safely
      if (response?.data?.department) {
        setDepartments(prev => [...prev, response.data.department]);
        resetForm();
        setShowForm(false);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  // Update department
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDepartment) return;

    setLoading(true);
    setError('');

    try {
      const response = await DepartmentsApi.update(editingDepartment._id, formData);
      if (response?.data?.department) {
        setDepartments(prev => prev.map(dept =>
          dept._id === editingDepartment._id ? response.data.department : dept
        ));
        resetForm();
        setEditingDepartment(null);
        setShowForm(false);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;

    setLoading(true);
    setError('');

    try {
      await DepartmentsApi.delete(id);
      setDepartments(prev => prev.filter(dept => dept._id !== id));
    } catch (err) {
      setError(err?.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  // Toggle department active/inactive status
  const handleToggleStatus = async (deptId) => {
    setLoading(true);
    setError('');
    try {
      const response = await DepartmentsApi.toggleStatus(deptId);
      if (response?.data?.department) {
        setDepartments(prev =>
          prev.map(dept =>
            dept._id === deptId ? response.data.department : dept
          )
        );
      } else {
        setError('Failed to toggle status');
      }
    } catch (err) {
      setError(err?.message || 'Failed to change department status');
    } finally {
      setLoading(false);
    }
  };

  // Edit department
  const handleEdit = (department) => {
    if (!department) return;
    
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      head: department.head?._id || ''
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      head: ''
    });
    setEditingDepartment(null);
  };

  const handleMenuToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data on component mount
  useEffect(() => {
    if (admin && mounted) {
      fetchDepartments();
      fetchEmployees();
    }
  }, [admin, mounted]);

  // Don't render until mounted to prevent SSR issues
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

  // Loading / Unauthorized states
  if (adminLoading) {
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

  if (!admin) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        <Typography variant="h6">You are not authorized to access this page.</Typography>
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
      />

      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: sidebarWidth,
        background: themeColors.background,
        minWidth: 0 // Prevents overflow issues
      }}>
        <Navbar
          onMenuClick={handleMenuToggle}
          isCollapsed={sidebarCollapsed}
          isDarkMode={isDarkMode}
          admin={admin}
        />

        {/* Main content */}
        <Box
          component="main"
          sx={{
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
                <BusinessIcon sx={{ 
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
                    Department Management
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: themeColors.textSecondary,
                    fontWeight: 400
                  }}>
                    Manage and organize your company departments
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
                            Total Departments
                          </Typography>
                        </Box>
                        <BusinessIcon sx={{ 
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
                            {stats.active}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                            Active Departments
                          </Typography>
                        </Box>
                        <GroupsIcon sx={{ 
                          fontSize: 40, 
                          color: 'success.main',
                          opacity: 0.8
                        }} />
                      </Box>
                    </StatCard>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatCard color="warning">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                            {stats.inactive}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                            Inactive Departments
                          </Typography>
                        </Box>
                        <BusinessIcon sx={{ 
                          fontSize: 40, 
                          color: 'warning.main',
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
                    onClick={() => setShowForm(true)}
                  >
                    Add Department
                  </ActionButton>
                  
                  <ActionButton
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchDepartments}
                    disabled={loading}
                  >
                    Refresh
                  </ActionButton>
                </Stack>
              </Box>
            </CardContent>
          </GradientCard>

          {/* Search and Filters */}
          <GradientCard sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: themeColors.textPrimary,
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon sx={{ mr: 1 }} />
                Search & Filter
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search departments by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </CardContent>
          </GradientCard>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                '& .MuiAlert-message': {
                  color: themeColors.textPrimary,
                }
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Enhanced Departments Table */}
          <GradientCard>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <>
                  {filteredDepartments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <BusinessIcon sx={{ fontSize: 64, color: themeColors.textSecondary, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ color: themeColors.textPrimary, mb: 1 }}>
                        No Departments Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3 }}>
                        {searchTerm ? 'No departments match your search criteria.' : 'Get started by creating your first department.'}
                      </Typography>
                      <ActionButton
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowForm(true)}
                      >
                        Create Department
                      </ActionButton>
                    </Box>
                  ) : (
                    <>
                      <StyledTableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ 
                                color: themeColors.textPrimary, 
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                py: 2
                              }}>Department</TableCell>
                              <TableCell sx={{ 
                                color: themeColors.textPrimary, 
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                py: 2
                              }}>Code</TableCell>
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
                              }}>Employees</TableCell>
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
                            {filteredDepartments.map((department) => (
                              <TableRow
                                key={department?._id || Math.random()}
                                hover
                                sx={{
                                  '&:hover': {
                                    backgroundColor: themeColors.hoverBg,
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
                                    <BusinessIcon sx={{ 
                                      mr: 1, 
                                      fontSize: 20,
                                      color: themeColors.accent
                                    }} />
                                    {department?.name || 'N/A'}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary }}>
                                  <Chip
                                    icon={<CodeIcon />}
                                    label={department?.code || 'N/A'}
                                    variant="outlined"
                                    size="small"
                                    sx={{ borderRadius: '6px' }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary }}>
                                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                    {department?.description || '—'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<GroupsIcon />}
                                    label={department?.employeeCount || 0}
                                    color="primary"
                                    size="small"
                                    sx={{ 
                                      borderRadius: '6px',
                                      fontWeight: 600
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={department?.isActive ? 'Active' : 'Inactive'}
                                    color={department?.isActive ? 'success' : 'error'}
                                    size="small"
                                    onClick={() => department?._id && handleToggleStatus(department._id)}
                                    sx={{ 
                                      borderRadius: '6px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.8
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleEdit(department)}
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
                                      onClick={() => department?._id && handleDelete(department._id)}
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
                            ))}
                          </TableBody>
                        </Table>
                      </StyledTableContainer>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                          Showing {filteredDepartments.length} of {departments.length} departments
                        </Typography>
                        {searchTerm && (
                          <Button
                            onClick={() => setSearchTerm('')}
                            sx={{ color: themeColors.accent }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Box>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </GradientCard>

          {/* Enhanced Department Form Modal */}
          <Dialog
            open={showForm}
            onClose={() => {
              setShowForm(false);
              resetForm();
            }}
            maxWidth="sm"
            fullWidth
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
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {editingDepartment ? (
                <>
                  <EditIcon color="primary" />
                  Edit Department
                </>
              ) : (
                <>
                  <AddIcon color="success" />
                  Add New Department
                </>
              )}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Department Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: themeColors.textSecondary }} />,
                  }}
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

                <TextField
                  fullWidth
                  label="Department Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <CodeIcon sx={{ mr: 1, color: themeColors.textSecondary }} />,
                  }}
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

                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ 
                      mr: 1, 
                      color: themeColors.textSecondary,
                      alignSelf: 'flex-start',
                      mt: 1
                    }} />,
                  }}
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

                <FormControl fullWidth>
                  <InputLabel sx={{ color: themeColors.textSecondary }}>
                    Department Head
                  </InputLabel>
                  <Select
                    name="head"
                    value={formData.head}
                    onChange={handleInputChange}
                    sx={{
                      borderRadius: '8px',
                      color: themeColors.textPrimary,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.accent },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.accent },
                    }}
                  >
                    <MenuItem value="">Select Department Head</MenuItem>
                    {employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${themeColors.border}` }}>
              <Button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
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
                onClick={editingDepartment ? handleUpdate : handleCreate}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
              </ActionButton>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default DepartmentManager;