import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('dashboard metrics from persisted CRM data', () => {
  test('calculates metrics and charts from persisted records with date boundaries', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const basePayload = {
      preferredLanguage: 'English',
      formType: 'Property Inquiry',
      locations: ['Downtown Dubai'],
      propertyTypes: ['Apartment'],
    }

    const leadAResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        ...basePayload,
        fullName: 'Metric Lead A',
        email: 'metric-a@example.com',
        source: 'Website',
      }),
    })
    expect(leadAResponse.status).toBe(201)
    const leadA = await leadAResponse.json()

    const leadBResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        ...basePayload,
        fullName: 'Metric Lead B',
        email: 'metric-b@example.com',
        source: 'Referral',
      }),
    })
    expect(leadBResponse.status).toBe(201)
    const leadB = await leadBResponse.json()

    const approveResponse = await app.request(`/api/slice/drafts/${leadA.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: login.cookie },
    })
    expect(approveResponse.status).toBe(200)

    database.client
      .prepare('UPDATE opportunities SET status = ?, stage_key = ?, expected_value_aed = ? WHERE id = ?')
      .run('won', 'spa_signed', 5000000, leadA.opportunity.id)

    database.client
      .prepare('UPDATE opportunities SET status = ?, expected_value_aed = ? WHERE id = ?')
      .run('open', 3000000, leadB.opportunity.id)

    database.client
      .prepare('UPDATE form_submissions SET created_at = datetime(\'now\', \'-10 days\') WHERE contact_id = ?')
      .run(leadB.contact.id)

    database.client
      .prepare('UPDATE tasks SET due_at = datetime(\'now\', \'-2 days\') WHERE contact_id = ?')
      .run(leadA.contact.id)

    const dashboardResponse = await app.request('/api/crm/dashboard', {
      headers: { Cookie: login.cookie },
    })
    expect(dashboardResponse.status).toBe(200)
    const dashboard = await dashboardResponse.json()

    expect(dashboard.metrics.totalContacts).toBe(2)
    expect(dashboard.metrics.newLeads).toBe(1)
    expect(dashboard.metrics.qualifiedLeads).toBe(1)
    expect(dashboard.metrics.openOpportunities).toBe(1)
    expect(dashboard.metrics.pipelineValue).toBe(3000000)
    expect(dashboard.metrics.wonRevenue).toBe(5000000)
    expect(dashboard.metrics.lostOpportunities).toBe(0)
    expect(dashboard.metrics.conversionRate).toBe(50)
    expect(dashboard.metrics.overdueFollowUps).toBeGreaterThanOrEqual(1)
    expect(dashboard.metrics.unassignedLeads).toBe(0)
    expect(dashboard.metrics.failedSubmissions).toBe(0)
    expect(dashboard.metrics.pendingRetries).toBe(0)

    const sourceChart = new Map((dashboard.charts.leadsBySource as Array<{ label: string; value: number }>).map((row) => [row.label, row.value]))
    expect(sourceChart.get('Website')).toBe(1)
    expect(sourceChart.get('Referral')).toBe(1)

    const statusChart = new Map((dashboard.charts.leadsByStatus as Array<{ label: string; value: number }>).map((row) => [row.label, row.value]))
    expect(statusChart.get('active')).toBe(2)

    const stageChart = new Map((dashboard.charts.opportunitiesByStage as Array<{ label: string; value: number }>).map((row) => [row.label, row.value]))
    expect(stageChart.get('new_inquiry')).toBe(1)
    expect(stageChart.get('spa_signed')).toBe(1)

    expect(dashboard.upcomingAppointments.available).toBe(true)
    expect(typeof dashboard.upcomingAppointments.reason).toBe('string')
    expect(dashboard.upcomingAppointments.reason.length).toBeGreaterThan(0)
    expect(Array.isArray(dashboard.upcomingAppointments.items)).toBe(true)

    const ownerFilterResponse = await app.request(`/api/crm/dashboard?owner=${encodeURIComponent(leadA.contact.ownerUserId)}`, {
      headers: { Cookie: login.cookie },
    })
    expect(ownerFilterResponse.status).toBe(200)
    const ownerFiltered = await ownerFilterResponse.json()
    expect(ownerFiltered.metrics.totalContacts).toBeGreaterThanOrEqual(1)

    const sourceFilterResponse = await app.request('/api/crm/dashboard?source=Referral', {
      headers: { Cookie: login.cookie },
    })
    expect(sourceFilterResponse.status).toBe(200)
    const sourceFiltered = await sourceFilterResponse.json()
    expect(sourceFiltered.metrics.totalContacts).toBe(1)
    expect(sourceFiltered.metrics.newLeads).toBe(0)

    const stageFilterResponse = await app.request('/api/crm/dashboard?stage=spa_signed', {
      headers: { Cookie: login.cookie },
    })
    expect(stageFilterResponse.status).toBe(200)
    const stageFiltered = await stageFilterResponse.json()
    expect(stageFiltered.metrics.openOpportunities).toBe(0)
    expect(stageFiltered.metrics.wonRevenue).toBe(5000000)
  })

  test('enforces organization isolation on dashboard metrics and lead listings', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()

    const demoLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(demoLogin.response.status).toBe(200)

    const createResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: demoLogin.cookie,
      },
      body: JSON.stringify({
        fullName: 'Isolation Dashboard Lead',
        email: 'isolation-dashboard@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Dubai Marina'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(createResponse.status).toBe(201)

    const otherLogin = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherLogin.response.status).toBe(200)

    const dashboardResponse = await app.request('/api/crm/dashboard', {
      headers: { Cookie: otherLogin.cookie },
    })
    expect(dashboardResponse.status).toBe(200)
    const dashboard = await dashboardResponse.json()
    expect(dashboard.metrics.totalContacts).toBe(0)

    const leadsResponse = await app.request('/api/crm/leads', {
      headers: { Cookie: otherLogin.cookie },
    })
    expect(leadsResponse.status).toBe(200)
    const leads = await leadsResponse.json()
    expect(leads.length).toBe(0)
  })
})
