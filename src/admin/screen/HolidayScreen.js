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
  Pagination as MuiPagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useContext } from 'react';
import holidayApi from '../api/HolidayApi';
import { useTheme } from '../context/ThemeContext';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(2),
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

  const { enqueueSnackbar } = useSnackbar();

  const holidayTypes = ['National', 'Festival', 'Regional', 'Religious'];

  // Theme configuration using your custom theme
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e293b" : "white",
    textPrimary: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    accent: isDarkMode ? "#3b82f6" : "#2563eb",
    hoverBg: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
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

  // Your existing handlers
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
          backgroundColor: themeColors.background,
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
        backgroundColor: themeColors.background
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
          backgroundColor: themeColors.background
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
              padding: '30px',
              paddingTop: '94px',
              transition: 'all 0.3s ease',
              backgroundColor: themeColors.background
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "8px",
                color: themeColors.textPrimary
              }}>
                Holiday Management
              </h1>
              <p style={{
                color: themeColors.textSecondary,
                fontSize: "16px"
              }}>
                Manage company holidays and observances
              </p>
            </div>

            {/* Filters */}
            <StyledCard sx={{
              backgroundColor: themeColors.cardBg,
              border: `1px solid ${themeColors.border}`
            }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: themeColors.textSecondary }}>Year</InputLabel>
                    <Select
                      value={filters.year}
                      label="Year"
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      sx={{
                        color: themeColors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.accent,
                        },
                        '& .MuiSvgIcon-root': {
                          color: themeColors.textSecondary,
                        },
                      }}
                    >
                      {Array.from({ length: 31 }, (_, i) => 2000 + i).map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: themeColors.textSecondary }}>Month</InputLabel>
                    <Select
                      value={filters.month}
                      label="Month"
                      onChange={(e) => handleFilterChange('month', e.target.value)}
                      sx={{
                        color: themeColors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.accent,
                        },
                        '& .MuiSvgIcon-root': {
                          color: themeColors.textSecondary,
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

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: themeColors.textSecondary }}>Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Type"
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      sx={{
                        color: themeColors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.accent,
                        },
                        '& .MuiSvgIcon-root': {
                          color: themeColors.textSecondary,
                        },
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {holidayTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    placeholder="Search holidays..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: themeColors.textSecondary }} />
                    }}
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        color: themeColors.textPrimary,
                        '& fieldset': {
                          borderColor: themeColors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: themeColors.accent,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeColors.accent,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: themeColors.textSecondary,
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: themeColors.textSecondary,
                        opacity: 0.7,
                      },
                    }}
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={applyFilters}
                    >
                      Filter
                    </Button>
                    <Button variant="outlined" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={openCreateModal}
                    >
                      Add Holiday
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => setOpenImportModal(true)}
                    >
                      Import Holidays
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </StyledCard>

            <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Bulk Import Holidays</DialogTitle>
              <DialogContent>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please upload a CSV file with columns: name, date (YYYY-MM-DD), description, type.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenImportModal(false)}>Cancel</Button>
                <Button
                  disabled={!importFile || importLoading}
                  onClick={async () => {
                    setImportLoading(true);
                    try {
                      const response = await holidayApi.bulkImportHolidays(importFile);
                      if (response.success) {
                        enqueueSnackbar(`Imported ${response.imported} holidays. Errors: ${response.errors}`, { variant: 'success' });
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
                >
                  {importLoading ? <CircularProgress size={24} /> : 'Import'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Holidays Table */}
            <StyledCard sx={{
              backgroundColor: themeColors.cardBg,
              border: `1px solid ${themeColors.border}`
            }}>
              <CardContent>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {holidays.length === 0 ? (
                      <Alert severity="info">
                        No holidays found matching your criteria.
                      </Alert>
                    ) : (
                      <>
                        <StyledTableContainer component={Paper} sx={{ backgroundColor: themeColors.cardBg }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right" sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {holidays.map((holiday) => (
                                <TableRow
                                  key={holiday._id}
                                  hover
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: themeColors.hoverBg,
                                    }
                                  }}
                                >
                                  <TableCell sx={{ color: themeColors.textPrimary }}>{holiday.name}</TableCell>
                                  <TableCell sx={{ color: themeColors.textPrimary }}>{formatDate(holiday.date)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={holiday.type}
                                      color={getTypeColor(holiday.type)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell sx={{ color: themeColors.textPrimary }}>{holiday.description || '-'}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={holiday.isActive ? 'Active' : 'Inactive'}
                                      color={holiday.isActive ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      color="primary"
                                      onClick={() => openEditModal(holiday)}
                                      size="small"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      color="error"
                                      onClick={() => {
                                        setSelectedHoliday(holiday);
                                        setOpenConfirm(true);
                                      }}
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </StyledTableContainer>

                        {pagination.pages > 1 && (
                          <Box display="flex" justifyContent="center" mt={2}>
                            <MuiPagination
                              count={pagination.pages}
                              page={pagination.current}
                              onChange={handlePageChange}
                              color="primary"
                              sx={{
                                '& .MuiPaginationItem-root': {
                                  color: themeColors.textPrimary,
                                  borderColor: themeColors.border,
                                },
                                '& .MuiPaginationItem-root.Mui-selected': {
                                  backgroundColor: themeColors.accent,
                                  color: 'white',
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
            </StyledCard>

            {/* Modals */}
            <Dialog
              open={openModal}
              onClose={() => setOpenModal(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  backgroundColor: themeColors.cardBg,
                  backgroundImage: 'none',
                }
              }}
            >
              <DialogTitle sx={{ color: themeColors.textPrimary }}>
                {actionType === 'create' ? 'Add New Holiday' : 'Edit Holiday'}
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: themeColors.textPrimary,
                        '& fieldset': {
                          borderColor: themeColors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: themeColors.accent,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeColors.accent,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: themeColors.textSecondary,
                      },
                    }}
                  />

                  <DatePicker
                    label="Date"
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
                            color: themeColors.textPrimary,
                            '& fieldset': {
                              borderColor: themeColors.border,
                            },
                            '&:hover fieldset': {
                              borderColor: themeColors.accent,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: themeColors.accent,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: themeColors.textSecondary,
                          },
                        }}
                      />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: themeColors.textSecondary }}>Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      sx={{
                        color: themeColors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeColors.accent,
                        },
                        '& .MuiSvgIcon-root': {
                          color: themeColors.textSecondary,
                        },
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
                        color: themeColors.textPrimary,
                        '& fieldset': {
                          borderColor: themeColors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: themeColors.accent,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeColors.accent,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: themeColors.textSecondary,
                      },
                    }}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenModal(false)}
                  sx={{ color: themeColors.textSecondary }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained">
                  {actionType === 'create' ? 'Create' : 'Update'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
              open={openConfirm}
              onClose={() => setOpenConfirm(false)}
              maxWidth="sm"
              PaperProps={{
                sx: {
                  backgroundColor: themeColors.cardBg,
                  backgroundImage: 'none',
                }
              }}
            >
              <DialogTitle sx={{ color: themeColors.textPrimary }}>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: themeColors.textSecondary }}>
                  Are you sure you want to delete "<strong style={{ color: themeColors.textPrimary }}>{selectedHoliday?.name}</strong>"?
                  This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenConfirm(false)}
                  sx={{ color: themeColors.textSecondary }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleDelete(selectedHoliday?._id)} color="error" variant="contained">
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