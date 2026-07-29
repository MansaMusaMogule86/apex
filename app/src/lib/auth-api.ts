import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export interface AuthenticatedUser {
  id: string
  fullName: string
  email: string
  role: string
  organizationId: string
  organizationSlug: string
  organizationName: string
}

export interface CurrentUserResponse {
  user: AuthenticatedUser
  bypass: boolean
}

export interface OrganizationOption {
  id: string
  slug: string
  name: string
}

export interface LoginPayload {
  email: string
  password: string
  organizationSlug: string
}

function mapFirebaseUser(user: FirebaseUser | null): AuthenticatedUser | null {
  if (!user) return null

  const emailName = user.email?.split('@')[0] ?? 'Workspace User'
  const displayName = user.displayName?.trim() || emailName

  return {
    id: user.uid,
    fullName: displayName,
    email: user.email ?? '',
    role: 'admin',
    organizationId: 'firebase-demo-org',
    organizationSlug: 'firebase-demo',
    organizationName: 'Firebase Demo Workspace',
  }
}

export function fetchCurrentUser() {
  return new Promise<CurrentUserResponse>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      const mapped = mapFirebaseUser(user)
      if (!mapped) {
        reject(new Error('No authenticated user'))
        return
      }

      resolve({ user: mapped, bypass: false })
    }, reject)
  })
}

export function fetchOrganizations() {
  return Promise.resolve<OrganizationOption[]>([
    {
      id: 'firebase-demo-org',
      slug: 'firebase-demo',
      name: 'Firebase Demo Workspace',
    },
  ])
}

export function login(payload: LoginPayload) {
  return signInWithEmailAndPassword(auth, payload.email, payload.password).then((result) => ({
    user: mapFirebaseUser(result.user) as AuthenticatedUser,
    session: { id: result.user.uid, expiresAt: new Date().toISOString() },
  }))
}

export async function logout() {
  await signOut(auth)
}
