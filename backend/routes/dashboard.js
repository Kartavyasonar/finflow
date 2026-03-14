const express = require('express');
const { getDB, get, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/stats', (req, res) => {
  getDB();
  const uid = req.user.id;

  const { total_income }   = get('SELECT COALESCE(SUM(amount), 0) as total_income FROM income WHERE user_id = ?', [uid]);
  const { total_expenses } = get('SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE user_id = ?', [uid]);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const { month_income }   = get('SELECT COALESCE(SUM(amount), 0) as month_income FROM income WHERE user_id = ? AND date >= ? AND date <= ?', [uid, monthStart, monthEnd]);
  const { month_expenses } = get('SELECT COALESCE(SUM(amount), 0) as month_expenses FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?', [uid, monthStart, monthEnd]);

  const categoryBreakdown = all(
    'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC',
    [uid]
  );

  const recentExpenses = all(
    "SELECT id, 'expense' as type, amount, category as label, description, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 10",
    [uid]
  );
  const recentIncome = all(
    "SELECT id, 'income' as type, amount, source as label, description, date FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 10",
    [uid]
  );

  const recentTransactions = [...recentExpenses, ...recentIncome]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const mEnd   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-31`;
    const label  = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

    const { inc } = get('SELECT COALESCE(SUM(amount), 0) as inc FROM income WHERE user_id = ? AND date >= ? AND date <= ?', [uid, mStart, mEnd]);
    const { exp } = get('SELECT COALESCE(SUM(amount), 0) as exp FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?', [uid, mStart, mEnd]);
    trend.push({ month: label, income: inc, expenses: exp });
  }

  res.json({
    stats: {
      total_income, total_expenses,
      balance: total_income - total_expenses,
      savings_rate: total_income > 0 ? Math.round(((total_income - total_expenses) / total_income) * 100) : 0,
      month_income, month_expenses,
      month_balance: month_income - month_expenses,
    },
    categoryBreakdown,
    recentTransactions,
    monthlyTrend: trend,
  });
});

module.exports = router;
