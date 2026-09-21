import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

// Ensure data directory exists
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'kinetic.db');
export const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    salt TEXT,
    discord_id TEXT UNIQUE,
    username TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Password hashing utility using native node:crypto
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Seed admin account from .env
export function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kinetichost.net';
  const adminPassword = process.env.ADMIN_PASSWORD || 'KineticAdmin2026!';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existing) {
    const id = 'usr_admin_' + crypto.randomUUID().slice(0, 8);
    const { hash, salt } = hashPassword(adminPassword);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, username, role)
      VALUES (?, ?, ?, ?, ?, 'admin')
    `).run(id, adminEmail, hash, salt, 'Administrator');
    console.log(`[Database] Seeded default admin account: ${adminEmail}`);
  }
}

// User methods
export function registerUser(email, password, username) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const id = 'usr_' + crypto.randomUUID();
  const { hash, salt } = hashPassword(password);
  const name = username?.trim() || cleanEmail.split('@')[0];

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, username, role)
    VALUES (?, ?, ?, ?, ?, 'user')
  `).run(id, cleanEmail, hash, salt, name);

  return { id, email: cleanEmail, username: name, role: 'user' };
}

export function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (!user || !user.password_hash || !user.salt) {
    throw new Error('Invalid email or password.');
  }

  if (!verifyPassword(password, user.password_hash, user.salt)) {
    throw new Error('Invalid email or password.');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar_url: user.avatar_url,
  };
}

export function upsertDiscordUser(discordUser) {
  const { id: discord_id, username, email, avatar } = discordUser;
  const avatar_url = avatar ? `https://cdn.discordapp.com/avatars/${discord_id}/${avatar}.png` : null;

  const existing = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discord_id);
  if (existing) {
    db.prepare('UPDATE users SET username = ?, avatar_url = ? WHERE id = ?').run(username, avatar_url, existing.id);
    return { id: existing.id, email: existing.email, username, avatar_url, role: existing.role };
  }

  // Also check if email matches
  if (email) {
    const existingByEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingByEmail) {
      db.prepare('UPDATE users SET discord_id = ?, avatar_url = ? WHERE id = ?').run(discord_id, avatar_url, existingByEmail.id);
      return { id: existingByEmail.id, email: existingByEmail.email, username: existingByEmail.username, avatar_url, role: existingByEmail.role };
    }
  }

  const id = 'usr_dc_' + crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, email, discord_id, username, avatar_url, role)
    VALUES (?, ?, ?, ?, ?, 'user')
  `).run(id, email?.toLowerCase() || null, discord_id, username, avatar_url);

  return { id, email, username, avatar_url, role: 'user' };
}

// Session management
export function createSession(userId) {
  const sessionId = 'ses_' + crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(sessionId, userId);
  return sessionId;
}

export function getUserBySession(sessionId) {
  if (!sessionId) return null;
  const row = db.prepare(`
    SELECT u.id, u.email, u.username, u.avatar_url, u.role, u.discord_id
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(sessionId);
  return row || null;
}

export function deleteSession(sessionId) {
  if (!sessionId) return;
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// Seed admin on module load
try {
  seedAdmin();
} catch (e) {
  console.error('Admin seed warning:', e);
}
