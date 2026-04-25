// routes/projects.js
const express = require('express');
const router  = express.Router();
const db   = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/projects — public
router.get('/', async (req, res) => {
  const { category, featured } = req.query;
  let sql    = 'SELECT * FROM projects WHERE 1=1';
  const args = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?'; args.push(category);
  }
  if (featured === '1') {
    sql += ' AND is_featured = 1';
  }
  sql += ' ORDER BY is_featured DESC, year DESC, sort_order ASC';

  try {
    const [rows] = await db.execute(sql, args);
    // Parse JSON field
    const parsed = rows.map(r => ({
      ...r,
      tech_stack: r.tech_stack ? JSON.parse(r.tech_stack) : [],
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/projects/:id — public
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await db.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan.' });
    row.tech_stack = row.tech_stack ? JSON.parse(row.tech_stack) : [];
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/projects — admin only
router.post('/', auth, async (req, res) => {
  const { title, description, category, tech_stack, demo_url, github_url, is_featured, year } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO projects (title, description, category, tech_stack, demo_url, github_url, is_featured, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, JSON.stringify(tech_stack || []), demo_url, github_url, is_featured || 0, year]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/projects/:id — admin only
router.put('/:id', auth, async (req, res) => {
  const { title, description, category, tech_stack, demo_url, github_url, is_featured, year } = req.body;
  try {
    await db.execute(
      `UPDATE projects SET title=?, description=?, category=?, tech_stack=?,
       demo_url=?, github_url=?, is_featured=?, year=? WHERE id=?`,
      [title, description, category, JSON.stringify(tech_stack || []), demo_url, github_url, is_featured || 0, year, req.params.id]
    );
    res.json({ success: true, message: 'Proyek diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/projects/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Proyek dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;


// =========================================================
// routes/skills.js
// =========================================================
const skillsRouter = express.Router();

// GET /api/skills — public
skillsRouter.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM skills ORDER BY category, sort_order, name'
    );
    // Group by category
    const grouped = rows.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/skills — admin only
skillsRouter.post('/', auth, async (req, res) => {
  const { name, category, level, sort_order } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)',
      [name, category, level || 'intermediate', sort_order || 0]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/skills/:id — admin only
skillsRouter.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM skills WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// =========================================================
// routes/auth.js
// =========================================================
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const authRouter = express.Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }
  try {
    const [[admin]] = await db.execute('SELECT * FROM admin WHERE username = ?', [username]);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/auth/verify
authRouter.get('/verify', auth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/change-password
authRouter.post('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [[admin]] = await db.execute('SELECT * FROM admin WHERE id = ?', [req.admin.id]);
    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) return res.status(401).json({ success: false, message: 'Password lama salah.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.execute('UPDATE admin SET password = ? WHERE id = ?', [hashed, req.admin.id]);
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// =========================================================
// routes/stats.js
// =========================================================
const statsRouter = express.Router();

// GET /api/stats — public (summary untuk dashboard)
statsRouter.get('/', auth, async (req, res) => {
  try {
    const [[{ totalMessages }]] = await db.execute('SELECT COUNT(*) AS totalMessages FROM contacts');
    const [[{ unreadMessages }]] = await db.execute('SELECT COUNT(*) AS unreadMessages FROM contacts WHERE is_read = 0');
    const [[{ totalProjects }]]  = await db.execute('SELECT COUNT(*) AS totalProjects FROM projects');
    const [[{ totalVisitors }]]  = await db.execute('SELECT COUNT(*) AS totalVisitors FROM visitor_logs');
    const [recentContacts] = await db.execute(
      'SELECT id, name, email, subject, created_at FROM contacts ORDER BY created_at DESC LIMIT 5'
    );
    res.json({
      success: true,
      stats: { totalMessages, unreadMessages, totalProjects, totalVisitors },
      recentContacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/stats/visit — log visitor
statsRouter.post('/visit', async (req, res) => {
  const { page } = req.body;
  const ip       = req.ip || req.connection.remoteAddress;
  const ua       = req.headers['user-agent'];
  const ref      = req.headers['referer'] || '';
  try {
    await db.execute(
      'INSERT INTO visitor_logs (page, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)',
      [page || '/', ip, ua, ref]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = {
  projectsRouter: router,
  skillsRouter,
  authRouter,
  statsRouter,
};
