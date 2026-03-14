/**
 * src/pages/Income.jsx
 * Add, list, filter, and delete income entries. Calls /api/income.
 */

import { useState, useEffect, useCallback } from 'react';
import { incomeAPI } from '../utils/api';
import { Card, Button, Input, Select, TxItem, EmptyState, Loader, Alert } from '../components/UI';

const SOURCES = ['💼 Salary','🏆 Bonus','💻 Freelance','📈 Investments','🏢 Business','🎓 Scholarship','🎁 Gift','💰 Other'];
const FREQUENCIES = ['one-time','weekly','bi-weekly','monthly','annually'];
const today = () => new Date().toISOString().split('T')[0];

export default function Income() {
  const [income, setIncome]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [formError, setFormError] = useState('');
  const [search, setSearch]       = useState('');
  const [freqFilter, setFreqFilter] = useState('');

  const [form, setForm] = useState({ amount: '', source: '', date: today(), frequency: 'one-time', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadIncome = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (freqFilter) params.frequency = freqFilter;
      const data = await incomeAPI.list(params);
      setIncome(data.income);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, freqFilter]);

  useEffect(() => { loadIncome(); }, [loadIncome]);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError('');
    const { amount, source, date } = form;
    if (!amount || parseFloat(amount) <= 0) return setFormError('Enter a valid amount.');
    if (!source) return setFormError('Select an income source.');
    if (!date) return setFormError('Select a date.');

    setSubmitting(true);
    try {
      await incomeAPI.create({ ...form, amount: parseFloat(form.amount) });
      setForm({ amount: '', source: '', date: today(), frequency: 'one-time', description: '' });
      loadIncome();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await incomeAPI.delete(id);
      setIncome(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Income Management</h1>
        <p>Track your earnings and income sources</p>
      </div>

      <Card title="Add Income">
        {formError && <Alert type="error">{formError}</Alert>}
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <Input label="Amount (₹)" type="number" placeholder="0.00" min="0.01" step="0.01"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
            <Select label="Source" value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <Select label="Frequency" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </Select>
          </div>
          <Input label="Description (optional)" type="text" placeholder="e.g. April salary from Acme Corp"
            value={form.description} onChange={e => set('description', e.target.value)} />
          <Button type="submit" loading={submitting} style={{ maxWidth: 200, marginTop: '0.5rem' }}>+ Add Income</Button>
        </form>
      </Card>

      <Card title="Income Records">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Search income..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={freqFilter} onChange={e => setFreqFilter(e.target.value)}>
            <option value="">All Frequencies</option>
            {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </div>
        {error && <Alert type="error">{error}</Alert>}
        {loading
          ? <Loader />
          : income.length === 0
            ? <EmptyState icon="💵" message="No income recorded yet" />
            : income.map(i => (
                <TxItem key={i.id} type="income" label={i.source} description={i.description}
                  date={i.date} amount={i.amount} frequency={i.frequency} onDelete={() => handleDelete(i.id)} />
              ))
        }
      </Card>
    </div>
  );
}
