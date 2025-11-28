// src/components/FAQAdmin.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Tabs, Tab, Box, Button, TextField, Select, MenuItem,
    FormControl, InputLabel, Alert, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, Tooltip, Paper, 
    Typography, Chip, Divider, Card, CardContent, Container, 
    Stack, Accordion, AccordionSummary, AccordionDetails, Badge
} from "@mui/material";
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    ArrowUpward as UpIcon, ArrowDownward as DownIcon,
    Category as CategoryIcon, Help as HelpIcon, Search as SearchIcon,
    ExpandMore as ExpandMoreIcon, Visibility as ViewIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import faqApi from "../api/FAQApi";
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const TAB_CATEGORIES = 0;
const TAB_FAQS = 1;

const FAQPage = () => {
    // ────── Global state ──────
    const [tab, setTab] = useState(TAB_CATEGORIES);
    const [categories, setCategories] = useState([]);
    const [categoriesWithFaqs, setCategoriesWithFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategory, setExpandedCategory] = useState(null);

    // ────── Category form ──────
    const [catName, setCatName] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [editingCat, setEditingCat] = useState(null);
    const [catDialogOpen, setCatDialogOpen] = useState(false);

    // ────── FAQ form ──────
    const [faqQuestion, setFaqQuestion] = useState("");
    const [faqAnswer, setFaqAnswer] = useState("");
    const [faqCategory, setFaqCategory] = useState("");
    const [faqTags, setFaqTags] = useState("");
    const [faqLanguage, setFaqLanguage] = useState("en");
    const [editingFaq, setEditingFaq] = useState(null);
    const [faqDialogOpen, setFaqDialogOpen] = useState(false);

    // ────── Delete dialogs ──────
    const [deleteCatOpen, setDeleteCatOpen] = useState(false);
    const [deleteFaqOpen, setDeleteFaqOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    const { isDarkMode } = useTheme();
    const { admin } = useContext(AdminContext) || {};

    // ────── Load data ──────
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const list = await faqApi.getAllCategories();
            const tree = await faqApi.getAllFaq();
            setCategories(Array.isArray(list?.data) ? list.data : []);
            setCategoriesWithFaqs(Array.isArray(tree?.data) ? tree.data : []);
        } catch (e) {
            setError(e.message || "Failed to load data");
            setCategories([]);
            setCategoriesWithFaqs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // ────── CATEGORY HANDLERS ──────
    const resetCatForm = () => {
        setCatName("");
        setCatDesc("");
        setEditingCat(null);
        setCatDialogOpen(false);
    };

    const handleAddOrUpdateCategory = async () => {
        if (!catName.trim()) return setError("Category name is required");

        const payload = { name: catName.trim(), description: catDesc.trim() };
        try {
            if (editingCat) {
                await faqApi.updateCategory(editingCat._id, payload);
            } else {
                await faqApi.addCategory(payload);
            }
            resetCatForm();
            loadCategories();
        } catch (e) {
            setError(e.message || "Failed to save category");
        }
    };

    const startEditCat = (cat) => {
        setEditingCat(cat);
        setCatName(cat.name);
        setCatDesc(cat.description || "");
        setCatDialogOpen(true);
    };

    const confirmDeleteCat = (catId) => {
        setToDelete({ type: "cat", id: catId });
        setDeleteCatOpen(true);
    };

    const executeDeleteCat = async () => {
        try {
            await faqApi.deleteCategory(toDelete.id);
            loadCategories();
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleteCatOpen(false);
            setToDelete(null);
        }
    };

    // ────── FAQ HANDLERS ──────
    const resetFaqForm = () => {
        setFaqQuestion("");
        setFaqAnswer("");
        setFaqCategory("");
        setFaqTags("");
        setFaqLanguage("en");
        setEditingFaq(null);
        setFaqDialogOpen(false);
    };

    const handleAddOrUpdateFaq = async () => {
        if (!faqQuestion.trim() || !faqAnswer.trim() || !faqCategory) {
            return setError("Question, answer, and category are required");
        }

        const payload = {
            question: faqQuestion.trim(),
            answer: faqAnswer.trim(),
            tags: faqTags.split(",").map(t => t.trim()).filter(Boolean),
            language: faqLanguage,
        };

        try {
            if (editingFaq) {
                await faqApi.updateFaq(editingFaq._id, payload);
            } else {
                await faqApi.addFaq(faqCategory, payload);
            }
            resetFaqForm();
            loadCategories();
        } catch (e) {
            setError(e.message || "Failed to save FAQ");
        }
    };

    const startEditFaq = (faq, category) => {
        setEditingFaq(faq);
        setFaqQuestion(faq.question);
        setFaqAnswer(faq.answer);
        setFaqCategory(category._id);
        setFaqTags((faq.tags || []).join(", "));
        setFaqLanguage(faq.language || "en");
        setFaqDialogOpen(true);
    };

    const confirmDeleteFaq = (faqId) => {
        setToDelete({ type: "faq", id: faqId });
        setDeleteFaqOpen(true);
    };

    const executeDeleteFaq = async () => {
        try {
            await faqApi.deleteFaq(toDelete.id);
            loadCategories();
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleteFaqOpen(false);
            setToDelete(null);
        }
    };

    // ────── REORDER FAQS ──────
    const moveFaq = async (categoryId, faqId, direction) => {
        const cat = categoriesWithFaqs.find(c => c._id === categoryId);
        if (!cat || !cat.faqs) return;

        const faqs = [...cat.faqs];
        const idx = faqs.findIndex(f => f._id === faqId);
        if (idx === -1) return;

        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= faqs.length) return;

        [faqs[idx], faqs[targetIdx]] = [faqs[targetIdx], faqs[idx]];

        setCategoriesWithFaqs(prev =>
            prev.map(c => (c._id === categoryId ? { ...c, faqs } : c))
        );

        const orderList = faqs.map((f, i) => ({
            faqId: f._id,
            order: i + 1,
        }));

        try {
            await faqApi.reorderFaqs(categoryId, orderList);
        } catch (e) {
            setError("Failed to reorder – data will refresh");
            loadCategories();
        }
    };

    const handleMenuToggle = () => setSidebarCollapsed(prev => !prev);
    const sidebarWidth = sidebarCollapsed ? "80px" : "280px";

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Custom input style
    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            '& fieldset': {
                borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                borderWidth: '2px',
            },
            '&:hover fieldset': {
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
            }
        },
        '& .MuiInputLabel-root': {
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontWeight: 500,
            '&.Mui-focused': {
                color: '#3b82f6',
            }
        },
        '& .MuiInputBase-input': {
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontSize: '15px',
        }
    };

    // ────── RENDER CATEGORIES CARD VIEW ──────
    const renderCategoryCards = () => (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 3,
            mt: 2
        }}>
            {filteredCategories.map((cat) => (
                <Card
                    key={cat._id}
                    sx={{
                        background: isDarkMode 
                            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '16px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: isDarkMode 
                                ? '0 20px 40px rgba(0,0,0,0.4)' 
                                : '0 20px 40px rgba(0,0,0,0.12)',
                            borderColor: '#3b82f6',
                        }
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: -10,
                        left: 20,
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                    }}>
                        <CategoryIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>

                    <CardContent sx={{ pt: 5, pb: 2 }}>
                        <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{ 
                                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                mb: 1,
                                fontSize: '18px'
                            }}
                        >
                            {cat.name}
                        </Typography>
                        
                        {cat.description && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: isDarkMode ? '#94a3b8' : '#64748b',
                                    mb: 2,
                                    lineHeight: 1.6
                                }}
                            >
                                {cat.description}
                            </Typography>
                        )}

                        <Divider sx={{ my: 2, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }} />

                        <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Tooltip title="Edit Category" arrow>
                                <IconButton
                                    onClick={() => startEditCat(cat)}
                                    size="small"
                                    sx={{
                                        backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                                        color: '#3b82f6',
                                        '&:hover': { 
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Category" arrow>
                                <IconButton
                                    onClick={() => confirmDeleteCat(cat._id)}
                                    size="small"
                                    sx={{
                                        backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
                                        color: '#ef4444',
                                        '&:hover': { 
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );

    // ────── RENDER FAQ ACCORDION VIEW ──────
    const renderFaqAccordions = () => {
        if (categoriesWithFaqs.length === 0) {
            return (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 3
                }}>
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}>
                        <HelpIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', mb: 1 }}>
                        No Categories Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                        Create a category first in the Categories tab to add FAQs
                    </Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={3} mt={2}>
                {categoriesWithFaqs.map((cat) => {
                    if (!cat.faqs?.length) return null;

                    return (
                        <Accordion
                            key={cat._id}
                            expanded={expandedCategory === cat._id}
                            onChange={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                            sx={{
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                borderRadius: '16px !important',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: '#3b82f6',
                                    boxShadow: isDarkMode 
                                        ? '0 8px 24px rgba(0,0,0,0.3)'
                                        : '0 8px 24px rgba(0,0,0,0.1)'
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
                                sx={{
                                    borderRadius: '16px',
                                    '& .MuiAccordionSummary-content': {
                                        alignItems: 'center',
                                        gap: 2
                                    }
                                }}
                            >
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CategoryIcon sx={{ color: 'white', fontSize: 22 }} />
                                </Box>
                                <Box flexGrow={1}>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                        {cat.name}
                                    </Typography>
                                    {cat.description && (
                                        <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                            {cat.description}
                                        </Typography>
                                    )}
                                </Box>
                                <Badge 
                                    badgeContent={cat.faqs.length} 
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            height: '26px',
                                            minWidth: '26px',
                                            borderRadius: '13px'
                                        }
                                    }}
                                >
                                    <HelpIcon sx={{ fontSize: 28, color: isDarkMode ? '#64748b' : '#94a3b8' }} />
                                </Badge>
                            </AccordionSummary>

                            <AccordionDetails sx={{ pt: 0, px: 3, pb: 3 }}>
                                <Stack spacing={2}>
                                    {cat.faqs.map((faq, idx) => (
                                        <Paper
                                            key={faq._id}
                                            sx={{
                                                p: 2.5,
                                                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                                                border: `2px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
                                                borderRadius: '12px',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                                    transform: 'translateX(8px)'
                                                }
                                            }}
                                        >
                                            <Box display="flex" gap={2} alignItems="flex-start">
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    background: isDarkMode 
                                                        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                                                        : 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    mt: 0.5
                                                }}>
                                                    <Typography fontWeight={700} sx={{ color: isDarkMode ? '#93c5fd' : '#1e40af', fontSize: '14px' }}>
                                                        Q
                                                    </Typography>
                                                </Box>

                                                <Box flexGrow={1}>
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        fontWeight={700}
                                                        sx={{ 
                                                            color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                                            mb: 1.5,
                                                            fontSize: '16px'
                                                        }}
                                                    >
                                                        {faq.question}
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: isDarkMode ? '#94a3b8' : '#64748b',
                                                            lineHeight: 1.7,
                                                            mb: 1.5
                                                        }}
                                                    >
                                                        {faq.answer}
                                                    </Typography>
                                                    {faq.tags && faq.tags.length > 0 && (
                                                        <Box display="flex" gap={0.8} flexWrap="wrap" mt={1}>
                                                            {faq.tags.map((tag, i) => (
                                                                <Chip
                                                                    key={i}
                                                                    label={tag}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                                                                        color: isDarkMode ? '#93c5fd' : '#1e40af',
                                                                        fontWeight: 600,
                                                                        fontSize: '12px',
                                                                        height: '24px',
                                                                        borderRadius: '6px',
                                                                        border: `1px solid ${isDarkMode ? '#1e40af' : '#93c5fd'}`
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Move Up" arrow>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                disabled={idx === 0}
                                                                onClick={() => moveFaq(cat._id, faq._id, "up")}
                                                                sx={{
                                                                    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                                                                    color: '#3b82f6',
                                                                    '&:hover': { 
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white'
                                                                    },
                                                                    '&:disabled': { 
                                                                        backgroundColor: isDarkMode ? '#0f172a' : '#e2e8f0',
                                                                        opacity: 0.4 
                                                                    }
                                                                }}
                                                            >
                                                                <UpIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Move Down" arrow>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                disabled={idx === cat.faqs.length - 1}
                                                                onClick={() => moveFaq(cat._id, faq._id, "down")}
                                                                sx={{
                                                                    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                                                                    color: '#3b82f6',
                                                                    '&:hover': { 
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white'
                                                                    },
                                                                    '&:disabled': { 
                                                                        backgroundColor: isDarkMode ? '#0f172a' : '#e2e8f0',
                                                                        opacity: 0.4 
                                                                    }
                                                                }}
                                                            >
                                                                <DownIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Edit FAQ" arrow>
                                                        <IconButton
                                                            onClick={() => startEditFaq(faq, cat)}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                                                                color: '#3b82f6',
                                                                '&:hover': { 
                                                                    backgroundColor: '#3b82f6',
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete FAQ" arrow>
                                                        <IconButton
                                                            onClick={() => confirmDeleteFaq(faq._id)}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
                                                                color: '#ef4444',
                                                                '&:hover': { 
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Stack>
        );
    };

    // ────── MAIN RENDER ──────
    return (
        <div style={{
            display: "flex",
            height: "100vh",
            backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9'
        }}>
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleMenuToggle}
                isDarkMode={isDarkMode}
            />

            <div style={{
                flex: 1,
                marginLeft: sidebarWidth,
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <Navbar
                    onMenuClick={handleMenuToggle}
                    isCollapsed={sidebarCollapsed}
                    isDarkMode={isDarkMode}
                    admin={admin}
                />

                <div style={{
                    flex: 1,
                    padding: "24px",
                    paddingTop: "90px",
                    overflow: "auto"
                }}>
                    <Container maxWidth="xl">
                        {/* Hero Section */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{
                                background: isDarkMode 
                                    ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                borderRadius: '20px',
                                p: 4,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    filter: 'blur(60px)'
                                }} />
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                                        FAQ Management
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.95, fontSize: '16px' }}>
                                        Organize and manage your frequently asked questions with ease
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Tabs */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                mb: 3,
                                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                borderRadius: '16px',
                                border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                overflow: 'hidden'
                            }}
                        >
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                centered
                                sx={{
                                    '& .MuiTab-root': {
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        textTransform: 'none',
                                        minHeight: '64px',
                                        transition: 'all 0.3s',
                                        '&.Mui-selected': {
                                            color: '#3b82f6',
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        height: '4px',
                                        borderRadius: '4px 4px 0 0',
                                        backgroundColor: '#3b82f6',
                                    }
                                }}
                            >
                                <Tab
                                    label="Categories"
                                    icon={<CategoryIcon />}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="Manage FAQs"
                                    icon={<HelpIcon />}
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Paper>

                        {error && (
                            <Alert 
                                severity="error" 
                                onClose={() => setError("")}
                                icon={<CloseIcon />}
                                sx={{ 
                                    mb: 3,
                                    borderRadius: '12px',
                                    border: `2px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`,
                                    backgroundColor: isDarkMode ? '#1f1917' : '#fef2f2',
                                    color: isDarkMode ? '#fca5a5' : '#dc2626',
                                    '& .MuiAlert-icon': {
                                        color: isDarkMode ? '#fca5a5' : '#dc2626'
                                    }
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {loading && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 12
                            }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    border: `6px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
                                    borderTopColor: '#3b82f6',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <Typography variant="body1" sx={{ mt: 3, color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                                    Loading data...
                                </Typography>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </Box>
                        )}

                        {/* ────── CATEGORIES TAB ────── */}
                        {!loading && tab === TAB_CATEGORIES && (
                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <TextField
                                        placeholder="Search categories..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: isDarkMode ? '#64748b' : '#94a3b8' }} />
                                        }}
                                        sx={{
                                            ...inputStyle,
                                            width: '300px',
                                            '& .MuiOutlinedInput-root': {
                                                ...inputStyle['& .MuiOutlinedInput-root'],
                                                height: '48px'
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => setCatDialogOpen(true)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '15px',
                                            px: 3,
                                            py: 1.5,
                                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                boxShadow: '0 12px 28px rgba(59, 130, 246, 0.4)',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        Add Category
                                    </Button>
                                </Box>

                                {filteredCategories.length === 0 ? (
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: 12,
                                        px: 3
                                    }}>
                                        <Box sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 24px',
                                            boxShadow: '0 12px 32px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            <CategoryIcon sx={{ fontSize: 50, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', mb: 1.5 }}>
                                            No Categories Found
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mb: 3 }}>
                                            {searchTerm ? 'Try a different search term' : 'Get started by creating your first category'}
                                        </Typography>
                                        {!searchTerm && (
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => setCatDialogOpen(true)}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    px: 4,
                                                    py: 1.5
                                                }}
                                            >
                                                Create First Category
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    renderCategoryCards()
                                )}
                            </Box>
                        )}

                        {/* ────── FAQS TAB ────── */}
                        {!loading && tab === TAB_FAQS && (
                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" fontWeight={700} sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                        All FAQs
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => setFaqDialogOpen(true)}
                                        disabled={categories.length === 0}
                                        sx={{
                                            background: categories.length > 0 
                                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                : isDarkMode ? '#334155' : '#e2e8f0',
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '15px',
                                            px: 3,
                                            py: 1.5,
                                            boxShadow: categories.length > 0 ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none',
                                            '&:hover': categories.length > 0 ? {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                boxShadow: '0 12px 28px rgba(59, 130, 246, 0.4)',
                                                transform: 'translateY(-2px)'
                                            } : {},
                                            transition: 'all 0.3s',
                                            '&:disabled': {
                                                color: isDarkMode ? '#64748b' : '#94a3b8'
                                            }
                                        }}
                                    >
                                        Add FAQ
                                    </Button>
                                </Box>

                                {renderFaqAccordions()}
                            </Box>
                        )}
                    </Container>
                </div>
            </div>

            {/* ────── CATEGORY DIALOG ────── */}
            <Dialog 
                open={catDialogOpen} 
                onClose={resetCatForm}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderRadius: '20px',
                        border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '24px',
                    pb: 1
                }}>
                    {editingCat ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateCategory(); }}>
                        <TextField
                            label="Category Name"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            sx={inputStyle}
                        />
                        <TextField
                            label="Description (optional)"
                            value={catDesc}
                            onChange={(e) => setCatDesc(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            margin="normal"
                            sx={inputStyle}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button 
                        onClick={resetCatForm}
                        sx={{
                            color: isDarkMode ? '#94a3b8' : '#64748b',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            borderRadius: '10px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddOrUpdateCategory}
                        startIcon={editingCat ? <EditIcon /> : <AddIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                            }
                        }}
                    >
                        {editingCat ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ────── FAQ DIALOG ────── */}
            <Dialog 
                open={faqDialogOpen} 
                onClose={resetFaqForm}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderRadius: '20px',
                        border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '24px',
                    pb: 1
                }}>
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateFaq(); }}>
                        <FormControl fullWidth margin="normal" required sx={inputStyle}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={faqCategory}
                                onChange={(e) => setFaqCategory(e.target.value)}
                                label="Category"
                            >
                                {categories.map((c) => (
                                    <MenuItem 
                                        key={c._id} 
                                        value={c._id}
                                        sx={{
                                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                            color: isDarkMode ? '#e2e8f0' : '#1e293b',
                                            '&:hover': {
                                                backgroundColor: isDarkMode ? '#334155' : '#f8fafc'
                                            }
                                        }}
                                    >
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Question"
                            value={faqQuestion}
                            onChange={(e) => setFaqQuestion(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            sx={inputStyle}
                        />
                        <TextField
                            label="Answer"
                            value={faqAnswer}
                            onChange={(e) => setFaqAnswer(e.target.value)}
                            multiline
                            rows={5}
                            fullWidth
                            required
                            margin="normal"
                            sx={inputStyle}
                        />
                        <TextField
                            label="Tags (comma-separated)"
                            value={faqTags}
                            onChange={(e) => setFaqTags(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="e.g. general, policy, support"
                            sx={inputStyle}
                        />
                        <FormControl fullWidth margin="normal" sx={inputStyle}>
                            <InputLabel>Language</InputLabel>
                            <Select
                                value={faqLanguage}
                                onChange={(e) => setFaqLanguage(e.target.value)}
                                label="Language"
                            >
                                <MenuItem value="en" sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>English</MenuItem>
                                <MenuItem value="es" sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Spanish</MenuItem>
                                <MenuItem value="fr" sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>French</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button 
                        onClick={resetFaqForm}
                        sx={{
                            color: isDarkMode ? '#94a3b8' : '#64748b',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            borderRadius: '10px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddOrUpdateFaq}
                        startIcon={editingFaq ? <EditIcon /> : <AddIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                            }
                        }}
                    >
                        {editingFaq ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ────── DELETE CONFIRM DIALOGS ────── */}
            <Dialog 
                open={deleteCatOpen} 
                onClose={() => setDeleteCatOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderRadius: '16px',
                        border: `2px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`
                    }
                }}
            >
                <DialogTitle sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 700 }}>
                    Delete Category?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                        All FAQs in this category will also be deleted. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDeleteCatOpen(false)}
                        sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={executeDeleteCat}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': { backgroundColor: '#dc2626' }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={deleteFaqOpen} 
                onClose={() => setDeleteFaqOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderRadius: '16px',
                        border: `2px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`
                    }
                }}
            >
                <DialogTitle sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 700 }}>
                    Delete FAQ?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                        This will soft-delete the FAQ. Are you sure you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDeleteFaqOpen(false)}
                        sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={executeDeleteFaq}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': { backgroundColor: '#dc2626' }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FAQPage;
