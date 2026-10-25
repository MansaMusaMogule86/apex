import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePg, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from './schema'

export interface DatabaseContext {
  client: Database.Database | postgres.Sql
  db: BetterSQLite3Database<typeof schema> | PostgresJsDatabase<typeof schema>
  filePath: string
  isSupabase: boolean
}

export function resolveDatabaseFile(filePath?: string) {
  if (filePath && filePath !== ':memory:') return path.resolve(filePath)
  if (filePath === ':memory:') return filePath
  return path.resolve(process.cwd(), process.env.APEX_DB_FILE ?? 'server/data/apex.sqlite')
}

export function createSqliteDatabaseContext(filePath?: string): DatabaseContext {
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
    isSupabase: false,
  }
}

export function createSupabaseDatabaseContext(): DatabaseContext {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL for Supabase connection')
  }

  const client = postgres(connectionString, { 
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })

  return {
    client,
    db: drizzlePg(client, { schema }),
    filePath: 'supabase',
    isSupabase: true,
  }
}

export function createDatabaseContext(filePath?: string): DatabaseContext {
  // Use Supabase if DATABASE_URL is set and not in local development
  const useSupabase = process.env.DATABASE_URL && process.env.NODE_ENV === 'production'
  
  if (useSupabase) {
    return createSupabaseDatabaseContext()
  }
  
  return createSqliteDatabaseContext(filePath)
}

let singleton: DatabaseContext | null = null

export function getDatabaseContext() {
  singleton ??= createDatabaseContext()
  return singleton
}