import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs, readAuditCount } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('crm tasks persistence', () => {
  test('lists persisted tasks and toggles status with audit logging', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        fullName: 'Task Coverage Lead',
        email: 'task-coverage@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Dubai Marina'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(intake.status).toBe(201)
    const created = await intake.json()

    const approval = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: login.cookie },
    })
    expect(approval.status).toBe(200)

    const tasksList = await app.request('/api/crm/tasks', {
      headers: { Cookie: login.cookie },
    })
    expect(tasksList.status).toBe(200)
    const rows = await tasksList.json()

    const row = rows.find((item: { contactId: string; status: string }) => item.contactId === created.contact.id)
    expect(row).toBeTruthy()
    expect(row.status).toBe('open')

    const beforeAuditCount = readAuditCount(database, 'org_apex_demo', 'task.status_changed')

    const complete = await app.request(`/api/crm/tasks/${row.id}`, {
      method: 'PATCH',
      headers: {
        Cookie: login.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'done' }),
    })
    expect(complete.status).toBe(200)
    const completed = await complete.json()
    expect(completed.status).toBe('done')

    const reopen = await app.request(`/api/crm/tasks/${row.id}`, {
      method: 'PATCH',
      headers: {
        Cookie: login.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'open' }),
    })
    expect(reopen.status).toBe(200)
    const reopened = await reopen.json()
    expect(reopened.status).toBe('open')

    const afterAuditCount = readAuditCount(database, 'org_apex_demo', 'task.status_changed')
    expect(afterAuditCount).toBeGreaterThanOrEqual(beforeAuditCount + 2)
  })

  test('enforces organization isolation for task updates', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()

    const demoLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(demoLogin.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: demoLogin.cookie,
      },
      body: JSON.stringify({
        fullName: 'Task Isolation Lead',
        email: 'task-isolation@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
      }),
    })
    const created = await intake.json()

    const approval = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: demoLogin.cookie },
    })
    expect(approval.status).toBe(200)

    const demoTasks = await app.request('/api/crm/tasks', { headers: { Cookie: demoLogin.cookie } })
    const demoRows = await demoTasks.json()
    const task = demoRows.find((item: { contactId: string }) => item.contactId === created.contact.id)
    expect(task).toBeTruthy()

    const otherLogin = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherLogin.response.status).toBe(200)

    const otherTasks = await app.request('/api/crm/tasks', {
      headers: { Cookie: otherLogin.cookie },
    })
    expect(otherTasks.status).toBe(200)
    const otherRows = await otherTasks.json()
    expect(otherRows.some((item: { id: string }) => item.id === task.id)).toBe(false)

    const foreignUpdate = await app.request(`/api/crm/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        Cookie: otherLogin.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'done' }),
    })
    expect(foreignUpdate.status).toBe(404)
  })
})
