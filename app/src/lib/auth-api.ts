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
  session: {
    organizationId: string
    userId: string
    role: string
  }
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function fetchCurrentUser() {
  return request<CurrentUserResponse>('/api/auth/current-user')
}

export function fetchOrganizations() {
  return request<OrganizationOption[]>('/api/auth/organizations')
}

export function login(payload: LoginPayload) {
  return request<{ user: AuthenticatedUser; session: { id: string; expiresAt: string } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  await request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}
