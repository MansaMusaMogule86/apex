import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import type { DatabaseContext } from './db/context'
import { getDatabaseContext } from './db/context'
import { seedDatabase } from './db/seed'
import { auditEvents } from './db/schema'
import { hasPermission, PERMISSIONS, type Permission } from './auth/permissions'
import {
  getSessionCookieOptions,
  loginWithPassword,
  logoutSession,
  resolveSession,
  SESSION_COOKIE,
  type AuthenticatedUser,
} from './auth/service'
import { approveDraft as approveInboxDraft, getDraft as getInboxDraft, listConversations as listInboxConversations, listMessages as listInboxMessages, rejectDraft as rejectInboxDraft } from './inbox-store'
import {
  createCrmAutomation,
  createCrmViewing,
  approveDraft,
  createLeadIntake,
  getCrmDeal,
  getCrmDealHistory,
  getBuyerPipelineStages,
  getDashboardSnapshot,
  getLeadContact,
  listCrmCompanies,
  listCrmDeals,
  listCrmDealStages,
  getOpportunitySnapshot,
  listActivityFeed,
  listCrmContacts,
  listCrmLeads,
  listCrmOpportunities,
  listCrmTasks,
  listCrmViewings,
  listCrmAutomations,
  listCrmTeam,
  listRecentLeadContacts,
  moveCrmDealStage,
  setCrmAutomationStatus,
  setCrmTaskStatus,
  type SessionContext,
} from './slice/intake-service'

type AppVariables = {
  session: SessionContext
  user: AuthenticatedUser
  authBypassActive: boolean
}

const intakeSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6).optional().or(z.literal('')),
  preferredLanguage: z.string().min(2),
  source: z.string().min(2),
  formType: z.string().min(2),
  budgetMinAed: z.number().int().nonnegative().optional(),
  budgetMaxAed: z.number().int().nonnegative().optional(),
  locations: z.array(z.string()).default([]),
  propertyTypes: z.array(z.string()).default([]),
  bedroomsMin: z.number().int().nonnegative().optional(),
  bedroomsMax: z.number().int().nonnegative().optional(),
  timeline: z.string().optional(),
  purpose: z.string().optional(),
  financing: z.string().optional(),
  notes: z.string().optional(),
  utmSource: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationSlug: z.string().min(2),
})

const createViewingSchema = z.object({
  contactId: z.string().min(1).optional().nullable(),
  contactName: z.string().min(2),
  propertyId: z.string().min(1).optional().nullable(),
  propertyName: z.string().min(2),
  advisorUserId: z.string().min(1).optional().nullable(),
  opportunityId: z.string().min(1).optional().nullable(),
  scheduledAt: z.string().min(2),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  outcome: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  interestScore: z.number().int().min(0).max(10).optional().nullable(),
  nextStep: z.string().optional().nullable(),
})

const createAutomationSchema = z.object({
  name: z.string().min(2),
  triggerLabel: z.string().optional(),
  actionLabel: z.string().optional(),
})

const updateAutomationStatusSchema = z.object({
  status: z.enum(['active', 'paused', 'draft']),
})

function buildDevBypassSession(): { session: SessionContext; bypass: boolean } | null {
  if (process.env.NODE_ENV === 'production') return null
  if (process.env.APEX_ENABLE_DEV_AUTH_BYPASS !== 'true') return null

  const bypassUserId = process.env.APEX_DEV_AUTH_USER_ID ?? 'user_dalila'
  const bypassOrganizationId = process.env.APEX_DEV_AUTH_ORGANIZATION_ID ?? 'org_apex_demo'

  return {
    session: {
      organizationId: bypassOrganizationId,
      userId: bypassUserId,
      role: 'admin',
    },
    bypass: true,
  }
}

async function buildSession(c: Hono.Context, database: DatabaseContext): Promise<{ session: SessionContext; user: AuthenticatedUser | null; bypass: boolean }> {
  const testUserId = c.req.header('x-apex-test-user-id')
  const testOrgId = c.req.header('x-apex-test-organization-id')
  if (process.env.NODE_ENV === 'test' && testUserId && testOrgId) {
    return {
      session: { organizationId: testOrgId, userId: testUserId, role: 'advisor' },
      user: null,
      bypass: false,
    }
  }

  const bypass = buildDevBypassSession()
  if (bypass) {
    return {
      session: bypass.session,
      user: {
        id: bypass.session.userId,
        fullName: 'Development Bypass User',
        email: 'dev-bypass@local',
        role: bypass.session.role,
        organizationId: bypass.session.organizationId,
        organizationSlug: 'apex-demo-realty',
        organizationName: 'APEX Demo Realty',
      },
      bypass: true,
    }
  }

  const token = getCookie(c, SESSION_COOKIE)
  const resolved = await resolveSession(database, token)
  if (resolved) {
    return {
      session: {
        organizationId: resolved.session.organizationId,
        userId: resolved.session.userId,
        role: resolved.session.role,
      },
      user: resolved.user,
      bypass: false,
    }
  }

  throw new Error('Authentication required')
}

function requirePermission(c: Hono.Context, permission: Permission) {
  const session = c.get('session')
  if (!hasPermission(session.role, permission)) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403)
  }
  return null
}

function createAuditId() {
  return `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`
}

export function createApiApp(database: DatabaseContext = getDatabaseContext()) {
  const app = new Hono<{ Variables: AppVariables }>()

  app.use('*', async (c, next) => {
    await next()
    c.header('Cache-Control', 'no-store')
  })

  app.get('/api/auth/organizations', async (c) => {
    await seedDatabase(database)
    const orgs = await database.db.query.organizations.findMany()
    return c.json(orgs.map((org) => ({ id: org.id, slug: org.slug, name: org.name })))
  })

  app.post('/api/auth/login', async (c) => {
    await seedDatabase(database)
    const parsed = loginSchema.safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid login payload', details: parsed.error.flatten() }, 400)
    }

    const existingToken = getCookie(c, SESSION_COOKIE)
    const result = await loginWithPassword(database, parsed.data, existingToken)
    if (!result) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    setCookie(c, SESSION_COOKIE, result.token, getSessionCookieOptions())
    return c.json({
      user: result.user,
      session: {
        id: result.session.id,
        expiresAt: result.session.expiresAt,
      },
    })
  })

  app.post('/api/auth/logout', async (c) => {
    const token = getCookie(c, SESSION_COOKIE)
    await logoutSession(database, token)
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return c.json({ ok: true })
  })

  app.use('/api/crm/*', async (c, next) => {
    try {
      const auth = await buildSession(c, database)
      c.set('session', auth.session)
      if (auth.user) c.set('user', auth.user)
      c.set('authBypassActive', auth.bypass)
      if (auth.bypass) c.header('x-apex-dev-auth-bypass', 'true')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized'
      return c.json({ error: message }, 401)
    }
    await next()
  })

  app.use('/api/slice/*', async (c, next) => {
    try {
      const auth = await buildSession(c, database)
      c.set('session', auth.session)
      if (auth.user) c.set('user', auth.user)
      c.set('authBypassActive', auth.bypass)
      if (auth.bypass) c.header('x-apex-dev-auth-bypass', 'true')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized'
      return c.json({ error: message }, 401)
    }
    await next()
  })

  app.get('/api/health', async (c) => {
    await seedDatabase(database)
    return c.json({ ok: true, database: database.filePath })
  })

  app.get('/api/auth/current-user', async (c) => {
    try {
      const auth = await buildSession(c, database)
      if (auth.user) {
        if (auth.bypass) c.header('x-apex-dev-auth-bypass', 'true')
        return c.json({
          user: auth.user,
          session: {
            organizationId: auth.session.organizationId,
            userId: auth.session.userId,
            role: auth.session.role,
          },
          bypass: auth.bypass,
        })
      }
      return c.json({
        user: {
          id: auth.session.userId,
          fullName: 'Test Session User',
          email: 'test-user@local',
          role: auth.session.role,
          organizationId: auth.session.organizationId,
          organizationSlug: 'test-organization',
          organizationName: 'Test Organization',
        },
        session: auth.session,
        bypass: false,
      })
    } catch {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  })

  app.get('/api/slice/bootstrap', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.leadsRead)
    if (denied) return denied
    const session = c.get('session')
    const [contacts, stages] = await Promise.all([
      listRecentLeadContacts(database, session),
      getBuyerPipelineStages(database, session),
    ])

    return c.json({
      session,
      contacts,
      stages,
      forms: [
        'Property Inquiry',
        'Viewing Request',
        'Investor Profile',
        'Private Office Consultation',
      ],
    })
  })

  app.get('/api/crm/dashboard', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.dashboardRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await getDashboardSnapshot(database, session, {
      ownerUserId: c.req.query('owner') || undefined,
      source: c.req.query('source') || undefined,
      stageKey: c.req.query('stage') || undefined,
      status: c.req.query('status') || undefined,
    }))
  })

  app.get('/api/crm/contacts', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmContacts(database, session))
  })

  app.get('/api/crm/companies', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmCompanies(database, session))
  })

  app.get('/api/crm/team', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.dashboardRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmTeam(database, session))
  })

  app.get('/api/crm/contacts/:contactId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    try {
      return c.json(await getLeadContact(database, session, c.req.param('contactId')))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Contact not found') return c.json({ error: 'Contact not found' }, 404)
      throw error
    }
  })

  app.get('/api/crm/opportunities', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmOpportunities(database, session))
  })

  app.get('/api/crm/leads', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.leadsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmLeads(database, session))
  })

  app.get('/api/crm/tasks', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.tasksManage)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmTasks(database, session))
  })

  app.patch('/api/crm/tasks/:taskId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.tasksManage)
    if (denied) return denied

    const parsed = z.object({ status: z.enum(['open', 'done']) }).safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid task status payload', details: parsed.error.flatten() }, 400)
    }

    const session = c.get('session')
    try {
      const updated = await setCrmTaskStatus(database, session, c.req.param('taskId'), parsed.data.status)
      return c.json(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Task not found') return c.json({ error: 'Task not found' }, 404)
      throw error
    }
  })

  app.get('/api/crm/viewings', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmViewings(database, session))
  })

  app.post('/api/crm/viewings', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsWrite)
    if (denied) return denied

    const parsed = createViewingSchema.safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid viewing payload', details: parsed.error.flatten() }, 400)
    }

    const session = c.get('session')
    const created = await createCrmViewing(database, session, parsed.data)
    return c.json(created, 201)
  })

  app.get('/api/crm/automations', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.dashboardRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmAutomations(database, session))
  })

  app.post('/api/crm/automations', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.pipelineAdmin)
    if (denied) return denied

    const parsed = createAutomationSchema.safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid automation payload', details: parsed.error.flatten() }, 400)
    }

    const session = c.get('session')
    const created = await createCrmAutomation(database, session, parsed.data)
    return c.json(created, 201)
  })

  app.patch('/api/crm/automations/:automationId/status', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.pipelineAdmin)
    if (denied) return denied

    const parsed = updateAutomationStatusSchema.safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid automation status payload', details: parsed.error.flatten() }, 400)
    }

    const session = c.get('session')
    try {
      const updated = await setCrmAutomationStatus(database, session, c.req.param('automationId'), parsed.data.status)
      return c.json(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Automation not found') return c.json({ error: 'Automation not found' }, 404)
      throw error
    }
  })

  app.get('/api/crm/activities', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.dashboardRead)
    if (denied) return denied
    const session = c.get('session')
    const limitValue = c.req.query('limit')
    const parsedLimit = limitValue ? Number.parseInt(limitValue, 10) : undefined

    return c.json(await listActivityFeed(database, session, {
      contactId: c.req.query('contactId') || undefined,
      companyId: c.req.query('companyId') || undefined,
      leadId: c.req.query('leadId') || undefined,
      opportunityId: c.req.query('opportunityId') || undefined,
      userId: c.req.query('userId') || undefined,
      activityType: c.req.query('type') || undefined,
      startAt: c.req.query('startAt') || undefined,
      endAt: c.req.query('endAt') || undefined,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    }))
  })

  app.get('/api/crm/opportunities/:opportunityId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const session = c.get('session')
    try {
      return c.json(await getOpportunitySnapshot(database, session, c.req.param('opportunityId')))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Opportunity not found') return c.json({ error: 'Opportunity not found' }, 404)
      throw error
    }
  })

  app.get('/api/crm/deals', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmDeals(database, session))
  })

  app.get('/api/crm/deals/stages', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(await listCrmDealStages(database, session))
  })

  app.get('/api/crm/deals/:dealId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const dealId = Number(c.req.param('dealId'))
    if (!Number.isFinite(dealId) || dealId <= 0) return c.json({ error: 'Deal not found' }, 404)
    const session = c.get('session')
    const deal = await getCrmDeal(database, session, dealId)
    if (!deal) return c.json({ error: 'Deal not found' }, 404)
    return c.json(deal)
  })

  app.get('/api/crm/deals/:dealId/stage-history', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.opportunitiesRead)
    if (denied) return denied
    const session = c.get('session')
    const dealId = Number(c.req.param('dealId'))
    if (!Number.isFinite(dealId) || dealId <= 0) return c.json([])
    return c.json(await getCrmDealHistory(database, session, dealId))
  })

  app.post('/api/crm/deals/:dealId/move-stage', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.pipelineAdmin)
    if (denied) return denied
    const session = c.get('session')
    const dealId = Number(c.req.param('dealId'))
    const payload = z.object({ stage: z.string().min(1) }).safeParse(await c.req.json())
    if (!payload.success) {
      return c.json({ error: 'Invalid stage payload', details: payload.error.flatten() }, 400)
    }
    try {
      const updated = await moveCrmDealStage(database, session, dealId, payload.data.stage)
      return c.json(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Deal not found') return c.json({ error: 'Deal not found' }, 404)
      if (message === 'Invalid stage') return c.json({ error: 'Invalid stage' }, 400)
      throw error
    }
  })

  app.get('/api/crm/inbox/conversations', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(listInboxConversations(session.organizationId))
  })

  app.get('/api/crm/inbox/messages/:conversationId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    try {
      return c.json(listInboxMessages(Number(c.req.param('conversationId')), session.organizationId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Conversation not found') return c.json({ error: 'Conversation not found' }, 404)
      throw error
    }
  })

  app.get('/api/crm/inbox/draft/:conversationId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    return c.json(getInboxDraft(Number(c.req.param('conversationId')), session.organizationId))
  })

  app.post('/api/crm/inbox/draft/:draftId/approve', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.approvalsAct)
    if (denied) return denied
    const session = c.get('session')
    const draftId = Number(c.req.param('draftId'))
    try {
      const result = approveInboxDraft(draftId, session.organizationId)
      await database.db.insert(auditEvents).values({
        id: createAuditId(),
        organizationId: session.organizationId,
        actorUserId: session.userId,
        entityType: 'inbox_draft',
        entityId: String(draftId),
        action: 'inbox_draft.approved',
        metadataJson: JSON.stringify({ status: result.status }),
      })
      return c.json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Draft not found') return c.json({ error: 'Draft not found' }, 404)
      if (message === 'Draft already resolved') return c.json({ error: 'Draft already resolved' }, 409)
      throw error
    }
  })

  app.post('/api/crm/inbox/draft/:draftId/reject', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.approvalsAct)
    if (denied) return denied
    const session = c.get('session')
    const draftId = Number(c.req.param('draftId'))
    try {
      const result = rejectInboxDraft(draftId, session.organizationId)
      await database.db.insert(auditEvents).values({
        id: createAuditId(),
        organizationId: session.organizationId,
        actorUserId: session.userId,
        entityType: 'inbox_draft',
        entityId: String(draftId),
        action: 'inbox_draft.rejected',
        metadataJson: JSON.stringify({ status: result.status }),
      })
      return c.json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Draft not found') return c.json({ error: 'Draft not found' }, 404)
      if (message === 'Draft already resolved') return c.json({ error: 'Draft already resolved' }, 409)
      throw error
    }
  })

  app.post('/api/slice/intake', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.leadsWrite)
    if (denied) return denied
    const session = c.get('session')
    const parsed = intakeSchema.safeParse(await c.req.json())
    if (!parsed.success) {
      return c.json({ error: 'Invalid intake payload', details: parsed.error.flatten() }, 400)
    }

    const forceFailAtStep =
      process.env.NODE_ENV === 'test'
        ? c.req.header('x-apex-test-force-intake-failure') || undefined
        : undefined

    const result = await createLeadIntake(database, session, {
      ...parsed.data,
      email: parsed.data.email || undefined,
      phone: parsed.data.phone || undefined,
    }, {
      forceFailAtStep,
    })
    return c.json(result, 201)
  })

  app.post('/api/slice/drafts/:draftId/approve', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.approvalsAct)
    if (denied) return denied
    const session = c.get('session')
    const draftId = c.req.param('draftId')
    const result = await approveDraft(database, session, draftId)
    return c.json(result)
  })

  app.get('/api/slice/contacts/:contactId', async (c) => {
    await seedDatabase(database)
    const denied = requirePermission(c, PERMISSIONS.contactsRead)
    if (denied) return denied
    const session = c.get('session')
    try {
      const result = await getLeadContact(database, session, c.req.param('contactId'))
      return c.json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message === 'Contact not found') {
        return c.json({ error: 'Contact not found' }, 404)
      }
      throw error
    }
  })

  return app
}

export function startApiServer(database = getDatabaseContext()) {
  const port = Number(process.env.APEX_API_PORT ?? 3001)
  const app = createApiApp(database)
  return serve({ fetch: app.fetch, port }, (info) => {
    console.log(`APEX API listening on http://localhost:${info.port}`)
  })
}