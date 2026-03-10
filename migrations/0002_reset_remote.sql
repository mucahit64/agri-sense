-- Remote D1 Migration: Tabloları yeniden oluştur
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS ai_recommendations;
DROP TABLE IF EXISTS device_assignments;
DROP TABLE IF EXISTS ai_decisions;
DROP TABLE IF EXISTS weather;
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS fields;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS sensor_types;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    device_uid TEXT UNIQUE,
    device_name TEXT,
    is_active INTEGER DEFAULT 1,
    last_seen_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER REFERENCES devices(id),
    sensor_uid TEXT,
    sensor_type TEXT,
    name TEXT,
    pin TEXT,
    unit TEXT,
    min_value REAL,
    max_value REAL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER REFERENCES sensors(id),
    value REAL,
    recorded_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ai_recommendations (
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
-- Test kullanıcısı ekle
INSERT INTO users (name, surname, email, password)
VALUES ('Test', 'User', 'test@test.com', '123456');
PRAGMA foreign_keys = ON;