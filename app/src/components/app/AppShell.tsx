/**
 * App Shell (all product routes).
 * Renders the product navigation chrome and an <Outlet/> for nested routes.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  FolderOpen,
  Inbox,
  Kanban,
  LayoutDashboard,
  Megaphone,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'
import { CommandBar } from '@/components/app/CommandBar'
import { CountBadge, HealthDot } from '@/components/app/Chips'
import { currentUser, kpis, workspace } from '@/lib/demo-data'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
  badgeTone?: 'red' | 'gold'
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Inbox', to: '/inbox', icon: Inbox, badge: kpis.inboxUnread, badgeTone: 'red' },
      { label: 'Relationships', to: '/relationships', icon: Users },
      { label: 'Leads', to: '/leads', icon: UserRound },
      { label: 'Activities', to: '/activities', icon: Bell },
      { label: 'Deal Flow', to: '/deals', icon: Kanban },
      { label: 'Properties', to: '/properties', icon: Building2 },
      { label: 'Viewings', to: '/viewings', icon: CalendarDays },
      { label: 'Tasks', to: '/tasks', icon: UserRound },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Command', to: '/command', icon: Sparkles, badge: kpis.aiApprovalsPending, badgeTone: 'gold' },
      { label: 'Reports', to: '/reports', icon: BarChart3 },
      { label: 'Automations', to: '/automations', icon: Zap },
      { label: 'Documents', to: '/documents', icon: FolderOpen },
    ],
  },
  {
    label: 'Growth',
    items: [{ label: 'Marketing', to: '/marketing', icon: Megaphone }],
  },
  {
    label: 'System',
    items: [{ label: 'Administration', to: '/admin', icon: Settings }],
  },
]

const pageTitles: [RegExp, string][] = [
  [/^\/command/, 'Command Center'],
  [/^\/dashboard/, 'Dashboard'],
  [/^\/inbox/, 'Inbox'],
  [/^\/relationships/, 'Relationships'],
  [/^\/leads/, 'Leads'],
  [/^\/activities/, 'Activities'],
  [/^\/deals/, 'Deal Flow'],
  [/^\/properties/, 'Properties'],
  [/^\/viewings/, 'Viewings'],
  [/^\/tasks/, 'Tasks'],
  [/^\/documents/, 'Documents'],
  [/^\/reports/, 'Reports'],
  [/^\/automations/, 'Automations'],
  [/^\/marketing/, 'Marketing'],
  [/^\/admin/, 'Administration'],
]

const COLLAPSE_KEY = 'apex.sidebar.collapsed'

function resolvePageTitle(pathname: string) {
  return pageTitles.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'Workspace'
}

function ShellNav({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      mobile
                        ? 'text-ink-900 hover:bg-palm-50'
                        : 'text-white/76 hover:bg-white/6 hover:text-white',
                      isActive && (mobile ? 'bg-palm-100 text-palm-700' : 'bg-white/10 text-white'),
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <CountBadge count={item.badge} tone={item.badgeTone} /> : null}
                </NavLink>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export default function AppShell() {
  const location = useLocation()
  const mainContentRef = useRef<HTMLElement | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNavRoute, setMobileNavRoute] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_KEY) === 'true'
  })

  const mobileNavOpen = mobileNavRoute === location.pathname

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const pageTitle = resolvePageTitle(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-base text-ink-900">
      <CommandBar open={commandOpen} onClose={() => setCommandOpen(false)} />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/8 bg-[var(--ink-bg)] text-[var(--ink-text)] md:flex md:flex-col',
          collapsed ? 'w-[88px]' : 'w-[272px]',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/8 px-4">
          <Link to="/dashboard" className="min-w-0">
            <Logo compact={collapsed} className="text-white" markClassName="text-palm-400" />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/72 transition-colors hover:bg-white/8 hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {collapsed ? (
            <div className="space-y-1">
              {navGroups.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex h-11 items-center justify-center rounded-xl text-white/76 transition-colors hover:bg-white/6 hover:text-white',
                        isActive && 'bg-white/10 text-white',
                      )
                    }
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </NavLink>
                )
              })}
            </div>
          ) : (
            <ShellNav />
          )}
        </div>

        <div className="border-t border-white/8 px-4 py-4">
          <div className={cn('rounded-2xl border border-white/8 bg-white/5 p-3', collapsed && 'p-2')}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-palm-400/16 text-sm font-semibold text-palm-400">
                {currentUser.initials}
              </span>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="truncate text-xs text-ink-muted">{workspace.name}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileNavRoute(null)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[320px] flex-col border-r border-line bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Link to="/dashboard" className="text-ink-900">
                <Logo markClassName="text-palm-600" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavRoute(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <ShellNav mobile onNavigate={() => setMobileNavRoute(null)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn('flex min-h-0 flex-1 flex-col md:pl-[272px]', collapsed && 'md:pl-[88px]')}>
        <header className="sticky top-0 z-30 shrink-0 border-b border-line bg-white/92 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <button
              type="button"
              onClick={() => setMobileNavRoute(location.pathname)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-700 transition-colors hover:bg-sunken md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-400">
                {workspace.label}
              </p>
              <h1 className="truncate text-lg font-semibold text-ink-900">{pageTitle}</h1>
            </div>

            <Button
              type="button"
              variant="outline"
              className="hidden h-10 min-w-[260px] items-center justify-start gap-2 rounded-xl border-line bg-white text-ink-500 shadow-none lg:inline-flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left text-sm">Search records or ask AI</span>
              <span className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-400">Ctrl K</span>
            </Button>

            <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs text-ink-500 sm:flex">
              <HealthDot status="connected" />
              <span>Sync {kpis.syncSuccess}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl border-line bg-white shadow-none"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command bar"
            >
              <Sparkles className="h-4 w-4 text-palm-600" />
            </Button>

            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink-700 transition-colors hover:bg-sunken"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {kpis.inboxUnread > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
              ) : null}
            </button>
          </div>
        </header>

        <main ref={mainContentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}