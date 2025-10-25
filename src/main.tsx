import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'

import LoginPage from './pages/auth/LoginPage'
import SwipePage from './pages/SwipePage'
import NotFound from './pages/system/NotFound'
import ErrorPage from './pages/system/ErrorPage'
import AdminPage from './pages/admin/AdminPage'
import OwnerListingForm from './pages/owner/OwnerListingForm'
import ChatPage from './pages/chat/ChatPage'
import Shortlist from './pages/shortlist/Shortlist'  // use the soft-hold version

import RequireAuth from './components/auth/RequireAuth'
import RequireRole from './components/auth/RequireRole'

import { syncFromSupabase } from './actions/supabaseActions'
import { useSession } from './stores/session'
import './actions/patchStoreBoot'

function SwipeWithSync() {
  const { session } = useSession()
  useEffect(() => {
    syncFromSupabase(session?.user?.id).catch(() => {})
  }, [session?.user?.id])
  return <SwipePage />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <SwipeWithSync /> },
      { path: 'shortlist', element: <RequireAuth><Shortlist /></RequireAuth> },
      { path: 'chat/:matchId', element: <RequireAuth><ChatPage /></RequireAuth> },

      {
        path: 'owner/listing/new',
        element: (
          <RequireRole roles={['owner','admin']}>
            <OwnerListingForm />
          </RequireRole>
        )
      },
      {
        path: 'admin',
        element: (
          <RequireRole roles={['admin']}>
            <AdminPage />
          </RequireRole>
        )
      },

      // catch-all for unknown child routes
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/login', element: <LoginPage />, errorElement: <ErrorPage /> },
  // global catch-all (in case something escapes)
  { path: '*', element: <NotFound /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
