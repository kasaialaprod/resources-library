// database/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u860758557_resourceMaster',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u860758557_resourceslib',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Création des tables si besoin
(async () => {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createResources = `
    CREATE TABLE IF NOT EXISTS resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME NOT NULL,
      CONSTRAINT fk_resources_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    const conn = await pool.getConnection();
    await conn.query(createUsers);
    await conn.query(createResources);
    conn.release();
    console.log('Tables users/resources OK');
  } catch (err) {
    console.error('Erreur création tables:', err);
  }
})();

export default pool;
