/**
 * src/pages/AuthPage.jsx
 * Login / Register page with tab switching, validation, and async auth.
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';

export default function AuthPage() {
  const { login, register, loading, clearError } = useAuth();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm]     = useState({ name: '', email: '', password: '', confirm: '' });

  function switchTab(t) {
    setTab(t);
    setError('');
    setSuccess('');
    clearError();
  }

  // ── Email validation (RegExp) ──────────────────────────────
  function validateEmail(email) {
    // basic email check
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // ── Login submit ───────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const { email, password } = loginForm;
    if (!email || !password) return setError('All fields are required.');
    if (!validateEmail(email)) return setError('Enter a valid email address.');

    const result = await login(email, password);
    if (!result.success) setError(result.error);
  }

  // ── Register submit ────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { name, email, password, confirm } = regForm;

    if (!name || !email || !password || !confirm) return setError('All fields are required.');
    if (!validateEmail(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    const result = await register(name, email, password);
    if (!result.success) setError(result.error);
    // On success AuthContext sets isAuthenticated → App renders dashboard
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">💰 <span>Fin</span>Flow</div>
        <p className="auth-subtitle">Your personal money command center</p>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
            Sign In
          </button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>
            Create Account
          </button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Login Form */}
        {tab === 'login' && (
  <>
    <form onSubmit={handleLogin}>
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={loginForm.email}
        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={loginForm.password}
        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
      />
      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
        Sign In →
      </Button>
    </form>

    <p className="auth-footer">
      © 2026 FinFlow · Built by <strong>Kartavya Sonar</strong>
    </p>
  </>
)}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={regForm.confirm}
              onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
            />
            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Create Account →
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
