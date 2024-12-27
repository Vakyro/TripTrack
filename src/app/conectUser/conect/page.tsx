'use client';
import { supabase } from "../../../lib/supabase"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { createClient } from "../../../../utils/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LinkUser() {
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        console.log('no user')
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [])

  const handleLinkUser = async () => {
    setError("")
    setSuccess("")

    try {
      // Actualizar el usuario con el identificador ingresado
      const { error: updateError } = await supabase
        .from("users")
        .update({ auth_user_id: user.id })
        .eq("id", identifier)

      if (updateError) {
        setError("Error al vincular el usuario: " + updateError.message)
        return
      }

      setSuccess("Usuario vinculado exitosamente.")
      setIdentifier("") // Limpiar el campo de entrada

      // Redirigir a la página principal después de 1 segundo
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (err) {
      setError("Ocurrió un error inesperado.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vincular Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Inserte su identificador"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <Button onClick={handleLinkUser}>Vincular</Button>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
