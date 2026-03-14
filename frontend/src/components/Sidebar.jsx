/**
 * src/components/Sidebar.jsx
 * App navigation sidebar with user info and logout.
 */

import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'expenses',  icon: '💸', label: 'Expenses' },
  { id: 'income',    icon: '💵', label: 'Income' },
  { id: 'budget',    icon: '🎯', label: 'Budgets' },
  { id: 'history',   icon: '📋', label: 'History' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">💰 <span>FinFlow</span></div>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-email">{user?.email}</div>
        </div>
      </div>

      <div className="nav-label">Menu</div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="sidebar-bottom">
      <button className="logout-btn" onClick={logout}>
      <span className="nav-icon">🚪</span>
         Sign Out
      </button>
      <div className="sidebar-copyright">
      <span>© 2026 FinFlow</span>
      <span>Made by <strong>Kartavya Sonar</strong></span>
      </div>
      </div>
      </nav>
      );
      }
