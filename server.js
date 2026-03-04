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
const PORT = 3000;

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
app.get('/api/me/resources', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare(
      'SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC'
    );
    const rows = stmt.all(req.user.id);   // ← espace unique: filtré par id de l’utilisateur
    console.log('rows =', rows);
    res.json(rows);
  } catch (err) {
    console.error('Resources error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/me/resources', requireAuth, (req, res) => {
  const { title, url, description } = req.body;
  console.log('POST /api/me/resources body =', req.body, 'user =', req.user);

  if (!title || !url) {
    return res.status(400).json({ error: 'title and url required' });
  }

  try {
    const now = new Date().toISOString();

    const stmt = db.prepare(
      'INSERT INTO resources (user_id, title, url, description, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      req.user.id,
      title,
      url,
      description || null,
      now
    );
    console.log('INSERT result =', result);

    res.status(201).json({
      id: result.lastInsertRowid,
      user_id: req.user.id,
      title,
      url,
      description: description || null,
      created_at: now
    });
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
  console.log(`Serveur sur http://localhost:${PORT}/ → index.html`);
});
