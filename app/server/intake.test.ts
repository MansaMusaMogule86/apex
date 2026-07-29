import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('lead intake vertical slice', () => {
  test('creates, dedupes, scores, assigns, matches, and approves a draft', async () => {
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'
    process.env.NODE_ENV = 'test'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const payload = {
      fullName: 'Irina Petrov',
      email: 'irina@example.com',
      phone: '+971 50 555 1212',
      preferredLanguage: 'Russian',
      source: 'Property Finder',
      formType: 'Property Inquiry',
      budgetMinAed: 7000000,
      budgetMaxAed: 12000000,
      locations: ['Palm Jumeirah', 'Bluewaters Island'],
      propertyTypes: ['Apartment', 'Penthouse'],
      bedroomsMin: 2,
      bedroomsMax: 4,
      timeline: 'Within 30 days',
      purpose: 'Investor',
      financing: 'Cash',
      notes: 'Wants strong capital appreciation and sea views.',
    }

    const createResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify(payload),
    })
    expect(createResponse.status).toBe(201)
    const created = await createResponse.json()
    expect(created.dedupeStatus).toBe('created_new_contact')
    expect(created.contact.fullName).toBe('Irina Petrov')
    expect(created.leadScore.conversionProbability).toBeGreaterThan(0)
    expect(created.advisorRecommendation.fullName).toBe('Sultan Karabekov')
    expect(created.matches.length).toBeGreaterThan(0)
    expect(created.opportunity.stageKey).toBe('new_inquiry')
    expect(created.draft.status).toBe('pending_approval')

    const duplicateResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify(payload),
    })
    const duplicate = await duplicateResponse.json()
    expect(duplicate.dedupeStatus).toBe('merged_existing_contact')
    expect(duplicate.contact.id).toBe(created.contact.id)

    const nonDestructiveUpdateResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        ...payload,
        email: '',
        phone: '',
        notes: 'Follow-up without replacing channels',
      }),
    })
    expect(nonDestructiveUpdateResponse.status).toBe(201)
    const nonDestructiveUpdate = await nonDestructiveUpdateResponse.json()
    expect(nonDestructiveUpdate.contact.email).toBe('irina@example.com')
    expect(nonDestructiveUpdate.contact.phone).toBe('+971 50 555 1212')

    const approvalResponse = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: login.cookie },
    })
    expect(approvalResponse.status).toBe(200)
    const approved = await approvalResponse.json()
    expect(approved.draft.status).toBe('sent')
    expect(approved.task.title).toContain('Follow up')
    expect(approved.timeline.some((event: { eventType: string }) => event.eventType === 'draft_approved')).toBe(true)
    expect(approved.auditCount).toBeGreaterThanOrEqual(6)

    const dashboardResponse = await app.request('/api/crm/dashboard', { headers: { Cookie: login.cookie } })
    expect(dashboardResponse.status).toBe(200)
    const dashboard = await dashboardResponse.json()
    expect(dashboard.metrics.totalContacts).toBeGreaterThanOrEqual(1)
    expect(dashboard.metrics.openOpportunities).toBeGreaterThanOrEqual(1)

    const contactsResponse = await app.request('/api/crm/contacts', { headers: { Cookie: login.cookie } })
    const contacts = await contactsResponse.json()
    expect(contacts.some((row: { id: string }) => row.id === created.contact.id)).toBe(true)

    const leadsResponse = await app.request('/api/crm/leads', { headers: { Cookie: login.cookie } })
    expect(leadsResponse.status).toBe(200)
    const leads = await leadsResponse.json()
    expect(leads.some((row: { contactId: string }) => row.contactId === created.contact.id)).toBe(true)

    const opportunityResponse = await app.request(`/api/crm/opportunities/${created.opportunity.id}`, { headers: { Cookie: login.cookie } })
    expect(opportunityResponse.status).toBe(200)

    const persistedContact = database.client
      .prepare('SELECT email, phone FROM contacts WHERE id = ?')
      .get(created.contact.id) as { email: string; phone: string }
    expect(persistedContact.email).toBe('irina@example.com')
    expect(persistedContact.phone).toBe('+971 50 555 1212')

    const opportunityCount = database.client
      .prepare('SELECT COUNT(*) as count FROM opportunities WHERE contact_id = ?')
      .get(created.contact.id) as { count: number }
    expect(opportunityCount.count).toBeGreaterThanOrEqual(1)

    const auditCount = database.client
      .prepare('SELECT COUNT(*) as count FROM audit_events WHERE organization_id = ?')
      .get('org_apex_demo') as { count: number }
    expect(auditCount.count).toBeGreaterThanOrEqual(6)

    const normalizedEmailDuplicate = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        ...payload,
        email: 'IRINA@EXAMPLE.COM',
      }),
    })
    expect(normalizedEmailDuplicate.status).toBe(201)
    const normalizedEmailResult = await normalizedEmailDuplicate.json()
    expect(normalizedEmailResult.contact.id).toBe(created.contact.id)

    const normalizedPhoneDuplicate = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
      },
      body: JSON.stringify({
        ...payload,
        email: '',
        phone: '+971-50-555-1212',
      }),
    })
    expect(normalizedPhoneDuplicate.status).toBe(201)
    const normalizedPhoneResult = await normalizedPhoneDuplicate.json()
    expect(normalizedPhoneResult.contact.id).toBe(created.contact.id)

    const contactCount = database.client
      .prepare('SELECT COUNT(*) as count FROM contacts WHERE organization_id = ? AND email_normalized = ?')
      .get('org_apex_demo', 'irina@example.com') as { count: number }
    expect(contactCount.count).toBe(1)
  }, 20000)

  test('enforces organization isolation for contact reads', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'
    const { app } = await suite.buildHarness()

    const originLogin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(originLogin.response.status).toBe(200)

    const createdResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: originLogin.cookie,
      },
      body: JSON.stringify({
        fullName: 'Apex Demo Buyer',
        preferredLanguage: 'English',
        source: 'Referral',
        formType: 'Property Inquiry',
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
      }),
    })
    const created = await createdResponse.json()

    const foreignRead = await app.request(`/api/slice/contacts/${created.contact.id}`, {
      headers: { 'x-apex-test-user-id': 'user_other', 'x-apex-test-organization-id': 'org_other_brokerage' },
    })

    expect(foreignRead.status).toBe(404)

    const foreignLeads = await app.request('/api/crm/leads', {
      headers: { 'x-apex-test-user-id': 'user_other', 'x-apex-test-organization-id': 'org_other_brokerage' },
    })

    expect(foreignLeads.status).toBe(200)
    const foreignLeadRows = await foreignLeads.json()
    expect(foreignLeadRows.some((row: { contactId: string }) => row.contactId === created.contact.id)).toBe(false)
  })

  test('rolls back the transaction when a forced failure occurs mid-intake', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(login.response.status).toBe(200)

    const beforeCounts = database.client
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM contacts WHERE organization_id = 'org_apex_demo') AS contacts_count,
          (SELECT COUNT(*) FROM opportunities WHERE organization_id = 'org_apex_demo') AS opportunities_count,
          (SELECT COUNT(*) FROM form_submissions WHERE organization_id = 'org_apex_demo') AS submissions_count,
          (SELECT COUNT(*) FROM audit_events WHERE organization_id = 'org_apex_demo') AS audit_count
      `)
      .get() as {
        contacts_count: number
        opportunities_count: number
        submissions_count: number
        audit_count: number
      }

    const failureResponse = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: login.cookie,
        'x-apex-test-force-intake-failure': 'after_opportunity_upsert',
      },
      body: JSON.stringify({
        fullName: 'Rollback Candidate',
        email: 'rollback-candidate@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
      }),
    })

    expect(failureResponse.status).toBe(500)

    const afterCounts = database.client
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM contacts WHERE organization_id = 'org_apex_demo') AS contacts_count,
          (SELECT COUNT(*) FROM opportunities WHERE organization_id = 'org_apex_demo') AS opportunities_count,
          (SELECT COUNT(*) FROM form_submissions WHERE organization_id = 'org_apex_demo') AS submissions_count,
          (SELECT COUNT(*) FROM audit_events WHERE organization_id = 'org_apex_demo') AS audit_count
      `)
      .get() as {
        contacts_count: number
        opportunities_count: number
        submissions_count: number
        audit_count: number
      }

    expect(afterCounts.contacts_count).toBe(beforeCounts.contacts_count)
    expect(afterCounts.opportunities_count).toBe(beforeCounts.opportunities_count)
    expect(afterCounts.submissions_count).toBe(beforeCounts.submissions_count)
    expect(afterCounts.audit_count).toBe(beforeCounts.audit_count)

    const leakedContact = database.client
      .prepare('SELECT COUNT(*) AS count FROM contacts WHERE organization_id = ? AND email_normalized = ?')
      .get('org_apex_demo', 'rollback-candidate@example.com') as { count: number }
    expect(leakedContact.count).toBe(0)
  })
})