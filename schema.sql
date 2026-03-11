PRAGMA defer_foreign_keys = TRUE;
CREATE TABLE d1_migrations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE ai_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recommendation TEXT,
    soil_moisture REAL,
    temperature REAL,
    humidity REAL,
    weather_description TEXT,
    rain_probability REAL,
    recommendation_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS "users" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    username TEXT NOT NULL UNIQUE,
    mail TEXT NOT NULL UNIQUE,
    phone TEXT,
    language TEXT,
    country TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
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
CREATE TABLE sensor_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_type_id INTEGER NOT NULL REFERENCES sensor_types(id),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS "devices" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    field_id INTEGER REFERENCES fields(id),
    name TEXT,
    type TEXT,
    status INTEGER DEFAULT 1,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS "sensors" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER REFERENCES devices(id),
    name TEXT,
    type_id INTEGER NOT NULL REFERENCES sensor_types(id),
    unit_id INTEGER NOT NULL REFERENCES units(id),
    min_value REAL,
    max_value REAL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
DELETE FROM sqlite_sequence;
CREATE UNIQUE INDEX idx_units_type_name_symbol ON units(sensor_type_id, name, symbol);