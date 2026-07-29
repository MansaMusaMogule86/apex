import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('crm activities feed', () => {
  test('returns persisted activity records and applies filters', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const createResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        fullName: 'Activities Primary Lead',
        email: 'activities-primary@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Dubai Marina'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(createResponse.status).toBe(201)
    const created = await createResponse.json()

    const secondResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        fullName: 'Activities Secondary Lead',
        email: 'activities-secondary@example.com',
        preferredLanguage: 'English',
        source: 'Referral',
        formType: 'Viewing Request',
        locations: ['Palm Jumeirah'],
        propertyTypes: ['Penthouse'],
      }),
    })
    expect(secondResponse.status).toBe(201)

    const approvalResponse = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: login.cookie },
    })
    expect(approvalResponse.status).toBe(200)

    const allResponse = await app.request('/api/crm/activities', {
      headers: { Cookie: login.cookie },
    })
    expect(allResponse.status).toBe(200)
    const all = await allResponse.json()

    expect(all.items.length).toBeGreaterThan(0)
    expect(all.availableTypes.includes('form_submission')).toBe(true)
    expect(all.items.some((row: { activityType: string }) => row.activityType === 'form_submission')).toBe(true)

    const byContactResponse = await app.request(`/api/crm/activities?contactId=${encodeURIComponent(created.contact.id)}`, {
      headers: { Cookie: login.cookie },
    })
    expect(byContactResponse.status).toBe(200)
    const byContact = await byContactResponse.json()
    expect(byContact.items.length).toBeGreaterThan(0)
    expect(byContact.items.every((row: { contactId: string | null }) => row.contactId === created.contact.id)).toBe(true)

    const byLeadResponse = await app.request(`/api/crm/activities?leadId=${encodeURIComponent(created.formSubmissionId)}`, {
      headers: { Cookie: login.cookie },
    })
    expect(byLeadResponse.status).toBe(200)
    const byLead = await byLeadResponse.json()
    expect(byLead.items.some((row: { leadId: string | null }) => row.leadId === created.formSubmissionId)).toBe(true)

    const byOpportunityResponse = await app.request(`/api/crm/activities?opportunityId=${encodeURIComponent(created.opportunity.id)}`, {
      headers: { Cookie: login.cookie },
    })
    expect(byOpportunityResponse.status).toBe(200)
    const byOpportunity = await byOpportunityResponse.json()
    expect(byOpportunity.items.some((row: { opportunityId: string | null }) => row.opportunityId === created.opportunity.id)).toBe(true)

    const byUserResponse = await app.request(`/api/crm/activities?userId=${encodeURIComponent('user_dalila')}`, {
      headers: { Cookie: login.cookie },
    })
    expect(byUserResponse.status).toBe(200)
    const byUser = await byUserResponse.json()
    expect(byUser.items.length).toBeGreaterThan(0)
    expect(byUser.items.every((row: { actorUserId: string | null }) => row.actorUserId === 'user_dalila')).toBe(true)

    const byTypeResponse = await app.request('/api/crm/activities?type=form_submission', {
      headers: { Cookie: login.cookie },
    })
    expect(byTypeResponse.status).toBe(200)
    const byType = await byTypeResponse.json()
    expect(byType.items.length).toBeGreaterThan(0)
    expect(byType.items.every((row: { activityType: string }) => row.activityType === 'form_submission')).toBe(true)

    const unsupportedFilterResponse = await app.request('/api/crm/activities?companyId=comp_abc', {
      headers: { Cookie: login.cookie },
    })
    expect(unsupportedFilterResponse.status).toBe(200)
    const unsupportedFilter = await unsupportedFilterResponse.json()
    expect(unsupportedFilter.unsupportedFilters).toContain('companyId')
  })

  test('enforces organization isolation for activities', async () => {
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
        fullName: 'Activities Isolation Lead',
        email: 'activities-isolation@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(createResponse.status).toBe(201)

    const otherLogin = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherLogin.response.status).toBe(200)

    const activitiesResponse = await app.request('/api/crm/activities', {
      headers: { Cookie: otherLogin.cookie },
    })
    expect(activitiesResponse.status).toBe(200)
    const activities = await activitiesResponse.json()
    expect(activities.items.length).toBe(0)
  })
})
