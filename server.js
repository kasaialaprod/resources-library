import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/authMiddleware.js';
import db from './database/db.js';

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
app.get('/api/me/resources', requireAuth, async (req, res) => {
  try {
    const rows = await db.allAsync(
      'SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Resources error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/me/resources', requireAuth, async (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'title and url required' });
  }

  try {
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO resources (user_id, title, url, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, url, description || null, now]
    );

    const created = await db.getAsync(
      'SELECT * FROM resources WHERE user_id = ? AND title = ? AND url = ? ORDER BY id DESC LIMIT 1',
      [req.user.id, title, url]
    );

    res.status(201).json(created);
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
