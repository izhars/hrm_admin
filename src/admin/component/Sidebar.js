import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';

const Sidebar = ({ isCollapsed: externalCollapsed, onToggle, isDarkMode }) => {
  const { admin } = useContext(AdminContext);
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef(null);

  // Use external state if provided, otherwise internal
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleSidebar = externalCollapsed !== undefined ? onToggle : () => setInternalCollapsed(prev => !prev);
  const isActive = useMemo(() => (path) => location.pathname === path, [location.pathname]);

  const menuItems = useMemo(() => [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview of key metrics and insights',
      roles: ['superadmin', 'admin', 'hr'],
    },
    {
      path: '/admin/create-hr',
      label: 'Add HR Manager',
      icon: '👨‍💼',
      description: 'Create new HR manager accounts',
      roles: ['superadmin', 'admin'],
    },
    {
      path: '/admin/create-employee',
      label: 'Add Employee',
      icon: '👤',
      description: 'Register new team members',
      roles: ['hr'],
    },
    {
      path: '/admin/all-employee',
      label: 'Team Directory',
      icon: '👥',
      description: 'Manage all employee records',
      roles: ['hr'],
    },
    {
      path: '/admin/department',
      label: 'Departments',
      icon: '🏢',
      description: 'Organize company departments',
      roles: ['superadmin', 'hr'],
    },
    {
      path: '/admin/analytics',
      label: 'Reports & Analytics',
      icon: '📈',
      description: 'Advanced reporting and insights',
      roles: ['superadmin', 'admin'],
    },
    {
      path: '/admin/holiday',
      label: 'Holiday Calendar',
      icon: '📅',
      description: 'Manage company holidays and events',
      roles: ['hr', 'admin'],
    },
    {
      path: '/admin/leaves',
      label: 'Leave Management',
      icon: '🗓️',
      description: 'Handle leave requests and approvals',
      roles: ['hr', 'admin'],
    },
    {
      path: '/admin/combooff',
      label: 'Combo Review',
      icon: '🗓️',
      description: 'Review and approve employee combo off requests',
      roles: ['hr', 'admin'], // Only HR and Admin can access
    },
    {
      path: '/admin/attendence-today',
      label: "Today's Attendance",
      icon: '✅',
      description: 'View current day attendance status',
      roles: ['hr', 'admin'],
    },
    {
      path: '/admin/announcements',
      label: 'Announcements',
      icon: '📢',
      description: 'Create and manage company announcements',
      roles: ['hr', 'superadmin'],
    },
    {
      "path": "/admin/badges",
      "label": "Badge Management",
      "icon": "🏅",
      "description": "Create, edit, and delete employee recognition badges and awards.",
      "roles": ["hr", "admin"]
    },
    {
      path: '/admin/attendence-all',
      label: 'All Attendance',
      icon: '📋',
      description: 'View all employee attendance records (past and present)',
      roles: ['hr', 'admin'],
    },

    // 🗣️ New Feature: Feedback
    {
      path: '/admin/feedback-summary',
      label: 'Employee Feedback',
      icon: '💬',
      description: 'View employee feedback and analytics',
      roles: ['hr', 'admin'],
    },

    // 🗳️ New Feature: Polls
    {
      path: '/admin/polls',
      label: 'Employee Polls',
      icon: '🗳️',
      description: 'Create and view poll analytics',
      roles: ['hr', 'admin'],
    },
    {
      path: '/admin/faqs',
      label: 'FAQs',
      icon: '❓',
      description: 'Manage frequently asked questions and categories',
      roles: ['hr', 'admin'],
    },
    {
      path: '/admin/helps',
      label: 'Helps & FAQs',          // Clear label for HR/Admin
      icon: '📘',                      // Book icon for knowledge/help topics
      description: 'Manage employee help topics, FAQs, and guidance materials', // Detailed tooltip
      roles: ['hr', 'admin'],          // Only HR/Admin can access
    }
  ], []);


  const filteredMenuItems = useMemo(() => {
    if (!admin?.role) return [];

    let items = menuItems.filter(item => item.roles.includes(admin.role));

    if (searchTerm) {
      items = items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  }, [admin?.role, menuItems, searchTerm]);

  // Scroll persistence
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('admin-sidebar-scroll');
    if (savedPosition && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        scrollContainerRef.current.scrollTop = parseInt(savedPosition, 10);
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (scrollContainerRef.current) {
        sessionStorage.setItem('admin-sidebar-scroll', scrollContainerRef.current.scrollTop.toString());
      }
    };
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem('admin-sidebar-scroll', scrollContainerRef.current.scrollTop.toString());
    }
  };

  const sidebarStyles = {
    sidebar: {
      width: isCollapsed ? '80px' : '280px',
      height: '100vh',
      background: isDarkMode
        ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)'
        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      color: isDarkMode ? '#e2e8f0' : '#334155',
      padding: '24px 16px',
      boxSizing: 'border-box',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isDarkMode
        ? '4px 0 24px rgba(0, 0, 0, 0.3)'
        : '4px 0 24px rgba(15, 23, 42, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.1)'
        : '1px solid rgba(226, 232, 240, 0.8)'
    },
    header: {
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between',
      paddingBottom: '16px',
      borderBottom: isCollapsed ? 'none' : isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.1)'
        : '1px solid rgba(226, 232, 240, 0.6)'
    },
    logoContainer: {
      display: isCollapsed ? 'none' : 'block'
    },
    logo: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 800,
      background: isDarkMode
        ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
        : 'linear-gradient(135deg, #1d4ed8, #312e81)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      display: 'inline-block',
      letterSpacing: '0.5px',
      WebkitMaskImage: '-webkit-linear-gradient(#fff, #fff)',
      transition: 'all 0.3s ease-in-out',
    },
    subtitle: {
      fontSize: '11px',
      color: isDarkMode ? '#64748b' : '#64748b',
      fontWeight: '500',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    toggleButton: {
      background: isDarkMode
        ? 'rgba(51, 65, 85, 0.4)'
        : 'rgba(241, 245, 249, 0.8)',
      border: isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.2)'
        : '1px solid rgba(203, 213, 225, 0.6)',
      borderRadius: '8px',
      color: isDarkMode ? '#cbd5e1' : '#475569',
      cursor: 'pointer',
      padding: '8px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '36px'
    },
    searchContainer: {
      marginBottom: '24px',
      position: 'relative',
      display: isCollapsed ? 'none' : 'block'
    },
    searchInput: {
      width: '100%',
      padding: '10px 12px 10px 36px',
      background: isDarkMode
        ? 'rgba(51, 65, 85, 0.3)'
        : 'rgba(241, 245, 249, 0.7)',
      border: isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.2)'
        : '1px solid rgba(203, 213, 225, 0.6)',
      borderRadius: '10px',
      color: isDarkMode ? '#e2e8f0' : '#334155',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    nav: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: '4px'
    },
    menuItem: {
      marginBottom: '4px',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer'
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      padding: isCollapsed ? '12px' : '12px 16px',
      color: isDarkMode ? '#cbd5e1' : '#64748b',
      backgroundColor: 'transparent',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      position: 'relative'
    },
    activeLink: {
      backgroundColor: isDarkMode
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(59, 130, 246, 0.1)',
      color: isDarkMode ? '#60a5fa' : '#2563eb',
      fontWeight: '600'
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: isDarkMode
        ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)'
        : 'linear-gradient(180deg, #2563eb, #1e40af)',
      borderRadius: '0 4px 4px 0'
    },
    icon: {
      fontSize: '18px',
      minWidth: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isCollapsed ? 0 : '12px',
      transition: 'all 0.3s ease'
    },
    content: {
      flex: 1,
      minWidth: 0,
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease'
    },
    label: {
      fontWeight: '500',
      marginBottom: '2px',
      fontSize: '14px'
    },
    description: {
      fontSize: '11px',
      color: isDarkMode ? '#64748b' : '#94a3b8',
      lineHeight: '1.2'
    },
    hoverBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode
        ? 'rgba(51, 65, 85, 0.3)'
        : 'rgba(241, 245, 249, 0.7)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      borderRadius: '12px',
      zIndex: -1
    },
    footer: {
      marginTop: 'auto',
      paddingTop: '24px',
      borderTop: isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.1)'
        : '1px solid rgba(226, 232, 240, 0.6)',
      paddingBottom: '16px'
    },
    userInfo: {
      background: isDarkMode
        ? 'rgba(51, 65, 85, 0.2)'
        : 'rgba(248, 250, 252, 0.8)',
      borderRadius: '12px',
      padding: isCollapsed ? '12px' : '16px',
      textAlign: isCollapsed ? 'center' : 'left',
      marginBottom: '12px',
      border: isDarkMode
        ? '1px solid rgba(148, 163, 184, 0.1)'
        : '1px solid rgba(226, 232, 240, 0.5)'
    },
    logoutButton: {
      width: '100%',
      color: isDarkMode ? '#f87171' : '#dc2626',
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      fontWeight: '500',
      background: isDarkMode
        ? 'rgba(248, 113, 113, 0.1)'
        : 'rgba(220, 38, 38, 0.05)',
      border: isDarkMode
        ? '1px solid rgba(248, 113, 113, 0.2)'
        : '1px solid rgba(220, 38, 38, 0.1)',
      cursor: 'pointer',
      justifyContent: isCollapsed ? 'center' : 'flex-start'
    }
  };

  if (!admin) {
    return (
      <aside style={sidebarStyles.sidebar}>
        <div style={sidebarStyles.header}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Loading...</div>
        </div>
      </aside>
    );
  }

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        .sidebar-nav-item:hover .hover-bg { opacity: 1 !important; }
        .sidebar-nav-item:hover { transform: translateX(${isCollapsed ? '0' : '4px'}) !important; }
        .sidebar-nav-item.active:hover { transform: translateX(2px) !important; }
        .search-input:focus { 
          outline: none; 
          border-color: ${isDarkMode ? '#3b82f6' : '#2563eb'}; 
          box-shadow: 0 0 0 3px ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'}; 
        }
        .collapse-button:hover { 
          background-color: ${isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 1)'} !important; 
          transform: scale(1.05);
        }
        .sidebar-scrollable::-webkit-scrollbar { width: 6px; }
        .sidebar-scrollable::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollable::-webkit-scrollbar-thumb { 
          background: ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.5)'}; 
          border-radius: 3px; 
        }
        .sidebar-scrollable::-webkit-scrollbar-thumb:hover { 
          background: ${isDarkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(203, 213, 225, 0.8)'}; 
        }
        .logout-button:hover {
          background-color: ${isDarkMode ? 'rgba(248, 113, 113, 0.2)' : 'rgba(220, 38, 38, 0.1)'} !important;
          transform: translateY(-1px);
        }
      `}</style>

      <aside className="sidebar" style={sidebarStyles.sidebar} ref={scrollContainerRef} onScroll={handleScroll}>
        {/* Header */}
        <div style={sidebarStyles.header}>
          <div style={sidebarStyles.logoContainer}>
            <h2 style={sidebarStyles.logo}>WorkSpace Pro</h2>
            <div style={sidebarStyles.subtitle}>{admin.role.toUpperCase()} PORTAL</div>
          </div>
          <button
            className="collapse-button"
            style={sidebarStyles.toggleButton}
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Search */}
        <div style={sidebarStyles.searchContainer}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            fontSize: '14px'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            style={sidebarStyles.searchInput}
          />
        </div>

        {/* Navigation */}
        <nav style={sidebarStyles.nav} className="sidebar-scrollable">
          {filteredMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <div key={item.path} className={`sidebar-nav-item ${active ? 'active' : ''}`} style={sidebarStyles.menuItem}>
                <Link
                  to={item.path}
                  style={{
                    ...sidebarStyles.link,
                    ...(active ? sidebarStyles.activeLink : {})
                  }}
                  className="sidebar-nav-item"
                >
                  {active && <div style={sidebarStyles.activeIndicator} />}
                  <span style={sidebarStyles.icon}>{item.icon}</span>
                  {!isCollapsed && (
                    <div style={sidebarStyles.content}>
                      <div style={active ? {
                        ...sidebarStyles.label,
                        color: isDarkMode ? '#60a5fa' : '#2563eb'
                      } : sidebarStyles.label}>
                        {item.label}
                      </div>
                      <div style={sidebarStyles.description}>{item.description}</div>
                    </div>
                  )}
                  <div className="hover-bg" style={sidebarStyles.hoverBg} />
                </Link>
              </div>
            );
          })}
          {searchTerm && filteredMenuItems.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: isDarkMode ? '#64748b' : '#94a3b8'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '14px' }}>No matching items found</div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={sidebarStyles.footer}>
          <div style={sidebarStyles.userInfo}>
            <div style={{
              fontSize: isCollapsed ? '16px' : '24px',
              marginBottom: isCollapsed ? 0 : '8px'
            }}>
              {isCollapsed ? '👤' : `👤 ${admin.fullName || 'Administrator'}`}
            </div>
            {!isCollapsed && (
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#64748b' : '#94a3b8',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {admin.role} Access
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={sidebarStyles.logoutButton} className="logout-button">
            <span style={{ marginRight: isCollapsed ? 0 : '12px' }}>🔓</span>
            <span style={{ opacity: isCollapsed ? 0 : 1 }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;