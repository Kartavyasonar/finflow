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
  const { search, category, from, to, page = 1, limit = 50 } = req.query;

  let query = 'SELECT * FROM expenses WHERE user_id = ?';
  const params = [req.user.id];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (from)     { query += ' AND date >= ?';    params.push(from); }
  if (to)       { query += ' AND date <= ?';    params.push(to); }
  if (search)   {
    query += ' AND (category LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY date DESC, created_at DESC';
  query += ` LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;

  const expenses = all(query, params);
  res.json({ expenses, total: expenses.length });
});

router.post('/',
  [
    body('amount').isFloat({ gt: 0 }),
    body('category').isIn(VALID_CATEGORIES),
    body('date').isDate(),
    body('description').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    getDB();
    const { amount, category, date, description = '' } = req.body;
    const result = run(
      'INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, amount, category, description, date]
    );
    const expense = get('SELECT * FROM expenses WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ message: 'Expense added', expense });
  }
);

router.put('/:id', (req, res) => {
  getDB();
  const existing = get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });

  const { amount, category, date, description } = req.body;
  run(
    `UPDATE expenses SET amount = COALESCE(?, amount), category = COALESCE(?, category),
     date = COALESCE(?, date), description = COALESCE(?, description)
     WHERE id = ? AND user_id = ?`,
    [amount ?? null, category ?? null, date ?? null, description ?? null, req.params.id, req.user.id]
  );
  const updated = get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
  res.json({ message: 'Expense updated', expense: updated });
});

router.delete('/:id', (req, res) => {
  getDB();
  const existing = get('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });
  run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Expense deleted' });
});

module.exports = router;