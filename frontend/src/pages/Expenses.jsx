/**
 * src/pages/Expenses.jsx
 * Add, list, filter, and delete expenses. Calls /api/expenses.
 */

import { useState, useEffect, useCallback } from 'react';
import { expensesAPI } from '../utils/api';
import { Card, Button, Input, Select, TxItem, EmptyState, Loader, Alert } from '../components/UI';

const CATEGORIES = [
  '🍔 Food & Dining','🚗 Transportation','🛒 Groceries','🏠 Housing & Rent',
  '💡 Utilities','🎬 Entertainment','👕 Clothing','💊 Healthcare',
  '📚 Education','✈️ Travel','💻 Technology','🎁 Gifts','📦 Other',
];

const today = () => new Date().toISOString().split('T')[0];

export default function Expenses() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [formError, setFormError] = useState('');

  // Filters
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Form
  const [form, setForm] = useState({ amount: '', category: '', date: today(), description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadExpenses = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const data = await expensesAPI.list(params);
      setExpenses(data.expenses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError('');
    const { amount, category, date } = form;
    if (!amount || parseFloat(amount) <= 0) return setFormError('Enter a valid amount.');
    if (!category) return setFormError('Select a category.');
    if (!date) return setFormError('Select a date.');

    setSubmitting(true);
    try {
      await expensesAPI.create({ ...form, amount: parseFloat(form.amount) });
      setForm({ amount: '', category: '', date: today(), description: '' });
      loadExpenses();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await expensesAPI.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Expense Tracking</h1>
        <p>Record and manage your daily spending</p>
      </div>

      {/* Add Form */}
      <Card title="Add Expense">
        {formError && <Alert type="error">{formError}</Alert>}
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <Input label="Amount (₹)" type="number" placeholder="0.00" min="0.01" step="0.01"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
            <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <Input label="Description (optional)" type="text" placeholder="e.g. Lunch at Cafe XYZ"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <Button type="submit" loading={submitting} style={{ maxWidth: 200 }}>+ Add Expense</Button>
        </form>
      </Card>

      {/* List */}
      <Card title="Your Expenses">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Search expenses..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {loading
          ? <Loader />
          : expenses.length === 0
            ? <EmptyState icon="💸" message="No expenses found" />
            : expenses.map(e => (
                <TxItem key={e.id} type="expense" label={e.category} description={e.description}
                  date={e.date} amount={e.amount} onDelete={() => handleDelete(e.id)} />
              ))
        }
      </Card>
    </div>
  );
}
