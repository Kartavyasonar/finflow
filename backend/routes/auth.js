const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDB, run, get } = require('../db/database');
const { signToken, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    getDB();

    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const result = run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    const user = get('SELECT id, name, email, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
    const token = signToken(user);

    res.status(201).json({ message: 'Account created successfully', user, token });
  }
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;
    getDB();

    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    const { password: _pw, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser, token });
  }
);

router.get('/me', authenticate, (req, res) => {
  getDB();
  const user = get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;