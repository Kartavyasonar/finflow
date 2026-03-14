/**
 * src/App.jsx
 * Root component. Switches between AuthPage and the main app shell.
 * Uses simple useState-based "routing" (no React Router needed for this SPA).
 */

import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage    from './pages/AuthPage';
import Dashboard   from './pages/Dashboard';
import Expenses    from './pages/Expenses';
import Income      from './pages/Income';
import Budget      from './pages/Budget';
import History     from './pages/History';
import Sidebar     from './components/Sidebar';

const PAGES = { dashboard: Dashboard, expenses: Expenses, income: Income, budget: Budget, history: History };

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!isAuthenticated) return <AuthPage />;

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <PageComponent onNavigate={setActivePage} />
      </main>
    </div>
  );
}
