import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { LoginPage } from './components/LoginPage'
import { DesignReadyWorkspace } from './components/DesignReadyWorkspace'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cek session saat app pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen perubahan status login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <span>Memuat DesignReady...</span>
        </div>
      </div>
    )
  }

  // Jika belum login -> Tampilkan Halaman Login
  if (!user) {
    return <LoginPage />
  }

  // Jika sudah login -> Tampilkan Workspace Utama
  return <DesignReadyWorkspace />
}