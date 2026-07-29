/**
 * Login page backed by server session authentication.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'
import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { fetchOrganizations, type OrganizationOption } from '@/lib/auth-api'

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, bypassActive } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationSlug, setOrganizationSlug] = useState('apex-demo-realty')
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchOrganizations()
      .then((rows) => {
        setOrganizations(rows)
        if (rows.length > 0) {
          setOrganizationSlug(rows[0]!.slug)
        }
      })
      .catch(() => {
        setOrganizations([])
      })
  }, [])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password, organizationSlug })
      navigate('/dashboard', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-ink-bg px-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-[0.08]" aria-hidden="true">
        <img src="/skyline-dubai.svg" alt="" className="mx-auto w-full min-w-[1200px]" />
      </div>
      <form onSubmit={onSubmit} className="relative w-full max-w-[420px] rounded-[14px] border border-ink-line bg-ink-surface p-8 shadow-e3">
        <Logo className="justify-center text-ink-text" />
        <h1 className="mt-6 text-center text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink-text">Sign in</h1>
        <p className="mt-2 text-[13px] leading-5 text-ink-muted">
          Sign in to your APEX workspace with Firebase Authentication.
        </p>

        <div className="mt-6 space-y-3">
          <label className="block text-left text-[12px] text-ink-muted">
            Organization
            <select
              value={organizationSlug}
              onChange={(event) => setOrganizationSlug(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-ink-line bg-ink-bg px-3 text-[14px] text-ink-text"
            >
              {organizations.length === 0 ? <option value="apex-demo-realty">apex-demo-realty</option> : null}
              {organizations.map((org) => (
                <option key={org.id} value={org.slug}>{org.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-left text-[12px] text-ink-muted">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 h-10 w-full rounded-lg border border-ink-line bg-ink-bg px-3 text-[14px] text-ink-text"
            />
          </label>

          <label className="block text-left text-[12px] text-ink-muted">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={8}
              className="mt-1 h-10 w-full rounded-lg border border-ink-line bg-ink-bg px-3 text-[14px] text-ink-text"
            />
          </label>
        </div>

        {bypassActive ? (
          <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-300">
            Development auth bypass is active. This must stay disabled in production.
          </p>
        ) : null}

        {error ? <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 block w-full rounded-lg bg-palm-600 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors duration-140 hover:bg-palm-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="mt-3 text-center text-[11px] text-ink-muted">
          Use a Firebase-authenticated account to continue.
        </p>

        <Link to="/" className="mt-4 inline-block text-[12.5px] text-ink-muted transition-colors hover:text-ink-text">
          ← Back to site
        </Link>
      </form>
    </div>
  )
}
