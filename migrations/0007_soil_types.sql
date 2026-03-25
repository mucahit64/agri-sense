-- 0007_soil_types.sql
-- Toprak tipleri tablosu: sistem tanımlı + kullanıcı tanımlı (admin onaylı)
CREATE TABLE IF NOT EXISTS soil_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_by INTEGER NULL,
    is_system INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
);
-- Sistem toprak tiplerini ekle
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Killi', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Kumlu', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Tınlı', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Killi Tınlı', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Kumlu Tınlı', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Humuslu', 1, 1, NULL);
INSERT
    OR IGNORE INTO soil_types (name, is_system, is_approved, created_by)
VALUES ('Kireçli', 1, 1, NULL);