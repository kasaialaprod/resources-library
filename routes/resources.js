import db from './database/db.js';
import { requireAuth } from './middleware/authMiddleware.js';

app.post('/api/me/resources', requireAuth, (req, res) => {
  const { title, category } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title required' });
  }

  try {
    const now = new Date().toISOString();

    const stmt = db.prepare(
      'INSERT INTO resources (user_id, title, category, created_at) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(req.user.id, title, category || null, now);

    res.status(201).json({
      id: result.lastInsertRowid,
      user_id: req.user.id,
      title,
      category,
      created_at: now
    });
  } catch (err) {
    console.error('Insert resource error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
