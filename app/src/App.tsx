import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Layout from '@/components/Layout'
import { useAuth } from '@/hooks/useAuth'
import Home from '@/pages/Home'
import Login from '@/pages/Login'

const AppShell = lazy(() => import('@/components/app/AppShell'))
const Command = lazy(() => import('@/pages/Command'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Inbox = lazy(() => import('@/pages/Inbox'))
const Relationships = lazy(() => import('@/pages/Relationships'))
const Leads = lazy(() => import('@/pages/Leads'))
const Activities = lazy(() => import('@/pages/Activities'))
const ContactDetail = lazy(() => import('@/pages/ContactDetail'))
const LeadIntake = lazy(() => import('@/pages/LeadIntake'))
const OpportunityDetail = lazy(() => import('@/pages/OpportunityDetail'))
const Deals = lazy(() => import('@/pages/Deals'))
const DealDetail = lazy(() => import('@/pages/DealDetail'))
const Properties = lazy(() => import('@/pages/Properties'))
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'))
const Viewings = lazy(() => import('@/pages/Viewings'))
const Tasks = lazy(() => import('@/pages/TasksPersisted'))
const Documents = lazy(() => import('@/pages/Documents'))
const Reports = lazy(() => import('@/pages/Reports'))
const Automations = lazy(() => import('@/pages/Automations'))
const Marketing = lazy(() => import('@/pages/Marketing'))
const Admin = lazy(() => import('@/pages/Admin'))

function LazyFallback() {
  return <div className="min-h-[100dvh] bg-base" />
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-[100dvh] bg-ink-bg" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Routing contract:
 * - Landing `/` uses Layout with the {children} pattern.
 * - Product routes use AppShell as a layout route rendering <Outlet/>.
 * Never mix the two patterns within one subtree.
 */
export default function App() {
  return (
    <Routes>
      {/* marketing zone — children pattern */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />

      {/* product zone — nested-route (layout-route) pattern */}
      <Route element={<RequireAuth><Suspense fallback={<LazyFallback />}><AppShell /></Suspense></RequireAuth>}>
        <Route path="/command" element={<Suspense fallback={<LazyFallback />}><Command /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<LazyFallback />}><Dashboard /></Suspense>} />
        <Route path="/inbox" element={<Suspense fallback={<LazyFallback />}><Inbox /></Suspense>} />
        <Route path="/relationships" element={<Suspense fallback={<LazyFallback />}><Relationships /></Suspense>} />
        <Route path="/leads" element={<Suspense fallback={<LazyFallback />}><Leads /></Suspense>} />
        <Route path="/activities" element={<Suspense fallback={<LazyFallback />}><Activities /></Suspense>} />
        <Route path="/relationships/intake" element={<Suspense fallback={<LazyFallback />}><LeadIntake /></Suspense>} />
        <Route path="/relationships/:id" element={<Suspense fallback={<LazyFallback />}><ContactDetail /></Suspense>} />
        <Route path="/opportunities/:id" element={<Suspense fallback={<LazyFallback />}><OpportunityDetail /></Suspense>} />
        <Route path="/deals" element={<Suspense fallback={<LazyFallback />}><Deals /></Suspense>} />
        <Route path="/deals/:id" element={<Suspense fallback={<LazyFallback />}><DealDetail /></Suspense>} />
        <Route path="/properties" element={<Suspense fallback={<LazyFallback />}><Properties /></Suspense>} />
        <Route path="/properties/:id" element={<Suspense fallback={<LazyFallback />}><PropertyDetail /></Suspense>} />
        <Route path="/viewings" element={<Suspense fallback={<LazyFallback />}><Viewings /></Suspense>} />
        <Route path="/tasks" element={<Suspense fallback={<LazyFallback />}><Tasks /></Suspense>} />
        <Route path="/documents" element={<Suspense fallback={<LazyFallback />}><Documents /></Suspense>} />
        <Route path="/reports" element={<Suspense fallback={<LazyFallback />}><Reports /></Suspense>} />
        <Route path="/automations" element={<Suspense fallback={<LazyFallback />}><Automations /></Suspense>} />
        <Route path="/marketing" element={<Suspense fallback={<LazyFallback />}><Marketing /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LazyFallback />}><Admin /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
