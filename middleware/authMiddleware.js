import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // { id, username } comme tu l’as mis dans logController
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
