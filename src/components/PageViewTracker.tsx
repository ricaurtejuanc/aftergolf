import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Fire-and-forget page-view log for the admin "Resumen" tab. Dedupes
// against React StrictMode's double-invoke by tracking the last path we
// already logged instead of relying on effect cleanup.
export function PageViewTracker() {
  const location = useLocation()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (lastPath.current === location.pathname) return
    lastPath.current = location.pathname
    supabase.from('page_views').insert({ path: location.pathname }).then()
  }, [location.pathname])

  return null
}
