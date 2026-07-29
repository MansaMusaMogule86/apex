import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { DatabaseContext } from './db/context'
import { createDatabaseContext } from './db/context'
import { runMigrations } from './db/migrate'
import { seedDatabase } from './db/seed'
import { createApiApp } from './app'

interface TempResource {
  filePath: string
  close: () => void
}

export function createSuiteHarness() {
  const tempResources: TempResource[] = []

  return {
    async buildHarness() {
      const filePath = path.join(os.tmpdir(), `apex-${crypto.randomUUID()}.sqlite`)
      const database = createDatabaseContext(filePath)
      tempResources.push({ filePath, close: () => database.client.close() })
      runMigrations(database)
      await seedDatabase(database)
      return { app: createApiApp(database), filePath, database }
    },
    cleanupTempResources() {
      for (const resource of tempResources.splice(0)) {
        resource.close()
        for (const suffix of ['', '-shm', '-wal']) {
          const target = `${resource.filePath}${suffix}`
          if (fs.existsSync(target)) fs.rmSync(target, { force: true })
        }
      }
    },
  }
}

export async function loginAs(
  app: ReturnType<typeof createApiApp>,
  input: { email: string; password?: string; organizationSlug?: string },
) {
  const response = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      password: input.password ?? 'dev-only-password',
      organizationSlug: input.organizationSlug ?? 'apex-demo-realty',
    }),
  })

  const setCookie = response.headers.get('set-cookie') ?? ''
  const cookie = setCookie.split(';')[0] ?? ''
  return { response, cookie }
}

export async function fetchJson(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }
  return response.json()
}

export function readAuditCount(database: DatabaseContext, organizationId: string, action?: string) {
  if (!action) {
    const rows = database.client
      .prepare('SELECT COUNT(*) as count FROM audit_events WHERE organization_id = ?')
      .get(organizationId) as { count: number }
    return rows.count
  }

  const rows = database.client
    .prepare('SELECT COUNT(*) as count FROM audit_events WHERE organization_id = ? AND action = ?')
    .get(organizationId, action) as { count: number }
  return rows.count
}
