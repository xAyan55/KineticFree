import { db } from "./database.js"

export function initializeSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      root_admin INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      avatar_url TEXT,
      memory_limit INTEGER NOT NULL DEFAULT 4096,
      cpu_limit INTEGER NOT NULL DEFAULT 200,
      disk_limit INTEGER NOT NULL DEFAULT 10240,
      server_limit INTEGER NOT NULL DEFAULT 3,
      two_factor_secret TEXT,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      email_verified INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location_id TEXT NOT NULL DEFAULT 'local',
      location TEXT NOT NULL DEFAULT 'Local',
      fqdn TEXT NOT NULL,
      scheme TEXT NOT NULL DEFAULT 'http',
      status TEXT NOT NULL DEFAULT 'offline',
      memory INTEGER NOT NULL DEFAULT 8192,
      memory_overallocate INTEGER NOT NULL DEFAULT 0,
      disk INTEGER NOT NULL DEFAULT 51200,
      disk_overallocate INTEGER NOT NULL DEFAULT 0,
      daemon_listen INTEGER NOT NULL DEFAULT 8080,
      daemon_sftp INTEGER NOT NULL DEFAULT 2022,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      ip TEXT NOT NULL,
      port INTEGER NOT NULL,
      alias TEXT,
      assigned INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      server_id TEXT,
      UNIQUE(node_id, ip, port)
    );

    CREATE TABLE IF NOT EXISTS eggs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Minecraft',
      author TEXT NOT NULL DEFAULT 'KineticHost',
      docker_image TEXT NOT NULL,
      startup_command TEXT NOT NULL,
      stop_command TEXT NOT NULL DEFAULT 'stop',
      install_script TEXT,
      supported_versions TEXT, -- JSON array
      variables TEXT, -- JSON array of EggVariable
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      uuid TEXT NOT NULL UNIQUE,
      identifier TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      node_id TEXT NOT NULL REFERENCES nodes(id),
      allocation_id TEXT REFERENCES allocations(id),
      egg_id TEXT REFERENCES eggs(id),
      status TEXT NOT NULL DEFAULT 'offline',
      suspended INTEGER NOT NULL DEFAULT 0,
      memory INTEGER NOT NULL DEFAULT 1024,
      cpu INTEGER NOT NULL DEFAULT 100,
      disk INTEGER NOT NULL DEFAULT 5120,
      swap INTEGER NOT NULL DEFAULT 0,
      io INTEGER NOT NULL DEFAULT 500,
      databases_limit INTEGER NOT NULL DEFAULT 2,
      backups_limit INTEGER NOT NULL DEFAULT 2,
      allocations_limit INTEGER NOT NULL DEFAULT 1,
      startup TEXT,
      environment TEXT, -- JSON object
      docker_image TEXT,
      installed_at TEXT,
      suspended_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS databases (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      host TEXT NOT NULL DEFAULT '127.0.0.1',
      port INTEGER NOT NULL DEFAULT 3306,
      max_connections INTEGER NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      bytes INTEGER NOT NULL DEFAULT 0,
      is_successful INTEGER NOT NULL DEFAULT 0,
      is_locked INTEGER NOT NULL DEFAULT 0,
      checksum TEXT,
      status TEXT NOT NULL DEFAULT 'queued',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      cron TEXT NOT NULL DEFAULT '0 0 * * *',
      is_active INTEGER NOT NULL DEFAULT 1,
      only_when_online INTEGER NOT NULL DEFAULT 1,
      last_run_at TEXT,
      next_run_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedule_tasks (
      id TEXT PRIMARY KEY,
      schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      sequence_id INTEGER NOT NULL DEFAULT 1,
      action TEXT NOT NULL DEFAULT 'command',
      payload TEXT NOT NULL DEFAULT '',
      time_offset INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS server_subusers (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permissions TEXT NOT NULL, -- JSON array of ServerPermission
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(server_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      identifier TEXT UNIQUE NOT NULL,
      token_hash TEXT NOT NULL,
      description TEXT,
      allowed_ips TEXT,
      last_used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      actor_name TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT NOT NULL,
      ip TEXT,
      metadata TEXT, -- JSON object
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indices
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_servers_owner ON servers(owner_id);
    CREATE INDEX IF NOT EXISTS idx_allocations_node ON allocations(node_id);
    CREATE INDEX IF NOT EXISTS idx_allocations_server ON allocations(server_id);
    CREATE INDEX IF NOT EXISTS idx_databases_server ON databases(server_id);
    CREATE INDEX IF NOT EXISTS idx_backups_server ON backups(server_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_server ON schedules(server_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_tasks_schedule ON schedule_tasks(schedule_id);
    CREATE INDEX IF NOT EXISTS idx_subusers_server ON server_subusers(server_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
  `)
}
