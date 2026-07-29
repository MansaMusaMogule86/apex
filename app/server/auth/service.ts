import { and, eq, isNull, gt, lt } from 'drizzle-orm'
import type { DatabaseContext } from '../db/context'
import { organizations, sessions, userCredentials, users } from '../db/schema'
import { createSessionToken, hashSessionToken, verifyPassword } from './crypto'
import { normalizeRole } from './permissions'

export const SESSION_COOKIE = 'apex_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

export interface AuthSession {
  id: string
  userId: string
  organizationId: string
  role: string
  expiresAt: string
}

export interface AuthenticatedUser {
  id: string
  fullName: string
  email: string
  role: string
  organizationId: string
  organizationSlug: string
  organizationName: string
}

export interface LoginInput {
  email: string
  password: string
  organizationSlug: string
}

export function getSessionCookieOptions() {
  const secure = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  }
}

function nowIso() {
  return new Date().toISOString()
}

function expiresIso() {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString()
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`
}

export async function loginWithPassword(database: DatabaseContext, input: LoginInput, existingToken?: string) {
  const email = input.email.trim().toLowerCase()
  const organizationSlug = input.organizationSlug.trim().toLowerCase()

  const organization = await database.db.query.organizations.findFirst({
    where: eq(organizations.slug, organizationSlug),
  })
  if (!organization) return null

  const user = await database.db.query.users.findFirst({
    where: and(eq(users.organizationId, organization.id), eq(users.email, email), eq(users.isActive, true)),
  })
  if (!user) return null

  const credentials = await database.db.query.userCredentials.findFirst({
    where: eq(userCredentials.userId, user.id),
  })
  if (!credentials) return null

  const ok = await verifyPassword(input.password, credentials.passwordHash)
  if (!ok) return null

  if (existingToken) {
    const existingHash = hashSessionToken(existingToken)
    await database.db.update(sessions).set({ revokedAt: nowIso() }).where(and(eq(sessions.tokenHash, existingHash), isNull(sessions.revokedAt)))
  }

  const token = createSessionToken()
  const tokenHash = hashSessionToken(token)
  const sessionId = createId('sess')
  const expiresAt = expiresIso()
  const role = normalizeRole(user.role)

  await database.db.insert(sessions).values({
    id: sessionId,
    tokenHash,
    organizationId: user.organizationId,
    userId: user.id,
    role,
    expiresAt,
  })

  return {
    token,
    session: { id: sessionId, userId: user.id, organizationId: user.organizationId, role, expiresAt } satisfies AuthSession,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
      organizationId: organization.id,
      organizationSlug: organization.slug,
      organizationName: organization.name,
    } satisfies AuthenticatedUser,
  }
}

export async function resolveSession(database: DatabaseContext, token: string | undefined) {
  if (!token) return null
  const tokenHash = hashSessionToken(token)
  const now = nowIso()

  const session = await database.db.query.sessions.findFirst({
    where: and(
      eq(sessions.tokenHash, tokenHash),
      isNull(sessions.revokedAt),
      gt(sessions.expiresAt, now),
    ),
  })

  if (!session) return null

  await database.db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, session.id))

  const user = await database.db.query.users.findFirst({
    where: and(eq(users.id, session.userId), eq(users.organizationId, session.organizationId), eq(users.isActive, true)),
  })
  const organization = await database.db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) })

  if (!user || !organization) return null

  return {
    session: {
      id: session.id,
      userId: session.userId,
      organizationId: session.organizationId,
      role: session.role,
      expiresAt: session.expiresAt,
    } satisfies AuthSession,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: session.role,
      organizationId: organization.id,
      organizationSlug: organization.slug,
      organizationName: organization.name,
    } satisfies AuthenticatedUser,
  }
}

export async function logoutSession(database: DatabaseContext, token: string | undefined) {
  if (!token) return
  const tokenHash = hashSessionToken(token)
  await database.db.update(sessions).set({ revokedAt: nowIso() }).where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
}

export async function revokeExpiredSessions(database: DatabaseContext) {
  const now = nowIso()
  await database.db.update(sessions).set({ revokedAt: now }).where(and(isNull(sessions.revokedAt), lt(sessions.expiresAt, now)))
}
