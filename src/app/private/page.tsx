import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { logout } from '../logout/actions'

export default async function PrivatePage() {
  const supabase = await createClient()

  // Obtener los usuarios
  const { data: users, error: usersError } = await supabase.from("users").select()

  // Obtener los datos del usuario autenticado
  const { data, error } = await supabase.auth.getUser()
  
  // Si hay un error o el usuario no está autenticado, redirigir a login
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div>
      <p>Hello {data.user.email}</p>      
      <p>Hello {data.user.id}</p>

      <div>
        {users && users.filter((user) => user.auth_user_id === data.user.id).map((user) => (
          <div key={user.id}>            
            <p>{user.id}</p>
            <p>{user.firstname}</p>
            <p>{user.lastname}</p>
          </div>
        ))}
      </div>

      <form action={logout}>
        <button type='submit'>Sign out</button>
      </form>
    </div>
  )
}
