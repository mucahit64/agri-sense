-- Migration 0005: Ensure sensor_types + units exist and are seeded idempotently
CREATE TABLE IF NOT EXISTS sensor_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    label TEXT,
    icon TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_type_id INTEGER NOT NULL REFERENCES sensor_types(id),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_units_type_name_symbol ON units(sensor_type_id, name, symbol);
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('temperature', 'Sıcaklık', 'thermostat');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('humidity', 'Nem', 'water_drop');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('soil_moisture', 'Toprak Nemi', 'opacity');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('ph', 'pH', 'science');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('light', 'Işık', 'wb_sunny');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('pressure', 'Basınç', 'compress');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('wind_speed', 'Rüzgar Hızı', 'air');
INSERT
    OR IGNORE INTO sensor_types (name, label, icon)
VALUES ('rain', 'Yağmur', 'umbrella');
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Celsius',
    '°C',
    1
FROM sensor_types
WHERE name = 'temperature';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Fahrenheit',
    '°F',
    0
FROM sensor_types
WHERE name = 'temperature';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Kelvin',
    'K',
    0
FROM sensor_types
WHERE name = 'temperature';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Yüzde',
    '%',
    1
FROM sensor_types
WHERE name = 'humidity';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Yüzde',
    '%',
    1
FROM sensor_types
WHERE name = 'soil_moisture';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'cb (Centibar)',
    'cb',
    0
FROM sensor_types
WHERE name = 'soil_moisture';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'pH',
    'pH',
    1
FROM sensor_types
WHERE name = 'ph';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Lux',
    'lux',
    1
FROM sensor_types
WHERE name = 'light';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Foot-candle',
    'fc',
    0
FROM sensor_types
WHERE name = 'light';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Hektopaskal',
    'hPa',
    1
FROM sensor_types
WHERE name = 'pressure';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Bar',
    'bar',
    0
FROM sensor_types
WHERE name = 'pressure';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'PSI',
    'psi',
    0
FROM sensor_types
WHERE name = 'pressure';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Metre/saniye',
    'm/s',
    1
FROM sensor_types
WHERE name = 'wind_speed';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Kilometre/saat',
    'km/h',
    0
FROM sensor_types
WHERE name = 'wind_speed';
INSERT
    OR IGNORE INTO units (sensor_type_id, name, symbol, is_default)
SELECT id,
    'Milimetre',
    'mm',
    1
FROM sensor_types
WHERE name = 'rain';