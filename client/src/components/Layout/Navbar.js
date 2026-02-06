import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, LogOut, Menu, X, CalendarDays } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = user?.firstName?.charAt(0)?.toUpperCase() || 'U';

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`
    : 'User';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 24px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CalendarDays size={20} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>EventManager</span>
      </Link>

      {/* Desktop Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
        <button className="btn btn-ghost" onClick={toggleTheme} style={{ padding: '8px 12px', minWidth: 0 }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Dashboard</Link>
            <Link to="/profile" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Profile</Link>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }} title={fullName}>
              {initial}
            </div>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '8px 12px', color: 'var(--accent-danger)' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
        display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4,
      }}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <button className="btn btn-ghost" onClick={toggleTheme} style={{ justifySelf: 'flex-start' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--accent-danger)' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
