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
}

module.exports = {
  initSchema
};
