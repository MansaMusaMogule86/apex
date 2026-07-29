import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('crm companies persistence', () => {
  test('returns an API-backed companies collection for authorized users', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const response = await app.request('/api/crm/companies', {
      headers: { Cookie: login.cookie },
    })

    expect(response.status).toBe(200)
    const rows = await response.json()
    expect(Array.isArray(rows)).toBe(true)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
      kind: expect.any(String),
    }))
  })

  test('rejects unauthenticated companies access', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const response = await app.request('/api/crm/companies')
    expect(response.status).toBe(401)
  })
})
