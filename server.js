import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database/db.js';
import { requireAuth } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500','https://resources-library.com','slateblue-dog-126964.hostingersite.com'],
  credentials: true
}));
app.use(express.json());

// Static + landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// Routes auth (login/register déjà OK)
app.use('/api/auth', authRoutes);

// Route API protégée
// GET ressources perso
app.get('/api/me/resources', requireAuth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error('Resources error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST nouvelle ressource
app.post('/api/me/resources', requireAuth, async (req, res) => {
  const { title, url, description } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: 'title and url required' });
  }

  try {
    const now = new Date(); // DATETIME

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO resources (user_id, title, url, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, url, description || null, now]
    );

    const insertedId = result.insertId;

    const [rows] = await conn.query(
      'SELECT * FROM resources WHERE id = ?',
      [insertedId]
    );
    conn.release();

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Insert resource error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Une route pour récupérer le profil
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.listen(PORT, () => {
  console.log(`Serveur sur le port ${PORT}/ → index.html`);
});
