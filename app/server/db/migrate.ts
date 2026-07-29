import fs from 'node:fs'
import path from 'node:path'
import { createDatabaseContext, getDatabaseContext } from './context'

export function runMigrations(database = getDatabaseContext()) {
  const migrationsDir = path.resolve(process.cwd(), 'server/db/migrations')
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()

  database.client.exec(
    'CREATE TABLE IF NOT EXISTS apex_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  )

  const applied = new Set<string>(
    database.client.prepare('SELECT name FROM apex_migrations ORDER BY id').all().map((row) => String((row as { name: string }).name)),
  )

  for (const file of files) {
    if (applied.has(file)) continue
    const sqlText = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    const tx = database.client.transaction(() => {
      database.client.exec(sqlText)
      database.client.prepare('INSERT INTO apex_migrations (name) VALUES (?)').run(file)
    })
    tx()
  }

  return files.length
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const dbFile = process.argv[2]
  const context = dbFile ? createDatabaseContext(dbFile) : getDatabaseContext()
  runMigrations(context)
  console.log(`Migrations applied against ${context.filePath}`)
}