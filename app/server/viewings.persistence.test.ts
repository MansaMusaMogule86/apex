import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs, readAuditCount } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('crm viewings persistence', () => {
  test('creates and lists persisted viewings with audit logging', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const beforeAuditCount = readAuditCount(database, 'org_apex_demo', 'appointment.created')

    const create = await app.request('/api/crm/viewings', {
      method: 'POST',
      headers: {
        Cookie: login.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactName: 'Viewing Test Contact',
        propertyName: 'Viewing Test Property',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
      }),
    })

    expect(create.status).toBe(201)

    const list = await app.request('/api/crm/viewings', {
      headers: { Cookie: login.cookie },
    })
    expect(list.status).toBe(200)

    const rows = await list.json()
    const row = rows.find((item: { contactName: string; propertyName: string }) => item.contactName === 'Viewing Test Contact' && item.propertyName === 'Viewing Test Property')

    expect(row).toBeTruthy()
    expect(row.status).toBe('scheduled')
    expect(typeof row.dayLabel).toBe('string')
    expect(typeof row.timeLabel).toBe('string')

    const afterAuditCount = readAuditCount(database, 'org_apex_demo', 'appointment.created')
    expect(afterAuditCount).toBe(beforeAuditCount + 1)
  })

  test('enforces organization isolation for persisted viewings', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()

    const demoLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(demoLogin.response.status).toBe(200)

    const create = await app.request('/api/crm/viewings', {
      method: 'POST',
      headers: {
        Cookie: demoLogin.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactName: 'Isolation Viewing Contact',
        propertyName: 'Isolation Viewing Property',
        scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
      }),
    })
    expect(create.status).toBe(201)

    const demoRows = await (await app.request('/api/crm/viewings', { headers: { Cookie: demoLogin.cookie } })).json()
    const created = demoRows.find((item: { contactName: string }) => item.contactName === 'Isolation Viewing Contact')
    expect(created).toBeTruthy()

    const otherLogin = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherLogin.response.status).toBe(200)

    const otherRows = await (await app.request('/api/crm/viewings', { headers: { Cookie: otherLogin.cookie } })).json()
    expect(otherRows.some((item: { id: string }) => item.id === created.id)).toBe(false)
  })
})
