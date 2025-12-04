// src/admin/screen/AboutScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from "../context/AdminContext";
import AboutApi from '../api/AboutApi';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { useTheme } from '../context/ThemeContext';
import {
    Box,
    Container,
    Grid,
    Typography,
    Avatar,
    IconButton,
    Button,
    CircularProgress,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Paper,
    Tooltip,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Alert,
    Card,
    CardContent,
    useMediaQuery,
} from '@mui/material';
import {
    RocketLaunch as RocketIcon,
    Visibility as VisionIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Instagram as InstagramIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Groups as TeamIcon,
    Star as StarIcon,
    ExpandMore as ExpandMoreIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    EmojiEvents as AchievementIcon,
    Business as BusinessIcon,
    Diversity3 as DiversityIcon,
    History as HistoryIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

// ---------------------- Styled Components ----------------------
const GlassCard = styled(motion(Paper))(({ theme }) => ({
    backdropFilter: 'blur(20px) saturate(180%)',
    background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.85)} 0%, 
    ${alpha(theme.palette.background.paper, 0.65)} 100%)`,
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    borderRadius: '24px',
    padding: theme.spacing(3),
    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.08)}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main})`,
        borderRadius: '24px 24px 0 0',
    },
    '&:hover': {
        transform: 'translateY(-8px) scale(1.01)',
        boxShadow: `0 30px 80px ${alpha(theme.palette.common.black, 0.15)}`,
        borderColor: alpha(theme.palette.primary.main, 0.3),
    },
}));

const TeamMemberCard = styled(GlassCard)(({ theme }) => ({
    width: 280,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2.5),
    textAlign: 'center',
}));

const StatCard = styled(GlassCard)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(3),
    minHeight: 140,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
}));

const SectionTitle = ({ children, subtitle, icon: Icon }) => {
    const { isDarkMode } = useTheme();

    return (
        <Box sx={{ mb: 3, position: 'relative' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                {Icon && (
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, 
                ${isDarkMode ? alpha('#3b82f6', 0.2) : alpha('#3b82f6', 0.1)}, 
                ${isDarkMode ? alpha('#8b5cf6', 0.2) : alpha('#8b5cf6', 0.1)})`,
                            color: isDarkMode ? '#60a5fa' : '#3b82f6',
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                )}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: isDarkMode
                            ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                            : 'linear-gradient(45deg, #1e40af, #7c3aed)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.5px',
                    }}
                >
                    {children}
                </Typography>
            </Stack>
            {subtitle && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                        ml: Icon ? 6 : 0,
                        maxWidth: '600px',
                        lineHeight: 1.6,
                    }}
                >
                    {subtitle}
                </Typography>
            )}
            <Divider
                sx={{
                    mt: 2,
                    background: `linear-gradient(90deg, 
            ${isDarkMode ? alpha('#3b82f6', 0.3) : alpha('#3b82f6', 0.2)}, 
            ${isDarkMode ? alpha('#8b5cf6', 0.3) : alpha('#8b5cf6', 0.2)}, 
            transparent)`
                }}
            />
        </Box>
    );
};

// ---------------------- Component ----------------------
const AboutScreen = () => {
    // Core state
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { admin } = useContext(AdminContext) || {};
    const { isDarkMode } = useTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');

    // UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        values: false,
        stats: false,
        timeline: false,
        achievements: false,
    });

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        slogan: '',
        description: '',
        mission: '',
        vision: '',
        values: [],
        stats: [],
        timeline: [],
        achievements: [],
    });

    const [memberData, setMemberData] = useState({
        name: '',
        role: '',
        bio: '',
        email: '',
        linkedin: '',
        order: 1,
        imageUrl: '',
    });

    // Temporary arrays for editing
    const [tempValues, setTempValues] = useState([]);
    const [tempStats, setTempStats] = useState([]);
    const [tempTimeline, setTempTimeline] = useState([]);
    const [tempAchievements, setTempAchievements] = useState([]);
    const [newValue, setNewValue] = useState('');
    const [newStat, setNewStat] = useState({ label: '', value: '', suffix: '' });
    const [newTimeline, setNewTimeline] = useState({ year: '', title: '', description: '' });
    const [newAchievement, setNewAchievement] = useState('');
    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    // Fetch data
    const fetchAboutData = async () => {
        try {
            setLoading(true);
            const response = await AboutApi.getAboutInfo();
            const mainData = response?.data?.data || response?.data || null;

            if (response?.success && mainData) {
                setAboutData(mainData);
                const aboutSection = mainData.about || mainData;

                setFormData({
                    companyName: aboutSection.companyName || '',
                    slogan: aboutSection.slogan || '',
                    description: aboutSection.description || '',
                    mission: aboutSection.mission || '',
                    vision: aboutSection.vision || '',
                    values: aboutSection.values || [],
                    stats: aboutSection.stats || [],
                    timeline: aboutSection.timeline || [],
                    achievements: aboutSection.achievements || [],
                });

                setTempValues(aboutSection.values || []);
                setTempStats(aboutSection.stats || []);
                setTempTimeline(aboutSection.timeline || []);
                setTempAchievements(aboutSection.achievements || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setSnackbar({ open: true, message: `Error: ${err.message || err}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAboutData();
    }, []);

    // Handlers
    const handleMenuToggle = () => setSidebarCollapsed(prev => !prev);
    const onRefresh = () => fetchAboutData();
    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberFormChange = (e) => {
        const { name, value } = e.target;
        setMemberData(prev => ({ ...prev, [name]: value }));
    };

    // Array item handlers
    const handleAddValue = () => {
        if (newValue.trim()) {
            setTempValues([...tempValues, newValue.trim()]);
            setNewValue('');
        }
    };

    const handleRemoveValue = (index) => {
        setTempValues(tempValues.filter((_, i) => i !== index));
    };

    const handleAddStat = () => {
        if (newStat.label.trim() && newStat.value.trim()) {
            setTempStats([...tempStats, { ...newStat }]);
            setNewStat({ label: '', value: '', suffix: '' });
        }
    };

    const handleRemoveStat = (index) => {
        setTempStats(tempStats.filter((_, i) => i !== index));
    };

    const handleAddTimeline = () => {
        if (newTimeline.year && newTimeline.title.trim() && newTimeline.description.trim()) {
            setTempTimeline([...tempTimeline, { ...newTimeline }]);
            setNewTimeline({ year: '', title: '', description: '' });
        }
    };

    const handleRemoveTimeline = (index) => {
        setTempTimeline(tempTimeline.filter((_, i) => i !== index));
    };

    const handleAddAchievement = () => {
        if (newAchievement.trim()) {
            setTempAchievements([...tempAchievements, newAchievement.trim()]);
            setNewAchievement('');
        }
    };

    const handleRemoveAchievement = (index) => {
        setTempAchievements(tempAchievements.filter((_, i) => i !== index));
    };

    const handleAddTeamMember = async () => {
        try {
            const payload = { ...memberData };
            const response = await AboutApi.addTeamMember(payload, null);
            if (response?.success) {
                setSnackbar({ open: true, message: 'Team member added successfully! 🎉', severity: 'success' });
                setAddMemberDialogOpen(false);
                setMemberData({ name: '', role: '', bio: '', email: '', linkedin: '', order: 1, imageUrl: '' });
                fetchAboutData();
            } else {
                throw new Error(response?.message || 'Add failed');
            }
        } catch (err) {
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        }
    };

    const handleDeleteTeamMember = async (id) => {
        if (!window.confirm('Are you sure you want to delete this team member?')) return;
        try {
            const response = await AboutApi.deleteTeamMember(id);
            if (response?.success) {
                setSnackbar({ open: true, message: 'Team member removed', severity: 'success' });
                fetchAboutData();
            } else {
                throw new Error(response?.message || 'Delete failed');
            }
        } catch (err) {
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        }
    };

    const handleUpdateAbout = async () => {
        try {
            const payload = {
                companyName: formData.companyName,
                slogan: formData.slogan,
                description: formData.description,
                mission: formData.mission,
                vision: formData.vision,
                values: tempValues,
                stats: tempStats,
                timeline: tempTimeline,
                achievements: tempAchievements,
            };

            const response = await AboutApi.updateAboutContent(payload);
            if (response?.success) {
                setSnackbar({ open: true, message: 'About content updated successfully! ✨', severity: 'success' });
                setEditDialogOpen(false);
                fetchAboutData();
            } else {
                throw new Error(response?.message || 'Update failed');
            }
        } catch (err) {
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Data extraction
    const values = aboutData?.values ?? aboutData?.about?.values ?? [];
    const stats = aboutData?.stats ?? aboutData?.about?.stats ?? [];
    const timeline = aboutData?.timeline ?? aboutData?.about?.timeline ?? [];
    const team = aboutData?.team ?? aboutData?.about?.team ?? [];
    const achievements = aboutData?.achievements ?? aboutData?.about?.achievements ?? [];

    const isAdmin = AboutApi.isAuthenticated && AboutApi.isAuthenticated();

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
            overflow: 'hidden',
        }}>
            {/* Sidebar - Always visible, not loading */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleMenuToggle}
                isDarkMode={isDarkMode}
            />

            {/* Main Content */}
            <Box sx={{
                flex: 1,
                marginLeft: sidebarWidth,
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease',
                overflow: 'auto',
            }}>
                {/* Navbar - Always visible, not loading */}
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    admin={admin}
                />

                {/* Main Content Area - Only this part loads */}
                <Box sx={{
                    flex: 1,
                    padding: { xs: 2, sm: 3, md: 4 },
                    paddingTop: '80px',
                    overflow: 'auto',
                    background: isDarkMode
                        ? 'radial-gradient(circle at 20% 50%, rgba(30, 64, 175, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)'
                        : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
                    position: 'relative',
                }}>

                    {/* Loading Spinner - Only for content area */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                            <CircularProgress
                                size={60}
                                thickness={4}
                                sx={{
                                    color: isDarkMode ? '#3b82f6' : '#1e40af',
                                }}
                            />
                        </Box>
                    ) : (
                        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                            {/* Header */}
                            <Box sx={{
                                mb: 2,
                                position: 'relative',
                                padding: 3,
                                borderRadius: 4,
                                background: isDarkMode
                                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                backdropFilter: 'blur(10px)',
                            }}>
                                <Box sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}>
                                    <Box>
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                fontWeight: 900,
                                                background: isDarkMode
                                                    ? 'linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6)'
                                                    : 'linear-gradient(45deg, #1e40af, #7c3aed, #db2777)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                letterSpacing: '-1px',
                                                mb: 1,
                                            }}
                                        >
                                            {aboutData?.companyName ?? aboutData?.about?.companyName ?? 'Company Name'}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight: 400,
                                                maxWidth: '600px',
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {aboutData?.slogan ?? aboutData?.about?.slogan ?? 'Your company slogan goes here.'}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Refresh Data">
                                            <IconButton
                                                onClick={onRefresh}
                                                sx={{
                                                    background: isDarkMode
                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                        : 'rgba(59, 130, 246, 0.1)',
                                                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                    '&:hover': {
                                                        background: isDarkMode
                                                            ? 'rgba(255, 255, 255, 0.2)'
                                                            : 'rgba(59, 130, 246, 0.2)',
                                                    },
                                                }}
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {isAdmin && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => {
                                                        const aboutSection = aboutData?.about || aboutData || {};
                                                        setFormData({
                                                            companyName: aboutSection.companyName || '',
                                                            slogan: aboutSection.slogan || '',
                                                            description: aboutSection.description || '',
                                                            mission: aboutSection.mission || '',
                                                            vision: aboutSection.vision || '',
                                                            values: aboutSection.values || [],
                                                            stats: aboutSection.stats || [],
                                                            timeline: aboutSection.timeline || [],
                                                            achievements: aboutSection.achievements || [],
                                                        });
                                                        setTempValues(aboutSection.values || []);
                                                        setTempStats(aboutSection.stats || []);
                                                        setTempTimeline(aboutSection.timeline || []);
                                                        setTempAchievements(aboutSection.achievements || []);
                                                        setEditDialogOpen(true);
                                                    }}
                                                    sx={{
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                                                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                                                        '&:hover': {
                                                            boxShadow: '0 15px 40px rgba(59, 130, 246, 0.4)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                    }}
                                                >
                                                    Edit Content
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => setAddMemberDialogOpen(true)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        borderColor: isDarkMode ? '#4f46e5' : '#3b82f6',
                                                        color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                        '&:hover': {
                                                            borderColor: isDarkMode ? '#60a5fa' : '#1d4ed8',
                                                            background: isDarkMode
                                                                ? 'rgba(96, 165, 250, 0.1)'
                                                                : 'rgba(59, 130, 246, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    Add Member
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>

                            {/* Main Content Grid */}
                            <Grid container spacing={3}>
                                {/* Left Column */}
                                <Grid item xs={12} lg={8}>
                                    <Stack spacing={3}>
                                        {/* About Section */}
                                        <GlassCard
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                {/* Icon Box */}
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #06b6d4, #0e7490)', // cyan vibes
                                                        color: 'white',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <BusinessIcon fontSize="medium" />
                                                </Box>

                                                {/* Content */}
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                        About Us
                                                    </Typography>

                                                    <Chip
                                                        label="Our Story"
                                                        size="small"
                                                        sx={{
                                                            mb: 1,
                                                            background: 'rgba(6, 182, 212, 0.1)',
                                                            color: isDarkMode ? '#67e8f9' : '#06b6d4',
                                                        }}
                                                    />

                                                    <Box
                                                        sx={{
                                                            '& p': {
                                                                mb: 2,
                                                                fontSize: '1.1rem',
                                                                lineHeight: 1.8,
                                                                color: 'text.primary',
                                                            },
                                                            '& a': {
                                                                color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                                textDecoration: 'none',
                                                                '&:hover': { textDecoration: 'underline' },
                                                            },
                                                        }}
                                                    >
                                                        {aboutData?.description ?? aboutData?.about?.description ? (
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: aboutData?.description ?? aboutData?.about?.description,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" color="text.secondary">
                                                                No description provided yet.
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </GlassCard>


                                        {/* Mission & Vision Cards */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <GlassCard
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.1 }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                                        <Box
                                                            sx={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                                color: 'white',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <RocketIcon fontSize="medium" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                                Our Mission
                                                            </Typography>
                                                            <Chip
                                                                label="Our Purpose"
                                                                size="small"
                                                                sx={{
                                                                    mb: 1,
                                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                                }}
                                                            />
                                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                                {aboutData?.mission ?? aboutData?.about?.mission ?? 'No mission statement available.'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </GlassCard>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <GlassCard
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                                        <Box
                                                            sx={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                                color: 'white',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <VisionIcon fontSize="medium" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                                Our Vision
                                                            </Typography>
                                                            <Chip
                                                                label="Future Goals"
                                                                size="small"
                                                                sx={{
                                                                    mb: 1,
                                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                                    color: isDarkMode ? '#a78bfa' : '#7c3aed',
                                                                }}
                                                            />
                                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                                {aboutData?.vision ?? aboutData?.about?.vision ?? 'No vision statement available.'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </GlassCard>
                                            </Grid>
                                        </Grid>

                                        {/* Core Values */}
                                        <GlassCard
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="flex-start">

                                                {/* Icon Box */}
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #ec4899, #db2777)', // sweet pink gradient
                                                        color: 'white',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <FavoriteIcon fontSize="medium" />
                                                </Box>

                                                {/* Content */}
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                        Core Values
                                                    </Typography>

                                                    <Chip
                                                        label="What We Stand For"
                                                        size="small"
                                                        sx={{
                                                            mb: 1,
                                                            background: 'rgba(236, 72, 153, 0.1)',
                                                            color: isDarkMode ? '#f9a8d4' : '#db2777',
                                                        }}
                                                    />

                                                    {/* Values List */}
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                                                        {values.length > 0 ? (
                                                            values.map((v, i) => (
                                                                <Chip
                                                                    key={i}
                                                                    label={v}
                                                                    variant="filled"
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        py: 1.2,
                                                                        px: 2,
                                                                        fontSize: '0.95rem',
                                                                        background: isDarkMode
                                                                            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(244, 114, 182, 0.18))'
                                                                            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.1))',
                                                                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                                                                        border: `1px solid ${isDarkMode
                                                                            ? 'rgba(244, 114, 182, 0.25)'
                                                                            : 'rgba(236, 72, 153, 0.2)'
                                                                            }`,
                                                                        transition: '0.2s',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                                                        },
                                                                    }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body1" color="text.secondary">
                                                                No values set yet.
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                            </Stack>
                                        </GlassCard>

                                        {/* Stats */}
                                        <GlassCard
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.25 }}
                                            sx={{ p: 2.5 }} // smaller padding
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">

                                                {/* Smaller Icon Box */}
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                        color: 'white',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <TrendingUpIcon fontSize="small" />
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        By The Numbers
                                                    </Typography>

                                                    <Chip
                                                        label="Impact"
                                                        size="small"
                                                        sx={{
                                                            mb: 1,
                                                            height: 22,
                                                            fontSize: '0.7rem',
                                                            background: 'rgba(59,130,246,0.1)',
                                                            color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                        }}
                                                    />

                                                    {/* Grid */}
                                                    <Grid container spacing={1.5}>
                                                        {stats.length > 0 ? (
                                                            stats.map((stat, idx) => (
                                                                <Grid item xs={12} md={3} key={idx}>
                                                                    <StatCard
                                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.3, delay: idx * 0.08 }}
                                                                        sx={{ p: 1.2 }}  // smaller card padding
                                                                    >
                                                                        <Typography
                                                                            variant="h4"
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                background: isDarkMode
                                                                                    ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                                                                                    : 'linear-gradient(45deg, #1e40af, #7c3aed)',
                                                                                WebkitBackgroundClip: 'text',
                                                                                WebkitTextFillColor: 'transparent',
                                                                                backgroundClip: 'text',
                                                                                lineHeight: 1.1,
                                                                                mb: 0.5,
                                                                            }}
                                                                        >
                                                                            {stat.value}
                                                                            {stat.suffix && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    variant="h6"
                                                                                    sx={{ fontWeight: 500 }}
                                                                                >
                                                                                    {stat.suffix}
                                                                                </Typography>
                                                                            )}
                                                                        </Typography>

                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                color: isDarkMode ? '#cbd5e1' : '#475569',
                                                                            }}
                                                                        >
                                                                            {stat.label}
                                                                        </Typography>
                                                                    </StatCard>
                                                                </Grid>
                                                            ))
                                                        ) : (
                                                            <Grid item xs={12}>
                                                                <GlassCard sx={{ p: 2 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        No statistics yet.
                                                                    </Typography>
                                                                </GlassCard>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            </Stack>
                                        </GlassCard>
                                        {/* Achievements */}
                                        <GlassCard
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.3 }}
                                            sx={{ p: 2.5 }}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">

                                                {/* Compact Icon Box */}
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', // gold vibe
                                                        color: 'white',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <AchievementIcon fontSize="small" />
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        Achievements
                                                    </Typography>

                                                    <Chip
                                                        label="Milestones"
                                                        size="small"
                                                        sx={{
                                                            mb: 1.2,
                                                            height: 22,
                                                            fontSize: '0.7rem',
                                                            background: 'rgba(245, 158, 11, 0.1)',
                                                            color: isDarkMode ? '#fbbf24' : '#d97706',
                                                        }}
                                                    />

                                                    {/* Achievements List */}
                                                    {achievements.length > 0 ? (
                                                        <List dense sx={{ mt: 0.5 }}>
                                                            {achievements.map((ach, i) => (
                                                                <ListItem
                                                                    key={i}
                                                                    sx={{
                                                                        pl: 0,
                                                                        py: 1,
                                                                        borderBottom: `1px solid ${isDarkMode
                                                                            ? 'rgba(255,255,255,0.06)'
                                                                            : 'rgba(0,0,0,0.06)'
                                                                            }`,
                                                                        '&:last-child': { borderBottom: 'none' },
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={
                                                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                                                <StarIcon
                                                                                    fontSize="small"
                                                                                    sx={{
                                                                                        color: isDarkMode ? '#fbbf24' : '#f59e0b',
                                                                                    }}
                                                                                />
                                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                    {ach}
                                                                                </Typography>
                                                                            </Stack>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            No achievements listed yet.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </GlassCard>
                                    </Stack>
                                </Grid>

                                {/* Right Column - Sticky */}
                                <Grid item xs={12} lg={4}>
                                    <Box sx={{ position: 'sticky', top: 80, }}>
                                        <Stack spacing={4}>
                                            <GlassCard
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                    {/* Icon Box */}
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(135deg, #06b6d4, #0e7490)', // cyan vibes
                                                            color: 'white',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <BusinessIcon fontSize="medium" />
                                                    </Box>

                                                    {/* Content */}
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                            Team Members
                                                        </Typography>

                                                        <Chip
                                                            label="Meet the team powering our vision"
                                                            size="small"
                                                            sx={{
                                                                mb: 1,
                                                                background: 'rgba(6, 182, 212, 0.1)',
                                                                color: isDarkMode ? '#67e8f9' : '#06b6d4',
                                                            }}
                                                        />

                                                        <Box
                                                            sx={{
                                                                '& p': {
                                                                    mb: 2,
                                                                    fontSize: '1.1rem',
                                                                    lineHeight: 1.8,
                                                                    color: 'text.primary',
                                                                },
                                                                '& a': {
                                                                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                                    textDecoration: 'none',
                                                                    '&:hover': { textDecoration: 'underline' },
                                                                },
                                                            }}
                                                        >
                                                            {team.length > 0 ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
                                                                    {team
                                                                        .slice()
                                                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                                                        .map((member, index) => (
                                                                            <TeamMemberCard
                                                                                key={member._id ?? index}
                                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                                                                sx={{
                                                                                    position: 'relative',
                                                                                    borderRadius: 6,
                                                                                    overflow: 'hidden',
                                                                                    boxShadow: isDarkMode
                                                                                        ? '0 20px 60px rgba(0, 0, 0, 0.6)'
                                                                                        : '0 20px 60px rgba(0, 0, 0, 0.2)',
                                                                                    background: '#ffffff',
                                                                                    width: '100%',
                                                                                    maxWidth: 450,
                                                                                    mx: 'auto',
                                                                                }}
                                                                            >
                                                                                {/* 🔥 Red Header Background */}
                                                                                <Box
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        left: 0,
                                                                                        right: 0,
                                                                                        height: 180,
                                                                                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                                                        //   borderRadius: '40px 40px 0 0',
                                                                                    }}
                                                                                />

                                                                                {/* ❌ Delete Button */}
                                                                                {isAdmin && (
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="error"
                                                                                        sx={{
                                                                                            position: 'absolute',
                                                                                            right: 12,
                                                                                            top: 12,
                                                                                            zIndex: 5,
                                                                                            background: 'rgba(255,255,255,0.3)',
                                                                                            '&:hover': { background: 'rgba(255,255,255,0.5)' },
                                                                                        }}
                                                                                        onClick={() => handleDeleteTeamMember(member._id)}
                                                                                    >
                                                                                        <DeleteIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                )}

                                                                                {/* 🧑 Profile Image */}
                                                                                <Box
                                                                                    sx={{
                                                                                        position: 'relative',
                                                                                        zIndex: 2,
                                                                                        mt: 7,
                                                                                        display: 'flex',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                >
                                                                                    <Avatar
                                                                                        src={member.image ?? '/path/to/profile.jpg'}
                                                                                        alt={member.name}
                                                                                        sx={{
                                                                                            width: 140,
                                                                                            height: 140,
                                                                                            borderRadius: '50%',
                                                                                            border: '6px solid #ffffff',
                                                                                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                                                                        }}
                                                                                    />
                                                                                </Box>

                                                                                {/* 📝 Content */}
                                                                                <Box sx={{ textAlign: 'center', p: 4, pt: 3 }}>

                                                                                    {/* Name */}
                                                                                    <Typography
                                                                                        variant="h4"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            color: '#1f2937',
                                                                                            mt: 1,
                                                                                        }}
                                                                                    >
                                                                                        {member.name ?? 'Ndife Samuel'}
                                                                                    </Typography>

                                                                                    {/* Role */}
                                                                                    <Typography
                                                                                        variant="subtitle1"
                                                                                        sx={{
                                                                                            color: '#4b5563',
                                                                                            fontWeight: 600,
                                                                                            mt: 0.5,
                                                                                        }}
                                                                                    >
                                                                                        {member.role ?? 'Product Design'}
                                                                                    </Typography>

                                                                                    {/* 🔻 Red Divider */}
                                                                                    <Box
                                                                                        sx={{
                                                                                            height: 3,
                                                                                            width: '60%',
                                                                                            background: '#dc2626',
                                                                                            mx: 'auto',
                                                                                            my: 2.5,
                                                                                        }}
                                                                                    />

                                                                                    {/* Description */}
                                                                                    {member.about && (
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            sx={{
                                                                                                color: '#374151',
                                                                                                lineHeight: 1.6,
                                                                                                px: 1,
                                                                                            }}
                                                                                        >
                                                                                            {member.about}
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Stack
                                                                                        direction="row"
                                                                                        spacing={2}
                                                                                        justifyContent="center"
                                                                                        sx={{ mt: 3 }}
                                                                                    >
                                                                                        {member.linkedin && (
                                                                                            <IconButton
                                                                                                onClick={() => window.open(member.linkedin, '_blank')}
                                                                                                sx={{
                                                                                                    width: 45,
                                                                                                    height: 45,
                                                                                                    borderRadius: '50%',
                                                                                                    background: '#dc2626',
                                                                                                    transition: '0.2s',
                                                                                                    '&:hover': { transform: 'scale(1.1)' },
                                                                                                }}
                                                                                            >
                                                                                                <LinkedInIcon size={22} color="#ce1515ff" />
                                                                                            </IconButton>
                                                                                        )}

                                                                                        {/* {member.twitter && (
                                                                                            <IconButton
                                                                                                onClick={() => window.open(member.twitter, '_blank')}
                                                                                                sx={{
                                                                                                    width: 45,
                                                                                                    height: 45,
                                                                                                    borderRadius: '50%',
                                                                                                    background: '#dc2626',
                                                                                                    transition: '0.2s',
                                                                                                    '&:hover': { transform: 'scale(1.1)' },
                                                                                                }}
                                                                                            >
                                                                                                <Twitter size={22} color="#fff" />
                                                                                            </IconButton>
                                                                                        )}

                                                                                        {member.facebook && (
                                                                                            <IconButton
                                                                                                onClick={() => window.open(member.facebook, '_blank')}
                                                                                                sx={{
                                                                                                    width: 45,
                                                                                                    height: 45,
                                                                                                    borderRadius: '50%',
                                                                                                    background: '#dc2626',
                                                                                                    transition: '0.2s',
                                                                                                    '&:hover': { transform: 'scale(1.1)' },
                                                                                                }}
                                                                                            >
                                                                                                <Facebook size={22} color="#fff" />
                                                                                            </IconButton>
                                                                                        )} */}
                                                                                    </Stack>
                                                                                </Box>
                                                                            </TeamMemberCard>

                                                                        ))}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                                                    <TeamIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                                        No team members yet.
                                                                    </Typography>

                                                                    {isAdmin && (
                                                                        <Button
                                                                            variant="contained"
                                                                            startIcon={<AddIcon />}
                                                                            onClick={() => setAddMemberDialogOpen(true)}
                                                                            sx={{
                                                                                borderRadius: 2,
                                                                                fontSize: '0.8rem',
                                                                                py: 0.7,
                                                                                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                                                                            }}
                                                                        >
                                                                            Add Member
                                                                        </Button>
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Stack>
                                            </GlassCard>

                                            {/* Timeline Section */}
                                            <GlassCard
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="flex-start">

                                                    {/* Icon Box */}
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(135deg, #ec4899, #db2777)', // sweet pink gradient
                                                            color: 'white',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <TimelineIcon fontSize="medium" />
                                                    </Box>

                                                    {/* Content */}
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                            Timeline
                                                        </Typography>

                                                        <Chip
                                                            label="Milestones & Achievements"
                                                            size="small"
                                                            sx={{
                                                                mb: 1,
                                                                background: 'rgba(236, 72, 153, 0.1)',
                                                                color: isDarkMode ? '#f9a8d4' : '#db2777',
                                                            }}
                                                        />

                                                        {/* Values List */}
                                                        <Box sx={{ mt: 1.5 }}>
                                                            {timeline.length > 0 ? (
                                                                timeline.map((t, i) => (
                                                                    <Box
                                                                        key={t._id ?? i}
                                                                        sx={{
                                                                            mb: 1.8,
                                                                            position: 'relative',
                                                                            pl: 2.5,
                                                                            '&::before': {
                                                                                content: '""',
                                                                                position: 'absolute',
                                                                                left: 6,
                                                                                top: 0,
                                                                                bottom: 0,
                                                                                width: '1.5px',
                                                                                background: isDarkMode
                                                                                    ? 'linear-gradient(to bottom, #3b82f6, transparent)'
                                                                                    : 'linear-gradient(to bottom, #1d4ed8, transparent)',
                                                                            },
                                                                            '&::after': {
                                                                                content: '""',
                                                                                position: 'absolute',
                                                                                left: 3,
                                                                                top: 6,
                                                                                width: 6,
                                                                                height: 6,
                                                                                borderRadius: '50%',
                                                                                background: isDarkMode ? '#60a5fa' : '#3b82f6',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="subtitle1"
                                                                            sx={{
                                                                                fontWeight: 700,
                                                                                color: isDarkMode ? '#60a5fa' : '#1d4ed8',
                                                                                mb: 0.2,
                                                                            }}
                                                                        >
                                                                            {t.year}
                                                                        </Typography>

                                                                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.3 }}>
                                                                            {t.title}
                                                                        </Typography>

                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}
                                                                        >
                                                                            {t.description}
                                                                        </Typography>
                                                                    </Box>
                                                                ))
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No timeline entries yet.
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Stack>
                                            </GlassCard>
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Container>
                    )}
                </Box>
            </Box>

            {/* ---------------------- Edit Dialog ---------------------- */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: isDarkMode
                            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        maxHeight: '90vh',
                    },
                }}
            >
                <DialogTitle sx={{
                    background: `linear-gradient(90deg, ${isDarkMode ? '#3b82f6' : '#1d4ed8'}, ${isDarkMode ? '#8b5cf6' : '#7c3aed'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}>
                    Update About Content
                </DialogTitle>
                <DialogContent dividers sx={{ overflow: 'auto' }}>
                    <Grid container spacing={3} sx={{ pt: 2 }}>
                        {/* Basic Info */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <TextField
                                    name="companyName"
                                    label="Company Name"
                                    value={formData.companyName}
                                    onChange={handleFormChange}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                                <TextField
                                    name="slogan"
                                    label="Slogan"
                                    value={formData.slogan}
                                    onChange={handleFormChange}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                                <TextField
                                    name="mission"
                                    label="Mission"
                                    value={formData.mission}
                                    onChange={handleFormChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    variant="outlined"
                                />
                                <TextField
                                    name="vision"
                                    label="Vision"
                                    value={formData.vision}
                                    onChange={handleFormChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="description"
                                label="HTML Description"
                                value={formData.description}
                                onChange={handleFormChange}
                                fullWidth
                                multiline
                                rows={12}
                                size="small"
                                variant="outlined"
                                helperText="You can paste HTML here (e.g. <p>...</p>)"
                            />
                        </Grid>

                        {/* Values Section */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Core Values</Typography>
                                    <IconButton size="small" onClick={() => toggleSection('values')}>
                                        <ExpandMoreIcon sx={{ transform: expandedSections.values ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </IconButton>
                                </Box>
                                <Collapse in={expandedSections.values}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                placeholder="Add a new value"
                                                sx={{ flexGrow: 1 }}
                                                variant="outlined"
                                            />
                                            <Button variant="contained" onClick={handleAddValue}>Add</Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {tempValues.map((value, index) => (
                                                <Chip
                                                    key={index}
                                                    label={value}
                                                    onDelete={() => handleRemoveValue(index)}
                                                    variant="outlined"
                                                    sx={{ mb: 1 }}
                                                />
                                            ))}
                                        </Box>
                                    </Stack>
                                </Collapse>
                            </Paper>
                        </Grid>

                        {/* Stats Section */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Statistics</Typography>
                                    <IconButton size="small" onClick={() => toggleSection('stats')}>
                                        <ExpandMoreIcon sx={{ transform: expandedSections.stats ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </IconButton>
                                </Box>
                                <Collapse in={expandedSections.stats}>
                                    <Stack spacing={2}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={4}>
                                                <TextField
                                                    size="small"
                                                    value={newStat.label}
                                                    onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                                                    placeholder="Label"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    size="small"
                                                    value={newStat.value}
                                                    onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                                                    placeholder="Value"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    size="small"
                                                    value={newStat.suffix}
                                                    onChange={(e) => setNewStat({ ...newStat, suffix: e.target.value })}
                                                    placeholder="Suffix"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Button variant="contained" onClick={handleAddStat} fullWidth>Add</Button>
                                            </Grid>
                                        </Grid>
                                        {tempStats.map((stat, index) => (
                                            <Paper key={index} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2">
                                                        <strong>{stat.label}:</strong> {stat.value}{stat.suffix}
                                                    </Typography>
                                                </Box>
                                                <IconButton size="small" onClick={() => handleRemoveStat(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Paper>
                        </Grid>

                        {/* Timeline Section */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Timeline</Typography>
                                    <IconButton size="small" onClick={() => toggleSection('timeline')}>
                                        <ExpandMoreIcon sx={{ transform: expandedSections.timeline ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </IconButton>
                                </Box>
                                <Collapse in={expandedSections.timeline}>
                                    <Stack spacing={2}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={3}>
                                                <TextField
                                                    size="small"
                                                    value={newTimeline.year}
                                                    onChange={(e) => setNewTimeline({ ...newTimeline, year: e.target.value })}
                                                    placeholder="Year"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    size="small"
                                                    value={newTimeline.title}
                                                    onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                                                    placeholder="Title"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    size="small"
                                                    value={newTimeline.description}
                                                    onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                                                    placeholder="Description"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Button variant="contained" onClick={handleAddTimeline} fullWidth>Add</Button>
                                            </Grid>
                                        </Grid>
                                        {tempTimeline.map((item, index) => (
                                            <Paper key={index} sx={{ p: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="subtitle2">
                                                            <strong>{item.year}:</strong> {item.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.description}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton size="small" onClick={() => handleRemoveTimeline(index)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Paper>
                        </Grid>

                        {/* Achievements Section */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Achievements</Typography>
                                    <IconButton size="small" onClick={() => toggleSection('achievements')}>
                                        <ExpandMoreIcon sx={{ transform: expandedSections.achievements ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </IconButton>
                                </Box>
                                <Collapse in={expandedSections.achievements}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                value={newAchievement}
                                                onChange={(e) => setNewAchievement(e.target.value)}
                                                placeholder="Add a new achievement"
                                                sx={{ flexGrow: 1 }}
                                                variant="outlined"
                                            />
                                            <Button variant="contained" onClick={handleAddAchievement}>Add</Button>
                                        </Box>
                                        {tempAchievements.map((achievement, index) => (
                                            <Paper key={index} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">{achievement}</Typography>
                                                <IconButton size="small" onClick={() => handleRemoveAchievement(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateAbout}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        Update Content
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---------------------- Add Member Dialog ---------------------- */}
            <Dialog
                open={addMemberDialogOpen}
                onClose={() => setAddMemberDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: isDarkMode
                            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Add Team Member</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 2 }}>
                        <TextField
                            name="name"
                            label="Full Name *"
                            value={memberData.name}
                            onChange={handleMemberFormChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                        <TextField
                            name="role"
                            label="Role / Position *"
                            value={memberData.role}
                            onChange={handleMemberFormChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                        <TextField
                            name="bio"
                            label="Short Bio"
                            value={memberData.bio}
                            onChange={handleMemberFormChange}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            variant="outlined"
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    value={memberData.email}
                                    onChange={handleMemberFormChange}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    name="linkedin"
                                    label="LinkedIn URL"
                                    value={memberData.linkedin}
                                    onChange={handleMemberFormChange}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            name="imageUrl"
                            label="Image URL (optional)"
                            value={memberData.imageUrl}
                            onChange={handleMemberFormChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                        <TextField
                            name="order"
                            label="Display Order"
                            type="number"
                            value={memberData.order}
                            onChange={handleMemberFormChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddTeamMember}
                        sx={{
                            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                        }}
                    >
                        Add Member
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---------------------- Snackbar ---------------------- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        alignItems: 'center',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AboutScreen;