/**
 * src/components/UI.jsx
 * Shared reusable components: Button, Input, Select, Card, Badge, Toast, Modal, EmptyState
 */

import { useEffect, useRef } from 'react';

// ── Button ─────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'btn';
  const variants = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger', ghost: 'btn-ghost' };
  const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="spinner" /> : children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <select className={`form-select ${error ? 'input-error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ── Stat Card ──────────────────────────────────────────────────
export function StatCard({ label, value, icon, variant, sub }) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────
export function ProgressBar({ value, max, label, amounts }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const cls = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe';
  return (
    <div className="budget-item">
      <div className="budget-header">
        <span className="budget-cat">{label}</span>
        <span className="budget-amounts">{amounts}</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill fill-${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`budget-pct pct-${cls}`}>
        {pct}% used{' '}
        {pct >= 100 ? '⚠️ Over budget!' : pct >= 75 ? '⚡ Near limit' : '✓ On track'}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  );
}

// ── Transaction Item ───────────────────────────────────────────
export function TxItem({ type, label, description, date, amount, onDelete, frequency }) {
  const fmtCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const emoji = label?.split(' ')[0] || '💰';

  return (
    <div className="tx-item">
      <div className={`tx-icon tx-${type}`}>{emoji}</div>
      <div className="tx-info">
        <div className="tx-name">
          {label}
          {frequency && frequency !== 'one-time' && <span className="freq-pill">{frequency}</span>}
        </div>
        <div className="tx-meta">{description || 'No description'} · {fmtDate(date)}</div>
      </div>
      <div className={`tx-amount tx-amount-${type}`}>
        {type === 'income' ? '+' : '-'}{fmtCurrency(amount)}
      </div>
      {onDelete && (
        <button className="btn-icon-delete" onClick={onDelete} title="Delete">✕</button>
      )}
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────
export function Loader() {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" />
    </div>
  );
}

// ── Alert ──────────────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}
