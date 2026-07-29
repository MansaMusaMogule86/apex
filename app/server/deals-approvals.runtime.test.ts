import { afterEach, describe, expect, test } from 'vitest'
import { createSuiteHarness, loginAs, readAuditCount } from './test-harness'

const suite = createSuiteHarness()

afterEach(() => {
  suite.cleanupTempResources()
})

describe('deals and approvals runtime verification', () => {
  test('stage movement success, invalid stage, missing deal, duplicate move, and audit event', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const manager = await loginAs(app, { email: 'camelia@apex-demo.local' })
    expect(manager.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Deals Runtime Lead',
        email: 'deals-runtime@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Dubai Marina'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(intake.status).toBe(201)
    const created = await intake.json()

    const approved = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: manager.cookie },
    })
    expect(approved.status).toBe(200)

    const dealsList = await app.request('/api/crm/deals', { headers: { Cookie: manager.cookie } })
    expect(dealsList.status).toBe(200)
    const deals = await dealsList.json()
    const targetDeal = deals.find((row: { contactName: string }) => row.contactName === 'Deals Runtime Lead')
    expect(targetDeal).toBeTruthy()

    const stagesResponse = await app.request('/api/crm/deals/stages', { headers: { Cookie: manager.cookie } })
    expect(stagesResponse.status).toBe(200)
    const stages = await stagesResponse.json()
    const targetStage = stages.find((stage: string) => stage !== targetDeal.stage)
    expect(targetStage).toBeTruthy()

    const beforeAuditCount = readAuditCount(database, 'org_apex_demo', 'deal.stage_changed')

    const success = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: targetStage }),
    })
    expect(success.status).toBe(200)
    const moved = await success.json()
    expect(moved.deal.stage).toBe(targetStage)

    const duplicate = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: targetStage }),
    })
    expect(duplicate.status).toBe(200)
    const duplicateBody = await duplicate.json()
    expect(duplicateBody.deal.stage).toBe(targetStage)

    const invalidStage = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: 'NotARealStage' }),
    })
    expect(invalidStage.status).toBe(400)

    const missingDeal = await app.request('/api/crm/deals/999999/move-stage', {
      method: 'POST',
      headers: {
        Cookie: manager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: 'Qualified' }),
    })
    expect(missingDeal.status).toBe(404)

    const afterAuditCount = readAuditCount(database, 'org_apex_demo', 'deal.stage_changed')
    expect(afterAuditCount).toBeGreaterThan(beforeAuditCount)
  })

  test('cross-organization stage movement is rejected', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app } = await suite.buildHarness()
    const demoManager = await loginAs(app, { email: 'camelia@apex-demo.local' })
    expect(demoManager.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        Cookie: demoManager.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Cross Org Deal Lead',
        email: 'cross-org-deal@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Downtown Dubai'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(intake.status).toBe(201)
    const created = await intake.json()

    const approved = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: demoManager.cookie },
    })
    expect(approved.status).toBe(200)

    const demoDeals = await app.request('/api/crm/deals', { headers: { Cookie: demoManager.cookie } })
    const demoRows = await demoDeals.json()
    const targetDeal = demoRows.find((row: { contactName: string }) => row.contactName === 'Cross Org Deal Lead')
    expect(targetDeal).toBeTruthy()

    const otherOrg = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherOrg.response.status).toBe(200)

    const foreignMove = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: otherOrg.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: 'Qualified' }),
    })
    expect(foreignMove.status).toBe(404)
  })

  test('approval success, reject success, missing, already resolved, unauthorized, and audit event writes', async () => {
    process.env.NODE_ENV = 'test'
    process.env.APEX_ENABLE_DEV_AUTH_BYPASS = 'false'

    const { app, database } = await suite.buildHarness()
    const admin = await loginAs(app, { email: 'dalila@apex-demo.local' })
    expect(admin.response.status).toBe(200)

    const intake = await app.request('/api/slice/intake', {
      method: 'POST',
      headers: {
        Cookie: admin.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Unauthorized Move Lead',
        email: 'unauthorized-move@example.com',
        preferredLanguage: 'English',
        source: 'Website',
        formType: 'Property Inquiry',
        locations: ['Palm Jumeirah'],
        propertyTypes: ['Apartment'],
      }),
    })
    expect(intake.status).toBe(201)
    const created = await intake.json()

    const approvedLead = await app.request(`/api/slice/drafts/${created.draft.id}/approve`, {
      method: 'POST',
      headers: { Cookie: admin.cookie },
    })
    expect(approvedLead.status).toBe(200)

    const dealsList = await app.request('/api/crm/deals', { headers: { Cookie: admin.cookie } })
    const deals = await dealsList.json()
    const targetDeal = deals.find((row: { contactName: string }) => row.contactName === 'Unauthorized Move Lead')
    expect(targetDeal).toBeTruthy()

    const approvalsBefore = readAuditCount(database, 'org_apex_demo', 'inbox_draft.approved')
    const rejectsBefore = readAuditCount(database, 'org_other_brokerage', 'inbox_draft.rejected')

    const approve = await app.request('/api/crm/inbox/draft/5/approve', {
      method: 'POST',
      headers: { Cookie: admin.cookie },
    })
    expect(approve.status).toBe(200)

    const alreadyResolved = await app.request('/api/crm/inbox/draft/5/approve', {
      method: 'POST',
      headers: { Cookie: admin.cookie },
    })
    expect(alreadyResolved.status).toBe(409)

    const otherOrgManager = await loginAs(app, {
      email: 'advisor@other.local',
      organizationSlug: 'other-brokerage',
    })
    expect(otherOrgManager.response.status).toBe(200)

    const reject = await app.request('/api/crm/inbox/draft/1/reject', {
      method: 'POST',
      headers: { Cookie: otherOrgManager.cookie },
    })
    expect(reject.status).toBe(200)

    const missing = await app.request('/api/crm/inbox/draft/999/reject', {
      method: 'POST',
      headers: { Cookie: admin.cookie },
    })
    expect(missing.status).toBe(404)

    const advisor = await loginAs(app, { email: 'sultan@apex-demo.local' })
    expect(advisor.response.status).toBe(200)

    const unauthorized = await app.request(`/api/crm/deals/${targetDeal.id}/move-stage`, {
      method: 'POST',
      headers: {
        Cookie: advisor.cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: 'Qualified' }),
    })
    expect(unauthorized.status).toBe(403)

    const approvalsAfter = readAuditCount(database, 'org_apex_demo', 'inbox_draft.approved')
    const rejectsAfter = readAuditCount(database, 'org_other_brokerage', 'inbox_draft.rejected')
    expect(approvalsAfter).toBeGreaterThan(approvalsBefore)
    expect(rejectsAfter).toBeGreaterThan(rejectsBefore)
  })
})
