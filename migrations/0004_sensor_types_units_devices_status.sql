-- Migration 0004: sensor_types, units tabloları + devices.status INTEGER + sensors FK güncelleme

-- 1. Sensör tipleri tablosu
CREATE TABLE IF NOT EXISTS sensor_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Birim tablosu (her birim bir sensor_type'a bağlı)
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_type_id INTEGER NOT NULL REFERENCES sensor_types(id),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Varsayılan sensör tipleri
INSERT INTO sensor_types (name, label, icon) VALUES ('temperature', 'Sıcaklık', 'thermostat');
INSERT INTO sensor_types (name, label, icon) VALUES ('humidity', 'Nem', 'water_drop');
INSERT INTO sensor_types (name, label, icon) VALUES ('soil_moisture', 'Toprak Nemi', 'opacity');
INSERT INTO sensor_types (name, label, icon) VALUES ('ph', 'pH', 'science');
INSERT INTO sensor_types (name, label, icon) VALUES ('light', 'Işık', 'wb_sunny');
INSERT INTO sensor_types (name, label, icon) VALUES ('pressure', 'Basınç', 'compress');
INSERT INTO sensor_types (name, label, icon) VALUES ('wind_speed', 'Rüzgar Hızı', 'air');
INSERT INTO sensor_types (name, label, icon) VALUES ('rain', 'Yağmur', 'umbrella');

-- 4. Varsayılan birimler (sensor_type_id sırasıyla 1-8)
-- Sıcaklık (1)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (1, 'Celsius', '°C', 1);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (1, 'Fahrenheit', '°F', 0);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (1, 'Kelvin', 'K', 0);
-- Nem (2)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (2, 'Yüzde', '%', 1);
-- Toprak Nemi (3)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (3, 'Yüzde', '%', 1);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (3, 'cb (Centibar)', 'cb', 0);
-- pH (4)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (4, 'pH', 'pH', 1);
-- Işık (5)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (5, 'Lux', 'lux', 1);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (5, 'Foot-candle', 'fc', 0);
-- Basınç (6)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (6, 'Hektopaskal', 'hPa', 1);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (6, 'Bar', 'bar', 0);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (6, 'PSI', 'psi', 0);
-- Rüzgar Hızı (7)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (7, 'Metre/saniye', 'm/s', 1);
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (7, 'Kilometre/saat', 'km/h', 0);
-- Yağmur (8)
INSERT INTO units (sensor_type_id, name, symbol, is_default) VALUES (8, 'Milimetre', 'mm', 1);

-- 5. Devices tablosunu yeniden oluştur (status TEXT -> INTEGER)
CREATE TABLE devices_new (
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
INSERT INTO devices_new (id, user_id, field_id, name, type, status, location, created_at, updated_at)
    SELECT id, user_id, field_id, name, type, CASE WHEN status = 'active' THEN 1 ELSE 0 END, location, created_at, updated_at FROM devices;
DROP TABLE devices;
ALTER TABLE devices_new RENAME TO devices;

-- 6. Sensors tablosunu yeniden oluştur (type TEXT -> type_id FK, unit TEXT -> unit_id FK)
CREATE TABLE sensors_new (
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
-- Mevcut sensör verilerini taşı (varsa)
INSERT INTO sensors_new (id, device_id, name, type_id, unit_id, min_value, max_value, created_at, updated_at)
    SELECT s.id, s.device_id, s.name,
        COALESCE((SELECT st.id FROM sensor_types st WHERE st.name = s.type), 1),
        COALESCE((SELECT u.id FROM units u JOIN sensor_types st ON u.sensor_type_id = st.id WHERE st.name = s.type AND u.is_default = 1), 1),
        s.min_value, s.max_value, s.created_at, s.updated_at
    FROM sensors s;
DROP TABLE sensors;
ALTER TABLE sensors_new RENAME TO sensors;
