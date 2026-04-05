const fs = require('fs');
const path = require('path');

async function initSchema(db, query) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await query(db, statement);
  }

  const alters = [
    'ALTER TABLE users ADD COLUMN is_disabled TINYINT(1) NOT NULL DEFAULT 0',
    'ALTER TABLE users ADD COLUMN disabled_at TIMESTAMP NULL DEFAULT NULL'
  ];

  for (const stmt of alters) {
    try {
      await query(db, stmt);
    } catch (err) {
      if (!(err && (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME'))) {
        throw err;
      }
    }
  }
}

module.exports = {
  initSchema
};
