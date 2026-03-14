/**
 * src/pages/History.jsx
 * Unified transaction history with search, type, category, and date range filters.
 */

import { useState, useEffect, useCallback } from 'react';
import { expensesAPI, incomeAPI } from '../utils/api';
import { Card, TxItem, EmptyState, Loader, Alert, Badge } from '../components/UI';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.search = search;
      if (fromDate) params.from   = fromDate;
      if (toDate)   params.to     = toDate;

      const [expData, incData] = await Promise.all([
        typeFilter === 'income'  ? { expenses: [] } : expensesAPI.list(params),
        typeFilter === 'expense' ? { income: [] }   : incomeAPI.list(params),
      ]);

      const expenses = (expData.expenses || []).map(e => ({ ...e, type: 'expense', label: e.category }));
      const income   = (incData.income   || []).map(i => ({ ...i, type: 'income',  label: i.source  }));
      let all = [...expenses, ...income].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (catFilter) all = all.filter(t => t.label === catFilter);

      setTransactions(all);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, catFilter, fromDate, toDate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleDelete(type, id) {
    try {
      if (type === 'expense') await expensesAPI.delete(id);
      else await incomeAPI.delete(id);
      setTransactions(prev => prev.filter(t => !(t.id === id && t.type === type)));
    } catch (err) {
      setError(err.message);
    }
  }

  const incTotal  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expTotal = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Collect unique category/source labels for filter
  const allLabels = [...new Set(transactions.map(t => t.label))].sort();

  return (
    <div>
      <div className="page-header">
        <h1>Transaction History</h1>
        <p>All your income and expense records in one place</p>
      </div>

      <Card>
        <div className="filters filters-wrap">
          <input className="filter-input filter-wide" placeholder="🔍 Search transactions..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <input className="filter-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input className="filter-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading
          ? <Loader />
          : transactions.length === 0
            ? <EmptyState icon="📋" message="No transactions match your filters" />
            : transactions.map(t => (
                <TxItem
                  key={`${t.type}-${t.id}`}
                  type={t.type}
                  label={t.label}
                  description={t.description}
                  date={t.date}
                  amount={t.amount}
                  frequency={t.frequency}
                  onDelete={() => handleDelete(t.type, t.id)}
                />
              ))
        }

        {!loading && transactions.length > 0 && (
          <div className="history-summary">
            <div className="divider" />
            <div className="summary-row">
              <span>Filtered income: <strong style={{ color: 'var(--green)' }}>{fmt(incTotal)}</strong></span>
              <span>Filtered expenses: <strong style={{ color: 'var(--red)' }}>{fmt(expTotal)}</strong></span>
              <span>Net: <strong style={{ color: incTotal - expTotal >= 0 ? 'var(--accent)' : 'var(--red)' }}>{fmt(incTotal - expTotal)}</strong></span>
              <Badge variant="default">{transactions.length} records</Badge>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
