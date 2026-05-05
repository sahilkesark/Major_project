import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Camera,
  History,
  CalendarDays,
  Target,
  User,
  LogOut,
  Sun,
  Moon,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Camera, label: 'Analyze Food' },
  { to: '/history', icon: History, label: 'Food History' },
  { to: '/meal-planner', icon: CalendarDays, label: 'Meal Planner' },
  { to: '/goals', icon: Target, label: 'Daily Goals' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-default)',
          minHeight: '64px',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Leaf size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <h1
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                lineHeight: 1.2,
              }}
              className="gradient-text"
            >
              NutriSight Pro
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 1 }}>
              Smart Diet Analyzer
            </p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--color-primary-50)' : 'transparent',
              transition: 'all 0.2s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* User info */}
        {!collapsed && profile && (
          <div
            style={{
              padding: '0.5rem 0.625rem',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {(profile.full_name || profile.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.full_name || 'User'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.email}
              </p>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
            width: '100%',
          }}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="btn btn-ghost"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
            width: '100%',
            color: 'var(--color-danger)',
          }}
          title="Sign Out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost"
          style={{
            justifyContent: 'center',
            padding: '0.5rem',
            width: '100%',
            marginTop: '0.25rem',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
