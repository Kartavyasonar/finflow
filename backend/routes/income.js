const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB, run, get, all } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const VALID_SOURCES = [
  '💼 Salary','🏆 Bonus','💻 Freelance','📈 Investments',
  '🏢 Business','🎓 Scholarship','🎁 Gift','💰 Other',
];
const VALID_FREQUENCIES = ['one-time','weekly','bi-weekly','monthly','annually'];

router.get('/', (req, res) => {
  getDB();
  const { search, source, frequency, from, to, page = 1, limit = 50 } = req.query;

  let query = 'SELECT * FROM income WHERE user_id = ?';
  const params = [req.user.id];

  if (source)    { query += ' AND source = ?';    params.push(source); }
  if (frequency) { query += ' AND frequency = ?'; params.push(frequency); }
  if (from)      { query += ' AND date >= ?';     params.push(from); }
  if (to)        { query += ' AND date <= ?';     params.push(to); }
  if (search)    {
    query += ' AND (source LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY date DESC, created_at DESC';
  query += ` LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;

  const income = all(query, params);
  res.json({ income, total: income.length });
});

router.post('/',
  [
    body('amount').isFloat({ gt: 0 }),
    body('source').isIn(VALID_SOURCES),
    body('date').isDate(),
    body('frequency').optional().isIn(VALID_FREQUENCIES),
    body('description').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    getDB();
    const { amount, source, date, frequency = 'one-time', description = '' } = req.body;
    const result = run(
      'INSERT INTO income (user_id, amount, source, description, frequency, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, amount, source, description, frequency, date]
    );
    const income = get('SELECT * FROM income WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ message: 'Income recorded', income });
  }
);

router.put('/:id', (req, res) => {
  getDB();
  const existing = get('SELECT * FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: 'Income not found' });

  const { amount, source, date, frequency, description } = req.body;
  run(
    `UPDATE income SET amount = COALESCE(?, amount), source = COALESCE(?, source),
     date = COALESCE(?, date), frequency = COALESCE(?, frequency),
     description = COALESCE(?, description) WHERE id = ? AND user_id = ?`,
    [amount ?? null, source ?? null, date ?? null, frequency ?? null, description ?? null, req.params.id, req.user.id]
  );
  const updated = get('SELECT * FROM income WHERE id = ?', [req.params.id]);
  res.json({ message: 'Income updated', income: updated });
});

router.delete('/:id', (req, res) => {
  getDB();
  const existing = get('SELECT id FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: 'Income not found' });
  run('DELETE FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Income deleted' });
});

module.exports = router;