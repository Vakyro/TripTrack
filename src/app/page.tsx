import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { logout } from './logout/actions'

export default async function Home() {

  const supabase = await createClient()

  // Obtener los datos del usuario autenticado
  const { data, error } = await supabase.auth.getUser()
  
  // Si hay un error o el usuario no está autenticado, redirigir a login
  if (data?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <Logo size={80} />
        <h1 className="text-6xl font-bold">
          Welcome to Gay
        </h1>
        <p className="mt-3 text-2xl">
          Your trusted companion for managing routes, logs, and reports.
        </p>
        <p className="mt-2 text-lg text-gray-600">
          Sign in to streamline your trucking journey.
        </p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

