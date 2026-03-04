import db from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';

export const register = async (req, res) => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ error: "email, username and password required" });
  }

  try {
    console.log('Registering user:', email, username);
    const stmt = db.prepare("INSERT INTO users (email, username, password) VALUES (?, ?, ?)");
    const result = stmt.run(email, username, await bcrypt.hash(password, 10));
    console.log('INSERT result:', result);
    
    if (result.changes === 0) {
      return res.status(400).json({ error: "Email or username already exists" });
    }
    
    res.status(201).json({ message: "User registered successfully", token: jwt.sign(
      { id: result.lastInsertRowid, username }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    ) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: "Email or username already exists" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = stmt.get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
