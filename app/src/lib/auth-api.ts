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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || response.statusText)
  }
  return response.json() as Promise<T>
}

export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return request<CurrentUserResponse>('/api/auth/current-user')
}

export function fetchOrganizations(): Promise<OrganizationOption[]> {
  return request<OrganizationOption[]>('/api/auth/organizations')
}

export function login(payload: LoginPayload) {
  return request<{
    user: AuthenticatedUser
    session: { id: string; expiresAt: string }
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  await request('/api/auth/logout', { method: 'POST' })
}