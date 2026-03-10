-- Migration 0003: users tablosunu uygulamanin bekledigi yapiya getir
DROP TABLE IF EXISTS users_new;
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    username TEXT UNIQUE,
    mail TEXT UNIQUE,
    phone TEXT,
    language TEXT,
    country TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    password_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO users_new (
        id,
        name,
        surname,
        username,
        mail,
        phone,
        language,
        country,
        is_active,
        last_login_at,
        password_hash,
        created_at,
        updated_at
    )
SELECT id,
    name,
    surname,
    NULL,
    email,
    NULL,
    NULL,
    NULL,
    1,
    NULL,
    password,
    COALESCE(created_at, datetime('now')),
    datetime('now')
FROM users;
DROP TABLE users;
ALTER TABLE users_new
    RENAME TO users;