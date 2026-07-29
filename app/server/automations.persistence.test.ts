import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs, readAuditCount } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('crm automations persistence', () => {
  test('creates, lists, and toggles persisted automations with audit logging', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const beforeCreateAudit = readAuditCount(database, 'org_apex_demo', 'automation.created')

    const create = await app.request('/api/crm/automations', {
      method: 'POST',
      headers: {
        Cookie: login.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Automation Test Rule',
        triggerLabel: 'New contact created',
        actionLabel: 'Send welcome message',
      }),
    })

    expect(create.status).toBe(201)

    const list = await app.request('/api/crm/automations', {
      headers: { Cookie: login.cookie },
    })
    expect(list.status).toBe(200)

    const rows = await list.json()
    const row = rows.find((item: { name: string }) => item.name === 'Automation Test Rule')
    expect(row).toBeTruthy()
    expect(row.status).toBe('draft')

    const beforeStatusAudit = readAuditCount(database, 'org_apex_demo', 'automation.status_changed')

    const activate = await app.request(`/api/crm/automations/${row.id}/status`, {
      method: 'PATCH',
      headers: {
        Cookie: login.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'active' }),
    })

    expect(activate.status).toBe(200)
    const activated = await activate.json()
    expect(activated.status).toBe('active')

    const afterCreateAudit = readAuditCount(database, 'org_apex_demo', 'automation.created')
    const afterStatusAudit = readAuditCount(database, 'org_apex_demo', 'automation.status_changed')

    expect(afterCreateAudit).toBe(beforeCreateAudit + 1)
    expect(afterStatusAudit).toBe(beforeStatusAudit + 1)
  })

  test('enforces organization isolation for automations updates', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()

    const demoLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(demoLogin.response.status).toBe(200)

    const create = await app.request('/api/crm/automations', {
      method: 'POST',
      headers: {
        Cookie: demoLogin.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Isolation Automation Rule',
        triggerLabel: 'Viewing completed',
        actionLabel: 'Create follow-up task',
      }),
    })

    expect(create.status).toBe(201)

    const demoRows = await (await app.request('/api/crm/automations', { headers: { Cookie: demoLogin.cookie } })).json()
    const row = demoRows.find((item: { name: string }) => item.name === 'Isolation Automation Rule')
    expect(row).toBeTruthy()

    const otherLogin = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherLogin.response.status).toBe(200)

    const foreignUpdate = await app.request(`/api/crm/automations/${row.id}/status`, {
      method: 'PATCH',
      headers: {
        Cookie: otherLogin.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'paused' }),
    })

    expect(foreignUpdate.status).toBe(404)
  })
})
