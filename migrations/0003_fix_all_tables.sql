-- Fix all tables: PostgreSQL syntax -> SQLite/D1 compatible
-- Users table is already fixed, fix the rest

-- Fix devices table
DROP TABLE IF EXISTS device_assignments;
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS ai_decisions;
DROP TABLE IF EXISTS weather;
DROP TABLE IF EXISTS fields;

CREATE TABLE fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT,
    lat REAL,
    lon REAL,
    area_m2 REAL,
    soil_type TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    field_id INTEGER REFERENCES fields(id),
    name TEXT,
    type TEXT,
    status TEXT,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER REFERENCES devices(id),
    name TEXT,
    type TEXT,
    unit TEXT,
    min_value REAL,
    max_value REAL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER REFERENCES sensors(id),
    value REAL,
    created_at TEXT DEFAULT (datetime('now')),
    recorded_at TEXT
);

CREATE TABLE weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER REFERENCES fields(id),
    source TEXT,
    data TEXT,
    recorded_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE ai_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER REFERENCES fields(id),
    decision TEXT,
    reason TEXT,
    confidence INTEGER,
    input_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE device_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER REFERENCES devices(id),
    field_id INTEGER REFERENCES fields(id),
    user_id INTEGER REFERENCES users(id),
    assigned_at TEXT,
    unassigned_at TEXT
);
