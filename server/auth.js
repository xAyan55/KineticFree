import url from 'node:url';
import {
  registerUser,
  loginUser,
  upsertDiscordUser,
  createSession,
  getUserBySession,
  deleteSession,
  db,
} from './db.js';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

export function handleAuthMiddleware(req, res, next) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (!pathname.startsWith('/api/')) {
    return next();
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Helper to extract session ID from cookie or Authorization header
  const cookies = parseCookies(req);
  const authHeader = req.headers.authorization;
  const sessionId = cookies.session_id || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  // 1. Current Session / User Info
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getUserBySession(sessionId);
    if (!user) {
      return sendJson(res, 200, { user: null });
    }
    return sendJson(res, 200, { user });
  }

  // 2. Email Register
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    parseBody(req).then((body) => {
      try {
        const { email, password, username } = body;
        const user = registerUser(email, password, username);
        const newSessionId = createSession(user.id);

        res.setHeader(
          'Set-Cookie',
          `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        );
        sendJson(res, 200, { ok: true, user, sessionId: newSessionId });
      } catch (err) {
        sendJson(res, 400, { ok: false, message: err.message });
      }
    });
    return;
  }

  // 3. Email Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    parseBody(req).then((body) => {
      try {
        const { email, password } = body;
        const user = loginUser(email, password);
        const newSessionId = createSession(user.id);

        res.setHeader(
          'Set-Cookie',
          `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        );
        sendJson(res, 200, { ok: true, user, sessionId: newSessionId });
      } catch (err) {
        sendJson(res, 400, { ok: false, message: err.message });
      }
    });
    return;
  }

  // 4. Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    if (sessionId) {
      deleteSession(sessionId);
    }
    res.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; Max-Age=0');
    return sendJson(res, 200, { ok: true });
  }

  // 5. Discord Login Initiator
  if (pathname === '/api/auth/discord' && req.method === 'GET') {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5173/api/auth/discord/callback';

    if (!clientId || clientId === 'your_discord_client_id_here') {
      // In dev mode without real Discord App credentials, support simulated Discord login or inform user
      const isSimulate = parsedUrl.query.simulate === 'true';
      if (isSimulate) {
        const mockDiscordUser = {
          id: '123456789012345678',
          username: 'DiscordGamer_' + Math.floor(Math.random() * 1000),
          email: 'discord_player@example.com',
          avatar: null,
        };
        const user = upsertDiscordUser(mockDiscordUser);
        const newSessionId = createSession(user.id);
        res.writeHead(302, {
          'Set-Cookie': `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
          Location: '/?auth=discord_success',
        });
        res.end();
        return;
      }

      return sendJson(res, 200, {
        configured: false,
        message: 'Discord OAuth credentials not configured in .env yet.',
        hint: 'Set DISCORD_CLIENT_ID & DISCORD_CLIENT_SECRET in .env, or use ?simulate=true for dev testing with real SQLite persistence.',
        simulateUrl: '/api/auth/discord?simulate=true',
      });
    }

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=identify%20email`;

    res.writeHead(302, { Location: discordAuthUrl });
    res.end();
    return;
  }

  // 6. Discord OAuth Callback
  if (pathname === '/api/auth/discord/callback' && req.method === 'GET') {
    const code = parsedUrl.query.code;
    if (!code) {
      res.writeHead(302, { Location: '/?auth_error=missing_code' });
      res.end();
      return;
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5173/api/auth/discord/callback';

    // Exchange code for token
    fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }),
    })
      .then((tokenRes) => tokenRes.json())
      .then(async (tokenData) => {
        if (!tokenData.access_token) {
          throw new Error('Failed to obtain Discord access token');
        }

        const userRes = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const discordUser = await userRes.json();

        const user = upsertDiscordUser(discordUser);
        const newSessionId = createSession(user.id);

        res.writeHead(302, {
          'Set-Cookie': `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
          Location: '/?auth=discord_success',
        });
        res.end();
      })
      .catch((err) => {
        console.error('Discord callback error:', err);
        res.writeHead(302, { Location: '/?auth_error=' + encodeURIComponent(err.message) });
        res.end();
      });
    return;
  }

  // 7. Admin Endpoint: List Users from SQLite
  if (pathname === '/api/admin/users' && req.method === 'GET') {
    const user = getUserBySession(sessionId);
    if (!user || user.role !== 'admin') {
      return sendJson(res, 403, { ok: false, message: 'Forbidden. Admin credentials required.' });
    }

    const allUsers = db.prepare('SELECT id, email, username, role, discord_id, created_at FROM users ORDER BY created_at DESC').all();
    return sendJson(res, 200, { ok: true, users: allUsers });
  }

  next();
}
