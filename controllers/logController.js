import pool from '../database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';

export const register = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'email, username and password required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();

    // vérifier si email ou username existe déjà
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const [result] = await conn.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashed]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    conn.release();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    conn.release();

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
