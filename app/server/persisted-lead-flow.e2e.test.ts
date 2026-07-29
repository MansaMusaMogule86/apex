import fs from 'node:fs'
import { describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs } from './test-harness'

describe('persisted lead flow deterministic proof', () => {
  test('proves validated, deduplicated, persisted, scoped lead lifecycle end-to-end', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const suite = createSuiteHarness()
    const { app, database, filePath } = await suite.buildHarness()

    try {
      const login = await loginAs(app, { email: 'dalila@apex-demo.local' })
      expect(login.response.status).toBe(200)

      const invalidPayloadResponse = await app.request('/api/slice/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: login.cookie,
        },
        body: JSON.stringify({
          fullName: 'A',
          email: 'not-an-email',
          preferredLanguage: 'English',
          source: 'Website',
          formType: 'Property Inquiry',
          locations: [],
          propertyTypes: [],
        }),
      })
      expect(invalidPayloadResponse.status).toBe(400)

      const beforeCounts = database.client
        .prepare(`
          SELECT
            (SELECT COUNT(*) FROM contacts WHERE organization_id = 'org_apex_demo') AS contacts_count,
            (SELECT COUNT(*) FROM opportunities WHERE organization_id = 'org_apex_demo') AS opportunities_count,
            (SELECT COUNT(*) FROM form_submissions WHERE organization_id = 'org_apex_demo') AS submissions_count,
            (SELECT COUNT(*) FROM timeline_events WHERE organization_id = 'org_apex_demo') AS timeline_count,
            (SELECT COUNT(*) FROM audit_events WHERE organization_id = 'org_apex_demo') AS audit_count
        `)
        .get() as {
          contacts_count: number
          opportunities_count: number
          submissions_count: number
          timeline_count: number
          audit_count: number
        }

      const payload = {
        fullName: 'Deterministic Lead',
        email: 'DETERMINISTIC.LEAD@EXAMPLE.COM',
        phone: '+971 50 111 2233',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        budgetMinAed: 1500000,
        budgetMaxAed: 2400000,
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
        bedroomsMin: 1,
        bedroomsMax: 2,
        timeline: 'Within 30 days',
        purpose: 'Investor',
        financing: 'Cash',
        notes: 'Deterministic proof run',
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
      expect(created.contact.ownerUserId).toBeTruthy()
      expect(created.opportunity.pipelineKey).toBe('buyer_leads_uhnw')
      expect(created.opportunity.stageKey).toBe('new_inquiry')
      expect(created.opportunity.status).toBe('open')
      expect(created.formSubmissionId).toBeTruthy()

      const persistedNormalized = database.client
        .prepare('SELECT email_normalized, phone_normalized FROM contacts WHERE id = ?')
        .get(created.contact.id) as { email_normalized: string; phone_normalized: string }
      expect(persistedNormalized.email_normalized).toBe('deterministic.lead@example.com')
      expect(persistedNormalized.phone_normalized).toBe('+971501112233')

      const duplicateByPhone = await app.request('/api/slice/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: login.cookie,
        },
        body: JSON.stringify({
          ...payload,
          email: '',
          phone: '+971-50-111-2233',
        }),
      })
      expect(duplicateByPhone.status).toBe(201)
      const duplicateByPhoneResult = await duplicateByPhone.json()
      expect(duplicateByPhoneResult.dedupeStatus).toBe('merged_existing_contact')
      expect(duplicateByPhoneResult.contact.id).toBe(created.contact.id)

      const duplicateByEmail = await app.request('/api/slice/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: login.cookie,
        },
        body: JSON.stringify({
          ...payload,
          email: 'deterministic.lead@example.com',
          phone: '+971 50 000 0000',
        }),
      })
      expect(duplicateByEmail.status).toBe(201)
      const duplicateByEmailResult = await duplicateByEmail.json()
      expect(duplicateByEmailResult.dedupeStatus).toBe('merged_existing_contact')
      expect(duplicateByEmailResult.contact.id).toBe(created.contact.id)

      const nonDestructiveUpdate = await app.request('/api/slice/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: login.cookie,
        },
        body: JSON.stringify({
          ...payload,
          email: '',
          phone: '',
          notes: 'Follow-up with blank channels should preserve prior channels',
        }),
      })
      expect(nonDestructiveUpdate.status).toBe(201)

      const persistedContact = database.client
        .prepare('SELECT email, phone FROM contacts WHERE id = ?')
        .get(created.contact.id) as { email: string; phone: string }
      expect(persistedContact.email).toBe('deterministic.lead@example.com')
      expect(persistedContact.phone).toBe('+971 50 000 0000')

      const contactCount = database.client
        .prepare('SELECT COUNT(*) as count FROM contacts WHERE organization_id = ? AND email_normalized = ?')
        .get('org_apex_demo', 'deterministic.lead@example.com') as { count: number }
      expect(contactCount.count).toBe(1)

      const formSubmissionCount = database.client
        .prepare('SELECT COUNT(*) as count FROM form_submissions WHERE organization_id = ? AND contact_id = ?')
        .get('org_apex_demo', created.contact.id) as { count: number }
      expect(formSubmissionCount.count).toBeGreaterThanOrEqual(1)

      const timelineCount = database.client
        .prepare('SELECT COUNT(*) as count FROM timeline_events WHERE organization_id = ? AND contact_id = ?')
        .get('org_apex_demo', created.contact.id) as { count: number }
      expect(timelineCount.count).toBeGreaterThan(0)

      const auditCount = database.client
        .prepare('SELECT COUNT(*) as count FROM audit_events WHERE organization_id = ? AND actor_user_id = ?')
        .get('org_apex_demo', 'user_dalila') as { count: number }
      expect(auditCount.count).toBeGreaterThan(0)

      const dashboardResponse = await app.request('/api/crm/dashboard', {
        headers: { Cookie: login.cookie },
      })
      expect(dashboardResponse.status).toBe(200)
      const dashboard = await dashboardResponse.json()
      expect(dashboard.metrics.totalContacts).toBeGreaterThanOrEqual(1)
      expect(dashboard.metrics.openOpportunities).toBeGreaterThanOrEqual(1)
      expect(dashboard.recentActivity.length).toBeGreaterThan(0)
      expect((dashboard.integrations as Array<{ name: string }>).some((row) => row.name === 'Lead Intake API')).toBe(true)

      const relationshipsResponse = await app.request('/api/crm/contacts', {
        headers: { Cookie: login.cookie },
      })
      expect(relationshipsResponse.status).toBe(200)
      const relationships = await relationshipsResponse.json()
      expect(relationships.some((row: { id: string }) => row.id === created.contact.id)).toBe(true)

      const leadDetailResponse = await app.request(`/api/slice/contacts/${created.contact.id}`, {
        headers: { Cookie: login.cookie },
      })
      expect(leadDetailResponse.status).toBe(200)
      const leadDetail = await leadDetailResponse.json()
      expect((leadDetail.timeline as Array<{ eventType: string }>).some((event) => event.eventType === 'contact_created')).toBe(true)

      const leadsResponse = await app.request('/api/crm/leads', {
        headers: { Cookie: login.cookie },
      })
      expect(leadsResponse.status).toBe(200)
      const leads = await leadsResponse.json()
      expect(leads.some((row: { contactId: string }) => row.contactId === created.contact.id)).toBe(true)

      const opportunitiesResponse = await app.request('/api/crm/opportunities', {
        headers: { Cookie: login.cookie },
      })
      expect(opportunitiesResponse.status).toBe(200)
      const opportunities = await opportunitiesResponse.json()
      expect(opportunities.some((row: { id: string }) => row.id === created.opportunity.id)).toBe(true)

      const opportunityDetailResponse = await app.request(`/api/crm/opportunities/${created.opportunity.id}`, {
        headers: { Cookie: login.cookie },
      })
      expect(opportunityDetailResponse.status).toBe(200)

      const activitiesResponse = await app.request(`/api/crm/activities?contactId=${encodeURIComponent(created.contact.id)}`, {
        headers: { Cookie: login.cookie },
      })
      expect(activitiesResponse.status).toBe(200)
      const activities = await activitiesResponse.json()
      expect(activities.items.length).toBeGreaterThan(0)
      expect(activities.items.some((row: { source: string }) => row.source === 'form_submission')).toBe(true)

      const beforeRollback = database.client
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

      const forcedFailureResponse = await app.request('/api/slice/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: login.cookie,
          'x-apex-test-force-intake-failure': 'after_opportunity_upsert',
        },
        body: JSON.stringify({
          fullName: 'Rollback Deterministic',
          email: 'rollback-deterministic@example.com',
          preferredLanguage: 'English',
          source: 'Website',
          formType: 'Property Inquiry',
          locations: ['Downtown Dubai'],
          propertyTypes: ['Apartment'],
        }),
      })
      expect(forcedFailureResponse.status).toBe(500)

      const afterRollback = database.client
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

      expect(afterRollback.contacts_count).toBe(beforeRollback.contacts_count)
      expect(afterRollback.opportunities_count).toBe(beforeRollback.opportunities_count)
      expect(afterRollback.submissions_count).toBe(beforeRollback.submissions_count)
      expect(afterRollback.audit_count).toBe(beforeRollback.audit_count)

      const crossOrgContactRead = await app.request(`/api/slice/contacts/${created.contact.id}`, {
        headers: {
          'x-apex-test-user-id': 'user_other',
          'x-apex-test-organization-id': 'org_other_brokerage',
        },
      })
      expect(crossOrgContactRead.status).toBe(404)

      const crossOrgOpportunityRead = await app.request(`/api/crm/opportunities/${created.opportunity.id}`, {
        headers: {
          'x-apex-test-user-id': 'user_other',
          'x-apex-test-organization-id': 'org_other_brokerage',
        },
      })
      expect(crossOrgOpportunityRead.status).toBe(404)

      const afterCounts = database.client
        .prepare(`
          SELECT
            (SELECT COUNT(*) FROM contacts WHERE organization_id = 'org_apex_demo') AS contacts_count,
            (SELECT COUNT(*) FROM opportunities WHERE organization_id = 'org_apex_demo') AS opportunities_count,
            (SELECT COUNT(*) FROM form_submissions WHERE organization_id = 'org_apex_demo') AS submissions_count,
            (SELECT COUNT(*) FROM timeline_events WHERE organization_id = 'org_apex_demo') AS timeline_count,
            (SELECT COUNT(*) FROM audit_events WHERE organization_id = 'org_apex_demo') AS audit_count
        `)
        .get() as {
          contacts_count: number
          opportunities_count: number
          submissions_count: number
          timeline_count: number
          audit_count: number
        }

      expect(afterCounts.contacts_count).toBeGreaterThan(beforeCounts.contacts_count)
      expect(afterCounts.opportunities_count).toBeGreaterThan(beforeCounts.opportunities_count)
      expect(afterCounts.submissions_count).toBeGreaterThan(beforeCounts.submissions_count)
      expect(afterCounts.timeline_count).toBeGreaterThan(beforeCounts.timeline_count)
      expect(afterCounts.audit_count).toBeGreaterThan(beforeCounts.audit_count)

      // Explicitly verify this scenario never fell back to client-side demo data semantics.
      expect((dashboard.recentActivity as Array<{ body: string }>).some((row) => row.body.includes('sample operational data'))).toBe(false)
    } finally {
      suite.cleanupTempResources()
    }

    expect(fs.existsSync(filePath)).toBe(false)
    expect(fs.existsSync(`${filePath}-wal`)).toBe(false)
    expect(fs.existsSync(`${filePath}-shm`)).toBe(false)
  }, 30000)
})
