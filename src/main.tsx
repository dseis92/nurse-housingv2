import { StrictMode, useEffect } from 'react'
import './actions/patchStoreBoot'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'

// pages (adapt names if yours differ)
import LoginPage from './pages/auth/LoginPage'
import SwipePage from './pages/SwipePage'
import ShortlistPage from './pages/ShortlistPage'
import AdminPage from './pages/admin/AdminPage'
import OwnerListingForm from './pages/owner/OwnerListingForm'
import ChatPage from './pages/chat/ChatPage'

// auth gates
import RequireAuth from './components/auth/RequireAuth'
import RequireRole from './components/auth/RequireRole'

// optional: hook a feed sync on the swipe page wrapper
import { syncFromSupabase } from './actions/supabaseActions'
import { useSession } from './stores/session'

function SwipeWithSync() {
  const { session } = useSession()
  useEffect(() => {
    // fire-and-forget sync; pages can also call their own sync if needed
    syncFromSupabase(session?.user?.id).catch(() => {})
  }, [session?.user?.id])
  return <SwipePage />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <SwipeWithSync /> },
      { path: 'shortlist', element: <RequireAuth><ShortlistPage /></RequireAuth> },
      { path: 'chat/:matchId', element: <RequireAuth><ChatPage /></RequireAuth> },

      // OWNER routes (owner or admin)
      {
        path: 'owner/listing/new',
        element: (
          <RequireRole roles={['owner','admin']}>
            <OwnerListingForm />
          </RequireRole>
        )
      },

      // ADMIN routes (admin only)
      {
        path: 'admin',
        element: (
          <RequireRole roles={['admin']}>
            <AdminPage />
          </RequireRole>
        )
      },
    ]
  },
  { path: '/login', element: <LoginPage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
