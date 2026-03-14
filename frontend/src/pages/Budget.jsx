/**
 * src/pages/Budget.jsx
 * Set monthly budgets per category; shows live progress bars.
 */

import { useState, useEffect } from 'react';
import { budgetsAPI } from '../utils/api';
import { Card, Button, Select, ProgressBar, EmptyState, Loader, Alert } from '../components/UI';

const CATEGORIES = [
  '🍔 Food & Dining','🚗 Transportation','🛒 Groceries','🏠 Housing & Rent',
  '💡 Utilities','🎬 Entertainment','👕 Clothing','💊 Healthcare',
  '📚 Education','✈️ Travel','💻 Technology','🎁 Gifts','📦 Other',
];
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function Budget() {
  const [budgets, setBudgets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [formError, setFormError] = useState('');
  const [category, setCategory]   = useState('');
  const [limit, setLimit]         = useState('');

  async function loadBudgets() {
    try {
      const data = await budgetsAPI.list();
      setBudgets(data.budgets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBudgets(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError('');
    if (!category) return setFormError('Select a category.');
    if (!limit || parseFloat(limit) <= 0) return setFormError('Enter a valid limit.');

    setSubmitting(true);
    try {
      await budgetsAPI.upsert({ category, monthly_limit: parseFloat(limit) });
      setCategory(''); setLimit('');
      loadBudgets();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await budgetsAPI.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Budget Planning</h1>
        <p>Set monthly limits and track your spending against goals</p>
      </div>

      <Card title="Set Monthly Budget">
        {formError && <Alert type="error">{formError}</Alert>}
        <form onSubmit={handleAdd}>
          <div className="form-row" style={{ maxWidth: 500 }}>
            <Select label="Category" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div className="form-group">
              <label className="form-label">Monthly Limit (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 5000" min="1" step="1"
                value={limit} onChange={e => setLimit(e.target.value)} />
            </div>
          </div>
          <Button type="submit" loading={submitting} style={{ maxWidth: 200 }}>+ Set Budget</Button>
        </form>
      </Card>

      <Card title="Budget Tracker">
        <p className="card-subtitle">Showing current month's spending vs. your set limits</p>
        {error && <Alert type="error">{error}</Alert>}
        {loading
          ? <Loader />
          : budgets.length === 0
            ? <EmptyState icon="🎯" message="No budgets set yet. Add one above!" />
            : budgets.map(b => (
                <div key={b.id} style={{ position: 'relative' }}>
                  <ProgressBar
                    label={b.category}
                    value={b.spent}
                    max={b.monthly_limit}
                    amounts={`${fmt(b.spent)} / ${fmt(b.monthly_limit)}`}
                  />
                  <button
                    className="btn-icon-delete budget-delete"
                    onClick={() => handleDelete(b.id)}
                    title="Remove budget"
                  >✕</button>
                </div>
              ))
        }
      </Card>
    </div>
  );
}
