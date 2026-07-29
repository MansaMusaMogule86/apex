import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('authentication and authorization', () => {
  test('login success creates cookie-backed session and current-user resolves', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)
    expect(login.cookie.startsWith('apex_session=')).toBe(true)

    const currentUser = await app.request('/api/auth/current-user', { headers: { Cookie: login.cookie } })
    expect(currentUser.status).toBe(200)
    const payload = await currentUser.json()
    expect(payload.user.email).toBe('dalila@apex-demo.local')
    expect(payload.session.organizationId).toBe('org_apex_demo')
    expect(payload.session.role).toBe('admin')
  })

  test('login failure rejects invalid password', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const login = await loginAs(app, {
      email: 'dalila@apex-demo.local',
      password: 'wrong-password',
    })
    expect(login.response.status).toBe(401)
  })

  test('logout invalidates existing session', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const logout = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: login.cookie },
    })
    expect(logout.status).toBe(200)

    const afterLogout = await app.request('/api/auth/current-user', { headers: { Cookie: login.cookie } })
    expect(afterLogout.status).toBe(401)
  })

  test('re-login rotates session identifier and revokes prior session', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const firstLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(firstLogin.response.status).toBe(200)

    const secondLogin = await app.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: firstLogin.cookie,
      },
      body: JSON.stringify({
        email: 'dalila@apex-demo.local',
        password: 'dev-only-password',
        organizationSlug: 'apex-demo-realty',
      }),
    })
    expect(secondLogin.status).toBe(200)
    const setCookie = secondLogin.headers.get('set-cookie') ?? ''
    const secondCookie = setCookie.split(';')[0] ?? ''

    const oldSession = await app.request('/api/auth/current-user', { headers: { Cookie: firstLogin.cookie } })
    expect(oldSession.status).toBe(401)

    const newSession = await app.request('/api/auth/current-user', { headers: { Cookie: secondCookie } })
    expect(newSession.status).toBe(200)
  })

  test('expired session is rejected for protected route access', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    database.client.prepare('UPDATE sessions SET expires_at = ?').run(new Date(Date.now() - 60_000).toISOString())

    const response = await app.request('/api/crm/dashboard', { headers: { Cookie: login.cookie } })
    expect(response.status).toBe(401)
  })

  test('protected API rejects unauthenticated access', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const response = await app.request('/api/crm/contacts')
    expect(response.status).toBe(401)
  })

  test('role enforcement blocks advisor from pipeline admin mutation', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const manager = await loginAs(app, { email: 'camelia@apex-demo.local' })
    expect(manager.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Role Enforcement Deal Lead',
        email: 'role-enforcement@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Dubai Marina'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(intake.status).toBe(201)
    const created = await intake.json()

    const approve = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: manager.cookie },
    })
    expect(approve.status).toBe(200)

    const dealsResponse = await app.request('/api/crm/deals', { headers: { Cookie: manager.cookie } })
    expect(dealsResponse.status).toBe(200)
    const deals = await dealsResponse.json()
    const targetDeal = deals.find((row: { contactName: string }) => row.contactName === 'Role Enforcement Deal Lead')
    expect(targetDeal).toBeTruthy()

    const stagesResponse = await app.request('/api/crm/deals/stages', { headers: { Cookie: manager.cookie } })
    expect(stagesResponse.status).toBe(200)
    const stages = await stagesResponse.json()
    const targetStage = stages.find((stage: string) => stage !== targetDeal.stage)
    expect(targetStage).toBeTruthy()

    const advisor = await loginAs(app, { email: 'sultan@apex-demo.local' })
    expect(advisor.response.status).toBe(200)

    const denyMove = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: advisor.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: targetStage }),
    })
    expect(denyMove.status).toBe(403)

    const allowMove = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: targetStage }),
    })
    expect(allowMove.status).toBe(200)
  })

  test('cross-organization identifier attack is rejected', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const otherOrg = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherOrg.response.status).toBe(200)

    const foreignDeal = await app.request('/api/crm/deals/2', {
      headers: { Cookie: otherOrg.cookie },
    })
    expect(foreignDeal.status).toBe(404)

    const foreignContact = await app.request('/api/slice/contacts/contact_nonexistent', {
      headers: { Cookie: otherOrg.cookie },
    })
    expect([404, 401]).toContain(foreignContact.status)
  })
})
