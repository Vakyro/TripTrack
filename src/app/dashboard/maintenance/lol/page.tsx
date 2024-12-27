'use client'

import { createClient } from "../../../../../utils/supabase/client"
import { useEffect, useState } from "react"

export default function DemoClientComponent(){
    const [user, setUser] = useState(null)
    const [users, setUsers] = useState(null)
    
    useEffect(() => {
        async function getUser(){
            const supabase = createClient()
            const { data, error } = await supabase.auth.getUser()
            if (error || !data?.user) {
                console.log('no user')
            } else {
                setUser(data.user)
            }
        }
        getUser()

        async function getUsers(){
          const supabase = createClient()
          const { data: users, error: usersError } = await supabase.from("users").select()
          if (usersError) {
              console.log('error fetching users', usersError)
          } else {
              setUsers(users)
          }
        }
        getUsers()
    }, [])

    console.log({user})

    return(
      <div>
        <h1>Client Component</h1>
        <p>{user ? `Signed in as ${user.email}` : 'Not signed in'}</p>
        <div>
        {users && users.filter((u) => u.auth_user_id === user?.id).map((u) => (
          <div key={u.id}>            
            <p>{u.id}</p>
            <p>{u.firstname}</p>
            <p>{u.lastname}</p>
          </div>
        ))}
      </div>
      </div>
    )
}