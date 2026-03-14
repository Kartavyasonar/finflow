const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB, run, get, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const VALID_CATEGORIES = [
  '🍔 Food & Dining','🚗 Transportation','🛒 Groceries','🏠 Housing & Rent',
  '💡 Utilities','🎬 Entertainment','👕 Clothing','💊 Healthcare',
  '📚 Education','✈️ Travel','💻 Technology','🎁 Gifts','📦 Other',
];

router.get('/', (req, res) => {
  getDB();
  const budgets = all('SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const spending = all(
    `SELECT category, SUM(amount) as spent FROM expenses
     WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY category`,
    [req.user.id, monthStart, monthEnd]
  );

  const spendingMap = Object.fromEntries(spending.map(s => [s.category, s.spent]));
  const budgetsWithProgress = budgets.map(b => ({
    ...b,
    spent: spendingMap[b.category] || 0,
    percentage: Math.round(((spendingMap[b.category] || 0) / b.monthly_limit) * 100),
  }));

  res.json({ budgets: budgetsWithProgress });
});

router.post('/',
  [
    body('category').isIn(VALID_CATEGORIES),
    body('monthly_limit').isFloat({ gt: 0 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    getDB();
    const { category, monthly_limit } = req.body;
    run(
      `INSERT INTO budgets (user_id, category, monthly_limit) VALUES (?, ?, ?)
       ON CONFLICT(user_id, category) DO UPDATE SET monthly_limit = excluded.monthly_limit`,
      [req.user.id, category, monthly_limit]
    );
    const budget = get('SELECT * FROM budgets WHERE user_id = ? AND category = ?', [req.user.id, category]);
    res.status(201).json({ message: 'Budget saved', budget });
  }
);

router.delete('/:id', (req, res) => {
  getDB();
  const existing = get('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: 'Budget not found' });
  run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Budget deleted' });
});

module.exports = router;