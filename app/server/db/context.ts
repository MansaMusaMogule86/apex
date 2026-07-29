import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { schema } from './schema'

export interface DatabaseContext {
  client: Database.Database
  db: BetterSQLite3Database<typeof schema>
  filePath: string
}

export function resolveDatabaseFile(filePath?: string) {
  if (filePath && filePath !== ':memory:') return path.resolve(filePath)
  if (filePath === ':memory:') return filePath
  return path.resolve(process.cwd(), process.env.APEX_DB_FILE ?? 'server/data/apex.sqlite')
}

export function createDatabaseContext(filePath?: string): DatabaseContext {
  const resolved = resolveDatabaseFile(filePath)
  if (resolved !== ':memory:') {
    fs.mkdirSync(path.dirname(resolved), { recursive: true })
  }

  const client = new Database(resolved)
  client.pragma('journal_mode = WAL')
  client.pragma('foreign_keys = ON')

  return {
    client,
    db: drizzle(client, { schema }),
    filePath: resolved,
  }
}

let singleton: DatabaseContext | null = null

export function getDatabaseContext() {
  singleton ??= createDatabaseContext()
  return singleton
}