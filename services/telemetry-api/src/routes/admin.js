import express from 'express';
import { query } from '../db.js';
import { authMiddleware, hashPassword, comparePassword, generateToken } from '../auth.js';

const router = express.Router();

// POST /api/v1/ops/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('admin login error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// GET /api/v1/ops/auth/me
router.get('/auth/me', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  res.json({ user: req.user });
});

export default router;
